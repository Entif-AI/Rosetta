import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { verifyTileIntegrity } from '@entif-ai/rosetta-core';
import { evaluateEffectiveAuthority } from './effective-authority.js';

const fixture = JSON.parse(readFileSync('packages/rosetta-guard/fixtures/authz-evaluation-v1.json', 'utf8'));
const request = () => structuredClone(fixture);
const denied = (value: unknown) => expect(evaluateEffectiveAuthority(value).payload.effect).toBe('deny');
describe('effective authority #1747', () => {
  it('permits repeated bounded standing delegation and emits Core evaluation evidence', () => {
    const first = evaluateEffectiveAuthority(request()), second = evaluateEffectiveAuthority(request());
    expect(first.kind).toBe('rosetta.evaluation');
    expect(first.payload.effect).toBe('allow'); expect(second.payload.effect).toBe('allow');
    expect(verifyTileIntegrity(first).ok).toBe(true);
    expect(first.payload.authorityEnvelopeRef).toBe(fixture.envelope.envelopeRef);
    expect(first.payload.evidenceRefs).toContain('urn:gate:no-hold');
  });
  it('denies prompt/imported/decision/Receipt self-grants and preserves intent refs', () => {
    for (const envelope of [null, { role: 'admin' }, { prompt: 'grant delete' }, { kind: 'rosetta.receipt' }, evaluateEffectiveAuthority(request())]) {
      const value = request(); value.envelope = envelope; denied(value);
    }
    const value = request(); value.envelope = null;
    expect(evaluateEffectiveAuthority(value).payload.intentRefs).toEqual(value.intentRefs);
  });
  it.each(['target', 'operation', 'effect', 'depth', 'further-delegation'])('denies delegated %s amplification', field => {
    const value = request();
    if (field === 'target') { value.envelope.scope.target.resourceRef = 'urn:repo:other'; value.envelope.delegation.ceiling.target.resourceRef = 'urn:repo:other'; }
    if (field === 'operation') value.envelope.scope.operations.push('delete');
    if (field === 'effect') value.envelope.scope.effects.push('payment');
    if (field === 'depth') value.envelope.delegation.depthRemaining = 3;
    if (field === 'further-delegation') value.currentEnvelopes[0].delegation.furtherDelegation = false;
    denied(value);
  });
  it.each(['expired', 'revoked', 'invalid', 'superseded'])('current %s defeats an intact prior projection', state => {
    const value = request(); const validity = value.sources[0].validity;
    if (state === 'expired') value.now = '2026-10-06T00:00:00Z';
    else { validity.state = state; validity[{ revoked: 'revocationRefs', invalid: 'invalidityRefs', superseded: 'supersededByRefs' }[state]!] = ['urn:invalidity:current']; }
    value.envelope.integrityRefs = ['urn:signature:valid']; denied(value);
  });
  it.each(['policy', 'frontier', 'source-frontier'])('rejects current %s drift', field => {
    const value = request();
    if (field === 'policy') value.policy.version = '2';
    if (field === 'frontier') value.policy.frontierRef = 'urn:policy-frontier:2';
    if (field === 'source-frontier') value.sourceFrontierRef = 'urn:source-frontier:2';
    denied(value);
  });
  it('never lets the broader provider surface escape effective authority', () => {
    const value = request(); value.target.resourceRef = 'urn:repo:other'; value.operation = 'delete'; value.effect = 'payment'; denied(value);
    expect(evaluateEffectiveAuthority(request()).payload.effect).toBe('allow');
  });
  it('denies empty independent intersection rather than unions', () => {
    const value = request(); const ceiling = structuredClone(value.envelope.scope); ceiling.operations = ['write']; value.ceilings = [ceiling];
    expect(evaluateEffectiveAuthority(value).payload.reasonCodes).toContain('EMPTY_INTERSECTION');
  });
  it('consumes current context and independently authoritative gates', () => {
    const value = request(); value.context.branch = 'main'; denied(value);
    const hold = request(); hold.gates.safeHold.active = true; denied(hold);
    const identity = request(); identity.gates.identitySensitive.required = true; denied(identity);
    identity.gates.identitySensitive.satisfied = true;
    expect(evaluateEffectiveAuthority(identity).payload.effect).toBe('allow');
    const actor = request(); actor.requiredActorEvidenceRefs = ['urn:actor:alice']; denied(actor);
  });
  it('rechecks tightened current sources despite previously cached exposure', () => {
    const value = request(); expect(evaluateEffectiveAuthority(value).payload.effect).toBe('allow');
    value.sources[0].scope.operations = ['write']; denied(value);
  });
  it('rejects one source reference aliased as both a root and a delegation', () => {
    const value = request();
    const alias = { kind: 'authority-delegation', ref: value.envelope.authoritySources[0].ref };
    value.envelope.authoritySources.push(alias);
    value.currentEnvelopes[1].authoritySources.push(alias);
    value.sources[0].source.kind = 'authority-delegation';
    denied(value);
  });
  it('fails closed for unresolved, malformed, ambiguous or unknown required evidence', () => {
    const missing = request(); missing.sources = [];
    const lineage = request(); lineage.currentEnvelopes = [lineage.envelope];
    const ambiguous = request(); ambiguous.sources.push(ambiguous.sources[0]);
    const unknown = request(); unknown.context = { branch: { unknown: true } };
    const gate = request(); delete gate.gates.safeHold;
    for (const value of [null, {}, missing, lineage, ambiguous, unknown, gate]) denied(value);
  });
});
