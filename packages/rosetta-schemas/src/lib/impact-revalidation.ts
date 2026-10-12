import { canonicalTraceJson } from './trace-normalization.js';
import { compileEvidenceContract, evidenceRefSchema as ref, evidenceRefsSchema as refs, supportedEvidenceSchema as support, evidenceObjectSchema as object, evidenceProfileSchema as profile, evidenceIdentitySchema, evidenceTimestampSchema, nullableEvidenceSchema as nullable, type EvidenceIdentity } from './evidence-contract-validation.js';

export const IMPACT_DISPOSITIONS = ['AFFECTED', 'POTENTIALLY_AFFECTED', 'PROVEN_UNAFFECTED', 'REVALIDATION_REQUIRED', 'REVALIDATED_VALID', 'REVALIDATED_INVALID', 'SUPERSEDED', 'EXTERNAL_EFFECT_IRREVERSIBLE', 'UNKNOWN'] as const;
export interface ImpactSubject {
  subject: EvidenceIdentity; disposition: typeof IMPACT_DISPOSITIONS[number]; rationaleRefs: string[]; dependencyRefs: string[]; affectednessEvidenceRefs: string[];
  revalidation: { methodRef: string; profile: { id: string; version: string }; executorRef: string; kind: 'validation' | 'rebuild-only' | 'unknown'; evidenceRefs: string[] } | null;
  replacementRefs: string[]; externalEffectRefs: string[];
}
export interface ImpactRevalidation {
  profile: { id: 'impact.revalidation.v1'; version: '1.0.0' }; recordId: string; invalidationRef: string;
  invalidatedSubjects: EvidenceIdentity[]; invalidationClass: 'defective-translator' | 'source-correction' | 'pack-profile-revocation' | 'policy-revocation' | 'signer-compromise' | 'identity-correction' | 'failed-evaluation' | 'other';
  reasonRefs: string[]; evidenceRefs: string[];
  candidateScope: { status: 'complete' | 'partial' | 'unknown'; edgeClasses: string[]; queryRefs: string[]; evidenceRefs: string[] };
  subjects: ImpactSubject[];
  externalEffects: { effectRef: string; evidenceRefs: string[]; compensationRefs: string[] }[];
  closure: { state: 'open' | 'closed'; unresolvedRefs: string[]; unresolvedFrontierRef: string | null };
  temporal: { effectiveTimeRef: string; observationTimeRef: string; recordedAt: string; correctionTimeRef: string | null; knowledgeFrontierRef: string; causalPredecessorRefs: string[] };
  historicalContexts: { actorRef: string; decisionRef: string; knowledgeFrontierRef: string; knownEvidenceRefs: string[]; laterEvidenceRefs: string[] }[];
  receiptRefs: string[]; provenanceRefs: string[]; supersedesRefs: string[];
}
const subjectSchema = object({ subject: evidenceIdentitySchema, disposition: { enum: IMPACT_DISPOSITIONS }, rationaleRefs: support, dependencyRefs: refs, affectednessEvidenceRefs: refs,
  revalidation: nullable(object({ methodRef: ref, profile: object({ id: ref, version: ref }), executorRef: ref, kind: { enum: ['validation', 'rebuild-only', 'unknown'] }, evidenceRefs: support })), replacementRefs: refs, externalEffectRefs: refs });
