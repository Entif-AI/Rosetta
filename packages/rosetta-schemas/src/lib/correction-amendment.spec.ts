import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createCorrectionAmendment, parseCorrectionAmendment, appendCorrectionAmendment, declaredAmendmentLineages, CORRECTION_AMENDMENT_SCHEMA, AMENDMENT_DISPOSITIONS, type CorrectionAmendment, type LocalAssessment, type LocalAdoption } from './correction-amendment.js';
import { createEvidenceIndependence, type EvidenceIndependenceAssessment } from './evidence-independence.js';

const identity = (ref: string) => ({ ref, version: 'v1', cid: null });
const profile = { id: 'correction.amendment.v1', version: '1.0.0' } as const;
const body = (): Omit<CorrectionAmendment, 'recordId'> => ({
  profile, kind: 'amendment', amendmentRef: 'amendment:1', predecessorRef: null, revisionKind: 'initial', observedAt: '2026-01-01T00:00:00Z',
  failureSubject: identity('artifact:failed'), correctedArtifact: identity('artifact:corrected'), mechanism: identity('conjecture:failure-mechanism'), affectedClasses: ['dependency'],
  applicability: { scopeRefs: ['scope:a', 'scope:b'], constraintRefs: ['constraint:initial'], contextRefs: ['context:1', 'context:2'] },
  uncertainty: { assessmentRef: null, unresolvedRefs: ['unknown:generalization'] },
  disclosure: { audience: 'local', supportPosture: 'reference-disclosed', policyRefs: ['policy:local'] },
  authentication: { state: 'verified', receiptRefs: ['receipt:signature'] },
  supportingSources: [{ source: identity('record:source'), lineageRef: 'root:1' }],
  provenanceRefs: ['receipt:provenance'], receiptRefs: ['receipt:assertion'], impactRefs: [], revalidationRefs: [], replacementRefs: []
});
const make = () => createCorrectionAmendment<CorrectionAmendment>(body());
const later = (prior: CorrectionAmendment): Omit<CorrectionAmendment, 'recordId'> => {
  const { recordId, ...previous } = prior;
  return { ...structuredClone(previous), predecessorRef: recordId, revisionKind: 'refinement', observedAt: '2026-01-03T00:00:00Z' };
};
const assessBody = (amendment: CorrectionAmendment, contextRef = 'context:1'): Omit<LocalAssessment, 'recordId'> => ({
  profile, kind: 'assessment', assessmentRef: 'assessment:' + contextRef, predecessorRef: null,
  amendmentRecordId: amendment.recordId, observedAt: '2026-01-04T00:00:00Z', actorRef: 'receiver:1', method: identity('method:local'), contextRef,
  applicability: 'applicable', evidenceRefs: ['evidence:local'], supportingSources: [
    { source: identity('record:a'), lineageRef: 'root:a' }, { source: identity('record:b'), lineageRef: 'root:b' }],
  independenceAssessmentRefs: [], challengeRefs: [], refinementRefs: [], uncertainty: { assessmentRef: null, unresolvedRefs: [] },
  reasonRefs: ['reason:local'], receiptRefs: ['receipt:local']
});
const adopt = (amendment: CorrectionAmendment, disposition: LocalAdoption['disposition'], assessment?: LocalAssessment) =>
  createCorrectionAmendment<LocalAdoption>({ profile, kind: 'adoption', adoptionRef: 'adoption:' + (assessment?.contextRef ?? 'context:1'),
    predecessorRef: null, amendmentRecordId: amendment.recordId, assessmentRecordId: assessment?.recordId ?? null,
    contextRef: assessment?.contextRef ?? 'context:1', observedAt: '2026-01-05T00:00:00Z', disposition,
    policyRefs: ['policy:local'], authorityRefs: ['authority:local'], reasonRefs: ['reason:adopt'], receiptRefs: [] });
