import { Buffer } from 'node:buffer';
import { URL } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  writeFileSync,
  readFileSync,
  rmSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const api = await import('./harness.mjs').catch(() => ({}));
test('pin verification rejects wrong digest and unavailable/wrong binary', () => {
  assert.equal(typeof api.verifyBytes, 'function');
  assert.throws(
    () => api.verifyBytes(Buffer.from('tampered'), '0'.repeat(64)),
    /integrity/
  );
  assert.throws(() => api.checkBinary('/nonexistent/badger'), /unavailable/);
  const dir = mkdtempSync(path.join(tmpdir(), 'badger-test-'));
  try {
    const bin = path.join(dir, 'badger');
    writeFileSync(bin, '#!/bin/sh\necho badger v9.9.9\n', { mode: 0o755 });
    assert.throws(() => api.checkBinary(bin), /version/);
  } finally {
    rmSync(dir, { recursive: true });
  }
});
test('opaque capture preserves streams, status, deterministic output and Git state', () => {
  assert.equal(typeof api.capture, 'function');
  const dir = mkdtempSync(path.join(tmpdir(), 'badger-test-'));
  try {
    execFileSync('git', ['init', '-q', dir]);
    execFileSync('git', [
      '-C',
      dir,
      '-c',
      'user.name=Fixture',
      '-c',
      'user.email=fixture@example.invalid',
      'commit',
      '--allow-empty',
      '-qm',
      'fixture',
    ]);
    const bin = path.join(dir, 'fake');
    writeFileSync(
      bin,
      '#!/bin/sh\nif [ "$1" = version ]; then echo badger v0.7.1; else printf "opaque authority: false\\n"; printf "diagnostic\\n" >&2; exit 3; fi\n',
      { mode: 0o755 }
    );
    const out = path.join(tmpdir(), path.basename(dir) + '-out');
    const a = api.capture({
      root: dir,
      output: out,
      binary: bin,
      base: api.git(dir, 'rev-parse', 'HEAD'),
    });
    assert.equal(a.role, 'non-authoritative-orientation-projection');
    assert.equal(a.runs.length, 2);
    assert.equal(a.runs[0].exitStatus, 3);
    assert.equal(a.deterministic, true);
    assert.equal(
      readFileSync(path.join(out, '1.stdout'), 'utf8'),
      'opaque authority: false\n'
    );
    assert.equal(
      readFileSync(path.join(out, '1.stderr'), 'utf8'),
      'diagnostic\n'
    );
    assert.equal(existsSync(path.join(dir, '.agents')), false);
    assert.throws(
      () =>
        api.capture({
          root: dir,
          output: out,
          binary: bin,
          base: a.repository.head,
        }),
      /exist/
    );
    assert.throws(
      () =>
        api.capture({
          root: dir,
          output: path.join(dir, 'evidence'),
          binary: bin,
          base: a.repository.head,
        }),
      /outside/
    );
    rmSync(out, { recursive: true });
  } finally {
    rmSync(dir, { recursive: true });
  }
});
test('manifest refuses incomplete, authority-promoting, or ungated D trials', () => {
  assert.equal(typeof api.validateTrial, 'function');
  const m = JSON.parse(
    readFileSync(new URL('./trial-template.json', import.meta.url))
  );
  assert.throws(() => api.validateTrial(m), /freeze/);
  Object.assign(m, {
    startingCommit: 'a'.repeat(40),
    startingTree: 'b'.repeat(40),
    taskIssue: 'https://github.com/Entif-AI/Rosetta/issues/1711',
    model: 'explicit-model',
    reasoning: 'medium',
    skillRuntimeSurface: ['recorded inventory'],
    acceptanceCriteria: [
      'all six orientation fields supported by source locators',
    ],
    validationCommands: ['git diff --exit-code'],
    root: 'tools/axi',
    variant: 'A',
  });
  assert.equal(api.validateTrial(m), true);
  assert.throws(
    () => api.validateTrial({ ...m, projectionAuthority: true }),
    /authority/
  );
  assert.throws(() => api.validateTrial({ ...m, variant: 'D' }), /gate/);
});
test(
  'installed release integrity rejects changed binary or donor receipt; no Skills acquired',
  { skip: !existsSync('.axi/badger/receipt.json') },
  async () => {
    const { cpSync, readdirSync } = await import('node:fs');
    const dir = mkdtempSync(path.join(tmpdir(), 'badger-install-test-'));
    const target = path.join(dir, 'install');
    try {
      cpSync('.axi/badger', target, { recursive: true });
      assert.ok(api.verifiedBinary(target));
      assert.deepEqual(readdirSync(target).sort(), [
        'badger',
        'receipt.json',
        'release.tar.gz',
      ]);
      const receiptPath = path.join(target, 'receipt.json');
      const receipt = JSON.parse(readFileSync(receiptPath));
      receipt.pin.repository = 'https://example.invalid/wrong';
      writeFileSync(receiptPath, JSON.stringify(receipt));
      assert.throws(() => api.verifiedBinary(target), /identity/);
      cpSync('.axi/badger/receipt.json', receiptPath);
      writeFileSync(path.join(target, 'badger'), 'tampered');
      assert.throws(() => api.verifiedBinary(target), /integrity/);
    } finally {
      rmSync(dir, { recursive: true });
    }
  }
);
