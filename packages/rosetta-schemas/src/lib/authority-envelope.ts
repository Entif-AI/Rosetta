import { compareDomainRefs, type DomainRef, type ValidationResult } from './rosetta-schemas.js';
import { CAPABILITY_EFFECT_CLASSES, type CapabilityEffectClass } from './capability-effects.js';
import {
  compileEvidenceContract, evidenceRefSchema as ref, evidenceRefsSchema as refs,
  supportedEvidenceSchema as support, evidenceObjectSchema as object,
  evidenceProfileSchema as profile, evidenceTimestampSchema as timestamp,
  nullableEvidenceSchema as nullable
} from './evidence-contract-validation.js';

export const AUTHORITY_ENVELOPE_PROFILE = 'authz.authority_envelope.v1';
export interface AuthorityTarget { resourceRef: string; domainRef: DomainRef }
export interface AuthorityScope { target: AuthorityTarget; operations: string[]; effects: CapabilityEffectClass[] }
export type AuthorityContextConstraints = Record<string, string[]>;
export interface AuthoritySourceRef { kind: 'authority-root' | 'authority-delegation'; ref: string }
export interface AuthorityPolicyBinding { ref: string; version: string; frontierRef: string }
export type AuthorityValidityState = 'valid' | 'expired' | 'revoked' | 'invalid' | 'superseded';
/** A portable projection, never a grant or canonical authority store. */
export interface AuthorityEnvelope {
  envelopeRef: string;
  profile: { id: 'authz.authority_envelope.v1'; version: '1.0.0' };
  authoritySources: AuthoritySourceRef[];
  actorEvidenceRefs: string[];
  scope: AuthorityScope;
  policy: AuthorityPolicyBinding;
  contextConstraints: AuthorityContextConstraints;
  validity: {
    notBefore: string; expiresAt: string; state: AuthorityValidityState;
    revocationRefs: string[]; invalidityRefs: string[]; supersededByRefs: string[];
  };
  delegation: {
    parentEnvelopeRef: string | null; lineageRefs: string[]; ceiling: AuthorityScope;
    furtherDelegation: boolean; depthRemaining: number;
  };
  provenance: { compiledAt: string; compilerRef: string; sourceFrontierRef: string; sourceRefs: string[] };
  integrityRefs: string[];
  receiptRefs: string[];
}

const domain = {
  type: 'object', additionalProperties: false, required: ['tenantId', 'classification', 'abacLabels'],
  properties: {
    tenantId: ref, classification: { enum: ['public', 'internal', 'confidential', 'restricted'] },
    abacLabels: { type: 'array', maxItems: 256, uniqueItems: true, items: object({ key: ref, value: ref }) },
    vendorRoute: ref
  }
};
const scope = object({
  target: object({ resourceRef: ref, domainRef: domain }), operations: support,
  effects: { type: 'array', minItems: 1, maxItems: CAPABILITY_EFFECT_CLASSES.length, uniqueItems: true, items: { enum: [...CAPABILITY_EFFECT_CLASSES] } }
});
export const AUTHORITY_ENVELOPE_SCHEMA = {
  $id: 'urn:rosetta:authz:authority-envelope:v1',
  ...object({
    envelopeRef: ref, profile: profile(AUTHORITY_ENVELOPE_PROFILE),
    authoritySources: { type: 'array', minItems: 1, maxItems: 256, uniqueItems: true, items: object({ kind: { enum: ['authority-root', 'authority-delegation'] }, ref }) },
    actorEvidenceRefs: refs, scope,
    policy: object({ ref, version: ref, frontierRef: ref }),
    contextConstraints: { type: 'object', maxProperties: 256, propertyNames: ref, additionalProperties: support },
    validity: object({
      notBefore: timestamp, expiresAt: timestamp, state: { enum: ['valid', 'expired', 'revoked', 'invalid', 'superseded'] },
      revocationRefs: refs, invalidityRefs: refs, supersededByRefs: refs
    }),
    delegation: object({
      parentEnvelopeRef: nullable(ref), lineageRefs: refs, ceiling: scope,
      furtherDelegation: { type: 'boolean' }, depthRemaining: { type: 'integer', minimum: 0, maximum: 256 }
    }),
    provenance: object({ compiledAt: timestamp, compilerRef: ref, sourceFrontierRef: ref, sourceRefs: support }),
    integrityRefs: refs, receiptRefs: refs
  })
};
const admit = compileEvidenceContract<AuthorityEnvelope>(AUTHORITY_ENVELOPE_SCHEMA);

/** Exact resources in v1; #711 owns domain comparison. No wildcard/union inference. */
export function authorityScopeContains(ceiling: AuthorityScope, proposed: AuthorityScope): boolean {
  return ceiling.target.resourceRef === proposed.target.resourceRef &&
    compareDomainRefs(ceiling.target.domainRef, proposed.target.domainRef).ok &&
    proposed.operations.every(operation => ceiling.operations.includes(operation)) &&
    proposed.effects.every(effect => ceiling.effects.includes(effect));
}

