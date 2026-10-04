import { canonicalTraceJson, isJsonValue, parseTraceNormalization, traceHash, TRACE_NORMALIZATION_PROFILE,
  type TraceNormalizationReport, type TraceObjectState, type TraceRecord, type TraceSnapshot, type TraceDelta, type TraceContent } from '@entif-ai/rosetta-schemas';
import type { JsonValue } from '@entif-ai/rosetta-canon';
const object = (v: JsonValue | undefined): { [key: string]: JsonValue } | undefined => v && typeof v === 'object' && !Array.isArray(v) ? v : undefined;
const text = (v: JsonValue | undefined): string | undefined => typeof v === 'string' ? v : undefined;
export interface TraceNormalizerOptions { sourceFixtureRef: string; recordedAt: string; observedAt?: string; profileVersion?: string }

/** Complete source message emissions and declared fixture snapshots are materialization boundaries, never hidden model snapshots. */
export function normalizeTrace(raw: string, options: TraceNormalizerOptions): TraceNormalizationReport {
  const records: TraceRecord[] = [], snapshots: TraceSnapshot[] = [], deltas: TraceDelta[] = [];
  const payloads = new Map<string, TraceNormalizationReport['payloadDictionary'][number]>();
  const loss: TraceNormalizationReport['loss'] = [];
  const statesByRun = new Map<string, Map<string, TraceObjectState>>();
  const lastByRun = new Map<string, TraceSnapshot>();
  let sourceBytes = 0;
  const storeContent = (value: JsonValue, sequence: number): TraceContent => {
    const canonical = canonicalTraceJson(value);
    if (Buffer.byteLength(canonical) < 256) return { kind: 'inline', value };
    const sha256 = traceHash(canonical), payloadRef = `sha256:${sha256}`;
    payloads.set(payloadRef, { payloadRef, sha256, byteLength: Buffer.byteLength(canonical), value });
    loss.push({ sourceSequence: sequence, path: 'object.content', action: 'externalized', reason: 'Exact canonical payload >=256 bytes; dictionary retains reconstructable value.' });
    return { kind: 'dictionary', payloadRef };
  };
  const materialize = (v: { [key: string]: JsonValue }, sequence: number): TraceObjectState => {
    const id = text(v.id);
    if (!id) throw new Error('Declared snapshot object lacks explicit identity.');
    const content = v.content ?? null;
    const stableFields = { ...v }; delete stableFields.content; delete stableFields.id; delete stableFields.kind;
    return { objectId: id, objectKind: text(v.kind) ?? text(object(v.author)?.role) ?? 'message', stableFields, content: storeContent(content, sequence) };
  };
  const stateBytes = (states: TraceObjectState[]): number => Buffer.byteLength(canonicalTraceJson(states.map(s => ({ ...s, content: s.content.kind === 'inline' ? s.content.value : payloads.get(s.content.payloadRef)?.value }))));
  for (const [index, frame] of raw.replace(/\r\n/g, '\n').split(/\n\n+/).filter(x => x.trim()).entries()) {
    sourceBytes += Buffer.byteLength(frame + '\n\n');
    const lines = frame.split('\n');
    const data = lines.filter(x => x.startsWith('data:')).map(x => x.slice(5).trimStart()).join('\n');
    let parsed: JsonValue = null;
    const unknown: Record<string, JsonValue> = {};
    try { const v: unknown = JSON.parse(data); if (!isJsonValue(v)) throw new Error(); parsed = v; }
    catch { unknown.data = data; loss.push({ sourceSequence: index, path: 'data', action: 'preserved-unknown', reason: 'Malformed or unsupported JSON; no inferred structure.' }); }
    const outer = object(parsed);
    const sourceSequence = typeof outer?.source_sequence === 'number' ? outer.source_sequence : index;
    const captured = outer && Object.hasOwn(outer, 'captured') ? outer.captured : parsed;
    const body = object(captured);
    const message = object(body?.message) ?? object(body?.input_message) ?? object(object(body?.v)?.message);
    const generated = body?.type === 'trace_snapshot';
    const metadata = object(message?.metadata);
    const runRef = text(body?.run_id) ?? text(body?.conversation_id) ?? text(object(body?.v)?.conversation_id) ?? 'unscoped-run';
    const windowRef = text(body?.window_id) ?? options.sourceFixtureRef;
    const sourceEvent = text(body?.source_event_time) ?? text(message?.create_time);
    const requestRef = text(metadata?.request_id) ?? text(message?.request_id);
    const parentRef = text(metadata?.parent_id);
    const objectRef = text(message?.id);
    const record: TraceRecord = { recordId: `${options.sourceFixtureRef}:record:${sourceSequence}`, sourceSequence, framing: lines.filter(x => !x.startsWith('data:')),
      sourceEventType: text(body?.type) ?? (message ? 'message' : text(captured) ?? 'unknown'), runRef, windowRef,
      time: { recorded: options.recordedAt, basis: generated ? 'fixture' : 'relative-redacted', ...(sourceEvent ? { sourceEvent } : {}), ...(options.observedAt ? { observed: options.observedAt } : {}) },
      preserved: captured, unknown, inheritedFields: [], ...(objectRef ? { objectRef } : {}), ...(parentRef ? { parentRef } : {}), ...(requestRef ? { requestRef } : {}), ...(text(body?.o) ? { patchOperation: text(body?.o) } : {}) };
    if (requestRef && object(message?.author)?.role === 'tool' && message?.status === 'finished_successfully') record.resultForRef = requestRef;
    records.push(record);
    loss.push({ sourceSequence, path: 'data', action: 'canonicalized', reason: 'Shared RFC8785_JCS serialization; source fixture bytes remain authoritative.' });
    if (!body || (!generated && !message)) {
      loss.push({ sourceSequence, path: 'data', action: 'preserved-unknown', reason: 'Transport/partial event retained; no complete object materialization claimed.' });
      continue;
    }
    let states = statesByRun.get(runRef) ?? new Map<string, TraceObjectState>();
    let emittedIds: string[] = [];
    if (generated) {
      if (!Array.isArray(body.objects)) throw new Error('Declared snapshot lacks objects.');
      states = new Map();
      for (const v of body.objects) { const obj = object(v); if (!obj) throw new Error('Malformed snapshot object.'); const state = materialize(obj, sourceSequence); if (states.has(state.objectId)) throw new Error('Duplicate source object identity.'); states.set(state.objectId, state); }
      if (!Array.isArray(body.emitted_ids) || body.emitted_ids.some(x => typeof x !== 'string')) throw new Error('Snapshot lacks explicit emission set.');
      emittedIds = body.emitted_ids.filter((x): x is string => typeof x === 'string').sort();
      record.preserved = { ...body, objects: [...states.values()].map(s => ({ id: s.objectId, kind: s.objectKind, stableFields: s.stableFields, content: s.content })) };
    } else if (message) {
      const state = materialize(message, sourceSequence); states.set(state.objectId, state); emittedIds = [state.objectId];
    }
    statesByRun.set(runRef, states);
    const sorted = [...states.values()].sort((a, b) => a.objectId < b.objectId ? -1 : a.objectId > b.objectId ? 1 : 0);
    const snapshot: TraceSnapshot = { snapshotId: `${options.sourceFixtureRef}:snapshot:${snapshots.length}`, sourceSequence, runRef, windowRef, reset: body.reset === true,
      objectIds: sorted.map(s => s.objectId), objects: sorted, normalizedBytes: stateBytes(sorted), sourceBytes, recordCount: records.length, emittedIds };
    const previous = lastByRun.get(runRef) ?? (snapshot.reset ? snapshots.at(-1) : undefined);
    const before = new Map(previous?.objects.map(s => [s.objectId, s]) ?? []);
    const delta: TraceDelta = { deltaId: `${options.sourceFixtureRef}:delta:${snapshots.length}`, fromSnapshotId: previous?.snapshotId ?? null, toSnapshotId: snapshot.snapshotId, added: [], changed: [], removed: [], repeated: [], unchanged: [] };
    for (const state of sorted) {
      const prior = before.get(state.objectId);
      if (!prior) delta.added.push(state.objectId);
      else if (canonicalTraceJson(prior) !== canonicalTraceJson(state)) delta.changed.push(state.objectId);
      else if (emittedIds.includes(state.objectId)) delta.repeated.push(state.objectId);
      else delta.unchanged.push(state.objectId);
    }
    delta.removed = [...before.keys()].filter(id => !states.has(id)).sort();
    snapshots.push(snapshot); deltas.push(delta); lastByRun.set(runRef, snapshot);
  }
  const hoisted: Record<string, JsonValue> = {};
  // Hoist only a proven invariant; each inheriting record identifies its exact scope.
  const scoped = records.map(r => ({ record: r, fields: object(r.preserved) })).filter(x => typeof x.fields?.conversation_id === 'string');
  const first = scoped[0]?.fields?.conversation_id;
  if (first && scoped.every(x => x.fields?.conversation_id === first)) {
    hoisted.conversation_id = first;
    for (const { record, fields } of scoped) { if (fields) { const rest = { ...fields }; delete rest.conversation_id; record.preserved = rest; record.inheritedFields = ['conversation_id']; } }
  }
  const body = { profile: TRACE_NORMALIZATION_PROFILE, profileVersion: options.profileVersion ?? 'trace-norm-v1', sourceFixtureRef: options.sourceFixtureRef,
    sourceDigest: traceHash(raw), records, snapshots, deltas, payloadDictionary: [...payloads.values()].sort((a, b) => a.payloadRef < b.payloadRef ? -1 : 1), hoisted, loss };
  return parseTraceNormalization({ ...body, normalizedDigest: traceHash(canonicalTraceJson(body)) });
}
