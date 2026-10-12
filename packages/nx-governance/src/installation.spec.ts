import { expect, it } from 'vitest';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { readJson } from '@nx/devkit';
import init from './generators/init/init';
import { readInstallation } from './installation';
const config = {
  schemaVersion: 1,
  projectName: 'consumer',
  branchPolicy: 'existing-authorized',
  authoritySources: ['AUTHORITY.md'],
  projectionPath: '.specops/authority.json',
  checks: {
    local: {
      owner: 'AUTHORITY.md',
      command: 'node -e "process.exit(0)"',
      inputs: ['{workspaceRoot}/AUTHORITY.md'],
    },
  },
};
it('expands Spec Kit into SpecOps without deleting rollback state or inheriting authority', () => {
  const tree = createTreeWithEmptyWorkspace();
  tree.write('governance/governance.config.json', JSON.stringify(config));
  tree.write('AUTHORITY.md', 'Consumer authority');
  init(tree);
  const legacy = tree.read('.specify/entif-governance.json', 'utf8');
  init(tree, { substrate: 'specops' });
  const before = tree.listChanges();
  init(tree, { substrate: 'specops' });
  expect(tree.listChanges()).toEqual(before);
  expect(tree.read('.specify/entif-governance.json', 'utf8')).toBe(legacy);
  expect(readInstallation(tree).configPath).toBe(
    'governance/governance.config.json'
  );
  expect(readJson(tree, '.specops/entif-governance.json').components).toEqual({
    substrate: 'specops',
  });
  expect(tree.read('AUTHORITY.md', 'utf8')).toBe('Consumer authority');
  tree.write(
    '.specify/entif-governance.json',
    JSON.stringify({
      configPath: 'other.json',
      branchPolicy: 'existing-authorized',
    })
  );
  const conflict = tree.listChanges();
  expect(() => init(tree, { substrate: 'specops' })).toThrow(/conflict/i);
  expect(tree.listChanges()).toEqual(conflict);
  expect(() => readInstallation(tree)).toThrow(/conflict/i);
});
