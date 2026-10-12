import { createHash } from 'node:crypto';
import { canonicalizeJson, type JsonValue } from '@entif-ai/rosetta-canon';
import { verifyAgentStreamNormalizationContent, type AgentStreamNormalizationResult } from '@entif-ai/ingress-refinery';
import { agentTraceProjectionIdentity, type FixtureCypherStatement } from './agent-trace-neo4j.js';

export const AGENT_TRACE_KINEMATICS_PROFILE = 'agent-trace-kinematics@1.0.0';
interface ObjectMotion {
  disappearedAt: string[];
  objectId: string;
  presentAt: string[];
  reappearedAt: string[];
  runId: string;
  survivedTransitions: number;
  windowId: string;
}
interface RepeatedSignature {
  kind: 'payload' | 'request' | 'result' | 'object-value' | 'named-object-value';
  occurrenceCount: number;
  recordLines: number[];
  runId: string;
  signatureSha256: string;
  sourceName: string | null;
  sourceRef: string;
  windowId: string;
}
interface SnapshotMotion {
  addedCount: number;
  changedCount: number;
  compactionCandidate: boolean;
  duplicateCount: number;
  normalizedRecordAndSnapshotBytes: number;
  objectValueCanonicalBytes: number;
  occurrenceCount: number;
  previousSnapshotId: string | null;
  recordCount: number;
  recordLine: number;
  removedCount: number;
  representationGrowth: boolean;
  representationShrink: boolean;
  runId: string;
  snapshotId: string;
  sourceRecordBytes: number;
  uniqueObjectCount: number;
  unchangedCount: number;
  windowId: string;
}
export interface AgentTraceKinematicsReport {
  byteAccounting: string;
  canonicalJson: string;
  compactionCandidateCriterion: string;
  epistemicBoundary: string;
  normalizedBytes: number;
  normalizedSha256: string;
  normalizerProfile: string;
  objects: ObjectMotion[];
  profile: string;
  projectionId: string;
  receiptRefs: string[];
  sha256: string;
  sharedBlobDictionaryBytes: number;
  signatures: RepeatedSignature[];
  snapshots: SnapshotMotion[];
  sourceBytes: number;
  sourceManifestationCid: string;
  sourceSha256: string;
  windows: Array<{ recordCount: number; runId: string; snapshotCount: number; sourceRecordBytes: number; windowId: string }>;
}
const canonical = (value: unknown) => canonicalizeJson(value as JsonValue);
const digest = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex');
const byteLength = (value: unknown) => Buffer.byteLength(canonical(value));

