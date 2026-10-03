import { visitNotIgnoredFiles, type Tree } from '@nx/devkit';
import { parseConfig } from '../../config';
import { authorityProjection } from '../../executors/evidence';
export default function sync(tree: Tree) {
  visitNotIgnoredFiles(tree, '', (file) => {
    if (!file.endsWith('/governance.config.json')) return;
    const config = parseConfig(JSON.parse(tree.read(file, 'utf8') ?? 'null'));
    const projection = authorityProjection(config, (source) => {
      const bytes = tree.read(source);
      if (!bytes) throw new Error(`Missing controlling authority: ${source}`);
      return bytes;
    });
    tree.write(config.projectionPath, `${JSON.stringify(projection, null, 2)}\n`);
    tree.write(config.projectionPath.replace(/\.json$/, '.md'), `# Derived working constitution\n\nSources control meaning; this materialization grants no authority.\nBranch policy: ${projection.branchPolicy}. One writer.\n\n${projection.sources.map((source) => `- ${source.path}, SHA-256 \`${source.sha256}\``).join('\n')}\n`);
  });
  return { outOfSyncMessage: 'Governance authority projections are stale. Run nx sync.' };
}
