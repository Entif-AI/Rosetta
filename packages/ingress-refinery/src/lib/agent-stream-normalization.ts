import { createHash } from 'node:crypto';
import { canonicalizeJson, type JsonValue } from '@entif-ai/rosetta-canon';
import { buildTile, type TileEnvelope } from '@entif-ai/rosetta-core';
import { buildAgentStreamSourceArtifacts, type AgentStreamFixtureManifest, type AgentStreamSourceArtifacts } from '@entif-ai/source-substrate';

const PROFILE = 'agent-stream-structural@1.0.0';
const MAX_BYTES = 1_000_000, MAX_LINE_BYTES = 100_000, MAX_RECORDS = 10_000, BLOB_BYTES = 64;
type Obj = Record<string, JsonValue>;
export interface AgentStreamNormalizationResult {
  blobs: Record<string, { canonicalJson: string; sha256: string }>;
  canonicalJson: string; envelope: { recordedAt?: string; runId?: string; windowId?: string };
  lossReport: { canonicalized: string[]; externalizedBlobCount: number; omitted: string[]; unknownTimeEventIds: string[] };
  materialization: { canonicalByteLength: number; netByteDelta: number; sourceByteLength: number };
  normalizationReceipt: TileEnvelope; profile: string;
  records: Array<{ data: Obj; endByte: number; eventId: string; startByte: number }>;
  sha256: string;
  snapshots: Array<{ added: string[]; changed: string[]; eventId: string; extra: Obj; objects: Array<{ id: string; valueSha256: string }>; removed: string[]; repeated: Array<{ id: string; occurrences: number; valueSha256: string }>; snapshotId: string; unchanged: string[] }>;
  source: { manifestationCid: string; packageCid: string; recordCid: string; sourceSha256: string };
  sourceArtifacts: AgentStreamSourceArtifacts;
}
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
function equal(values: Array<string | null>): string | undefined { return values[0] !== null && values.every((v) => v === values[0]) ? values[0] ?? undefined : undefined; }
function blob(value: JsonValue, blobs: AgentStreamNormalizationResult['blobs']): string {
  const canonicalJson = canonicalizeJson(value), sha256 = hash(canonicalJson);
  blobs[sha256] ??= { canonicalJson, sha256 };
  return sha256;
}
function parse(bytes: Uint8Array): Array<{ data: Obj; endByte: number; startByte: number }> {
  if (bytes.byteLength > MAX_BYTES) throw new Error(`Agent-stream source exceeds ${MAX_BYTES} byte limit.`);
  const lines = Buffer.from(bytes).toString('utf8').replace(/\n$/u, '').split('\n');
  if (lines.length > MAX_RECORDS) throw new Error(`Agent-stream source exceeds ${MAX_RECORDS} record limit.`);
  let start = 0;
  return lines.map((line, index) => {
    const size = Buffer.byteLength(line); if (size > MAX_LINE_BYTES) throw new Error(`Agent-stream line ${index + 1} exceeds ${MAX_LINE_BYTES} byte limit.`);
    let data: unknown; try { data = JSON.parse(line); } catch { throw new Error(`Agent-stream line ${index + 1} is malformed JSON.`); }
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`Agent-stream line ${index + 1} is not an object.`);
    const result = { data: data as Obj, endByte: start + size, startByte: start }; start += size + 1; return result;
  });
}
export function normalizeAgentStreamSource(manifest: AgentStreamFixtureManifest, bytes: Uint8Array): AgentStreamNormalizationResult {
  const sourceArtifacts = buildAgentStreamSourceArtifacts(manifest, bytes), parsed = parse(bytes), blobs: AgentStreamNormalizationResult['blobs'] = {};
  const runId = equal(parsed.map(({ data }) => typeof data.run_id === 'string' ? data.run_id : null));
  const windowId = equal(parsed.map(({ data }) => typeof data.window_id === 'string' ? data.window_id : null));
  const recordedAt = equal(parsed.map(({ data }) => typeof data.recorded_at === 'string' ? data.recorded_at : null));
  const envelope = { ...(recordedAt ? { recordedAt } : {}), ...(runId ? { runId } : {}), ...(windowId ? { windowId } : {}) };
  const previous = new Map<string, string>(), snapshots: AgentStreamNormalizationResult['snapshots'] = [];
  const records = parsed.map(({ data, startByte, endByte }) => {
    const record = { ...data }; if (runId) delete record.run_id; if (windowId) delete record.window_id; if (recordedAt) delete record.recorded_at;
    if (typeof record.payload === 'string' && record.payload.length >= BLOB_BYTES) { record.payload_blob_sha256 = blob(record.payload, blobs); delete record.payload; }
    if (record.type === 'snapshot.window' && record.snapshot && typeof record.snapshot === 'object' && !Array.isArray(record.snapshot)) {
      const source = record.snapshot as Obj, seen = new Map<string, { id: string; count: number; valueSha256: string }>(), objects: Array<{ id: string; valueSha256: string }> = [];
      for (const raw of Array.isArray(source.objects) ? source.objects : []) if (raw && typeof raw === 'object' && !Array.isArray(raw)) { const object = raw as Obj; if (typeof object.id === 'string' && 'value' in object) { const valueSha256 = blob(object.value, blobs), key = `${object.id}\0${valueSha256}`, prior = seen.get(key); if (prior) prior.count += 1; else { const next = { id: object.id, count: 1, valueSha256 }; seen.set(key, next); objects.push({ id: next.id, valueSha256 }); } } }
      const current = new Map(objects.map((o) => [o.id, o.valueSha256]));
      const extra = { ...source }; delete extra.snapshot_id; delete extra.objects;
      snapshots.push({ added: [...current.keys()].filter((id) => !previous.has(id)), changed: [...current.keys()].filter((id) => previous.has(id) && previous.get(id) !== current.get(id)), eventId: String(record.event_id), extra, objects, removed: [...previous.keys()].filter((id) => !current.has(id)), repeated: [...seen.values()].filter((x) => x.count > 1).map(({ id, count, valueSha256 }) => ({ id, occurrences: count - 1, valueSha256 })), snapshotId: String(source.snapshot_id), unchanged: [...current.keys()].filter((id) => previous.get(id) === current.get(id)) });
      previous.clear(); current.forEach((value, id) => previous.set(id, value)); delete record.snapshot;
    }
    return { data: record, endByte, eventId: String(data.event_id), startByte };
  });
  const lossReport = { canonicalized: ['RFC8785_JCS', 'structural transport normalization'], externalizedBlobCount: Object.keys(blobs).length, omitted: [], unknownTimeEventIds: records.filter(({ data }) => data.source_timestamp === null).map(({ eventId }) => eventId) };
  const source = { manifestationCid: sourceArtifacts.manifestation.cid, packageCid: sourceArtifacts.sourcePackage.cid, recordCid: sourceArtifacts.record.cid, sourceSha256: manifest.sourceArtifact.sha256 };
  const body = { blobs, envelope, lossReport, profile: PROFILE, records, snapshots, source }, canonicalJson = canonicalizeJson(body as JsonValue), sha256 = hash(canonicalJson);
  const normalizationReceipt = buildTile('source.normalization_receipt', { canonicalTextHash: sha256, contentFingerprint: sha256, normalizationProfile: PROFILE, parserProfile: PROFILE, revisionFingerprint: sha256, sourceManifestationCid: source.manifestationCid, sourcePackageCid: source.packageCid }, { createdAt: manifest.capture.recordedAt, pack: 'ingress-refinery', parents: [source.manifestationCid, source.packageCid] });
  return { ...body, canonicalJson, materialization: { canonicalByteLength: Buffer.byteLength(canonicalJson), netByteDelta: Buffer.byteLength(canonicalJson) - bytes.byteLength, sourceByteLength: bytes.byteLength }, normalizationReceipt, sha256, sourceArtifacts };
}
export function reconstructAgentStreamRecords(result: AgentStreamNormalizationResult): Obj[] {
  const snapshots = new Map(result.snapshots.map((snapshot) => [snapshot.eventId, snapshot]));
  return result.records.map(({ data, eventId }) => {
    const record: Obj = { ...data, ...(result.envelope.runId ? { run_id: result.envelope.runId } : {}), ...(result.envelope.windowId ? { window_id: result.envelope.windowId } : {}), ...(result.envelope.recordedAt ? { recorded_at: result.envelope.recordedAt } : {}) };
    if (typeof record.payload_blob_sha256 === 'string') { record.payload = JSON.parse(result.blobs[record.payload_blob_sha256]!.canonicalJson) as JsonValue; delete record.payload_blob_sha256; }
    const snapshot = snapshots.get(eventId); if (snapshot) record.snapshot = { ...snapshot.extra, snapshot_id: snapshot.snapshotId, objects: snapshot.objects.flatMap((object) => Array.from({ length: 1 + (snapshot.repeated.find((repeat) => repeat.id === object.id && repeat.valueSha256 === object.valueSha256)?.occurrences ?? 0) }, () => ({ id: object.id, value: JSON.parse(result.blobs[object.valueSha256]!.canonicalJson) as JsonValue }))) };
    return record;
  });
}
