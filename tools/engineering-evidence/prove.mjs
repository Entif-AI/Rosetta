import process from 'node:process';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { buildEngineeringLifecycleProjection, inspectEngineeringLifecycle, createTraceNeo4jDriver, importTraceProjection, resetTraceProjection, exportTraceProjection } from '../../packages/projection-adapters/dist/index.js';
import { canonicalTraceJson, traceHash } from '../../packages/rosetta-schemas/dist/index.js';

if (process.argv.slice(2).some(arg => arg !== '--neo4j')) throw new Error('usage: prove.mjs [--neo4j]');
const fixture = JSON.parse(readFileSync('tools/engineering-evidence/fixtures/jcs-1693.json', 'utf8'));
for (const source of fixture.sources) {
  if (source.sha256 === null) continue;
  const git = /^git:Entif-AI\/Rosetta@([a-f0-9]{40}):(.+)$/u.exec(source.locator);
  const bytes = git ? execFileSync('git', ['show', `${git[1]}:${git[2]}`]) : readFileSync(source.locator);
  assert.equal(traceHash(bytes), source.sha256, `Source digest: ${source.ref}`);
}
const pr = JSON.parse(readFileSync('tools/engineering-evidence/fixtures/jcs-pr.source.json', 'utf8'));
assert.equal(pr.state, 'MERGED');
for (const source of fixture.sources.filter(s => s.role === 'hosted-verification')) {
  const check = JSON.parse(readFileSync(source.locator, 'utf8'));
  assert.equal(check.workflowRun.head_sha, pr.headRefOid);
  assert.equal(check.workflowRun.conclusion, 'success');
  assert.equal(check.checkRun.conclusion, 'SUCCESS');
}
const result = buildEngineeringLifecycleProjection(fixture);
assert.deepEqual(buildEngineeringLifecycleProjection(fixture), result);
const inspection = inspectEngineeringLifecycle(result.projection);
assert.deepEqual(inspection.sources, fixture.sources);
assert.deepEqual(inspection.validationRelations, fixture.validationRelations);
assert.equal(inspection.currentState.verification.state, 'accepted');
assert.equal(inspection.currentState.integration.state, 'integrated');
const evidence = {
  role: 'public-engineering-lifecycle-conformance-proof', issue: 1726, provingWork: 1693,
  codeBaseRevision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  workingTreeDirty: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim().length > 0,
  implementationSourceDigests: Object.fromEntries(['packages/projection-adapters/src/lib/engineering-lifecycle.ts', 'packages/rosetta-schemas/src/lib/engineering-lifecycle.ts', 'packages/rosetta-schemas/src/lib/work-lifecycle.ts', 'tools/engineering-evidence/prove.mjs'].map(file => [file, traceHash(readFileSync(file))])),
  sourceRecordCid: result.source.record.cid, sourceManifestationCid: result.source.manifestation.cid,
  inputDigest: result.source.inputDigest, sourceDigest: result.normalized.sourceDigest,
  normalizedDigest: result.normalized.normalizedDigest, closureDigest: result.projection.closureDigest,
  records: fixture.records.length, sourceReferences: fixture.sources.length,
  nodeCount: result.projection.nodes.length, edgeCount: result.projection.edges.length,
  deterministicRebuild: true, sourceDigestsVerified: true, graphRuntime: 'not-attempted',
  limitations: fixture.limitations
};
if (process.argv.includes('--neo4j')) {
  if (process.env.TRACE_GRAPH_ISOLATED !== 'true') throw new Error('Declare ownership of an isolated development database before proof/reset.');
  const database = createTraceNeo4jDriver({ uri: process.env.TRACE_NEO4J_URI ?? 'bolt://127.0.0.1:17887', user: 'neo4j', password: process.env.TRACE_NEO4J_PASSWORD ?? 'trace-fixture-development' });
  const session = database.session({ database: 'neo4j' });
  try {
    await database.verifyConnectivity();
    evidence.databaseVersion = (await session.run('CALL dbms.components() YIELD versions RETURN versions[0] AS version')).records[0].get('version');
    const projection = result.projection;
    const sentinel = buildEngineeringLifecycleProjection({ ...fixture, bundleRef: fixture.bundleRef + ':sentinel' }).projection;
    await resetTraceProjection(database, projection.projectionId);
    await importTraceProjection(database, sentinel);
    await importTraceProjection(database, projection);
    assert.deepEqual(await exportTraceProjection(database, projection), projection);
    await importTraceProjection(database, projection);
    assert.deepEqual(await exportTraceProjection(database, projection), projection);
    const query = async () => (await session.run(
      'MATCH (s:TraceSnapshot {projectionId:$projectionId})-[c:CONTAINS]->(o:TraceObject {objectKind:$kind})-[:PAYLOAD_REF]->(p:TracePayload {sha256:$sha256}) WHERE s.index=$index RETURN c.stateJson AS stateJson,p.valueJson AS valueJson',
      { projectionId: projection.projectionId, kind: 'engineering.lifecycle-source.v1', sha256: result.source.inputDigest, index: fixture.records.length - 1 }
    )).records.map(r => ({ state: JSON.parse(r.get('stateJson')), source: JSON.parse(r.get('valueJson')) }));
    const before = await query();
    assert.equal(before.length, 1);
    assert.equal(before[0].state.content.payloadRef, `sha256:${result.source.inputDigest}`);
    assert.deepEqual(before[0].source, fixture);
    await resetTraceProjection(database, projection.projectionId);
    assert.equal((await exportTraceProjection(database, projection)).nodes.length, 0);
    assert.deepEqual(await exportTraceProjection(database, sentinel), sentinel);
    await importTraceProjection(database, projection);
    assert.deepEqual(await exportTraceProjection(database, projection), projection);
    assert.deepEqual(await query(), before);
    await resetTraceProjection(database, sentinel.projectionId);
    evidence.graphRuntime = 'passed';
    evidence.idempotentImport = true;
    evidence.scopedReset = true;
    evidence.rebuiltClosureAndQuery = true;
  } finally { await session.close(); await database.close(); }
}
mkdirSync('tools/engineering-evidence/evidence', { recursive: true });
writeFileSync('tools/engineering-evidence/evidence/jcs-inspection.json', JSON.stringify(inspection, null, 2) + '\n');
writeFileSync('tools/engineering-evidence/evidence/jcs-projection-proof.json', JSON.stringify(evidence, null, 2) + '\n');
process.stdout.write(`Engineering JCS reconstruction: ${evidence.records} records, ${evidence.sourceReferences} source refs; Neo4j ${evidence.graphRuntime}.\n`);
