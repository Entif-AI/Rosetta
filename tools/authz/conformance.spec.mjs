import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { verifyTileIntegrity } from '../../packages/rosetta-core/dist/index.js';
import { verifySignedReceipt, digestTile } from '../../packages/rosetta-receipts/dist/index.js';
import { getSchemaCatalogEntry } from '../../packages/rosetta-schemas/dist/index.js';
import { InMemoryTileStore } from '../../packages/rosetta-store/dist/index.js';
import { buildReceiptBundle, verifyReceiptBundle } from '../../packages/rosetta-receipts/dist/index.js';
import { runAuthzConformance, summarizeConformance } from './conformance.mjs';

const matrix = JSON.parse(readFileSync(new URL('./fixtures/conformance-v1.json', import.meta.url), 'utf8'));

test('all 15 authority invariants run against three consumers with evidence and no denied effects', () => {
  const report = runAuthzConformance();
  assert.equal(matrix.cases.length, 15);
  assert.equal(report.status, 'pass', JSON.stringify(report.failures));
  assert.equal(report.cases.length, 45);
  assert.deepEqual(new Set(report.cases.map(row => row.path)), new Set(['guard-axi', 'worker-a2a', 'write-admission']));
  assert.equal(new Set(report.cases.map(row => `${row.caseId}:${row.path}`)).size, 45);
  for (const row of report.cases) {
    const expected = matrix.cases.find(value => value.id === row.caseId).attempts;
    assert.deepEqual(row.attempts.map(attempt => attempt.expected), expected.map(value => value.effect));
    assert.equal(row.status, 'pass', JSON.stringify(row));
    assert.equal(row.maturity, 'fixture-backed');
    assert.ok(row.attempts.length);
    for (const [index, attempt] of row.attempts.entries()) {
      assert.equal(attempt.evaluation.payload.effect, expected[index].effect);
      if (expected[index].reason) assert.ok(attempt.evaluation.payload.reasonCodes.includes(expected[index].reason));
      assert.equal(attempt.evaluation.kind, 'rosetta.evaluation');
      assert.equal(attempt.evaluation.payload.authorityRole, 'decision-evidence');
      assert.ok(attempt.action.cid);
      assert.ok(attempt.receipt.cid);
      assert.ok(attempt.intentObservation.cid);
      if (attempt.expected === 'deny') {
        assert.equal(attempt.executorDisposition, 'deny');
        assert.deepEqual(attempt.beforeEffects, attempt.afterEffects);
        assert.equal(attempt.observation, null);
      } else {
        assert.equal(attempt.executorDisposition, 'applied');
        assert.equal(attempt.afterEffects.providerCalls - attempt.beforeEffects.providerCalls, 1);
        assert.ok(attempt.observation.cid);
        assert.equal(attempt.receiptVerification.ok, true);
      }
    }
  }
});

test('the write fixture checkpoints and grounds before actual filesystem apply', () => {
  const rows = runAuthzConformance(['standing-delegation']).cases;
  const write = rows.find(row => row.path === 'write-admission');
  assert.equal(write.attempts.length, 3);
  for (const attempt of write.attempts) {
    assert.deepEqual(attempt.steps, ['propose', 'normalize', 'authorize', 'ground', 'checkpoint', 'apply', 'observe', 'receipt', 'project']);
    assert.ok(attempt.checkpoint.cid);
    assert.equal(attempt.afterEffects.mutationWrites - attempt.beforeEffects.mutationWrites, 1);
    assert.deepEqual(attempt.approvalHandoffRefs, []);
    assert.equal(attempt.workflowDecision.payload.boundaries.requestPolicyAuthority, 'narrows_startup_authority_only');
  }
});

