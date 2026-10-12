import { createJiti } from 'jiti';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
/** Source aliases make deterministic governance usable before compiled packages exist. */
export async function loadSchemas(root = fileURLToPath(new URL('../../', import.meta.url))) {
  const alias = Object.fromEntries(['rosetta-canon', 'rosetta-cid', 'rosetta-core', 'rosetta-schemas'].map((name) => [`@entif-ai/${name}`, path.join(root, 'packages', name, 'src/index.ts')]));
  return createJiti(import.meta.url, { alias, moduleCache: false }).import(path.join(root, 'packages/rosetta-schemas/src/index.ts'));
}
