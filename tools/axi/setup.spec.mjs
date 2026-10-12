import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
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
test('failed acquisition leaves no final checkout and can retry safely', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'axi-retry-'));
  const target = path.join(root, 'installed');
  assert.throws(() =>
    installSource(
      { repository: path.join(root, 'missing-donor'), commit: 'a'.repeat(40) },
      target
    )
  );
  assert.equal(existsSync(target), false);
  // Leftover staging from a killed clone must not poison or be overwritten by retry.
  const donor = path.join(root, 'donor');
  execFileSync('git', ['init', '-q', donor]);
  writeFileSync(path.join(donor, 'README.md'), 'reference');
  execFileSync('git', ['-C', donor, 'add', '.']);
  execFileSync('git', [
    '-C',
    donor,
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '-qm',
    'fixture',
  ]);
  const commit = execFileSync('git', ['-C', donor, 'rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  const abandoned = path.join(root, '.installed-stage-abandoned');
  execFileSync('git', ['clone', '--no-checkout', donor, abandoned], {
    stdio: 'ignore',
  });
  const failed = path.join(root, 'failed-checkout');
  assert.throws(() =>
    installSource({ repository: donor, commit: '0'.repeat(40) }, failed)
  );
  assert.equal(existsSync(failed), false);
  installSource({ repository: donor, commit }, target);
  assert.equal(
    readFileSync(path.join(target, 'README.md'), 'utf8'),
    'reference'
  );
  assert.ok(existsSync(abandoned));
});
