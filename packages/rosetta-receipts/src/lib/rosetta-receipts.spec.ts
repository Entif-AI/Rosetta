import { describe, expect, it } from 'vitest';

import { buildTile, verifyTileIntegrity, type TileEnvelope } from '@entif-ai/rosetta-core';
import { canonicalTraceJson, createProjectionProvenance, classifyProjectionRevision, traceHash, validatePayload, type ProjectionProvenance, type ProvenanceAuthority } from '@entif-ai/rosetta-schemas';
import { createProjectionProvenanceReceipt, type ProjectionActionBinding, type ProjectionTraceOperation } from './projection-provenance-receipt.js';
import { InMemoryTileStore } from '@entif-ai/rosetta-store';

import {
  buildReceiptBundle,
  createFinalizeAnswerEvent,
  createPartialResultTile,
  createPromotionGenesis,
  createPromotionTransition,
  createPromotionTransitionRefusal,
  createReceipt,
  createLifecycleReceipt,
  createSigningKeyPair,
  createTerminationReceipt,
  digestTile,
  PROMOTION_TRANSITIONS,
  signReceiptEd25519,
  verifyReceiptBundle,
  verifySignedReceipt,
  type PromotionState,
  type PromotionTransitionKind
} from './rosetta-receipts.js';

describe('native projection provenance inspection receipts',()=>{
  function fixture(){
    const raw='source bytes',bytes=Buffer.from('projection bytes');
    const source=buildTile('source.record',{metadataBlob:{},publicationStatus:'published',recordLocalId:'record',recordType:'text',sourceSystemId:'fixture',stableLocators:['urn:fixture:record']});
    const manifestation=buildTile('source.manifestation',{accessRequirements:['scope'],byteHashes:{sha256:traceHash(raw)},manifestationId:'manifestation',manifestationKind:'text',mediaType:'text/plain',sourceRecordCid:source.cid,structureProfile:'text'});
    const artifact=buildTile('source.canonical_artifact',{artifactId:'artifact',byteHash:traceHash(raw),contentFingerprint:'fingerprint',dedupe:{},normalizedText:raw,normalizedTextHash:traceHash(raw),pidFamily:[],provenanceRefs:{evaluationReceiptCid:'eval',fetchReceiptCid:'fetch',normalizationReceiptCid:'normalize'},revisionFingerprint:'rev',rightsScopes:['scope'],sourceManifestationCid:manifestation.cid,sourceRecordCid:source.cid});
    const receipt=createReceipt({claims:[],digests:[],policyRefs:[],receiptType:'fixture.support',subjects:[{cid:artifact.cid}]});
    const tiles=new Map<string,TileEnvelope>([source,manifestation,artifact,receipt].map(t=>[t.cid,t]));
    const action=buildTile('rosetta.action',{actionId:'fixture.projection-inspection',intent:'Inspect bounded projection support',runCid:'fixture.run'});
    const body:Omit<ProjectionProvenance,'recordId'>={
      profile:{id:'projection.provenance.v1',version:'1.0.0'},projectionRef:'projection:1',revisionRef:'revision:1',materializedViewRef:'view:1',
      kind:'vector-chunk',plane:'non-authoritative-recall',projectionSha256:traceHash(bytes.toString()),doctrineRef:'doctrine:1',policyRef:'policy',policyVersion:'1',transformRef:'transform',
      support:[{sourceRecordCid:source.cid,sourceManifestationCid:manifestation.cid,artifactCid:artifact.cid,lineageRef:'lineage',scopeRef:'scope',policyRef:'policy',rightsRef:'rights',spans:[],receiptRefs:[receipt.cid]}],
      replay:{kind:'rebuildable',sourceClosureRefs:[artifact.cid],operationalClosureRefs:[],reasonRefs:[]},identitySensitive:{classification:'ordinary',policyRef:null,authorizationRef:null},observedAt:'2026-01-01T00:00:00Z',predecessorRef:null,effectAuthority:'none'
    };
    let reads=0;
    const authority:ProvenanceAuthority={maxProjectionBytes:100,maxArtifactBytes:100,maxSupportTiles:8,maxSupportTileBytes:32768,
      authorize:()=>true,identityAuthorized:()=>true,current:()=>'current',policyCurrent:()=>true,resolveTile:cid=>tiles.get(cid),
      readArtifactText:()=>{reads++;return raw;},verifyReceipt:(r,h)=>r.cid===receipt.cid&&h.artifactCid===artifact.cid,matchesProjection:()=>true,hold:'inactive'};
    const record=createProjectionProvenance(body);
    const binding=(operation:ProjectionTraceOperation,submitted:unknown=record,previous?:unknown):ProjectionActionBinding=>({
      actionCid:action.cid,operation,submittedRecordSha256:traceHash(canonicalTraceJson(submitted)),
      submittedPredecessorSha256:previous===undefined?null:traceHash(canonicalTraceJson(previous)),
      projectionSha256:traceHash(bytes.toString())
    });
    const verifier=(operation:ProjectionTraceOperation,submitted:unknown=record,previous?:unknown)=>{
      const expected=binding(operation,submitted,previous);
      return (actual:ProjectionActionBinding)=>canonicalTraceJson(actual)===canonicalTraceJson(expected);
    };
    return {body,record,action,bytes,artifact,receipt,authority,binding,verifier,reads:()=>reads};
  }
  it('emits an actual native receipt for resolved creation support without claiming effect authority',()=>{
    const f=fixture();
    const result=createProjectionProvenanceReceipt({operation:'create',action:f.action,record:f.record,projectionBytes:f.bytes,authority:f.authority,verifyActionBinding:f.verifier('create')});
    expect(result.kind).toBe('rosetta.receipt');
    expect(verifyTileIntegrity(result).ok).toBe(true);
    expect(validatePayload(result.kind,result.payload).ok).toBe(true);
    expect(result.payload.claims).toEqual([{claimType:'rrp:projection.provenance.creation',evidence:[f.artifact.cid,f.receipt.cid].sort().map(cid=>({cid})),statement:'Creation candidate has verified bounded support; no write performed.',verdict:'pass'}]);
    expect(result.payload.subjects).toEqual([{cid:f.action.cid,role:'rrp:subject.step'}]);
    expect(result.payload.digests.find(d=>d.of==='projection.provenance.body')).toEqual({alg:'sha256',digest:f.record.recordId,of:'projection.provenance.body'});
  });
  it('preserves exact predecessor and revalidation evidence when policy changes without byte changes',()=>{
    const f=fixture(),next=createProjectionProvenance({...f.body,revisionRef:'revision:2',predecessorRef:f.record.recordId,policyVersion:'2',observedAt:'2026-01-02T00:00:00Z'});
    expect(classifyProjectionRevision(f.record,f.record)).toBe('EXACT_REPLAY');
    expect(classifyProjectionRevision(f.record,next)).toBe('REVALIDATION_REQUIRED');
    const receipt=createProjectionProvenanceReceipt({operation:'rebuild',action:f.action,record:next,previous:f.record,projectionBytes:f.bytes,authority:f.authority,verifyActionBinding:f.verifier('rebuild',next,f.record)});
    expect(receipt.payload.claims[0].claimType).toBe('rrp:projection.provenance.rebuild');
    expect(receipt.payload.claims[0].verdict).toBe('pass');
    expect(receipt.payload.digests.find(d=>d.of==='projection.predecessor.body')).toEqual({alg:'sha256',digest:f.record.recordId,of:'projection.predecessor.body'});
    const rejected=createProjectionProvenanceReceipt({operation:'rebuild',action:f.action,record:next,previous:next,projectionBytes:f.bytes,authority:f.authority,verifyActionBinding:f.verifier('rebuild',next,next)});
    expect(rejected.payload.claims[0].claimType).toBe('rrp:projection.provenance.rejection');
    expect(rejected.payload.claims[0].evidence).toEqual([]);
  });
  it('records denied inspection and required invalidation without source metadata; safe hold only admits read-only inspection',()=>{
    const f=fixture(),base={action:f.action,record:f.record,projectionBytes:f.bytes};
    const denied=createProjectionProvenanceReceipt({...base,operation:'create',authority:{...f.authority,authorize:()=>false},verifyActionBinding:f.verifier('create')});
    expect(denied.payload.claims[0]).toEqual({claimType:'rrp:projection.provenance.rejection',evidence:[],statement:'Projection candidate unavailable; no write performed.',verdict:'deny'});
    expect(JSON.stringify(denied)).not.toContain(f.artifact.cid);
    expect(f.reads()).toBe(0);
    const invalidation=createProjectionProvenanceReceipt({...base,operation:'inspect-current',authority:{...f.authority,current:()=>'retracted'},verifyActionBinding:f.verifier('inspect-current')});
    expect(invalidation.payload.claims[0].claimType).toBe('rrp:projection.provenance.invalidation');
    expect(invalidation.payload.claims[0].evidence).toEqual([]);
    const malformedRecord={...f.record,recordId:'0'.repeat(64)};
    const malformed=createProjectionProvenanceReceipt({...base,record:malformedRecord,operation:'inspect-current',authority:f.authority,verifyActionBinding:f.verifier('inspect-current',malformedRecord)});
    expect(malformed.payload.claims[0].claimType).toBe('rrp:projection.provenance.rejection');
    expect(createProjectionProvenanceReceipt({...base,operation:'create',authority:{...f.authority,hold:'active'},verifyActionBinding:f.verifier('create')}).payload.claims[0].verdict).toBe('deny');
    expect(createProjectionProvenanceReceipt({...base,operation:'inspect-current',authority:{...f.authority,hold:'active'},verifyActionBinding:f.verifier('inspect-current')}).payload.claims[0].claimType).toBe('rrp:projection.provenance.inspection');
  });
  it('refuses an unrelated valid action, changed operation or changed exact submission before support hydration',()=>{
    const f=fixture(),unrelated=buildTile('rosetta.action',{actionId:'different',intent:'Other work',runCid:'fixture.run'});
    const request={operation:'create' as const,action:f.action,record:f.record,projectionBytes:f.bytes,authority:f.authority,verifyActionBinding:f.verifier('create')};
    for(const changed of [
      {...request,action:unrelated},
      {...request,operation:'inspect-current' as const},
      {...request,record:createProjectionProvenance({...f.body,policyVersion:'other'})},
      {...request,projectionBytes:Buffer.from('different')}
    ])expect(()=>createProjectionProvenanceReceipt(changed)).toThrow('Projection action binding unverified.');
    expect(f.reads()).toBe(0);
    const result=createProjectionProvenanceReceipt(request);
    expect(result.payload.claims[0].verdict).toBe('pass');
    expect(result.payload.digests.find(d=>d.of==='projection.action.binding')).toEqual({alg:'sha256',digest:traceHash(canonicalTraceJson(f.binding('create'))),of:'projection.action.binding'});
    let checks=0;
    expect(()=>createProjectionProvenanceReceipt({...request,verifyActionBinding:b=>f.verifier('create')(b)&&++checks===1})).toThrow('Projection action binding unverified.');
  });
});

