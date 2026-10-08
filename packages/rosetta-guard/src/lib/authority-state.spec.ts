import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { type AuthorityEnvelope, type AuthorityScope } from '@entif-ai/rosetta-schemas';
import { evaluateEffectiveAuthority } from './effective-authority.js';
import { LocalAuthorityState, authorizeCurrentOperation, type AuthorityFact } from './authority-state.js';

const now = '2026-10-05T12:00:00Z';
const target = { resourceRef: 'urn:resource:alpha', domainRef: { tenantId: 'tenant-a', classification: 'internal' as const, abacLabels: [] } };
const policy = { ref: 'urn:policy:reference', version: '1', frontierRef: 'urn:policy:reference:1' };
const dirs: string[] = [];
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }); });
export function authorityFact(ref = 'urn:authority:root', parentRef: string | null = null): AuthorityFact {
  const scope = { target, operations: parentRef ? ['A', 'A2'] : ['A', 'A2', 'B', 'delegate', 'revoke'], effects: ['external-write' as const] };
  return { ref, parentRef, subjectRef: 'urn:actor:operator', scope, policy, contextConstraints: {},
    requiredActorEvidenceRefs: [], validity: { notBefore: '2026-10-05T00:00:00Z', expiresAt: '2027-01-01T00:00:00Z', state: 'valid', revocationRefs: [], invalidityRefs: [], supersededByRefs: [] },
    delegation: { ceiling: scope, furtherDelegation: parentRef === null, depthRemaining: parentRef ? 0 : 2 } };
}
function state() {
  const dir = mkdtempSync(join(tmpdir(), 'rosetta-authority-')); dirs.push(dir);
  const store = new LocalAuthorityState(dir);
  store.append({ id: 'policy-1', type: 'policy', policy }, 0);
  store.append({ id: 'root-1', type: 'fact', fact: authorityFact() }, 1);
  store.append({ id: 'child-1', type: 'fact', fact: authorityFact('urn:authority:child', 'urn:authority:root') }, 2);
  return { store, dir };
}
const request = (ref = 'urn:authority:child') => ({ authorityRefs: [ref], subjectRef: 'urn:actor:operator', now, minimumRevision: 0 });
describe('authoritative current state #1758', () => {
  it('persists content-addressed history and feeds the evaluator without caller-invented sources', () => {
    const { store, dir } = state();
    const result = store.resolve(request()); expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.reasonCodes.join(','));
    expect(result.revision).toBe(3); expect(result.currentEnvelopes).toHaveLength(2); expect(result.sources).toHaveLength(2);
    const decision = evaluateEffectiveAuthority({ ...result.evaluatorState, envelope: result.envelope, operation: 'A', effect: 'external-write', target, now, context: {},
      providerCapabilities: [authorityFact().scope], ceilings: [], gates: { safeHold: { active: false, evidenceRef: 'urn:gate:no-hold' }, identitySensitive: { required: false, satisfied: false, evidenceRef: 'urn:gate:identity' } }, intentRefs: [] });
    expect(decision.payload.effect).toBe('allow');
    expect(new LocalAuthorityState(dir).resolve(request())).toEqual(result);
  });
  it('revocation advances the revision, defeats old projections and retains historical state', () => {
    const { store } = state(); const before = store.resolve(request());
    store.append({ id: 'revoke-1', type: 'invalidity', ref: 'urn:authority:child', state: 'revoked', evidenceRef: 'urn:revocation:child' }, 3);
    expect(store.resolve({ ...request(), minimumRevision: 4 })).toMatchObject({ ok: false, revision: 4, reasonCodes: ['AUTHORITY_REVOKED'] });
    expect(store.inspect(3).facts.find(f => f.ref === 'urn:authority:child')?.validity.state).toBe('valid');
    expect(store.resolve({ ...request(), minimumRevision: 5 })).toMatchObject({ ok: false, reasonCodes: ['STALE_AUTHORITY_REVISION'] });
    if (!before.ok) throw new Error('missing old snapshot');
    expect(before.envelope.validity.state).toBe('valid');
    expect(store.inspect(4).facts.find(f => f.ref === 'urn:authority:child')?.validity.revocationRefs).toEqual(['urn:revocation:child']);
  });
  it('compiles a bounded subset and refuses amplification, target drift and implicit grant union', () => {
    const { store } = state(); const scope: AuthorityScope = { target, operations: ['A'], effects: ['external-write'] };
    expect(store.resolve({ ...request(), scope })).toMatchObject({ ok: true, envelope: { scope } });
    expect(store.resolve({ ...request(), scope: { ...scope, operations: ['B'] } })).toMatchObject({ ok: false, reasonCodes: ['AUTHORITY_AMPLIFICATION'] });
    expect(store.resolve({ ...request(), scope: { ...scope, target: { ...target, resourceRef: 'urn:resource:other' } } })).toMatchObject({ ok: false, reasonCodes: ['TARGET_MISMATCH'] });
    expect(store.resolve({ ...request(), authorityRefs: ['urn:authority:root', 'urn:authority:child'] })).toMatchObject({ ok: false, reasonCodes: ['UNSUPPORTED_AUTHORITY_COMPOSITION'] });
  });
  it('fails closed on duplicate identity, unknown source, invalid lineage and policy drift', () => {
    const { store } = state();
    expect(() => store.append({ id: 'duplicate', type: 'fact', fact: authorityFact() }, 3)).toThrow('AMBIGUOUS_AUTHORITY');
    expect(store.resolve(request('urn:authority:missing'))).toMatchObject({ ok: false, reasonCodes: ['AUTHORITY_SOURCE_NOT_FOUND'] });
    expect(() => store.append({ id: 'orphan', type: 'fact', fact: authorityFact('urn:authority:orphan', 'urn:authority:missing') }, 3)).toThrow('INVALID_AUTHORITY_LINEAGE');
    store.append({ id: 'policy-2', type: 'policy', policy: { ...policy, version: '2', frontierRef: 'urn:policy:reference:2' } }, 3);
    expect(store.resolve(request())).toMatchObject({ ok: false, reasonCodes: ['POLICY_FRONTIER_MISMATCH'] });
  });
  it('preserves unrelated roots and fences concurrent writers and corrupted history', () => {
    const { store, dir } = state(); const other = authorityFact('urn:authority:independent');
    store.append({ id: 'other', type: 'fact', fact: other }, 3);
    expect(() => store.append({ id: 'stale-write', type: 'invalidity', ref: other.ref, state: 'revoked', evidenceRef: 'urn:revoke:other' }, 3)).toThrow('AUTHORITY_REVISION_CONFLICT');
    store.append({ id: 'revoke', type: 'invalidity', ref: 'urn:authority:child', state: 'revoked', evidenceRef: 'urn:revoke:child' }, 4);
    expect(store.resolve(request(other.ref)).ok).toBe(true);
    const file = join(dir, '0000000002.json'); const tile = JSON.parse(readFileSync(file, 'utf8'));
    tile.payload.authorityState.event.fact.scope.operations.push('INJECTED'); writeFileSync(file, JSON.stringify(tile));
    expect(() => store.resolve(request())).toThrow('AUTHORITY_HISTORY_INVALID');
  });
  it('returns a detached projection; caller mutation cannot rewrite authoritative history', () => {
    const { store } = state(); const resolved = store.resolve(request());
    if (!resolved.ok) throw new Error('unresolved');
    (resolved.envelope as AuthorityEnvelope).scope.operations.push('B');
    expect(store.resolve(request())).toMatchObject({ ok: true, envelope: { scope: { operations: ['A', 'A2'] } } });
  });
  it('rechecks old envelopes at the handler boundary and reports the acknowledged revision', () => {
    const { store } = state(); const old = store.resolve(request()); if (!old.ok) throw new Error('unresolved');
    const operation = { query: request(), operation: 'A', effect: 'external-write' as const, target, context: {}, providerCapabilities: [authorityFact().scope], ceilings: [],
      gates: { safeHold: { active: false, evidenceRef: 'urn:gate:no-hold' }, identitySensitive: { required: false, satisfied: false, evidenceRef: 'urn:gate:identity' } }, intentRefs: [], submittedEnvelope: old.envelope };
    expect(authorizeCurrentOperation(store, operation).evaluation.payload.effect).toBe('allow');
    store.append({ id: 'revoke', type: 'invalidity', ref: 'urn:authority:child', state: 'revoked', evidenceRef: 'urn:revoke:child' }, 3);
    const result = authorizeCurrentOperation(store, { ...operation, query: { ...request(), minimumRevision: 4 } });
    expect(result.revision).toBe(4); expect(result.evaluation.payload.effect).toBe('deny'); expect(result.evaluation.payload.reasonCodes).toContain('AUTHORITY_REVOKED');
  });
});
