import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ExecutorContext } from '@nx/devkit';
import { createConvergence, type ConvergenceRequest } from './convergence';
import { checkExecutor, admissionExecutor } from './executors/evidence';

const ref = (file: string) => ({ path: file, start: 1, end: 1 });
const revision = '16e0274f3d32e4543f864992d6cf06dd7fcd8837';
const input = (): ConvergenceRequest => ({ formatVersion: 1, featureId: 'profile', runId: 'run-a',
  inventory: [{ key: 'structured-state', authorityRef: ref('AUTHORITY.md'), verificationRefs: [ref('test.ts')] }],
  findings: [{ key: 'missing-profile', sourceRef: ref('AUTHORITY.md'), gapType: 'missing', severity: 'blocker',
    evidenceRefs: [ref('code.ts')], authorityRef: ref('AUTHORITY.md'), affectedSurface: 'code.ts',
    observationRefs: ['baseline:profile:missing-profile'], remediationTaskRefs: ['T001'], verificationRefs: [],
    status: 'open', exceptionRef: null }] });
const read = () => Buffer.from('fixture evidence\n');
describe('convergence evidence #1708', () => {
  it('preserves finding identity and remediation lineage across repeated failures', () => {
    const first = createConvergence(input(), read, revision, ['AUTHORITY.md']);
    const next = input(); next.runId = 'run-b'; next.findings[0].gapType = 'partial';
    const second = createConvergence(next, read, revision, ['AUTHORITY.md']);
    expect(second.findings[0].id).toBe(first.findings[0].id);
    expect(second.findings[0].observationRefs).toEqual(first.findings[0].observationRefs);
    expect(second.findings[0].remediationTaskRefs).toEqual(['T001']);
    expect(second.summary.blockerRefs).toEqual([first.findings[0].id]);
    expect(second.summary.byType).toEqual({ partial: 1 });
    expect(second.role).toBe('convergence-evidence-not-authority');
  });
  it('records a verified inventory and zero actionable findings for a clean run', () => {
    const clean = input(); clean.findings = [];
    const output = createConvergence(clean, read, revision, ['AUTHORITY.md']);
    expect(output.summary).toMatchObject({ checked: 1, actionable: 0, disposition: 'pass' });
    expect(output.findings).toEqual([]);
    expect(() => createConvergence({ ...clean, inventory: [] }, read, revision, ['AUTHORITY.md'])).toThrow();
  });
  it('rejects unverified remediation, unauthorized exceptions and unapproved intent', () => {
    const unverified = input(); unverified.findings[0].status = 'remediated';
    expect(() => createConvergence(unverified, read, revision, ['AUTHORITY.md'])).toThrow(/verification/i);
    const excepted = input(); excepted.findings[0].status = 'accepted-exception';
    expect(() => createConvergence(excepted, read, revision, ['AUTHORITY.md'])).toThrow(/exception/i);
    const unauthorized = input(); unauthorized.findings[0].authorityRef = ref('code.ts');
    expect(() => createConvergence(unauthorized, read, revision, ['AUTHORITY.md'])).toThrow(/authority/i);
  });
  it('binds merge admission to exact evidence and fails closed on open findings or source drift', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'entif-convergence-'));
    try {
      for (const file of ['AUTHORITY.md', 'code.ts', 'test.ts']) writeFileSync(path.join(root, file), read());
      const config = { schemaVersion: 1, projectName: 'fixture', branchPolicy: 'existing-authorized', authoritySources: ['AUTHORITY.md'],
        projectionPath: '.specify/memory/authority.json', checks: { local: { command: 'node -e "process.exit(0)"', owner: 'AUTHORITY.md', inputs: ['{workspaceRoot}/AUTHORITY.md'] } },
        convergence: { artifactPath: 'evidence/profile.convergence.json', sourcePaths: ['AUTHORITY.md', 'code.ts', 'test.ts'] } };
      writeFileSync(path.join(root, 'config.json'), JSON.stringify(config));
      mkdirSync(path.join(root, 'evidence'));
      const report = createConvergence(input(), (file) => readFileSync(path.join(root, file)), revision, config.authoritySources);
      writeFileSync(path.join(root, config.convergence.artifactPath), JSON.stringify(report));
      const context = { root } as ExecutorContext;
      await checkExecutor({ configPath: 'config.json', checkId: 'local' }, context);
      expect(await admissionExecutor({ configPath: 'config.json' }, context)).toEqual({ success: false });
      const admission = JSON.parse(readFileSync(path.join(root, 'dist/governance/fixture/merge-admission.json'), 'utf8'));
      expect(admission.convergence).toMatchObject({ artifactRef: config.convergence.artifactPath, summary: { actionable: 1 } });
      expect(admission.convergence.sha256).toHaveLength(64);
      writeFileSync(path.join(root, 'code.ts'), 'changed behavior');
      await expect(admissionExecutor({ configPath: 'config.json' }, context)).rejects.toThrow(/stale|source/i);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});
