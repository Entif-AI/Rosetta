import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { expect, it } from 'vitest';
import { bindingLedgerPath, withIssueLedger } from './issue-ledger';
it('shares one durable issue ledger across Git worktrees', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'entif-ledger-'));
  const git = (args: string[]) => execFileSync('git', args, { cwd: root, stdio: 'pipe' });
  try {
    git(['init']); git(['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--allow-empty', '-m', 'fixture']);
    const second = path.join(root, 'second'); git(['worktree', 'add', '--detach', second]);
    await withIssueLedger(root, 'Entif-AI/Rosetta', 'promotion', true, async () => {
      await expect(withIssueLedger(second, 'Entif-AI/Rosetta', 'promotion', true, async () => undefined)).rejects.toThrow();
    });
    expect(bindingLedgerPath(second, 'Entif-AI/Rosetta', 'promotion')).toBe(bindingLedgerPath(root, 'entif-ai/rosetta', 'promotion'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
