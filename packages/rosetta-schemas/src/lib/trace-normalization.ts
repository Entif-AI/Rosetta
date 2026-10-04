import { Ajv } from 'ajv';
import { createHash } from 'node:crypto';
import { canonicalizeJson, type JsonValue } from '@entif-ai/rosetta-canon';
export const TRACE_NORMALIZATION_PROFILE = 'trace.normalization.v1';
export type TraceContent = { kind: 'inline'; value: JsonValue } | { kind: 'dictionary'; payloadRef: string };
export interface TraceObjectState { objectId: string; objectKind: string; stableFields: Record<string, JsonValue>; content: TraceContent }
export interface TraceRecord {
  recordId: string; framing: string[]; sourceSequence: number; sourceEventType: string; windowRef: string; runRef: string;
  objectRef?: string; parentRef?: string; requestRef?: string; resultForRef?: string; patchOperation?: string;
  time: { sourceEvent?: string; observed?: string; recorded: string; basis: 'relative-redacted' | 'fixture' };
  preserved: JsonValue; unknown: Record<string, JsonValue>; inheritedFields: string[];
}
export interface TraceSnapshot {
  snapshotId: string; sourceSequence: number; runRef: string; windowRef: string; reset: boolean;
  objectIds: string[]; objects: TraceObjectState[]; normalizedBytes: number; sourceBytes: number; recordCount: number; emittedIds: string[];
}
export interface TraceDelta {
  deltaId: string; fromSnapshotId: string | null; toSnapshotId: string;
  added: string[]; changed: string[]; removed: string[]; repeated: string[]; unchanged: string[];
}
export interface TraceNormalizationReport {
  profile: typeof TRACE_NORMALIZATION_PROFILE; profileVersion: string; sourceFixtureRef: string; sourceDigest: string;
  normalizedDigest: string; records: TraceRecord[]; snapshots: TraceSnapshot[]; deltas: TraceDelta[];
  payloadDictionary: { payloadRef: string; sha256: string; byteLength: number; value: JsonValue }[];
  hoisted: Record<string, JsonValue>;
  loss: { sourceSequence?: number; path: string; action: 'canonicalized' | 'externalized' | 'omitted' | 'preserved-unknown'; reason: string }[];
}
export function isJsonValue(value: unknown): value is JsonValue {
  return value === null || typeof value === 'string' || typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value)) ||
    (Array.isArray(value) ? value.every(isJsonValue) : typeof value === 'object' && Object.values(value).every(isJsonValue));
}
export function canonicalTraceJson(value: unknown): string {
  if (!isJsonValue(value)) throw new Error('Trace contains a non-JSON value.');
  return canonicalizeJson(value);
}
export const traceHash = (bytes: string): string => createHash('sha256').update(bytes).digest('hex');
const text = { type: 'string', minLength: 1 };
const integer = { type: 'integer', minimum: 0 };
const strings = { type: 'array', items: text, uniqueItems: true };
const object = (properties: Record<string, unknown>, required = Object.keys(properties)) => ({ type: 'object', properties, required, additionalProperties: false });
const map = { type: 'object', additionalProperties: true };
const json = { type: ['object', 'array', 'string', 'number', 'boolean', 'null'] };
const state = object({ objectId: text, objectKind: text, stableFields: map, content: { oneOf: [object({ kind: { const: 'inline' }, value: json }), object({ kind: { const: 'dictionary' }, payloadRef: text })] } });
const delta = object({ deltaId: text, fromSnapshotId: { type: ['string', 'null'] }, toSnapshotId: text, added: strings, changed: strings, removed: strings, repeated: strings, unchanged: strings });
const record = object({ recordId: text, framing: { type: 'array', items: { type: 'string' } }, sourceSequence: integer, sourceEventType: text, windowRef: text, runRef: text,
  objectRef: text, parentRef: text, requestRef: text, resultForRef: text, patchOperation: text,
  time: object({ sourceEvent: text, observed: text, recorded: text, basis: { enum: ['relative-redacted', 'fixture'] } }, ['recorded', 'basis']), preserved: json, unknown: map, inheritedFields: strings
}, ['recordId', 'framing', 'sourceSequence', 'sourceEventType', 'windowRef', 'runRef', 'time', 'preserved', 'unknown', 'inheritedFields']);
export const TRACE_NORMALIZATION_SCHEMA = object({ profile: { const: TRACE_NORMALIZATION_PROFILE }, profileVersion: text,
  sourceFixtureRef: text, sourceDigest: { type: 'string', pattern: '^[a-f0-9]{64}$' }, normalizedDigest: { type: 'string', pattern: '^[a-f0-9]{64}$' },
  records: { type: 'array', items: record }, snapshots: { type: 'array', items: object({ snapshotId: text, sourceSequence: integer, runRef: text, windowRef: text, reset: { type: 'boolean' }, objectIds: strings, objects: { type: 'array', items: state }, normalizedBytes: integer, sourceBytes: integer, recordCount: integer, emittedIds: strings }) },
  deltas: { type: 'array', items: delta }, payloadDictionary: { type: 'array', items: object({ payloadRef: text, sha256: text, byteLength: integer, value: json }) }, hoisted: map,
  loss: { type: 'array', items: object({ sourceSequence: integer, path: text, action: { enum: ['canonicalized', 'externalized', 'omitted', 'preserved-unknown'] }, reason: text }, ['path', 'action', 'reason']) }
});
const validate = new Ajv({ strict: false, allErrors: true }).compile<TraceNormalizationReport>(TRACE_NORMALIZATION_SCHEMA);
export function parseTraceNormalization(value: unknown): TraceNormalizationReport {
  if (!validate(value)) throw new Error('Invalid trace.normalization.v1 shape: ' + JSON.stringify(validate.errors));
  const { normalizedDigest, ...body } = value;
  if (traceHash(canonicalTraceJson(body)) !== normalizedDigest) throw new Error('Normalized digest mismatch.');
  if (new Set(value.records.map(r => r.recordId)).size !== value.records.length || value.records.some((r, i) => i > 0 && r.sourceSequence <= value.records[i - 1].sourceSequence)) throw new Error('Non-unique or unordered source records.');
  for (const r of value.records) for (const instant of [r.time.sourceEvent, r.time.observed, r.time.recorded]) {
    if (instant !== undefined && (!Number.isFinite(Date.parse(instant)) || new Date(instant).toISOString() !== instant)) throw new Error('Invalid explicit time.');
  }
  const refs = new Map(value.payloadDictionary.map(p => [p.payloadRef, p]));
  if (refs.size !== value.payloadDictionary.length) throw new Error('Duplicate payload reference.');
  for (const payload of refs.values()) {
    const bytes = canonicalTraceJson(payload.value);
    if (traceHash(bytes) !== payload.sha256 || payload.payloadRef !== `sha256:${payload.sha256}` || Buffer.byteLength(bytes) !== payload.byteLength) throw new Error('Payload identity mismatch.');
  }
  const snapshotIds = new Set(value.snapshots.map(s => s.snapshotId));
  if (snapshotIds.size !== value.snapshots.length) throw new Error('Duplicate snapshot identity.');
  for (const [index, snapshot] of value.snapshots.entries()) {
    const objectIds = snapshot.objects.map(o => o.objectId);
    if (canonicalTraceJson(snapshot.objectIds) !== canonicalTraceJson([...objectIds].sort()) || canonicalTraceJson(objectIds) !== canonicalTraceJson(snapshot.objectIds)) throw new Error('Snapshot membership mismatch.');
    if (index > 0 && snapshot.sourceSequence <= value.snapshots[index - 1].sourceSequence) throw new Error('Unordered snapshots.');
    if (snapshot.emittedIds.some(id => !snapshot.objectIds.includes(id))) throw new Error('Snapshot emission outside membership.');
    const reconstructed = snapshot.objects.map(state => {
      if (state.content.kind === 'inline') return { ...state, content: state.content.value };
      const payload = refs.get(state.content.payloadRef);
      if (!payload) throw new Error('Missing payload reference.');
      return { ...state, content: payload.value };
    });
    if (Buffer.byteLength(canonicalTraceJson(reconstructed)) !== snapshot.normalizedBytes) throw new Error('Snapshot normalizedBytes mismatch.');
  }
  for (const delta of value.deltas) {
    if (!snapshotIds.has(delta.toSnapshotId) || (delta.fromSnapshotId !== null && !snapshotIds.has(delta.fromSnapshotId))) throw new Error('Missing snapshot reference.');
    const dispositions = [...delta.added, ...delta.changed, ...delta.removed, ...delta.repeated, ...delta.unchanged];
    if (new Set(dispositions).size !== dispositions.length) throw new Error('Overlapping delta dispositions.');
  }
  const deltaBySnapshot = new Map(value.deltas.map(d => [d.toSnapshotId, d]));
  if (value.deltas.length !== value.snapshots.length || deltaBySnapshot.size !== value.deltas.length || new Set(value.deltas.map(d => d.deltaId)).size !== value.deltas.length) throw new Error('Delta coverage or identity mismatch.');
  const snapshotsById = new Map(value.snapshots.map(s => [s.snapshotId, s]));
  const lastByRun = new Map<string, TraceSnapshot>();
  for (const [index, snapshot] of value.snapshots.entries()) {
    const delta = deltaBySnapshot.get(snapshot.snapshotId);
    if (!delta) throw new Error('Delta coverage mismatch.');
    const predecessor = lastByRun.get(snapshot.runRef) ?? (snapshot.reset ? value.snapshots[index - 1] : undefined);
    if (delta.fromSnapshotId !== (predecessor?.snapshotId ?? null)) throw new Error('Invalid delta predecessor.');
    const before = new Map((delta.fromSnapshotId === null ? [] : snapshotsById.get(delta.fromSnapshotId)?.objects ?? []).map(state => [state.objectId, state]));
    const after = new Map(snapshot.objects.map(state => [state.objectId, state]));
    const emitted = new Set(snapshot.emittedIds);
    const expected: Pick<TraceDelta, 'added' | 'changed' | 'removed' | 'repeated' | 'unchanged'> = { added: [], changed: [], removed: [], repeated: [], unchanged: [] };
    for (const state of snapshot.objects) {
      const prior = before.get(state.objectId);
      if (!prior) expected.added.push(state.objectId);
      else if (canonicalTraceJson(prior) !== canonicalTraceJson(state)) expected.changed.push(state.objectId);
      else if (emitted.has(state.objectId)) expected.repeated.push(state.objectId);
      else expected.unchanged.push(state.objectId);
    }
    expected.removed = [...before.keys()].filter(id => !after.has(id));
    // Each set must equal the recomputed disposition, covering the full before/after union.
    for (const kind of ['added', 'changed', 'removed', 'repeated', 'unchanged'] satisfies (keyof typeof expected)[]) {
      if (canonicalTraceJson([...delta[kind]].sort()) !== canonicalTraceJson([...expected[kind]].sort())) throw new Error(`Delta disposition mismatch: ${kind}.`);
    }
    lastByRun.set(snapshot.runRef, snapshot);
  }
  for (const record of value.records) for (const field of record.inheritedFields) if (!Object.hasOwn(value.hoisted, field)) throw new Error('Missing hoisted field.');
  return value;
}
