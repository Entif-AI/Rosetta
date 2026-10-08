import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { normalizeBoundaryTrace } from '../../packages/ingress-refinery/dist/index.js';
import { writeBoundaryAdmission } from './spool.mjs';

test('local spool preserves exact source/blob bytes and refuses overwrite', () => {
  mkdirSync('.axi', { recursive: true });
  const parent = mkdtempSync('.axi/live-spool-test-');
  const raw = readFileSync('tools/trace-live/fixtures/correlated-action.jsonl', 'utf8');
  try {
    const admission = normalizeBoundaryTrace(raw, { maturity: 'fixture', recordedAt: '2000-01-01T00:00:00.000Z' });
    const directory = writeBoundaryAdmission(admission, parent + '/evidence');
    const sourcePath = directory + '/local-source/' + admission.localEvidence.source.sha256 + '.jsonl';
    assert.equal(readFileSync(sourcePath, 'utf8'), raw);
    assert.equal(statSync(sourcePath).mode & 0o777, 0o600);
    for (const blob of admission.localEvidence.payloads) {
      const bytes = readFileSync(directory + '/local-source/payloads/' + blob.sha256 + '.json');
      assert.equal(createHash('sha256').update(bytes).digest('hex'), blob.sha256);
      assert.equal(bytes.length, blob.byteLength);
    }
    assert.throws(() => writeBoundaryAdmission(admission, directory), error => error.code === 'EVIDENCE_EXISTS');
    assert.equal(readFileSync(sourcePath, 'utf8'), raw);
    assert.ok(!/AUTH_FIXTURE|COOKIE_FIXTURE|PRIVATE_BODY_FIXTURE/.test(readFileSync(directory + '/normalization.json', 'utf8')));
  } finally { rmSync(parent, { recursive: true }); }
});
