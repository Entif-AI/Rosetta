import process from 'node:process';
import { readFileSync, writeFileSync } from 'node:fs';
import { WORK_LIFECYCLE_SCHEMA, ENGINEERING_LIFECYCLE_SCHEMA, ENGINEERING_COMPLETION_SCHEMA } from '../../packages/rosetta-schemas/dist/index.js';

const schemas = { 'work-lifecycle-v1': WORK_LIFECYCLE_SCHEMA, 'engineering-lifecycle-v1': ENGINEERING_LIFECYCLE_SCHEMA, 'engineering-completion-v1': ENGINEERING_COMPLETION_SCHEMA };
if (process.argv.slice(2).some(arg => arg !== '--write')) throw new Error('usage: schema-sync.mjs [--write]');
for (const [name, schema] of Object.entries(schemas)) {
  const file = `packages/rosetta-schemas/docs/${name}.schema.json`;
  const bytes = JSON.stringify(schema, null, 2) + '\n';
  if (process.argv.includes('--write')) writeFileSync(file, bytes);
  else if (readFileSync(file, 'utf8') !== bytes) throw new Error(`Published schema drift: ${file}`);
}
process.stdout.write(`Engineering schemas: ${Object.keys(schemas).length} synchronized.\n`);
