import { canonicalizeJson, type JsonValue } from '@entif-ai/rosetta-canon';
import { sha256Hex } from '@entif-ai/rosetta-cid';
import { buildTile, type TileEnvelope } from '@entif-ai/rosetta-core';
import { buildAgentStreamSourceArtifacts, type AgentStreamFixtureManifest, type AgentStreamSourceArtifacts } from '@entif-ai/source-substrate';

export const AGENT_STREAM_NORMALIZATION_PROFILE = {
  id: 'agent-stream-structural@1.0.0',
  maxBytes: 1_000_000,
  maxLineBytes: 100_000,
  maxRecords: 10_000,
  blobThresholdBytes: 64
} as const;

type JsonObject = Record<string, JsonValue>;
interface NormalizedRecord {
  data: JsonObject;
  endByte: number;
  eventId: string | null;
  externalizedFields: Record<string, string>;
  line: number;
  lineSha256: string;
  startByte: number;
}
interface NormalizedSnapshot {
  added: string[];
  changed: string[];
  eventId: string;
  extra: JsonObject;
  objects: Array<{ id: string; valueSha256: string }>;
  occurrences: Array<{ objectIndex: number; extra: JsonObject }>;
  previousSnapshotId: string | null;
  recordLine: number;
  removed: string[];
  repeated: Array<{ id: string; occurrences: number; valueSha256: string }>;
  runId: string;
  snapshotId: string;
  unchanged: string[];
  windowId: string;
}
export interface AgentStreamStructuralNormalization {
  blobs: Record<string, { canonicalJson: string; sha256: string }>;
  envelope: { recordedAt?: string; runId?: string; windowId?: string };
  lossReport: {
    canonicalized: string[];
    externalizedBlobCount: number;
    hoistedFields: string[];
    omitted: string[];
    unknownTimeEventIds: string[];
    unresolved: Array<{ eventId: string | null; path: string; reason: string }>;
  };
  profile: string;
  records: NormalizedRecord[];
  snapshots: NormalizedSnapshot[];
}
export interface AgentStreamNormalizationResult extends AgentStreamStructuralNormalization {
  canonicalJson: string;
  materialization: { canonicalByteLength: number; netByteDelta: number; sourceByteLength: number };
  normalizationReceipt: TileEnvelope;
  sha256: string;
  source: { episodeCid: string; manifestationCid: string; packageCid: string; recordCid: string; sourceSha256: string };
  sourceArtifacts: AgentStreamSourceArtifacts;
}

function isObject(value: JsonValue): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function nonempty(value: JsonValue | undefined): value is string {
  return typeof value === 'string' && value.length > 0;
}
function parseRecords(bytes: Uint8Array): Array<Omit<NormalizedRecord, 'externalizedFields'>> {
  const limits = AGENT_STREAM_NORMALIZATION_PROFILE;
  if (bytes.byteLength > limits.maxBytes) throw new Error(`Agent-stream source exceeds ${limits.maxBytes} byte limit.`);
  let text: string;
  try { text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes); }
  catch { throw new Error('Agent-stream source is not valid UTF-8.'); }
  const lines = text.replace(/\n$/u, '').split('\n');
  if (lines.length > limits.maxRecords) throw new Error(`Agent-stream source exceeds ${limits.maxRecords} record limit.`);
  let startByte = 0;
  return lines.map((line, index) => {
    const size = Buffer.byteLength(line);
    if (size > limits.maxLineBytes) throw new Error(`Agent-stream line ${index + 1} exceeds ${limits.maxLineBytes} byte limit.`);
    let value: JsonValue;
    try { value = JSON.parse(line) as JsonValue; }
    catch { throw new Error(`Agent-stream line ${index + 1} is malformed JSON.`); }
    if (!isObject(value)) throw new Error(`Agent-stream line ${index + 1} is not an object.`);
    canonicalizeJson(value);
    const record = { data: value, endByte: startByte + size, eventId: nonempty(value.event_id) ? value.event_id : null, line: index + 1, lineSha256: sha256Hex(line), startByte };
    startByte += size + 1;
    return record;
  });
}

function invariant(records: Array<{ data: JsonObject }>, field: string): string | undefined {
  const value = records[0]?.data[field];
  return nonempty(value) && records.every(({ data }) => data[field] === value) ? value : undefined;
}

