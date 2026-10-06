import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { runOperationalProof, verifyOperationalProof } from './proof.mjs';

const root = mkdtempSync(join(tmpdir(), 'authz-operational-proof-'));
const directory = join(root, 'actual');
let report;
before(async () => { report = await runOperationalProof(directory); });
after(() => rmSync(root, { recursive: true, force: true }));

test('real actor, governed mutations, admission, HTTP and provider close the complete operational path', () => {
  assert.equal(report.status, 'pass');
  assert.equal(report.maturity, 'integration-backed local reference');
  assert.deepEqual(report.allowed.map(row => row.operation), ['A', 'A2']);
  assert.deepEqual(report.allowed.map(row => row.after.effectCount), [1, 2]);
  assert.equal(report.standingDelegation.authorityMutationsDuringExecution, 0);
  assert.equal(report.standingDelegation.startRevision, report.standingDelegation.endRevision);
  assert.equal(report.amplification.status, 'deny');
  assert.equal(report.amplification.beforeRevision, report.amplification.afterRevision);
  assert.equal(report.revocation.afterRevision, report.revocation.beforeRevision + 1);
  assert.equal(report.revocation.providerCredentialRemainsValid, true);
  assert.equal(report.denied.length, 7);
  for (const row of report.denied) {
    assert.equal(row.httpStatus, 403);
    assert.equal(row.code, 'ENTIF_AUTHORITY_DENIED');
    assert.deepEqual(row.after, row.before);
  }
  assert.deepEqual(report.replays.map(row => row.artifact), ['Authority Envelope', 'allow Evaluation', 'successful Receipt', 'cached discovery', 'mutation Receipt']);
  assert.equal(report.oldGrantReplay.status, 'reconciled');
  assert.equal(report.oldGrantReplay.currentRevision, report.revocation.afterRevision);
  assert.equal(report.independentRoot.effect, 'allow');
  assert.equal(report.finalTarget.effectCount, 2);
  assert.equal(report.evidence.lifecycleReceipts, 15);
  assert.equal(report.evidence.schemaAndIntegrity, 'pass');
  assert.equal(report.evidence.receiptClosure, 'pass');
  assert.equal(report.secretScan, 'pass');
  assert.equal(verifyOperationalProof(directory).ok, true);
});

test('retained evidence cannot pass closure verification after actual provider readback is removed', () => {
  const copy = join(root, 'missing-readback'); cpSync(directory, copy, { recursive: true });
  const cid = report.allowed[0].readbackRef;
  rmSync(join(copy, 'evidence', `${createHash('sha256').update(cid).digest('hex')}.json`));
  assert.throws(() => verifyOperationalProof(copy), /PROOF_CLOSURE_MISSING/);
});

test('a modified measured readback cannot hide behind a retained valid Receipt', () => {
  const copy = join(root, 'corrupt-readback'); cpSync(directory, copy, { recursive: true });
  const file = join(copy, 'evidence', `${createHash('sha256').update(report.allowed[0].readbackRef).digest('hex')}.json`);
  const tile = JSON.parse(readFileSync(file, 'utf8')); tile.payload.providerEffect.after.effectCount = 999;
  writeFileSync(file, JSON.stringify(tile));
  assert.throws(() => verifyOperationalProof(copy), /ADMISSION_ARTIFACT_INVALID/);
});
