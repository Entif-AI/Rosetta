import { driver, auth, type Driver } from 'neo4j-driver';
import { canonicalTraceJson, parseTraceNormalization, parseTraceProjection, traceHash, TRACE_NODE_LABELS, TRACE_EDGE_TYPES,
  type TraceProjection, type TraceGraphNode, type TraceGraphEdge, type TraceProperty } from '@entif-ai/rosetta-schemas';
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

export function createTraceNeo4jDriver(options: { uri: string; user: string; password: string }): Driver {
  if (!/^bolt:\/\/127\.0\.0\.1:\d+$/.test(options.uri)) throw new Error('Fixture adapter requires a loopback Bolt endpoint.');
  return driver(options.uri, auth.basic(options.user, options.password), { disableLosslessIntegers: true });
}
export async function importTraceProjection(database: Driver, projection: TraceProjection): Promise<void> {
  parseTraceProjection(projection);
  const session = database.session({ database: 'neo4j' });
  try {
    for (const label of TRACE_NODE_LABELS) await session.run(`CREATE CONSTRAINT trace_${label}_id IF NOT EXISTS FOR (n:${label}) REQUIRE n.id IS UNIQUE`);
    for (const [label, key] of [['SourceArtifact', 'cid'], ['TracePayload', 'sha256']]) await session.run(`CREATE CONSTRAINT trace_${label}_${key} IF NOT EXISTS FOR (n:${label}) REQUIRE (n.projectionId, n.${key}) IS UNIQUE`);
    await session.run('CREATE INDEX trace_record_sequence IF NOT EXISTS FOR (n:TraceRecord) ON (n.sourceSequence)');
    await session.run('CREATE INDEX trace_record_event IF NOT EXISTS FOR (n:TraceRecord) ON (n.eventType)');
    await session.run('CREATE INDEX trace_object_kind IF NOT EXISTS FOR (n:TraceObject) ON (n.objectKind)');
    await session.executeWrite(async tx => {
      for (const label of TRACE_NODE_LABELS) {
        const rows = projection.nodes.filter(n => n.label === label).map(n => ({ id: n.id, properties: { ...n.properties, traceLabel: n.label } }));
        await tx.run(`UNWIND $rows AS row MERGE (n:TraceProjectionNode:${label} {id:row.id}) SET n = row.properties`, { rows });
      }
      for (const type of TRACE_EDGE_TYPES) await tx.run(`UNWIND $rows AS row MATCH (a:TraceProjectionNode {id:row.from}), (b:TraceProjectionNode {id:row.to}) MERGE (a)-[r:${type}]->(b) SET r = row.properties`, { rows: projection.edges.filter(e => e.type === type) });
    });
  } finally { await session.close(); }
}
export async function resetTraceProjection(database: Driver, projectionId: string): Promise<void> {
  if (!projectionId.trim()) throw new Error('Scoped reset requires projectionId.');
  const session = database.session({ database: 'neo4j' });
  try { await session.executeWrite(tx => tx.run('MATCH (n:TraceProjectionNode {projectionId:$projectionId}) DETACH DELETE n', { projectionId })); }
  finally { await session.close(); }
}
export async function exportTraceProjection(database: Driver, expected: TraceProjection): Promise<TraceProjection> {
  const session = database.session({ database: 'neo4j' });
  try {
    const n = await session.run('MATCH (n:TraceProjectionNode {projectionId:$projectionId}) RETURN n.traceLabel AS label,n.id AS id,properties(n) AS properties', { projectionId: expected.projectionId });
    const e = await session.run('MATCH (a:TraceProjectionNode {projectionId:$projectionId})-[r]->(b:TraceProjectionNode {projectionId:$projectionId}) RETURN type(r) AS type,a.id AS from,b.id AS to,properties(r) AS properties', { projectionId: expected.projectionId });
    const nodes = n.records.map(r => { const rawProperties: unknown = r.get('properties');
      if (!rawProperties || typeof rawProperties !== 'object' || Array.isArray(rawProperties)) throw new Error('Invalid database property map.');
      const properties = Object.fromEntries(Object.entries(rawProperties).filter(([key]) => key !== 'traceLabel'));  return { label: r.get('label'), id: r.get('id'), properties }; });
    const edges = e.records.map(r => ({ type: r.get('type'), from: r.get('from'), to: r.get('to'), properties: r.get('properties') }));
    const sort = (a: unknown, b: unknown) => canonicalTraceJson(a) < canonicalTraceJson(b) ? -1 : canonicalTraceJson(a) > canonicalTraceJson(b) ? 1 : 0;
    const body = { profile: expected.profile, projectionId: expected.projectionId, normalizedDigest: expected.normalizedDigest, sourceDigest: expected.sourceDigest, nodes: nodes.sort(sort), edges: edges.sort(sort) };
    return parseTraceProjection({ ...body, closureDigest: traceHash(canonicalTraceJson(body)) });
  } finally { await session.close(); }
}
