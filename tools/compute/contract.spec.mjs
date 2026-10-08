import test from 'node:test';
import assert from 'node:assert/strict';
import { JOBS, ComputeError, validateRequest, validateRuntime, requireRevision, classifySshFailure, sshArguments, validateConfig } from './contract.mjs';

const runtime = () => ({
  revision: 'a'.repeat(40), dirty: false, architecture: 'arm64',
  services: {
    operational: { image: 'falkordb/falkordb:6.0.1@sha256:e2765e207e5ba4ee90e47ed31eb7491ad6dd3d42241c326e429375c02ad9882f', issue: '1735', moduleVersion: 60001, running: true, bindings: [{ HostIp: '127.0.0.1', HostPort: '16379' }], graphs: [] },
    semantic: { image: 'falkordb/falkordb:v4.20.7@sha256:13996aa523f0dd283f6bd6df6620b094dcea525452417c4d6ef9bef15dc9998d', issue: '1737', moduleVersion: 42007, running: true, bindings: [{ HostIp: '127.0.0.1', HostPort: '16380' }], graphs: [] },
  },
  graphiti: { version: '0.30.2', clientVersion: '1.7.1' },
  inference: { configured: true, models: ['chat', 'embed'], model: 'chat', embedder: 'embed', reranker: 'chat' },
});
const code = expected => e => e instanceof ComputeError && e.code === expected;

test('catalog exposes bounded existing proof runners, without shell execution', () => {
  assert.equal(JOBS['akasha.operational.prove'].script, 'tools/trace-graph/prove-falkordb.mjs');
  assert.equal(JOBS['akasha.semantic.prove'].script, 'tools/trace-temporal/prove-semantic-falkordb.mjs');
  assert.ok(Object.values(JOBS).every(j => j.timeoutMs > 0 && j.timeoutMs <= 3900000));
  assert.throws(() => validateRequest({ operation: 'run', job: 'shell', revision: 'a'.repeat(40), runId: 'safe' }), code('INVALID_REQUEST'));
});
test('requests refuse command/env passthrough and traversal', () => {
  const request = { operation: 'run', job: 'akasha.operational.prove', revision: 'a'.repeat(40), runId: 'run-1' };
  assert.deepEqual(validateRequest(request), request);
  for (const extra of [{ command: 'echo unsafe' }, { env: {} }, { runId: '../retained' }, { revision: 'main' }]) {
    assert.throws(() => validateRequest({ ...request, ...extra }), code('INVALID_REQUEST'));
  }
});
test('configured target uses strict noninteractive auth and an owned SSH session', () => {
  const args = sshArguments('m3-ultra');
  for (const option of ['BatchMode=yes', 'StrictHostKeyChecking=yes', 'IdentitiesOnly=yes', 'PasswordAuthentication=no', 'ForwardAgent=no', 'ControlMaster=no', 'ControlPath=none']) assert.ok(args.includes(option));
  assert.throws(() => sshArguments('-oProxyCommand=evil'), code('INVALID_REQUEST'));
});
test('configuration rejects a missing target instead of substituting local compute', () => {
  assert.throws(() => validateConfig({ targets: {} }, 'm3-ultra'), code('BLOCKED_COMPUTE_TARGET'));
  assert.equal(validateConfig({ targets: { 'm3-ultra': { checkout: '/workspace/rosetta', node: '/opt/homebrew/bin/node' } } }, 'm3-ultra').checkout, '/workspace/rosetta');
});
test('authentication, host-key and transport failures have stable distinct classes', () => {
  assert.equal(classifySshFailure('Permission denied (publickey).'), 'AUTHENTICATION');
  assert.equal(classifySshFailure('Host key verification failed.'), 'HOST_KEY');
  assert.equal(classifySshFailure('Connection timed out'), 'TRANSPORT');
});
test('code revision is matched and tracked dirt is refused before remote execution', () => {
  requireRevision(runtime(), 'a'.repeat(40));
  assert.throws(() => requireRevision(runtime(), 'b'.repeat(40)), code('REVISION_MISMATCH'));
  assert.throws(() => requireRevision({ ...runtime(), dirty: true }, 'a'.repeat(40)), code('REVISION_MISMATCH'));
});
test('separate accepted service versions are admitted', () => {
  assert.doesNotThrow(() => validateRuntime(runtime(), 'akasha.semantic.prove'));
});
test('incorrect module version refuses all graph mutation', () => {
  const value = runtime(); value.services.operational.moduleVersion = 42007;
  assert.throws(() => validateRuntime(value, 'akasha.operational.prove'), code('RUNTIME_INCOMPATIBLE'));
});
test('unexpected ownership or image identity is refused', () => {
  for (const field of ['issue', 'image']) {
    const value = runtime(); value.services.semantic[field] = 'unexpected';
    assert.throws(() => validateRuntime(value, 'akasha.temporal.prove'), code('RUNTIME_INCOMPATIBLE'));
  }
});
test('every service binding must be loopback, rather than merely one binding', () => {
  const value = runtime(); value.services.operational.bindings.push({ HostIp: '0.0.0.0', HostPort: '16379' });
  assert.throws(() => validateRuntime(value, 'akasha.operational.prove'), code('RUNTIME_INCOMPATIBLE'));
});
test('service death is distinct from incompatibility', () => {
  const value = runtime(); value.services.operational.running = false;
  assert.throws(() => validateRuntime(value, 'akasha.operational.prove'), code('SERVICE_UNAVAILABLE'));
});
test('preexisting scratch graph is preserved, including operational runner which used to drop it', () => {
  const value = runtime(); value.services.operational.graphs.push('entif_trace_1735');
  assert.throws(() => validateRuntime(value, 'akasha.operational.prove'), code('SCRATCH_COLLISION'));
});
test('live adapter proof uses a fixed fixture job and refuses an existing scratch graph', () => {
  assert.equal(JOBS['akasha.live-fixture.prove']?.script, 'tools/trace-live/prove-falkordb.mjs');
  const value = runtime(); value.services.operational.graphs.push('entif_trace_1685');
  assert.throws(() => validateRuntime(value, 'akasha.live-fixture.prove'), code('SCRATCH_COLLISION'));
});
test('missing inference blocks semantic execution but permits deterministic and model-off jobs', () => {
  const value = runtime(); value.inference = { configured: false };
  assert.throws(() => validateRuntime(value, 'akasha.semantic.prove'), code('INFERENCE_UNAVAILABLE'));
  assert.doesNotThrow(() => validateRuntime(value, 'akasha.operational.prove'));
  assert.doesNotThrow(() => validateRuntime(value, 'akasha.model-off'));
});
test('model discovery must cover both chat and independent embedding model', () => {
  const value = runtime(); value.inference.models = ['chat'];
  assert.throws(() => validateRuntime(value, 'akasha.semantic.prove'), code('INFERENCE_UNAVAILABLE'));
});
test('donor incompatibility is detected before a temporal job', () => {
  const value = runtime(); value.graphiti.version = 'unexpected';
  assert.throws(() => validateRuntime(value, 'akasha.temporal.prove'), code('RUNTIME_INCOMPATIBLE'));
});
