import { readJson, updateJson, writeJson, type Tree } from '@nx/devkit';
import { parseConfig } from '../../config';
import { parse } from 'yaml';
export interface InitOptions { configPath?: string }
const plugin = '@entif-ai/nx-governance';
export function initGenerator(tree: Tree, options: InitOptions = {}) {
  const file = options.configPath ?? 'governance/governance.config.json';
  if (!tree.exists('nx.json')) throw new Error('An existing Nx workspace is required.');
  if (!tree.exists(file)) throw new Error(`Provide project-local authority and checks in ${file}. See config.schema.json.`);
  const config = parseConfig(readJson<object>(tree, file));
  if (tree.exists('.specify/extensions.yml')) {
    const extensions: unknown = parse(tree.read('.specify/extensions.yml', 'utf8') ?? '');
    if (extensions && typeof extensions === 'object' && 'hooks' in extensions && extensions.hooks && typeof extensions.hooks === 'object' && 'before_specify' in extensions.hooks && Array.isArray(extensions.hooks.before_specify)) {
      for (const hook of extensions.hooks.before_specify) {
        if (hook?.enabled !== false && (hook?.extension === 'git' || hook?.command === 'speckit.git.feature')) throw new Error('Conflicting branch-creation hook. Preserve existing branch policy explicitly before init.');
      }
    }
  }
  const local = '.specify/entif-governance.json';
  if (tree.exists(local)) {
    const existing = readJson<{ branchPolicy?: string; configPath?: string }>(tree, local);
    if (existing.branchPolicy !== 'existing-authorized' || existing.configPath !== file) throw new Error('Conflicting Spec Kit branch policy/configuration. Resolve explicitly before init.');
  }
  const nx = readJson<{ plugins?: Array<string | { plugin: string }>; sync?: { globalGenerators?: string[] } }>(tree, 'nx.json');
  const registrations = nx.plugins ?? [];
  if (registrations.filter((entry) => (typeof entry === 'string' ? entry : entry.plugin) === plugin).length > 1) throw new Error('Duplicate governance plugin registration.');
  updateJson(tree, 'nx.json', (value) => {
    value.plugins ??= [];
    if (!registrations.some((entry) => (typeof entry === 'string' ? entry : entry.plugin) === plugin)) value.plugins.push(plugin);
    value.sync ??= {};
    value.sync.globalGenerators ??= [];
    if (!value.sync.globalGenerators.includes(`${plugin}:sync`)) value.sync.globalGenerators.push(`${plugin}:sync`);
    return value;
  });
  if (!tree.exists(local)) writeJson(tree, local, { schemaVersion: 1, configPath: file, branchPolicy: config.branchPolicy, writerCount: 1,
    components: { preset: 'entif-rosetta', extension: 'rosetta-governance', workflow: 'entif-roadmap' } });
}
export default initGenerator;
