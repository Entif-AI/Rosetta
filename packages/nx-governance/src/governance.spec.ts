import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { readJson, type ExecutorContext } from '@nx/devkit';
import init from './generators/init/init';
import sync from './generators/sync/sync';
import specSurface from './generators/spec-surface/spec-surface';
import { checkExecutor, admissionExecutor } from './executors/evidence';
import { createNodesV2 } from './plugin';
import migrate from './migrations/config-v1';

const config = { schemaVersion: 1, projectName: 'fixture-governance', branchPolicy: 'existing-authorized', authoritySources: ['AUTHORITY.md'],
  projectionPath: '.specify/memory/authority.json', checks: { local: { command: 'node -e "process.exit(0)"', owner: 'AUTHORITY.md', inputs: ['{workspaceRoot}/AUTHORITY.md'] } } };
function fixture() {
  const tree = createTreeWithEmptyWorkspace();
  tree.write('governance/governance.config.json', JSON.stringify(config));
  tree.write('AUTHORITY.md', 'Local product authority.');
  return tree;
}
describe('portable governance #1699', () => {
  it('migrates only prototype configuration while preserving local authority and overrides', async () => {
    const tree = fixture();
    tree.write('governance/governance.config.json', JSON.stringify({ ...config, schemaVersion: 0 }));
    migrate(tree); init(tree); await sync(tree);
    expect(readJson(tree, 'governance/governance.config.json')).toEqual(config);
    const before = tree.listChanges();
    migrate(tree); init(tree); await sync(tree);
    expect(tree.listChanges()).toEqual(before);
  });
  it('rejects unsupported declared Nx versions without changing local files', () => {
    const tree = fixture(); tree.write('package.json', JSON.stringify({ devDependencies: { nx: '23.0.0' } }));
    const before = tree.listChanges();
    expect(() => init(tree)).toThrow(/Incompatible Nx/);
    expect(tree.listChanges()).toEqual(before);
  });
  it('infers governance execution targets without inventing semantic project dependencies', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'governance-graph-'));
    try {
      writeFileSync(path.join(root, 'governance.config.json'), JSON.stringify(config));
      const nodes = await createNodesV2[1](['governance.config.json'], undefined, { workspaceRoot: root, nxJsonConfiguration: {} });
      const project = nodes[0][1].projects?.['.'];
      expect(project?.implicitDependencies).toBeUndefined();
      expect(project?.targets?.['merge-admission'].dependsOn).toEqual(['evidence-local']);
      expect(project?.targets?.['evidence-local'].cache).toBe(true);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
  it('preserves local configuration and synchronizes only projections idempotently', async () => {
    const tree = fixture();
    const before = readJson(tree, 'nx.json');
    init(tree); await sync(tree);
    const first = tree.listChanges();
    init(tree); await sync(tree);
    expect(tree.listChanges()).toEqual(first);
    expect(readJson(tree, 'nx.json').analytics).toEqual(before.analytics);
    expect(tree.exists('.specify/memory/authority.json')).toBe(true);
    expect(tree.exists('.git/HEAD')).toBe(false);
    tree.write('AUTHORITY.md', 'Changed local authority');
    await sync(tree);
    expect(tree.listChanges()).not.toEqual(first);
  });
  it('rejects branch-per-spec configuration before writing', () => {
    const tree = fixture();
    tree.write('.specify/entif-governance.json', JSON.stringify({ branchPolicy: 'branch-per-spec' }));
    const before = tree.listChanges();
    expect(() => init(tree)).toThrow(/conflict/i);
    expect(tree.listChanges()).toEqual(before);
  });
  it('scaffolds a draft with source ownership without inventing a Core term', () => {
    const tree = fixture();
    specSurface(tree, { name: 'promotion', authority: 'AUTHORITY.md', issue: '#1698' });
    expect(readJson(tree, 'spec-surfaces/promotion/admission.json')).toMatchObject({ authority: 'AUTHORITY.md', sourceIssue: '#1698', coreDescent: null, status: 'draft' });
  });
  it('composes failed upstream evidence into a blocked report and rejects stale authority evidence', async () => {
    const root = mkdtempSync(path.join(tmpdir(), 'governance-evidence-'));
    try {
      writeFileSync(path.join(root, 'AUTHORITY.md'), 'Local authority');
      writeFileSync(path.join(root, 'governance.config.json'), JSON.stringify({ ...config, checks: { local: { ...config.checks.local, command: 'node -e "process.exit(1)"' } } }));
      const context: ExecutorContext = { root, cwd: root, isVerbose: false, projectsConfigurations: { version: 2, projects: {} }, nxJsonConfiguration: {}, projectGraph: { nodes: {}, dependencies: {} } };
      await checkExecutor({ configPath: 'governance.config.json', checkId: 'local' }, context);
      await expect(admissionExecutor({ configPath: 'governance.config.json', checkIds: [] }, context)).rejects.toThrow(/empty/i);
      await expect(admissionExecutor({ configPath: 'governance.config.json', checkIds: ['unknown'] }, context)).rejects.toThrow(/Unknown/i);
      expect(await admissionExecutor({ configPath: 'governance.config.json' }, context)).toEqual({ success: false });
      expect(JSON.parse(readFileSync(path.join(root, 'dist/governance/fixture-governance/merge-admission.json'), 'utf8')).disposition).toBe('blocked');
      writeFileSync(path.join(root, 'AUTHORITY.md'), 'Changed authority');
      await expect(admissionExecutor({ configPath: 'governance.config.json' }, context)).rejects.toThrow(/stale/i);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});
