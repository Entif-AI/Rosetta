import { createHash } from 'node:crypto';
import { canonicalizeJson, type JsonValue } from '@entif-ai/rosetta-canon';
import { createSourceSystemProfileTile, createSourceRecordTile, createSourceManifestationTile,
  createSourceEpisodeTile, createSourcePackageTile } from './source-substrate.js';

export const BOUNDARY_SOURCE_PROFILE = 'trace-live-source-v1';
export interface BoundarySourceOptions {
  recordedAt: string;
  /** A declaration by the source supplier, not an accepted integration verdict. */
  maturity: 'fixture' | 'recorded-live';
}
type ObjectValue = { [key: string]: JsonValue };
const object = (value: JsonValue | undefined): ObjectValue | undefined =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : undefined;
const hash = (bytes: string) => createHash('sha256').update(bytes).digest('hex');
const opaque = (domain: string, value: JsonValue) => `${domain}:${hash(canonicalizeJson([BOUNDARY_SOURCE_PROFILE, domain, value]))}`;
const identifier = (value: JsonValue | undefined): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= 1024;
const instant = (value: JsonValue | undefined): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const families: Record<string, readonly string[]> = {
  tunnel: ['tunnel-health'],
  mcp: ['user-request', 'mcp-request', 'tool-call', 'mcp-result', 'receipt'],
  device: ['device-action', 'device-observation'],
};
const correlations = ['run', 'session', 'conversation', 'request', 'operation', 'tool', 'receipt'] as const;
const eventFields = new Set(['family', 'eventType', 'eventId', 'producerId', 'producerVersion', 'observedAt', 'correlation', 'payload']);
const payloadEnums: Record<string, readonly string[]> = {
  status: ['ok', 'blocked', 'failed', 'unknown', 'running', 'stopped', 'reachable', 'unreachable', 'ambiguous'],
  operation: ['observe', 'launch_app', 'activate_app', 'open_url', 'tools/list', 'tools/call'],
  code: ['DENIED', 'UNSUPPORTED', 'POSTCONDITION_FAILED'],
};

