import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, lstatSync, realpathSync } from 'node:fs';
import { randomUUID, createHash } from 'node:crypto';
import { arch, homedir } from 'node:os';
import net from 'node:net';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { execute, terminate } from './process.mjs';
import { ComputeError, JOBS, SERVICES, MAX_EVIDENCE_BYTES, sshArguments, classifySshFailure, validateConfig, requireRevision, fail, outcomeError } from './contract.mjs';

export const shellQuote = value => "'" + value.replaceAll("'", "'\\''") + "'";
export function loadConfig(file = path.join(homedir(), '.config/rosetta/compute.json')) {
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { fail('BLOCKED_COMPUTE_TARGET', 'Read a host-local compute configuration; no local compute fallback is provided.'); }
}
export async function remoteCall(target, config, request, signal) {
  const selected = validateConfig(config, target);
  const command = `cd ${shellQuote(selected.checkout)} && ${shellQuote(selected.node)} tools/compute/worker.mjs`;
  const result = await execute('ssh', [...sshArguments(target), command], { input: JSON.stringify(request), timeoutMs: request.operation === 'run' ? JOBS[request.job].timeoutMs + 180000 : 60000, maxBytes: Math.ceil(MAX_EVIDENCE_BYTES * 1.5), signal });
  if (result.exitCode !== 0 || result.reason) fail('BLOCKED_COMPUTE_TARGET', 'The designated compute target did not return a verified result.', { failureClass: classifySshFailure(result.stderr), reason: result.reason, remoteExecutionState: request.operation === 'run' ? 'acknowledgement_unknown' : 'not_dispatched', runId: request.runId ?? null });
  try { return JSON.parse(result.stdout); } catch { fail('TRANSPORT', 'Remote response was not bounded JSON; reconcile before replay.', { runId: request.runId ?? null }); }
}
export async function probeResp(port) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    let response = '';
    const done = error => { socket.destroy(); error ? reject(error) : resolve(); };
    socket.setTimeout(1000, () => done(new Error('RESP timeout')));
    socket.on('error', done);
    socket.on('connect', () => socket.write('*1\r\n$4\r\nPING\r\n'));
    socket.on('data', bytes => { response += bytes.toString(); if (response.includes('\r\n')) done(response === '+PONG\r\n' ? null : new Error('Unexpected RESP reply')); });
    socket.on('end', () => { if (response !== '+PONG\r\n') done(new Error('Forwarded service closed without PONG')); });
  });
}
async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer(); server.on('error', reject);
    server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(error => error ? reject(error) : resolve(port)); });
  });
}
export async function openForward(target, remotePort, { launch, probe = probeResp, port, timeoutMs = 8000 } = {}) {
  port ??= await freePort();
  const args = sshArguments(target); args.pop();
  const child = launch ? launch(port) : spawn('ssh', [...args, '-o', 'ExitOnForwardFailure=yes', '-N', '-L', `127.0.0.1:${port}:127.0.0.1:${remotePort}`, target], { detached: true, stdio: ['ignore', 'ignore', 'pipe'] });
  let alive = true, stderr = '';
  child.stderr?.on('data', b => { if (stderr.length < 4096) stderr += b.toString(); });
  child.on('exit', () => { alive = false; }); child.on('error', () => { alive = false; });
  const assertAlive = () => { if (!alive) fail('TUNNEL', 'Owned SSH forward was lost.', { failureClass: classifySshFailure(stderr) }); };
  const close = async () => {
    const exited = alive ? new Promise(resolve => { const timer = setTimeout(() => { terminate(child, 'SIGKILL'); resolve(); }, 2000); child.once('close', () => { clearTimeout(timer); resolve(); }); }) : Promise.resolve();
    terminate(child); await exited;
  };
  try {
    const deadline = performance.now() + timeoutMs;
    while (true) {
      assertAlive();
      try { await probe(port); assertAlive(); return { port, assertAlive, close }; } catch (e) { if (e instanceof ComputeError) throw e; }
      if (performance.now() >= deadline) fail('TUNNEL', 'The owned loopback forward did not return RESP PONG.');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  } catch (e) { await close(); throw e; }
}
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export function writeBundle(bundle, directory, runId, revision) {
  if (bundle?.manifest?.runId !== runId || bundle.manifest.revision !== revision || !Array.isArray(bundle.files) || JSON.stringify(bundle.files.map(({ ref, bytes, sha256 }) => ({ ref, bytes, sha256 }))) !== JSON.stringify(bundle.manifest.artifacts)) fail('EVIDENCE_INTEGRITY', 'Returned evidence identity differs from the requested run.');
  let total = 0; const refs = new Set(), admitted = [];
  for (const file of bundle.files) {
    if (!/^[a-zA-Z0-9_.\/-]+$/.test(file.ref) || file.ref.startsWith('/') || file.ref.split('/').some(p => !p || p === '..' || p === '.') || refs.has(file.ref)) fail('EVIDENCE_INTEGRITY', 'Invalid or duplicate evidence reference.');
    refs.add(file.ref);
    const bytes = Buffer.from(file.base64, 'base64'); total += bytes.length;
    if (bytes.toString('base64') !== file.base64 || bytes.length !== file.bytes || total > MAX_EVIDENCE_BYTES || digest(bytes) !== file.sha256) fail('EVIDENCE_INTEGRITY', 'Returned evidence bytes failed integrity or size checks.');
    admitted.push({ ref: file.ref, bytes });
  }
  // Admit the whole bundle before writing any of its bytes.
  for (const file of admitted) {
    const target = path.join(directory, 'remote', file.ref); mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, file.bytes, { flag: 'wx', mode: 0o600 });
  }
  writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify(bundle.manifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  return bundle.manifest;
}
function freshDirectory(output) {
  const axi = path.resolve('.axi'), target = path.resolve(output);
  if (!target.startsWith(axi + path.sep) || existsSync(target)) fail('EVIDENCE_EXISTS', 'Select a fresh ignored .axi/ evidence directory.');
  mkdirSync(axi, { recursive: true });
  let current = path.dirname(target);
  while (!existsSync(current)) current = path.dirname(current);
  if (!realpathSync(current).startsWith(realpathSync(axi)) || lstatSync(current).isSymbolicLink()) fail('EVIDENCE_INTEGRITY', 'Evidence parent escapes the ignored directory.');
  mkdirSync(path.dirname(target), { recursive: true }); mkdirSync(target);
  return target;
}
async function localRevision() {
  const head = await execute('git', ['rev-parse', 'HEAD']);
  const dirty = await execute('git', ['status', '--porcelain', '--untracked-files=no']);
  if (head.exitCode !== 0 || dirty.exitCode !== 0 || dirty.stdout.trim()) fail('REVISION_MISMATCH', 'Commit tracked changes before remote proof.');
  return head.stdout.trim();
}
export async function invoke(options, { call = remoteCall, forward = openForward, revision = localRevision } = {}) {
  const { operation, target = 'm3-ultra', job, output, config = loadConfig(), runId = randomUUID() } = options;
  validateConfig(config, target);
  if (!['doctor', 'run', 'collect'].includes(operation) || (operation === 'run' && !Object.hasOwn(JOBS, job))) fail('INVALID_REQUEST', 'Select doctor, collect or an allowlisted run job.');
  const directory = output ? freshDirectory(output) : null;
  if (operation !== 'doctor' && !directory) fail('INVALID_REQUEST', 'Run/collect requires a fresh ignored output directory.');
  const started = performance.now(), controller = new AbortController();
  const abort = () => controller.abort(); process.once('SIGINT', abort); process.once('SIGTERM', abort);
  let result, identity;
  try {
    const head = await revision();
    identity = { target, orchestrationHostRef: 'host:orchestration-laptop', executionHostRef: `host:${target}`, orchestrationArchitecture: arch(), orchestrationNodeVersion: process.version, revision: head, runId };
    if (operation === 'collect') {
      const bundle = await call(target, config, { operation: 'collect', runId }, controller.signal);
      const manifest = writeBundle(bundle, directory, runId, head);
      result = { ...JSON.parse(readFileSync(path.join(directory, 'remote/result.json'), 'utf8')), ...identity, evidence: manifest, recovered: true };
    } else {
      const doctor = await call(target, config, { operation: 'doctor' }, controller.signal);
      if (doctor.status !== 'ok') { result = { ...doctor, ...identity }; }
      else {
        requireRevision(doctor.snapshot, head);
        const tunnelStart = performance.now(), tunnel = await forward(target, SERVICES.operational.port);
        try { tunnel.assertAlive(); } finally { await tunnel.close(); }
        const tunnelValidationMs = performance.now() - tunnelStart;
        if (operation === 'doctor') result = { ...doctor, ...identity, transport: 'strict-keyed-ssh-and-loopback-forward', tunnel: { bind: '127.0.0.1', remotePort: SERVICES.operational.port, pong: true, closed: true }, tunnelValidationMs };
        else {
          const remote = await call(target, config, { operation: 'run', job, revision: head, runId }, controller.signal);
          result = { ...remote, ...identity, transport: 'allowlisted-remote-job', tunnelValidationMs };
          if (remote.evidence) {
            const bundle = await call(target, config, { operation: 'collect', runId }, controller.signal);
            result.evidence = writeBundle(bundle, directory, runId, head);
          }
        }
      }
    }
  } catch (error) { result = outcomeError(error, { ...identity, target, runId }); }
  finally { process.removeListener('SIGINT', abort); process.removeListener('SIGTERM', abort); }
  result.laptopElapsedMs = performance.now() - started;
  result.laptopResourceUsage = process.resourceUsage();
  result.latencyScope = 'Laptop elapsed includes SSH startup, readiness, remote execution and evidence transfer. remoteJobMs is measured on compute host; no blended workload benchmark is claimed.';
  if (directory) writeFileSync(path.join(directory, 'result.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  return result;
}
