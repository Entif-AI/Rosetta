import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildTile, verifyTileIntegrity } from '@entif-ai/rosetta-core';
import { AUTHZ_COMPATIBILITY_MAPPINGS, getSchemaCatalogEntry } from '@entif-ai/rosetta-schemas';
import { inspectAuthzArtifact, projectAuthorityDecisionForIam, projectLegacyAuthorityDelegation } from './authority-compatibility.js';
import { buildApprovalHandoff, evaluateWorkflowPolicyGate, issueIamDecision, revokeIamDecision, validateIamDecision } from './rosetta-guard.js';

const fixture = JSON.parse(readFileSync('packages/rosetta-guard/fixtures/authz-evaluation-v1.json', 'utf8'));
const current = () => structuredClone(fixture);
const iamRequest = () => ({ action: 'read', actionId: 'action:one', principalId: 'actor:test', resource: 'urn:repo:alpha', mode: 'live' as const, sideEffect: true, requestedAt: fixture.now, validUntil: '2026-10-05T12:05:00Z' });
const validation = () => ({ ...iamRequest(), now: fixture.now, policyVersionSet: 'policy-set:1', revokedDecisions: [] as ReturnType<typeof revokeIamDecision>[] });
const legacy = () => issueIamDecision(iamRequest(), [{ actionPattern: 'read', resourcePattern: 'urn:repo:alpha', effect: 'allow', id: 'policy:fixture' }], { policyVersionSet: 'policy-set:1' });
const projection = () => ({ currentAuthority: current(), request: iamRequest(), validation: validation(), legacyDecision: legacy() });

