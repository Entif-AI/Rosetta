import { canonicalTraceJson, traceHash } from './trace-normalization.js';
import { compareProfileTimestamps } from './evaluation-profile-validation.js';
import { compileEvidenceContract, evidenceRefSchema as ref, evidenceRefsSchema as refs, supportedEvidenceSchema as support, evidenceObjectSchema as object, evidenceProfileSchema as profile, evidenceIdentitySchema as identity, evidenceTimestampSchema as timestamp, nullableEvidenceSchema as nullable, collectEvidenceSourceLineages, type EvidenceIdentity } from './evidence-contract-validation.js';

export const CORRECTION_AMENDMENT_PROFILE = 'correction.amendment.v1';
export const AMENDMENT_DISPOSITIONS = ['RECEIVED_UNEVALUATED', 'LOCALLY_CORROBORATED', 'LOCALLY_REFUTED', 'REFINED', 'SCOPE_NARROWED', 'DISPUTED', 'SUPERSEDED', 'RETRACTED', 'INAPPLICABLE_LOCAL_CONTEXT', 'INSUFFICIENT_INDEPENDENT_EVIDENCE', 'QUARANTINED', 'UNKNOWN'] as const;
export interface CorrectionAmendment {
  profile: { id: typeof CORRECTION_AMENDMENT_PROFILE; version: '1.0.0' };
  amendmentRef: string; recordId: string; predecessorRef: string | null; observedAt: string;
  failureSubject: EvidenceIdentity; correctedArtifact: EvidenceIdentity | null;
  mechanism: EvidenceIdentity; affectedClasses: string[];
  applicability: { scopeRefs: string[]; constraintRefs: string[]; contextRefs: string[] };
  uncertainty: { assessmentRef: string | null; unresolvedRefs: string[] };
  disclosure: { audience: 'local' | 'exchange'; supportPosture: 'reference-disclosed' | 'receipt-only'; policyRefs: string[] };
  authentication: { state: 'verified' | 'unverified' | 'unknown'; receiptRefs: string[] };
  evaluation: { actorRef: string; contextRef: string; disposition: typeof AMENDMENT_DISPOSITIONS[number]; evidenceRefs: string[]; independenceAssessmentRefs: string[]; challengeRefs: string[]; refinementRefs: string[]; replacementRefs: string[] };
  supportingSources: { source: EvidenceIdentity; lineageRef: string }[];
  provenanceRefs: string[]; receiptRefs: string[]; impactRefs: string[]; revalidationRefs: string[];
}

export const CORRECTION_AMENDMENT_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'urn:rosetta:correction.amendment.v1', title: 'Bounded correction amendment and failure abstraction v1',
  ...object({
    profile: profile(CORRECTION_AMENDMENT_PROFILE), amendmentRef: ref, recordId: { type: 'string', pattern: '^[a-f0-9]{64}$' }, predecessorRef: nullable(ref), observedAt: timestamp,
    failureSubject: identity, correctedArtifact: nullable(identity), mechanism: identity, affectedClasses: support,
    applicability: object({ scopeRefs: support, constraintRefs: refs, contextRefs: refs }),
    uncertainty: object({ assessmentRef: nullable(ref), unresolvedRefs: refs }),
    disclosure: object({ audience: { enum: ['local', 'exchange'] }, supportPosture: { enum: ['reference-disclosed', 'receipt-only'] }, policyRefs: support }),
    authentication: object({ state: { enum: ['verified', 'unverified', 'unknown'] }, receiptRefs: refs }),
    evaluation: object({ actorRef: ref, contextRef: ref, disposition: { enum: AMENDMENT_DISPOSITIONS }, evidenceRefs: refs, independenceAssessmentRefs: refs, challengeRefs: refs, refinementRefs: refs, replacementRefs: refs }),
    supportingSources: { type: 'array', maxItems: 256, items: object({ source: identity, lineageRef: ref }) },
    provenanceRefs: support, receiptRefs: refs, impactRefs: refs, revalidationRefs: refs
  })
};
const admit = compileEvidenceContract<CorrectionAmendment>(CORRECTION_AMENDMENT_SCHEMA);

/** Declared roots only. Neither distinct lineage refs nor signatures establish independent evidence. */
export function declaredAmendmentLineages(input: CorrectionAmendment): string[] {
  return collectEvidenceSourceLineages(parseCorrectionAmendment(input).supportingSources);
}

