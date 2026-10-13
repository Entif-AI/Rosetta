import { buildTile, verifyTileIntegrity, type TileEnvelope } from '@entif-ai/rosetta-core';
import {
  AUTHORITY_ENVELOPE_PROFILE, AUTHZ_COMPATIBILITY_MAPPING_VERSION, getAuthzCompatibilityMapping,
  parseAuthorityEnvelope, isProfileTimestamp, type AuthorityEnvelope, type AuthzCompatibilityMapping
} from '@entif-ai/rosetta-schemas';
import { evaluateEffectiveAuthority, type EffectiveAuthorityDecision, type EffectiveAuthorityRequest } from './effective-authority.js';
import { issueIamDecision, validateIamDecision, type IamDecisionPayload, type IamDecisionRequest, type IamDecisionValidationRequest } from './rosetta-guard.js';

export type AuthzCompatibilityPosture = 'native' | 'compatibility-projected' | 'legacy-only' | 'unsupported' | 'insufficient-evidence';
export interface AuthzArtifactInspection {
  mappingVersion: '1.0.0'; posture: AuthzCompatibilityPosture;
  sourceKind: string | null; authorityRole: AuthzCompatibilityMapping['authorityRole'] | 'authority-projection' | null;
  reasonCodes: string[];
}
export interface IamAuthorityMapping {
  version: '1.0.0'; authorityRole: 'decision-evidence'; evaluationRef: string;
  authorityEnvelopeRef: string; legacyDecisionRef: string | null;
}
export interface CompatibleIamDecisionPayload extends IamDecisionPayload {
  compatibility: IamDecisionPayload['compatibility'] & { authzMapping: IamAuthorityMapping };
}
export interface AuthorityDecisionCompatibilityRequest {
  currentAuthority: unknown; request: IamDecisionRequest; validation: IamDecisionValidationRequest;
  legacyDecision?: unknown; workflowDecision?: unknown;
}
export interface AuthorityDecisionCompatibilityResult extends AuthzArtifactInspection {
  evaluation?: TileEnvelope<EffectiveAuthorityDecision>;
  decision?: TileEnvelope<CompatibleIamDecisionPayload>;
}
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= 2048;
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.length <= 256 && value.every(text);
function tile(input: unknown): TileEnvelope<unknown> | undefined {
  try {
    if (!record(input) || !text(input.cid) || !text(input.kind) || !text(input.pack) || !text(input.version) || !strings(input.parents) || !isProfileTimestamp(input.createdAt) || typeof input.canonical !== 'string' || !Object.hasOwn(input, 'payload') || Buffer.byteLength(JSON.stringify(input)) > 262_144) return undefined;
    const value = input as unknown as TileEnvelope<unknown>;
    return verifyTileIntegrity(value).ok ? value : undefined;
  } catch { return undefined; }
}
function iamPayload(value: unknown): value is IamDecisionPayload {
  if (!record(value) || !record(value.binding) || !record(value.compatibility) || !record(value.constraints)) return false;
  const binding = value.binding;
  return ['action', 'actionId', 'principalId', 'resource'].every(key => text(binding[key])) &&
    (value.binding.envelopeId === undefined || text(value.binding.envelopeId)) &&
    value.compatibility.sourceKind === 'guard.decision_token' && value.compatibility.transition === 'projected' &&
    (value.effect === 'allow' || value.effect === 'deny') && (value.mode === 'live' || value.mode === 'parse-only') &&
    text(value.decisionId) && text(value.policyVersionSet) && text(value.reason) && strings(value.policyIds) &&
    isProfileTimestamp(value.issuedAt) && isProfileTimestamp(value.expiresAt) &&
    Object.values(value.constraints).every(text) && Array.isArray(value.receiptExpectations) &&
    value.receiptExpectations.every(item => ['decision.deny', 'decision.expiry', 'decision.issue', 'decision.revocation', 'decision.validation_failure'].includes(item));
}
function result(posture: AuthzCompatibilityPosture, sourceKind: string | null, reasonCodes: string[], authorityRole: AuthzArtifactInspection['authorityRole'] = null): AuthzArtifactInspection {
  return { mappingVersion: AUTHZ_COMPATIBILITY_MAPPING_VERSION, posture, sourceKind, authorityRole, reasonCodes };
}