export const IMPACT_REVALIDATION_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'urn:rosetta:impact.revalidation.v1', title: 'Dependency impact and attributable revalidation v1',
  ...object({ profile: profile('impact.revalidation.v1'), recordId: ref, invalidationRef: ref,
    invalidatedSubjects: { type: 'array', minItems: 1, maxItems: 256, items: evidenceIdentitySchema }, invalidationClass: { enum: ['defective-translator', 'source-correction', 'pack-profile-revocation', 'policy-revocation', 'signer-compromise', 'identity-correction', 'failed-evaluation', 'other'] }, reasonRefs: support, evidenceRefs: support,
    candidateScope: object({ status: { enum: ['complete', 'partial', 'unknown'] }, edgeClasses: refs, queryRefs: refs, evidenceRefs: refs }), subjects: { type: 'array', maxItems: 256, items: subjectSchema },
    externalEffects: { type: 'array', maxItems: 128, items: object({ effectRef: ref, evidenceRefs: support, compensationRefs: refs }) },
    closure: object({ state: { enum: ['open', 'closed'] }, unresolvedRefs: refs, unresolvedFrontierRef: nullable(ref) }),
    temporal: object({ effectiveTimeRef: ref, observationTimeRef: ref, recordedAt: evidenceTimestampSchema, correctionTimeRef: nullable(ref), knowledgeFrontierRef: ref, causalPredecessorRefs: refs }),
    historicalContexts: { type: 'array', maxItems: 128, items: object({ actorRef: ref, decisionRef: ref, knowledgeFrontierRef: ref, knownEvidenceRefs: refs, laterEvidenceRefs: refs }) }, receiptRefs: refs, provenanceRefs: support, supersedesRefs: refs
  })
};
const admit = compileEvidenceContract<ImpactRevalidation>(IMPACT_REVALIDATION_SCHEMA);
const unresolved = new Set(['AFFECTED', 'POTENTIALLY_AFFECTED', 'REVALIDATION_REQUIRED', 'UNKNOWN']);
export function parseImpactRevalidation(input: unknown): ImpactRevalidation {
  const value = admit(input);
  if (new Set(value.subjects.map(s => s.subject.ref)).size !== value.subjects.length) throw new Error('Duplicate impact subject identity.');
  if (new Set(value.invalidatedSubjects.map(s => s.ref)).size !== value.invalidatedSubjects.length) throw new Error('Duplicate invalidated subject identity.');
  const effectRefs = new Set(value.externalEffects.map(e => e.effectRef));
  if (effectRefs.size !== value.externalEffects.length) throw new Error('Duplicate external-effect identity.');
  for (const subject of value.subjects) {
    if (subject.disposition === 'AFFECTED' && !subject.affectednessEvidenceRefs.length) throw new Error('Dependency alone is not affectedness evidence.');
    if (['PROVEN_UNAFFECTED', 'REVALIDATED_VALID', 'REVALIDATED_INVALID'].includes(subject.disposition) && subject.revalidation?.kind !== 'validation') throw new Error('Attributable revalidation is required; rebuild is not revalidation.');
    if (subject.disposition === 'SUPERSEDED' && !subject.replacementRefs.length) throw new Error('Superseded subject requires replacement references.');
    if (subject.externalEffectRefs.some(ref => !effectRefs.has(ref)) || (subject.disposition === 'EXTERNAL_EFFECT_IRREVERSIBLE' && !subject.externalEffectRefs.length)) throw new Error('Irreversible external effect must remain resolvable.');
    if (unresolved.has(subject.disposition) && !value.closure.unresolvedRefs.includes(subject.subject.ref)) throw new Error('Closure hides an unresolved subject.');
  }
  if (value.candidateScope.status === 'complete' && !value.candidateScope.evidenceRefs.length) throw new Error('Complete dependency scope requires evidence.');
  if (value.candidateScope.status !== 'complete' && !value.closure.unresolvedFrontierRef) throw new Error('Unknown dependency frontier must remain explicit.');
  if (value.closure.state === 'closed' && (value.closure.unresolvedRefs.length || value.closure.unresolvedFrontierRef || value.candidateScope.status !== 'complete')) throw new Error('Cannot close an unresolved dependency frontier.');
  const decisions = new Set<string>();
  for (const context of value.historicalContexts) {
    if (decisions.has(context.decisionRef) || context.knownEvidenceRefs.some(ref => context.laterEvidenceRefs.includes(ref))) throw new Error('Historical knowledge cannot include later invalidation evidence.');
    decisions.add(context.decisionRef);
  }
  if (value.supersedesRefs.includes(value.recordId)) throw new Error('Impact cannot supersede itself.');
  return value;
}

/** Append-only bounded evidence history; no remediation or write authority is implied. */
export function appendImpactRevalidation(history: readonly ImpactRevalidation[], next: ImpactRevalidation): ImpactRevalidation[] {
  const records: ImpactRevalidation[] = [];
  for (const input of [...history, next]) {
    const value = parseImpactRevalidation(input);
    const duplicate = records.find(r => r.recordId === value.recordId);
    if (duplicate) {
      if (canonicalTraceJson(duplicate) !== canonicalTraceJson(value)) throw new Error('Conflicting impact record identity.');
      continue;
    }
    const previous = records.at(-1);
    if (value.supersedesRefs.some(ref => !records.some(r => r.recordId === ref))) throw new Error('Unresolved impact supersession.');
    if (previous) {
      if (previous.invalidationRef !== value.invalidationRef || canonicalTraceJson(previous.invalidatedSubjects) !== canonicalTraceJson(value.invalidatedSubjects) || !value.supersedesRefs.includes(previous.recordId)) throw new Error('Impact revision must retain invalidation identity and explicit supersession.');
      if (previous.externalEffects.some(e => !value.externalEffects.some(n => n.effectRef === e.effectRef && e.evidenceRefs.every(ref => n.evidenceRefs.includes(ref)) && e.compensationRefs.every(ref => n.compensationRefs.includes(ref))))) throw new Error('Revision cannot erase irreversible external facts.');
      if (previous.historicalContexts.some(c => !value.historicalContexts.some(n => n.decisionRef === c.decisionRef && n.actorRef === c.actorRef && n.knowledgeFrontierRef === c.knowledgeFrontierRef && canonicalTraceJson(n.knownEvidenceRefs) === canonicalTraceJson(c.knownEvidenceRefs)))) throw new Error('Revision cannot rewrite historical knowledge.');
    }
    records.push(value);
  }
  return structuredClone(records);
}
