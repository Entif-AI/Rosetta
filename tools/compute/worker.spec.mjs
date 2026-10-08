import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { handle } from './worker.mjs';

test('worker version failure cannot dispatch a task and leaves source evidence untouched', async () => {
  const root = mkdtempSync('.axi/worker-test-'); let invoked = false;
  for (const dir of ['packages/source-substrate/test-vectors/trace','packages/ingress-refinery/test-vectors/trace','tools/trace-graph/evidence','tools/trace-temporal/evidence','tools/trace-temporal/fixtures']) mkdirSync(root + '/' + dir, { recursive: true });
  const source = root + '/packages/source-substrate/test-vectors/trace/source.sse'; writeFileSync(source, 'immutable-source');
  const request = { operation: 'run', job: 'akasha.operational.prove', runId: 'wrong-runtime', revision: 'a'.repeat(40) };
  try {
    const result = await handle(request, { config: {}, workingRoot: root, lockPath: root + '/fixture.lock', runCommand: async () => { invoked = true; }, inspectRuntime: async () => ({ revision: request.revision, dirty: false, architecture: 'arm64', services: { operational: { running: true, image: 'wrong' } } }) });
    assert.equal(result.code, 'RUNTIME_INCOMPATIBLE'); assert.equal(invoked, false); assert.equal(readFileSync(source, 'utf8'), 'immutable-source'); assert.equal(existsSync(root + '/fixture.lock'), false);
    const receipt = readFileSync(root + '/.axi/compute/wrong-runtime/result.json', 'utf8');
    const duplicate = await handle(request, { config: {}, workingRoot: root, lockPath: root + '/fixture.lock' });
    assert.equal(duplicate.code, 'EVIDENCE_EXISTS'); assert.equal(readFileSync(root + '/.axi/compute/wrong-runtime/result.json', 'utf8'), receipt);
    assert.equal(existsSync(root + '/fixture.lock'), false);
  } finally { rmSync(root, { recursive: true }); }
});
