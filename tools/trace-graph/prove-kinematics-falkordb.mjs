import process from 'node:process';
import { proofOutputPath } from './proof-output.mjs';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { buildTraceProjection, createTraceFalkorClient, importTraceFalkorProjection, exportTraceFalkorProjection, measureTraceKinematics, ensureTraceFalkorSchema } from '../../packages/projection-adapters/dist/index.js';
import { canonicalTraceJson } from '../../packages/rosetta-schemas/dist/index.js';
import { createSourceRecordTile, createSourceManifestationTile } from '../../packages/source-substrate/dist/index.js';
import { InMemoryTileStore } from '../../packages/rosetta-store/dist/index.js';

if (process.env.TRACE_GRAPH_ISOLATED !== 'true') throw new Error('Explicit isolated fixture ownership is required before kinematics import/drop.');
const proofPath = proofOutputPath('tools/trace-graph/evidence/falkordb-kinematics-proof.json');
const graphName = 'entif_trace_1736';
const container = process.env.TRACE_FALKORDB_CONTAINER ?? 'entif-falkor-1735';
const config = { host: '127.0.0.1', port: Number(process.env.TRACE_FALKORDB_PORT ?? '16379'), graphName };
const image = JSON.parse(execFileSync('docker', ['inspect', container], { encoding: 'utf8' }))[0];
const expectedImage = 'falkordb/falkordb:6.0.1@sha256:e2765e207e5ba4ee90e47ed31eb7491ad6dd3d42241c326e429375c02ad9882f';
assert.equal(image.Config.Labels['entif.issue'], '1735'); assert.equal(image.Config.Image, expectedImage);
assert.ok(image.NetworkSettings.Ports['6379/tcp'].some(binding => binding.HostIp === config.host && Number(binding.HostPort) === config.port));
const modules = JSON.parse(execFileSync('docker', ['exec', container, 'redis-cli', '--json', 'MODULE', 'LIST'], { encoding: 'utf8' }));
assert.ok(modules.some(module => module.name === 'graph' && module.ver === 60001));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const hashes = paths => Object.fromEntries(paths.map(path => [path, digest(readFileSync(path))]));
const fixtures = ['captured-derived', 'generated-edges'];
const historicalPaths = ['tools/trace-graph/evidence/neo4j-proof.json', 'tools/trace-graph/evidence/falkordb-proof.json', 'tools/trace-graph/evidence/batch-validation.json', 'tools/trace-graph/golden-proof.json'];
const sourcePaths = ['packages/source-substrate/test-vectors/trace/source-bundle.json', ...fixtures.flatMap(name => [`packages/source-substrate/test-vectors/trace/${name}.sse`, `packages/ingress-refinery/test-vectors/trace/${name}.json`, `packages/projection-adapters/test-vectors/trace/${name}.kinematics.json`])];
const historicalBefore = hashes(historicalPaths), sourcesBefore = hashes(sourcePaths);
const oracle = JSON.parse(readFileSync(historicalPaths[0], 'utf8'));
const sourceBundle = JSON.parse(readFileSync(sourcePaths[0], 'utf8'));
const store = new InMemoryTileStore(); store.put(sourceBundle.record); store.put(sourceBundle.derived);
const storedBefore = [sourceBundle.record, sourceBundle.derived].map(tile => canonicalTraceJson(store.get(tile.cid)));
const { database, graph } = await createTraceFalkorClient(config);
const evidence = [];
try {
  const graphsBefore = (await database.list()).sort();
  if (graphsBefore.includes(graphName)) throw new Error('Kinematics scratch graph already exists; reconcile prior ownership/state before retry.');
  const query = async (name, projectionId, params = {}) => (await graph.roQuery(readFileSync(`tools/trace-graph/cypher/${name}.cypher`, 'utf8'), { params: { projectionId, ...params }, TIMEOUT: 2000 })).data ?? [];
  for (const name of fixtures) {
    const trace = JSON.parse(readFileSync(`packages/ingress-refinery/test-vectors/trace/${name}.json`, 'utf8'));
    let cid = sourceBundle.derived.cid;
    if (name === 'generated-edges') {
      const record = createSourceRecordTile({ sourceSystemId: 'trace-fixture-generator', recordLocalId: name, stableLocators: [`packages/source-substrate/test-vectors/trace/${name}.sse`], recordType: 'generated-fixture', publicationStatus: 'public', metadataBlob: {} });
      cid = createSourceManifestationTile({ sourceRecordCid: record.cid, manifestationId: 'generated-edges-v1', manifestationKind: 'generated-fixture', mediaType: 'text/event-stream', byteHashes: { sha256: trace.sourceDigest }, accessRequirements: ['public-structural-fixture'], structureProfile: 'trace-edge-fixture-v1' }, [record.cid]).cid;
    }
    const projection = buildTraceProjection(trace, { projectionId: `trace-v1-${name}`, sourceArtifactCid: cid });
    const report = measureTraceKinematics(trace);
    const expectedReport = JSON.parse(readFileSync(`packages/projection-adapters/test-vectors/trace/${name}.kinematics.json`, 'utf8'));
    assert.deepEqual(report, expectedReport);
    await importTraceFalkorProjection(graph, projection);
    assert.deepEqual(await exportTraceFalkorProjection(graph, projection), projection);
    const historical = oracle.evidence.find(item => item.fixture === name);
    const morphology = await query('morphology', projection.projectionId);
    const lifecycle = await query('lifecycle', projection.projectionId);
    const neighborhood = await query('neighborhood', projection.projectionId, { sequence: name === 'generated-edges' ? 2 : 5 });
    assert.deepEqual(morphology, historical.morphology);
    assert.deepEqual(lifecycle, historical.queryResults.lifecycle);
    assert.deepEqual(neighborhood, historical.neighborhood);
    assert.deepEqual(morphology, report.metrics.map((metric, snapshot) => ({ snapshot, sourceSequence: metric.sourceSequence, sourceBytes: metric.sourceBytes, normalizedBytes: metric.normalizedBytes, recordCount: metric.recordCount, objectCount: metric.objectCount, ...metric.deltaCounts })));
    assert.equal(report.resultDigest, historical.kinematicsDigest);
    assert.ok(neighborhood.length > 0 && neighborhood[0].beforeObjects.length > 0 && neighborhood[0].afterObjects.length > 0);
    const causal = (await graph.roQuery('MATCH (:TraceProjectionNode {projectionId:$projectionId})-[r:CAUSES]->() RETURN count(r) AS count', { params: { projectionId: projection.projectionId }, TIMEOUT: 2000 })).data;
    assert.deepEqual(causal, [{ count: 0 }]);
    if (name === 'generated-edges') {
      assert.equal(report.metrics[2].compaction_candidate, true); assert.equal(report.metrics[4].reset, true); assert.equal(report.metrics[4].compaction_candidate, false);
      assert.deepEqual(report.metrics[2].disappeared, ['B', 'D']); assert.ok(report.metrics[5].reappeared.includes('B'));
      assert.ok(lifecycle.some(row => row.snapshot === 2 && row.disposition === 'REMOVED' && row.object === 'B'));
      assert.ok(lifecycle.some(row => row.snapshot === 5 && row.disposition === 'ADDED' && row.object === 'B'));
    }
    evidence.push({ fixture: name, projectionId: projection.projectionId, normalizedDigest: trace.normalizedDigest, closureDigest: projection.closureDigest, resultDigest: report.resultDigest, measurements: report.metrics.length, metricArtifact: `packages/projection-adapters/test-vectors/trace/${name}.kinematics.json`, caveat: report.caveat, morphology, lifecycle, neighborhood, temporalAdjacencyPromoted: false, causalEdges: 0, differentialParity: true });
  }
  const schema = await ensureTraceFalkorSchema(graph);
  await graph.delete(); assert.deepEqual((await database.list()).sort(), graphsBefore);
  assert.deepEqual(hashes(sourcePaths), sourcesBefore); assert.deepEqual(hashes(historicalPaths), historicalBefore);
  assert.deepEqual([sourceBundle.record, sourceBundle.derived].map(tile => canonicalTraceJson(store.get(tile.cid))), storedBefore);
  const implementationPaths = ['tools/trace-graph/proof-output.mjs', 'tools/trace-graph/prove-kinematics-falkordb.mjs', 'packages/projection-adapters/src/lib/trace-kinematics.ts', 'packages/rosetta-schemas/src/lib/trace-kinematics.ts', 'packages/projection-adapters/src/lib/falkordb-trace-projection.ts', ...['morphology', 'lifecycle', 'neighborhood'].map(name => `tools/trace-graph/cypher/${name}.cypher`)];
  const proof = { profile: 'trace-kin-falkordb-proof-v1', observedAt: new Date().toISOString(), implementation: { baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), posture: 'working-tree-source-digests', digests: hashes(implementationPaths) }, backend: { provider: 'FalkorDB', version: '6.0.1', moduleVersion: 60001, image: expectedImage, imageId: image.Image, clientVersion: '6.8.0', protocol: 'RESP', ...config, posture: 'local-private-fixture', promotionBoundary: 'SSPLv1 public/network service deployment requires separate review' }, evidence, ...schema, sourceDigests: sourcesBefore, historicalDigests: historicalBefore, oracle: { path: historicalPaths[0], comparison: 'literal query and provider-neutral deterministic metric parity; never migration input' }, dropped: true, otherGraphsPreserved: true, canonicalSourcesUnaffected: true, rosettaStoreUnaffected: true };
  const output = proofPath; const bytes = canonicalTraceJson(proof) + '\n'; writeFileSync(output, bytes, { flag: 'wx' });
  process.stdout.write(JSON.stringify({ proof: output, sha256: digest(bytes), evidence: evidence.map(({ fixture, resultDigest, measurements }) => ({ fixture, resultDigest, measurements })), directQueryFamilies: 3, operationalConstraints: schema.constraints.length, dropped: true, otherGraphsPreserved: true }) + '\n');
} finally { await database.close(); }