function validate(input: unknown): CorrectionAmendment {
  const value = admit(input);
  const { authentication, disclosure, evaluation } = value;
  if (authentication.state === 'verified' && !authentication.receiptRefs.length) throw new Error('Verified authentication requires an attributable receipt.');
  if (disclosure.supportPosture === 'receipt-only' && (value.supportingSources.length || !value.receiptRefs.length)) throw new Error('Receipt-only support cannot expose source references and requires a bounded receipt.');
  if (!value.mechanism.version && !value.mechanism.cid) throw new Error('Exact failure-mechanism revision required.');
  if (!value.failureSubject.version && !value.failureSubject.cid) throw new Error('Exact failure-subject revision required.');
  if (value.correctedArtifact && !value.correctedArtifact.version && !value.correctedArtifact.cid) throw new Error('Exact corrected artifact revision required.');
  for (const { source } of value.supportingSources) if (!source.version && !source.cid) throw new Error('Exact supporting-source revision required.');
  collectEvidenceSourceLineages(value.supportingSources);
  const d = evaluation.disposition;
  if (['LOCALLY_CORROBORATED', 'LOCALLY_REFUTED', 'REFINED', 'SCOPE_NARROWED', 'INAPPLICABLE_LOCAL_CONTEXT'].includes(d) && !evaluation.evidenceRefs.length) throw new Error('Local disposition requires evidence independent of authentication.');
  if (d === 'LOCALLY_CORROBORATED' && !evaluation.independenceAssessmentRefs.length) throw new Error('Corroboration requires explicit independence assessment evidence.');
  if (['DISPUTED', 'LOCALLY_REFUTED'].includes(d) && !evaluation.challengeRefs.length) throw new Error('Challenge must remain attributable.');
  if (['REFINED', 'SCOPE_NARROWED'].includes(d) && !evaluation.refinementRefs.length) throw new Error('Refinement requires explicit predecessor or competing claim reference.');
  if (d === 'SUPERSEDED' && !evaluation.replacementRefs.length) throw new Error('Supersession requires replacement evidence.');
  if (['SUPERSEDED', 'RETRACTED'].includes(d) && (!value.predecessorRef || !value.impactRefs.length)) throw new Error('Terminal correction requires preserved predecessor and dependency impact reference.');
  if (value.predecessorRef === value.recordId || evaluation.replacementRefs.includes(value.recordId)) throw new Error('Amendment cannot refer to itself as predecessor or replacement.');
  return value;
}

export function parseCorrectionAmendment(input: unknown): CorrectionAmendment {
  const value = validate(input);
  const { recordId, ...body } = value;
  if (traceHash(canonicalTraceJson(body)) !== recordId) throw new Error('Amendment revision digest mismatch.');
  return structuredClone(value);
}

export function createCorrectionAmendment(body: Omit<CorrectionAmendment, 'recordId'>): CorrectionAmendment {
  return parseCorrectionAmendment({ ...body, recordId: traceHash(canonicalTraceJson(body)) });
}

/** Preserve competing claims instead of selecting a winner or granting adoption. */
export function appendCorrectionAmendment(history: readonly CorrectionAmendment[], next: CorrectionAmendment): CorrectionAmendment[] {
  const records: CorrectionAmendment[] = [];
  for (const input of [...history, next]) {
    const value = parseCorrectionAmendment(input);
    if (records.some(record => record.recordId === value.recordId)) continue;
    const predecessor = records.find(record => record.recordId === value.predecessorRef);
    if (value.predecessorRef !== null && (!predecessor || predecessor.amendmentRef !== value.amendmentRef || compareProfileTimestamps(predecessor.observedAt, value.observedAt) >= 0 || canonicalTraceJson(predecessor.failureSubject) !== canonicalTraceJson(value.failureSubject))) throw new Error('Amendment succession must retain subject identity, attributable predecessor and later observation.');
    if (predecessor && value.evaluation.disposition === 'SCOPE_NARROWED') {
      const prior = predecessor.applicability, current = value.applicability;
      if (current.scopeRefs.some(scope => !prior.scopeRefs.includes(scope)) || prior.constraintRefs.some(constraint => !current.constraintRefs.includes(constraint)) || (canonicalTraceJson(prior.scopeRefs.slice().sort()) === canonicalTraceJson(current.scopeRefs.slice().sort()) && prior.constraintRefs.length === current.constraintRefs.length)) throw new Error('Declared scope narrowing must remove a scope or add a constraint, never broaden applicability.');
    }
    if (predecessor && ['RETRACTED', 'SUPERSEDED'].includes(predecessor.evaluation.disposition)) throw new Error('Terminal revision cannot be revived as its own successor.');
    records.push(value);
  }
  return records;
}
