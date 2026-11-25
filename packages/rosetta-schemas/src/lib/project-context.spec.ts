import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createProjectContextRecord as create, parseProjectContextRecord as parse, materializeProjectMembership as membership, inspectProjectContext as inspect, inspectProjectAuthorityBinding, PROJECT_CONTEXT_SCHEMA } from './project-context.js';
import { parseAuthorityEnvelope } from './authority-envelope.js';

const t0 = '2026-01-01T00:00:00Z', t1 = '2026-02-01T00:00:00Z', t2 = '2026-03-01T00:00:00Z', t3 = '2026-04-01T00:00:00Z';
const valid = (from = t0, until: string | null = null) => ({ kind: 'known', from, until });
const base = (subjectRef: string) => ({ profile: { id: 'project.context.v1', version: '1.0.0' }, subjectRef, supersedesRef: null, revisionKind: 'initial', correctsRef: null, observedAt: t0, validTime: valid(), provenanceRefs: ['source:1'], receiptRefs: [], correctionRefs: [] });
const project = (ref: string, fields: Record<string, unknown> = {}) => create({ ...base(ref), kind: 'project', projectClass: 'research-project', title: 'Research', description: '', status: 'active', startAt: t0, endAt: null, objectiveRefs: ['objective:1'], partyRefs: ['party:1'], roleAssignmentRefs: ['role:1'], phaseRefs: ['phase:1'], milestoneRefs: [], policyRefs: ['policy:1'], workRefs: ['work:1','work:2'], interactionRefs: ['interaction:1'], feedbackRefs: ['feedback:1'], ...fields });
const product = (ref: string, fields: Record<string, unknown> = {}) => create({ ...base(ref), kind: 'product', productKind: 'document', artifact: { ref: 'artifact:' + ref, version: 'v1', cid: null }, status: 'available', createdAt: t0, publishedAt: t1, producerRefs: ['party:1'], workRefs: ['work:1'], sourceRefs: ['source:1'], dependencyRefs: [], rightsRefs: ['rights:1'], licensingRefs: [], disclosureRefs: ['disclosure:1'], ...fields });
const edge = (ref: string, relation: string, sourceRef: string, targetRef: string, fields: Record<string, unknown> = {}) => create({ ...base(ref), kind: 'relation', relation, sourceRef, targetRef, role: null, originWorkRef: null, rationaleRefs: ['evidence:1'], disposition: 'asserted', ...fields });
const revise = (record: ReturnType<typeof create>, fields: Record<string, unknown>) => { const {recordId,...body} = record; return create({...body, supersedesRef: recordId, revisionKind:'effective-change', correctsRef:null, observedAt: t2, validTime:valid(t2), ...fields}); };
const correct = (head: ReturnType<typeof create>, target: ReturnType<typeof create>, fields: Record<string, unknown>) => {
  const {recordId: targetId,...body} = target;
  return create({...body, supersedesRef:head.recordId, revisionKind:'correction', correctsRef:targetId, correctionRefs:['correction:1'], observedAt:t3,...fields});
};
const cut = (validAt = t1, observedThrough = t3) => ({validAt, observedThrough, coverage: 'complete' as const});