const independentBody = (): Omit<EvidenceIndependenceAssessment, 'recordId' | 'outcome'> => ({
  profile: { id: 'evidence.independence.v1', version: '1.0.0' }, assessmentRef: 'comparison:1', supersedesRef: null, observedAt: '2026-01-02T00:00:00Z',
  methodRef: 'method:lineage', scope: { kind: 'pair', members: ['a', 'b'] }, subjects: ['a', 'b'].map(id => ({
    id, record: identity('record:' + id), manifestation: identity('manifestation:' + id), ancestry: 'complete', origin: 'original', evidenceRefs: ['evidence:' + id]
  })),
  edges: [], declarations: [{ members: ['a', 'b'], kind: 'independent-origins', evidenceRefs: ['evidence:method'] }],
  frontier: { ref: 'frontier:1', coverage: 'complete', unresolvedRefs: [], evidenceRefs: ['receipt:ancestry'] },
  explanationRefs: ['evidence:explanation'], correctionRefs: [], revalidationRefs: [], receiptRefs: ['receipt:comparison']
});

describe('correction amendment, assessment and adoption #1625', () => {
  it('valid repair does not prove the failure abstraction', () => {
    const a = make();
    const s = createCorrectionAmendment<LocalAssessment>({ ...assessBody(a), challengeRefs: ['challenge:overgeneralized'] });
    const d = adopt(a, 'LOCALLY_REFUTED', s);
    expect(appendCorrectionAmendment([a, s], d)).toEqual([a, s, d]);
    expect(a.correctedArtifact?.ref).toBe('artifact:corrected');
    expect(d.disposition).toBe('LOCALLY_REFUTED');
    expect(a.uncertainty.unresolvedRefs).toEqual(['unknown:generalization']);
    expect(a).not.toHaveProperty('disposition');
  });
  it('signed malicious amendments remain separately quarantinable', () => {
    const a = make(), d = adopt(a, 'QUARANTINED');
    expect(a.authentication.state).toBe('verified');
    expect(appendCorrectionAmendment([a], d)[1]).toEqual(d);
    expect(() => parseCorrectionAmendment({ ...a, approved: true })).toThrow(/additional properties/);
  });
  it('ten derivative copies cannot manufacture ten roots', () => {
    const a = createCorrectionAmendment<CorrectionAmendment>({ ...body(), supportingSources: Array.from({ length: 10 }, (_, i) => ({ source: identity('copy:' + i), lineageRef: 'root:1' })) });
    expect(declaredAmendmentLineages(a)).toEqual(['root:1']);
    const s = createCorrectionAmendment<LocalAssessment>({ ...assessBody(a), supportingSources: a.supportingSources });
    expect(() => appendCorrectionAmendment([a, s], adopt(a, 'LOCALLY_CORROBORATED', s))).toThrow(/independence closure/);
  });
  it('independent convergence requires the actual matching #1597 artifact', () => {
    const a = make(), independence = createEvidenceIndependence(independentBody());
    const s = createCorrectionAmendment<LocalAssessment>({ ...assessBody(a), independenceAssessmentRefs: [independence.recordId] });
    const d = adopt(a, 'LOCALLY_CORROBORATED', s);
    expect(independence.outcome).toBe('INDEPENDENT');
    expect(appendCorrectionAmendment([a, s], d, [independence])).toEqual([a,s,d]);
    expect(() => appendCorrectionAmendment([a, s], d)).toThrow(/independence closure/);
    const wrong = createCorrectionAmendment<LocalAssessment>({ ...assessBody(a), supportingSources: [{source: identity('record:unrelated'), lineageRef:'root:u'}, assessBody(a).supportingSources[1]], independenceAssessmentRefs:[independence.recordId] });
    expect(() => appendCorrectionAmendment([a, wrong], adopt(a,'LOCALLY_CORROBORATED',wrong), [independence])).toThrow(/independence closure/);
  });
  it('colluding declarations or a copied source preserve unknown rather than independent corroboration', () => {
    const a = make(), input = independentBody();
    input.declarations = []; input.subjects[1].origin = 'derived';
    input.edges = [{ descendant:'b', ancestor:'a', kind:'quotation', evidenceRefs:['receipt:copy'] }];
    const copied = createEvidenceIndependence(input);
    expect(copied.outcome).toBe('DERIVED_COPY');
    const s = createCorrectionAmendment<LocalAssessment>({ ...assessBody(a), independenceAssessmentRefs:[copied.recordId] });
    expect(appendCorrectionAmendment([a,s],adopt(a,'INSUFFICIENT_INDEPENDENT_EVIDENCE',s),[copied])[2]).toMatchObject({disposition:'INSUFFICIENT_INDEPENDENT_EVIDENCE'});
    expect(() => appendCorrectionAmendment([a,s],adopt(a,'LOCALLY_CORROBORATED',s),[copied])).toThrow(/independence closure/);
    expect(() => createCorrectionAmendment<LocalAssessment>({ ...assessBody(a), supportingSources:[...s.supportingSources,{source:identity('record:a'),lineageRef:'root:fake'}] })).toThrow(/second witness lineage/);
  });
  it('receipt-only narrower abstraction omits private source and cannot broaden context', () => {
    const prior = make(), nextBody = later(prior);
    nextBody.revisionKind = 'scope-narrowed'; nextBody.disclosure = {audience:'exchange',supportPosture:'receipt-only',policyRefs:['policy:exchange']};
    nextBody.supportingSources = []; nextBody.applicability.scopeRefs = ['scope:a'];
    nextBody.applicability.contextRefs = ['context:1'];
    const next = createCorrectionAmendment<CorrectionAmendment>(nextBody);
    expect(appendCorrectionAmendment([prior],next)).toEqual([prior,next]);
    expect(JSON.stringify(next)).not.toContain('record:source');
    expect(() => createCorrectionAmendment<CorrectionAmendment>({...nextBody,supportingSources:prior.supportingSources})).toThrow(/Receipt-only/);
    for (const contextRefs of [['context:foreign'], []]) {
      expect(() => appendCorrectionAmendment([prior],createCorrectionAmendment<CorrectionAmendment>({...nextBody,applicability:{...nextBody.applicability,contextRefs}}))).toThrow(/broaden/);
    }
    expect(() => createCorrectionAmendment<CorrectionAmendment>({...nextBody,predecessorRef:null})).toThrow(/predecessor/);
  });
  it('local contexts and their dispositions are independent records', () => {
    const a = make(), s1 = createCorrectionAmendment<LocalAssessment>({...assessBody(a),challengeRefs:['challenge:1']}),
      s2 = createCorrectionAmendment<LocalAssessment>({...assessBody(a,'context:2'),applicability:'inapplicable'});
    const d1 = adopt(a,'DISPUTED',s1), d2 = adopt(a,'INAPPLICABLE_LOCAL_CONTEXT',s2);
    expect(appendCorrectionAmendment([a,s1,d1,s2],d2)).toEqual([a,s1,d1,s2,d2]);
    const {recordId, ...adoptionBody} = d1;
    expect(recordId).toBe(d1.recordId);
    const substituted = createCorrectionAmendment<LocalAdoption>({...adoptionBody, assessmentRecordId:s2.recordId});
    expect(() => appendCorrectionAmendment([a,s1,s2],substituted)).toThrow();
  });
  it('terminal retraction preserves original envelope and historical adoption', () => {
    const a = make(), d = adopt(a,'RECEIVED_UNEVALUATED'), input = {...later(a),revisionKind:'retraction' as const};
    expect(() => createCorrectionAmendment<CorrectionAmendment>(input)).toThrow(/dependency impact/);
    const terminal = createCorrectionAmendment<CorrectionAmendment>({...input,impactRefs:['impact:1']});
    expect(appendCorrectionAmendment([a,d],terminal)).toEqual([a,d,terminal]);
    expect(() => appendCorrectionAmendment([a,terminal],createCorrectionAmendment<CorrectionAmendment>({...later(terminal),observedAt:'2026-01-06T00:00:00Z'}))).toThrow(/Terminal/);
  });
  it('competing refinements remain additive without selecting a winner', () => {
    const a=make(), left=createCorrectionAmendment<CorrectionAmendment>({...later(a),mechanism:identity('conjecture:left')}),right=createCorrectionAmendment<CorrectionAmendment>({...later(a),mechanism:identity('conjecture:right')});
    expect(appendCorrectionAmendment([a,left],right)).toEqual([a,left,right]);
  });
  it('poisoned amendment cannot grant deterministic promotion or alter digested evidence', () => {
    const a=make();
    expect(() => parseCorrectionAmendment({...a,promoteToValidator:true})).toThrow(/additional properties/);
    expect(() => parseCorrectionAmendment({...a,mechanism:identity('conjecture:poisoned')})).toThrow(/digest/);
    expect(AMENDMENT_DISPOSITIONS).toHaveLength(12);
  });
  it('matches the exported contract', () => {
    expect(JSON.parse(readFileSync('packages/rosetta-schemas/docs/correction-amendment-v1.schema.json','utf8'))).toEqual(CORRECTION_AMENDMENT_SCHEMA);
  });
});
