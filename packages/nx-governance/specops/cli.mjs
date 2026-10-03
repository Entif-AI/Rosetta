import process from 'node:process';
import console from 'node:console';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export function execute(command, args = [], options = {}) {
  const root = options.root ?? process.cwd();
  const run = options.run ?? spawnSync;
  if (!['next', 'dag', 'dashboard', 'admit'].includes(command))
    throw new Error('unsupported command; use next|dag|dashboard|admit');
  if (command === 'admit') {
    if (args.length) throw new Error('admit takes no flags');
    const config =
      options.config ??
      JSON.parse(
        readFileSync(path.join(root, 'governance/governance.config.json'))
      );
    if (!/^[a-zA-Z0-9_-]+$/.test(config.projectName))
      throw new Error('invalid governance project identity');
    return run(
      'pnpm',
      ['exec', 'nx', 'run', `${config.projectName}:merge-admission`],
      { cwd: root, encoding: 'utf8', stdio: options.stdio ?? 'pipe' }
    );
  }
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
if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? '')) {
  try {
    const result = execute(
      process.argv[2] ?? 'dashboard',
      process.argv.slice(3),
      {
        stdio: 'inherit',
        config:
          process.argv[2] === 'admit'
            ? JSON.parse(
                readFileSync('tools/semantic-governance/governance.config.json')
              )
            : undefined,
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
