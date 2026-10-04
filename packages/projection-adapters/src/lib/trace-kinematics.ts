import { canonicalTraceJson, parseTraceNormalization, parseTraceKinematics, traceHash, TRACE_KINEMATICS_PROFILE, TRACE_KINEMATICS_CAVEAT,
  type TraceKinematicsMetric, type TraceKinematicsReport, type TraceSnapshot, type TraceRecord, type JsonValue } from '@entif-ai/rosetta-schemas';
const object = (v: JsonValue | undefined): Record<string, JsonValue> | undefined => v && typeof v === 'object' && !Array.isArray(v) ? v : undefined;
const set = (items: string[]) => [...new Set(items)].sort();
const intersection = (a: string[], b: string[]) => a.filter(id => b.includes(id));
const difference = (a: string[], b: string[]) => a.filter(id => !b.includes(id));
/** Observable identity/representation measurements, without semantic interpretation or policy. */
export function measureTraceKinematics(input: unknown): TraceKinematicsReport {
  const trace = parseTraceNormalization(input);
  const seen = new Map<string, Set<string>>(), seenKeys = new Map<string, Set<string>>(), seenSignatures = new Map<string, Set<string>>();
  const snapshotById = new Map(trace.snapshots.map(s => [s.snapshotId, s]));
  const keys = (s?: TraceSnapshot) => set(s?.objects.flatMap(o => Object.keys(o.stableFields).map(k => canonicalTraceJson([o.objectId, k]))) ?? []);
  const signatures = (s?: TraceSnapshot) => set(s?.objects.flatMap(o => {
    const request = object(o.stableFields.metadata)?.request_id;
    return [...(typeof request === 'string' ? [canonicalTraceJson(['request', request])] : []),
      ...(o.objectKind === 'tool' ? [canonicalTraceJson(['tool', o.objectId])] : []),
      ...(o.objectKind === 'tool' && o.stableFields.status === 'finished_successfully' && typeof request === 'string' ? [canonicalTraceJson(['result', request, o.objectId])] : [])];
  }) ?? []);
  const repeats = (records: TraceRecord[], key: (r: TraceRecord) => string | undefined) => {
    const values = records.map(key).filter((s): s is string => s !== undefined); return values.length - new Set(values).size;
  };
  const message = (r: TraceRecord) => { const body = object(r.preserved); return object(body?.message) ?? object(body?.input_message) ?? object(object(body?.v)?.message); };
  const metrics: TraceKinematicsMetric[] = trace.snapshots.map(s => {
    const delta = trace.deltas.find(d => d.toSnapshotId === s.snapshotId);
    if (!delta) throw new Error('Snapshot lacks delta.');
    const previous = delta.fromSnapshotId === null ? undefined : snapshotById.get(delta.fromSnapshotId);
    const survivors = intersection(s.objectIds, previous?.objectIds ?? []);
    const scope = canonicalTraceJson([s.runRef, s.windowRef]);
    const recurrence = (current: string[], before: string[], history: Map<string, Set<string>>) => {
      const seenBefore = history.get(scope) ?? new Set<string>();
      const reappeared = difference(current, before).filter(id => seenBefore.has(id));
      current.forEach(id => seenBefore.add(id)); history.set(scope, seenBefore); return reappeared;
    };
    const currentKeys = keys(s), beforeKeys = keys(previous), currentSignatures = signatures(s), beforeSignatures = signatures(previous);
    const records = trace.records.filter(r => r.runRef === s.runRef && r.windowRef === s.windowRef && r.sourceSequence <= s.sourceSequence);
    const payloads = s.objects.map(o => canonicalTraceJson(o.content.kind === 'inline' ? o.content.value : trace.payloadDictionary.find(p => o.content.kind === 'dictionary' && p.payloadRef === o.content.payloadRef)?.value));
    const representation_shrink = !!previous && s.sourceSequence > previous.sourceSequence && s.objectIds.length < previous.objectIds.length && s.normalizedBytes < previous.normalizedBytes && delta.removed.length > 0;
    return { snapshotId: s.snapshotId, previousSnapshotId: delta.fromSnapshotId, sourceSequence: s.sourceSequence, runRef: s.runRef, windowRef: s.windowRef, reset: s.reset,
      sourceBytes: s.sourceBytes, normalizedBytes: s.normalizedBytes, recordCount: s.recordCount, objectCount: s.objectIds.length, uniqueObjectIds: new Set(s.objectIds).size, duplicatePayloads: payloads.length - new Set(payloads).size,
      deltaCounts: { added: delta.added.length, changed: delta.changed.length, removed: delta.removed.length, repeated: delta.repeated.length, unchanged: delta.unchanged.length },
      survivors, disappeared: delta.removed, reappeared: recurrence(s.objectIds, previous?.objectIds ?? [], seen),
      keys: currentKeys, survivingKeys: intersection(currentKeys, beforeKeys), disappearedKeys: difference(beforeKeys, currentKeys), reappearedKeys: recurrence(currentKeys, beforeKeys, seenKeys),
      signatures: currentSignatures, survivingSignatures: intersection(currentSignatures, beforeSignatures), disappearedSignatures: difference(beforeSignatures, currentSignatures), reappearedSignatures: recurrence(currentSignatures, beforeSignatures, seenSignatures),
      repeatedRequests: repeats(records, r => r.requestRef), repeatedTools: repeats(records, r => object(message(r)?.author)?.role === 'tool' ? r.objectRef : undefined),
      repeatedResults: repeats(records, r => r.resultForRef ? canonicalTraceJson([r.resultForRef, r.objectRef ?? '']) : undefined),
      unchangedResults: repeats(records, r => r.resultForRef ? canonicalTraceJson([r.resultForRef, r.objectRef ?? '', message(r)?.content ?? null]) : undefined),
      objectShrinkRatio: previous ? Math.max(0, 1 - s.objectIds.length / Math.max(1, previous.objectIds.length)) : 0,
      byteShrinkRatio: previous ? Math.max(0, 1 - s.normalizedBytes / Math.max(1, previous.normalizedBytes)) : 0,
      representation_shrink, compaction_candidate: representation_shrink && survivors.length > 0 && !s.reset && previous?.runRef === s.runRef && previous.windowRef === s.windowRef };
  });
  const body = { profile: TRACE_KINEMATICS_PROFILE, profileVersion: '1.0.0', sourceFixtureRef: trace.sourceFixtureRef, sourceDigest: trace.sourceDigest, normalizationProfile: trace.profile, normalizationVersion: trace.profileVersion, normalizedDigest: trace.normalizedDigest, caveat: TRACE_KINEMATICS_CAVEAT, metrics };
  return parseTraceKinematics({ ...body, resultDigest: traceHash(canonicalTraceJson(body)) });
}
