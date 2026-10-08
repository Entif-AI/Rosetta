// #1744 development transport. These are job identities, never Rosetta Core kinds.
export const VERSION = '0.1.0';
export const MAX_EVIDENCE_BYTES = 16 * 1024 * 1024;
export const SERVICES = Object.freeze({
  operational: { container: 'entif-falkor-1735', issue: '1735', port: 16379, moduleVersion: 60001,
    image: 'falkordb/falkordb:6.0.1@sha256:e2765e207e5ba4ee90e47ed31eb7491ad6dd3d42241c326e429375c02ad9882f' },
  semantic: { container: 'entif-graphiti-falkor-1737', issue: '1737', port: 16380, moduleVersion: 42007,
    image: 'falkordb/falkordb:v4.20.7@sha256:13996aa523f0dd283f6bd6df6620b094dcea525452417c4d6ef9bef15dc9998d' },
});
export const JOBS = Object.freeze({
  'akasha.build': { script: null, timeoutMs: 300000, services: [], graphs: {} },
  'akasha.operational.prove': { script: 'tools/trace-graph/prove-falkordb.mjs', timeoutMs: 120000, services: ['operational'], graphs: { operational: ['entif_trace_1735'] } },
  'akasha.kinematics.prove': { script: 'tools/trace-graph/prove-kinematics-falkordb.mjs', timeoutMs: 120000, services: ['operational'], graphs: { operational: ['entif_trace_1736'] } },
  'akasha.temporal.prove': { script: 'tools/trace-temporal/prove-falkordb.mjs', timeoutMs: 180000, services: ['semantic'], graphs: { semantic: ['entif_trace_1737_baseline', 'entif_graphiti_1737'] }, graphiti: true },
  'akasha.semantic.prove': { script: 'tools/trace-temporal/prove-semantic-falkordb.mjs', timeoutMs: 3900000, services: ['operational', 'semantic'], graphs: { operational: ['entif_trace_1737_baseline'], semantic: ['entif_graphiti_1737'] }, graphiti: true, inference: true },
  'akasha.model-off': { script: 'tools/trace-temporal/run.mjs', timeoutMs: 30000, services: [], graphs: {} },
});

export class ComputeError extends Error {
  constructor(code, message, details = {}) { super(message); this.name = 'ComputeError'; this.code = code; this.details = details; }
}
export function fail(code, message, details) { throw new ComputeError(code, message, details); }
export function validateRequest(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('INVALID_REQUEST', 'Expected a bounded JSON request.');
  const fields = { doctor: ['operation'], run: ['operation', 'job', 'revision', 'runId'], collect: ['operation', 'runId'] }[value.operation];
  if (!fields || Object.keys(value).some(k => !fields.includes(k))) fail('INVALID_REQUEST', 'Unknown operation or request field.');
  if (value.operation === 'run' && (!Object.hasOwn(JOBS, value.job) || !/^[a-f0-9]{40}$/.test(value.revision ?? ''))) fail('INVALID_REQUEST', 'Select a catalog job and exact Git revision.');
  if (value.operation !== 'doctor' && !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(value.runId ?? '')) fail('INVALID_REQUEST', 'Invalid run identity.');
  return value;
}
export function validateConfig(config, target) {
  if (!/^[a-z][a-z0-9-]{0,63}$/.test(target ?? '')) fail('INVALID_REQUEST', 'Select a symbolic SSH target.');
  if (!Object.hasOwn(config?.targets ?? {}, target)) fail('BLOCKED_COMPUTE_TARGET', 'Target is not configured; configure the designated compute host.');
  const value = config.targets[target];
  if (typeof value.checkout !== 'string' || !value.checkout.startsWith('/') || /[\n\r\0]/.test(value.checkout)) fail('INVALID_REQUEST', 'Host-local checkout must be an absolute path.');
  if (typeof value.node !== 'string' || !value.node.startsWith('/') || /[\n\r\0]/.test(value.node)) fail('INVALID_REQUEST', 'Host-local Node executable must be an absolute path.');
  return value;
}
export function sshArguments(target) {
  if (!/^[a-z][a-z0-9-]{0,63}$/.test(target ?? '')) fail('INVALID_REQUEST', 'Invalid symbolic SSH target.');
  return ['-T', ...['BatchMode=yes', 'PasswordAuthentication=no', 'KbdInteractiveAuthentication=no', 'StrictHostKeyChecking=yes', 'IdentitiesOnly=yes', 'ForwardAgent=no', 'ControlMaster=no', 'ControlPath=none', 'ConnectTimeout=8', 'ServerAliveInterval=5', 'ServerAliveCountMax=2'].flatMap(v => ['-o', v]), target];
}
export function classifySshFailure(stderr) {
  if (/host key verification|REMOTE HOST IDENTIFICATION/i.test(stderr)) return 'HOST_KEY';
  if (/permission denied|authentication failed|no supported authentication/i.test(stderr)) return 'AUTHENTICATION';
  return 'TRANSPORT';
}
export function requireRevision(snapshot, revision) {
  if (snapshot.revision !== revision || snapshot.dirty) fail('REVISION_MISMATCH', 'Use a clean revision-matched compute checkout.', { expected: revision, actual: snapshot.revision, dirty: snapshot.dirty });
}
export function validateRuntime(snapshot, job) {
  const spec = JOBS[job];
  if (!spec) fail('INVALID_REQUEST', 'Unknown compute job.');
  if (snapshot.architecture !== 'arm64') fail('RUNTIME_INCOMPATIBLE', 'The designated target must be the qualified Apple Silicon host.');
  for (const name of spec.services) {
    const value = snapshot.services[name], expected = SERVICES[name];
    if (!value?.running) fail('SERVICE_UNAVAILABLE', 'Required owned service is unavailable.', { service: name });
    if (value.image !== expected.image || value.issue !== expected.issue || value.moduleVersion !== expected.moduleVersion || !value.bindings?.length || value.bindings.some(b => b.HostIp !== '127.0.0.1' || Number(b.HostPort) !== expected.port)) fail('RUNTIME_INCOMPATIBLE', 'Owned service identity, version or loopback binding differs.', { service: name });
    for (const graph of spec.graphs[name] ?? []) if (value.graphs.includes(graph)) fail('SCRATCH_COLLISION', 'Preserve and reconcile the existing scratch graph before retry.', { service: name, graph });
  }
  if (spec.graphiti && (snapshot.graphiti?.version !== '0.30.2' || snapshot.graphiti?.clientVersion !== '1.7.1')) fail('RUNTIME_INCOMPATIBLE', 'Use the accepted Graphiti/Falkor Python environment.');
  if (spec.inference) {
    const provider = snapshot.inference;
    if (!provider?.configured || ![provider.model, provider.embedder, provider.reranker].every(m => provider.models?.includes(m))) fail('INFERENCE_UNAVAILABLE', 'Configure and load the explicit local chat, embedder and reranker models.');
  }
}
export function outcomeError(error, identity = {}) {
  const e = error instanceof ComputeError ? error : new ComputeError('TASK_EXECUTION', 'Compute task failed; inspect the retained local evidence.');
  return { profile: 'rosetta-compute-result-v1', version: VERSION, status: e.code === 'TASK_EXECUTION' ? 'failed' : 'blocked', code: e.code, message: e.message, ...identity, details: e.details };
}
