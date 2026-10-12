import process from 'node:process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { buildTraceProjection, createTraceNeo4jDriver, importTraceProjection, resetTraceProjection, exportTraceProjection, measureTraceKinematics } from '../../packages/projection-adapters/dist/index.js';
import { canonicalTraceJson } from '../../packages/rosetta-schemas/dist/index.js';
import { createSourceRecordTile, createSourceManifestationTile } from '../../packages/source-substrate/dist/index.js';
if (process.env.TRACE_GRAPH_ISOLATED !== 'true') throw new Error('Declare ownership of an isolated development database before proof/reset.');
const database = createTraceNeo4jDriver({ uri: process.env.TRACE_NEO4J_URI ?? 'bolt://127.0.0.1:17687', user: 'neo4j', password: process.env.TRACE_NEO4J_PASSWORD ?? 'trace-fixture-development' });
const session = database.session({ database: 'neo4j' });
const query = async (name, projectionId, parameters = {}) => (await session.run(readFileSync(`tools/trace-graph/cypher/${name}.cypher`, 'utf8'), { projectionId, ...parameters })).records.map(r => r.toObject());
const evidence = [];
try {
  await database.verifyConnectivity();
  const version = (await session.run('CALL dbms.components() YIELD versions RETURN versions[0] AS version')).records[0].get('version');
  for (const name of ['captured-derived', 'generated-edges']) {
    const trace = JSON.parse(readFileSync(`packages/ingress-refinery/test-vectors/trace/${name}.json`, 'utf8'));
    let cid;
    if (name === 'captured-derived') cid = JSON.parse(readFileSync('packages/source-substrate/test-vectors/trace/source-bundle.json', 'utf8')).derived.cid;
    else {
      const sourceRecord = createSourceRecordTile({ sourceSystemId: 'trace-fixture-generator', recordLocalId: 'generated-edges', stableLocators: ['packages/source-substrate/test-vectors/trace/generated-edges.sse'], recordType: 'generated-fixture', publicationStatus: 'public', metadataBlob: {} });
      cid = createSourceManifestationTile({ sourceRecordCid: sourceRecord.cid, manifestationId: 'generated-edges-v1', manifestationKind: 'generated-fixture', mediaType: 'text/event-stream', byteHashes: { sha256: trace.sourceDigest }, accessRequirements: ['public-structural-fixture'], structureProfile: 'trace-edge-fixture-v1' }, [sourceRecord.cid]).cid;
    }
    const projectionId = `trace-v1-${name}`, projection = buildTraceProjection(trace, { projectionId, sourceArtifactCid: cid });
    await resetTraceProjection(database, projectionId);
    // A second namespace proves scoped reset cannot remove another projection of shared evidence.
    const sentinel = buildTraceProjection(trace, { projectionId: projectionId + '-sentinel', sourceArtifactCid: cid });
    await importTraceProjection(database, sentinel);
    await importTraceProjection(database, projection);
    const closure = await exportTraceProjection(database, projection);
    assert.deepEqual(closure, projection);
    await importTraceProjection(database, projection);
    assert.deepEqual(await exportTraceProjection(database, projection), closure);
    const results = {};
    for (const name of ['membership','parentage','correlation','lifecycle','lineage','bounded']) results[name] = await query(name, projectionId, { from: 0, to: 5 });
    const kinematics = measureTraceKinematics(trace);
    const morphology = await query('morphology', projectionId);
    assert.deepEqual(morphology, kinematics.metrics.map((m, snapshot) => ({ snapshot, sourceSequence: m.sourceSequence, sourceBytes: m.sourceBytes, normalizedBytes: m.normalizedBytes, recordCount: m.recordCount, objectCount: m.objectCount, ...m.deltaCounts })));
    const sequence = name === 'generated-edges' ? 2 : 5;
    const neighborhood = await query('neighborhood', projectionId, { sequence });
    assert.equal(neighborhood.length, 1);
    if (name === 'generated-edges') {
      assert.deepEqual(neighborhood[0].beforeObjects.map(o => o.objectId), ['A','B','C','D','E']);
      assert.deepEqual(neighborhood[0].afterObjects.map(o => o.objectId), ['A','C','E']);
    }
    const expectedLineage = [{ fixture: name, profile: 'trace.normalization.v1', normalizedDigest: trace.normalizedDigest, cid }];
    assert.deepEqual(results.lineage, expectedLineage);
    if (name === 'generated-edges') {
      assert.deepEqual(results.membership, [0,1,2,3,4,5].map(sequence => ({ run: sequence === 4 ? 'reset-run' : 'original-run', window: 'generated-window', sequence, event: 'trace_snapshot' })));
      const dispositions = [
        { ADDED: ['A','B','C','D'] },
        { ADDED: ['E'], CHANGED: ['A'], UNCHANGED: ['B','C','D'] },
        { CHANGED: ['A'], REMOVED: ['B','D'], REPEATED: ['C'], UNCHANGED: ['E'] },
        { ADDED: ['F'], UNCHANGED: ['A','C','E'] },
        { ADDED: ['X'], REMOVED: ['A','C','E','F'] },
        { ADDED: ['B'], REMOVED: ['F'], REPEATED: ['A','C','E'] }
      ];
      const expected = dispositions.flatMap((d,snapshot) => Object.keys(d).sort().flatMap(disposition => d[disposition].map(object => ({ snapshot,disposition,object }))));
      assert.deepEqual(results.lifecycle, expected);
      assert.deepEqual(results.parentage, []); assert.deepEqual(results.correlation, []);
    } else {
      assert.equal(results.membership.length, 75);
      assert.ok(results.parentage.some(r => r.sequence === 5 && r.parent === 'message-004'));
      assert.ok(results.correlation.some(r => r.request === 10 && r.correlation === 'request-002' && r.result === 12));
    }
    assert.ok(results.bounded.length > 0 && results.bounded.length <= 6);
    await resetTraceProjection(database, projectionId);
    assert.equal((await exportTraceProjection(database, projection)).nodes.length, 0);
    assert.deepEqual(await exportTraceProjection(database, sentinel), sentinel);
    await importTraceProjection(database, projection);
    assert.deepEqual(await exportTraceProjection(database, projection), closure);
    for (const name of Object.keys(results)) assert.deepEqual(await query(name, projectionId, { from: 0, to: 5 }), results[name]);
    assert.deepEqual(await query('morphology', projectionId), morphology);
    assert.deepEqual(await query('neighborhood', projectionId, { sequence }), neighborhood);
    await resetTraceProjection(database, sentinel.projectionId);
    evidence.push({ fixture: name, version, projectionId, normalizedDigest: trace.normalizedDigest, closureDigest: closure.closureDigest, nodes: closure.nodes.length, edges: closure.edges.length, queryResults: results, morphology, neighborhood, kinematicsDigest: kinematics.resultDigest, idempotent: true, scopedReset: true, rebuilt: true });
  }
  const indexes = (await session.run('SHOW INDEXES YIELD name RETURN name ORDER BY name')).records.map(r => r.get('name'));
  for (const name of ['trace_record_sequence','trace_record_event','trace_object_kind']) assert.ok(indexes.includes(name));
  const constraints = (await session.run('SHOW CONSTRAINTS YIELD name RETURN name ORDER BY name')).records.map(r => r.get('name'));
  assert.equal(constraints.filter(n => n.startsWith('trace_')).length, 11);
  mkdirSync('.axi', { recursive: true });
  writeFileSync('.axi/neo4j-reference-replay.json', canonicalTraceJson({ profile: 'trace-graph-proof-v1', evidence, constraints, indexes }) + '\n');
  process.stdout.write('Real Neo4j proof: both fixtures, direct queries, idempotency, isolated reset and rebuild passed.\n');
} finally { await session.close(); await database.close(); }