/** Interpret history; this inspection never authorizes execution or mutates the input artifact. */
export function inspectAuthzArtifact(input: unknown): AuthzArtifactInspection {
  if (record(input) && input.kind === AUTHORITY_ENVELOPE_PROFILE) {
    const artifact = tile(input);
    if (!artifact) return result('insufficient-evidence', AUTHORITY_ENVELOPE_PROFILE, ['MALFORMED_OR_TAMPERED_ARTIFACT']);
    if (artifact.version !== '0.1.0') return result('unsupported', AUTHORITY_ENVELOPE_PROFILE, ['UNSUPPORTED_SOURCE_VERSION']);
    return inspectAuthzArtifact(artifact.payload);
  }
  if (record(input) && record(input.profile) && input.profile.id === AUTHORITY_ENVELOPE_PROFILE) {
    if (input.profile.version !== '1.0.0') return result('unsupported', AUTHORITY_ENVELOPE_PROFILE, ['UNSUPPORTED_PROFILE_VERSION']);
    try { parseAuthorityEnvelope(input); return result('native', AUTHORITY_ENVELOPE_PROFILE, ['STRUCTURAL_PROJECTION_ONLY'], 'authority-projection'); }
    catch { return result('insufficient-evidence', AUTHORITY_ENVELOPE_PROFILE, ['MALFORMED_AUTHORITY_PROJECTION']); }
  }
  const kind = record(input) && text(input.kind) ? input.kind : null;
  const mapping = kind ? getAuthzCompatibilityMapping(kind) : undefined;
  if (!mapping) return result('unsupported', kind, ['UNSUPPORTED_SOURCE_KIND']);
  const artifact = tile(input);
  if (!artifact) return result('insufficient-evidence', kind, ['MALFORMED_OR_TAMPERED_ARTIFACT'], mapping.authorityRole);
  if (artifact.version !== mapping.sourceTileVersion) return result('unsupported', kind, ['UNSUPPORTED_SOURCE_VERSION'], mapping.authorityRole);
  if (kind === 'iam.decision') {
    if (!iamPayload(artifact.payload)) return result('insufficient-evidence', kind, ['MALFORMED_DECISION'], mapping.authorityRole);
    const marker = artifact.payload.compatibility as unknown as Record<string, unknown>;
    if (Object.hasOwn(marker, 'authzMapping')) {
      const binding = marker.authzMapping;
      if (!record(binding) || binding.version !== AUTHZ_COMPATIBILITY_MAPPING_VERSION || binding.authorityRole !== 'decision-evidence' || !text(binding.evaluationRef) || !text(binding.authorityEnvelopeRef) || !(binding.legacyDecisionRef === null || text(binding.legacyDecisionRef))) return result('unsupported', kind, ['UNSUPPORTED_OR_MALFORMED_MAPPING'], mapping.authorityRole);
      return result('compatibility-projected', kind, ['CURRENT_EVALUATION_STILL_REQUIRED'], mapping.authorityRole);
    }
  }
  return result('legacy-only', kind, ['CURRENT_AUTHORITY_EVIDENCE_REQUIRED'], mapping.authorityRole);
}

