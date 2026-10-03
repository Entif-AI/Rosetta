import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { inspectPromotionCandidate, runProfileAdmission } from './profile-admission.mjs';
describe('semantic/Profile admission #1699', () => {
  it('rejects the frozen pre-fix shape and admits the corrected declared Profile', async () => {
    const load = async (name) => JSON.parse(await readFile(`packs/rrp/test-vectors/${name}.json`, 'utf8'));
    expect((await inspectPromotionCandidate(await load('promotion-pre-fix'))).ok).toBe(false);
    expect((await inspectPromotionCandidate(await load('promotion-state-valid'))).ok).toBe(true);
    expect(await runProfileAdmission()).toMatchObject({ preFix: 'fail', corrected: 'pass' });
  });
});