/** Model-free morphology of client-visible source representations; no provider-state inference. */
export function analyzeAgentTraceKinematics(normalized: AgentStreamNormalizationResult, bytes: Uint8Array): AgentTraceKinematicsReport {
  if (digest(bytes) !== normalized.source.sourceSha256) throw new Error('Kinematics source integrity check failed.');
  const parsed = verifyAgentStreamNormalizationContent(normalized);
  const projectionId = agentTraceProjectionIdentity(normalized.sha256);
  const recordByLine = new Map(normalized.records.map((record) => [record.line, record]));
  const windows = new Map<string, AgentTraceKinematicsReport['windows'][number]>();
  const recordCounts = new Map<number, number>();
  const signatures = new Map<string, RepeatedSignature>();
  const addSignature = (kind: RepeatedSignature['kind'], runId: string, windowId: string, sourceRef: string, valueDigest: string | null, recordLine: number, sourceName: string | null = null) => {
    const signatureSha256 = digest(canonical([kind, runId, windowId, sourceRef, valueDigest]));
    const item = signatures.get(signatureSha256) ?? { kind, runId, windowId, sourceRef, sourceName, signatureSha256, occurrenceCount: 0, recordLines: [] };
    item.occurrenceCount++; item.recordLines.push(recordLine); signatures.set(signatureSha256, item);
  };
  for (const [index, record] of normalized.records.entries()) {
    const data = parsed[index];
    if (typeof data.run_id !== 'string' || typeof data.window_id !== 'string') throw new Error('Kinematics requires explicit run/window identity.');
    const runId = data.run_id; const windowId = data.window_id;
    const scope = canonical([runId, windowId]);
    const window = windows.get(scope) ?? { runId, windowId, recordCount: 0, snapshotCount: 0, sourceRecordBytes: 0 };
    window.recordCount++; window.sourceRecordBytes += record.endByte - record.startByte;
    windows.set(scope, window); recordCounts.set(record.line, window.recordCount);
    for (const [field, kind] of [['request_ref', 'request'], ['result_ref', 'result']] as const) if (typeof data[field] === 'string') addSignature(kind, runId, windowId, data[field] as string, null, record.line);
    if ('payload' in data) { const hash = digest(canonical(data.payload)); addSignature('payload', runId, windowId, hash, hash, record.line); }
  }
  const objects = new Map<string, ObjectMotion>();
  const previous = new Map<string, { ids: Set<string>; occurrenceCount: number; uniqueObjectCount: number }>();
  const snapshots: SnapshotMotion[] = [];
  for (const snapshot of normalized.snapshots) {
    const { runId, windowId } = snapshot;
    const scope = canonical([runId, windowId]); windows.get(scope)!.snapshotCount++;
    const prior = snapshot.previousSnapshotId === null ? undefined : previous.get(scope);
    const currentIds = new Set(snapshot.objects.map(({ id }) => id));
    for (const objectId of new Set([...(prior?.ids ?? []), ...currentIds])) {
      const key = canonical([runId, windowId, objectId]);
      const motion = objects.get(key) ?? { runId, windowId, objectId, presentAt: [], disappearedAt: [], reappearedAt: [], survivedTransitions: 0 };
      if (currentIds.has(objectId)) {
        if (prior?.ids.has(objectId)) motion.survivedTransitions++;
        else if (prior && motion.presentAt.length) motion.reappearedAt.push(snapshot.snapshotId);
        motion.presentAt.push(snapshot.snapshotId);
      } else if (prior?.ids.has(objectId)) motion.disappearedAt.push(snapshot.snapshotId);
      objects.set(key, motion);
    }
    for (const occurrence of snapshot.occurrences) {
      const object = snapshot.objects[occurrence.objectIndex];
      const value = JSON.parse(normalized.blobs[object.valueSha256].canonicalJson) as JsonValue;
      const sourceName = value && typeof value === 'object' && !Array.isArray(value) && typeof value.name === 'string' ? value.name : null;
      addSignature(sourceName === null ? 'object-value' : 'named-object-value', runId, windowId, object.id, object.valueSha256, snapshot.recordLine, sourceName);
    }
    const record = recordByLine.get(snapshot.recordLine)!;
    const valueDigests = new Set(snapshot.objects.map(({ valueSha256 }) => valueSha256));
    snapshots.push({
      snapshotId: snapshot.snapshotId, previousSnapshotId: snapshot.previousSnapshotId, runId, windowId,
      recordLine: snapshot.recordLine, recordCount: recordCounts.get(snapshot.recordLine)!,
      sourceRecordBytes: record.endByte - record.startByte,
      normalizedRecordAndSnapshotBytes: byteLength(record) + byteLength(snapshot),
      objectValueCanonicalBytes: [...valueDigests].reduce((sum, hash) => sum + Buffer.byteLength(normalized.blobs[hash].canonicalJson), 0),
      occurrenceCount: snapshot.occurrences.length, uniqueObjectCount: snapshot.objects.length,
      duplicateCount: snapshot.occurrences.length - snapshot.objects.length,
      addedCount: snapshot.added.length, changedCount: snapshot.changed.length,
      removedCount: snapshot.removed.length, unchangedCount: snapshot.unchanged.length,
      representationGrowth: prior !== undefined && snapshot.occurrences.length > prior.occurrenceCount,
      representationShrink: prior !== undefined && snapshot.occurrences.length < prior.occurrenceCount,
      compactionCandidate: prior !== undefined && snapshot.objects.length < prior.uniqueObjectCount && snapshot.removed.length > 0
    });
    previous.set(scope, { ids: currentIds, occurrenceCount: snapshot.occurrences.length, uniqueObjectCount: snapshot.objects.length });
  }
  const body = {
    profile: AGENT_TRACE_KINEMATICS_PROFILE, normalizerProfile: normalized.profile, projectionId,
    sourceSha256: normalized.source.sourceSha256, sourceManifestationCid: normalized.source.manifestationCid,
    normalizedSha256: normalized.sha256, receiptRefs: [normalized.normalizationReceipt.cid],
    sourceBytes: bytes.byteLength, normalizedBytes: Buffer.byteLength(normalized.canonicalJson),
    sharedBlobDictionaryBytes: byteLength(normalized.blobs),
    byteAccounting: 'Snapshot sizes count source record spans without delimiters and separate JCS record/snapshot structures; shared blobs/envelope/lineage are reported separately from local structure. Object value bytes count unique referenced canonical values, not additional evidence.',
    compactionCandidateCriterion: 'Unique observable object count decreased and at least one observable object ID was removed within the same uninterrupted run/window snapshot chain.',
    epistemicBoundary: 'Measures client-visible representation dynamics; does not establish provider/model internal state, memory deletion, recall, or causal effects.',
    objects: [...objects.values()], signatures: [...signatures.values()].filter(({ occurrenceCount }) => occurrenceCount > 1), snapshots, windows: [...windows.values()]
  };
  const canonicalJson = canonical(body);
  return { ...body, canonicalJson, sha256: digest(canonicalJson) };
}

export function agentTraceTransitionQuery(projectionId: string, recordLine: number, limit = 50): FixtureCypherStatement {
  if (!Number.isInteger(recordLine) || recordLine < 1) throw new Error('Transition record line must be a positive integer.');
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new Error('Transition limit must be between 1 and 100.');
  return { statement: 'MATCH (current:AkashaTrace {projectionId:$projectionId,kind:"snapshot",recordLine:$recordLine})-[:TRACE_EDGE {projectionId:$projectionId,kind:"PREVIOUS_SNAPSHOT"}]->(previous) MATCH (s:AkashaTrace {projectionId:$projectionId})-[r:TRACE_EDGE {projectionId:$projectionId}]->(n:AkashaTrace {projectionId:$projectionId}) WHERE s IN [previous,current] RETURN s.sourceId,r.kind,n.sourceId,n.valueSha256 ORDER BY s.recordLine,r.kind,n.sourceId LIMIT $limit', parameters: { projectionId, recordLine, limit } };
}
