import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { LocalAuthorityState, type AuthorityFact } from './authority-state.js';
import { LocalAdmissionJournal, LocalWriteAdmission } from './write-admission.js';
import { LocalCredentialMediator, LocalReferenceProvider } from './credential-mediator.js';

const now = '2026-10-05T12:00:00Z'; const dirs: string[] = []; const secret = randomBytes(32).toString('hex');
afterEach(() => { for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true }); });
function rig(operations = ['A', 'A2']) {
  const dir = mkdtempSync(join(tmpdir(), 'credential-mediator-')); dirs.push(dir);
  const target = { resourceRef: 'urn:resource:reference', domainRef: { tenantId: 'reference', classification: 'internal' as const, abacLabels: [] } };
  const scope = { target, operations, effects: ['external-write' as const] }; const providerScope = { ...scope, operations: ['A', 'A2', 'B'] };
  const fact: AuthorityFact = { ref: 'urn:authority:child', parentRef: null, subjectRef: 'urn:actor:reference', scope, policy: { ref: 'urn:policy:reference', version: '1', frontierRef: 'urn:policy:1' }, contextConstraints: {}, requiredActorEvidenceRefs: [],
    validity: { notBefore: '2026-10-05T00:00:00Z', expiresAt: '2027-01-01T00:00:00Z', state: 'valid', revocationRefs: [], invalidityRefs: [], supersededByRefs: [] }, delegation: { ceiling: scope, furtherDelegation: false, depthRemaining: 0 } };
  const state = new LocalAuthorityState(join(dir, 'authority')); state.append({ id: 'policy', type: 'policy', policy: fact.policy }, 0); state.append({ id: 'child', type: 'fact', fact }, 1);
  const journal = new LocalAdmissionJournal(join(dir, 'evidence')); const admission = new LocalWriteAdmission(journal);
  const provider = new LocalReferenceProvider(join(dir, 'provider'), secret, target, ['A', 'A2', 'B']);
  const metadata = { providerRef: 'urn:provider:reference', accountRef: 'urn:account:reference', credentialHandle: 'urn:credential:reference', target, capabilities: [providerScope], expiresAt: '2026-10-06T00:00:00Z', revoked: false };
  let reads = 0; let selectedSecret = secret; let duringSelection: (() => void) | undefined;
  const mediator = new LocalCredentialMediator(state, admission, { metadata: () => metadata, resolveSecret: () => { reads++; duringSelection?.(); return selectedSecret; }, adapter: provider }, {
    authorityRefs: [fact.ref], subjectRef: fact.subjectRef, target, providerRef: metadata.providerRef, accountRef: metadata.accountRef, operations: ['A', 'A2', 'B'], now: () => now,
    context: {}, ceilings: [], gates: { safeHold: { active: false, evidenceRef: 'urn:gate:hold' }, identitySensitive: { required: false, satisfied: false, evidenceRef: 'urn:gate:identity' } },
    workflow: { evaluatedAt: now, policy: { policyId: 'urn:workflow:provider' }, policySnapshotId: 'urn:workflow:provider:1', startupGrantSnapshotId: 'urn:startup:provider:1',
      startupProfile: { allowedAdapters: ['reference-provider'], allowedCapabilityFamilies: ['bounded-provider'], allowedEffectClasses: ['external-write'] },
      workflow: { artifactId: 'bound-at-admission', requestedAdapters: [{ adapterId: 'reference-provider', capabilityFamily: 'bounded-provider' }], requestedEffects: [{ effectClass: 'external-write', effectTier: 'bounded' }] } }
  });
  const revoke = () => state.append({ id: 'revoke', type: 'invalidity', state: 'revoked', ref: fact.ref, evidenceRef: 'urn:revoke:1' }, 2);
  return { mediator, provider, metadata, journal, state, target, revoke, reads: () => reads, badSecret: () => { selectedSecret = 'invalid'; }, duringSelection: (run: () => void) => { duringSelection = run; } };
}
describe('bounded credential mediation #1760', () => {
  it('executes two standing-authority operations with measurable durable effects and never exports the credential', async () => {
    const r = rig(); const before = r.provider.inspect();
    expect((await r.mediator.execute({ id: 'a-1', operation: 'A' })).code).toBe('EXECUTED');
    expect((await r.mediator.execute({ id: 'a-2', operation: 'A2' })).code).toBe('EXECUTED');
    expect(r.provider.inspect().effectCount).toBe(2); expect(r.provider.inspect().stateDigest).not.toBe(before.stateDigest); expect(r.reads()).toBe(2);
    expect(JSON.stringify(r.journal.all())).not.toContain(secret); expect(JSON.stringify(r.mediator.discover())).not.toContain(secret);
  });
  it('denies provider-supported B before credential selection or provider effect', async () => {
    const r = rig(); const before = r.provider.inspect();
    expect((await r.mediator.execute({ id: 'b', operation: 'B' })).code).toBe('ENTIF_AUTHORITY_DENIED');
    expect(r.provider.inspect()).toEqual(before); expect(r.reads()).toBe(0);
  });
  it('revokes cached discovery and old envelope/decision/Receipt evidence while the credential remains valid', async () => {
    const r = rig(); const discovery = r.mediator.discover(); expect(discovery.operations).toEqual(['A', 'A2']);
    const old = r.state.resolve({ authorityRefs: ['urn:authority:child'], subjectRef: 'urn:actor:reference', now }); if (!old.ok) throw new Error('missing authority');
    const success = await r.mediator.execute({ id: 'a', operation: 'A' }); const before = r.provider.inspect(); r.revoke();
    for (const submittedEnvelope of [old.envelope, success.admission?.authorization?.evaluation, success.admission?.receipt, discovery.discovery]) {
      const result = await r.mediator.execute({ id: 'retry', operation: 'A', minimumRevision: 3, submittedEnvelope });
      expect(result.code).toBe('ENTIF_AUTHORITY_DENIED'); expect(result.revision).toBe(3); expect(r.provider.inspect()).toEqual(before);
    }
    expect(r.mediator.discover().operations).toEqual([]); expect(r.metadata.revoked).toBe(false); expect(r.reads()).toBe(1);
  });
  it('distinguishes provider scope, expiry, invalidity, account binding and authentication failures', async () => {
    for (const [change, code] of [
      [(r: ReturnType<typeof rig>) => { r.metadata.capabilities[0].operations = ['B']; }, 'PROVIDER_INSUFFICIENT_SCOPE'],
      [(r: ReturnType<typeof rig>) => { r.metadata.expiresAt = now; }, 'PROVIDER_CREDENTIAL_EXPIRED'],
      [(r: ReturnType<typeof rig>) => { r.metadata.revoked = true; }, 'PROVIDER_CREDENTIAL_REVOKED'],
      [(r: ReturnType<typeof rig>) => { r.metadata.accountRef = 'urn:account:other'; }, 'PROVIDER_BINDING_MISMATCH'],
      [(r: ReturnType<typeof rig>) => r.badSecret(), 'PROVIDER_AUTH_FAILURE']
    ] as const) {
      const r = rig(); change(r); const before = r.provider.inspect();
      expect((await r.mediator.execute({ id: code, operation: 'A' })).code).toBe(code); expect(r.provider.inspect()).toEqual(before);
      expect(JSON.stringify(r.journal.all())).not.toContain(secret);
      for (const tile of r.journal.all()) for (const parent of tile.parents) expect(() => r.journal.read(parent)).not.toThrow();
    }
  });
  it('rejects raw credential fields and malformed intents before any effect', async () => {
    const r = rig(); const before = r.provider.inspect();
    await expect(r.mediator.execute({ id: 'bad', operation: 'A', bearerToken: secret })).rejects.toThrow('UNINTERPRETABLE_EXECUTION_INTENT');
    expect(r.provider.inspect()).toEqual(before); expect(r.reads()).toBe(0);
  });
  it('rechecks a revoke acknowledged during credential selection before acquiring provider effect', async () => {
    const r = rig(); r.duringSelection(r.revoke); const before = r.provider.inspect();
    expect((await r.mediator.execute({ id: 'selection-revoke', operation: 'A' })).code).toBe('ENTIF_AUTHORITY_DENIED');
    expect(r.provider.inspect()).toEqual(before);
  });
});
import { randomBytes } from 'node:crypto';
