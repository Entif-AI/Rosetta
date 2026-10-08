import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildTile, verifyTileIntegrity } from '@entif-ai/rosetta-core';
import { LocalAuthorityState, type AuthorityFact } from './authority-state.js';
import { LocalAdmissionJournal, LocalWriteAdmission, createAdmissionProposal, resolveWriteAuthorization, type WriteAdmissionAdapter } from './write-admission.js';

const now = '2026-10-05T12:00:00Z'; const dirs: string[] = [];
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }); });
function rig() {
  const dir = mkdtempSync(join(tmpdir(), 'admission-')); dirs.push(dir);
  const target = { resourceRef: 'urn:resource:reference', domainRef: { tenantId: 'reference', classification: 'internal' as const, abacLabels: [] } };
  const scope = { target, operations: ['A'], effects: ['external-write' as const] }; const policy = { ref: 'urn:policy:reference', version: '1', frontierRef: 'urn:policy:1' };
  const fact: AuthorityFact = { ref: 'urn:authority:root', parentRef: null, subjectRef: 'urn:actor:reference', scope, policy, contextConstraints: {}, requiredActorEvidenceRefs: [],
    validity: { notBefore: '2026-10-05T00:00:00Z', expiresAt: '2027-01-01T00:00:00Z', state: 'valid', revocationRefs: [], invalidityRefs: [], supersededByRefs: [] }, delegation: { ceiling: scope, depthRemaining: 0, furtherDelegation: false } };
  const state = new LocalAuthorityState(join(dir, 'authority')); state.append({ id: 'policy', type: 'policy', policy }, 0); state.append({ id: 'root', type: 'fact', fact }, 1);
  const journal = new LocalAdmissionJournal(join(dir, 'evidence')); const admission = new LocalWriteAdmission(journal);
  const input = { id: 'write-1', operation: 'A', effect: 'external-write' as const, target, subjectRef: fact.subjectRef, value: { content: 'bounded' } };
  const workflow = { evaluatedAt: now, policy: { policyId: 'urn:workflow:reference' }, policySnapshotId: 'urn:workflow:1', startupGrantSnapshotId: 'urn:startup:1',
    startupProfile: { allowedAdapters: ['reference'], allowedCapabilityFamilies: ['local-write'], allowedEffectClasses: ['external-write'] },
    workflow: { artifactId: 'urn:workflow:request', requestedAdapters: [{ adapterId: 'reference', capabilityFamily: 'local-write' }], requestedEffects: [{ effectClass: 'external-write', effectTier: 'bounded' }] } };
  const operation = { query: { authorityRefs: [fact.ref], subjectRef: fact.subjectRef, now }, operation: 'A', effect: 'external-write' as const, target, context: {}, providerCapabilities: [scope], ceilings: [], intentRefs: [],
    gates: { safeHold: { active: false, evidenceRef: 'urn:gate:hold' }, identitySensitive: { required: false, satisfied: false, evidenceRef: 'urn:gate:identity' } } };
  let effects = 0;
  const adapter: WriteAdmissionAdapter = {
    normalize: createAdmissionProposal,
    authorize: proposal => resolveWriteAuthorization(state, operation, proposal, workflow),
    ground: (p, a) => buildTile('rosetta.observation', { observationId: 'ground', source: 'urn:admission:ground', signal: 'Resolved sources', admissionGrounding: { proposalRef: p.action.cid, frontierRef: a.frontierRef, sourceRefs: [a.frontierRef] } }),
    apply: (_p, _a, checkpoint) => { expect(journal.read(checkpoint.cid)).toEqual(checkpoint); return ++effects; },
    observe: (p, result) => buildTile('rosetta.observation', { observationId: 'readback', source: 'urn:target:reference', signal: 'Readback matched', writeObservation: { proposalRef: p.action.cid, matched: result === effects } }),
    project: () => 'urn:projection:queued'
  };
  const revoke = () => state.append({ id: 'revoke', type: 'invalidity', ref: fact.ref, state: 'revoked', evidenceRef: 'urn:revoke:1' }, 2);
  return { admission, journal, adapter, input, workflow, state, revoke, effects: () => effects };
}
describe('canonical write admission #994/#1765', () => {
  it('executes the nine steps with checkpoint/readback and durable canonical Receipt closure', async () => {
    const r = rig(); const result = await r.admission.execute(r.input, r.adapter);
    expect(result.status).toBe('pass'); expect(result.effect).toBe('committed'); expect(r.effects()).toBe(1);
    expect(result.steps).toEqual(['propose', 'normalize', 'authorize', 'ground', 'checkpoint', 'apply', 'observe', 'receipt', 'project']);
    expect(verifyTileIntegrity(result.receipt).ok).toBe(true); expect(r.journal.read(result.receipt.cid)).toEqual(result.receipt);
    expect(result.receipt.payload.subjects.length).toBeGreaterThan(5);
  });
  it('refuses malformed intent and failed grounding/checkpoint before any apply effect', async () => {
    const a = rig(); expect((await a.admission.execute({ admin: true }, a.adapter)).status).toBe('fail'); expect(a.effects()).toBe(0);
    const b = rig(); b.adapter.ground = () => { throw new Error('missing source'); };
    expect((await b.admission.execute(b.input, b.adapter)).status).toBe('block'); expect(b.effects()).toBe(0);
    const c = rig(); const persist = c.journal.persist.bind(c.journal);
    c.journal.persist = tile => { if ('admissionCheckpoint' in (tile.payload as object)) throw new Error('durability unavailable'); return persist(tile); };
    expect((await c.admission.execute(c.input, c.adapter)).status).toBe('block'); expect(c.effects()).toBe(0);
  });
  it('keeps startup/workflow narrowing independent from a valid current allow', async () => {
    const r = rig(); r.workflow.startupProfile.allowedAdapters = [];
    const result = await r.admission.execute(r.input, r.adapter);
    expect(result.status).toBe('deny'); expect(r.effects()).toBe(0); expect(result.reasonCodes).toContain('WORKFLOW_POLICY_DENIED');
  });
  it('rechecks current authority after checkpoint and denies an acknowledged revoke before apply', async () => {
    const r = rig(); const persist = r.journal.persist.bind(r.journal);
    r.journal.persist = tile => { const saved = persist(tile); if ('admissionCheckpoint' in (tile.payload as object)) r.revoke(); return saved; };
    const result = await r.admission.execute(r.input, r.adapter);
    expect(result.status).toBe('deny'); expect(result.reasonCodes).toContain('AUTHORITY_REVOKED'); expect(r.effects()).toBe(0);
  });
  it('reports effect ambiguity and readback drift without a success Receipt', async () => {
    const a = rig(); a.adapter.apply = () => { throw new Error('ack lost'); };
    expect((await a.admission.execute(a.input, a.adapter)).effect).toBe('unknown');
    const b = rig(); b.adapter.observe = p => buildTile('rosetta.observation', { observationId: 'drift', source: 'urn:target', signal: 'Drift', writeObservation: { proposalRef: p.action.cid, matched: false } });
    const result = await b.admission.execute(b.input, b.adapter); expect(result.status).toBe('partial'); expect(result.receipt.payload.claims[0].verdict).toBe('partial'); expect(b.effects()).toBe(1);
  });
  it('records projection failure after completed admission without hiding the durable effect', async () => {
    const r = rig(); r.adapter.project = () => { throw new Error('queue unavailable'); };
    const result = await r.admission.execute(r.input, r.adapter);
    expect(result.status).toBe('pass'); expect(result.projection.status).toBe('failed'); expect(r.effects()).toBe(1);
  });
  it('holds acknowledgement if Receipt persistence fails after a measured effect', async () => {
    const r = rig(); const persist = r.journal.persist.bind(r.journal);
    r.journal.persist = tile => { if (tile.kind === 'rosetta.receipt') throw new Error('private storage error'); return persist(tile); };
    await expect(r.admission.execute(r.input, r.adapter)).rejects.toMatchObject({ code: 'ADMISSION_CLOSURE_UNCONFIRMED', effect: 'committed', message: 'ADMISSION_CLOSURE_UNCONFIRMED' });
    expect(r.effects()).toBe(1);
  });
});