describe('versioned AuthZ compatibility #1748', () => {
  it('settles all seven historical kinds without promoting them to authority roots', () => {
    expect(AUTHZ_COMPATIBILITY_MAPPINGS.map(row => row.sourceKind).sort()).toEqual(['guard.decision_token', 'iam.approval_handoff', 'iam.cache_domain', 'iam.decision', 'iam.delegation', 'iam.principal', 'workflow.policy_decision']);
    expect(getSchemaCatalogEntry('guard.decision_token')?.compatibilityMapping?.mappingVersion).toBe('1.0.0');
    for (const row of AUTHZ_COMPATIBILITY_MAPPINGS) expect(row.authorityRole).not.toBe('authority-root');
  });
  it('distinguishes native, legacy-only, unsupported and insufficient evidence without rewriting history', () => {
    expect(inspectAuthzArtifact(fixture.envelope).posture).toBe('native');
    expect(inspectAuthzArtifact(buildTile('authz.authority_envelope.v1', fixture.envelope)).posture).toBe('native');
    const artifact = legacy(), bytes = JSON.stringify(artifact);
    expect(inspectAuthzArtifact(artifact).posture).toBe('legacy-only');
    expect(inspectAuthzArtifact(buildTile('unknown.authz', {})).posture).toBe('unsupported');
    expect(inspectAuthzArtifact(buildTile('iam.decision', artifact.payload, { version: '2.0.0' })).posture).toBe('unsupported');
    expect(inspectAuthzArtifact({ kind: 'iam.decision' }).posture).toBe('insufficient-evidence');
    expect(JSON.stringify(artifact)).toBe(bytes);
  });
  it('projects fresh authority into the actual existing decision consumer with a visible evidence-only marker', () => {
    const input = projection(), bytes = JSON.stringify(input);
    const result = projectAuthorityDecisionForIam(input);
    expect(result.posture).toBe('compatibility-projected');
    if (!result.decision) throw new Error('Expected compatibility decision');
    expect(validateIamDecision(result.decision, input.validation).effect).toBe('allow');
    expect(result.decision.payload.compatibility.authzMapping.authorityRole).toBe('decision-evidence');
    expect(inspectAuthzArtifact(result.decision).posture).toBe('compatibility-projected');
    expect(verifyTileIntegrity(result.decision).ok).toBe(true);
    expect(Date.parse(result.decision.payload.expiresAt)).toBeLessThanOrEqual(Date.parse(input.legacyDecision.payload.expiresAt));
    expect(JSON.stringify(input)).toBe(bytes);
  });
  it.each(['expired', 'revoked', 'policy', 'target', 'denied', 'invalid-authority'])('keeps %s invalidity on the compatibility path', kind => {
    const input = projection();
    if (kind === 'expired') input.validation.now = input.currentAuthority.now = '2026-10-05T12:06:00Z';
    if (kind === 'revoked') input.validation.revokedDecisions = [revokeIamDecision(input.legacyDecision.payload.decisionId, 'withdrawn', fixture.now)];
    if (kind === 'policy') input.validation.policyVersionSet = 'policy-set:2';
    if (kind === 'target') input.request.resource = input.validation.resource = 'urn:repo:other';
    if (kind === 'denied') input.legacyDecision = issueIamDecision(iamRequest(), [{ actionPattern: 'read', resourcePattern: 'urn:repo:alpha', effect: 'deny', id: 'policy:deny' }], { policyVersionSet: 'policy-set:1' });
    if (kind === 'invalid-authority') { input.currentAuthority.sources[0].validity.state = 'invalid'; input.currentAuthority.sources[0].validity.invalidityRefs = ['urn:invalidity:current']; }
    const result = projectAuthorityDecisionForIam(input);
    expect(result.decision?.payload.effect ?? 'deny').toBe('deny');
    expect(result.reasonCodes).not.toEqual(['AUTHORITY_VALID']);
  });
  it('cannot derive authority from a bare token, identity, role, prior decision or Receipt', () => {
    for (const currentAuthority of [undefined, { role: 'admin' }, legacy(), buildTile('rosetta.receipt', { success: true })]) {
      const result = projectAuthorityDecisionForIam({ ...projection(), currentAuthority });
      expect(result.posture).toBe('insufficient-evidence'); expect(result.decision).toBeUndefined();
    }
  });
  it('never widens the requested operation, target or current ceilings to fit a legacy consumer', () => {
    const input = projection(); input.currentAuthority.operation = 'delete';
    expect(projectAuthorityDecisionForIam(input).decision?.payload.effect ?? 'deny').toBe('deny');
    const ceiling = projection(); ceiling.currentAuthority.sources[0].scope.operations = ['write'];
    expect(projectAuthorityDecisionForIam(ceiling).decision?.payload.effect).toBe('deny');
  });
  it('fails closed for an uninterpreted legacy constraint or malformed revocation evidence', () => {
    const input = projection();
    input.legacyDecision = buildTile('iam.decision', { ...input.legacyDecision.payload, constraints: { unknown: 'requires-extra-consent' } }, { createdAt: input.legacyDecision.createdAt, pack: input.legacyDecision.pack });
    expect(projectAuthorityDecisionForIam(input).posture).toBe('insufficient-evidence');
    const revocation = { ...projection(), validation: { ...validation(), revokedDecisions: [{}] } };
    expect(projectAuthorityDecisionForIam(revocation as never).posture).toBe('insufficient-evidence');
  });
  it('requires an explicitly resolved legacy delegation source and preserves the native envelope exactly', () => {
    const artifact = buildTile('iam.delegation', { historical: 'bounded delegation record' });
    const input = current();
    expect(projectLegacyAuthorityDelegation(artifact, input).posture).toBe('insufficient-evidence');
    const oldRef = input.sources[1].source.ref;
    for (const envelope of [input.envelope, input.currentEnvelopes[1]]) {
      envelope.authoritySources[1].ref = artifact.cid;
      envelope.provenance.sourceRefs = envelope.provenance.sourceRefs.map((ref: string) => ref === oldRef ? artifact.cid : ref);
    }
    input.sources[1].source.ref = artifact.cid;
    const result = projectLegacyAuthorityDelegation(artifact, input);
    expect(result.posture).toBe('compatibility-projected'); expect(result.envelope).toEqual(input.envelope);
    input.envelope.scope.operations.push('delete');
    expect(projectLegacyAuthorityDelegation(artifact, input).posture).toBe('insufficient-evidence');
  });
  it('keeps approval and restrictive workflow evidence available without making it a universal approval gate', () => {
    const handoff = buildApprovalHandoff({ action: 'read', actionId: 'action:one', approvalRequestId: 'approval:one', requestedAt: fixture.now, timeoutAt: '2026-10-05T13:00:00Z' });
    expect(inspectAuthzArtifact(handoff).authorityRole).toBe('authority-mutation-evidence');
    const workflow = evaluateWorkflowPolicyGate({ evaluatedAt: fixture.now, policy: { policyId: 'workflow:deny', forbiddenAdapters: ['fixture'] }, policySnapshotId: 'policy:snapshot', workflow: { artifactId: 'workflow:one', requestedAdapters: [{ adapterId: 'fixture' }] } });
    const input = { ...projection(), workflowDecision: workflow };
    expect(projectAuthorityDecisionForIam(input).decision?.payload.effect).toBe('deny');
    expect(projectAuthorityDecisionForIam({ ...projection(), legacyDecision: undefined }).decision?.payload.effect).toBe('allow');
  });
});
