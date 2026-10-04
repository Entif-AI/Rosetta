import process from 'node:process';
import { proofOutputPath } from '../trace-graph/proof-output.mjs';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { admitTemporalFixture } from './fixture-input.mjs';
import { buildTraceProjection, createTraceFalkorClient, importTraceFalkorProjection, exportTraceFalkorProjection, parseTemporalProjection, inspectTemporalProjection } from '../../packages/projection-adapters/dist/index.js';
import { canonicalTraceJson } from '../../packages/rosetta-schemas/dist/index.js';
import { InMemoryTileStore } from '../../packages/rosetta-store/dist/index.js';

if (process.env.TRACE_GRAPH_ISOLATED !== 'true') throw new Error('Explicit isolated fixture ownership is required.');
const proofPath = proofOutputPath('tools/trace-temporal/evidence/falkordb-semantic-proof.json');
const { normalized, selected, sourceTiles } = admitTemporalFixture();
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const hashes = paths => Object.fromEntries(paths.map(p => [p, digest(readFileSync(p))]));
const sourcePaths = ['tools/trace-temporal/fixtures/temporal-evolution.sse', 'tools/trace-temporal/fixtures/temporal-evolution.normalized.json'];
const preservedPaths = [...sourcePaths, 'tools/trace-graph/evidence/neo4j-proof.json', 'tools/trace-graph/golden-proof.json', 'tools/trace-graph/evidence/batch-validation.json', 'tools/trace-graph/evidence/falkordb-proof.json', 'tools/trace-graph/evidence/falkordb-kinematics-proof.json', 'tools/trace-temporal/evidence/falkordb-backend-proof.json', 'tools/trace-temporal/evidence/projection.json', 'tools/trace-temporal/evidence/inspection.json'];
const before = hashes(preservedPaths);
const implementationHead = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const store = new InMemoryTileStore(); sourceTiles.forEach(tile => store.put(tile));
const storedBefore = sourceTiles.map(tile => canonicalTraceJson(store.get(tile.cid)));
const projection = buildTraceProjection(normalized, { projectionId: 'trace-v1-temporal-evolution', sourceArtifactCid: selected.sourceArtifactRef });
const operational = { host: '127.0.0.1', port: 16379, graphName: 'entif_trace_1737_baseline' };
const semantic = { host: '127.0.0.1', port: Number(process.env.TRACE_GRAPHITI_FALKORDB_PORT ?? '16380'), graphName: 'entif_graphiti_1737' };
const operationalImage = 'falkordb/falkordb:6.0.1@sha256:e2765e207e5ba4ee90e47ed31eb7491ad6dd3d42241c326e429375c02ad9882f';
const runtime = JSON.parse(execFileSync('docker', ['inspect', 'entif-falkor-1735'], { encoding: 'utf8' }))[0];
assert.equal(runtime.Config.Image, operationalImage);
assert.equal(runtime.Config.Labels['entif.issue'], '1735');
assert.ok(runtime.NetworkSettings.Ports['6379/tcp'].every(b => b.HostIp === operational.host && Number(b.HostPort) === operational.port));
const modules = JSON.parse(execFileSync('docker', ['exec', 'entif-falkor-1735', 'redis-cli', '--json', 'MODULE', 'LIST'], { encoding: 'utf8' }));
assert.ok(modules.some(m => m.name === 'graph' && m.ver === 60001));
// Inspect ownership/version before either jurisdiction is mutated.
execFileSync(process.env.TRACE_GRAPHITI_PYTHON ?? 'python3', ['-c', 'import sys; sys.path.insert(0,"tools/trace-temporal"); from graphiti_falkor_runner import inspect_fixture_runtime; inspect_fixture_runtime()'], { stdio: 'inherit', timeout: 10000 });
const temporary = mkdtempSync(path.join(tmpdir(), 'rosetta-semantic-proof-'));
const { database: opDatabase, graph: opGraph } = await createTraceFalkorClient(operational);
const { database: semDatabase, graph: semGraph } = await createTraceFalkorClient(semantic);

