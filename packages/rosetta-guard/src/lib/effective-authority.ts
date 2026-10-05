import { Ajv } from 'ajv';
import { buildTile, createEvaluation, type TileEnvelope } from '@entif-ai/rosetta-core';
import {
  AUTHORITY_ENVELOPE_SCHEMA, parseAuthorityEnvelope, validateAuthorityDelegation,
  authorityScopeContains, authorityConstraintsContain, isProfileTimestamp,
  type AuthorityEnvelope, type AuthoritySourceRef, type AuthorityScope,
  type AuthorityTarget, type AuthorityPolicyBinding, type CapabilityEffectClass
} from '@entif-ai/rosetta-schemas';

/** Current resolver evidence supplied by an authoritative owner, never by agent intent. */
export interface CurrentAuthoritySource extends Pick<AuthorityEnvelope, 'scope' | 'policy' | 'validity' | 'contextConstraints'> {
  source: AuthoritySourceRef;
  sourceFrontierRef: string;
  evidenceRefs: string[];
}
export interface EffectiveAuthorityRequest {
  envelope: unknown;
  operation: string; effect: CapabilityEffectClass; target: AuthorityTarget;
  now: string; policy: AuthorityPolicyBinding; sourceFrontierRef: string;
  currentEnvelopes: unknown[]; sources: CurrentAuthoritySource[];
  providerCapabilities: AuthorityScope[]; ceilings: AuthorityScope[];
  context: Record<string, string>;
  requiredActorEvidenceRefs: string[]; actorEvidenceRefs: string[];
  gates: {
    safeHold: { active: boolean; evidenceRef: string };
    identitySensitive: { required: boolean; satisfied: boolean; evidenceRef: string };
  };
  intentRefs: string[];
}
export interface EffectiveAuthorityDecision {
  evaluationId: string; summary: string; verdict: 'pass' | 'deny';
  effect: 'allow' | 'deny'; reasonCodes: string[];
  authorityEnvelopeRef: string | null;
  request: { operation: string; effect: CapabilityEffectClass; target: AuthorityTarget } | null;
  evaluatedAt: string | null; policy: AuthorityPolicyBinding | null;
  sourceRefs: string[]; evidenceRefs: string[]; intentRefs: string[];
  authorityRole: 'decision-evidence';
}

const schemaRef = (path: string) => ({ $ref: `${AUTHORITY_ENVELOPE_SCHEMA.$id}#/properties/${path}` });
const ref = { type: 'string', minLength: 1, maxLength: 2048, pattern: '\\S' };
const refs = { type: 'array', maxItems: 256, uniqueItems: true, items: ref };
const object = (properties: Record<string, object>) => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
const list = (items: object) => ({ type: 'array', maxItems: 256, items });
const ajv = new Ajv({ allErrors: true, ownProperties: true });
ajv.addFormat('date-time', isProfileTimestamp);
ajv.addSchema(AUTHORITY_ENVELOPE_SCHEMA);
const validateRequest = ajv.compile<EffectiveAuthorityRequest>(object({
  envelope: { $ref: AUTHORITY_ENVELOPE_SCHEMA.$id },
  operation: ref, effect: schemaRef('scope/properties/effects/items'), target: schemaRef('scope/properties/target'),
  now: { type: 'string', format: 'date-time' }, policy: schemaRef('policy'), sourceFrontierRef: ref,
  currentEnvelopes: list({ $ref: AUTHORITY_ENVELOPE_SCHEMA.$id }),
  sources: list(object({ source: schemaRef('authoritySources/items'), scope: schemaRef('scope'), policy: schemaRef('policy'), validity: schemaRef('validity'), contextConstraints: schemaRef('contextConstraints'), sourceFrontierRef: ref, evidenceRefs: refs })),
  providerCapabilities: list(schemaRef('scope')), ceilings: list(schemaRef('scope')),
  context: { type: 'object', maxProperties: 256, propertyNames: ref, additionalProperties: { type: 'string', maxLength: 2048 } },
  requiredActorEvidenceRefs: refs, actorEvidenceRefs: refs,
  gates: object({ safeHold: object({ active: { type: 'boolean' }, evidenceRef: ref }), identitySensitive: object({ required: { type: 'boolean' }, satisfied: { type: 'boolean' }, evidenceRef: ref }) }),
  intentRefs: refs
}));
function boundedIntentRefs(input: unknown): string[] {
  if (!input || typeof input !== 'object' || !('intentRefs' in input) || !Array.isArray(input.intentRefs)) return [];
  return input.intentRefs.filter((ref): ref is string => typeof ref === 'string' && ref.length > 0 && ref.length <= 2048).slice(0, 256);
}
function intervalContains(parent: AuthorityEnvelope['validity'], child: AuthorityEnvelope['validity']): boolean {
  return Date.parse(child.notBefore) >= Date.parse(parent.notBefore) && Date.parse(child.expiresAt) <= Date.parse(parent.expiresAt);
}
function currentValidity(validity: AuthorityEnvelope['validity'], now: number): string[] {
  const reasons: string[] = [];
  if (validity.state !== 'valid') reasons.push(`AUTHORITY_${validity.state.toUpperCase()}`);
  if (validity.revocationRefs.length) reasons.push('AUTHORITY_REVOKED');
  if (validity.invalidityRefs.length || validity.supersededByRefs.length) reasons.push('AUTHORITY_INVALID');
  if (Date.parse(validity.notBefore) >= Date.parse(validity.expiresAt)) reasons.push('UNINTERPRETABLE_AUTHORITY');
  if (now < Date.parse(validity.notBefore)) reasons.push('AUTHORITY_NOT_YET_VALID');
  if (now >= Date.parse(validity.expiresAt)) reasons.push('AUTHORITY_EXPIRED');
  return reasons;
}
function sourceIdentity(sources: AuthoritySourceRef[]): string {
  return JSON.stringify(sources.map(source => [source.kind, source.ref]).sort());
}