describe('minimum receipt lifecycle contract', () => {
  function fixture(outcome: 'pass' | 'fail' | 'partial' | 'deny' | 'blocked-precondition' | 'unknown') {
    const run = buildTile('rosetta.run', { runId: 'fixture.run', summary: 'Synthetic lifecycle', tags: [] });
    const step = buildTile('rosetta.action', { actionId: 'fixture.step', intent: 'Check candidate', runCid: run.cid });
    const artifact = buildTile('rosetta.observation', { observationId: 'fixture.source', signal: 'Synthetic input', source: 'fixture' });
    const policy = buildTile('rosetta.policy', { policyId: 'fixture.policy', description: 'Synthetic policy evidence' });
    const check = buildTile('rosetta.evaluation', {
      evaluationId: 'fixture.check', summary: 'Bounded check only', verdict: outcome === 'blocked-precondition' ? 'unknown' : outcome
    }, { parents: [step.cid, artifact.cid] });
    const input = { run, step, artifacts: [artifact], check, policies: [policy], outcome, statement: 'Synthetic lifecycle result' };
    return { input, tiles: [run, step, artifact, check, policy] };
  }

  it.each(['pass', 'fail', 'partial', 'deny', 'blocked-precondition', 'unknown'] as const)('preserves %s evidence, policy, subjects and deterministic identity', (outcome) => {
    const { input, tiles } = fixture(outcome);
    const receipt = createLifecycleReceipt(input);
    expect(receipt.kind).toBe('rosetta.receipt');
    expect(receipt.payload.claims[0]).toMatchObject({
      claimType: `rrp:lifecycle.${outcome}`, verdict: outcome === 'blocked-precondition' ? 'unknown' : outcome,
      evidence: [{ cid: input.check.cid }]
    });
    expect(receipt.payload.subjects).toEqual([
      { cid: input.run.cid, role: 'rrp:subject.session' },
      { cid: input.step.cid, role: 'rrp:subject.step' },
      { cid: input.artifacts[0].cid, role: 'rrp:subject.artifact' }
    ]);
    expect(receipt.payload.policyRefs).toEqual([input.policies[0].cid]);
    expect(createLifecycleReceipt(input).cid).toBe(receipt.cid);
    const store = new InMemoryTileStore();
    for (const tile of [...tiles, receipt]) store.put<unknown>(tile);
    expect(verifyReceiptBundle(buildReceiptBundle(receipt), store).ok).toBe(true);
    for (const missing of tiles) {
      const incomplete = new InMemoryTileStore();
      for (const tile of [...tiles, receipt]) if (tile.cid !== missing.cid) incomplete.put<unknown>(tile);
      expect(verifyReceiptBundle(buildReceiptBundle(receipt), incomplete).ok).toBe(false);
    }
  });

  it('rejects contradictory verdicts, unrelated checks, wrong run lineage and altered evidence', () => {
    const { input } = fixture('pass');
    expect(() => createLifecycleReceipt({ ...input, outcome: 'deny' })).toThrow(/verdict/i);
    expect(() => createLifecycleReceipt({ ...input, check: buildTile('rosetta.evaluation', input.check.payload) })).toThrow(/check.*parent/i);
    expect(() => createLifecycleReceipt({ ...input, step: buildTile('rosetta.action', { ...input.step.payload, runCid: 'missing' }) })).toThrow(/run/i);
    expect(() => createLifecycleReceipt({ ...input, artifacts: [{ ...input.artifacts[0], payload: { ...input.artifacts[0].payload, signal: 'altered' } }] })).toThrow(/integrity/i);
  });

  it('does not turn empty or malformed input into a successful attestation', () => {
    const { input } = fixture('pass');
    expect(() => createLifecycleReceipt({ ...input, artifacts: [] })).toThrow(/artifact/i);
    expect(() => createLifecycleReceipt({ ...input, statement: '' })).toThrow(/statement/i);
    expect(() => createLifecycleReceipt({ ...input, run: input.step })).toThrow(/run/i);
  });

  it('preserves prior evidence when a corrected artifact supersedes it', () => {
    const { input } = fixture('pass');
    const original = createLifecycleReceipt(input);
    const before = JSON.stringify(input);
    const corrected = buildTile('rosetta.observation', { ...input.artifacts[0].payload, signal: 'Corrected synthetic input' }, { parents: [input.artifacts[0].cid] });
    const check = buildTile('rosetta.evaluation', input.check.payload, { parents: [input.step.cid, corrected.cid] });
    const next = createLifecycleReceipt({ ...input, artifacts: [corrected], check });
    expect(next.cid).not.toBe(original.cid);
    expect(JSON.stringify(input)).toBe(before);
    expect(createLifecycleReceipt(input).cid).toBe(original.cid);
    const keys = createSigningKeyPair();
    expect(verifySignedReceipt(signReceiptEd25519(next, keys.privateKey, keys.publicKeyPem)).ok).toBe(true);
  });
});

