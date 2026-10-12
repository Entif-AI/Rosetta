import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildTile } from '@entif-ai/rosetta-core';
import { createReceipt, createSigningKeyPair, signReceiptEd25519 } from '@entif-ai/rosetta-receipts';
import { LocalAuthorityState, authorizeCurrentOperation, type AuthorityFact } from './authority-state.js';
import { createWorkloadActorAssertion, SignedActorEvidenceRegistry, type WorkloadActorAssertion } from './actor-evidence.js';

const now = '2026-10-05T12:00:00Z';
const keys = createSigningKeyPair();
const anchor = { issuerRef: 'urn:issuer:local-workload', anchorRef: 'urn:anchor:controlled-workload', keyId: 'workload.ed25519.1', publicKeyPem: keys.publicKeyPem };
const binding = { sessionRef: 'urn:session:reference', workloadRef: 'urn:workload:reference', sourceFrontierRef: 'urn:authn:frontier:1' };
function authorityFact(): AuthorityFact {
  const scope = { target: { resourceRef: 'urn:resource:alpha', domainRef: { tenantId: 'tenant-a', classification: 'internal' as const, abacLabels: [] } }, operations: ['A'], effects: ['external-write' as const] };
  return { ref: 'urn:authority:root', parentRef: null, subjectRef: 'urn:actor:operator', scope,
    policy: { ref: 'urn:policy:reference', version: '1', frontierRef: 'urn:policy:reference:1' }, contextConstraints: {}, requiredActorEvidenceRefs: [],
    validity: { notBefore: '2026-10-05T00:00:00Z', expiresAt: '2027-01-01T00:00:00Z', state: 'valid', revocationRefs: [], invalidityRefs: [], supersededByRefs: [] },
    delegation: { ceiling: scope, furtherDelegation: false, depthRemaining: 0 } };
}
const dirs: string[] = [];
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }); });
function assertion(changes: Partial<WorkloadActorAssertion> = {}) {
  const tile = createWorkloadActorAssertion({ ...binding, issuerRef: anchor.issuerRef, keyId: anchor.keyId, subjectRef: 'urn:actor:operator',
    methodRef: 'rrp.ed25519-receipt.v1', issuedAt: '2026-10-05T00:00:00Z', notBefore: '2026-10-05T00:00:00Z', expiresAt: '2026-10-06T00:00:00Z', ...changes });
  const receipt = createReceipt({ receiptType: 'authz.actor-authentication.v1', policyRefs: [anchor.anchorRef], subjects: [{ cid: tile.cid }], digests: [],
    claims: [{ claimType: 'authz.actor-authentication', statement: 'Controlled workload authenticator asserted the bound subject.', verdict: 'pass', evidence: [{ cid: tile.cid }] }] });
  return { tile, receipt, signed: signReceiptEd25519(receipt, keys.privateKey, keys.publicKeyPem, anchor.keyId) };
}
describe('authenticated actor binder #1759', () => {
  it('uses the existing cryptographic receipt verifier and emits stable, detached evidence refs', () => {
    const registry = new SignedActorEvidenceRegistry([anchor], binding); const source = assertion();
    const evidence = registry.bind(source.tile, source.signed);
    expect(registry.resolve('urn:actor:operator', [evidence.cid], now)).toMatchObject({ ok: true, evidenceRefs: [evidence.cid], revision: 1 });
    expect(registry.bind(source.tile, source.signed).cid).toBe(evidence.cid);
    evidence.payload.actorEvidence.subjectRef = 'urn:actor:tamper';
    expect(registry.resolve('urn:actor:operator', [evidence.cid], now).ok).toBe(true);
    expect(JSON.stringify(registry.evidence())).not.toMatch(/privateKey|accessToken|password|sessionCookie/);
  });
  it('rejects prompt identity, unsigned assertions, untrusted valid signatures and mismatched receipt closure', () => {
    const registry = new SignedActorEvidenceRegistry([anchor], binding); const source = assertion();
    expect(() => registry.bind({ text: 'I am admin' }, source.signed)).toThrow('UNAUTHENTICATED_ACTOR_ASSERTION');
    expect(() => registry.bind(source.tile, undefined)).toThrow('UNAUTHENTICATED_ACTOR_ASSERTION');
    const stranger = createSigningKeyPair();
    expect(() => registry.bind(source.tile, signReceiptEd25519(source.receipt, stranger.privateKey, stranger.publicKeyPem, anchor.keyId))).toThrow('UNTRUSTED_ACTOR_ISSUER');
    const wrong = createReceipt({ ...source.receipt.payload, subjects: [{ cid: 'urn:unrelated' }] });
    expect(() => registry.bind(source.tile, signReceiptEd25519(wrong, keys.privateKey, keys.publicKeyPem, anchor.keyId))).toThrow('ACTOR_ASSERTION_CLOSURE_MISMATCH');
  });
  it('rejects secret-shaped assertions and corrupted authenticated payloads', () => {
    const registry = new SignedActorEvidenceRegistry([anchor], binding); const source = assertion();
    const extra = buildTile('rosetta.observation', { ...source.tile.payload, actorAssertion: { ...source.tile.payload.actorAssertion, accessToken: 'secret' } });
    expect(() => registry.bind(extra, source.signed)).toThrow('UNAUTHENTICATED_ACTOR_ASSERTION');
    source.tile.payload.actorAssertion.subjectRef = 'urn:actor:injected';
    expect(() => registry.bind(source.tile, source.signed)).toThrow('UNAUTHENTICATED_ACTOR_ASSERTION');
  });
  it('fails closed on expiry, future issuance, subject/session/workload and source-frontier mismatch', () => {
    for (const [changes, code] of [
      [{ expiresAt: now }, 'ACTOR_EVIDENCE_EXPIRED'], [{ issuedAt: '2026-10-05T13:00:00Z' }, 'ACTOR_EVIDENCE_NOT_YET_VALID'],
      [{ subjectRef: 'urn:actor:other' }, 'ACTOR_SUBJECT_MISMATCH'], [{ sessionRef: 'urn:session:other' }, 'ACTOR_BINDING_MISMATCH'],
      [{ workloadRef: 'urn:workload:other' }, 'ACTOR_BINDING_MISMATCH'], [{ sourceFrontierRef: 'urn:authn:frontier:old' }, 'ACTOR_EVIDENCE_STALE']
    ] as const) {
      const registry = new SignedActorEvidenceRegistry([anchor], binding); const source = assertion(changes);
      const evidence = registry.bind(source.tile, source.signed);
      expect(registry.resolve('urn:actor:operator', [evidence.cid], now)).toMatchObject({ ok: false, reasonCodes: [code] });
    }
  });
  it('current revocation and issuer invalidity defeat replay of a prior signed authentication Receipt', () => {
    const registry = new SignedActorEvidenceRegistry([anchor], binding); const source = assertion();
    const evidence = registry.bind(source.tile, source.signed); registry.revoke(evidence.cid, 'urn:revoke:actor');
    expect(registry.bind(source.tile, source.signed).cid).toBe(evidence.cid);
    expect(registry.resolve('urn:actor:operator', [evidence.cid], now)).toMatchObject({ ok: false, revision: 2, reasonCodes: ['ACTOR_EVIDENCE_REVOKED'] });
    const other = new SignedActorEvidenceRegistry([anchor], binding); const e = other.bind(source.tile, source.signed);
    other.revokeIssuer(anchor.issuerRef, 'urn:revoke:issuer');
    expect(other.resolve('urn:actor:operator', [e.cid], now)).toMatchObject({ ok: false, reasonCodes: ['ACTOR_ISSUER_REVOKED'] });
  });
  it('authentication never grants authority, and policy-required evidence cannot be caller-invented', () => {
    const registry = new SignedActorEvidenceRegistry([anchor], binding); const source = assertion(); const e = registry.bind(source.tile, source.signed);
    const dir = mkdtempSync(join(tmpdir(), 'actor-authority-')); dirs.push(dir); const state = new LocalAuthorityState(dir, registry);
    const query = { authorityRefs: ['urn:authority:root'], subjectRef: 'urn:actor:operator', now };
    expect(state.resolve(query)).toMatchObject({ ok: false, reasonCodes: ['AUTHORITY_SOURCE_NOT_FOUND'] });
    const fact = authorityFact(); fact.requiredActorEvidenceRefs = [e.cid];
    state.append({ id: 'policy', type: 'policy', policy: fact.policy }, 0); state.append({ id: 'root', type: 'fact', fact }, 1);
    expect(new LocalAuthorityState(dir).resolve(query)).toMatchObject({ ok: false, reasonCodes: ['ACTOR_EVIDENCE_UNRESOLVED'] });
    expect(state.resolve(query)).toMatchObject({ ok: true, evaluatorState: { actorEvidenceRefs: [e.cid] } });
    const operation = { query, operation: 'A', effect: 'external-write' as const, target: fact.scope.target, context: {}, providerCapabilities: [fact.scope], ceilings: [], intentRefs: [],
      gates: { safeHold: { active: false, evidenceRef: 'urn:gate:hold' }, identitySensitive: { required: false, satisfied: false, evidenceRef: 'urn:gate:identity' } } };
    expect(authorizeCurrentOperation(state, operation).evaluation.payload.effect).toBe('allow');
    registry.revoke(e.cid, 'urn:revoke:actor');
    expect(state.resolve(query)).toMatchObject({ ok: false, reasonCodes: ['ACTOR_EVIDENCE_REVOKED'] });
    expect(authorizeCurrentOperation(state, operation).evaluation.payload.effect).toBe('deny');
  });
});