test('worker handoff consumes a currently resolved attenuated historical delegation', () => {
  const worker = runAuthzConformance(['standing-delegation']).cases.find(row => row.path === 'worker-a2a');
  for (const attempt of worker.attempts) {
    assert.equal(attempt.delegation.posture, 'compatibility-projected');
    assert.ok(attempt.delegation.envelope.delegation.parentEnvelopeRef);
    assert.equal(attempt.afterEffects.workerDispatches - attempt.beforeEffects.workerDispatches, 1);
  }
});

test('provider and visibility remain broader than current handler authority', () => {
  for (const row of runAuthzConformance(['provider-scope-escape', 'cached-discovery']).cases) {
    assert.equal(row.capabilityManifest.kind, 'adapter.capability_manifest');
    assert.ok(row.discovery.includes('fixture.delete'));
    assert.ok(row.attempts.some(attempt => attempt.expected === 'deny' && attempt.exposed));
    assert.equal(row.status, 'pass');
  }
});

test('unsupported and unknown never count as passing conformance', () => {
  const report = runAuthzConformance(['unimplemented-owner-surface']);
  assert.equal(report.status, 'unsupported');
  assert.equal(report.cases.length, 3);
  assert.ok(report.cases.every(row => row.status === 'unsupported' && row.attempts.length === 0));
  assert.equal(summarizeConformance([{ status: 'unknown' }]).status, 'unknown');
  assert.deepEqual(summarizeConformance([{ status: 'pass' }, { status: 'unrecognized-consumer-result' }]), {
    status: 'unknown', counts: { pass: 1, fail: 0, unsupported: 0, unknown: 1 }
  });
  assert.equal(summarizeConformance([{ status: 'pass' }, { status: 'fail' }]).status, 'fail');
});

test('integrity-valid artifacts remain verifiable after current authority denies execution', () => {
  for (const row of runAuthzConformance(['integrity-without-validity']).cases) {
    const { integrity, evaluation } = row.attempts[0];
    assert.equal(verifyTileIntegrity(integrity.envelope).ok, true, row.path);
    assert.equal(verifySignedReceipt(integrity.signedReceipt).ok, true, row.path);
    assert.deepEqual(integrity.envelope.payload, row.attempts[0].currentAuthority.envelope, `Signed and evaluated projections differ: ${row.path}`);
    assert.deepEqual(integrity.signedReceipt.receipt.payload.digests, [digestTile(integrity.envelope, 'projection-bytes')]);
    assert.equal(evaluation.payload.effect, 'deny');
    assert.ok(evaluation.payload.reasonCodes.includes('AUTHORITY_REVOKED'));
  }
});

test('reported artifacts independently close Receipts and standing authority needs no approval artifact', () => {
  for (const row of runAuthzConformance().cases) {
    const store = new InMemoryTileStore();
    for (const attempt of row.attempts) {
      assert.ok(Array.isArray(attempt.artifacts), `Evidence closure unavailable: ${row.path}`);
      for (const tile of [...attempt.artifacts, attempt.receipt]) {
        assert.equal(verifyTileIntegrity(tile).ok, true);
        store.put(tile);
      }
      assert.equal(verifyReceiptBundle(buildReceiptBundle(attempt.receipt), store).ok, true);
      if (row.caseId === 'standing-delegation') {
        assert.equal(attempt.compatibilityDecision.payload.effect, 'allow');
        assert.deepEqual(attempt.approvalHandoffRefs, []);
        assert.ok(attempt.artifacts.every(tile => tile.kind !== 'iam.approval_handoff'));
        assert.ok(attempt.observation.cid);
      }
    }
    if (row.caseId === 'standing-delegation') assert.equal(new Set(row.attempts.map(attempt => attempt.action.cid)).size, 3);
  }
});

test('capability manifests refer to registered input and output schemas', () => {
  const [row] = runAuthzConformance(['standing-delegation']).cases;
  for (const manifest of row.capabilityManifests) {
    for (const ref of [manifest.payload.input_schema_ref, manifest.payload.output_schema_ref]) {
      assert.ok(getSchemaCatalogEntry(ref), `Unregistered schema reference: ${ref}`);
    }
  }
});
