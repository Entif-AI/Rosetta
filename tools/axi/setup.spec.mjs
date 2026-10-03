import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { installSource } from './setup.mjs';
test('pinned source install is repeatable and refuses local edits or wrong revisions', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'axi-pin-'));
  const source = path.join(root, 'source');
  execFileSync('git', ['init', '-q', source]);
  writeFileSync(path.join(source, 'README.md'), 'immutable reference');
  execFileSync('git', ['-C', source, 'add', '.']);
  execFileSync('git', [
    '-C',
    source,
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '-qm',
    'fixture',
  ]);
  const commit = execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  const pin = { repository: source, commit };
  const target = path.join(root, 'installed');
  installSource(pin, target);
  installSource(pin, target);
  assert.equal(
    execFileSync('git', ['-C', target, 'rev-parse', 'HEAD'], {
      encoding: 'utf8',
    }).trim(),
    commit
  );
  writeFileSync(path.join(target, 'README.md'), 'local edit');
  assert.throws(() => installSource(pin, target), /local changes/);
  assert.throws(() =>
    installSource({ ...pin, commit: '0'.repeat(40) }, path.join(root, 'bad'))
  );
});
