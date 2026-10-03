import { readJson, writeJson, type Tree } from '@nx/devkit';
import { execFileSync } from 'node:child_process';
import { createConvergence } from '../../convergence';
import { localPath } from '../../source-evidence';
import { parseConfig } from '../../config';

export default function convergence(tree: Tree, options: { request: string; output: string }) {
  localPath(options.request); localPath(options.output);
  if (!options.output.endsWith('.convergence.json')) throw new Error('Output must be a .convergence.json evidence projection.');
  const local = readJson<{ configPath: string }>(tree, '.specify/entif-governance.json');
  const config = parseConfig(readJson<object>(tree, local.configPath));
  if (config.authoritySources.includes(options.output) || tree.exists(options.output) &&
      readJson<{ role?: string }>(tree, options.output).role !== 'convergence-evidence-not-authority') throw new Error('Refusing to overwrite a source-owned artifact.');
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: tree.root, encoding: 'utf8' }).trim();
  const output = createConvergence(readJson<object>(tree, options.request), (file) => {
    const bytes = tree.read(file);
    if (!bytes) throw new Error(`Missing convergence source: ${file}`);
    return bytes;
  }, revision, config.authoritySources);
  if (output.sources.some((source) => source.path === options.output)) throw new Error('Convergence cannot be its own source.');
  writeJson(tree, options.output, output);
}
