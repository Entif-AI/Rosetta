import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  unlinkSync,
  symlinkSync,
} from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { digest } from './plans.mjs';
import process from 'node:process';
import { hostname } from 'node:os';
import { manageVeneers, recoverVeneerLock } from './install.mjs';
function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'substrate-install-'));
  return root;
}
const payload = { '.specops/runtime.md': 'local-only non-authorizing route' };
const identity = {
  runtime: 'generic',
  version: '0.1.0',
  sourceDigest: 'a'.repeat(64),
  specopsCommit: 'b'.repeat(40),
};
test('managed runtime install is repeatable, refuses edits/deletions and requires explicit source refresh', () => {
  const root = fixture();
  manageVeneers(root, payload, identity);
  const before = readFileSync(
    path.join(root, '.specops/managed-veneers.json'),
    'utf8'
  );
  manageVeneers(root, payload, identity);
  assert.equal(
    readFileSync(path.join(root, '.specops/managed-veneers.json'), 'utf8'),
    before
  );
  writeFileSync(path.join(root, '.specops/runtime.md'), 'local edit');
  assert.throws(
    () => manageVeneers(root, payload, identity, true),
    /edit|deletion/
  );
  writeFileSync(
    path.join(root, '.specops/runtime.md'),
    payload['.specops/runtime.md']
  );
  assert.throws(
    () =>
      manageVeneers(root, payload, {
        ...identity,
        sourceDigest: 'c'.repeat(64),
      }),
    /refresh/
  );
  manageVeneers(
    root,
    payload,
    { ...identity, sourceDigest: 'c'.repeat(64) },
    true
  );
  unlinkSync(path.join(root, '.specops/runtime.md'));
  assert.throws(
    () =>
      manageVeneers(
        root,
        payload,
        { ...identity, sourceDigest: 'c'.repeat(64) },
        true
      ),
    /edit|deletion/
  );
});
test('unmanaged collision/symlink/runtime mismatch are blocked before overwriting', () => {
  const root = fixture();
  mkdirSync(path.join(root, '.specops'));
  writeFileSync(path.join(root, '.specops/runtime.md'), 'human-owned');
  assert.throws(() => manageVeneers(root, payload, identity), /collision/);
  assert.equal(
    readFileSync(path.join(root, '.specops/runtime.md'), 'utf8'),
    'human-owned'
  );
  const linked = fixture();
  symlinkSync(root, path.join(linked, '.specops'));
  assert.throws(() => manageVeneers(linked, payload, identity), /symlink/);
  const installed = fixture();
  manageVeneers(installed, payload, identity);
  assert.throws(
    () =>
      manageVeneers(
        installed,
        payload,
        { ...identity, runtime: 'codex' },
        true
      ),
    /identity/
  );
});

test('interrupted writes resume only exact pending content and reject concurrent ownership', () => {
  const root = fixture();
  const files = { ...payload, '.specops/second.md': 'second route' };
  manageVeneers(root, files, identity);
  const prior = JSON.parse(
    readFileSync(path.join(root, '.specops/managed-veneers.json'), 'utf8')
  );
  const updated = { ...files, '.specops/runtime.md': 'new route' };
  const next = {
    ...prior,
    identity: { ...identity, sourceDigest: 'd'.repeat(64) },
    files: Object.fromEntries(
      Object.entries(updated).map(([file, bytes]) => [file, digest(bytes)])
    ),
  };
  writeFileSync(
    path.join(root, '.specops/pending-veneers.json'),
    JSON.stringify({ desired: next, before: prior.files })
  );
  writeFileSync(
    path.join(root, '.specops/runtime.md'),
    updated['.specops/runtime.md']
  );
  manageVeneers(root, updated, next.identity, true);
  assert.equal(
    readFileSync(path.join(root, '.specops/second.md'), 'utf8'),
    'second route'
  );
  writeFileSync(path.join(root, '.specops/install.lock'), 'another owner');
  assert.throws(
    () => manageVeneers(root, updated, next.identity, true),
    /owned/
  );
  unlinkSync(path.join(root, '.specops/install.lock'));
  assert.throws(
    () => manageVeneers(root, { '../outside.md': 'unsafe' }, identity),
    /non-local/
  );
});

test('explicit recovery refuses live/unknown owners and releases only a verified dead local owner', () => {
  const root = fixture();
  mkdirSync(path.join(root, '.specops'));
  const lock = path.join(root, '.specops/install.lock');
  writeFileSync(lock, JSON.stringify({ pid: process.pid, host: hostname() }));
  assert.throws(() => recoverVeneerLock(root), /live/);
  writeFileSync(
    lock,
    JSON.stringify({ pid: 99999999, host: 'different-host' })
  );
  assert.throws(() => recoverVeneerLock(root), /ambiguous/);
  writeFileSync(lock, JSON.stringify({ pid: 99999999, host: hostname() }));
  recoverVeneerLock(root);
  manageVeneers(root, payload, identity);
});
