import { canonicalTraceJson, traceHash } from './trace-normalization.js';
import { compareProfileTimestamps } from './evaluation-profile-validation.js';
import { parseEvidenceIndependence } from './evidence-independence.js';
import { compileEvidenceContract, evidenceRefSchema as ref, evidenceRefsSchema as refs, supportedEvidenceSchema as support, evidenceObjectSchema as object, evidenceProfileSchema as profile, evidenceIdentitySchema as identity, evidenceTimestampSchema as timestamp, nullableEvidenceSchema as nullable, collectEvidenceSourceLineages, type EvidenceIdentity } from './evidence-contract-validation.js';

export const CORRECTION_AMENDMENT_PROFILE = 'correction.amendment.v1';
export const AMENDMENT_DISPOSITIONS = ['RECEIVED_UNEVALUATED', 'LOCALLY_CORROBORATED', 'LOCALLY_REFUTED', 'REFINED', 'SCOPE_NARROWED', 'DISPUTED', 'SUPERSEDED', 'RETRACTED', 'INAPPLICABLE_LOCAL_CONTEXT', 'INSUFFICIENT_INDEPENDENT_EVIDENCE', 'QUARANTINED', 'UNKNOWN'] as const;
const revisionKinds = ['initial', 'refinement', 'scope-narrowed', 'retraction', 'supersession'] as const;
interface RecordBase {
  profile: { id: typeof CORRECTION_AMENDMENT_PROFILE; version: '1.0.0' };
  recordId: string; predecessorRef: string | null; observedAt: string;
}
type Sources = { source: EvidenceIdentity; lineageRef: string }[];
export interface CorrectionAmendment extends RecordBase {
  kind: 'amendment'; amendmentRef: string; revisionKind: typeof revisionKinds[number];
  failureSubject: EvidenceIdentity; correctedArtifact: EvidenceIdentity | null;
  mechanism: EvidenceIdentity; affectedClasses: string[];
  applicability: { scopeRefs: string[]; constraintRefs: string[]; contextRefs: string[] };
  uncertainty: { assessmentRef: string | null; unresolvedRefs: string[] };
  disclosure: { audience: 'local' | 'exchange'; supportPosture: 'reference-disclosed' | 'receipt-only'; policyRefs: string[] };
  authentication: { state: 'verified' | 'unverified' | 'unknown'; receiptRefs: string[] };
  supportingSources: Sources; provenanceRefs: string[]; receiptRefs: string[];
  impactRefs: string[]; revalidationRefs: string[]; replacementRefs: string[];
}
export interface LocalAssessment extends RecordBase {
  kind: 'assessment'; assessmentRef: string; amendmentRecordId: string;
  actorRef: string; method: EvidenceIdentity; contextRef: string;
  applicability: 'applicable' | 'inapplicable' | 'unknown';
  evidenceRefs: string[]; supportingSources: Sources;
  independenceAssessmentRefs: string[]; challengeRefs: string[]; refinementRefs: string[];
  uncertainty: { assessmentRef: string | null; unresolvedRefs: string[] };
  reasonRefs: string[]; receiptRefs: string[];
}
export interface LocalAdoption extends RecordBase {
  kind: 'adoption'; adoptionRef: string; amendmentRecordId: string;
  assessmentRecordId: string | null; contextRef: string;
  disposition: typeof AMENDMENT_DISPOSITIONS[number];
  policyRefs: string[]; authorityRefs: string[]; reasonRefs: string[]; receiptRefs: string[];
}
export type CorrectionAmendmentRecord = CorrectionAmendment | LocalAssessment | LocalAdoption;
const digest = { type: 'string', pattern: '^[a-f0-9]{64}$' };
const common = { profile: profile(CORRECTION_AMENDMENT_PROFILE), recordId: digest, predecessorRef: nullable(digest), observedAt: timestamp };
const sources = { type: 'array', maxItems: 256, items: object({ source: identity, lineageRef: ref }) };
const uncertainty = object({ assessmentRef: nullable(ref), unresolvedRefs: refs });
export const CORRECTION_AMENDMENT_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#', $id: 'urn:rosetta:correction.amendment.v1',
  title: 'Separate correction amendment, local assessment and local adoption records v1',
  oneOf: [
    object({ ...common, kind: { const: 'amendment' }, amendmentRef: ref, revisionKind: { enum: revisionKinds },
      failureSubject: identity, correctedArtifact: nullable(identity), mechanism: identity, affectedClasses: support,
      applicability: object({ scopeRefs: support, constraintRefs: refs, contextRefs: refs }), uncertainty,
      disclosure: object({ audience: { enum: ['local', 'exchange'] }, supportPosture: { enum: ['reference-disclosed', 'receipt-only'] }, policyRefs: support }),
      authentication: object({ state: { enum: ['verified', 'unverified', 'unknown'] }, receiptRefs: refs }),
      supportingSources: sources, provenanceRefs: support, receiptRefs: refs, impactRefs: refs, revalidationRefs: refs, replacementRefs: refs }),
    object({ ...common, kind: { const: 'assessment' }, assessmentRef: ref, amendmentRecordId: digest, actorRef: ref, method: identity, contextRef: ref,
      applicability: { enum: ['applicable', 'inapplicable', 'unknown'] }, evidenceRefs: refs, supportingSources: sources,
      independenceAssessmentRefs: refs, challengeRefs: refs, refinementRefs: refs, uncertainty, reasonRefs: support, receiptRefs: refs }),
    object({ ...common, kind: { const: 'adoption' }, adoptionRef: ref, amendmentRecordId: digest, assessmentRecordId: nullable(digest), contextRef: ref,
      disposition: { enum: AMENDMENT_DISPOSITIONS }, policyRefs: support, authorityRefs: support, reasonRefs: support, receiptRefs: refs })
  ]
};
const admit = compileEvidenceContract<CorrectionAmendmentRecord>(CORRECTION_AMENDMENT_SCHEMA);
const exact = (value: EvidenceIdentity) => value.version !== null || value.cid !== null;
const equal = (a: unknown, b: unknown) => canonicalTraceJson(a) === canonicalTraceJson(b);
const terminal = (value: CorrectionAmendment) => ['retraction', 'supersession'].includes(value.revisionKind);

