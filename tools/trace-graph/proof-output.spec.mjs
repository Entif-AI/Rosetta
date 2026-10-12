import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { proofOutputPath } from './proof-output.mjs';

test('proof replay selects a fresh output and refuses preserved receipts before runtime mutation', () => {
  const directory = mkdtempSync(join(tmpdir(), 'trace-proof-output-'));
  const preserved = join(directory, 'accepted.json');
  const fresh = join(directory, 'replay.json');
  try {
    writeFileSync(preserved, 'accepted receipt\n');
    assert.throws(() => proofOutputPath(preserved, []), /already exists/);
    assert.throws(() => proofOutputPath(fresh, ['--output', preserved]), /already exists/);
    assert.equal(readFileSync(preserved, 'utf8'), 'accepted receipt\n');
    assert.equal(proofOutputPath(preserved, ['--output', fresh]), fresh);
    assert.equal(proofOutputPath(fresh, []), fresh);
    assert.throws(() => proofOutputPath(fresh, ['--output']));
    assert.throws(() => proofOutputPath(fresh, ['--output', '']), /nonempty/);
    assert.throws(() => proofOutputPath(fresh, ['--unexpected']));
  } finally {
    rmSync(directory, { recursive: true });
  }
});
