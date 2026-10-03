import process from 'node:process';
import console from 'node:console';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

export function installSource(pin, target) {
  if (!/^[a-f0-9]{40}$/.test(pin.commit))
    throw new Error('exact commit required');
  const git = (...args) =>
    execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  if (!existsSync(target)) {
    mkdirSync(path.dirname(target), { recursive: true });
    git('clone', '--no-checkout', pin.repository, target);
    git('-C', target, 'checkout', '--detach', pin.commit);
  }
  if (git('-C', target, 'rev-parse', 'HEAD') !== pin.commit)
    throw new Error('revision mismatch; use a new install directory');
  if (git('-C', target, 'status', '--porcelain'))
    throw new Error('local changes; preserve them before reinstalling');
  return { commit: pin.commit, path: target };
}
const main =
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1] ?? '');
if (main) {
  try {
    const pins = JSON.parse(
      readFileSync(new URL('./upstreams.json', import.meta.url))
    );
    const name = process.argv[2] ?? 'axi';
    if (process.argv.length > 3 || !pins[name])
      throw new Error(
        'usage: node tools/axi/setup.mjs axi|quota-axi|gh-axi|npm-axi|specops'
      );
    const installed = installSource(
      pins[name],
      path.resolve('.axi/upstreams', name)
    );
    console.log(
      `source: ${name}\ncommit: ${installed.commit}\npath: ${installed.path}\nrole: pinned on-demand reference`
    );
  } catch (error) {
    console.log(
      `error: ${JSON.stringify(
        error.message
      )}\nhelp: preserve local state and inspect tools/axi/upstreams.json`
    );
    process.exitCode = 1;
  }
}
