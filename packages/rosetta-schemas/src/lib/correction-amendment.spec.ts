import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createCorrectionAmendment, parseCorrectionAmendment, appendCorrectionAmendment, declaredAmendmentLineages, CORRECTION_AMENDMENT_SCHEMA, AMENDMENT_DISPOSITIONS, type CorrectionAmendment } from './correction-amendment.js';

const identity = (ref: string) => ({ ref, version: 'v1', cid: null });
const body = (): Omit<CorrectionAmendment, 'recordId'> => ({
  profile: { id: 'correction.amendment.v1', version: '1.0.0' }, amendmentRef: 'amendment:1', predecessorRef: null, observedAt: '2026-01-01T00:00:00Z', failureSubject: identity('artifact:failed'), correctedArtifact: identity('artifact:corrected'), mechanism: identity('conjecture:failure-mechanism'), affectedClasses: ['dependency'],
  applicability: { scopeRefs: ['scope:a', 'scope:b'], constraintRefs: ['constraint:initial'], contextRefs: [] },
  uncertainty: { assessmentRef: null, unresolvedRefs: ['unknown:generalization'] },
  disclosure: { audience: 'local', supportPosture: 'reference-disclosed', policyRefs: ['policy:local'] },
  authentication: { state: 'verified', receiptRefs: ['receipt:signature'] },
  evaluation: { actorRef: 'receiver:1', contextRef: 'context:1', disposition: 'RECEIVED_UNEVALUATED', evidenceRefs: [], independenceAssessmentRefs: [], challengeRefs: [], refinementRefs: [], replacementRefs: [] },
  supportingSources: [{ source: identity('record:source'), lineageRef: 'root:1' }],
  provenanceRefs: ['receipt:provenance'], receiptRefs: ['receipt:assertion'], impactRefs: [], revalidationRefs: []
});
const later = (prior: CorrectionAmendment): Omit<CorrectionAmendment, 'recordId'> => {
  const { recordId, ...previous } = prior;
  return { ...structuredClone(previous), predecessorRef: recordId, observedAt: '2026-01-02T00:00:00Z' };
};
describe('proposed correction amendment #1625 adversarial evidence', () => {
  it('preserves uncertainty when an actual repair is paired with a proposed overgeneralization', () => {
    const amendment = createCorrectionAmendment(body());
    expect(amendment.correctedArtifact?.ref).toBe('artifact:corrected');
    expect(amendment.evaluation.disposition).toBe('RECEIVED_UNEVALUATED');
    expect(amendment.uncertainty.unresolvedRefs).toEqual(['unknown:generalization']);
  });
  it('a signed malicious amendment can remain quarantined; authentication never grants adoption', () => {
    const input = body(); input.evaluation.disposition = 'QUARANTINED';
    expect(createCorrectionAmendment(input).authentication.state).toBe('verified');
    expect(createCorrectionAmendment(input).evaluation.disposition).toBe('QUARANTINED');
    expect(() => createCorrectionAmendment({ ...input, approved: true } as typeof input)).toThrow(/additional properties/);
  });
  it('ten copied amendments with one declared root yield one lineage, not ten witnesses', () => {
    const input = body(); input.supportingSources = Array.from({ length: 10 }, (_, index) => ({ source: identity(`copy:${index}`), lineageRef: 'root:1' }));
    expect(declaredAmendmentLineages(createCorrectionAmendment(input))).toEqual(['root:1']);
  });
  it('independent convergence remains attributable to an explicit independence assessment', () => {
    const input = body(); input.supportingSources.push({ source: identity('record:other'), lineageRef: 'root:2' });
    input.evaluation.disposition = 'LOCALLY_CORROBORATED'; input.evaluation.evidenceRefs = ['evidence:local'];
    expect(() => createCorrectionAmendment(input)).toThrow(/independence/);
    input.evaluation.independenceAssessmentRefs = ['assessment:bounded-independent'];
    expect(createCorrectionAmendment(input).evaluation.independenceAssessmentRefs).toEqual(['assessment:bounded-independent']);
  });
  it('mutually reinforcing declarations do not establish independence or hide a conflicting canonical root', () => {
    const input = body(); input.evaluation.disposition = 'INSUFFICIENT_INDEPENDENT_EVIDENCE';
    expect(createCorrectionAmendment(input).evaluation.disposition).toBe('INSUFFICIENT_INDEPENDENT_EVIDENCE');
    input.supportingSources.push({ source: identity('record:source'), lineageRef: 'root:colluding' });
    expect(() => createCorrectionAmendment(input)).toThrow(/second witness lineage/);
  });
  it('narrowed public abstraction can retain a receipt without releasing source references', () => {
    const prior = createCorrectionAmendment(body()); const input = later(prior);
    input.disclosure = { audience: 'exchange', supportPosture: 'receipt-only', policyRefs: ['policy:exchange'] };
    input.supportingSources = []; input.evaluation.disposition = 'SCOPE_NARROWED'; input.evaluation.evidenceRefs = ['receipt:private-proof']; input.evaluation.refinementRefs = [prior.recordId]; input.applicability.scopeRefs = ['scope:a'];
    const next = createCorrectionAmendment(input);
    expect(appendCorrectionAmendment([prior], next).map(record => record.recordId)).toEqual([prior.recordId, next.recordId]);
    expect(JSON.stringify(next)).not.toContain('record:source');
    expect(() => createCorrectionAmendment({ ...input, supportingSources: prior.supportingSources })).toThrow(/Receipt-only/);
    expect(() => appendCorrectionAmendment([prior], createCorrectionAmendment({ ...input, applicability: { ...input.applicability, scopeRefs: ['scope:c'] } }))).toThrow(/broaden/);
  });
  it('the same amendment can be corroborated in one context and inapplicable in another', () => {
    const input = body(); input.evaluation.disposition = 'LOCALLY_CORROBORATED'; input.evaluation.evidenceRefs = ['evidence:a']; input.evaluation.independenceAssessmentRefs = ['assessment:a'];
    const first = createCorrectionAmendment(input);
    const other = createCorrectionAmendment({ ...input, evaluation: { ...input.evaluation, contextRef: 'context:b', disposition: 'INAPPLICABLE_LOCAL_CONTEXT', evidenceRefs: ['evidence:b'] } });
    expect(appendCorrectionAmendment([first], other).map(record => [record.evaluation.contextRef, record.evaluation.disposition])).toEqual([['context:1', 'LOCALLY_CORROBORATED'], ['context:b', 'INAPPLICABLE_LOCAL_CONTEXT']]);
  });
  it('retraction preserves the prior revision and requires impact evidence', () => {
    const prior = createCorrectionAmendment(body()); const input = later(prior); input.evaluation.disposition = 'RETRACTED';
    expect(() => createCorrectionAmendment(input)).toThrow(/dependency impact/);
    input.impactRefs = ['impact:1']; const retracted = createCorrectionAmendment(input);
    expect(appendCorrectionAmendment([prior], retracted)).toEqual([prior, retracted]);
    expect(() => appendCorrectionAmendment([prior, retracted], createCorrectionAmendment({ ...later(retracted), observedAt: '2026-01-03T00:00:00Z', evaluation: { ...prior.evaluation } }))).toThrow(/Terminal/);
  });
  it('competing refinements remain separate and no winning conjecture is manufactured', () => {
    const prior = createCorrectionAmendment(body()); const input = later(prior);
    input.evaluation.disposition = 'REFINED'; input.evaluation.evidenceRefs = ['evidence:refinement']; input.evaluation.refinementRefs = [prior.recordId];
    const left = createCorrectionAmendment({ ...input, mechanism: identity('conjecture:left') });
    const right = createCorrectionAmendment({ ...input, mechanism: identity('conjecture:right') });
    expect(appendCorrectionAmendment([prior, left], right).map(record => record.mechanism.ref)).toEqual(['conjecture:failure-mechanism', 'conjecture:left', 'conjecture:right']);
  });
  it('poisoned amendment cannot request validator promotion through the evidence contract', () => {
    const record = createCorrectionAmendment(body());
    expect(() => parseCorrectionAmendment({ ...record, promoteToValidator: true })).toThrow(/additional properties/);
    expect(() => parseCorrectionAmendment({ ...record, mechanism: identity('conjecture:poisoned') })).toThrow(/digest/);
    expect(AMENDMENT_DISPOSITIONS).toHaveLength(12);
  });
  it('matches the published schema', () => {
    expect(JSON.parse(readFileSync('packages/rosetta-schemas/docs/correction-amendment-v1.schema.json', 'utf8'))).toEqual(CORRECTION_AMENDMENT_SCHEMA);
  });
});
