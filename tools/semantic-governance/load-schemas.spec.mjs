import { it } from 'vitest';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadSchemas } from './load-schemas.mjs';

it('each governance load reflects changed transitive source in a long-lived process', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'rosetta-schema-loader-'));
  const source = path.join(root, 'packages/rosetta-schemas/src');
  mkdirSync(path.join(source, 'lib'), { recursive: true });
  try {
    writeFileSync(path.join(source, 'index.ts'), "export { ROSETTA_SCHEMA_CATALOG } from './lib/catalog.ts';\n");
    const file = path.join(source, 'lib/catalog.ts');
    writeFileSync(file, "export const ROSETTA_SCHEMA_CATALOG = [{ schemaId: 'before' }];\n");
    assert.equal((await loadSchemas(root)).ROSETTA_SCHEMA_CATALOG[0].schemaId, 'before');
    writeFileSync(file, "export const ROSETTA_SCHEMA_CATALOG = [{ schemaId: 'after' }];\n");
    assert.equal((await loadSchemas(root)).ROSETTA_SCHEMA_CATALOG[0].schemaId, 'after');
  } finally { rmSync(root, { recursive: true, force: true }); }
});
