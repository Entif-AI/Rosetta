import process from 'node:process';
import { proofOutputPath } from './proof-output.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { buildTraceProjection, createTraceFalkorClient, importTraceFalkorProjection, resetTraceFalkorProjection, exportTraceFalkorProjection, ensureTraceFalkorSchema, measureTraceKinematics } from '../../packages/projection-adapters/dist/index.js';
import { canonicalTraceJson } from '../../packages/rosetta-schemas/dist/index.js';
import { createSourceRecordTile, createSourceManifestationTile } from '../../packages/source-substrate/dist/index.js';
import { InMemoryTileStore } from '../../packages/rosetta-store/dist/index.js';

if (process.env.TRACE_GRAPH_ISOLATED !== 'true') throw new Error('Declare ownership of an isolated local fixture runtime before proof/reset/drop.');
const proofPath = proofOutputPath('tools/trace-graph/evidence/falkordb-proof.json');
const graphName = process.env.TRACE_FALKORDB_GRAPH ?? 'entif_trace_1735';
const container = process.env.TRACE_FALKORDB_CONTAINER ?? 'entif-falkor-1735';
const config = { host: '127.0.0.1', port: Number(process.env.TRACE_FALKORDB_PORT ?? '16379'), graphName };
const image = JSON.parse(execFileSync('docker', ['inspect', container], { encoding: 'utf8' }))[0];
assert.equal(image.Config.Labels['entif.issue'], '1735');
const expectedImage = 'falkordb/falkordb:6.0.1@sha256:e2765e207e5ba4ee90e47ed31eb7491ad6dd3d42241c326e429375c02ad9882f';
assert.equal(image.Config.Image, expectedImage);
assert.ok(image.NetworkSettings.Ports['6379/tcp'].some(binding => binding.HostIp === config.host && Number(binding.HostPort) === config.port));
const modules = JSON.parse(execFileSync('docker', ['exec', container, 'redis-cli', '--json', 'MODULE', 'LIST'], { encoding: 'utf8' }));
assert.ok(modules.some(row => row.name === 'graph' && row.ver === 60001));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const historicalPaths = ['tools/trace-graph/evidence/neo4j-proof.json', 'tools/trace-graph/evidence/batch-validation.json', 'tools/trace-graph/golden-proof.json'];
const sourcePaths = ['packages/source-substrate/test-vectors/trace/source-bundle.json', ...['captured-derived', 'generated-edges'].flatMap(name => [
  `packages/source-substrate/test-vectors/trace/${name}.sse`,
  `packages/ingress-refinery/test-vectors/trace/${name}.json`
])];
const hashes = paths => Object.fromEntries(paths.map(path => [path, digest(readFileSync(path))]));
const historicalBefore = hashes(historicalPaths), sourceBefore = hashes(sourcePaths);
const oracle = JSON.parse(readFileSync(historicalPaths[0], 'utf8'));
const sourceBundle = JSON.parse(readFileSync(sourcePaths[0], 'utf8'));
const store = new InMemoryTileStore();
store.put(sourceBundle.record); store.put(sourceBundle.derived);
const storedBefore = [sourceBundle.record, sourceBundle.derived].map(tile => canonicalTraceJson(store.get(tile.cid)));
const { database, graph } = await createTraceFalkorClient(config);
const query = async (name, projectionId, parameters = {}) => (await graph.roQuery(readFileSync(`tools/trace-graph/cypher/${name}.cypher`, 'utf8'), { params: { projectionId, ...parameters }, TIMEOUT: 2000 })).data ?? [];
const evidence = [];
try {
  // This initializes the isolated graph without canonical evidence or Neo4j input.
  if ((await database.list()).includes(graphName)) await graph.delete();
  for (const name of ['captured-derived', 'generated-edges']) {
    const trace = JSON.parse(readFileSync(`packages/ingress-refinery/test-vectors/trace/${name}.json`, 'utf8'));
    let cid;
    if (name === 'captured-derived') cid = sourceBundle.derived.cid;
    else {
      const record = createSourceRecordTile({ sourceSystemId: 'trace-fixture-generator', recordLocalId: 'generated-edges', stableLocators: ['packages/source-substrate/test-vectors/trace/generated-edges.sse'], recordType: 'generated-fixture', publicationStatus: 'public', metadataBlob: {} });
      cid = createSourceManifestationTile({ sourceRecordCid: record.cid, manifestationId: 'generated-edges-v1', manifestationKind: 'generated-fixture', mediaType: 'text/event-stream', byteHashes: { sha256: trace.sourceDigest }, accessRequirements: ['public-structural-fixture'], structureProfile: 'trace-edge-fixture-v1' }, [record.cid]).cid;
    }
    const projectionId = `trace-v1-${name}`;
    const projection = buildTraceProjection(trace, { projectionId, sourceArtifactCid: cid });
    const historical = oracle.evidence.find(item => item.fixture === name);
    assert.equal(projection.closureDigest, historical.closureDigest);
    if (evidence.length === 0) {
      await importTraceFalkorProjection(graph, projection);
      assert.deepEqual(await exportTraceFalkorProjection(graph, projection), projection);
    }
    await resetTraceFalkorProjection(graph, projectionId);
    const sentinel = buildTraceProjection(trace, { projectionId: projectionId + '-sentinel', sourceArtifactCid: cid });
    await importTraceFalkorProjection(graph, sentinel);
    await importTraceFalkorProjection(graph, projection);
    const closure = await exportTraceFalkorProjection(graph, projection);
    assert.deepEqual(closure, projection);
    await importTraceFalkorProjection(graph, projection);
    assert.deepEqual(await exportTraceFalkorProjection(graph, projection), closure);
    const results = {};
    for (const family of ['membership', 'parentage', 'correlation', 'lifecycle', 'lineage', 'bounded']) results[family] = await query(family, projectionId, { from: 0, to: 5 });
    assert.deepEqual(results, historical.queryResults);
    const morphology = await query('morphology', projectionId);
    const kinematics = measureTraceKinematics(trace);
    assert.deepEqual(morphology, historical.morphology);
    assert.deepEqual(morphology, kinematics.metrics.map((m, snapshot) => ({ snapshot, sourceSequence: m.sourceSequence, sourceBytes: m.sourceBytes, normalizedBytes: m.normalizedBytes, recordCount: m.recordCount, objectCount: m.objectCount, ...m.deltaCounts })));
    const sequence = name === 'generated-edges' ? 2 : 5;
    const neighborhood = await query('neighborhood', projectionId, { sequence });
    assert.deepEqual(neighborhood, historical.neighborhood);
    assert.equal(kinematics.resultDigest, historical.kinematicsDigest);
    assert.ok(results.bounded.length > 0 && results.bounded.length <= 6);
    assert.ok(projection.edges.every(edge => edge.type !== 'CAUSES'));
    const causalEdges = (await graph.roQuery('MATCH (:TraceProjectionNode {projectionId:$projectionId})-[r:CAUSES]->() RETURN count(r) AS count', { params: { projectionId } })).data;
    assert.deepEqual(causalEdges, [{ count: 0 }]);
    await graph.query('MATCH (n:TraceProjectionNode {id:$id}) CREATE (:ForeignResetSentinel {proof:$projectionId})-[:FOREIGN_PROOF {projectionId: "other-projection"}]->(n)', { params: { id: projection.nodes[0].id, projectionId } });
    try {
      await assert.rejects(resetTraceFalkorProjection(graph, projectionId), /foreign|relationship/i);
      assert.deepEqual(await exportTraceFalkorProjection(graph, projection), closure);
    } finally { await graph.query('MATCH (f:ForeignResetSentinel {proof:$projectionId})-[r:FOREIGN_PROOF]->() DELETE r,f', { params: { projectionId } }); }
    await resetTraceFalkorProjection(graph, projectionId);
    assert.equal((await exportTraceFalkorProjection(graph, projection)).nodes.length, 0);
    assert.deepEqual(await exportTraceFalkorProjection(graph, sentinel), sentinel);
    await importTraceFalkorProjection(graph, projection);
    assert.deepEqual(await exportTraceFalkorProjection(graph, projection), closure);
    for (const family of Object.keys(results)) assert.deepEqual(await query(family, projectionId, { from: 0, to: 5 }), results[family]);
    assert.deepEqual(await query('morphology', projectionId), morphology);
    assert.deepEqual(await query('neighborhood', projectionId, { sequence }), neighborhood);
    await resetTraceFalkorProjection(graph, sentinel.projectionId);
    evidence.push({ fixture: name, projectionId, normalizedDigest: trace.normalizedDigest, sourceDigest: trace.sourceDigest, closureDigest: closure.closureDigest, nodes: closure.nodes.length, edges: closure.edges.length, queryResults: results, morphology, neighborhood, kinematicsDigest: kinematics.resultDigest, idempotent: true, scopedReset: true, rebuilt: true, differentialParity: true, foreignResetProtected: true, causalEdges: 0 });
  }
  const schema = await ensureTraceFalkorSchema(graph);
  assert.equal(schema.constraints.filter(row => row.type === 'UNIQUE' && row.status === 'OPERATIONAL').length, 11);
  await graph.delete();
  assert.ok(!(await database.list()).includes(graphName));
  assert.deepEqual(hashes(sourcePaths), sourceBefore);
  assert.deepEqual([sourceBundle.record, sourceBundle.derived].map(tile => canonicalTraceJson(store.get(tile.cid))), storedBefore);
  assert.deepEqual(hashes(historicalPaths), historicalBefore);
  const implementationPaths = ['tools/trace-graph/proof-output.mjs', 'packages/projection-adapters/src/lib/trace-projection.ts', 'packages/projection-adapters/src/lib/falkordb-trace-projection.ts', 'tools/trace-graph/prove-falkordb.mjs', 'packages/projection-adapters/package.json', ...['membership','parentage','correlation','lifecycle','lineage','bounded','morphology','neighborhood'].map(name => `tools/trace-graph/cypher/${name}.cypher`)];
  const proof = {
    profile: 'trace-graph-falkordb-proof-v1', observedAt: new Date().toISOString(),
    implementation: { baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), posture: 'working-tree-source-digests', digests: hashes(implementationPaths) },
    backend: { provider: 'FalkorDB', version: '6.0.1', moduleVersion: 60001, image: expectedImage, imageId: image.Image, container, graphName, client: { package: 'falkordb', version: '6.8.0', protocol: 'RESP', ...config, queryTimeoutMs: 2000, schemaReadinessTimeoutMs: 10000 }, posture: 'local-private-fixture', promotionBoundary: 'SSPLv1 public/network service deployment requires separate review' },
    evidence, ...schema, sourceDigests: sourceBefore, historicalDigests: historicalBefore,
    oracle: { path: historicalPaths[0], comparison: 'provider-neutral closure and literal query results; never migration input' },
    dropped: true, canonicalSourcesUnaffected: true, rosettaStoreUnaffected: true,
    residue: { 1736: 'Independent TRACE-KIN Falkor acceptance and agent-stream structural query re-proof', 1737: 'Graphiti first-party Falkor backend and live model/provider proof', 1738: 'Final roadmap/catalog/V0 reconciliation and promotion review' }
  };
  const path = proofPath;
  const bytes = canonicalTraceJson(proof) + '\n';
  writeFileSync(path, bytes, { flag: 'wx' });
  process.stdout.write(JSON.stringify({ proof: path, sha256: digest(bytes), fixtures: evidence.map(({ fixture, nodes, edges, closureDigest }) => ({ fixture, nodes, edges, closureDigest })), indexes: schema.indexes.length, operationalConstraints: schema.constraints.length, directQueryFamilies: 8, idempotent: true, scopedReset: true, rebuilt: true, dropped: true, canonicalSourcesUnaffected: true, rosettaStoreUnaffected: true }) + '\n');
} finally { await database.close(); }
