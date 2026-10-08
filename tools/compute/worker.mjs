import { readFileSync, writeFileSync, mkdirSync, readdirSync, lstatSync, openSync, closeSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { homedir, arch, platform, release, cpus, totalmem } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { execute } from './process.mjs';
import { VERSION, JOBS, SERVICES, MAX_EVIDENCE_BYTES, fail, validateRequest, validateRuntime, requireRevision, outcomeError } from './contract.mjs';

export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const root = process.cwd();
function readConfig() {
  const file = path.join(homedir(), '.config/rosetta/compute-worker.json');
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch (e) { if (e.code === 'ENOENT') return {}; fail('INVALID_REQUEST', 'Worker host-local configuration is invalid.'); }
}
function environment(config) {
  const env = { ...process.env, PATH: config.path ?? process.env.PATH, NX_DAEMON: 'false', TRACE_GRAPH_ISOLATED: 'true' };
  for (const key of Object.keys(env)) if (key.startsWith('TRACE_GRAPHITI_') || key.startsWith('TRACE_FALKORDB_') || key === 'OPENAI_API_KEY') delete env[key];
  if (config.python) env.TRACE_GRAPHITI_PYTHON = config.python;
  if (config.inference) {
    const { baseUrl, model, embedder, reranker } = config.inference;
    let url;
    try { url = new URL(baseUrl); } catch { fail('INVALID_REQUEST', 'Invalid host-local inference URL.'); }
    if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.username || url.password || url.search || url.hash || url.pathname.replace(/\/$/, '') !== '/v1') fail('INVALID_REQUEST', 'Inference must use credential-free loopback /v1.');
    Object.assign(env, { TRACE_GRAPHITI_PROVIDER: 'lmstudio', TRACE_GRAPHITI_BASE_URL: baseUrl, TRACE_GRAPHITI_ENDPOINT_REF: 'endpoint:m3-ultra-lmstudio', TRACE_GRAPHITI_HOST_REF: 'host:m3-ultra', TRACE_GRAPHITI_MODEL: model, TRACE_GRAPHITI_EMBEDDER: embedder, TRACE_GRAPHITI_RERANKER: reranker });
  }
  return env;
}
async function command(exe, args, env, options = {}) {
  const result = await execute(exe, args, { env, ...options });
  if (result.exitCode !== 0 || result.reason) fail('TASK_EXECUTION', 'Bounded worker command failed.', { executable: path.basename(exe), exitCode: result.exitCode, reason: result.reason });
  return result.stdout.trim();
}
export async function inspect(config = readConfig()) {
  const env = environment(config);
  const revision = await command('git', ['rev-parse', 'HEAD'], env);
  const dirty = Boolean(await command('git', ['status', '--porcelain', '--untracked-files=no'], env));
  const services = {};
  for (const [name, spec] of Object.entries(SERVICES)) {
    try {
      const info = JSON.parse(await command('docker', ['inspect', spec.container], env))[0];
      const running = info.State.Running;
      const modules = running ? JSON.parse(await command('docker', ['exec', spec.container, 'redis-cli', '--json', 'MODULE', 'LIST'], env)) : [];
      const graphs = running ? JSON.parse(await command('docker', ['exec', spec.container, 'redis-cli', '--json', 'GRAPH.LIST'], env)) : [];
      services[name] = { container: spec.container, image: info.Config.Image, imageId: info.Image, issue: info.Config.Labels?.['entif.issue'], bindings: info.NetworkSettings.Ports?.['6379/tcp'] ?? [], running, moduleVersion: modules.find(m => m.name === 'graph')?.ver, graphs };
    } catch { services[name] = { running: false }; }
  }
  let graphiti = { available: false }, inference = { configured: false };
  if (config.python) {
    try {
      graphiti = JSON.parse(await command(config.python, ['-c', 'import json,sys,importlib.metadata as m; print(json.dumps(dict(version=m.version("graphiti-core"),clientVersion=m.version("falkordb"),pythonVersion=sys.version.split()[0])))'], env));
    } catch { /* Required jobs reject the unavailable donor below. */ }
  }
  if (config.inference) {
    try {
      const response = await fetch(config.inference.baseUrl.replace(/\/$/, '') + '/models', { signal: AbortSignal.timeout(5000) });
      const result = await response.json();
      inference = { configured: response.ok, models: result.data?.map(m => m.id) ?? [], model: config.inference.model, embedder: config.inference.embedder, reranker: config.inference.reranker };
    } catch { /* Explicit provider-unavailable result; no provider substitution. */ }
  }
  let serviceResources = null;
  try {
    const lines = await command('docker', ['stats', '--no-stream', '--format', '{{json .}}', ...Object.values(SERVICES).map(s => s.container)], env, { timeoutMs: 10000 });
    serviceResources = lines.split('\n').map(line => { const row = JSON.parse(line); return { container: row.Name, cpuPercent: row.CPUPerc, memoryUsage: row.MemUsage, memoryPercent: row.MemPerc }; });
  } catch { /* Resource observation is optional and never fabricated. */ }
  return { target: 'm3-ultra', hostRef: 'host:m3-ultra', revision, dirty, architecture: arch(), platform: platform(), osRelease: release(), cpuModel: cpus()[0]?.model, cpuCount: cpus().length, memoryBytes: totalmem(), nodeVersion: process.version, services, graphiti, inference, serviceResources, resourceScope: 'Samples of persistent containers; worker CPU excludes persistent graph/model process CPU.' };
}
function sourceHashes(workingRoot = root) {
  const directories = ['packages/source-substrate/test-vectors/trace', 'packages/ingress-refinery/test-vectors/trace', 'tools/trace-graph/evidence', 'tools/trace-temporal/evidence', 'tools/trace-temporal/fixtures', 'tools/trace-live/fixtures'];
  const result = {};
  for (const directory of directories) for (const name of readdirSync(path.join(workingRoot, directory)).sort()) {
    const file = `${directory}/${name}`;
    if (lstatSync(path.join(workingRoot, file)).isFile()) result[file] = sha256(readFileSync(path.join(workingRoot, file)));
  }
  return result;
}
export function collectArtifacts(directory) {
  const artifacts = []; let total = 0;
  const visit = relative => {
    for (const name of readdirSync(path.join(directory, relative)).sort()) {
      const ref = path.posix.join(relative, name), file = path.join(directory, ref), info = lstatSync(file);
      if (info.isSymbolicLink()) fail('EVIDENCE_INTEGRITY', 'Evidence cannot contain symbolic links.');
      if (info.isDirectory()) visit(ref);
      else if (info.isFile() && name !== 'manifest.json') {
        total += info.size;
        if (total > MAX_EVIDENCE_BYTES) fail('EVIDENCE_INTEGRITY', 'Evidence bundle exceeds the bounded transfer limit.');
        const bytes = readFileSync(file); artifacts.push({ ref, bytes: bytes.length, sha256: sha256(bytes) });
      }
    }
  };
  visit(''); return artifacts;
}
export async function handle(request, { config = readConfig(), inspectRuntime = inspect, runCommand = execute, workingRoot = root, lockPath = path.join(homedir(), '.cache/rosetta/compute.lock') } = {}) {
  validateRequest(request);
  const started = performance.now();
  if (request.operation === 'doctor') {
    const snapshot = await inspectRuntime(config);
    for (const job of ['akasha.operational.prove', 'akasha.temporal.prove']) validateRuntime(snapshot, job);
    return { profile: 'rosetta-compute-result-v1', version: VERSION, status: 'ok', target: 'm3-ultra', snapshot, remoteElapsedMs: performance.now() - started };
  }
  const workingRunRoot = path.join(workingRoot, '.axi/compute'), directory = path.join(workingRunRoot, request.runId);
  if (request.operation === 'collect') {
    if (!lstatSync(directory).isDirectory() || lstatSync(directory).isSymbolicLink()) fail('EVIDENCE_INTEGRITY', 'Invalid evidence directory.');
    const manifest = JSON.parse(readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
    const artifacts = collectArtifacts(directory);
    if (JSON.stringify(artifacts) !== JSON.stringify(manifest.artifacts)) fail('EVIDENCE_INTEGRITY', 'Remote evidence changed after its receipt.');
    return { manifest, files: artifacts.map(a => ({ ...a, base64: readFileSync(path.join(directory, a.ref)).toString('base64') })) };
  }
  const spec = JOBS[request.job], env = environment(config), controller = new AbortController();
  const lock = lockPath;
  mkdirSync(path.dirname(lock), { recursive: true });
  try { mkdirSync(lock); } catch (e) { if (e.code === 'EEXIST') fail('RESOURCE_BUSY', 'Another or interrupted compute worker owns the fixture lock; reconcile before retry.'); throw e; }
  writeFileSync(path.join(lock, 'owner.json'), JSON.stringify({ ...request, pid: process.pid, startedAt: new Date().toISOString() }));
  let snapshot, before, result, mutated = false, created = false, fd;
  const abort = () => controller.abort();
  process.once('SIGTERM', abort); process.once('SIGHUP', abort); process.once('SIGINT', abort);
  try {
    mkdirSync(workingRunRoot, { recursive: true });
    try { mkdirSync(directory); created = true; } catch (e) { if (e.code === 'EEXIST') fail('EVIDENCE_EXISTS', 'Run identity already has evidence; select a fresh run.'); throw e; }
    before = sourceHashes(workingRoot);
    snapshot = await inspectRuntime(config); requireRevision(snapshot, request.revision); validateRuntime(snapshot, request.job);
    fd = openSync(path.join(directory, 'execution.log'), 'wx', 0o600);
    if (spec.inference) {
      env.TRACE_GRAPHITI_CAPABILITY_PROOF = path.join(directory, 'provider.json');
      const probe = await runCommand(config.python, ['tools/compute/probe-provider.py', env.TRACE_GRAPHITI_CAPABILITY_PROOF], { env, logFd: fd, timeoutMs: 150000, signal: controller.signal });
      if (probe.exitCode !== 0 || probe.reason) fail('INFERENCE_UNAVAILABLE', 'The local inference capability probe failed; no graph task was dispatched.');
    }
    const output = path.relative(workingRoot, path.join(directory, 'proof.json'));
    const args = request.job === 'akasha.build'
      ? ['exec', 'nx', 'run-many', '-t', 'build', '-p', 'source-substrate,ingress-refinery,projection-adapters,rosetta-store']
      : [spec.script, request.job === 'akasha.model-off' ? '--output-dir' : '--output', request.job === 'akasha.model-off' ? path.relative(workingRoot, path.join(directory, 'model-off')) : output];
    const jobStart = performance.now(); mutated = true;
    const child = await runCommand(request.job === 'akasha.build' ? 'pnpm' : process.execPath, args, { cwd: workingRoot, env, logFd: fd, timeoutMs: spec.timeoutMs, signal: controller.signal });
    const remoteJobMs = performance.now() - jobStart;
    if (child.exitCode !== 0 || child.reason) fail('TASK_EXECUTION', 'Proof job failed; source evidence and diagnostic output are retained.', { exitCode: child.exitCode, reason: child.reason, remoteJobMs });
    result = { profile: 'rosetta-compute-result-v1', version: VERSION, status: 'ok', target: 'm3-ultra', job: request.job, runId: request.runId, revision: request.revision, remoteJobMs };
  } catch (error) { result = outcomeError(error, { target: 'm3-ultra', job: request.job, runId: request.runId, revision: request.revision }); }
  finally {
    try {
    if (fd !== undefined) closeSync(fd);
    const cleanup = [];
    if (mutated) for (const [service, graphs] of Object.entries(spec.graphs)) for (const graph of graphs) {
      try {
        const names = JSON.parse(await command('docker', ['exec', SERVICES[service].container, 'redis-cli', '--json', 'GRAPH.LIST'], env));
        if (names.includes(graph)) await command('docker', ['exec', SERVICES[service].container, 'redis-cli', '--json', 'GRAPH.DELETE', graph], env);
        cleanup.push({ service, graph, absent: true });
      } catch { cleanup.push({ service, graph, absent: false }); }
    }
    if (result) {
      const after = sourceHashes(workingRoot);
      if (before && JSON.stringify(before) !== JSON.stringify(after)) Object.assign(result, { status: 'failed', code: 'EVIDENCE_INTEGRITY', message: 'Source or accepted evidence changed during execution.' });
      if (cleanup.some(c => !c.absent)) { result.status = 'blocked'; result.code = 'CLEANUP_REQUIRED'; result.message = 'Owned scratch cleanup needs reconciliation.'; }
      Object.assign(result, { snapshot, preservedDigests: before, sourcePreserved: Boolean(before && JSON.stringify(before) === JSON.stringify(after)), cleanup, remoteElapsedMs: performance.now() - started, workerResourceUsage: process.resourceUsage() });
      // Collision/reused-run failures must never overwrite a previous receipt.
      if (created) {
        writeFileSync(path.join(directory, 'result.json'), JSON.stringify(result) + '\n', { flag: 'wx', mode: 0o600 });
        const manifest = { runId: request.runId, revision: request.revision, artifacts: collectArtifacts(directory) };
        writeFileSync(path.join(directory, 'manifest.json'), JSON.stringify(manifest) + '\n', { flag: 'wx', mode: 0o600 });
        result.evidence = manifest;
      }
    }
    } finally {
      rmSync(lock, { recursive: true });
      process.removeListener('SIGTERM', abort); process.removeListener('SIGHUP', abort); process.removeListener('SIGINT', abort);
    }
  }
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let input = '';
  try {
    for await (const chunk of process.stdin) { input += chunk; if (input.length > 4096) fail('INVALID_REQUEST', 'Request exceeds 4096 bytes.'); }
    const result = await handle(JSON.parse(input)); process.stdout.write(JSON.stringify(result) + '\n');
  } catch (error) { process.stdout.write(JSON.stringify(outcomeError(error, { target: 'm3-ultra' })) + '\n'); }
}
