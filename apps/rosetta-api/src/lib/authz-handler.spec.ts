import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request, type Server } from 'node:http';
import { afterEach, describe, expect, it } from 'vitest';
import { LocalAuthorityState, LocalAdmissionJournal, LocalWriteAdmission, LocalCredentialMediator, LocalReferenceProvider, type AuthorityFact } from '@entif-ai/rosetta-guard';
import { createRosettaApiServer } from './rosetta-api.js';

const now = '2026-10-05T12:00:00Z'; const dirs: string[] = []; const servers: Server[] = [];
afterEach(async () => { for (const s of servers.splice(0)) { s.closeAllConnections(); await new Promise<void>(resolve => s.close(() => resolve())); } for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true }); });
async function rig() {
  const dir = mkdtempSync(join(tmpdir(), 'authz-http-')); dirs.push(dir); const token = randomBytes(32).toString('hex'); const credential = randomBytes(32).toString('hex');
  const target = { resourceRef: 'urn:resource:reference', domainRef: { tenantId: 'reference', classification: 'internal' as const, abacLabels: [] } };
  const scope = { target, operations: ['A', 'A2'], effects: ['external-write' as const] }; const providerScope = { ...scope, operations: ['A', 'A2', 'B'] };
  const fact: AuthorityFact = { ref: 'urn:authority:child', parentRef: null, subjectRef: 'urn:actor:reference', scope, policy: { ref: 'urn:policy:reference', version: '1', frontierRef: 'urn:policy:1' }, contextConstraints: {}, requiredActorEvidenceRefs: [],
    validity: { notBefore: '2026-10-05T00:00:00Z', expiresAt: '2027-01-01T00:00:00Z', state: 'valid', revocationRefs: [], invalidityRefs: [], supersededByRefs: [] }, delegation: { ceiling: scope, furtherDelegation: false, depthRemaining: 0 } };
  const state = new LocalAuthorityState(join(dir, 'authority')); state.append({ id: 'policy', type: 'policy', policy: fact.policy }, 0); state.append({ id: 'grant', type: 'fact', fact }, 1);
  const journal = new LocalAdmissionJournal(join(dir, 'evidence')); const provider = new LocalReferenceProvider(join(dir, 'provider'), credential, target, ['A', 'A2', 'B']);
  const mediator = new LocalCredentialMediator(state, new LocalWriteAdmission(journal), { metadata: () => ({ providerRef: 'urn:provider:reference', accountRef: 'urn:account:reference', credentialHandle: 'urn:credential:reference', target, capabilities: [providerScope], expiresAt: '2026-10-06T00:00:00Z', revoked: false }), resolveSecret: () => credential, adapter: provider }, {
    authorityRefs: [fact.ref], subjectRef: fact.subjectRef, target, operations: ['A', 'A2', 'B'], providerRef: 'urn:provider:reference', accountRef: 'urn:account:reference', now: () => now, context: {}, ceilings: [],
    gates: { safeHold: { active: false, evidenceRef: 'urn:gate:hold' }, identitySensitive: { required: false, satisfied: false, evidenceRef: 'urn:gate:identity' } },
    workflow: { evaluatedAt: now, policy: { policyId: 'urn:workflow:provider' }, policySnapshotId: 'urn:workflow:1', startupGrantSnapshotId: 'urn:startup:1', startupProfile: { allowedAdapters: ['reference-provider'], allowedCapabilityFamilies: ['bounded-provider'], allowedEffectClasses: ['external-write'] },
      workflow: { artifactId: 'bound-at-admission', requestedAdapters: [{ adapterId: 'reference-provider', capabilityFamily: 'bounded-provider' }], requestedEffects: [{ effectClass: 'external-write', effectTier: 'bounded' }] } }
  });
  let subjectRef = fact.subjectRef;
  const server = createRosettaApiServer({ execution: { mediator, authenticate: request => request.headers.authorization === `Bearer ${token}` ? { subjectRef } : null } });
  servers.push(server); await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve)); const address = server.address(); if (!address || typeof address === 'string') throw new Error('missing listener');
  const url = `http://127.0.0.1:${address.port}`; const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
  const call = (body: unknown, extra: Record<string, string> = {}) => fetch(`${url}/authz/execute`, { method: 'POST', headers: { ...headers, ...extra }, body: JSON.stringify(body) });
  return { state, provider, journal, url, headers, call, mismatch: () => { subjectRef = 'urn:actor:other'; }, revoke: () => state.append({ id: 'revoke', type: 'invalidity', state: 'revoked', ref: fact.ref, evidenceRef: 'urn:revoke:child' }, 2) };
}
describe('existing API handler-time authority #1771', () => {
  it('executes real HTTP A, then denies a cached tool after revoke before provider bytes change', async () => {
    const r = await rig(); const discovery = await (await fetch(`${r.url}/authz/tools`, { headers: r.headers })).json() as { operations: string[]; discovery: { cid: string } }; expect(discovery.operations).toEqual(['A', 'A2']);
    expect((await r.call({ id: 'a', operation: 'A' })).status).toBe(200); const before = r.provider.inspect(); expect(before.effectCount).toBe(1); r.revoke();
    const refused = await r.call({ id: 'cached-a', operation: discovery.operations[0], minimumRevision: 3, evidenceRefs: [discovery.discovery.cid] });
    expect(refused.status).toBe(403); expect(await refused.json()).toMatchObject({ code: 'ENTIF_AUTHORITY_DENIED', revision: 3 }); expect(r.provider.inspect()).toEqual(before);
  });
  it('rejects anonymous and incompatible authenticated subjects without granting rights', async () => {
    const r = await rig(); const before = r.provider.inspect();
    expect((await fetch(`${r.url}/authz/tools`)).status).toBe(401); r.mismatch(); expect((await r.call({ id: 'a', operation: 'A' })).status).toBe(403); expect(r.provider.inspect()).toEqual(before);
  });
  it('bounds methods, Host/Origin, body and request fields before target effect', async () => {
    const r = await rig(); const before = r.provider.inspect();
    const spoofedHostStatus = await new Promise<number | undefined>((resolve, reject) => {
      const req = request(`${r.url}/authz/execute`, { method: 'POST', headers: { ...r.headers, host: 'evil.example' } }, res => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
      req.on('error', reject); req.end(JSON.stringify({ id: 'host-spoof', operation: 'A' }));
    });
    expect(spoofedHostStatus).toBe(403);
    expect((await r.call({ id: 'a', operation: 'A' }, { origin: 'https://evil.example' })).status).toBe(403);
    expect((await r.call({ id: 'a', operation: 'A', padding: 'x'.repeat(20_000) })).status).toBe(413);
    expect((await r.call({ id: 'a', operation: 'A', gates: { allow: true } })).status).toBe(400);
    expect((await r.call({ id: 'a', operation: 'arbitrary-rpc' })).status).toBe(400);
    expect((await fetch(`${r.url}/authz/execute`, { headers: r.headers })).status).toBe(405);
    expect(r.provider.inspect()).toEqual(before);
  });
});