describe('proposed project-context record family', () => {
  it('keeps durable project, work, artifact and product-use roles distinct', () => {
    const p = project('project:research'), q = project('project:software', {projectClass:'software-project'});
    const paper = product('product:paper'), dataset = product('product:data',{productKind:'dataset'});
    const code = product('product:code',{productKind:'software'}), tests = product('product:tests',{productKind:'artifact'}), release = product('product:release',{productKind:'artifact'});
    const uses = [
      edge('edge:paper','used_by','product:paper','project:research',{role:'deliverable'}),
      edge('edge:data','by_product','project:research','product:data',{originWorkRef:'work:2'}),
      edge('edge:reuse','used_by','product:data','project:software',{role:'input'}),
      edge('edge:evidence','used_by','product:data','project:research',{role:'evidence'}),
      edge('edge:code','produces','project:software','product:code'),
      edge('edge:tests','produces','project:software','product:tests'),
      edge('edge:release','produces','project:software','product:release'),
      edge('edge:seed','seeded','product:data','project:software')
    ];
    expect(inspect([p,q,paper,dataset,code,tests,release,...uses],cut()).records.map(r=>r.subjectRef)).toEqual(['project:research','project:software','product:paper','product:data','product:code','product:tests','product:release','edge:paper','edge:data','edge:reuse','edge:evidence','edge:code','edge:tests','edge:release','edge:seed']);
    expect(uses[2]).toMatchObject({sourceRef:'product:data',role:'input'});
    expect(uses[3]).toMatchObject({sourceRef:'product:data',role:'evidence'});
    expect(p).toMatchObject({workRefs:['work:1','work:2'],roleAssignmentRefs:['role:1'],interactionRefs:['interaction:1'],feedbackRefs:['feedback:1']});
    expect(membership([p,q,paper,dataset,...uses],cut())).toEqual({coverage:'declared-complete',parents:[]});
  });
  it('reconstructs reparenting at exact half-open validity and observation frontiers', () => {
    const p1=project('project:p1'),p2=project('project:p2'),child=project('project:child');
    const old=edge('membership:one','membership','project:child','project:p1');
    const closed=revise(old,{validTime:valid(t1),disposition:'withdrawn'});
    const moved=edge('membership:two','membership','project:child','project:p2',{observedAt:t2,validTime:valid(t1)});
    const history=[p1,p2,child,old,closed,moved];
    expect(membership(history,cut(t1,t0))).toEqual({coverage:'declared-complete',parents:[{childRef:'project:child',parentRef:'project:p1',relationRecordRef:old.recordId}]});
    expect(membership(history,cut(t0,t2)).parents).toEqual([{childRef:'project:child',parentRef:'project:p1',relationRecordRef:old.recordId}]);
    expect(membership(history,cut(t1,t2)).parents).toEqual([{childRef:'project:child',parentRef:'project:p2',relationRecordRef:moved.recordId}]);
    expect(inspect(history,cut(t1,t0)).records.find(r=>r.subjectRef==='membership:one')).toEqual(old);
    expect(()=>membership([p1,p2,child,old,moved],cut(t1,t2))).toThrow('Competing current membership parents');
    expect(()=>membership([p1,p2,child,old,revise(old,{targetRef:'project:p2'})],cut(t1,t2))).toThrow('Relation identity cannot change');
  });
  it('keeps correction, pause/restart and product availability additive', () => {
    const p=project('project:p'), v1=product('product:paper');
    const pause=revise(p,{status:'paused',roleAssignmentRefs:['role:2']});
    const restart=revise(pause,{observedAt:t3,validTime:valid(t3),status:'active'});
    const t4='2026-05-01T00:00:00Z';
    const ended=revise(restart,{observedAt:t4,validTime:valid(t4),status:'ended',endAt:t4});
    const v2=revise(v1,{observedAt:t2,validTime:valid(t2),artifact:{ref:'artifact:product:paper',version:'v2',cid:null}});
    const history=[p,v1,pause,v2,restart,ended];
    expect(inspect(history,cut(t0,t0)).records).toEqual([p,v1]);
    expect(inspect(history,cut(t2,t2)).records).toEqual([pause,v2]);
    expect(inspect(history,cut(t2,t4)).records).toEqual([pause,v2]);
    expect(inspect(history,cut(t1,t4)).records).toEqual([p,v1]);
    expect(inspect(history,cut(t3,t4)).records).toEqual([restart,v2]);
    expect(inspect(history,cut(t4,t4)).records).toEqual([ended,v2]);
    expect(()=>inspect([p,pause,revise(p,{status:'ended'})],cut())).toThrow('Missing or competing');
    expect(()=>inspect([pause],cut())).toThrow('Missing or competing');
    expect(inspect([p,p],cut(t0,t0)).records).toEqual([p]);
  });
  it('distinguishes prospective withdrawal from retrospective correction, including correction of a non-head segment', () => {
    const a=project('a'),b=project('b'),ab=edge('ab','membership','a','b');
    const withdrawal=revise(ab,{disposition:'withdrawn',validTime:valid(t2)});
    const correction=correct(withdrawal,ab,{validTime:valid(t0,t1)});
    const history=[a,b,ab,withdrawal,correction];
    expect(membership(history,cut(t1,t2))).toEqual({coverage:'declared-complete',parents:[{childRef:'a',parentRef:'b',relationRecordRef:ab.recordId}]});
    expect(membership(history,cut(t2,t2))).toEqual({coverage:'declared-complete',parents:[]});
    expect(membership(history,cut(t1,t3))).toEqual({coverage:'declared-complete',parents:[]});
    expect(membership(history,cut(t0,t3))).toEqual({coverage:'declared-complete',parents:[{childRef:'a',parentRef:'b',relationRecordRef:correction.recordId}]});
    expect(membership(history,cut(t2,t3))).toEqual({coverage:'declared-complete',parents:[]});
    expect(()=>membership([...history,correct(correction,ab,{observedAt:'2026-05-01T00:00:00Z'})],cut(t1,'2026-05-02T00:00:00Z'))).toThrow('exact visible segment');
  });
  it('keeps nested membership stable across rename, and refuses unknown temporal state', () => {
    const a=project('a'),b=project('b'),c=project('c');
    const ab=edge('ab','membership','a','b'),bc=edge('bc','membership','b','c');
    const renamed=revise(b,{title:'Renamed project',validTime:valid(t2)});
    expect(membership([a,b,c,ab,bc,renamed],cut(t2,t3))).toEqual({coverage:'declared-complete',parents:[
      {childRef:'a',parentRef:'b',relationRecordRef:ab.recordId},{childRef:'b',parentRef:'c',relationRecordRef:bc.recordId}
    ]});
    const unresolved=correct(renamed,b,{validTime:{kind:'unknown',from:null,until:null}});
    expect(inspect([a,b,c,ab,bc,renamed,unresolved],cut(t1,t3)).unresolvedSubjectRefs).toEqual(['b']);
    expect(membership([a,b,c,ab,bc,renamed,unresolved],cut(t1,t3))).toEqual({coverage:'unknown',parents:[]});
  });
  it('composes exact project revision, role and policy evidence without inferring inherited grants', () => {
    const envelope=parseAuthorityEnvelope(JSON.parse(readFileSync('packages/rosetta-schemas/fixtures/authz-v1.json','utf8')).parent);
    envelope.scope.target.resourceRef='project:p';
    envelope.delegation.ceiling.target.resourceRef='project:p';
    envelope.validity.notBefore=t0; envelope.validity.expiresAt=t3;
    envelope.provenance.compiledAt=t0;
    envelope.provenance.sourceRefs.push('role:1');
    const p=project('project:p',{policyRefs:[envelope.policy.ref]}), child=project('project:child',{policyRefs:[envelope.policy.ref]});
    const relation=edge('membership:child','membership','project:child','project:p');
    const input={projectRef:p.subjectRef,projectRecordRef:p.recordId,roleAssignmentRef:'role:1',scope:envelope.scope,
      policy:envelope.policy,sourceFrontierRef:envelope.provenance.sourceFrontierRef,envelope};
    const history=[p,child,relation];
    expect(inspectProjectAuthorityBinding(history,cut(),input)).toBe('STRUCTURALLY_MATCHED');
    expect(inspectProjectAuthorityBinding(history,cut(),{...input,projectRef:child.subjectRef,projectRecordRef:child.recordId})).toBe('UNRESOLVED');
    expect(inspectProjectAuthorityBinding(history,cut(),{...input,sourceFrontierRef:'stale'})).toBe('UNRESOLVED');
    expect(inspectProjectAuthorityBinding(history,cut(),{...input,policy:{...input.policy,frontierRef:'stale'}})).toBe('UNRESOLVED');
    expect(inspectProjectAuthorityBinding(history,cut(t1,t1),{...input,envelope:{...envelope,provenance:{...envelope.provenance,compiledAt:t2}}})).toBe('UNRESOLVED');
    expect(inspectProjectAuthorityBinding(history,cut(t3,t3),input)).toBe('UNRESOLVED');
    expect(inspectProjectAuthorityBinding(history,{...cut(),coverage:'partial'},input)).toBe('UNRESOLVED');
    const newRole=revise(p,{roleAssignmentRefs:['role:2']});
    expect(inspectProjectAuthorityBinding([...history,newRole],cut(t2,t3),input)).toBe('UNRESOLVED');
    expect(inspectProjectAuthorityBinding([...history,newRole],cut(t1,t3),input)).toBe('STRUCTURALLY_MATCHED');
  });
  it('fails on malformed or cyclic membership and preserves unknown coverage', () => {
    const a=project('a'),b=project('b'),c=project('c');
    expect(()=>membership([a,b,c,edge('ab','membership','a','b'),edge('bc','membership','b','c'),edge('ca','membership','c','a')],cut())).toThrow('Cyclic project membership');
    expect(()=>edge('aa','membership','a','a')).toThrow('Reflexive');
    expect(()=>edge('ab','membership','a','b',{validTime:valid(t1,t1)})).toThrow('Invalid half-open');
    expect(membership([a,edge('missing','membership','a','b')],cut())).toEqual({coverage:'unknown',parents:[]});
    expect(membership([a,b,edge('unknown','membership','a','b',{validTime:{kind:'unknown',from:null,until:null}})],cut())).toEqual({coverage:'unknown',parents:[]});
    expect(membership([a,b],{...cut(),coverage:'partial'})).toEqual({coverage:'unknown',parents:[]});
    expect(membership([a,b,edge('ab','depends_on','a','b'),edge('ba','related_to','b','a')],cut())).toEqual({coverage:'declared-complete',parents:[]});
  });
  it('rejects altered bytes, scope authority fields and malformed versions', () => {
    const p=project('project:p'),d=product('product:p');
    expect(()=>parse({...p,title:'Changed'})).toThrow('digest mismatch');
    expect(()=>project('project:p',{allowed:true})).toThrow('Invalid evidence contract');
    expect(()=>product('product:p',{artifact:{ref:'artifact:p',version:null,cid:null}})).toThrow('attributable');
    expect(()=>edge('x','by_product','p','q')).toThrow('originating bounded work');
    expect(()=>edge('x','used_by','p','q')).toThrow('explicit product role');
    expect(()=>parse({...d,profile:{id:'project.context.v1',version:'2.0.0'}})).toThrow('Invalid evidence contract');
    const parsed=parse(p); parsed.provenanceRefs.push('mutated');
    expect(parse(p).provenanceRefs).toEqual(['source:1']);
  });
  it('publishes the exact executable schema', () => {
    expect(JSON.parse(readFileSync(new URL('../../docs/project-context-v1.schema.json',import.meta.url),'utf8'))).toEqual(PROJECT_CONTEXT_SCHEMA);
  });
});
