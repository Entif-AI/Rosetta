import { readJson, writeJson, type Tree } from '@nx/devkit';
import { execFileSync } from 'node:child_process';
import { createBaseline } from '../../baseline';
import { readInstallation } from '../../installation';
import { parseConfig } from '../../config';

export default function baseline(
  tree: Tree,
  options: { request: string; output: string }
) {
  if (
    options.request.startsWith('/') ||
    options.request.split(/[\\/]/).includes('..')
  )
    throw new Error('Request must be workspace-local.');
  if (
    !/\.baseline\.json$/.test(options.output) ||
    options.output.includes('..') ||
    options.output.includes('\\') ||
    options.output.startsWith('/')
  ) {
    throw new Error(
      'Output must be a workspace-local .baseline.json projection.'
    );
  }
  const local = readInstallation(tree);
  const config = parseConfig(readJson<object>(tree, local.configPath));
  if (
    config.authoritySources.includes(options.output) ||
    (tree.exists(options.output) &&
      readJson<{ role?: string }>(tree, options.output).role !==
        'observed-behavior-not-authority')
  ) {
    throw new Error('Refusing to overwrite a source-owned artifact.');
  }
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: tree.root,
    encoding: 'utf8',
  }).trim();
  const output = createBaseline(
    readJson<object>(tree, options.request),
    (file) => {
      const bytes = tree.read(file);
      if (!bytes) throw new Error(`Missing bounded source: ${file}`);
      return bytes;
    },
    revision,
    config.authoritySources
  );
  if (output.scope.includes(options.output))
    throw new Error('A projection cannot be its own observation source.');
  writeJson(tree, options.output, output);
}