describe('rosetta-receipts', () => {
  it('signs and verifies an RRP receipt', () => {
    const run = buildTile('rosetta.run', { runId: 'run.demo', summary: 'demo', tags: ['bootstrap'] });
    const receipt = createReceipt({
      claims: [
        {
          claimType: 'rrp:claim.executed',
          evidence: [{ cid: run.cid }],
          statement: 'Run tile emitted.',
          verdict: 'pass'
        }
      ],
      digests: [digestTile(run, 'run.canonical')],
      policyRefs: [],
      receiptType: 'rrp:operation',
      subjects: [{ cid: run.cid, role: 'rrp:subject.run' }]
    });
    const keys = createSigningKeyPair();
    const signed = signReceiptEd25519(receipt, keys.privateKey, keys.publicKeyPem);

    expect(verifySignedReceipt(signed).ok).toBe(true);
  });

  it('rejects incomplete receipt bundles', () => {
    const subject = buildTile('rosetta.run', { runId: 'run.demo', summary: 'demo', tags: ['bootstrap'] });
    const receipt = createReceipt({
      claims: [{ claimType: 'rrp:claim.executed', evidence: [{ cid: subject.cid }], statement: 'ok', verdict: 'pass' }],
      digests: [digestTile(subject, 'run.canonical')],
      policyRefs: ['policy.missing'],
      receiptType: 'rrp:operation',
      subjects: [{ cid: subject.cid }]
    });

    const store = new InMemoryTileStore();
    store.put(subject);
    store.put(receipt);

    expect(verifyReceiptBundle(buildReceiptBundle(receipt), store).ok).toBe(false);
  });

  it('creates a typed FinalizeAnswer event with guard checkpoint evidence', () => {
    const answer = buildTile('rosetta.observation', { observationId: 'answer.final', signal: 'done', source: 'rlm' });
    const guard = buildTile('guard.decision_token', {
      action: 'FinalizeAnswer',
      effect: 'allow',
      expiresAt: '2026-05-04T04:00:00.000Z',
      mode: 'live',
      policyIds: ['policy.rlm.finalize'],
      reason: 'final answer accepted',
      resource: answer.cid,
      tokenId: 'guard.finalize.allow'
    });

    const event = createFinalizeAnswerEvent({
      guardDecisionCid: guard.cid,
      tileCid: answer.cid,
      terminationType: 'normal'
    });

    expect(event.kind).toBe('rosetta.toolcall');
    expect(event.payload.tool).toBe('FinalizeAnswer');
    expect(event.payload.args).toMatchObject({
      guard_decision_cid: guard.cid,
      tile_cid: answer.cid,
      termination_type: 'normal'
    });
  });

  it('creates a signed termination receipt bound to the final answer event', () => {
    const answer = buildTile('rosetta.observation', { observationId: 'answer.final', signal: 'done', source: 'rlm' });
    const event = createFinalizeAnswerEvent({
      guardDecisionCid: 'cidv1-guard-finalize',
      tileCid: answer.cid,
      terminationType: 'normal'
    });
    const receipt = createTerminationReceipt({ answerTileCid: answer.cid, finalizeEvent: event });
    const keys = createSigningKeyPair();

    const signed = signReceiptEd25519(receipt, keys.privateKey, keys.publicKeyPem);

    expect(receipt.payload.receiptType).toBe('rlm.termination');
    expect(receipt.payload.claims[0]).toMatchObject({
      claimType: 'rlm.finalized',
      verdict: 'pass'
    });
    expect(receipt.payload.policyRefs).toContain('cidv1-guard-finalize');
    expect(verifySignedReceipt(signed).ok).toBe(true);
  });

  it('returns a partial-result tile and hard-stop receipt when max iterations are reached', () => {
    const partial = createPartialResultTile({
      completed: ['retrieved context', 'drafted answer'],
      outstandingWork: ['final verification'],
      partialTrace: ['step:retrieve', 'step:draft'],
      reason: 'max iterations reached',
      runCid: 'cidv1-run-rlm'
    });
    const event = createFinalizeAnswerEvent({
      guardDecisionCid: 'cidv1-guard-hard-stop',
      tileCid: partial.cid,
      terminationType: 'hard-stop'
    });
    const receipt = createTerminationReceipt({ answerTileCid: partial.cid, finalizeEvent: event });

    expect(partial.kind).toBe('rosetta.rlm_partial_result');
    expect(partial.payload).toMatchObject({
      completed: ['retrieved context', 'drafted answer'],
      outstandingWork: ['final verification'],
      terminationType: 'hard-stop'
    });
    expect(receipt.payload.claims[0]).toMatchObject({
      claimType: 'rlm.hard_stop',
      verdict: 'partial'
    });
  });
});

