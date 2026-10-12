import { execFileSync } from 'node:child_process';
import { closeSync, existsSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { digest } from './source-evidence';
import type { TaskLedger } from './issue-sync';

export function bindingLedgerPath(root: string, repository: string, feature: string) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) || !/^[a-z][a-z0-9-]*$/.test(feature)) throw new Error('Invalid ledger identity.');
  if (existsSync(path.join(root, '.specify/issue-bindings', `${feature}.json`))) throw new Error('Worktree-local ledger requires explicit reconciliation into the repository-common ledger.');
  const common = realpathSync(execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { cwd: root, encoding: 'utf8' }).trim());
  const relative = ['entif-issue-bindings', digest(repository.toLowerCase()), `${feature}.json`];
  let current = common;
  for (const part of relative) {
    current = path.join(current, part);
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error('Binding ledger cannot follow symlink redirection.');
  }
  return current;
}

/** Single coordinator per Git common directory. Locks are never broken automatically after a crash. */
export async function withIssueLedger<T>(root: string, repository: string, feature: string, apply: boolean,
  run: (store: { load: () => TaskLedger | undefined; save: (ledger: TaskLedger) => void }) => Promise<T>) {
  const file = bindingLedgerPath(root, repository, feature);
  const lockFile = `${file}.lock`;
  let lock: number | undefined;
  if (apply) {
    mkdirSync(path.dirname(file), { recursive: true });
    lock = openSync(lockFile, 'wx');
  }
  try {
    if (lock !== undefined) { writeFileSync(lock, `${process.pid}\n`); fsyncSync(lock); }
    return await run({
      load: () => existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) as TaskLedger : undefined,
      save: (ledger) => {
        if (!apply) throw new Error('Preview cannot mutate the ledger.');
        const temporary = `${file}.${process.pid}.tmp`;
        const descriptor = openSync(temporary, 'wx');
        try {
          try { writeFileSync(descriptor, `${JSON.stringify(ledger, null, 2)}\n`); fsyncSync(descriptor); }
          finally { closeSync(descriptor); }
          renameSync(temporary, file);
          const directory = openSync(path.dirname(file), 'r');
          try { fsyncSync(directory); } finally { closeSync(directory); }
        } finally { rmSync(temporary, { force: true }); }
      },
    });
  } finally { if (lock !== undefined) { closeSync(lock); rmSync(lockFile); } }
}
