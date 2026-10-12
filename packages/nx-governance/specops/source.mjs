import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  renameSync,
  rmSync,
} from 'node:fs';
import path from 'node:path';
import { localFile } from './plans.mjs';
export function installSource(pin, target) {
  if (!/^[a-f0-9]{40}$/.test(pin.commit))
    throw new Error('exact commit required');
  const git = (...args) =>
    execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  localFile(path.dirname(path.resolve(target)), path.basename(target));
  if (!existsSync(target)) {
    mkdirSync(path.dirname(target), { recursive: true });
    const staged = mkdtempSync(
      path.join(path.dirname(target), '.' + path.basename(target) + '-stage-')
    );
    try {
      git('clone', '--no-checkout', pin.repository, staged);
      git('-C', staged, 'checkout', '--detach', pin.commit);
      if (
        git('-C', staged, 'rev-parse', 'HEAD') !== pin.commit ||
        git('-C', staged, 'status', '--porcelain')
      )
        throw new Error('staged source is not pinned and clean');
      if (existsSync(target))
        throw new Error(
          'source activation collision; preserve existing checkout'
        );
      renameSync(staged, target);
    } finally {
      if (existsSync(staged)) rmSync(staged, { recursive: true, force: true });
    }
  }
  if (git('-C', target, 'rev-parse', 'HEAD') !== pin.commit)
    throw new Error('revision mismatch; use a new install directory');
  if (git('-C', target, 'status', '--porcelain'))
    throw new Error('local changes; preserve them before reinstalling');
  return { commit: pin.commit, path: target };
}
