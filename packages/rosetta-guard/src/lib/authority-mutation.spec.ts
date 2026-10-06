import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildTile } from '@entif-ai/rosetta-core';
import { createReceipt, createSigningKeyPair, signReceiptEd25519 } from '@entif-ai/rosetta-receipts';
import { LocalAuthorityState, type AuthorityFact } from './authority-state.js';
import { LocalAdmissionJournal, LocalWriteAdmission } from './write-admission.js';
import { ConfiguredRootAuthoritySource, GovernedAuthorityMutator } from './authority-mutation.js';

const now = '2026-10-05T12:00:00Z'; const dirs: string[] = [];
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }); });
function rig() {
  const dir = mkdtempSync(join(tmpdir(), 'governed-authority-')); dirs.push(dir); const keys = createSigningKeyPair();
  const target = { resourceRef: 'urn:resource:reference', domainRef: { tenantId: 'reference', classification: 'internal' as const, abacLabels: [] } };
  const scope = { target, operations: ['A', 'A2', 'authority.grant', 'authority.delegate', 'authority.revoke', 'authority.invalidate', 'authority.supersede', 'authority.policy-update'], effects: ['external-write' as const, 'local-write' as const] };
  const root: AuthorityFact = { ref: 'urn:authority:operator-source', parentRef: null, subjectRef: 'urn:actor:reference', scope,
    policy: { ref: 'urn:policy:reference', version: '1', frontierRef: 'urn:policy:1' }, contextConstraints: {}, requiredActorEvidenceRefs: [],
    validity: { notBefore: '2026-10-05T00:00:00Z', expiresAt: '2027-01-01T00:00:00Z', state: 'valid', revocationRefs: [], invalidityRefs: [], supersededByRefs: [] },
    delegation: { ceiling: scope, furtherDelegation: true, depthRemaining: 4 } };
  const anchor = { issuerRef: 'urn:issuer:operator', anchorRef: 'urn:anchor:operator', keyId: 'operator.ed25519.1', publicKeyPem: keys.publicKeyPem };
  const witness = buildTile('rosetta.observation', { observationId: 'root-source', source: anchor.issuerRef, signal: 'Configured operator authority source', authorityRoot: root });
  const receipt = createReceipt({ receiptType: 'authz.root-source-attestation.v1', policyRefs: [anchor.anchorRef], subjects: [{ cid: witness.cid }], digests: [],
    claims: [{ claimType: 'authz.root-source-attestation', statement: 'Operator configuration witness.', verdict: 'pass', evidence: [{ cid: witness.cid }] }] });
  const configuration = { sourceRef: 'urn:configured:operator-source', anchor, root };
  const proof = { observation: witness, signedReceipt: signReceiptEd25519(receipt, keys.privateKey, keys.publicKeyPem, anchor.keyId) };
  const source = new ConfiguredRootAuthoritySource(join(dir, 'operator-source'), configuration, proof);
  const state = new LocalAuthorityState(join(dir, 'authority')); const journal = new LocalAdmissionJournal(join(dir, 'evidence')); const admission = new LocalWriteAdmission(journal);
  const workflow = { evaluatedAt: now, policy: { policyId: 'urn:workflow:state' }, policySnapshotId: 'urn:workflow:state:1', startupGrantSnapshotId: 'urn:startup:state:1',
    startupProfile: { allowedAdapters: ['authz-state'], allowedCapabilityFamilies: ['governed-state'], allowedEffectClasses: ['local-write'] },
    workflow: { artifactId: 'bound-at-admission', requestedAdapters: [{ adapterId: 'authz-state', capabilityFamily: 'governed-state' }], requestedEffects: [{ effectClass: 'local-write', effectTier: 'bounded' }] } };
  const service = new GovernedAuthorityMutator(state, source, admission, { subjectRef: root.subjectRef, now: () => now, workflow,
    gates: { safeHold: { active: false, evidenceRef: 'urn:gate:hold' }, identitySensitive: { required: false, satisfied: false, evidenceRef: 'urn:gate:identity' } } });
  const standing = { ...structuredClone(root), ref: 'urn:authority:standing', delegation: { ...root.delegation, depthRemaining: 2 } };
  const childScope = { ...scope, operations: ['A', 'A2'], effects: ['external-write' as const] };
  const child = { ...structuredClone(standing), ref: 'urn:authority:child', parentRef: standing.ref, scope: childScope, delegation: { ceiling: childScope, furtherDelegation: false, depthRemaining: 0 } };
  const start = async () => { await service.mutate({ event: { id: 'policy', type: 'policy', policy: root.policy } }); return service.mutate({ event: { id: 'root', type: 'fact', fact: standing } }); };
  return { service, state, journal, source, configuration, proof, standing, child, start, dir };
}
describe('governed authority mutation #1761', () => {
  it('establishes a root and attenuated delegation through durable admission and Receipt linkage', async () => {
    const r = rig(); expect((await r.start()).status).toBe('pass');
    const result = await r.service.mutate({ event: { id: 'child', type: 'fact', fact: r.child } });
    expect(result).toMatchObject({ status: 'pass', revision: 3 }); expect(r.journal.read(result.receiptRef!)).toMatchObject({ kind: 'rosetta.receipt' });
    expect(r.state.resolve({ authorityRefs: [r.child.ref], subjectRef: r.child.subjectRef, now }).ok).toBe(true);
  });
  it('rejects a valid signature from an unpinned source and never treats a grant request as authority', async () => {
    const r = rig(); const stranger = createSigningKeyPair();
    const proof = { ...r.proof, signedReceipt: signReceiptEd25519(r.proof.signedReceipt.receipt, stranger.privateKey, stranger.publicKeyPem, r.configuration.anchor.keyId) };
    expect(() => new ConfiguredRootAuthoritySource(join(r.dir, 'stranger'), r.configuration, proof)).toThrow('UNTRUSTED_ROOT_SOURCE');
    await expect(r.service.mutate({ event: { id: 'self', type: 'grant-me', admin: true } })).rejects.toThrow('UNINTERPRETABLE_AUTHORITY_EVENT');
    expect(r.state.inspect().revision).toBe(0);
  });
  it('denies amplification before appending any authority and preserves the current revision', async () => {
    const r = rig(); await r.start(); const before = r.state.inspect();
    const amplified = { ...r.child, scope: { ...r.child.scope, operations: ['B'] }, delegation: { ...r.child.delegation, ceiling: { ...r.child.scope, operations: ['B'] } } };
    const result = await r.service.mutate({ event: { id: 'amplify', type: 'fact', fact: amplified } });
    expect(result.status).toBe('deny'); expect(result.reasonCodes).toContain('AUTHORITY_AMPLIFICATION'); expect(r.state.inspect()).toEqual(before);
    for (const tile of r.journal.all()) for (const parent of tile.parents) expect(() => r.journal.read(parent)).not.toThrow();
  });
  it('reconciles duplicate identity and rejects a different payload without duplicate authority', async () => {
    const r = rig(); await r.start(); const input = { event: { id: 'child', type: 'fact' as const, fact: r.child } };
    const first = await r.service.mutate(input); expect((await r.service.mutate(input))).toMatchObject({ status: 'reconciled', receiptRef: first.receiptRef, revision: 3 });
    expect((await r.service.mutate({ event: { fact: r.child, type: 'fact', id: 'child' } })).status).toBe('reconciled');
    const conflict = await r.service.mutate({ event: { ...input.event, fact: { ...r.child, subjectRef: 'urn:actor:injected' } } });
    expect(conflict.status).toBe('deny'); expect(conflict.reasonCodes).toContain('AUTHORITY_MUTATION_ID_CONFLICT'); expect(r.state.inspect().revision).toBe(3);
  });
  it('reconciles a transport-lost acknowledgement before retry and never reapplies the mutation', async () => {
    const r = rig(); await r.start(); const input = { event: { id: 'child', type: 'fact' as const, fact: r.child } };
    const transport = async () => { await r.service.mutate(input); throw new Error('lost response after commit'); };
    await expect(transport()).rejects.toThrow('lost response'); const frontier = r.state.inspect().frontierRef;
    expect((await r.service.mutate(input)).status).toBe('reconciled'); expect(r.state.inspect()).toMatchObject({ revision: 3, frontierRef: frontier });
  });
  it('revocation replay and old grant evidence cannot restore a child; independent roots survive', async () => {
    const r = rig(); await r.start(); const grant = { event: { id: 'child', type: 'fact' as const, fact: r.child } }; await r.service.mutate(grant);
    const other = { ...r.standing, ref: 'urn:authority:independent' }; await r.service.mutate({ event: { id: 'other', type: 'fact', fact: other } });
    const revoke = { authorizerRef: r.standing.ref, event: { id: 'revoke', type: 'invalidity' as const, ref: r.child.ref, state: 'revoked' as const, evidenceRef: 'urn:revoke:child' } };
    expect((await r.service.mutate(revoke)).revision).toBe(5); expect((await r.service.mutate(revoke)).status).toBe('reconciled');
    expect((await r.service.mutate(grant)).status).toBe('reconciled'); expect(r.state.inspect().revision).toBe(5);
    expect(r.state.inspect(3).facts.find(f => f.ref === r.child.ref)?.validity.state).toBe('valid');
    expect(r.state.resolve({ authorityRefs: [r.child.ref], subjectRef: r.child.subjectRef, now, minimumRevision: 5 }).ok).toBe(false);
    expect(r.state.resolve({ authorityRefs: [other.ref], subjectRef: other.subjectRef, now }).ok).toBe(true);
  });
  it('holds authority mutation before apply when its admission checkpoint cannot persist', async () => {
    const r = rig(); await r.start(); const before = r.state.inspect(); const persist = r.journal.persist.bind(r.journal);
    r.journal.persist = tile => { if ('admissionCheckpoint' in (tile.payload as object)) throw new Error('checkpoint unavailable'); return persist(tile); };
    expect((await r.service.mutate({ event: { id: 'child', type: 'fact', fact: r.child } })).status).toBe('block'); expect(r.state.inspect()).toEqual(before);
  });
  it('reconciles committed readback after Receipt storage recovers without repeating apply', async () => {
    const r = rig(); await r.start(); const input = { event: { id: 'child', type: 'fact' as const, fact: r.child } }; const persist = r.journal.persist.bind(r.journal);
    r.journal.persist = tile => { if (tile.kind === 'rosetta.receipt' && (tile.payload as { receiptType?: string }).receiptType === 'rrp:lifecycle.v1') throw new Error('storage interrupted'); return persist(tile); };
    expect((await r.service.mutate(input)).status).toBe('safe-hold'); expect(r.state.inspect().revision).toBe(3);
    r.journal.persist = persist;
    expect((await r.service.mutate(input)).status).toBe('reconciled'); expect(r.state.inspect().revision).toBe(3);
  });
  it('preserves declared expiry and supersession without deleting historical grant evidence', async () => {
    const r = rig(); await r.start(); const child = { ...r.child, validity: { ...r.child.validity, expiresAt: '2026-10-05T13:00:00Z' } };
    await r.service.mutate({ event: { id: 'child', type: 'fact', fact: child } });
    expect(r.state.resolve({ authorityRefs: [child.ref], subjectRef: child.subjectRef, now: '2026-10-05T14:00:00Z' })).toMatchObject({ ok: false, reasonCodes: ['AUTHORITY_EXPIRED'] });
    expect((await r.service.mutate({ authorizerRef: r.standing.ref, event: { id: 'supersede', type: 'invalidity', state: 'superseded', ref: child.ref, evidenceRef: 'urn:successor:grant' } })).status).toBe('pass');
    expect(r.state.resolve({ authorityRefs: [child.ref], subjectRef: child.subjectRef, now })).toMatchObject({ ok: false, reasonCodes: ['AUTHORITY_INVALID'] });
    expect(r.state.inspect(3).facts.find(f => f.ref === child.ref)?.validity.state).toBe('valid');
  });
});
