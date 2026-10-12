import { setTimeout as delay } from 'node:timers/promises';
import { FalkorDB, ConstraintType, EntityType, type Graph } from 'falkordb';
import { canonicalTraceJson, parseTraceProjection, traceHash, TRACE_NODE_LABELS, TRACE_EDGE_TYPES, type TraceProjection } from '@entif-ai/rosetta-schemas';

type SchemaRow = { type?: string; label: string; properties: string[]; entitytype: string; status: string; types?: Record<string, string[]> };
const requiredConstraints = [
  ...TRACE_NODE_LABELS.map(label => ({ label, properties: ['id'] })),
  { label: 'SourceArtifact', properties: ['projectionId', 'cid'] },
  { label: 'TracePayload', properties: ['projectionId', 'sha256'] }
];
const requiredIndexes = TRACE_NODE_LABELS.map(label => ({
  label, properties: ['id', ...(label === 'SourceArtifact' ? ['projectionId', 'cid'] : label === 'TracePayload' ? ['projectionId', 'sha256'] : label === 'TraceRecord' ? ['sourceSequence', 'eventType'] : label === 'TraceObject' ? ['objectKind'] : [])]
}));
const sameConstraint = (row: SchemaRow, required: typeof requiredConstraints[number]) =>
  row.type === 'UNIQUE' && row.entitytype === 'NODE' && row.label === required.label &&
  row.properties.length === required.properties.length && required.properties.every(key => row.properties.includes(key));
const queryTimeout = { TIMEOUT: 2000 };

/** Local/private fixture only. Successful proof does not authorize SSPL service promotion. */
export async function createTraceFalkorClient(options: { host: string; port: number; graphName: string }) {
  if (!['127.0.0.1', '::1'].includes(options.host) || !Number.isInteger(options.port) || options.port < 1 || options.port > 65535 ||
      !/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(options.graphName)) throw new Error('Fixture adapter requires a loopback RESP endpoint and bounded graph name.');
  const socket = { host: options.host, port: options.port, connectTimeout: 5000, reconnectStrategy: false as const };
  const database = await FalkorDB.connect({ socket });
  return { database, graph: database.selectGraph(options.graphName) };
}

export async function waitForTraceFalkorConstraints(graph: Pick<Graph, 'roQuery'>, options: { timeoutMs?: number; pollIntervalMs?: number } = {}): Promise<SchemaRow[]> {
  const timeoutMs = options.timeoutMs ?? 10000, pollIntervalMs = options.pollIntervalMs ?? 25;
  if (!Number.isFinite(timeoutMs) || timeoutMs < 0 || !Number.isFinite(pollIntervalMs) || pollIntervalMs < 1) throw new Error('Invalid schema readiness bound.');
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const rows = (await graph.roQuery<SchemaRow>('CALL db.constraints()', queryTimeout)).data ?? [];
    const required = requiredConstraints.map(item => rows.find(row => sameConstraint(row, item)));
    if (required.some(row => row?.status === 'FAILED')) throw new Error('FalkorDB required constraint FAILED.');
    if (required.every(row => row?.status === 'OPERATIONAL')) return rows;
    if (Date.now() >= deadline) throw new Error('FalkorDB constraint readiness timeout; required constraints are not OPERATIONAL.');
    await delay(Math.min(pollIntervalMs, deadline - Date.now()));
  }
}

export async function ensureTraceFalkorSchema(graph: Pick<Graph, 'query' | 'roQuery' | 'constraintCreate'>) {
  // GRAPH.QUERY initializes a missing named graph; GRAPH.RO_QUERY cannot do so.
  let indexes = (await graph.query<SchemaRow>('CALL db.indexes()', queryTimeout)).data ?? [];
  for (const required of requiredIndexes) {
    const missing = required.properties.filter(key => !indexes.some(row => row.entitytype === 'NODE' && row.label === required.label && row.types?.[key]?.includes('RANGE')));
    if (missing.length) await graph.query(`CREATE INDEX FOR (n:${required.label}) ON (${missing.map(key => `n.${key}`).join(', ')})`, queryTimeout);
  }
  const deadline = Date.now() + 10000;
  for (;;) {
    indexes = (await graph.roQuery<SchemaRow>('CALL db.indexes()', queryTimeout)).data ?? [];
    if (requiredIndexes.every(required => required.properties.every(key => indexes.some(row =>
      row.entitytype === 'NODE' && row.label === required.label && row.status === 'OPERATIONAL' && row.types?.[key]?.includes('RANGE'))))) break;
    if (indexes.some(row => row.status === 'FAILED')) throw new Error('FalkorDB index FAILED.');
    if (Date.now() >= deadline) throw new Error('FalkorDB index readiness timeout.');
    await delay(25);
  }
  const existing = (await graph.roQuery<SchemaRow>('CALL db.constraints()', queryTimeout)).data ?? [];
  for (const required of requiredConstraints) {
    if (!existing.some(row => sameConstraint(row, required))) await graph.constraintCreate(ConstraintType.UNIQUE, EntityType.NODE, required.label, ...required.properties);
  }
  return { indexes, constraints: await waitForTraceFalkorConstraints(graph) };
}

