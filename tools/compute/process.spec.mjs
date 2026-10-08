import test from 'node:test';
import assert from 'node:assert/strict';
import { execute } from './process.mjs';
import { shellQuote } from './broker.mjs';

test('timeout terminates a process group and returns a bounded failure', async () => {
  const result = await execute(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { timeoutMs: 100 });
  assert.equal(result.reason, 'TIMEOUT'); assert.equal(result.exitSignal, 'SIGTERM');
});
test('cancellation interrupts remote transport without hanging', async () => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 100);
  const result = await execute(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { signal: controller.signal });
  assert.equal(result.reason, 'CANCELLED');
});
test('unbounded stdout is stopped before it is accumulated', async () => {
  const result = await execute(process.execPath, ['-e', 'console.log("x".repeat(200000))'], { maxBytes: 100 });
  assert.equal(result.reason, 'OUTPUT_LIMIT'); assert.ok(result.stdout.length <= 100);
});
test('host-local paths remain literal through the SSH shell quoting boundary', async () => {
  const value = "/path with 'quote' $VARIABLE and `literal`";
  const result = await execute('/bin/sh', ['-c', `printf '%s' ${shellQuote(value)}`]);
  assert.equal(result.stdout, value);
});
