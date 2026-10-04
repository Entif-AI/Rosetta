import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { inspectPromotionCandidate, runProfileAdmission, validateSurface } from './profile-admission.mjs';
import { loadSchemas } from './load-schemas.mjs';
describe('semantic/Profile admission #1699', () => {
  it('rejects a declared admission that contradicts its owning schema or lacks executable coverage', async () => {
    const declaration = JSON.parse(await readFile('spec-surfaces/promotion/admission.json', 'utf8'));
    const schemas = await loadSchemas();
    const read = (file) => readFile(file, 'utf8');
    const tasks = new Set(['rosetta-receipts:test']);
    expect(await validateSurface(declaration, schemas.ROSETTA_SCHEMA_CATALOG, read, tasks)).toEqual([]);
    expect((await validateSurface({ ...declaration, coreKinds: ['rosetta.promotion_state'] }, schemas.ROSETTA_SCHEMA_CATALOG, read, tasks)).join(';')).toMatch(/Core|descent/);
    expect((await validateSurface({ ...declaration, coreDescent: 'core-primitive' }, schemas.ROSETTA_SCHEMA_CATALOG, read, tasks)).join(';')).toMatch(/descent/);
    expect((await validateSurface(declaration, schemas.ROSETTA_SCHEMA_CATALOG, read, new Set())).join(';')).toMatch(/task/);
  });
  it('rejects the frozen pre-fix shape and admits the corrected declared Profile', async () => {
    const load = async (name) => JSON.parse(await readFile(`packs/rrp/test-vectors/${name}.json`, 'utf8'));
    expect((await inspectPromotionCandidate(await load('promotion-pre-fix'))).ok).toBe(false);
    expect((await inspectPromotionCandidate(await load('promotion-state-valid'))).ok).toBe(true);
    expect(await runProfileAdmission()).toMatchObject({ preFix: 'fail', corrected: 'pass' });
  }, 30_000); // Includes cold source loading and Nx project-graph construction on CI.
});