/** Local JSONL evidence to disclosure-allowlisted SSE. Never forwards arbitrary producer fields. */
export function deriveBoundaryTraceSource(raw: string, options: BoundarySourceOptions) {
  if (!instant(options.recordedAt) || !['fixture', 'recorded-live'].includes(options.maturity)) throw new Error('Declare source maturity and a canonical recorded timestamp.');
  if (Buffer.byteLength(raw) > 4 * 1024 * 1024) throw new Error('Boundary source byte limit exceeded.');
  const lines = raw.match(/[^\n]*(?:\n|$)/g)?.filter(Boolean) ?? [];
  if (lines.filter(line => line.trim()).length > 1000 || lines.some(line => Buffer.byteLength(line) > 65536)) throw new Error('Boundary source event limit exceeded.');
  const sourceDigest = hash(raw), sourceRef = `sha256:${sourceDigest}`;
  const frames: string[] = [], profiles = new Map<string, ReturnType<typeof createSourceSystemProfileTile>>();
  const payloads = new Map<string, { ref: string; sha256: string; byteLength: number; bytes: string }>();
  const seen = new Map<string, { canonical: string; count: number }>();
  const unresolved: { eventRef: string; fields: string[] }[] = [];
  const omissions: { sourceSequence: number; reason: string; bytes: number }[] = [];
  let rawEvents = 0, omittedBytes = 0, duplicateBytes = 0, omittedFields = 0, omittedPayloadBytes = 0, externalizedEvents = 0, externalizedBytes = 0, timeBase: number | undefined;
  for (const [sourceSequence, line] of lines.entries()) {
    if (!line.trim()) continue;
    rawEvents++;
    const omit = (reason: string) => {
      const bytes = Buffer.byteLength(line); omittedBytes += bytes;
      omissions.push({ sourceSequence, reason, bytes });
    };
    let parsed: JsonValue;
    try { parsed = JSON.parse(line); canonicalizeJson(parsed); }
    catch { omit('malformed-or-noncanonical-json'); continue; }
    const value = object(parsed);
    if (!value || !identifier(value.family) || !Object.hasOwn(families, value.family) ||
        !identifier(value.eventType) || !families[value.family].includes(value.eventType) ||
        !identifier(value.eventId) || !identifier(value.producerId) || !identifier(value.producerVersion)) {
      omit('unsupported-producer-or-event-shape'); continue;
    }
    const producerRef = opaque('producer', [value.family, value.producerId, value.producerVersion]);
    const eventRef = opaque('event', [producerRef, value.eventId]), canonical = canonicalizeJson(value);
    const prior = seen.get(eventRef);
    if (prior) {
      if (prior.canonical !== canonical) throw new Error('Boundary event identity conflict; reconcile source evidence before ingestion.');
      prior.count++; duplicateBytes += Buffer.byteLength(line); continue;
    }
    // TRACE-NORM keeps cumulative snapshots; cap distinct admissions before expansion.
    if (seen.size >= 64) throw new Error('Boundary normalization event limit exceeded; segment source before ingestion.');
    seen.set(eventRef, { canonical, count: 1 });
    if (!profiles.has(producerRef)) profiles.set(producerRef, createSourceSystemProfileTile({
      sourceSystemId: producerRef, canonicalName: `Headless ${value.family} boundary`, sourceRoles: ['source-evidence'],
      capabilityFacets: [value.family], curationPosture: 'bounded-source', reviewPosture: 'disclosure-allowlist',
      preservationPosture: 'private-original-retained', rightsPosture: 'local-private', evidenceRefs: [sourceRef],
    }));
    omittedFields += Object.keys(value).filter(key => !eventFields.has(key)).length;
    const correlation = object(value.correlation) ?? {}, refs: Record<string, string> = {}, missing: string[] = [];
    omittedFields += Object.keys(correlation).filter(key => !correlations.includes(key as typeof correlations[number])).length;
    for (const field of correlations) {
      if (identifier(correlation[field])) refs[field] = opaque(field, correlation[field]);
      else missing.push(field);
    }
    let sourceTime: string | undefined;
    if (instant(value.observedAt)) {
      timeBase ??= Date.parse(value.observedAt);
      sourceTime = new Date(Date.UTC(2000, 0, 1) + Date.parse(value.observedAt) - timeBase).toISOString();
    } else missing.push('source-time');
    if (missing.length) unresolved.push({ eventRef, fields: missing });
    const payload: ObjectValue = {}, originalPayload = value.payload ?? null;
    const rawPayload = canonicalizeJson(originalPayload), rawPayloadBytes = Buffer.byteLength(rawPayload);
    for (const [key, child] of Object.entries(object(originalPayload) ?? {})) {
      if ((typeof child === 'string' && Object.hasOwn(payloadEnums, key) && payloadEnums[key].includes(child)) ||
          (key === 'matched' && typeof child === 'boolean') ||
          (['latencyMs', 'retryCount'].includes(key) && typeof child === 'number' && Number.isFinite(child) && child >= 0)) payload[key] = child;
      else omittedFields++;
    }
    if (originalPayload !== null) {
      if (!object(originalPayload)) omittedFields++;
      omittedPayloadBytes += Math.max(0, rawPayloadBytes - Buffer.byteLength(canonicalizeJson(payload)));
    }
    // Raw blobs remain local. TRACE-NORM receives only a content ref and safe enum fields.
    if (rawPayloadBytes >= 256) {
      const sha256 = hash(rawPayload), ref = `sha256:${sha256}`;
      payloads.set(ref, { ref, sha256, byteLength: rawPayloadBytes, bytes: rawPayload });
      payload.rawPayloadRef = ref; payload.rawPayloadBytes = rawPayloadBytes; payload.rawPayloadAccess = 'local-private';
      externalizedEvents++; externalizedBytes += rawPayloadBytes;
    }
    const metadata: ObjectValue = { producer_ref: producerRef, producer_family: value.family, event_ref: eventRef,
      correlation: refs, unresolved: missing, source_time_transform: 'relative-to-first-admitted-time' };
    if (refs.request) metadata.request_id = refs.request;
    const message: ObjectValue = { id: eventRef, kind: value.eventType,
      author: { role: value.eventType === 'user-request' ? 'user' : 'tool' }, metadata, content: payload };
    if (value.eventType === 'mcp-result' && payload.status === 'ok') message.status = 'finished_successfully';
    const captured: ObjectValue = { type: value.eventType, run_id: refs.run ?? `unscoped:${eventRef}`, message,
      ...(refs.conversation ? { conversation_id: refs.conversation } : {}), ...(sourceTime ? { source_event_time: sourceTime } : {}) };
    frames.push(`event: message\ndata: ${canonicalizeJson({ source_sequence: sourceSequence, captured })}\n\n`);
  }
  const fixture = frames.join(''), derivedDigest = hash(fixture);
  const streamProfile = createSourceSystemProfileTile({ sourceSystemId: 'headless-boundary-stream', canonicalName: 'Headless boundary JSONL',
    sourceRoles: ['source-evidence'], capabilityFacets: ['tunnel', 'mcp', 'device'], curationPosture: 'bounded-source',
    reviewPosture: 'disclosure-allowlist', preservationPosture: 'private-original-retained', rightsPosture: 'local-private', evidenceRefs: [sourceRef] });
  const record = createSourceRecordTile({ sourceSystemId: 'headless-boundary-stream', recordLocalId: sourceDigest,
    stableLocators: [sourceRef], recordType: 'headless-boundary-jsonl', publicationStatus: 'local-private',
    metadataBlob: { maturity: options.maturity, producerProfileCids: [...profiles.values()].map(p => p.cid).sort() } }, [streamProfile.cid]);
  const original = createSourceManifestationTile({ sourceRecordCid: record.cid, manifestationId: sourceDigest,
    manifestationKind: options.maturity === 'fixture' ? 'generated-fixture' : 'recorded-boundary-evidence', mediaType: 'application/x-ndjson',
    byteHashes: { sha256: sourceDigest }, accessRequirements: ['local-private', 'no-external-publish'], structureProfile: BOUNDARY_SOURCE_PROFILE }, [record.cid]);
  const derived = createSourceManifestationTile({ sourceRecordCid: record.cid, manifestationId: derivedDigest,
    manifestationKind: 'redacted-boundary-trace', mediaType: 'text/event-stream', byteHashes: { sha256: derivedDigest },
    accessRequirements: ['local-private', 'redacted-derived'], structureProfile: BOUNDARY_SOURCE_PROFILE }, [record.cid, original.cid]);
  const episode = createSourceEpisodeTile({ episodeId: derivedDigest, family: 'journal-log', locator: `sha256:${derivedDigest}`,
    rawEvidenceRefs: [{ evidenceId: sourceDigest, evidenceKind: options.maturity === 'fixture' ? 'generated-fixture' : 'local-file', locator: sourceRef, sha256: sourceDigest }],
    rightsScope: ['local-private', 'redacted-derived'], chronology: { primary: { date: '2000-01-01', kind: 'relative-redacted', source: BOUNDARY_SOURCE_PROFILE }, intake: { recordedAt: options.recordedAt } },
    mode: 'parse-only', classification: { confidence: 1, reasons: ['declared bounded boundary format; no behavioral truth assessment'] },
    sourceRecordCid: record.cid, sourceManifestationCid: derived.cid }, [derived.cid]);
  const producerProfiles = [...profiles.values()];
  const sourcePackage = createSourcePackageTile({ sourceRecordCid: record.cid, packageId: sourceDigest,
    packageKind: 'bounded-boundary-trace', members: [original.cid, derived.cid, episode.cid, ...producerProfiles.map(p => p.cid)],
    profileRefs: [streamProfile.cid, ...producerProfiles.map(p => p.cid)] }, [record.cid, original.cid, derived.cid, episode.cid]);
  return {
    localEvidence: { source: { ref: sourceRef, sha256: sourceDigest, byteLength: Buffer.byteLength(raw), bytes: raw }, payloads: [...payloads.values()] },
    source: { streamProfile, profiles: producerProfiles, record, original, derived, episode, package: sourcePackage }, fixture,
    report: { profile: BOUNDARY_SOURCE_PROFILE, maturity: options.maturity, rawBytes: Buffer.byteLength(raw), rawEvents,
      retainedEvents: frames.length, retainedBytes: Buffer.byteLength(fixture), omittedEvents: omissions.length, omittedBytes, omittedFields, omittedPayloadBytes,
      duplicateEvents: [...seen.values()].reduce((sum, item) => sum + item.count - 1, 0), duplicateBytes,
      externalizedEvents, externalizedBytes, uniqueExternalizedBytes: [...payloads.values()].reduce((sum, p) => sum + p.byteLength, 0),
      unresolvedEvents: unresolved.length, unresolved, omissions, occurrences: [...seen].map(([eventRef, item]) => ({ eventRef, count: item.count })) },
  };
}
