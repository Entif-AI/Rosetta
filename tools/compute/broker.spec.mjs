import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtempSync, mkdirSync, symlinkSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { invoke, openForward, writeBundle, probeResp } from './broker.mjs';
import { ComputeError } from './contract.mjs';
import net from 'node:net';

const config = { targets: { 'm3-ultra': { checkout: '/test/revision-matched', node: '/test/node' } } };
const revision = async () => 'a'.repeat(40);
const output = () => { mkdirSync('.axi', { recursive: true }); return mkdtempSync('.axi/compute-test-'); };
const failure = expected => e => e.code === expected;
function child() {
  const c = new EventEmitter(); c.pid = 2147483647; c.kill = () => { c.emit('exit'); c.emit('close'); }; return c;
}
test('real forwarded RESP protocol requires PONG rather than a listening port', async () => {
  for (const response of ['+PONG\r\n', '-ERR unavailable\r\n']) {
    const server = net.createServer(socket => socket.once('data', () => socket.end(response)));
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try { if (response.startsWith('+')) await probeResp(server.address().port); else await assert.rejects(probeResp(server.address().port)); }
    finally { await new Promise(resolve => server.close(resolve)); }
  }
});
test('tunnel loss is classified and its owned child is cleaned', async () => {
  const c = child(); let closed = false; c.kill = () => { closed = true; c.emit('close'); };
  const tunnel = await openForward('m3-ultra', 16379, { launch: () => c, probe: async () => {}, port: 12345 });
  c.emit('exit'); assert.throws(tunnel.assertAlive, failure('TUNNEL')); await tunnel.close(); assert.equal(closed, true);
});
test('failed tunnel readiness cleans temporary forwarding', async () => {
  const c = child(); let killed = false; c.kill = () => { killed = true; c.emit('close'); };
  await assert.rejects(openForward('m3-ultra', 16379, { launch: () => c, probe: async () => { throw new Error('gone'); }, port: 12345, timeoutMs: 1 }), failure('TUNNEL'));
  assert.equal(killed, true);
});
test('unavailable remote target writes a blocked receipt without invoking a task locally', async () => {
  const parent = output(); let calls = 0;
  try {
    const result = await invoke({ operation: 'run', target: 'm3-ultra', job: 'akasha.operational.prove', output: parent + '/blocked', config }, { revision, call: async () => { calls++; throw new ComputeError('BLOCKED_COMPUTE_TARGET', 'SSH unreachable', { failureClass: 'TRANSPORT' }); } });
    assert.equal(result.code, 'BLOCKED_COMPUTE_TARGET'); assert.equal(result.status, 'blocked'); assert.equal(calls, 1);
    assert.equal(JSON.parse(readFileSync(parent + '/blocked/result.json')).executionHostRef, 'host:m3-ultra');
  } finally { rmSync(parent, { recursive: true }); }
});
test('evidence collision refuses dispatch and preserves the old bytes', async () => {
  const parent = output(); let calls = 0;
  try {
    await assert.rejects(invoke({ operation: 'run', job: 'akasha.operational.prove', output: parent, config }, { call: async () => { calls++; }, revision }), failure('EVIDENCE_EXISTS'));
    assert.equal(calls, 0);
  } finally { rmSync(parent, { recursive: true }); }
});
test('a symlink ancestor cannot place evidence in a prefix-matching sibling directory', async () => {
  const parent = output(), escaped = mkdtempSync('.axi-escape-');
  try {
    mkdirSync(escaped + '/nested');
    symlinkSync(new URL('../../' + escaped, new URL(parent + '/', 'file://' + process.cwd() + '/')).pathname, parent + '/linked');
    await assert.rejects(invoke({ operation: 'run', job: 'akasha.operational.prove', output: parent + '/linked/nested/out', config }, { revision, call: async () => ({ status: 'blocked' }) }), failure('EVIDENCE_INTEGRITY'));
    assert.equal(existsSync(escaped + '/nested/out'), false);
  } finally { rmSync(parent, { recursive: true }); rmSync(escaped, { recursive: true }); }
});
function bundle(ref = 'proof.json', bytes = Buffer.from('{"proven":true}\n')) {
  const item = { ref, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
  return { manifest: { runId: 'run-1', revision: 'a'.repeat(40), artifacts: [item] }, files: [{ ...item, base64: bytes.toString('base64') }] };
}
test('evidence identity, digest, paths and size are verified before writing', () => {
  const parent = output();
  try {
    for (const value of [bundle('../escaped'), { ...bundle(), manifest: { runId: 'other' } }, { ...bundle(), files: [{ ...bundle().files[0], base64: 'dGFtcGVy' }] }]) {
      assert.throws(() => writeBundle(value, parent, 'run-1', 'a'.repeat(40)), failure('EVIDENCE_INTEGRITY'));
      assert.equal(existsSync(parent + '/remote'), false);
    }
    const result = writeBundle(bundle(), parent, 'run-1', 'a'.repeat(40));
    assert.equal(result.artifacts.length, 1); assert.equal(readFileSync(parent + '/remote/proof.json', 'utf8'), '{"proven":true}\n');
  } finally { rmSync(parent, { recursive: true }); }
});