export function authorityConstraintsContain(parent: AuthorityContextConstraints, child: AuthorityContextConstraints): boolean {
  return Object.entries(parent).every(([attribute, values]) =>
    Object.hasOwn(child, attribute) && child[attribute].length > 0 && child[attribute].every(value => values.includes(value)));
}

export function parseAuthorityEnvelope(input: unknown): AuthorityEnvelope {
  const value = admit(input);
  if (new Set(value.authoritySources.map(source => source.ref)).size !== value.authoritySources.length) throw new Error('One source reference cannot alias different authority roles.');
  if (Date.parse(value.validity.expiresAt) <= Date.parse(value.validity.notBefore)) throw new Error('Authority validity interval must be nonempty.');
  if (!value.authoritySources.some(source => source.kind === 'authority-root')) throw new Error('Authority projection requires an externally established root reference.');
  if (value.authoritySources.some(source => !value.provenance.sourceRefs.includes(source.ref))) throw new Error('Authority source must occur in the compilation source frontier.');
  if (value.delegation.parentEnvelopeRef === null ? value.delegation.lineageRefs.length > 0 : value.delegation.lineageRefs.at(-1) !== value.delegation.parentEnvelopeRef) throw new Error('Authority parent must close its delegation lineage.');
  if (value.delegation.lineageRefs.includes(value.envelopeRef)) throw new Error('Authority delegation lineage cannot contain itself.');
  if (value.delegation.furtherDelegation && value.delegation.depthRemaining === 0) throw new Error('Further delegation requires remaining depth.');
  if (!authorityScopeContains(value.scope, value.delegation.ceiling)) throw new Error('Delegation ceiling cannot exceed represented authority.');
  const validity = value.validity;
  if (validity.state === 'valid' && [...validity.revocationRefs, ...validity.invalidityRefs, ...validity.supersededByRefs].length > 0) throw new Error('Invalidity cannot be erased by a valid-state claim.');
  if (validity.state === 'revoked' && !validity.revocationRefs.length) throw new Error('Revoked authority requires revocation references.');
  if (validity.state === 'invalid' && !validity.invalidityRefs.length) throw new Error('Invalid authority requires invalidity references.');
  if (validity.state === 'superseded' && !validity.supersededByRefs.length) throw new Error('Superseded authority requires successor references.');
  return value;
}

/** Structural validation does not assert current executable authority. */
export function validateAuthorityEnvelope(input: unknown): ValidationResult {
  try { parseAuthorityEnvelope(input); return { ok: true, errors: [] }; }
  catch (error) { return { ok: false, errors: [error instanceof Error ? error.message : 'Uninterpretable Authority Envelope.'] }; }
}

/** Compare represented parent/child bindings; current authoritative state belongs to Guard. */
export function validateAuthorityDelegation(childInput: unknown, parentInput: unknown): ValidationResult {
  try {
    const child = parseAuthorityEnvelope(childInput), parent = parseAuthorityEnvelope(parentInput);
    const errors: string[] = [];
    if (!parent.delegation.furtherDelegation || child.delegation.depthRemaining >= parent.delegation.depthRemaining) errors.push('Delegation posture/depth amplification.');
    if (child.delegation.parentEnvelopeRef !== parent.envelopeRef || JSON.stringify(child.delegation.lineageRefs) !== JSON.stringify([...parent.delegation.lineageRefs, parent.envelopeRef])) errors.push('Delegation parent/lineage mismatch.');
    if (!authorityScopeContains(parent.delegation.ceiling, child.scope) || !authorityConstraintsContain(parent.contextConstraints, child.contextConstraints)) errors.push('Delegation scope/context amplification.');
    if (Date.parse(child.validity.notBefore) < Date.parse(parent.validity.notBefore) || Date.parse(child.validity.expiresAt) > Date.parse(parent.validity.expiresAt)) errors.push('Delegation validity amplification.');
    if (child.policy.ref !== parent.policy.ref || child.policy.version !== parent.policy.version || child.policy.frontierRef !== parent.policy.frontierRef || child.provenance.sourceFrontierRef !== parent.provenance.sourceFrontierRef) errors.push('Delegation policy/source frontier mismatch.');
    const roots = (value: AuthorityEnvelope) => value.authoritySources.filter(source => source.kind === 'authority-root').map(source => source.ref).sort();
    if (JSON.stringify(roots(child)) !== JSON.stringify(roots(parent))) errors.push('Delegation cannot replace or compose independent authority roots.');
    return { ok: errors.length === 0, errors };
  } catch (error) { return { ok: false, errors: [error instanceof Error ? error.message : 'Uninterpretable delegation.'] }; }
}
