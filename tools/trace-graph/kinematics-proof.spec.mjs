import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

test('independent kinematics proof refuses mutation without explicit fixture ownership', () => {
  const result = spawnSync(process.execPath, ['tools/trace-graph/prove-kinematics-falkordb.mjs'], {
    encoding: 'utf8', env: { ...process.env, TRACE_GRAPH_ISOLATED: 'false' }, timeout: 10000
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /isolated fixture ownership/i);
});
