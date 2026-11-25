import { describe, expect, it } from 'vitest';
import { buildTile, createSourceObservation, type TileEnvelope } from '@entif-ai/rosetta-core';
import { traceHash } from './trace-normalization.js';
import { createProjectionProvenance, inspectProjectionProvenance, type ProjectionProvenance, type ProvenanceAuthority } from './projection-provenance.js';

function fixture() {
  const raw = 'a😺b'; const bytes = Buffer.from('projection');
  const source = buildTile('source.record', { metadataBlob: {}, publicationStatus: 'published', recordLocalId: 'record1', recordType: 'text', sourceSystemId: 'test', stableLocators: ['urn:test:record'] });
  const manifest = buildTile('source.manifestation', { accessRequirements: ['scope'], byteHashes: { sha256: traceHash(raw) }, manifestationId: 'manifest1', manifestationKind: 'text', mediaType: 'text/plain', sourceRecordCid: source.cid, structureProfile: 'text' });
  const artifact = buildTile('source.canonical_artifact', { artifactId: 'artifact1', byteHash: traceHash(raw), contentFingerprint: 'content', dedupe: {}, normalizedText: raw, normalizedTextHash: traceHash(raw), pidFamily: [], provenanceRefs: { evaluationReceiptCid: 'evaluation', fetchReceiptCid: 'fetch', normalizationReceiptCid: 'normalization' }, revisionFingerprint: 'rev1', rightsScopes: ['scope'], sourceManifestationCid: manifest.cid, sourceRecordCid: source.cid });
  const span = { sourceRecordCid: source.cid, sourceManifestationCid: manifest.cid, startOffset: 1, endOffset: 3, textHash: traceHash('😺') };
  const observation = createSourceObservation('test', '😺', [span], [artifact.cid]);
  const receipt = buildTile('rosetta.receipt', { claims: [], digests: [], policyRefs: ['policy'], receiptType: 'support', subjects: [{cid:artifact.cid}] });
  const tiles = new Map<string, TileEnvelope>([source,manifest,artifact,observation,receipt].map(t=>[t.cid,t]));
  const handle = { sourceRecordCid: source.cid, sourceManifestationCid: manifest.cid, artifactCid: artifact.cid, lineageRef: 'lineage:1', scopeRef: 'scope', policyRef: 'policy', rightsRef: 'right', spans: [{ observationCid: observation.cid, span, offsetUnit: 'utf16-code-unit' as const }], receiptRefs: [receipt.cid] };
  const body: Omit<ProjectionProvenance,'recordId'> = { profile: { id: 'projection.provenance.v1', version: '1.0.0' }, projectionRef: 'projection', revisionRef: 'revision', materializedViewRef: 'view', kind: 'vector-chunk', plane: 'non-authoritative-recall', projectionSha256: traceHash('projection'), doctrineRef: 'doctrine', policyRef: 'policy', policyVersion: '1', transformRef: 'transform', support: [handle], replay: { kind: 'rebuildable', sourceClosureRefs: [artifact.cid], operationalClosureRefs: [], reasonRefs: [] }, identitySensitive: { classification: 'ordinary', policyRef: null, authorizationRef: null }, observedAt: '2026-11-25T10:00:00Z', predecessorRef: null, effectAuthority: 'none' };
  let lookups=0,rawReads=0;
  const authority: ProvenanceAuthority = { maxArtifactBytes: 100, maxProjectionBytes: 100, maxSupportTiles: 20, maxSupportTileBytes: 32768, authorize: ()=>true, identityAuthorized: ()=>true, current: ()=>'current', policyCurrent: ()=>true, resolveTile: cid=>{lookups++;return tiles.get(cid);}, readArtifactText: (_cid,remaining)=>{rawReads++;return Buffer.byteLength(raw)<=remaining?raw:undefined;}, verifyReceipt: (r,h)=>r.cid===receipt.cid&&h.artifactCid===artifact.cid, matchesProjection: ()=>true, hold: 'inactive' };
  return { body, authority, bytes, artifact, observation, receipt, tiles, manifest, lookups:()=>lookups,rawReads:()=>rawReads };
}
describe('projection provenance fixture contract',()=>{
  it('resolves exact native source, observation slice and receipt for each declared plane',()=>{
    const f=fixture();
    const kinds: [ProjectionProvenance['kind'],ProjectionProvenance['plane']][] = [['vector-chunk','non-authoritative-recall'],['temporal-edge','temporal-projection'],['salience-score','activation'],['tag-summary','truth-support'],['lexical-shadow','non-authoritative-recall']];
    for(const [kind,plane] of kinds) expect(inspectProjectionProvenance(createProjectionProvenance({...f.body,kind,plane}),f.bytes,f.authority)).toEqual({status:'RESOLVED',support:[{lineageRef:'lineage:1',artifactCid:f.artifact.cid,spans:[{observationCid:f.observation.cid,text:'😺'}],receiptRefs:[f.receipt.cid]}],lineageRefs:['lineage:1'],plane,writeRoute:'WRITE_ADMISSION_REQUIRED'});
  });
  it('checks every constituent before storage, including denied mixed scopes',()=>{
    const f=fixture();const record=createProjectionProvenance({...f.body,support:[...f.body.support,{...f.body.support[0],scopeRef:'hidden'}]});
    expect(inspectProjectionProvenance(record,f.bytes,{...f.authority,authorize:h=>h.scopeRef!=='hidden'})).toEqual({status:'UNAVAILABLE',support:null});expect(f.lookups()).toBe(0);
  });
  it('uniformly fences every unavailable lifecycle state before storage',()=>{
    const f=fixture();const record=createProjectionProvenance(f.body);
    for(const state of ['corrected','retracted','access-lost','deleted','retention-expired','cold-unavailable','conflict','unknown'] as const) expect(inspectProjectionProvenance(record,f.bytes,{...f.authority,current:()=>state})).toEqual({status:'UNAVAILABLE',support:null});
    expect(f.lookups()).toBe(0);
  });
  it('refuses changed source bytes, projection bytes, false receipt, late revocation and over-budget text',()=>{
    const f=fixture();const r=createProjectionProvenance(f.body); const deny={status:'UNAVAILABLE',support:null};
    expect(inspectProjectionProvenance(r,f.bytes,{...f.authority,readArtifactText:()=> 'a😺c'})).toEqual(deny);
    expect(inspectProjectionProvenance(r,Buffer.from('other'),f.authority)).toEqual(deny);
    expect(inspectProjectionProvenance(r,f.bytes,{...f.authority,verifyReceipt:()=>false})).toEqual(deny);
    let count=0; expect(inspectProjectionProvenance(r,f.bytes,{...f.authority,authorize:()=>++count===1})).toEqual(deny);
    expect(inspectProjectionProvenance(r,f.bytes,{...f.authority,maxArtifactBytes:1})).toEqual(deny);
  });
  it('separates safe hold, identity-sensitive authorization and plane authority',()=>{
    const f=fixture();const r=createProjectionProvenance(f.body);
    expect(inspectProjectionProvenance(r,f.bytes,{...f.authority,hold:'active'})).toMatchObject({status:'RESOLVED',writeRoute:'SAFE_HOLD'});
    const sensitive=createProjectionProvenance({...f.body,identitySensitive:{classification:'sensitive',policyRef:'policy',authorizationRef:'permit'}});
    expect(inspectProjectionProvenance(sensitive,f.bytes,{...f.authority,identityAuthorized:()=>false})).toEqual({status:'UNAVAILABLE',support:null});
    expect(()=>createProjectionProvenance({...f.body,plane:'truth-support'})).toThrow('Projection cannot change plane authority.');
    expect(()=>createProjectionProvenance({...f.body,replay:{...f.body.replay,sourceClosureRefs:[]}})).toThrow('Missing declared rebuild closure.');
  });
  it('rejects native rights mismatch before any constituent raw hydration even with a permissive handle verifier',()=>{
    const f=fixture();
    const inconsistent=buildTile('source.canonical_artifact',{...f.artifact.payload,rightsScopes:['restricted']});
    f.tiles.set(inconsistent.cid,inconsistent);
    const support=[f.body.support[0],{...f.body.support[0],artifactCid:inconsistent.cid}];
    const r=createProjectionProvenance({...f.body,support,replay:{...f.body.replay,sourceClosureRefs:[f.artifact.cid,inconsistent.cid]}});
    expect(inspectProjectionProvenance(r,f.bytes,f.authority)).toEqual({status:'UNAVAILABLE',support:null});
    expect(f.rawReads()).toBe(0);
    const forged=createProjectionProvenance({...f.body,support:[{...f.body.support[0],scopeRef:'ungranted'}]});
    expect(inspectProjectionProvenance(forged,f.bytes,f.authority)).toEqual({status:'UNAVAILABLE',support:null});
    expect(f.rawReads()).toBe(0);
  });
  it('never rebinds a real span or receipt to a same-byte different canonical artifact version',()=>{
    const f=fixture();
    const second=buildTile('source.canonical_artifact',{...f.artifact.payload,revisionFingerprint:'rev2'});
    f.tiles.set(second.cid,second);
    const h={...f.body.support[0],artifactCid:second.cid};
    const body={...f.body,replay:{...f.body.replay,sourceClosureRefs:[second.cid]}};
    const deny={status:'UNAVAILABLE',support:null};
    expect(inspectProjectionProvenance(createProjectionProvenance({...body,support:[{...h,receiptRefs:[]}]}),f.bytes,f.authority)).toEqual(deny);
    expect(inspectProjectionProvenance(createProjectionProvenance({...body,support:[{...h,spans:[]}]}),f.bytes,{...f.authority,verifyReceipt:()=>true})).toEqual(deny);
    expect(f.rawReads()).toBe(0);
  });
  it('requires semantic receipt suitability for the exact projection, not merely a valid signature or subject',()=>{
    const f=fixture(),r=createProjectionProvenance(f.body);
    const result=inspectProjectionProvenance(r,f.bytes,{...f.authority,verifyReceipt:(_receipt,_handle,record)=>record.plane==='non-authoritative-recall'&&record.recordId===r.recordId});
    expect(result).toMatchObject({status:'RESOLVED',plane:'non-authoritative-recall'});
    const truth=createProjectionProvenance({...f.body,kind:'tag-summary',plane:'truth-support'});
    expect(inspectProjectionProvenance(truth,f.bytes,{...f.authority,verifyReceipt:(_receipt,_handle,record)=>record.plane==='non-authoritative-recall'&&record.recordId===r.recordId})).toEqual({status:'UNAVAILABLE',support:null});
    expect(f.rawReads()).toBe(1);
  });
  it('bounds all lookup work before hydration and passes an exact remaining budget to owners',()=>{
    const f=fixture(),r=createProjectionProvenance(f.body);
    expect(inspectProjectionProvenance(r,f.bytes,{...f.authority,maxSupportTiles:4})).toEqual({status:'UNAVAILABLE',support:null});
    expect(f.lookups()).toBe(0);
    expect(inspectProjectionProvenance(r,f.bytes,{...f.authority,maxSupportTileBytes:1})).toEqual({status:'UNAVAILABLE',support:null});
    expect(f.lookups()).toBe(1);
    expect(f.rawReads()).toBe(0);
    const budgets:number[]=[];
    expect(inspectProjectionProvenance(r,f.bytes,{...f.authority,maxArtifactBytes:5,readArtifactText:(_cid,remaining)=>{budgets.push(remaining);return undefined;}})).toEqual({status:'UNAVAILABLE',support:null});
    expect(budgets).toEqual([5]);
  });
});