export function parseCorrectionAmendment(input: unknown): CorrectionAmendmentRecord {
  const value = admit(input);
  if (value.kind === 'amendment') {
    if ((value.revisionKind === 'initial') !== (value.predecessorRef === null)) throw new Error('Amendment revision requires an exact predecessor.');
    if (value.authentication.state === 'verified' && !value.authentication.receiptRefs.length) throw new Error('Verified authentication requires an attributable receipt.');
    if (value.disclosure.supportPosture === 'receipt-only' && (value.supportingSources.length || !value.receiptRefs.length)) throw new Error('Receipt-only support cannot expose source references and requires a bounded receipt.');
    if (![value.mechanism, value.failureSubject, ...(value.correctedArtifact ? [value.correctedArtifact] : [])].every(exact)) throw new Error('Exact artifact revisions required.');
    if (terminal(value) && !value.impactRefs.length) throw new Error('Terminal correction requires dependency impact evidence.');
    if (value.revisionKind === 'supersession' && !value.replacementRefs.length) throw new Error('Supersession requires replacement evidence.');
    if (value.replacementRefs.includes(value.recordId)) throw new Error('Self replacement.');
  }
  if (value.kind === 'assessment' && !exact(value.method)) throw new Error('Exact evaluator method revision required.');
  if (value.kind !== 'adoption') {
    if (value.supportingSources.some(item => !exact(item.source))) throw new Error('Exact supporting-source revision required.');
    collectEvidenceSourceLineages(value.supportingSources);
  }
  if (value.predecessorRef === value.recordId) throw new Error('Self predecessor.');
  const { recordId, ...body } = value;
  if (traceHash(canonicalTraceJson(body)) !== recordId) throw new Error('Amendment revision digest mismatch.');
  return structuredClone(value);
}
type RecordBody<T extends CorrectionAmendmentRecord> = Omit<T, 'recordId'>;
export function createCorrectionAmendment<T extends CorrectionAmendmentRecord>(body: RecordBody<T>): T {
  return parseCorrectionAmendment({ ...body, recordId: traceHash(canonicalTraceJson(body)) }) as T;
}
export function declaredAmendmentLineages(input: CorrectionAmendment): string[] {
  const value = parseCorrectionAmendment(input);
  if (value.kind !== 'amendment') throw new Error('Expected amendment envelope.');
  return collectEvidenceSourceLineages(value.supportingSources);
}
const stable = (r: CorrectionAmendmentRecord) => r.kind === 'amendment' ? r.amendmentRef : r.kind === 'assessment' ? r.assessmentRef : r.adoptionRef;
const subset = (a: string[], b: string[]) => a.every(x => b.includes(x));

/** Validate declared closure only. No signature, policy or rights authentication occurs here. */
function corroborates(assessment: LocalAssessment, independenceRecords: readonly unknown[]): boolean {
  if (assessment.applicability !== 'applicable' || !assessment.evidenceRefs.length ||
      collectEvidenceSourceLineages(assessment.supportingSources).length < 2) return false;
  const inputs = independenceRecords.map(parseEvidenceIndependence);
  const actual = assessment.supportingSources.map(s => canonicalTraceJson(s.source));
  return assessment.independenceAssessmentRefs.some(id => {
    const independence = inputs.find(i => i.recordId === id);
    if (!independence || independence.outcome !== 'INDEPENDENT' || independence.frontier.coverage !== 'complete' ||
        compareProfileTimestamps(independence.observedAt, assessment.observedAt) > 0) return false;
    const scoped = independence.scope.members.map(m => independence.subjects.find(s => s.id === m)?.record);
    if (scoped.some(s => !s)) return false;
    const records = scoped.map(s => canonicalTraceJson(s));
    return new Set(records).size === records.length && records.length === actual.length &&
      new Set(actual).size === actual.length && actual.every(s => records.includes(s));
  });
}

