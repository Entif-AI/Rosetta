import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildTile } from '@entif-ai/rosetta-core';
import { validatePayload, validatePromotionStatePayload, getSchemaCatalogEntry, PROMOTION_STATES } from '@entif-ai/rosetta-schemas';
import { InMemoryTileStore } from '@entif-ai/rosetta-store';
import { buildReceiptBundle, createPromotionTransition, verifyReceiptBundle } from './rosetta-receipts.js';

const subject = buildTile('rosetta.observation', { observationId: 'subject', signal: 'Extract', source: 'fixture' });
const policy = buildTile('rosetta.policy', { policyId: 'policy', description: 'Fixture' });
const evidence = buildTile('rosetta.evaluation', { evaluationId: 'eval', summary: 'Vector', verdict: 'pass' });
const payload = {
  observationId: 'state', signal: 'No semantics need to be parsed here.', source: 'rrp.promotion',
  profile: 'rrp.promotion-state.v1', subjectCid: subject.cid, state: 'active',
  transitionKind: 'genesis', previousStateCid: null
};
const priorStateTile = buildTile('rosetta.observation', payload, { pack: 'rrp' });
const input = { subject, priorStateTile, kind: 'promote' as const, evidenceRefs: [evidence], policies: [policy] };

describe('promotion Profile and predecessor regression #1698', () => {
  it('admits corrected fixtures and rejects the frozen pre-fix specimen with declared Core descent', () => {
    const load = (file: string) => JSON.parse(readFileSync(`packs/rrp/${file}`, 'utf8'));
    expect(validatePromotionStatePayload(load('test-vectors/promotion-pre-fix.json').payload)).not.toEqual([]);
    expect(validatePromotionStatePayload(load('test-vectors/promotion-state-valid.json').payload)).toEqual([]);
    const schema = load('schema/promotion-state.schema.json');
    expect(schema['x-rosetta'].coreKind).toBe('rosetta.observation');
    expect(schema.properties.state.enum).toEqual([...PROMOTION_STATES]);
    expect(getSchemaCatalogEntry(schema.$id)).toMatchObject({ coreDescent: 'core-tile-profile', relatedCoreKinds: ['rosetta.observation'] });
  });
  it('rejects a prose-only promotion shape while retaining Core-only Observation validation', () => {
    const old = { observationId: 'old', signal: 'active -> promoted', source: 'rosetta.promotion' };
    expect(validatePayload('rosetta.observation', old).ok).toBe(true);
    expect(validatePayload('rosetta.observation', { ...old, profile: 'rrp.promotion-state.v1' }).ok).toBe(false);
  });
  it.each([
    { profile: 'rrp.promotion-state.v999' }, { state: 'invented' },
    { transitionKind: 'promote', previousStateCid: null },
    { previousStateCid: 'not-a-cid' }, { subjectCid: '' }
  ])('rejects malformed or undeclared Profile fields %j', (change) => {
    expect(validatePayload('rosetta.observation', { ...payload, ...change }).ok).toBe(false);
  });
  it('binds predecessor, vectors and policies in a replayable receipt closure', () => {
    const result = createPromotionTransition({ ...input, evaluationVectors: [policy] });
    if ('block' in result) throw new Error(result.reason);
    expect(result.nextStateTile.kind).toBe('rosetta.observation');
    expect(result.nextStateTile.payload).toMatchObject({ profile: payload.profile, subjectCid: subject.cid, state: 'promoted', transitionKind: 'promote', previousStateCid: priorStateTile.cid });
    expect(result.nextStateTile.parents).toContain(priorStateTile.cid);
    expect(createPromotionTransition({ ...input, evaluationVectors: [policy] })).toEqual(result);
    const bundle = buildReceiptBundle(result.receipt);
    expect(bundle.closureCids).toContain(priorStateTile.cid);
    const store = new InMemoryTileStore();
    for (const tile of [subject, policy, evidence, result.nextStateTile, result.receipt]) store.put<unknown>(tile);
    expect(verifyReceiptBundle(bundle, store).ok).toBe(false);
    store.put(priorStateTile);
    expect(verifyReceiptBundle(bundle, store).ok).toBe(true);
  });
  it('rejects missing, tampered, wrong-subject and contradictory predecessors', () => {
    // @ts-expect-error Exercise an unresolved predecessor at the runtime boundary.
    expect(() => createPromotionTransition({ ...input, priorStateTile: undefined })).toThrow(/prior|predecessor/i);
    expect(() => createPromotionTransition({ ...input, priorState: 'cooled' })).toThrow(/contradict/i);
    expect(() => createPromotionTransition({ ...input, priorStateTile: { ...priorStateTile, payload: { ...payload, state: 'cooled' } } })).toThrow(/integrity/i);
    const other = buildTile('rosetta.observation', { ...payload, subjectCid: policy.cid }, { pack: 'rrp' });
    expect(() => createPromotionTransition({ ...input, priorStateTile: other })).toThrow(/subject/i);
    const malformed = buildTile('rosetta.observation', { ...payload, transitionKind: 'activate', previousStateCid: policy.cid }, { pack: 'rrp' });
    expect(() => createPromotionTransition({ ...input, priorStateTile: malformed })).toThrow(/lineage/i);
  });
});