function admit(result) {
  const admitted = parseTemporalProjection(result.projection, normalized, selected);
  assert.equal(admitted.derivation.mode, 'model-backed');
  assert.ok(admitted.artifacts.some(a => a.kind === 'entity'));
  assert.ok(admitted.artifacts.some(a => a.kind === 'fact'));
  const at = new Date().toISOString();
  const query = { admittedSelection: selected, effectiveAt: '2000-01-06T00:00:00.000Z', knownAt: at,
    allowedScopeRefs: ['scope:public-generated-fixture'], allowedRightsRefs: ['rights:public-generated-fixture'], revokedEpisodeIds: [] };
  const permitted = inspectTemporalProjection(admitted, normalized, query);
  const revoked = inspectTemporalProjection(admitted, normalized, { ...query, revokedEpisodeIds: [selected.episodes[0].id] });
  const scopeDenied = inspectTemporalProjection(admitted, normalized, { ...query, allowedScopeRefs: [] });
  assert.ok(permitted.artifacts.length > 0);
  assert.equal(permitted.sourceLineages.length, 1);
  assert.equal(revoked.artifacts.length, 0);
  assert.equal(scopeDenied.artifacts.length, 0);
  const frontier = result.transitions[0].materializedAt;
  const earlierQuery = { ...query, effectiveAt: '2000-01-02T12:00:00.000Z', knownAt: frontier };
  const earlier = inspectTemporalProjection(admitted, normalized, earlierQuery);
  const prefix = { ...admitted, artifacts: admitted.artifacts.filter(a => a.materializedAt <= frontier) };
  assert.deepEqual(earlier, inspectTemporalProjection(prefix, normalized, earlierQuery));
  assert.ok(earlier.artifacts.length > 0);
  assert.ok(earlier.artifacts.every(a => a.validUntil === null && a.validUntilKnownAt === null));
  assert.ok(earlier.artifacts.every(a => !JSON.parse(a.interpretation).invalid_at && !JSON.parse(a.interpretation).expired_at));
  assert.ok(admitted.artifacts.every(a => a.identity === 'unresolved'));
  assert.ok(result.responseProvenance.filter(r => r.operation === 'completions' && r.phase.includes(':episode:')).length >= selected.episodes.length);
  assert.deepEqual(result.selected, selected);
  assert.ok(Object.values(result.invariants).every(v => v === true));
  return { admitted, rightsAndScope: { permitted, revoked, scopeDenied, physicalGraphPersists: result.physicalState },
    knowledgeFrontier: { knownAt: frontier, effectiveAt: earlierQuery.effectiveAt, earlierInspection: earlier, noLaterInvalidationInformation: true },
    invariants: { ...result.invariants, rightsFenceActualArtifacts: true, scopeFenceActualArtifacts: true,
      oneIndependentSourceLineage: true, ambiguousIdentityNotPromoted: true, earlierKnowledgeFrontierPreserved: true } };
}