/** Internal enforcement primitive. The caller owns fresh source resolution and independent gates. */
export function evaluateEffectiveAuthority(input: unknown): TileEnvelope<EffectiveAuthorityDecision> {
  const reasons: string[] = [], evidenceRefs: string[] = [], sourceRefs: string[] = [];
  let envelope: AuthorityEnvelope | null = null, request: EffectiveAuthorityRequest | null = null;
  try {
    if (!validateRequest(input) || Buffer.byteLength(JSON.stringify(input)) > 262_144) throw new Error('Uninterpretable authority evaluation input.');
    request = input;
    envelope = parseAuthorityEnvelope(request.envelope);
    const current = request.currentEnvelopes.map(parseAuthorityEnvelope);
    const byRef = new Map(current.map(value => [value.envelopeRef, value]));
    const sources = new Map(request.sources.map(source => [source.source.ref, source]));
    if (byRef.size !== current.length || sources.size !== request.sources.length) reasons.push('AMBIGUOUS_AUTHORITY');
    const leaf = byRef.get(envelope.envelopeRef);
    if (!leaf) reasons.push('AUTHORITY_UNRESOLVED');
    const lineage = [...envelope.delegation.lineageRefs, envelope.envelopeRef].map(ref => byRef.get(ref));
    if (lineage.some(value => !value)) reasons.push('AUTHORITY_UNRESOLVED');
    const chain = lineage.filter((value): value is AuthorityEnvelope => value !== undefined);
    if (chain[0]?.delegation.parentEnvelopeRef !== null) reasons.push('LINEAGE_UNRESOLVED');
    for (let i = 1; i < chain.length; i++) if (!validateAuthorityDelegation(chain[i], chain[i - 1]).ok) reasons.push('DELEGATION_AMPLIFICATION');
    if (leaf) {
      if (sourceIdentity(envelope.authoritySources) !== sourceIdentity(leaf.authoritySources) || envelope.delegation.parentEnvelopeRef !== leaf.delegation.parentEnvelopeRef || JSON.stringify(envelope.delegation.lineageRefs) !== JSON.stringify(leaf.delegation.lineageRefs)) reasons.push('SOURCE_BINDING_MISMATCH');
      if (!authorityScopeContains(leaf.scope, envelope.scope) || !authorityConstraintsContain(leaf.contextConstraints, envelope.contextConstraints) || !authorityScopeContains(leaf.delegation.ceiling, envelope.delegation.ceiling) || !intervalContains(leaf.validity, envelope.validity) || envelope.delegation.depthRemaining > leaf.delegation.depthRemaining || (envelope.delegation.furtherDelegation && !leaf.delegation.furtherDelegation)) reasons.push('DELEGATION_AMPLIFICATION');
    }
    if (chain.length > 1 && !validateAuthorityDelegation(envelope, chain[chain.length - 2]).ok) reasons.push('DELEGATION_AMPLIFICATION');
    const requiredSources = new Map([...chain, envelope].flatMap(value => value.authoritySources).map(source => [source.ref, source]));
    const resolved: CurrentAuthoritySource[] = [];
    for (const source of requiredSources.values()) {
      sourceRefs.push(source.ref);
      const state = sources.get(source.ref);
      if (!state || state.source.kind !== source.kind) reasons.push('AUTHORITY_UNRESOLVED');
      else { resolved.push(state); evidenceRefs.push(...state.evidenceRefs); }
    }
    const now = Date.parse(request.now);
    const bounds = [...chain, envelope, ...resolved];
    for (const bound of bounds) {
      reasons.push(...currentValidity(bound.validity, now));
      if (bound.policy.ref !== request.policy.ref || bound.policy.version !== request.policy.version || bound.policy.frontierRef !== request.policy.frontierRef) reasons.push('POLICY_FRONTIER_MISMATCH');
      const frontier = 'provenance' in bound ? bound.provenance.sourceFrontierRef : bound.sourceFrontierRef;
      if (frontier !== request.sourceFrontierRef) reasons.push('SOURCE_FRONTIER_MISMATCH');
      for (const [attribute, values] of Object.entries(bound.contextConstraints)) if (!Object.hasOwn(request.context, attribute) || !values.includes(request.context[attribute])) reasons.push('CONTEXT_CONSTRAINT_DENIED');
    }
    const scopes = [...bounds.map(bound => bound.scope), ...request.ceilings];
    let operations = [...envelope.scope.operations], effects = [...envelope.scope.effects];
    for (const scope of scopes) { operations = operations.filter(operation => scope.operations.includes(operation)); effects = effects.filter(effect => scope.effects.includes(effect)); }
    if (!operations.length || !effects.length) reasons.push('EMPTY_INTERSECTION');
    const proposed = { target: request.target, operations: [request.operation], effects: [request.effect] };
    if (scopes.some(scope => !authorityScopeContains(scope, proposed))) reasons.push('OUTSIDE_EFFECTIVE_AUTHORITY');
    if (!request.providerCapabilities.some(scope => authorityScopeContains(scope, proposed))) reasons.push('PROVIDER_CAPABILITY_MISMATCH');
    for (const ref of request.requiredActorEvidenceRefs) if (!request.actorEvidenceRefs.includes(ref) || !envelope.actorEvidenceRefs.includes(ref)) reasons.push('ACTOR_EVIDENCE_REQUIRED');
    evidenceRefs.push(request.gates.safeHold.evidenceRef, request.gates.identitySensitive.evidenceRef);
    if (request.gates.safeHold.active) reasons.push('SAFE_HOLD');
    if (request.gates.identitySensitive.required && !request.gates.identitySensitive.satisfied) reasons.push('IDENTITY_GATE_REQUIRED');
    if (new Set(evidenceRefs).size > 256) reasons.push('EVIDENCE_BOUND_EXCEEDED');
  } catch { reasons.push('UNINTERPRETABLE_AUTHORITY'); }
  const effect: 'allow' | 'deny' = reasons.length ? 'deny' : 'allow';
  const evidence = {
    effect, reasonCodes: [...new Set(reasons.length ? reasons : ['AUTHORITY_VALID'])],
    authorityEnvelopeRef: envelope?.envelopeRef ?? null,
    request: request ? { operation: request.operation, effect: request.effect, target: request.target } : null,
    evaluatedAt: request?.now ?? null, policy: request?.policy ?? null,
    sourceRefs: [...new Set(sourceRefs)].slice(0, 256), evidenceRefs: [...new Set(evidenceRefs)].slice(0, 256),
    intentRefs: boundedIntentRefs(input), authorityRole: 'decision-evidence' as const
  };
  const core = createEvaluation(`Effective authority ${JSON.stringify(evidence)}`, effect === 'allow' ? 'pass' : 'deny');
  return buildTile<EffectiveAuthorityDecision>('rosetta.evaluation', { ...core.payload, ...evidence, verdict: effect === 'allow' ? 'pass' : 'deny' });
}
