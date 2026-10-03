import { describe, it, expect } from 'vitest';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { readJson, writeJson } from '@nx/devkit';
import init from './generators/init/init';
import sync from './generators/sync/sync';
describe('S1 to SpecOps governance seam', () => {
  it('moves the projection while preserving local authority, checks and legacy state', async () => {
    const tree = createTreeWithEmptyWorkspace();
    tree.write('AUTHORITY.md', 'Consumer-owned semantics.');
    const config = {
      schemaVersion: 1,
      projectName: 'local-governance',
      branchPolicy: 'existing-authorized',
      authoritySources: ['AUTHORITY.md'],
      projectionPath: '.specify/memory/constitution.json',
      checks: {
        local: {
          owner: 'AUTHORITY.md',
          command: 'node -e "process.exit(0)"',
          inputs: ['{workspaceRoot}/AUTHORITY.md'],
        },
      },
    };
    writeJson(tree, 'governance/governance.config.json', config);
    init(tree);
    await sync(tree);
    const legacy = readJson(tree, config.projectionPath);
    writeJson(tree, 'governance/governance.config.json', {
      ...config,
      projectionPath: '.specops/authority.json',
    });
    init(tree);
    await sync(tree);
    expect(readJson(tree, '.specops/authority.json')).toEqual(legacy);
    expect(readJson(tree, config.projectionPath)).toEqual(legacy);
    expect(tree.read('AUTHORITY.md', 'utf8')).toBe('Consumer-owned semantics.');
    expect(readJson(tree, 'governance/governance.config.json').checks).toEqual(
      config.checks
    );
    const before = tree.listChanges();
    init(tree);
    await sync(tree);
    expect(tree.listChanges()).toEqual(before);
  });
});