/** Append a bounded history with separately queryable local assessments and dispositions.
 * The supplied independence artifacts are exact, not authority grants. */
export function appendCorrectionAmendment(history: readonly CorrectionAmendmentRecord[], next: CorrectionAmendmentRecord, independenceRecords: readonly unknown[] = []): CorrectionAmendmentRecord[] {
  const records: CorrectionAmendmentRecord[] = [];
  const byId = new Map<string, CorrectionAmendmentRecord>();
  for (const input of [...history, next]) {
    const value = parseCorrectionAmendment(input);
    if (byId.has(value.recordId)) continue;
    const prior = value.predecessorRef ? byId.get(value.predecessorRef) : undefined;
    if (value.predecessorRef && (!prior || prior.kind !== value.kind || stable(prior) !== stable(value) || compareProfileTimestamps(prior.observedAt, value.observedAt) >= 0)) throw new Error('Record succession requires same stable identity and later observation.');
    if (!prior && records.some(r => r.kind === value.kind && stable(r) === stable(value))) throw new Error('Duplicate stable genesis.');
    if (value.kind === 'amendment' && prior?.kind === 'amendment') {
      if (!equal(prior.failureSubject, value.failureSubject) || terminal(prior)) throw new Error('Terminal or changed failure subject cannot acquire a successor.');
      if (value.revisionKind === 'scope-narrowed') {
        const a = prior.applicability, b = value.applicability;
        const contextNarrower = a.contextRefs.length === 0 ? b.contextRefs.length > 0 : b.contextRefs.length > 0 && subset(b.contextRefs, a.contextRefs) && b.contextRefs.length < a.contextRefs.length;
        if (!subset(b.scopeRefs, a.scopeRefs) || !subset(a.constraintRefs, b.constraintRefs) ||
          (a.contextRefs.length > 0 && (!b.contextRefs.length || !subset(b.contextRefs, a.contextRefs))) ||
          !(b.scopeRefs.length < a.scopeRefs.length || b.constraintRefs.length > a.constraintRefs.length || contextNarrower)) throw new Error('Declared narrowing cannot broaden scope, context or constraints.');
      }
    }
    if (value.kind !== 'amendment') {
      const envelope = byId.get(value.amendmentRecordId);
      if (envelope?.kind !== 'amendment' || compareProfileTimestamps(envelope.observedAt, value.observedAt) > 0) throw new Error('Exact amendment envelope required.');
      if (prior && prior.kind !== 'amendment' && (prior.contextRef !== value.contextRef || prior.amendmentRecordId !== value.amendmentRecordId)) throw new Error('Local record revision cannot substitute context or envelope.');
      if (value.kind === 'assessment' && prior?.kind === 'assessment' && (value.actorRef !== prior.actorRef || !equal(value.method, prior.method))) throw new Error('Assessment evaluator identity changed.');
      if (value.kind === 'adoption') {
        const assessment = value.assessmentRecordId ? byId.get(value.assessmentRecordId) : undefined;
        if (value.assessmentRecordId && (assessment?.kind !== 'assessment' || assessment.amendmentRecordId !== value.amendmentRecordId || assessment.contextRef !== value.contextRef || compareProfileTimestamps(assessment.observedAt, value.observedAt) > 0)) throw new Error('Exact local assessment for amendment and context required.');
        const d = value.disposition;
        if (d === 'LOCALLY_CORROBORATED' && (assessment?.kind !== 'assessment' || !corroborates(assessment, independenceRecords))) throw new Error('Corroboration requires complete matching independence closure.');
        if (['LOCALLY_REFUTED', 'DISPUTED', 'REFINED', 'SCOPE_NARROWED', 'INAPPLICABLE_LOCAL_CONTEXT'].includes(d)) {
          if (assessment?.kind !== 'assessment' || !assessment.evidenceRefs.length) throw new Error('Local disposition requires attributable evidence.');
          if (['LOCALLY_REFUTED', 'DISPUTED'].includes(d) && !assessment.challengeRefs.length) throw new Error('Challenge evidence required.');
          if (['REFINED', 'SCOPE_NARROWED'].includes(d) && !assessment.refinementRefs.length) throw new Error('Refinement evidence required.');
          if (d === 'INAPPLICABLE_LOCAL_CONTEXT' && assessment.applicability !== 'inapplicable') throw new Error('Inapplicability assessment required.');
        }
        if (d === 'RETRACTED' && envelope.revisionKind !== 'retraction' || d === 'SUPERSEDED' && envelope.revisionKind !== 'supersession') throw new Error('Terminal local disposition requires terminal amendment evidence.');
      }
    }
    records.push(value); byId.set(value.recordId, value);
  }
  return records;
}
