import fs from 'node:fs';
import { AUTHORITY_ENVELOPE_SCHEMA } from '../../packages/rosetta-schemas/dist/index.js';
const file = 'packages/rosetta-schemas/docs/authority-envelope-v1.schema.json';
const expected = JSON.stringify(AUTHORITY_ENVELOPE_SCHEMA, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (fs.readFileSync(file, 'utf8') !== expected) throw new Error('Authority Envelope JSON Schema projection drift. Run node tools/authz/export-schema.mjs after building schemas.');
} else fs.writeFileSync(file, expected);
import process from 'node:process';
