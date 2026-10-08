import assert from 'node:assert/strict';
import process from 'node:process';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { normalizeBoundaryTrace } from '../../packages/ingress-refinery/dist/index.js';
import { buildTraceProjection, createTraceFalkorClient, importTraceFalkorProjection,
  exportTraceFalkorProjection, resetTraceFalkorProjection } from '../../packages/projection-adapters/dist/index.js';
import { canonicalTraceJson } from '../../packages/rosetta-schemas/dist/index.js';
import { SERVICES } from '../compute/contract.mjs';
import { proofOutputPath } from '../trace-graph/proof-output.mjs';
import { writeBoundaryAdmission } from './spool.mjs';

if (process.env.TRACE_GRAPH_ISOLATED !== 'true') throw new Error('Declare ownership of an isolated fixture runtime.');
const output = proofOutputPath('.axi/trace-live-proof.json'), graphName = 'entif_trace_1685', service = SERVICES.operational;
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const fixturePath = 'tools/trace-live/fixtures/correlated-action.jsonl', raw = readFileSync(fixturePath, 'utf8'), sourceDigest = digest(raw);
const image = JSON.parse(execFileSync('docker', ['inspect', service.container], { encoding: 'utf8' }))[0];
assert.equal(image.Config.Image, service.image); assert.equal(image.Config.Labels['entif.issue'], service.issue);
assert.ok(image.State.Running);
const bindings = image.NetworkSettings.Ports['6379/tcp'];
assert.ok(bindings.length && bindings.every(b => b.HostIp === '127.0.0.1' && Number(b.HostPort) === service.port));
const modules = JSON.parse(execFileSync('docker', ['exec', service.container, 'redis-cli', '--json', 'MODULE', 'LIST'], { encoding: 'utf8' }));
assert.ok(modules.some(module => module.name === 'graph' && module.ver === service.moduleVersion));
const admission = normalizeBoundaryTrace(raw, { maturity: 'fixture', recordedAt: '2000-01-01T00:00:00.000Z' });
assert.deepEqual(normalizeBoundaryTrace(raw, { maturity: 'fixture', recordedAt: '2000-01-01T00:00:00.000Z' }), admission);
assert.equal(admission.source.profiles.length, 3);
assert.equal(admission.report.retainedEvents, 9); assert.equal(admission.report.duplicateEvents, 1);
assert.equal(admission.report.omittedEvents, 2); assert.equal(admission.report.unresolvedEvents, 1);
assert.equal(admission.localEvidence.payloads.length, 1);
assert.ok(!/AUTH_FIXTURE|COOKIE_FIXTURE|PRIVATE_BODY_FIXTURE|\/Users\//.test(canonicalTraceJson({ source: admission.source, normalization: admission.normalization })));
writeBoundaryAdmission(admission, path.join(path.dirname(output), 'trace-live'));
const projection = buildTraceProjection(admission.normalization, { projectionId: 'trace-live-fixture-v1', sourceArtifactCid: admission.source.derived.cid });
const { database, graph } = await createTraceFalkorClient({ host: '127.0.0.1', port: service.port, graphName });
let owned = false;
try {
  assert.ok(!(await database.list()).includes(graphName), 'Existing scratch graph must be preserved.');
  owned = true;
  await importTraceFalkorProjection(graph, projection);
  assert.deepEqual(await exportTraceFalkorProjection(graph, projection), projection);
  await importTraceFalkorProjection(graph, projection);
  assert.deepEqual(await exportTraceFalkorProjection(graph, projection), projection);
  const params = { projectionId: projection.projectionId };
  const records = (await graph.roQuery('MATCH (r:TraceRecord {projectionId:$projectionId}) RETURN r.sourceSequence AS sourceSequence,r.eventType AS eventType,r.preservedJson AS preservedJson ORDER BY r.sourceSequence', { params, TIMEOUT: 2000 })).data;
  assert.deepEqual(records, admission.normalization.records.map(record => ({ sourceSequence: record.sourceSequence,
    eventType: record.sourceEventType, preservedJson: canonicalTraceJson(record.preserved) })));
  const joins = (await graph.roQuery('MATCH (r:TraceRecord {projectionId:$projectionId})-[:REQUEST_REF]->(q) RETURN q.objectId AS requestRef,count(r) AS records', { params, TIMEOUT: 2000 })).data;
  assert.deepEqual(joins, [{ requestRef: admission.normalization.records[0].requestRef, records: 8 }]);
  const resultJoins = (await graph.roQuery('MATCH (r:TraceRecord {projectionId:$projectionId})-[:RESULT_FOR]->(q) RETURN q.objectId AS requestRef,count(r) AS results', { params, TIMEOUT: 2000 })).data;
  assert.deepEqual(resultJoins, [{ requestRef: admission.normalization.records[0].requestRef, results: 1 }]);
  await resetTraceFalkorProjection(graph, projection.projectionId);
  assert.equal((await exportTraceFalkorProjection(graph, projection)).nodes.length, 0);
  await importTraceFalkorProjection(graph, projection);
  assert.deepEqual(await exportTraceFalkorProjection(graph, projection), projection);
  await graph.delete(); owned = false;
  assert.ok(!(await database.list()).includes(graphName));
  assert.equal(digest(readFileSync(fixturePath)), sourceDigest);
  const proof = { profile: 'trace-live-falkordb-fixture-proof-v1', observedAt: new Date().toISOString(),
    revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), maturity: 'fixture',
    liveSourceAcceptance: false, endToEndAcceptance: false,
    backend: { hostRef: 'host:m3-ultra', version: '6.0.1', image: service.image, moduleVersion: service.moduleVersion, graphName },
    sourceDigest, sourceManifestationCid: admission.source.derived.cid, normalizedDigest: admission.normalization.normalizedDigest,
    closureDigest: projection.closureDigest, nodes: projection.nodes.length, edges: projection.edges.length,
    fixtureJoinedStages: ['user-request', 'mcp-request', 'tool-call', 'device-action', 'device-observation', 'mcp-result', 'receipt'],
    queryResults: { records, joins, resultJoins }, reduction: admission.report,
    idempotent: true, rebuilt: true, dropped: true, sourcePreserved: true,
    prerequisites: ['#1688 donor extraction', '#1673 tunnel producer', '#1674 MCP lifecycle producer', '#1676 Mac navigation producer'],
  };
  const bytes = canonicalTraceJson(proof) + '\n'; writeFileSync(output, bytes, { flag: 'wx', mode: 0o600 });
  process.stdout.write(JSON.stringify({ status: 'ok', proof: output, sha256: digest(bytes), maturity: 'fixture',
    liveSourceAcceptance: false, endToEndAcceptance: false, idempotent: true, rebuilt: true, dropped: true }) + '\n');
} finally {
  try { if (owned && (await database.list()).includes(graphName)) await graph.delete(); }
  finally { await database.close(); }
}
