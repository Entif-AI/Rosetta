#!/usr/bin/env node
/* global console, process */
import { readFile } from 'node:fs/promises';
import { normalizeAgentStreamSource } from '../../packages/ingress-refinery/dist/index.js';
import { executeFixtureCypher, importAgentTraceProjection, planAgentTraceProjection, resetAgentTraceProjection } from '../../packages/projection-adapters/dist/index.js';

const root = new URL('../../packages/source-substrate/src/fixtures/', import.meta.url);
const bytes = await readFile(new URL('agent-stream-synthetic.ndjson', root));
const manifest = JSON.parse(await readFile(new URL('agent-stream-synthetic.manifest.json', root), 'utf8'));
const normalized = normalizeAgentStreamSource(manifest, bytes);
const plan = planAgentTraceProjection(normalized);
const endpoint = process.env.AKASHA_NEO4J_ENDPOINT ?? 'http://127.0.0.1:17474';
const parameters = { projectionId: plan.projectionId };
if (process.argv.includes('--reset')) {
  await resetAgentTraceProjection(endpoint, plan.projectionId);
  console.log(JSON.stringify({ projectionId: plan.projectionId, reset: true }));
} else {
  await importAgentTraceProjection(endpoint, plan, process.argv.includes('--rebuild'));
  const queries = {
    version: 'CALL dbms.components() YIELD versions,edition RETURN versions,edition',
    nodes: 'MATCH (n:AkashaTrace {projectionId:$projectionId}) RETURN n.kind,count(n) ORDER BY n.kind',
    edges: 'MATCH ()-[r:TRACE_EDGE {projectionId:$projectionId}]->() RETURN r.kind,count(r) ORDER BY r.kind',
    snapshots: 'MATCH (s:AkashaTrace {projectionId:$projectionId,kind:"snapshot"}) RETURN s.sourceId,s.occurrenceCount,s.uniqueObjectCount ORDER BY s.recordLine',
    lineage: 'MATCH (e:AkashaTrace {projectionId:$projectionId,kind:"event"})-[:TRACE_EDGE {kind:"DERIVED_FROM"}]->(v)-[:TRACE_EDGE {kind:"NORMALIZED_FROM"}]->(s) RETURN count(DISTINCT e),collect(DISTINCT s.sourceId)',
    lifecycle: 'MATCH (s:AkashaTrace {projectionId:$projectionId,kind:"snapshot"})-[r:TRACE_EDGE]->(o) WHERE r.kind IN ["ADDED","CHANGED","REMOVED","UNCHANGED"] RETURN s.sourceId,r.kind,collect(o.sourceId) ORDER BY s.sourceId,r.kind'
  };
  const results = await executeFixtureCypher(endpoint, Object.values(queries).map((statement) => ({ statement, parameters })));
  console.log(JSON.stringify({ profile: plan.profile, projectionId: plan.projectionId, planSha256: plan.sha256, sourceSha256: normalized.source.sourceSha256, normalizedSha256: normalized.sha256, queries: Object.fromEntries(Object.keys(queries).map((name, index) => [name, { statement: queries[name], columns: results.results[index].columns, rows: results.results[index].data.map(({ row }) => row) }])) }, null, 2));
}
