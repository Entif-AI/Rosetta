import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execute } from './cli.mjs';
test('SpecOps seam delegates to files-first donor and retains native Nx admission ownership', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'specops-seam-'));
  mkdirSync(path.join(root, 'plans'));
  const cli = path.join(root, 'cli.mjs');
  writeFileSync(cli, 'console.log(process.argv.slice(2).join(" "));');
  const result = execute('next', [], { root, cli });
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), 'next');
  assert.throws(() => execute('delete', [], { root, cli }), /unsupported/);
  const commands = [];
  execute('admit', [], {
    root,
    config: { projectName: 'consumer-governance' },
    run: (bin, args) => {
      commands.push([bin, args]);
      return { status: 0, stdout: 'pass' };
    },
  });
  assert.deepEqual(commands, [
    ['pnpm', ['exec', 'nx', 'run', 'consumer-governance:merge-admission']],
  ]);
});

test('donor paths reject malformed plan frontmatter before delegation', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'specops-invalid-'));
  mkdirSync(path.join(root, 'plans'));
  writeFileSync(
    path.join(root, 'plans/bad.md'),
    '---\n{"id":"bad","status":"planned"}\n---\n# Bad\n'
  );
  for (const command of ['next', 'dag', 'dashboard'])
    assert.throws(
      () =>
        execute(command, [], {
          root,
          run: () => assert.fail('must not delegate'),
        }),
      /unsupported donor frontmatter/
    );
});