/** Unbound structural transformation; this function makes no source identity or admission claim. */
export function normalizeAgentStreamRecords(bytes: Uint8Array): AgentStreamStructuralNormalization {
  const parsed = parseRecords(bytes);
  const blobs: AgentStreamStructuralNormalization['blobs'] = {};
  const unresolved: AgentStreamStructuralNormalization['lossReport']['unresolved'] = [];
  const addBlob = (value: JsonValue): string => {
    const canonicalJson = canonicalizeJson(value);
    const sha256 = sha256Hex(canonicalJson);
    blobs[sha256] ??= { canonicalJson, sha256 };
    return sha256;
  };
  const envelope: AgentStreamStructuralNormalization['envelope'] = {};
  const hoistedFields: string[] = [];
  const mappings = { run_id: 'runId', window_id: 'windowId', recorded_at: 'recordedAt' } as const;
  for (const [field, target] of Object.entries(mappings)) {
    const value = invariant(parsed, field);
    if (value !== undefined) { envelope[target] = value; hoistedFields.push(field); }
  }
  const previousByScope = new Map<string, { objects: Map<string, string>; snapshotId: string }>();
  const snapshots: NormalizedSnapshot[] = [];
  const eventIds = new Set<string>();
  const knownTypes = new Set(['session.started', 'turn.requested', 'turn.completed', 'snapshot.window', 'transport.frame']);
  const records = parsed.map((parsedRecord): NormalizedRecord => {
    const { eventId } = parsedRecord;
    const data = { ...parsedRecord.data };
    const report = (path: string, reason: string) => { unresolved.push({ eventId, path, reason }); };
    for (const field of ['event_id', 'type', 'run_id', 'window_id']) {
      if (!nonempty(data[field])) report(field, 'Missing or malformed identifier retained in record data.');
    }
    if (eventId !== null && eventIds.has(eventId)) report('event_id', 'Repeated event identity retained; no unique-event claim.');
    if (eventId !== null) eventIds.add(eventId);
    if (!knownTypes.has(data.type as string)) report('type', 'Unrecognized event type retained without interpretation.');
    if (isObject(data.unrecognized_fields ?? null) && Object.keys(data.unrecognized_fields as JsonObject).length > 0) report('unrecognized_fields', 'Opaque source fields retained without interpretation.');
    const externalizedFields: Record<string, string> = {};
    if ('payload' in data && Buffer.byteLength(canonicalizeJson(data.payload)) >= AGENT_STREAM_NORMALIZATION_PROFILE.blobThresholdBytes) {
      externalizedFields.payload = addBlob(data.payload);
      delete data.payload;
    }
    if (data.type === 'snapshot.window') {
      const scopeKey = JSON.stringify([data.run_id ?? null, data.window_id ?? null]);
      const raw = data.snapshot;
      const validHeader = eventId !== null && nonempty(data.run_id) && nonempty(data.window_id) && raw !== undefined && isObject(raw) && nonempty(raw.snapshot_id) && Array.isArray(raw.objects);
      const rawObjects = validHeader ? (raw as JsonObject).objects as JsonValue[] : [];
      const validObjects = rawObjects.every((object) => isObject(object) && nonempty(object.id) && Object.hasOwn(object, 'value'));
      const valuesById = new Map<string, string>();
      let ambiguous = false;
      if (validHeader && validObjects) {
        for (const rawObject of rawObjects) {
          const object = rawObject as JsonObject;
          const id = object.id as string;
          const valueHash = sha256Hex(canonicalizeJson(object.value));
          if (valuesById.has(id) && valuesById.get(id) !== valueHash) ambiguous = true;
          valuesById.set(id, valueHash);
        }
      }
      if (!validHeader || !validObjects || ambiguous || (eventId !== null && snapshots.some((snapshot) => snapshot.eventId === eventId))) {
        report('snapshot', 'Malformed or ambiguous snapshot retained; no state delta inferred.');
        previousByScope.delete(scopeKey);
      } else {
        const source = raw as JsonObject;
        const objects: NormalizedSnapshot['objects'] = [];
        const occurrences: NormalizedSnapshot['occurrences'] = [];
        const indexes = new Map<string, number>();
        const counts = new Map<string, number>();
        for (const rawObject of rawObjects) {
          const object = rawObject as JsonObject;
          const id = object.id as string;
          if (!indexes.has(id)) { indexes.set(id, objects.length); objects.push({ id, valueSha256: addBlob(object.value) }); }
          const extra = { ...object }; delete extra.id; delete extra.value;
          occurrences.push({ extra, objectIndex: indexes.get(id)! });
          counts.set(id, (counts.get(id) ?? 0) + 1);
        }
        const previous = previousByScope.get(scopeKey);
        const prior = previous?.objects ?? new Map<string, string>();
        const extra = { ...source }; delete extra.snapshot_id; delete extra.objects;
        snapshots.push({
          added: [...valuesById.keys()].filter((id) => !prior.has(id)),
          changed: [...valuesById.keys()].filter((id) => prior.has(id) && prior.get(id) !== valuesById.get(id)),
          eventId: eventId!, extra, objects, occurrences,
          previousSnapshotId: previous?.snapshotId ?? null, recordLine: parsedRecord.line,
          removed: [...prior.keys()].filter((id) => !valuesById.has(id)),
          repeated: objects.filter(({ id }) => counts.get(id)! > 1).map(({ id, valueSha256 }) => ({ id, occurrences: counts.get(id)! - 1, valueSha256 })),
          runId: data.run_id as string, snapshotId: source.snapshot_id as string,
          unchanged: [...valuesById.keys()].filter((id) => prior.get(id) === valuesById.get(id)),
          windowId: data.window_id as string
        });
        previousByScope.set(scopeKey, { objects: valuesById, snapshotId: source.snapshot_id as string });
        delete data.snapshot;
      }
    }
    for (const field of hoistedFields) delete data[field];
    return { ...parsedRecord, data, externalizedFields };
  });
  return {
    blobs, envelope, profile: AGENT_STREAM_NORMALIZATION_PROFILE.id, records, snapshots,
    lossReport: {
      canonicalized: ['RFC8785_JCS output', 'JSON whitespace/property order; raw byte spans remain available', 'JSON.parse duplicate-property last-value behavior; original source bytes remain authoritative'],
      externalizedBlobCount: Object.keys(blobs).length, hoistedFields, omitted: [],
      unknownTimeEventIds: records.filter(({ data, eventId }) => data.source_timestamp === null && eventId !== null).map(({ eventId }) => eventId!),
      unresolved
    }
  };
}

