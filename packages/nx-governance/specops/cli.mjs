import { isMain } from './entrypoint.mjs';
import { loadGovernance } from './configuration.mjs';
import { loadPlans, localFile } from './plans.mjs';
import { installSource } from './source.mjs';
import { URL } from 'node:url';
import process from 'node:process';
import console from 'node:console';
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
export function execute(command, args = [], options = {}) {
  const root = options.root ?? process.cwd();
  const run = options.run ?? spawnSync;
  if (!['next', 'dag', 'dashboard', 'admit'].includes(command))
    throw new Error('unsupported command; use next|dag|dashboard|admit');
  if (command === 'admit') {
    if (args.length) throw new Error('admit takes no flags');
    const config = options.config ?? loadGovernance(root);
    if (!/^[a-zA-Z0-9_-]+$/.test(config.projectName))
      throw new Error('invalid governance project identity');
    return run(
      'pnpm',
      ['exec', 'nx', 'run', `${config.projectName}:merge-admission`],
      { cwd: root, encoding: 'utf8', stdio: options.stdio ?? 'pipe' }
    );
  }
  loadPlans(root);
  if (!options.cli && !existsSync(localFile(root, '.axi/upstreams/specops')))
    throw new Error('pinned source unavailable; acquire explicitly first');
  if (!options.cli)
    installSource(
      JSON.parse(readFileSync(new URL('./upstreams.json', import.meta.url)))
        .specops,
      localFile(root, '.axi/upstreams/specops')
    );
  const cli =
    options.cli ??
    path.join(
      root,
      '.axi/upstreams/specops/skills/specops/scripts/specops.mjs'
    );
  return run(
    process.execPath,
    [cli, ...(command === 'dashboard' ? [] : [command]), ...args],
    {
      cwd: root,
      encoding: 'utf8',
      timeout: 30000,
      stdio: options.stdio ?? 'pipe',
    }
  );
}
if (isMain(import.meta.url)) {
  try {
    const result = execute(
      process.argv[2] ?? 'dashboard',
      process.argv.slice(3),
      {
        stdio: 'inherit',
      }
    );
    process.exitCode = result.status ?? 1;
  } catch (error) {
    console.log(
      `error: ${JSON.stringify(
        error.message
      )}\nhelp: install pinned SpecOps source and provide project-local governance configuration`
    );
    process.exitCode = 1;
  }
}
