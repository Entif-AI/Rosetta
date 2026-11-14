import { describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import { auditPackReleaseObligations, evaluateVersionEvidence } from './rock-obligations.mjs';

async function fixture(fn) {
  const workspaceRoot = await mkdtemp(path.join(tmpdir(), 'rock-release-'));
  const root = path.join(workspaceRoot, 'packs', 'example');
  await mkdir(root, { recursive: true });
  const manifest = { version: '0.1.0', entrypoints: { examples: ['examples/valid.json'] } };
  try { await fn({ root, manifest, workspaceRoot }); }
  finally { await rm(workspaceRoot, { recursive: true, force: true }); }
}

async function inspect({ root, manifest, workspaceRoot }) {
  return auditPackReleaseObligations({ packResults: [{ root, manifest }], workspaceRoot, baseRef: null });
}

describe('ROCK release obligation evidence', () => {
  it('reports missing required root artifacts without claiming example or history validation', async () => {
    await fixture(async (ctx) => {
      const results = await inspect(ctx);
      expect(results.find((item) => item.id === 'generic-required-root-file-presence')).toEqual({
        root: 'packs/example', id: 'generic-required-root-file-presence', status: 'fail',
        detail: 'Missing or invalid: README.md, acceptance.md, metadata.json, CHANGELOG.md, examples/, tests/'
      });
      expect(results.find((item) => item.id === 'example-validation')?.status).toBe('not-evaluated');
      expect(results.find((item) => item.id === 'release-version-to-changelog-consistency')?.status).toBe('not-evaluated');
    });
  });

  it('accepts actual regular root files but does not certify the semantics of an example', async () => {
    await fixture(async (ctx) => {
      for (const file of ['README.md', 'acceptance.md', 'CHANGELOG.md']) await writeFile(path.join(ctx.root, file), '# Real content\n');
      await writeFile(path.join(ctx.root, 'metadata.json'), '{"owner":"maintainer"}\n');
      for (const dir of ['examples', 'tests']) await mkdir(path.join(ctx.root, dir));
      await writeFile(path.join(ctx.root, 'examples', 'valid.json'), '{}\n');
      await writeFile(path.join(ctx.root, 'tests', 'README.md'), '# Tests\n');
      const results = await inspect(ctx);
      expect(results.find((item) => item.id === 'generic-required-root-file-presence')?.status).toBe('pass');
      expect(results.find((item) => item.id === 'example-validation')?.status).toBe('not-evaluated');
      expect(results.find((item) => item.id === 'test-vector-execution-where-applicable')?.status).toBe('not-applicable');
    });
  });

  it('rejects linked or malformed root metadata and absent declared examples', async () => {
    await fixture(async (ctx) => {
      await symlink('/etc/hosts', path.join(ctx.root, 'README.md'));
      await writeFile(path.join(ctx.root, 'metadata.json'), '{broken');
      const findings = await inspect({ ...ctx, manifest: { version: '0.0.2', entrypoints: {} } });
      const root = findings.find((item) => item.id === 'generic-required-root-file-presence');
      expect(root.status).toBe('fail');
      expect(root.detail).toContain('README.md');
      expect(root.detail).toContain('metadata.json (invalid JSON)');
      expect(root.detail).not.toContain('CHANGELOG.md');
      expect(findings.find((item) => item.id === 'example-validation')?.status).toBe('fail');
    });
  });

  it('rejects version bumps without a changed changelog or version entry', () => {
    const old = { version: '0.1.0' };
    const current = { version: '0.2.0' };
    expect(evaluateVersionEvidence({ current, previous: old, changedPaths: [], changelogText: '# 0.2.0' }).status).toBe('fail');
    expect(evaluateVersionEvidence({ current, previous: old, changedPaths: ['CHANGELOG.md'], changelogText: '# 0.1.0' }).status).toBe('fail');
    expect(evaluateVersionEvidence({ current, previous: old, changedPaths: ['CHANGELOG.md'], changelogText: '# 0.2.0' }).status).toBe('pass');
    expect(evaluateVersionEvidence({ current, previous: current, changedPaths: [], changelogText: null }).status).toBe('not-applicable');
  });

  it('checks actual Git baseline bytes when a Pack version changes', async () => {
    await fixture(async (ctx) => {
      const git = (...args) => execFileSync('git', ['-C', ctx.workspaceRoot, ...args], { stdio: 'pipe' });
      git('init', '-q');
      git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.org', 'config', 'core.autocrlf', 'false');
      await writeFile(path.join(ctx.root, 'pack.json'), '{"version":"0.1.0"}\n');
      await writeFile(path.join(ctx.root, 'CHANGELOG.md'), '# 0.1.0\n');
      git('add', '.');
      git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.org', 'commit', '-qm', 'initial');

      await writeFile(path.join(ctx.root, 'pack.json'), '{"version":"0.2.0"}\n');
      const current = { ...ctx.manifest, version: '0.2.0' };
      const withoutLog = await auditPackReleaseObligations({
        packResults: [{ root: ctx.root, manifest: current }], workspaceRoot: ctx.workspaceRoot, baseRef: 'HEAD'
      });
      expect(withoutLog.find((entry) => entry.id === 'release-version-to-changelog-consistency')?.status).toBe('fail');

      await writeFile(path.join(ctx.root, 'CHANGELOG.md'), '# 0.2.0\n# 0.1.0\n');
      const withLog = await auditPackReleaseObligations({
        packResults: [{ root: ctx.root, manifest: current }], workspaceRoot: ctx.workspaceRoot, baseRef: 'HEAD'
      });
      expect(withLog.find((entry) => entry.id === 'release-version-to-changelog-consistency')?.status).toBe('pass');
      expect(withLog.find((entry) => entry.id === 'breaking-change-migration-or-translator-strategy')?.status).toBe('not-evaluated');
    });
  });
});
