import { visitNotIgnoredFiles, type Tree } from '@nx/devkit';
import { parseConfig } from '../../config';
import { authorityProjection } from '../../executors/evidence';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Preserve native ESM import through Nx's CommonJS source loader.
import loadProjectionModule = require('./native-import.cjs');
export default async function sync(tree: Tree) {
  const files: string[] = [];
  visitNotIgnoredFiles(tree, '', (file) => {
    files.push(file);
  });
  for (const file of files.filter((file) => file.endsWith('/governance.config.json'))) {
    const config = parseConfig(JSON.parse(tree.read(file, 'utf8') ?? 'null'));
    const projection = authorityProjection(config, (source) => {
      const bytes = tree.read(source);
      if (!bytes) throw new Error(`Missing controlling authority: ${source}`);
      return bytes;
    });
    tree.write(config.projectionPath, `${JSON.stringify(projection, null, 2)}\n`);
    tree.write(config.projectionPath.replace(/\.json$/, '.md'), `# Derived working constitution\n\nSources control meaning; this materialization grants no authority.\nBranch policy: ${projection.branchPolicy}. One writer.\n\n${projection.sources.map((source) => `- ${source.path}, SHA-256 \`${source.sha256}\``).join('\n')}\n`);
    if (config.catalog) {
      // The workspace owns generation; the portable plugin owns synchronization.
      const module = await loadProjectionModule(pathToFileURL(path.join(tree.root, config.catalog.generator)).href);
      if (!module || typeof module !== 'object' || !('generateProjections' in module) || typeof module.generateProjections !== 'function') throw new Error('Catalog generator must export generateProjections.');
      const outputs: unknown = await module.generateProjections({ root: tree.root, readFile: (source: string) => tree.read(source), listFiles: files });
      if (!outputs || typeof outputs !== 'object') throw new Error('Catalog generator must return path-to-text outputs.');
      const declared = new Set(config.catalog.outputs);
      if (Object.keys(outputs).length !== declared.size) throw new Error('Catalog outputs disagree with declared outputs.');
      for (const [destination, bytes] of Object.entries(outputs)) {
        if (!declared.has(destination) || typeof bytes !== 'string') throw new Error(`Undeclared catalog output: ${destination}`);
        tree.write(destination, bytes);
      }
    }
  }
  return { outOfSyncMessage: 'Governance authority projections are stale. Run nx sync.' };
}