export async function importTraceFalkorProjection(graph: Pick<Graph, 'query' | 'roQuery' | 'constraintCreate'>, input: TraceProjection): Promise<void> {
  const projection = parseTraceProjection(input);
  await ensureTraceFalkorSchema(graph);
  // Each RESP query is atomic; a failed batch is incomplete and can be idempotently rebuilt.
  // A successful import is accepted only after exact closure readback by the proving caller.
  for (const label of TRACE_NODE_LABELS) {
    const rows = projection.nodes.filter(n => n.label === label).map(n => ({ id: n.id, properties: { ...n.properties, traceLabel: n.label } }));
    if (rows.length) await graph.query(`UNWIND $rows AS row MERGE (n:TraceProjectionNode:${label} {id:row.id}) SET n = row.properties`, { ...queryTimeout, params: { rows } });
  }
  for (const type of TRACE_EDGE_TYPES) {
    const rows = projection.edges.filter(e => e.type === type).map(e => ({ ...e }));
    if (rows.length) await graph.query(`UNWIND $rows AS row MATCH (a:TraceProjectionNode {id:row.from}), (b:TraceProjectionNode {id:row.to}) MERGE (a)-[r:${type}]->(b) SET r = row.properties`, { ...queryTimeout, params: { rows } });
  }
}

export async function resetTraceFalkorProjection(graph: Pick<Graph, 'query'>, projectionId: string): Promise<void> {
  if (!projectionId.trim()) throw new Error('Scoped reset requires projectionId.');
  const options = { ...queryTimeout, params: { projectionId } };
  const foreign = (await graph.query<{ count: number }>('MATCH (n:TraceProjectionNode {projectionId:$projectionId})-[r]-() WHERE r.projectionId IS NULL OR r.projectionId <> $projectionId RETURN count(r) AS count', options)).data;
  if (!foreign || foreign.length !== 1 || foreign[0].count !== 0) throw new Error('Scoped reset refuses foreign relationships.');
  // DELETE also refuses a foreign relationship introduced after the check.
  await graph.query('MATCH (n:TraceProjectionNode {projectionId:$projectionId}) OPTIONAL MATCH (n)-[r {projectionId:$projectionId}]-() DELETE r,n', options);
}

export async function exportTraceFalkorProjection(graph: Pick<Graph, 'roQuery'>, expected: TraceProjection): Promise<TraceProjection> {
  parseTraceProjection(expected);
  const params = { projectionId: expected.projectionId };
  const n = await graph.roQuery<{ label: string; id: string; properties: Record<string, unknown> }>('MATCH (n:TraceProjectionNode {projectionId:$projectionId}) RETURN n.traceLabel AS label,n.id AS id,properties(n) AS properties', { ...queryTimeout, params });
  const e = await graph.roQuery<{ type: string; from: string; to: string; properties: Record<string, unknown> }>('MATCH (a:TraceProjectionNode {projectionId:$projectionId})-[r]->(b:TraceProjectionNode {projectionId:$projectionId}) RETURN type(r) AS type,a.id AS from,b.id AS to,properties(r) AS properties', { ...queryTimeout, params });
  const nodes = (n.data ?? []).map(row => ({ ...row, properties: Object.fromEntries(Object.entries(row.properties).filter(([key]) => key !== 'traceLabel')) }));
  const sort = (a: unknown, b: unknown) => canonicalTraceJson(a) < canonicalTraceJson(b) ? -1 : canonicalTraceJson(a) > canonicalTraceJson(b) ? 1 : 0;
  const body = { profile: expected.profile, projectionId: expected.projectionId, normalizedDigest: expected.normalizedDigest, sourceDigest: expected.sourceDigest, nodes: nodes.sort(sort), edges: (e.data ?? []).sort(sort) };
  return parseTraceProjection({ ...body, closureDigest: traceHash(canonicalTraceJson(body)) });
}
