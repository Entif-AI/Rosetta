/** #1748 mapping law. Historical payloads are unversioned; the existing Core wrapper is 0.1.0. */
export const AUTHZ_COMPATIBILITY_MAPPING_VERSION = '1.0.0';
export interface AuthzCompatibilityMapping {
  mappingVersion: '1.0.0'; sourceKind: string; sourceTileVersion: '0.1.0';
  sourcePayloadVersion: 'unversioned'; destination: string; destinationVersion: string;
  authorityRole: 'actor-evidence' | 'delegation-evidence' | 'constraint-evidence' | 'decision-evidence' | 'authority-mutation-evidence';
  posture: 'compatibility-supported' | 'legacy-only'; requirement: string;
}
const mapping = (sourceKind: string, destination: string, destinationVersion: string, authorityRole: AuthzCompatibilityMapping['authorityRole'], posture: AuthzCompatibilityMapping['posture'], requirement: string): AuthzCompatibilityMapping => ({
  mappingVersion: AUTHZ_COMPATIBILITY_MAPPING_VERSION, sourceKind, sourceTileVersion: '0.1.0', sourcePayloadVersion: 'unversioned', destination, destinationVersion, authorityRole, posture, requirement
});
export const AUTHZ_COMPATIBILITY_MAPPINGS: readonly AuthzCompatibilityMapping[] = [
  mapping('iam.principal', 'authz.authority_envelope.v1#/actorEvidenceRefs', '1.0.0', 'actor-evidence', 'legacy-only', 'Policy-required actor evidence only; no payload-to-rights inference.'),
  mapping('iam.delegation', 'authz.authority_envelope.v1', '1.0.0', 'delegation-evidence', 'compatibility-supported', 'Current owner must resolve the historical artifact CID as a bounded delegation source; preserve attenuation and validity.'),
  mapping('iam.cache_domain', 'authz.authority_envelope.v1#/scope/target/domainRef', '1.0.0', 'constraint-evidence', 'legacy-only', '#711 owns boundary comparison; no inferred scope from an unspecified historical payload.'),
  mapping('iam.decision', 'iam.decision', '0.1.0', 'decision-evidence', 'compatibility-supported', 'Fresh #1747 evaluation plus existing request/policy/expiry/revocation validation; additive mapping marker.'),
  mapping('iam.approval_handoff', 'iam.approval_handoff', '0.1.0', 'authority-mutation-evidence', 'compatibility-supported', 'Explicit mutation/escalation workflow evidence; never required for every standing-authority action.'),
  mapping('guard.decision_token', 'iam.decision', '0.1.0', 'decision-evidence', 'legacy-only', 'Historical local token; cannot be automatically promoted to authority or current decision without backing evidence.'),
  mapping('workflow.policy_decision', 'workflow.policy_decision', '0.1.0', 'constraint-evidence', 'compatibility-supported', 'Restrictive-only workflow evidence; any deny narrows current authority and an allow grants nothing.')
];
export function getAuthzCompatibilityMapping(sourceKind: string): AuthzCompatibilityMapping | undefined {
  const row = AUTHZ_COMPATIBILITY_MAPPINGS.find(value => value.sourceKind === sourceKind);
  return row ? { ...row } : undefined;
}
