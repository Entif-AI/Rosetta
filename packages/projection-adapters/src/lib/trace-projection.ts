import { canonicalTraceJson, parseTraceNormalization, parseTraceProjection, traceHash, type TraceProjection, type TraceGraphNode, type TraceGraphEdge, type TraceProperty } from '@entif-ai/rosetta-schemas';
export function buildTraceProjection(input: unknown, options: { projectionId: string; sourceArtifactCid: string }): TraceProjection {
  const trace = parseTraceNormalization(input);
  if (!options.projectionId.trim() || !options.sourceArtifactCid.trim()) throw new Error('Projection and source identity required.');
  const provenance = { projectionId: options.projectionId, sourceDigest: trace.sourceDigest, normalizedDigest: trace.normalizedDigest };
  const nodes = new Map<string, TraceGraphNode>(), edges = new Map<string, TraceGraphEdge>();
  const identity = (...parts: string[]) => [options.projectionId, ...parts].map(encodeURIComponent).join(':');
  const node = (label: TraceGraphNode['label'], parts: string[], properties: Record<string, TraceProperty> = {}) => {
    const id = identity(label, ...parts), old = nodes.get(id);
    nodes.set(id, { label, id, properties: { ...old?.properties, ...properties, ...provenance, id } }); return id;
  };
  const edge = (type: TraceGraphEdge['type'], from: string, to: string, properties: Record<string, TraceProperty> = {}) => {
    edges.set(`${from}|${type}|${to}`, { type, from, to, properties: { ...properties, ...provenance } });
  };
  const source = node('SourceArtifact', [options.sourceArtifactCid], { cid: options.sourceArtifactCid, kind: 'source.manifestation' });
  const normalized = node('NormalizedTrace', [trace.normalizedDigest], { profile: trace.profile, profileVersion: trace.profileVersion, sourceFixtureRef: trace.sourceFixtureRef });
  edge('DERIVED_FROM', normalized, source);
  const object = (run: string, id: string, properties: Record<string, TraceProperty> = {}) => node('TraceObject', [run, id], { objectId: id, runRef: run, ...properties });
  const window = (run: string, windowRef: string) => {
    const r = node('TraceRun', [run], { runRef: run });
    const w = node('TraceWindow', [run, windowRef], { windowRef }); edge('HAS_WINDOW', r, w); return w;
  };
  for (const payload of trace.payloadDictionary) node('TracePayload', [payload.sha256], { sha256: payload.sha256, byteLength: payload.byteLength, valueJson: canonicalTraceJson(payload.value) });
  for (const [index, snapshot] of trace.snapshots.entries()) {
    const s = node('TraceSnapshot', [snapshot.snapshotId], { snapshotId: snapshot.snapshotId, index, sourceSequence: snapshot.sourceSequence, normalizedBytes: snapshot.normalizedBytes, sourceBytes: snapshot.sourceBytes, recordCount: snapshot.recordCount, reset: snapshot.reset, runRef: snapshot.runRef, windowRef: snapshot.windowRef });
    window(snapshot.runRef, snapshot.windowRef);
    for (const state of snapshot.objects) {
      const o = object(snapshot.runRef, state.objectId, { objectKind: state.objectKind, referenceOnly: false });
      edge('CONTAINS', s, o, { stateJson: canonicalTraceJson(state) });
      if (state.content.kind === 'dictionary') {
        const p = trace.payloadDictionary.find(p => p.payloadRef === (state.content.kind === 'dictionary' ? state.content.payloadRef : ''));
        if (p) edge('PAYLOAD_REF', o, identity('TracePayload', p.sha256));
      }
    }
  }
  for (const record of trace.records) {
    const r = node('TraceRecord', [record.recordId], { recordId: record.recordId, sourceSequence: record.sourceSequence, eventType: record.sourceEventType,
      runRef: record.runRef, windowRef: record.windowRef, recordedTime: record.time.recorded, ...(record.time.sourceEvent ? { sourceEventTime: record.time.sourceEvent } : {}), ...(record.time.observed ? { observedTime: record.time.observed } : {}),
      timeBasis: record.time.basis, preservedJson: canonicalTraceJson(record.preserved), unknownJson: canonicalTraceJson(record.unknown), framingJson: canonicalTraceJson(record.framing), inheritedFieldsJson: canonicalTraceJson(record.inheritedFields),
      ...(record.patchOperation ? { patchOperation: record.patchOperation } : {}) });
    edge('HAS_RECORD', window(record.runRef, record.windowRef), r);
    if (record.objectRef) edge('MATERIALIZES', r, object(record.runRef, record.objectRef));
    if (record.parentRef) edge('PARENT_REF', r, object(record.runRef, record.parentRef, { referenceOnly: !trace.snapshots.some(s => s.runRef === record.runRef && s.objectIds.includes(record.parentRef ?? '')) }));
    if (record.requestRef) edge('REQUEST_REF', r, object(record.runRef, record.requestRef, { objectKind: 'request-correlation', referenceOnly: true }));
    if (record.resultForRef) edge('RESULT_FOR', r, object(record.runRef, record.resultForRef, { objectKind: 'request-correlation', referenceOnly: true }));
  }
  for (const delta of trace.deltas) {
    const after = trace.snapshots.find(s => s.snapshotId === delta.toSnapshotId);
    const before = trace.snapshots.find(s => s.snapshotId === delta.fromSnapshotId);
    if (!after) throw new Error('Missing delta target.');
    const t = node('TraceTransition', [delta.deltaId], { deltaId: delta.deltaId, fromSnapshotId: delta.fromSnapshotId ?? '', toSnapshotId: delta.toSnapshotId });
    if (before) edge('FROM', t, identity('TraceSnapshot', before.snapshotId));
    edge('TO', t, identity('TraceSnapshot', after.snapshotId));
    for (const [type, ids] of [['ADDED', delta.added], ['CHANGED', delta.changed], ['REMOVED', delta.removed], ['REPEATED', delta.repeated], ['UNCHANGED', delta.unchanged]] satisfies [TraceGraphEdge['type'], string[]][]) {
      for (const id of ids) edge(type, t, object(type === 'REMOVED' ? before?.runRef ?? after.runRef : after.runRef, id));
    }
  }
  const byJson = <T>(a: T, b: T) => canonicalTraceJson(a) < canonicalTraceJson(b) ? -1 : canonicalTraceJson(a) > canonicalTraceJson(b) ? 1 : 0;
  const body = { profile: 'trace.projection.v1', ...provenance, nodes: [...nodes.values()].sort(byJson), edges: [...edges.values()].sort(byJson) };
  return parseTraceProjection({ ...body, closureDigest: traceHash(canonicalTraceJson(body)) });
}

