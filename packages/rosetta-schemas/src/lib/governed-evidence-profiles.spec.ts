import { describe, expect, it } from 'vitest';
import { createDecisionRecord, parseDecisionRecord, resolveDecisionState, type DecisionRecord, type DecisionResolutionContext } from './decision-record.js';
import { createGovernanceModule, parseGovernanceModule, resolveGovernanceModule, verifyGovernanceModuleArtifact, type GovernanceModule, type GovernanceRegistryObservation } from './governance-module.js';
import { createBoundedQueryResult, parseBoundedQueryResult, queryAbsenceEvidence, unavailableQueryResponse, type BoundedQueryResult } from './bounded-query-result.js';
import { traceHash } from './trace-normalization.js';

const t1 = '2026-01-01T00:00:00.000Z', t2 = '2026-02-01T00:00:00.000Z', t3 = '2026-03-01T00:00:00.000Z';
function decision(n: string, overrides: Partial<Omit<DecisionRecord, 'recordId'>> = {}) {
  return createDecisionRecord({
    profile: { id: 'decision.record.v1', version: '1.0.0' },
    decisionRef: 'decision:' + n, versionRef: '1', locusRef: 'locus', controllerRef: 'owner', authorRef: 'author',
    ratification: { ratifierRef: 'ratifier', authorityRef: 'authority', evidenceRefs: ['ratification:' + n] },
    scopeRefs: ['global'], state: 'EFFECTIVE', clauses: [{ clauseRef: 'slot', propositionRef: 'value:' + n }],
    source: [{ identity: { ref: 'source:' + n, version: 'revision:1', cid: null }, lineageRef: 'lineage:' + n, locatorRef: 'span:1' }],
    time: { effectiveFrom: t1, effectiveUntil: null, observedAt: t1, recordedAt: t1 },
    relations: [], provenanceRefs: ['source:' + n], receiptRefs: [], ...overrides
  });
}
function context(records: DecisionRecord[], overrides: Partial<DecisionResolutionContext> = {}): DecisionResolutionContext {
  return { locusRef: 'locus', applicableScopeRefs: ['global'], effectiveAt: t3, knownAt: t3,
    ratifications: records.flatMap(r => r.ratification ? [{ recordRef: r.recordId, controllerRef: r.controllerRef, authorityRef: r.ratification.authorityRef, evidenceRef: r.ratification.evidenceRefs[0]! }] : []), ...overrides };
}
const later = { effectiveFrom: t2, effectiveUntil: null, observedAt: t2, recordedAt: t2 };
const values = (history: DecisionRecord[], c = context(history)) => resolveDecisionState(history, c).clauses.flatMap(slot => slot.alternatives.map(a => a.propositionRef)).sort();
const relation = (kind: DecisionRecord['relations'][number]['kind'], target: DecisionRecord, clauseRefs = ['slot']) => ({ kind, targetRecordRef: target.recordId, clauseRefs, evidenceRefs: ['relation:evidence'] });
describe('candidate decision effective-state projection #1875', () => {
  it('supersedes incompatible ratified history but preserves both revisions and order independence', () => {
    const a = decision('a'), b = decision('b', { time: later });
    const c = context([a,b]);
    expect(values([a,b],c)).toEqual(['value:b']);
    expect(resolveDecisionState([b,a],c)).toEqual(resolveDecisionState([a,b],c));
    expect(resolveDecisionState([a,b],c).historyRefs).toEqual([a.recordId,b.recordId].sort());
  });
  it('does not promote later proposal or assistant wording', () => {
    const a = decision('a'), b = decision('b', { time: later, state: 'PROPOSED', authorRef: 'assistant', ratification: null });
    expect(values([a,b])).toEqual(['value:a']);
  });
  it('retains independent additive clauses', () => {
    const a = decision('a'), b = decision('b', { time: later, clauses: [{ clauseRef: 'other', propositionRef: 'value:b' }], relations: [relation('ADDS',a)] });
    expect(values([a,b])).toEqual(['value:a','value:b']);
  });
  it('amends only a bounded clause, leaving the others intact', () => {
    const a = decision('a', { clauses: [{ clauseRef: 'slot', propositionRef: 'value:a' }, { clauseRef: 'other', propositionRef: 'untouched' }] });
    const b = decision('b', { time: later, relations: [relation('AMENDS',a)] });
    expect(values([a,b])).toEqual(['untouched','value:b']);
  });
  it('applies scoped exception only inside the owner-declared applicability', () => {
    const a = decision('a'), b = decision('b', { scopeRefs: ['local'], time: later, relations: [relation('EXCEPTS',a)] });
    expect(values([a,b])).toEqual(['value:a']);
    expect(values([a,b],context([a,b], { applicableScopeRefs: ['global','local'] }))).toEqual(['value:b']);
  });
  it('expires a temporary override and restores the base without a history rewrite', () => {
    const a = decision('a'), b = decision('b', { time: { ...later, effectiveUntil: t3 }, relations: [relation('TEMPORARILY_OVERRIDES',a)] });
    expect(values([a,b],context([a,b], { effectiveAt: t2 }))).toEqual(['value:b']);
    expect(values([a,b])).toEqual(['value:a']);
  });
  it('preserves peer-controller conflict and same-time alternatives', () => {
    const a = decision('a'), b = decision('b', { controllerRef: 'peer', time: later });
    expect(resolveDecisionState([a,b],context([a,b])).state).toBe('CONFLICT');
    expect(resolveDecisionState([a,decision('c')],context([a,decision('c')])).state).toBe('CONFLICT');
  });
  it('same proposition across unrelated scope cannot supersede', () => {
    const a = decision('a'), b = decision('b', { time: later, scopeRefs: ['unrelated'] });
    expect(values([a,b])).toEqual(['value:a']);
  });
  it('retains one witness lineage for repeated projections and rejects manufactured lineage', () => {
    const a = decision('a'), b = decision('b', { source: a.source, clauses: a.clauses });
    expect(resolveDecisionState([a,a,b],context([a,b])).sourceLineageRefs).toEqual(['lineage:a']);
    const bad = decision('b', { source: a.source.map(s => ({ ...s, lineageRef: 'fabricated' })) });
    expect(() => resolveDecisionState([a,bad],context([a,bad]))).toThrow(/lineage/);
  });
  it('records source retraction as an explicit invalidation rather than erasing history', () => {
    const a = decision('a'), b = decision('b', { time: later, clauses: [], relations: [relation('RETRACTS',a)] });
    const r = resolveDecisionState([a,b],context([a,b]));
    expect(r.clauses).toEqual([]);
    expect(r.invalidatedRecordRefs).toEqual([a.recordId]);
    expect(r.historyRefs).toHaveLength(2);
  });
  it('rejects unobserved ratification despite a self-declared accepted state', () => {
    const a = decision('a'), b = decision('b', { time: later, authorRef: 'assistant' });
    const r = resolveDecisionState([a,b],context([a]));
    expect(r.state).toBe('UNRESOLVED');
    expect(r.unresolvedRecordRefs).toEqual([b.recordId]);
    expect(values([a,b],context([a]))).toEqual(['value:a']);
  });
  it('reconstructs historical knowledge and refuses substituted evidence or partial relation effects', () => {
    const a = decision('a'), b = decision('b', { time: later, relations: [relation('AMENDS',a),relation('AMENDS',a,['missing'])] });
    expect(values([a,b])).toEqual(['value:a']);
    expect(resolveDecisionState([a,b],context([a,b])).state).toBe('UNRESOLVED');
    expect(values([a,b],context([a,b], { knownAt: t1 }))).toEqual(['value:a']);
    expect(() => parseDecisionRecord({ ...a, locusRef: 'changed' })).toThrow(/digest/);
  });
});
function moduleRecord(n: string, overrides: Partial<Omit<GovernanceModule,'recordId'>> = {}) {
  return createGovernanceModule({ profile: { id: 'governance.module.v1', version: '1.0.0' }, moduleRef: 'rules', title: 'Rules', ownerRef: 'owner', categoryRef: 'category', versionRef: n, revisionRef: 'revision:' + n,
    artifact: { ref: 'artifact:' + n, sha256: traceHash('body:' + n) }, disclosure: 'PUBLIC', opaqueBindingRef: null, state: 'CURRENT',
    supersedesRefs: [], replacedByRefs: [], dependencies: [], triggers: { topicRefs: ['topic'], operationRefs: [], eventRefs: [], applicabilityRefs: [] }, conformanceRefs: ['profile'], provenanceRefs: ['source'], receiptRefs: [], ...overrides });
}
const registry = (m: GovernanceModule, frontierRef = 'frontier:1'): GovernanceRegistryObservation => ({ frontierRef, current: [{ moduleRef: m.moduleRef, recordRef: m.recordId, ownerRef: m.ownerRef }] });
const loaded = (m: GovernanceModule, utf8: string) => ({ recordRef: m.recordId, revisionRef: m.revisionRef, utf8 });
describe('candidate governance registry #1876', () => {
  it('resolves one observed current version with immutable earlier records', () => {
    const a = moduleRecord('1'), b = moduleRecord('2', { supersedesRefs: [a.recordId] });
    expect(resolveGovernanceModule([a,b],registry(b),'rules')).toEqual({ state: 'RESOLVED', frontierRef: 'frontier:1', module: b });
    expect(parseGovernanceModule(a)).toEqual(a);
    expect(resolveGovernanceModule([a,b],{ frontierRef: 'f',current: [] },'rules').state).toBe('UNKNOWN');
  });
  it('rejects stale cache after the authoritative frontier changes and after restart', () => {
    const a = moduleRecord('1'), b = moduleRecord('2');
    expect(verifyGovernanceModuleArtifact([a,b],registry(a),'rules',loaded(a,'body:1'))).toBe(true);
    expect(verifyGovernanceModuleArtifact([a,b],registry(b,'frontier:2'),'rules',loaded(a,'body:1'))).toBe(false);
    expect(resolveGovernanceModule(JSON.parse(JSON.stringify([a,b])),registry(b),'rules')).toEqual(resolveGovernanceModule([a,b],registry(b),'rules'));
  });
  it('does not load a superseded or proposed record as current', () => {
    for (const state of ['SUPERSEDED','PROPOSED'] as const) {
      const a = moduleRecord('1',{ state, replacedByRefs: ['version:2'] });
      expect(resolveGovernanceModule([a],registry(a),'rules').state).toBe('MISMATCH');
    }
  });
  it('reports conflicting current observations rather than using version order', () => {
    const a = moduleRecord('1'), b = moduleRecord('2');
    const observed = { frontierRef:'f', current:[...registry(a).current,...registry(b).current] };
    expect(resolveGovernanceModule([a,b],observed,'rules').state).toBe('CONFLICT');
  });
  it('resolves protected artifact only through an opaque handle and refuses path substitution', () => {
    const a = moduleRecord('1',{ disclosure:'OPAQUE',opaqueBindingRef:'urn:opaque:binding',artifact:{ ref:'urn:opaque:binding',sha256:traceHash('body:1') } });
    expect(resolveGovernanceModule([a],registry(a),'rules')).toMatchObject({ state:'RESOLVED',module:{artifact:{ref:'urn:opaque:binding'}} });
    expect(() => moduleRecord('1',{ disclosure:'OPAQUE',opaqueBindingRef:'urn:opaque:binding',artifact:{ ref:'/local/rules',sha256:traceHash('body:1') } })).toThrow(/opaque/);
  });
  it('checks exact revision, actual bytes and digest against the observed owner', () => {
    const a = moduleRecord('1');
    expect(verifyGovernanceModuleArtifact([a],registry(a),'rules',loaded(a,'wrong'))).toBe(false);
    expect(verifyGovernanceModuleArtifact([a],registry(a),'rules',{...loaded(a,'body:1'),revisionRef:'wrong'})).toBe(false);
    expect(resolveGovernanceModule([a],{frontierRef:'f',current:[{...registry(a).current[0]!,ownerRef:'wrong'}]},'rules').state).toBe('MISMATCH');
  });
  it('requires the exact current prerequisite, blocking stale or absent dependency', () => {
    const dep = moduleRecord('1',{ moduleRef:'dependency' });
    const a = moduleRecord('1',{ dependencies:[{moduleRef:dep.moduleRef,recordRef:dep.recordId}] });
    expect(resolveGovernanceModule([a,dep],registry(a),'rules').state).toBe('BLOCKED');
    expect(resolveGovernanceModule([a,dep],{frontierRef:'f',current:[...registry(a).current,...registry(dep).current]},'rules').state).toBe('RESOLVED');
  });
  it('keeps metadata-only registry and one artifact shared by consumers', () => {
    const a = moduleRecord('1');
    expect(() => createGovernanceModule({ ...Object.fromEntries(Object.entries(a).filter(([k])=>k!=='recordId')), body:'duplicate rules' })).toThrow();
    for (const _consumer of ['consumer-a','consumer-b']) expect(verifyGovernanceModuleArtifact([a],registry(a),'rules',loaded(a,'body:1'))).toBe(true);
  });
});
function result(overrides: Partial<Omit<BoundedQueryResult,'recordId'>> = {}) {
  return createBoundedQueryResult({ profile:{id:'query.result.v1',version:'1.0.0'}, queryRef:'query:1',domainProfileRef:'domain:catalog',
    authority:{callerRef:'caller',purposeRef:'lookup',scopeRef:'scope',policyRef:'policy:1',admissionRef:'admission:1'},
    source:{identity:{ref:'source',version:'revision:1',cid:null},materializationRef:'view:1',frontierRef:'frontier:1'},
    bounds:{results:10,bytes:1000,tokens:null,traversals:100}, observed:{results:0,bytes:0,tokens:null,traversals:1},
    coverage:'COMPLETE',termination:'EXHAUSTED',candidates:[],continuation:null,currentness:'CURRENT_FOR_DECLARED_FRONTIER',replayRef:null,supersedesRefs:[],invalidationRefs:[],provenanceRefs:['source'],receiptRefs:[], ...overrides });
}
describe('candidate bounded query results #1877', () => {
  it('distinguishes complete empty from partial, unknown and stale evidence', () => {
    expect(queryAbsenceEvidence(result())).toBe('OBSERVED_EMPTY_COMPLETE');
    expect(queryAbsenceEvidence(result({coverage:'PARTIAL',termination:'RESULT_LIMIT'}))).toBe('NOT_ESTABLISHED');
    expect(queryAbsenceEvidence(result({coverage:'UNKNOWN',termination:'UNKNOWN',currentness:'UNKNOWN'}))).toBe('NOT_ESTABLISHED');
    expect(queryAbsenceEvidence(result({currentness:'STALE',invalidationRefs:['correction']}))).toBe('NOT_ESTABLISHED');
  });
  it('binds pagination to exact query, source, bounds and policy frontier', () => {
    const a = result();
    const continuation = { cursorRef:'cursor', queryRef:a.queryRef, frontierRef:a.source.frontierRef!, ...a.authority,domainProfileRef:a.domainProfileRef,sourceIdentity:a.source.identity,materializationRef:a.source.materializationRef,bounds:a.bounds };
    expect(result({coverage:'PARTIAL',termination:'RESULT_LIMIT',continuation}).continuation).toEqual(continuation);
    expect(() => result({coverage:'PARTIAL',termination:'RESULT_LIMIT',continuation:{...continuation,policyRef:'changed'}})).toThrow(/Continuation/);
    expect(() => result({coverage:'PARTIAL',termination:'RESULT_LIMIT',continuation:{...continuation,bounds:{...a.bounds,results:11}}})).toThrow(/Continuation/);
  });
  it('validates bounds and candidate counts, and uses two distinct domain profiles', () => {
    const candidate = { candidateRef:'candidate:1',sourceRef:'source',locatorRefs:['span:1'],matchBasisRef:'exact-id',evaluationRefs:[] };
    for (const domainProfileRef of ['domain:catalog','domain:decision']) expect(result({domainProfileRef,candidates:[candidate],observed:{results:1,bytes:50,tokens:null,traversals:1}}).candidates).toEqual([candidate]);
    expect(() => result({observed:{results:0,bytes:1001,tokens:null,traversals:1}})).toThrow(/bound/);
    expect(() => result({candidates:[candidate]})).toThrow(/count/);
  });
  it('does not disclose counts or candidate evidence in unavailable results; outward absence is uniform', () => {
    const a = result({coverage:'UNAVAILABLE',termination:'UNAVAILABLE',observed:{results:null,bytes:null,tokens:null,traversals:null},currentness:'UNKNOWN'});
    expect(queryAbsenceEvidence(a)).toBe('NOT_ESTABLISHED');
    expect(() => result({coverage:'UNAVAILABLE',termination:'UNAVAILABLE'})).toThrow(/disclose/);
    const deniedExisting = unavailableQueryResponse(), absentWithoutAuthority = unavailableQueryResponse();
    expect(JSON.stringify(deniedExisting)).toBe(JSON.stringify(absentWithoutAuthority));
    expect(deniedExisting).toEqual({ status:'unavailable' });
  });
  it('refuses inconsistent exhaustion or tampered result identity', () => {
    expect(() => result({coverage:'PARTIAL'})).toThrow(/Exhaustion/);
    expect(() => result({source:{identity:{ref:'s',version:null,cid:null},materializationRef:null,frontierRef:null}})).toThrow(/frontier/);
    expect(() => parseBoundedQueryResult({...result(),queryRef:'other'})).toThrow(/digest/);
  });
});
