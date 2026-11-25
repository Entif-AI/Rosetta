import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { parseEvidenceIndependence } from '../../packages/rosetta-schemas/src/lib/evidence-independence.ts';
import { isProfileTimestamp } from '../../packages/rosetta-schemas/src/lib/evaluation-profile-validation.ts';
import { validatePackRoot } from './validate-packs.mjs';

const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv/dist/2020.js');
const root = 'packs/schema-pack-evidence-independence';
const read = async (path) => JSON.parse(await readFile(`${root}/${path}`, 'utf8'));

describe('proposed evidence-independence Pack executable vectors', () => {
  it('admits the published example as bounded schema and semantic evidence, not Core Profile admission', async () => {
    const result = await validatePackRoot(root);
    expect(result.errors).toEqual([]);
    expect(result.manifest.status).toBe('draft');
    expect(result.manifest.profiles).toEqual([]);
    const schema = await read(result.manifest.entrypoints.schema[0]);
    const ajv = new Ajv2020({ strict: false });
    ajv.addFormat('date-time', isProfileTimestamp);
    const validate = ajv.compile(schema);
    const example = await read(result.manifest.entrypoints.examples[0]);
    expect(validate(example)).toBe(true);
    expect(parseEvidenceIndependence(example).outcome).toBe('INDEPENDENT');
    const fabricated = { ...example, declarations: [] };
    expect(validate(fabricated)).toBe(true);
    expect(() => parseEvidenceIndependence(fabricated)).toThrow();
    const unauthorized = { ...example, authorized: true };
    expect(validate(unauthorized)).toBe(false);
    expect(() => parseEvidenceIndependence(unauthorized)).toThrow();
    expect(validate({ ...example, observedAt: 'not-a-time' })).toBe(false);
  });
});
