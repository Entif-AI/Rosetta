import { driver, auth, type Driver } from 'neo4j-driver';
import { canonicalTraceJson, parseTraceProjection, traceHash, TRACE_NODE_LABELS, TRACE_EDGE_TYPES, type TraceProjection } from '@entif-ai/rosetta-schemas';
export { buildTraceProjection } from './trace-projection.js';

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
