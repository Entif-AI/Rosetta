import process from 'node:process';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { admitTemporalFixture } from './fixture-input.mjs';
import { buildTraceProjection, createTraceFalkorClient, importTraceFalkorProjection, exportTraceFalkorProjection } from '../../packages/projection-adapters/dist/index.js';
import { canonicalTraceJson } from '../../packages/rosetta-schemas/dist/index.js';
import { InMemoryTileStore } from '../../packages/rosetta-store/dist/index.js';

if (process.env.TRACE_GRAPH_ISOLATED !== 'true') throw new Error('Explicit isolated fixture ownership is required.');
const { normalized, selected, sourceTiles } = admitTemporalFixture();
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const hashes = paths => Object.fromEntries(paths.map(p => [p, digest(readFileSync(p))]));
const sourcePaths = ['tools/trace-temporal/fixtures/temporal-evolution.sse', 'tools/trace-temporal/fixtures/temporal-evolution.normalized.json'];
const historicalPaths = ['tools/trace-graph/evidence/neo4j-proof.json', 'tools/trace-graph/evidence/falkordb-proof.json', 'tools/trace-graph/evidence/falkordb-kinematics-proof.json', 'tools/trace-temporal/evidence/projection.json', 'tools/trace-temporal/evidence/inspection.json'];
const before = hashes([...sourcePaths, ...historicalPaths]);
const store = new InMemoryTileStore(); sourceTiles.forEach(tile => store.put(tile));
const storedBefore = sourceTiles.map(tile => canonicalTraceJson(store.get(tile.cid)));
const projection = buildTraceProjection(normalized, { projectionId: 'trace-v1-temporal-evolution', sourceArtifactCid: selected.sourceArtifactRef });
const config = { host: '127.0.0.1', port: Number(process.env.TRACE_GRAPHITI_FALKORDB_PORT ?? '16380'), graphName: 'entif_trace_1737_baseline' };
const temporary = mkdtempSync(path.join(tmpdir(), 'rosetta-graphiti-backend-'));
const { database, graph } = await createTraceFalkorClient(config);
try {
  const names = (await database.list()).sort();
  if (names.includes(config.graphName)) throw new Error('Operational scratch graph already exists; reconcile before retry.');
  // Verify the exact owned endpoint and installed donor before either graph is mutated.
  execFileSync(process.env.TRACE_GRAPHITI_PYTHON ?? 'python3', ['-c', 'import sys; sys.path.insert(0,"tools/trace-temporal"); from graphiti_falkor_runner import inspect_fixture_runtime; inspect_fixture_runtime(); from graphiti_core.driver.falkordb_driver import FalkorDriver'], { stdio: 'inherit', timeout: 10000 });
  await importTraceFalkorProjection(graph, projection);
  assert.deepEqual(await exportTraceFalkorProjection(graph, projection), projection);
  const input = path.join(temporary, 'selected.json'), output = path.join(temporary, 'proof.json');
  writeFileSync(input, JSON.stringify(selected));
  execFileSync(process.env.TRACE_GRAPHITI_PYTHON ?? 'python3', ['tools/trace-temporal/prove_falkor_backend.py', input, output], { stdio: 'inherit', timeout: 90000 });
  const proof = JSON.parse(readFileSync(output, 'utf8'));
  assert.deepEqual(proof.selected, selected);
  assert.equal(proof.semanticAcceptance, false); assert.equal(proof.modelCalls, 0);
  assert.equal(proof.episodeRows.length, selected.episodes.length);
  assert.deepEqual(await exportTraceFalkorProjection(graph, projection), projection);
  await graph.delete(); assert.deepEqual((await database.list()).sort(), names);
  assert.deepEqual(hashes([...sourcePaths, ...historicalPaths]), before);
  assert.deepEqual(sourceTiles.map(tile => canonicalTraceJson(store.get(tile.cid))), storedBefore);
  const implementationPaths = ['tools/trace-temporal/prove-falkordb.mjs', 'tools/trace-temporal/prove_falkor_backend.py', 'tools/trace-temporal/graphiti_falkor_runner.py', 'tools/trace-temporal/graphiti_support.py', 'tools/trace-temporal/fixture-input.mjs', 'tools/trace-temporal/generate-fixture.mjs', 'packages/projection-adapters/src/lib/graphiti-trace.ts', 'packages/projection-adapters/src/lib/trace-projection.ts', 'packages/projection-adapters/src/lib/falkordb-trace-projection.ts'];
  Object.assign(proof, {
    implementation: { baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), posture: 'working-tree-source-digests', digests: hashes(implementationPaths) },
    preservedDigests: before, canonicalSourcesUnaffected: true, rosettaStoreUnaffected: true,
    operationalProjection: { ...config, closureDigest: projection.closureDigest, nodes: projection.nodes.length, edges: projection.edges.length, unaffectedBySemanticDrop: true, dropped: true },
    remainingAcceptance: ['Actual model-backed extraction/evolution/invalidation', 'Live out-of-order/retraction/contradiction/identity/rights cases', 'Semantic current/history direct queries and donor re-extraction rebuild'],
  });
  const target = 'tools/trace-temporal/evidence/falkordb-backend-proof.json';
  const bytes = canonicalTraceJson(proof) + '\n'; writeFileSync(target, bytes);
  process.stdout.write(JSON.stringify({ proof: target, sha256: digest(bytes), status: proof.status, episodes: proof.episodeRows.length, idempotent: proof.duplicateDeliveryIdempotent, episodePersistenceRebuilt: proof.episodePersistenceRebuilt, semanticAcceptance: false, canonicalSourcesUnaffected: true, operationalProjectionUnaffected: true }) + '\n');
} finally {
  await database.close(); rmSync(temporary, { recursive: true, force: true });
}