/** Verified offline source fixture plus the attributable structural view; no live capture. */
export function normalizeAgentStreamSource(manifest: AgentStreamFixtureManifest, bytes: Uint8Array): AgentStreamNormalizationResult {
  const structural = normalizeAgentStreamRecords(bytes);
  const sourceArtifacts = buildAgentStreamSourceArtifacts(manifest, bytes);
  const source = { episodeCid: sourceArtifacts.episode.cid, manifestationCid: sourceArtifacts.manifestation.cid, packageCid: sourceArtifacts.sourcePackage.cid, recordCid: sourceArtifacts.record.cid, sourceSha256: manifest.sourceArtifact.sha256 };
  const body = { ...structural, source };
  const canonicalJson = canonicalizeJson(body as unknown as JsonValue);
  const sha256 = sha256Hex(canonicalJson);
  const canonicalByteLength = Buffer.byteLength(canonicalJson);
  const normalizationReceipt = buildTile('source.normalization_receipt', {
    canonicalTextHash: sha256, contentFingerprint: sha256,
    normalizationProfile: structural.profile, parserProfile: structural.profile,
    revisionFingerprint: sha256, sourceManifestationCid: source.manifestationCid,
    sourcePackageCid: source.packageCid
  }, { createdAt: manifest.capture.recordedAt, pack: 'ingress-refinery', parents: [source.manifestationCid, source.packageCid] });
  return { ...body, canonicalJson, sha256, normalizationReceipt, sourceArtifacts,
    materialization: { canonicalByteLength, netByteDelta: canonicalByteLength - bytes.byteLength, sourceByteLength: bytes.byteLength } };
}

export function reconstructAgentStreamRecords(result: AgentStreamStructuralNormalization): JsonObject[] {
  const resolve = (digest: string): JsonValue => {
    const value = result.blobs[digest];
    if (!value || value.sha256 !== digest || sha256Hex(value.canonicalJson) !== digest) throw new Error('Normalized blob is missing or has failed digest verification.');
    return JSON.parse(value.canonicalJson) as JsonValue;
  };
  const snapshots = new Map(result.snapshots.map((snapshot) => [snapshot.recordLine, snapshot]));
  return result.records.map(({ data, line, externalizedFields }) => {
    const record = { ...data };
    const mapping = { run_id: result.envelope.runId, window_id: result.envelope.windowId, recorded_at: result.envelope.recordedAt };
    for (const [field, value] of Object.entries(mapping)) if (value !== undefined) record[field] = value;
    for (const [field, digest] of Object.entries(externalizedFields)) record[field] = resolve(digest);
    const snapshot = snapshots.get(line);
    if (snapshot) record.snapshot = { ...snapshot.extra, snapshot_id: snapshot.snapshotId,
      objects: snapshot.occurrences.map(({ objectIndex, extra }) => {
        const object = snapshot.objects[objectIndex];
        if (!object) throw new Error('Normalized snapshot occurrence references a missing object.');
        return { ...extra, id: object.id, value: resolve(object.valueSha256) };
      }) };
    return record;
  });
}
