import { readJson, type Tree } from '@nx/devkit';
export const installationPaths = [
  '.specops/entif-governance.json',
  '.specify/entif-governance.json',
] as const;
export interface Installation {
  configPath: string;
  branchPolicy: string;
  writerCount?: number;
}
export function resolveInstallation(values: Installation[]): Installation {
  if (!values.length)
    throw new Error('Initialize consumer-local governance first.');
  const first = values[0];
  if (
    !first.configPath ||
    first.branchPolicy !== 'existing-authorized' ||
    (first.writerCount !== undefined && first.writerCount !== 1) ||
    values.some(
      (value) =>
        value.configPath !== first.configPath ||
        value.branchPolicy !== first.branchPolicy ||
        (value.writerCount !== undefined && value.writerCount !== 1)
    )
  )
    throw new Error(
      'Conflicting substrate installation metadata; reconcile explicitly.'
    );
  return first;
}

export function readInstallation(tree: Tree): Installation {
  return resolveInstallation(
    installationPaths
      .filter((file) => tree.exists(file))
      .map((file) => readJson<Installation>(tree, file))
  );
}
