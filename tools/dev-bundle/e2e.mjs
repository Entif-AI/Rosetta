import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const specify = process.env.SPECIFY_BIN ?? 'specify';
const python = process.env.SPECIFY_PYTHON ?? (specify.includes('/') ? path.join(path.dirname(specify), 'python') : 'python3');
const temporary = mkdtempSync(path.join(tmpdir(), 'entif-bundle-e2e-'));
const report = { formatVersion: 1, issue: '#1701', proofs: [], publication: 'local-packed artifacts only' };
function run(command, args, cwd = root, expectFailure = false) {
  const runtimePath = python.includes('/') ? `${path.dirname(python)}:${process.env.PATH}` : process.env.PATH;
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout: 180_000, maxBuffer: 16 * 1024 * 1024, env: { ...process.env, PATH: runtimePath, NX_DAEMON: 'false', CI: 'true' } });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  if (expectFailure) assert.notEqual(result.status, 0, output);
  else assert.equal(result.status, 0, `${command} ${args.join(' ')}\n${output}`);
  return output;
}
const load = (file) => JSON.parse(readFileSync(file, 'utf8'));
const save = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const nx = (args, cwd, fail = false) => run('pnpm', ['exec', 'nx', ...args], cwd, fail);
try {
  report.specifyVersion = run(specify, ['version']);
  const artifacts = path.join(temporary, 'artifacts'); mkdirSync(artifacts);
  run('pnpm', ['--filter', '@entif-ai/nx-governance', 'pack', '--pack-destination', artifacts]);
  const tar = path.join(artifacts, readdirSync(artifacts).find((file) => file.endsWith('.tgz')));
  report.packageSha256 = createHash('sha256').update(readFileSync(tar)).digest('hex');
  const consumer = path.join(temporary, 'consumer'); mkdirSync(consumer);
  save(path.join(consumer, 'package.json'), { name: 'federated-entif-fixture', private: true });
  save(path.join(consumer, 'nx.json'), { analytics: false, targetDefaults: { local: { cache: true } } });
  mkdirSync(path.join(consumer, 'governance'));
  writeFileSync(path.join(consumer, 'AUTHORITY.md'), 'Consumer-local product and architecture authority.');
  const config = { schemaVersion: 1, projectName: 'consumer-governance', branchPolicy: 'existing-authorized', authoritySources: ['AUTHORITY.md'], projectionPath: '.specify/memory/constitution.json',
    checks: { local: { owner: 'AUTHORITY.md', command: 'node -e "process.exit(0)"', inputs: ['{workspaceRoot}/AUTHORITY.md', '{workspaceRoot}/package.json', '{workspaceRoot}/pnpm-lock.yaml'] } } };
  const configFile = path.join(consumer, 'governance/governance.config.json'); save(configFile, config);
  run('git', ['init', '-b', 'main'], consumer);
  run('git', ['config', 'user.name', 'Entif fixture'], consumer); run('git', ['config', 'user.email', 'fixture@example.invalid'], consumer);
  // This is a private temporary workspace, not a second Rosetta integration branch.
  writeFileSync(path.join(consumer, '.gitignore'), 'node_modules\ndist\n.nx\n');
  run('git', ['add', '.'], consumer); run('git', ['commit', '-m', 'chore: fixture baseline'], consumer);
  run('pnpm', ['add', '-D', 'nx@22.6.5', tar, '--ignore-scripts'], consumer);
  nx(['g', '@entif-ai/nx-governance:init'], consumer);
  const originalNx = readFileSync(path.join(consumer, 'nx.json'), 'utf8');
  nx(['g', '@entif-ai/nx-governance:init'], consumer);
  assert.equal(readFileSync(path.join(consumer, 'nx.json'), 'utf8'), originalNx);
  nx(['sync'], consumer); nx(['sync:check'], consumer);
  nx(['run', 'consumer-governance:merge-admission'], consumer);
  nx(['run', 'consumer-governance:merge-admission'], consumer);
  assert.equal(load(path.join(consumer, 'dist/governance/consumer-governance/merge-admission.json')).disposition, 'merge-admissible');
  assert.equal(load(path.join(consumer, 'nx.json')).nxCloudId, undefined);
  assert.equal(readFileSync(path.join(consumer, 'AUTHORITY.md'), 'utf8'), 'Consumer-local product and architecture authority.');
  assert.equal(run('git', ['branch', '--show-current'], consumer).trim(), 'main');
  report.proofs.push('local-packed plugin install, idempotent init/sync, cacheable admission, local authority preservation');
  const bundle = path.join(consumer, 'node_modules/@entif-ai/nx-governance/spec-kit');
  run(specify, ['init', '--here', '--integration', 'codex', '--ignore-agent-tools', '--non-interactive', '--force'], consumer);
  run(python, [path.join(bundle, 'install.py')], consumer);
  nx(['sync'], consumer); nx(['sync:check'], consumer);
  const components = load(path.join(consumer, '.specify/bundle-records.json'));
  run(python, [path.join(bundle, 'install.py')], consumer);
  // Upstream updates its operational updated_at timestamp even for a no-op install.
  assert.deepEqual(load(path.join(consumer, '.specify/bundle-records.json')).bundles, components.bundles);
  run('bash', [path.join(consumer, '.specify/scripts/bash/create-new-feature.sh'), '--json', 'Federated specification fixture'], consumer);
  assert.equal(run('git', ['branch', '--show-current'], consumer).trim(), 'main');
  assert.ok(readdirSync(path.join(consumer, '.agents/skills')).some((file) => file.includes('rosetta-governance')));
  const presetRegistry = path.join(consumer, '.specify/presets/.registry');
  const priorities = load(presetRegistry); priorities.presets['entif-rosetta'].priority = 7; save(presetRegistry, priorities);
  run(specify, ['bundle', 'build', '--path', bundle, '--output', artifacts], consumer);
  const zip = path.join(artifacts, readdirSync(artifacts).find((file) => file.endsWith('.zip')));
  const bytes = readFileSync(zip);
  run(specify, ['bundle', 'build', '--path', bundle, '--output', artifacts], consumer);
  assert.deepEqual(readFileSync(zip), bytes);
  report.bundleSha256 = createHash('sha256').update(bytes).digest('hex');
  report.proofs.push('Codex integration with offline pinned bundle, idempotent install, reproducible bundle ZIP');
  // Prior prototype fixture uses format 0. No historical published release is implied.
  const prior = path.join(temporary, 'prior'); mkdirSync(prior);
  run('tar', ['-xzf', tar, '-C', prior]);
  const priorPackage = path.join(prior, 'package/package.json'); const prototype = load(priorPackage); prototype.version = '0.0.1'; save(priorPackage, prototype);
  const priorArtifacts = path.join(temporary, 'prior-artifacts'); mkdirSync(priorArtifacts);
  run('pnpm', ['pack', '--pack-destination', priorArtifacts], path.join(prior, 'package'));
  const priorTar = path.join(priorArtifacts, readdirSync(priorArtifacts).find((file) => file.endsWith('.tgz')));
  run('pnpm', ['add', '-D', priorTar, '--ignore-scripts'], consumer); save(configFile, { ...config, schemaVersion: 0 });
  run('pnpm', ['add', '-D', tar, '--ignore-scripts'], consumer);
  save(path.join(consumer, 'migrations.json'), { migrations: [{ version: '0.1.0', name: 'config-v1', package: '@entif-ai/nx-governance', description: 'Upgrade prototype fixture configuration' }] });
  nx(['migrate', '--run-migrations=migrations.json'], consumer);
  assert.deepEqual(load(configFile), config);
  nx(['g', '@entif-ai/nx-governance:init'], consumer); nx(['sync'], consumer); nx(['sync:check'], consumer); nx(['run', 'consumer-governance:merge-admission'], consumer);
  run(python, [path.join(bundle, 'install.py'), '--refresh'], consumer);
  assert.equal(load(presetRegistry).presets['entif-rosetta'].priority, 7);
  assert.equal(run('git', ['branch', '--show-current'], consumer).trim(), 'main');
  report.proofs.push('prior prototype package install and standard nx migrate runner; bundle refresh preserves current branch');
  run('pnpm', ['add', '-D', 'nx@22.6.4', '--ignore-scripts'], consumer);
  nx(['migrate', 'nx@22.6.5', '--interactive=false'], consumer);
  // nx migrate updates package.json; the upgrade install must refresh its lockfile in CI too.
  run('pnpm', ['install', '--ignore-scripts', '--no-frozen-lockfile'], consumer);
  if (readdirSync(consumer).includes('migrations.json')) nx(['migrate', '--run-migrations=migrations.json'], consumer);
  nx(['g', '@entif-ai/nx-governance:init'], consumer); nx(['sync:check'], consumer); nx(['run', 'consumer-governance:merge-admission'], consumer);
  report.proofs.push('real Nx 22.6.4 -> 22.6.5 package migration workflow and gates');
  save(configFile, { ...config, branchPolicy: 'branch-per-spec' });
  nx(['g', '@entif-ai/nx-governance:init'], consumer, true);
  assert.equal(readFileSync(path.join(consumer, 'nx.json'), 'utf8'), originalNx);
  save(configFile, config);
  report.proofs.push('incompatible branch-per-spec configuration rejected without mutation');
  mkdirSync(path.join(root, 'dist/dev-bundle'), { recursive: true }); save(path.join(root, 'dist/dev-bundle/conformance.json'), report);
  process.stdout.write(`${report.proofs.join('\n')}\n`);
} finally { rmSync(temporary, { recursive: true, force: true }); }