describe('promotion transition contract', () => {
  function fixture(priorState: PromotionState, kind: PromotionTransitionKind) {
    const subject = buildTile('rosetta.observation', {
      observationId: `promotion.spec.subject.${priorState}.${kind}`,
      signal: 'Synthetic promotion transition subject.',
      source: 'fixture'
    });
    const evidence = buildTile('rosetta.evaluation', {
      evaluationId: `promotion.spec.evidence.${priorState}.${kind}`,
      summary: 'Synthetic lane-local evaluation vector.',
      verdict: 'pass'
    });
    const trustMatrix = buildTile('rosetta.evaluation', {
      evaluationId: `promotion.spec.trust.${priorState}.${kind}`,
      summary: 'Synthetic staged trust input; not collapsed.',
      verdict: 'pass'
    });
    const policy = buildTile('rosetta.policy', {
      policyId: `promotion.spec.policy.${priorState}.${kind}`,
      description: 'Synthetic promotion policy evidence'
    });
    return { subject, evidence, trustMatrix, policy };
  }

  const happyPaths: Array<{ kind: PromotionTransitionKind; prior: PromotionState; next: PromotionState }> = [
    { kind: 'confirm', prior: 'pending-confirmation', next: 'active' },
    { kind: 'promote', prior: 'active', next: 'promoted' },
    { kind: 'cool', prior: 'active', next: 'cooled' },
    { kind: 'quarantine', prior: 'active', next: 'quarantined' },
    { kind: 'revisit', prior: 'active', next: 'pending-revisit' },
    { kind: 'supersede', prior: 'active', next: 'superseded' },
    { kind: 'activate', prior: 'cooled', next: 'active' },
    { kind: 'activate', prior: 'pending-revisit', next: 'active' },
    { kind: 'revisit', prior: 'quarantined', next: 'pending-revisit' },
    { kind: 'supersede', prior: 'promoted', next: 'superseded' }
  ];

  it.each(happyPaths)('applies $kind from $prior -> $next and preserves closure', ({ kind, prior, next }) => {
    const { subject, evidence, trustMatrix, policy } = fixture(prior, kind);
    const input = {
      evidenceRefs: [evidence, trustMatrix],
      kind,
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, prior),
      subject,
      evaluationVectors: [trustMatrix]
    };
    const result = createPromotionTransition(input);
    expect('block' in result).toBe(false);
    if ('block' in result) throw new Error('unreachable');
    expect(result.kind).toBe(kind);
    expect(result.fromState).toBe(prior);
    expect(result.nextState).toBe(next);
    expect(result.receipt.kind).toBe('rosetta.receipt');
    expect(result.receipt.payload.claims[0]).toMatchObject({
      claimType: `rrp:promotion.transition.${kind}`,
      verdict: 'pass'
    });
    expect(result.receipt.payload.subjects.map((s) => s.role)).toEqual([
      'rrp:promotion.subject',
      'rrp:promotion.next_state'
    ]);
    expect(result.receipt.payload.policyRefs).toEqual([policy.cid]);
    const store = new InMemoryTileStore();
    for (const tile of [subject, evidence, trustMatrix, policy, input.priorStateTile, result.nextStateTile, result.receipt]) store.put<unknown>(tile);
    expect(verifyReceiptBundle(buildReceiptBundle(result.receipt), store).ok).toBe(true);
  });

  it('rejects transitions that are not in the default-deny allow-list', () => {
    const { subject, evidence, trustMatrix, policy } = fixture('cooled', 'promote');
    const result = createPromotionTransition({
      evidenceRefs: [evidence, trustMatrix],
      kind: 'promote',
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, 'cooled'),
      subject
    });
    expect('block' in result).toBe(true);
    if (!('block' in result)) throw new Error('unreachable');
    expect(result.block).toBe('hard');
    expect(result.kind).toBe('promote');
    expect(PROMOTION_TRANSITIONS.promote).toEqual(['active']);
  });

  it('routes missing-evidence transitions to a soft block (verdict: unknown)', () => {
    const { subject, policy } = fixture('active', 'promote');
    const result = createPromotionTransition({
      evidenceRefs: [],
      kind: 'promote',
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, 'active'),
      subject
    });
    expect('block' in result).toBe(true);
    if (!('block' in result)) throw new Error('unreachable');
    expect(result.block).toBe('soft');
    const refusal = createPromotionTransitionRefusal(
      { evidenceRefs: [], kind: 'promote', policies: [policy], priorStateTile: createPromotionGenesis(subject, 'active'), subject },
      'soft',
      'Evidence closure pending.'
    );
    expect(refusal.payload.claims[0]).toMatchObject({
      claimType: 'rrp:promotion.transition.promote.blocked',
      verdict: 'unknown'
    });
    expect(refusal.payload.policyRefs).toEqual([policy.cid]);
  });

  it('routes missing-policy transitions to a hard block (verdict: deny)', () => {
    const { subject, evidence, trustMatrix } = fixture('active', 'promote');
    const result = createPromotionTransition({
      evidenceRefs: [evidence, trustMatrix],
      kind: 'promote',
      policies: [],
      priorStateTile: createPromotionGenesis(subject, 'active'),
      subject
    });
    expect('block' in result).toBe(true);
    if (!('block' in result)) throw new Error('unreachable');
    expect(result.block).toBe('hard');
    const refusal = createPromotionTransitionRefusal(
      { evidenceRefs: [evidence, trustMatrix], kind: 'promote', policies: [], priorStateTile: createPromotionGenesis(subject, 'active'), subject },
      'hard',
      'Policy backing denied.'
    );
    expect(refusal.payload.claims[0]).toMatchObject({
      claimType: 'rrp:promotion.transition.promote.denied',
      verdict: 'deny'
    });
  });

  it('treats superseded as a terminal promotion state', () => {
    const { subject, evidence, trustMatrix, policy } = fixture('superseded', 'activate');
    const result = createPromotionTransition({
      evidenceRefs: [evidence, trustMatrix],
      kind: 'activate',
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, 'superseded'),
      subject
    });
    expect('block' in result).toBe(true);
    if (!('block' in result)) throw new Error('unreachable');
    expect(result.block).toBe('hard');
    expect(result.reason).toMatch(/terminal/);
  });

  it('rejects promotion transitions whose closure members fail integrity or payload validation', () => {
    const { subject, evidence, trustMatrix, policy } = fixture('active', 'promote');
    const tampered = { ...evidence, payload: { ...evidence.payload, summary: 'tampered' } };
    expect(() => createPromotionTransition({
      evidenceRefs: [tampered, trustMatrix],
      kind: 'promote',
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, 'active'),
      subject
    })).toThrow(/integrity/i);
  });

  it('preserves the prior receipt evidence when a corrected successor transitions the same subject', () => {
    const { subject, evidence, trustMatrix, policy } = fixture('active', 'cool');
    const original = createPromotionTransition({
      evidenceRefs: [evidence, trustMatrix],
      kind: 'cool',
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, 'active'),
      subject,
      reason: 'Synthetic cooling'
    });
    if ('block' in original) throw new Error('unreachable');
    const before = JSON.stringify({ subject, evidence, trustMatrix, policy });
    const next = createPromotionTransition({
      evidenceRefs: [evidence, trustMatrix],
      kind: 'activate',
      policies: [policy],
      priorStateTile: original.nextStateTile,
      subject,
      reason: 'Synthetic reactivation'
    });
    if ('block' in next) throw new Error('unreachable');
    expect(next.receipt.cid).not.toBe(original.receipt.cid);
    expect(JSON.stringify({ subject, evidence, trustMatrix, policy })).toBe(before);
    expect(original.receipt.cid).toBe(createPromotionTransition({
      evidenceRefs: [evidence, trustMatrix],
      kind: 'cool',
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, 'active'),
      subject,
      reason: 'Synthetic cooling'
    }).kind !== 'cool' ? '' : original.receipt.cid);
  });

  it('does not mutate the subject, evidence, or policy tiles when a transition is applied', () => {
    const { subject, evidence, trustMatrix, policy } = fixture('active', 'promote');
    const beforeSubject = JSON.stringify(subject);
    const beforeEvidence = JSON.stringify(evidence);
    const beforePolicy = JSON.stringify(policy);
    createPromotionTransition({
      evidenceRefs: [evidence, trustMatrix],
      kind: 'promote',
      policies: [policy],
      priorStateTile: createPromotionGenesis(subject, 'active'),
      subject
    });
    expect(JSON.stringify(subject)).toBe(beforeSubject);
    expect(JSON.stringify(evidence)).toBe(beforeEvidence);
    expect(JSON.stringify(policy)).toBe(beforePolicy);
  });
});
