import process from 'node:process';
import { readFileSync, writeFileSync } from 'node:fs';
import { IMPACT_REVALIDATION_SCHEMA, MATERIALIZED_VIEW_SCHEMA, GRAPH_VIEW_SCHEMA } from '../../packages/rosetta-schemas/dist/index.js';

const schemas = { 'impact-revalidation-v1': IMPACT_REVALIDATION_SCHEMA, 'materialized-view-v1': MATERIALIZED_VIEW_SCHEMA, 'graph-view-v1': GRAPH_VIEW_SCHEMA };
if (process.argv.slice(2).some(arg => arg !== '--write')) throw new Error('usage: schema-sync.mjs [--write]');
for (const [name, schema] of Object.entries(schemas)) {
  const path = `packages/rosetta-schemas/docs/${name}.schema.json`;
  const bytes = JSON.stringify(schema, null, 2) + '\n';
  if (process.argv.includes('--write')) writeFileSync(path, bytes);
  else if (readFileSync(path, 'utf8') !== bytes) throw new Error(`Published schema drift: ${path}`);
}
process.stdout.write(`View-integrity schemas: ${Object.keys(schemas).length} synchronized.\n`);
