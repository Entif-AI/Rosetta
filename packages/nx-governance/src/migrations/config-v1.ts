import { readJson, writeJson, visitNotIgnoredFiles, type Tree } from '@nx/devkit';
import { parseConfig } from '../config';
/** Upgrade only the explicit prototype format; preserve all consuming-repo policies. */
export default function migrate(tree: Tree) {
  visitNotIgnoredFiles(tree, '', (file) => {
    if (!file.endsWith('/governance.config.json')) return;
    const value = readJson<Record<string, unknown>>(tree, file);
    if (value.schemaVersion === 0) {
      const upgraded = { ...value, schemaVersion: 1, branchPolicy: value.branchPolicy ?? 'existing-authorized' };
      parseConfig(upgraded);
      writeJson(tree, file, upgraded);
    } else parseConfig(value);
  });
}