try {
  const opNames = (await opDatabase.list()).sort(), semNames = (await semDatabase.list()).sort();
  assert.ok(!opNames.includes(operational.graphName));
  assert.ok(!semNames.includes(semantic.graphName));
  await importTraceFalkorProjection(opGraph, projection);
  const preserve = async () => {
    assert.deepEqual(await exportTraceFalkorProjection(opGraph, projection), projection);
    assert.deepEqual(hashes(preservedPaths), before);
    assert.deepEqual(sourceTiles.map(tile => canonicalTraceJson(store.get(tile.cid))), storedBefore);
  };
  await preserve();
  const input = path.join(temporary, 'selected.json'); writeFileSync(input, JSON.stringify(selected));
  const run = label => {
    const output = path.join(temporary, label + '.json');
    try {
      execFileSync(process.env.TRACE_GRAPHITI_PYTHON ?? 'python3', ['tools/trace-temporal/prove_falkor_semantic.py', input, output, '--label', label], { stdio: 'inherit', timeout: 1800000 });
    } catch (error) {
      if (existsSync(output + '.failure.json')) writeFileSync(`.axi/semantic-${implementationHead}-${label}-failure.json`, readFileSync(output + '.failure.json'));
      throw error;
    }
    return JSON.parse(readFileSync(output, 'utf8'));
  };
  const initial = run('initial'), initialAdmission = admit(initial);
  await preserve();
  await semGraph.delete();
  assert.deepEqual((await semDatabase.list()).sort(), semNames);
  await preserve();
  const deletion = { semanticGraphAbsent: true, canonicalSourceIntact: true, normalizedSourceIntact: true,
    deterministicOperationalProjectionIntact: true, rosettaStoreIntact: true, operationalClosureDigest: projection.closureDigest };
  const rebuilt = run('rebuilt'), rebuiltAdmission = admit(rebuilt);
  assert.deepEqual(rebuiltAdmission.invariants, initialAdmission.invariants);
  await preserve();
  await semGraph.delete(); await opGraph.delete();
  assert.deepEqual((await semDatabase.list()).sort(), semNames);
  assert.deepEqual((await opDatabase.list()).sort(), opNames);
  const implementationPaths = ['tools/trace-graph/proof-output.mjs', 'tools/trace-temporal/prove-semantic-falkordb.mjs', 'tools/trace-temporal/prove_falkor_semantic.py', 'tools/trace-temporal/graphiti_falkor_runner.py', 'tools/trace-temporal/graphiti_support.py', 'tools/trace-temporal/graphiti_provider.py', 'tools/trace-temporal/fixture-input.mjs', 'packages/projection-adapters/src/lib/graphiti-trace.ts', 'packages/projection-adapters/src/lib/trace-projection.ts', 'packages/projection-adapters/src/lib/falkordb-trace-projection.ts'];
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), implementationHead);
  const proof = { profile: 'trace-graphiti-falkordb-semantic-proof-v1', observedAt: new Date().toISOString(),
    implementation: { gitHead: implementationHead, posture: 'source-digest-bound', digests: hashes(implementationPaths) },
    sourceDigest: selected.sourceDigest, normalizedDigest: selected.normalizedDigest, selectedInputDigest: digest(canonicalTraceJson(selected)),
    executionHostRef: 'host:m3-ultra', inferenceHostRef: 'host:m3-ultra', graphHostRef: 'host:m3-ultra', providerLocality: 'loopback',
    providerDiscovery: JSON.parse(readFileSync(process.env.TRACE_GRAPHITI_CAPABILITY_PROOF, 'utf8')),
    operationalRuntime: { version: '6.0.1', image: operationalImage, imageId: runtime.Image, client: 'falkordb@6.8.0', ...operational },
    semanticRuntime: initial.backend, initial, rebuilt,
    rightsAndScope: initialAdmission.rightsAndScope, knowledgeFrontier: initialAdmission.knowledgeFrontier,
    deletionAndRebuild: { deletion, rebuiltSuccessfully: true, invariantEquivalence: initialAdmission.invariants,
      standard: 'Semantic/evidence/temporal/rights invariants; UUID, byte, and exact inferred-text identity are not required.' },
    authoritySeparation: { source: 'canonical source Record/Manifestation', normalized: 'trace.normalization.v1',
      operational: { profile: 'trace.projection.v1', graphName: operational.graphName, closureDigest: projection.closureDigest },
      semantic: { profile: initial.projection.profile, authority: 'derived-interpretation', graphName: semantic.graphName } },
    preservedDigests: before, canonicalSourcePreserved: true, deterministicOperationalEvidencePreserved: true,
    knownGraphitiLimitations: [...initial.projection.loss, 'Donor correction and ambiguous-identity behavior is captured literally; source interpretation remains unresolved, never canonical truth.',
      'Pinned FalkorDB 4.20.7 indexed AND/OR predicates can over-admit temporal rows. Direct proof queries use native CASE and independently verify every returned interval.',
      'Direct donor effective-time queries do not provide Rosetta knowledge-frontier or current-rights admission; use the governed wrapper.',
      'Reranker is explicitly configured; direct Cypher inspection does not qualify its ranking behavior.',
      'Local executor-attested database/model proof is not independent hosted re-execution or production certification.'],
    versionSplitDisposition: 'V0_VERSION_SPLIT_ACCEPTED_PENDING_UPSTREAM_COMPATIBILITY',
    declaredNondeterminismAndLoss: initial.projection.loss, promotionPosture: 'fixture-local-private; G15/#361/#1222 and SSPL public-service review remain required',
    cleanup: { ownedSemanticGraphDropped: true, ownedOperationalGraphDropped: true, otherGraphsPreserved: true }, semanticAcceptance: true };
  const target = proofPath;
  const bytes = canonicalTraceJson(proof) + '\n'; writeFileSync(target, bytes, { flag: 'wx' });
  process.stdout.write(JSON.stringify({ proof: target, sha256: digest(bytes), semanticAcceptance: true, episodes: selected.episodes.length,
    initialArtifacts: initial.projection.artifacts.length, rebuiltArtifacts: rebuilt.projection.artifacts.length, preservedSource: true, rebuilt: true }) + '\n');
} finally {
  await opDatabase.close(); await semDatabase.close(); rmSync(temporary, { recursive: true, force: true });
}