/** Additive adapter around #1029; fresh #1747 authority evaluation is always mandatory. */
export function projectAuthorityDecisionForIam(input: AuthorityDecisionCompatibilityRequest): AuthorityDecisionCompatibilityResult {
  const evaluation = evaluateEffectiveAuthority(input.currentAuthority);
  const evidence = evaluation.payload;
  if (!evidence.request || !evidence.evaluatedAt || !evidence.authorityEnvelopeRef || evidence.reasonCodes.includes('UNINTERPRETABLE_AUTHORITY')) return { ...result('insufficient-evidence', 'iam.decision', evidence.reasonCodes, 'decision-evidence'), evaluation };
  const reasons = evidence.effect === 'allow' ? [] : [...evidence.reasonCodes];
  try {
    const request = input.request, validation = input.validation;
    if (!text(validation.policyVersionSet) || !text(request.principalId) || !text(request.actionId) || !text(request.action) || !text(request.resource) ||
      !['live', 'parse-only'].includes(request.mode) || typeof request.sideEffect !== 'boolean' ||
      (request.envelopeId !== undefined && !text(request.envelopeId)) || (request.validUntil !== undefined && !isProfileTimestamp(request.validUntil)) ||
      !isProfileTimestamp(request.requestedAt) || !isProfileTimestamp(validation.now)) throw new Error('Malformed compatibility request.');
    if (validation.revokedDecisions !== undefined && (!Array.isArray(validation.revokedDecisions) || validation.revokedDecisions.length > 256 || validation.revokedDecisions.some(value => !record(value) || !text(value.decisionId) || !text(value.reason) || !isProfileTimestamp(value.revokedAt)))) throw new Error('Uninterpretable revocation evidence.');
    if (request.action !== evidence.request.operation || request.resource !== evidence.request.target.resourceRef ||
      ['action', 'actionId', 'principalId', 'resource'].some(key => request[key as keyof IamDecisionRequest] !== validation[key as keyof IamDecisionValidationRequest]) ||
      Date.parse(request.requestedAt) !== Date.parse(evidence.evaluatedAt) || Date.parse(validation.now) !== Date.parse(evidence.evaluatedAt)) reasons.push('REQUEST_BINDING_MISMATCH');
    let legacy: TileEnvelope<IamDecisionPayload> | undefined;
    if (input.legacyDecision !== undefined) {
      const inspected = inspectAuthzArtifact(input.legacyDecision);
      if (!['legacy-only', 'compatibility-projected'].includes(inspected.posture) || inspected.sourceKind !== 'iam.decision') return { ...result(inspected.posture === 'unsupported' ? 'unsupported' : 'insufficient-evidence', 'iam.decision', inspected.reasonCodes, 'decision-evidence'), evaluation };
      legacy = tile(input.legacyDecision) as TileEnvelope<IamDecisionPayload>;
      if (Object.keys(legacy.payload.constraints).length) throw new Error('No v1 translation for nonempty legacy constraints.');
      const checked = validateIamDecision(legacy, validation);
      if (checked.effect !== 'allow') reasons.push(...checked.reasonCodes);
      if (Date.parse(validation.now) < Date.parse(legacy.payload.issuedAt)) reasons.push('DECISION_NOT_YET_VALID');
      if (Date.parse(validation.now) >= Date.parse(legacy.payload.expiresAt)) reasons.push('DECISION_EXPIRED');
    }
    if (input.workflowDecision !== undefined) {
      const workflow = tile(input.workflowDecision);
      if (!workflow || workflow.kind !== 'workflow.policy_decision' || workflow.version !== '0.1.0' || !record(workflow.payload) || !record(workflow.payload.boundaries) || workflow.payload.boundaries.requestPolicyAuthority !== 'narrows_startup_authority_only' || !['allowed', 'denied'].includes(String(workflow.payload.status))) throw new Error('Uninterpretable narrowing workflow evidence.');
      if (workflow.payload.status !== 'allowed') reasons.push('WORKFLOW_POLICY_DENIED');
    }
    const authority = input.currentAuthority as EffectiveAuthorityRequest;
    const bounds = [parseAuthorityEnvelope(authority.envelope), ...authority.currentEnvelopes.map(parseAuthorityEnvelope), ...authority.sources];
    const deadlines = [...bounds.map(bound => Date.parse(bound.validity.expiresAt)), ...(legacy ? [Date.parse(legacy.payload.expiresAt)] : []), ...(request.validUntil ? [Date.parse(request.validUntil)] : [])];
    if (deadlines.some(deadline => !Number.isFinite(deadline))) throw new Error('Uninterpretable lifetime.');
    const validUntil = new Date(Math.min(...deadlines)).toISOString();
    if (Date.parse(validUntil) <= Date.parse(evidence.evaluatedAt)) reasons.push('DECISION_EXPIRED');
    const effect = reasons.length ? 'deny' : 'allow';
    const issued = issueIamDecision({ ...request, validUntil }, [{ actionPattern: request.action, resourcePattern: request.resource, effect, id: authority.policy.ref }], { policyVersionSet: validation.policyVersionSet });
    const decision = buildTile<CompatibleIamDecisionPayload>('iam.decision', {
      ...issued.payload, reason: (reasons.length ? [...new Set(reasons)] : ['AUTHORITY_VALID']).join(','),
      compatibility: { ...issued.payload.compatibility, authzMapping: { version: AUTHZ_COMPATIBILITY_MAPPING_VERSION, authorityRole: 'decision-evidence', evaluationRef: evaluation.cid, authorityEnvelopeRef: evidence.authorityEnvelopeRef, legacyDecisionRef: legacy?.cid ?? null } }
    }, { createdAt: issued.createdAt, pack: issued.pack, version: issued.version, parents: [evaluation.cid, ...(legacy ? [legacy.cid] : [])] });
    return { ...result('compatibility-projected', 'iam.decision', reasons.length ? [...new Set(reasons)] : ['AUTHORITY_VALID'], 'decision-evidence'), evaluation, decision };
  } catch { return { ...result('insufficient-evidence', 'iam.decision', ['UNINTERPRETABLE_COMPATIBILITY_EVIDENCE'], 'decision-evidence'), evaluation }; }
}

/** Translate only an already resolved historical source; never synthesize missing delegation fields. */
export function projectLegacyAuthorityDelegation(input: unknown, currentAuthority: unknown): AuthzArtifactInspection & { envelope?: AuthorityEnvelope } {
  const inspected = inspectAuthzArtifact(input), artifact = tile(input);
  if (inspected.posture !== 'legacy-only' || !artifact || artifact.kind !== 'iam.delegation') return { ...inspected, posture: inspected.posture === 'unsupported' ? 'unsupported' : 'insufficient-evidence' };
  const evaluation = evaluateEffectiveAuthority(currentAuthority);
  if (evaluation.payload.effect !== 'allow') return result('insufficient-evidence', 'iam.delegation', evaluation.payload.reasonCodes, 'delegation-evidence');
  const envelope = parseAuthorityEnvelope((currentAuthority as EffectiveAuthorityRequest).envelope);
  if (!envelope.delegation.parentEnvelopeRef || !envelope.authoritySources.some(source => source.kind === 'authority-delegation' && source.ref === artifact.cid)) return result('insufficient-evidence', 'iam.delegation', ['HISTORICAL_DELEGATION_SOURCE_UNRESOLVED'], 'delegation-evidence');
  return { ...result('compatibility-projected', 'iam.delegation', ['BOUNDED_CURRENT_AUTHORITY_PROJECTION'], 'delegation-evidence'), envelope: structuredClone(envelope) };
}
