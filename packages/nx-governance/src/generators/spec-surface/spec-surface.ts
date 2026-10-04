import { writeJson, type Tree } from '@nx/devkit';
export default function specSurface(tree: Tree, options: { name: string; authority: string; issue: string }) {
  if (!/^[a-z][a-z0-9-]*$/.test(options.name) || !/^#[0-9]+$/.test(options.issue) || !tree.exists(options.authority)) throw new Error('Name, source issue and existing authority are required.');
  const root = `spec-surfaces/${options.name}`;
  if (tree.exists(`${root}/admission.json`)) throw new Error('Specification surface already exists.');
  writeJson(tree, `${root}/admission.json`, { formatVersion: 1, status: 'draft', authority: options.authority, sourceIssue: options.issue,
    coreDescent: null, coreKinds: [], pack: null, schema: null, acceptance: [], nonGoals: [] });
  tree.write(`${root}/README.md`, `# ${options.name}\n\nOwner ${options.issue}; authority ${options.authority}.\nFill the admission declaration and executable conformance evidence before admission.\n`);
}
