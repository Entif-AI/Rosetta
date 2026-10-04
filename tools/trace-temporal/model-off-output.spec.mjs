import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { test } from 'node:test';

test('model-off replay preserves existing evidence and writes a fresh bounded bundle', () => {
  const directory = mkdtempSync(join(tmpdir(), 'trace-model-off-'));
  const existing = join(directory, 'existing');
  const fresh = join(directory, 'fresh');
  const canonical = 'tools/trace-temporal/evidence/falkordb-model-off-inspection.json';
  const before = readFileSync(canonical);
  mkdirSync(existing);
  const preserved = join(existing, 'falkordb-model-off-inspection.json');
  writeFileSync(preserved, 'preserved receipt\n');
  try {
    const refusal = spawnSync(process.execPath, ['tools/trace-temporal/run.mjs', '--output-dir', existing], {
      encoding: 'utf8', timeout: 15000,
      env: { ...process.env, TRACE_GRAPHITI_PYTHON: '/unavailable-provider-interpreter' },
    });
    assert.notEqual(refusal.status, 0);
    assert.match(refusal.stderr, /already exists/);
    assert.equal(readFileSync(preserved, 'utf8'), 'preserved receipt\n');
    execFileSync(process.execPath, ['tools/trace-temporal/run.mjs', '--output-dir', fresh], { timeout: 15000 });
    const projection = JSON.parse(readFileSync(join(fresh, 'falkordb-model-off-projection.json')));
    assert.equal(projection.derivation.mode, 'unavailable');
    assert.deepEqual(projection.artifacts, []);
    assert.deepEqual(readFileSync(canonical), before);
    assert.deepEqual(JSON.parse(readFileSync(join(fresh, 'selection.schema.json'))), JSON.parse(readFileSync('tools/trace-temporal/selection.schema.json')));
    assert.deepEqual(JSON.parse(readFileSync(join(fresh, 'projection.schema.json'))), JSON.parse(readFileSync('tools/trace-temporal/projection.schema.json')));
  } finally {
    rmSync(directory, { recursive: true });
  }
});
