import { createHash } from 'node:crypto';
import { verifyTileIntegrity, type TileEnvelope, type SourceSpanRef } from '@entif-ai/rosetta-core';
import { canonicalTraceJson, traceHash } from './trace-normalization.js';
import { compileEvidenceContract, evidenceRefSchema as ref, evidenceRefsSchema as refs, evidenceObjectSchema as object, evidenceProfileSchema as profile, evidenceTimestampSchema as timestamp, nullableEvidenceSchema as nullable, collectEvidenceSourceLineages } from './evidence-contract-validation.js';
import { validatePayload } from './rosetta-schemas.js';
import { compareProfileTimestamps } from './evaluation-profile-validation.js';

const kinds = ['vector-chunk','temporal-edge','salience-score','tag-summary','lexical-shadow'] as const;
const planes = ['truth-support','temporal-projection','activation','non-authoritative-recall'] as const;
type Lifecycle = 'current'|'corrected'|'retracted'|'access-lost'|'deleted'|'retention-expired'|'cold-unavailable'|'conflict'|'unknown';
interface SupportHandle {
  sourceRecordCid: string; sourceManifestationCid: string; artifactCid: string;
  lineageRef: string; scopeRef: string; policyRef: string; rightsRef: string;
  spans: { observationCid: string; span: SourceSpanRef; offsetUnit: 'utf16-code-unit' }[];
  receiptRefs: string[];
}
export interface ProjectionProvenance {
  profile: { id:'projection.provenance.v1'; version:'1.0.0' };
  recordId:string; projectionRef:string; revisionRef:string; materializedViewRef:string;
  kind:typeof kinds[number]; plane:typeof planes[number]; projectionSha256:string;
  doctrineRef:string; policyRef:string; policyVersion:string; transformRef:string;
  support:SupportHandle[];
  replay:{kind:'rebuildable'|'non-replayable'; sourceClosureRefs:string[]; operationalClosureRefs:string[]; reasonRefs:string[]};
  identitySensitive:{classification:'ordinary'|'sensitive'|'unknown'; policyRef:string|null; authorizationRef:string|null};
  observedAt:string; predecessorRef:string|null; effectAuthority:'none';
}
const sha = {type:'string',pattern:'^[a-f0-9]{64}$'};
const offset = {type:'integer',minimum:0,maximum:Number.MAX_SAFE_INTEGER};
const array = (items:object,minItems=0)=>({type:'array',minItems,maxItems:256,items});
const spanSchema = object({sourceRecordCid:ref,sourceManifestationCid:ref,startOffset:offset,endOffset:offset,textHash:sha});
export const PROJECTION_PROVENANCE_SCHEMA = {
  $schema:'http://json-schema.org/draft-07/schema#',$id:'urn:rosetta:projection.provenance.v1',title:'Bounded projection support handles v1',
  ...object({profile:profile('projection.provenance.v1'),recordId:sha,projectionRef:ref,revisionRef:ref,materializedViewRef:ref,
    kind:{enum:kinds},plane:{enum:planes},projectionSha256:sha,doctrineRef:ref,policyRef:ref,policyVersion:ref,transformRef:ref,
    support:array(object({sourceRecordCid:ref,sourceManifestationCid:ref,artifactCid:ref,lineageRef:ref,scopeRef:ref,policyRef:ref,rightsRef:ref,
      spans:array(object({observationCid:ref,span:spanSchema,offsetUnit:{const:'utf16-code-unit'}})),receiptRefs:refs}),1),
    replay:object({kind:{enum:['rebuildable','non-replayable']},sourceClosureRefs:refs,operationalClosureRefs:refs,reasonRefs:refs}),
    identitySensitive:object({classification:{enum:['ordinary','sensitive','unknown']},policyRef:nullable(ref),authorizationRef:nullable(ref)}),
    observedAt:timestamp,predecessorRef:nullable(sha),effectAuthority:{const:'none'}})
};
const admit = compileEvidenceContract<ProjectionProvenance>(PROJECTION_PROVENANCE_SCHEMA);
const expectedPlane = {'vector-chunk':'non-authoritative-recall','temporal-edge':'temporal-projection','salience-score':'activation','lexical-shadow':'non-authoritative-recall'} as const;
export function parseProjectionProvenance(input:unknown):ProjectionProvenance {
  const value=admit(input);
  const {recordId,...body}=value;
  if(traceHash(canonicalTraceJson(body))!==recordId) throw new Error('Projection support digest mismatch.');
  if(value.kind!=='tag-summary' && value.plane!==expectedPlane[value.kind]) throw new Error('Projection cannot change plane authority.');
  if(value.kind==='tag-summary' && !['truth-support','non-authoritative-recall'].includes(value.plane)) throw new Error('Tag/summary plane unavailable.');
  if(value.support.some(h=>!h.spans.length&&!h.receiptRefs.length)) throw new Error('Missing projection support.');
  for(const h of value.support) for(const s of h.spans) {
    if(s.span.sourceRecordCid!==h.sourceRecordCid||s.span.sourceManifestationCid!==h.sourceManifestationCid||s.span.endOffset<=s.span.startOffset) throw new Error('Conflicting source span.');
  }
  collectEvidenceSourceLineages(value.support.map(h=>({source:{ref:h.sourceRecordCid,version:null,cid:h.sourceRecordCid},lineageRef:h.lineageRef})));
  if(value.replay.kind==='rebuildable' && value.support.some(h=>!value.replay.sourceClosureRefs.includes(h.artifactCid))) throw new Error('Missing declared rebuild closure.');
  if(value.replay.kind==='non-replayable'&&!value.replay.reasonRefs.length) throw new Error('Non-replayable projection requires reason.');
  if(value.predecessorRef===recordId) throw new Error('Self predecessor.');
  return structuredClone(value);
}
export function createProjectionProvenance(body:Omit<ProjectionProvenance,'recordId'>):ProjectionProvenance {
  return parseProjectionProvenance({...body,recordId:traceHash(canonicalTraceJson(body))});
}
/** Any new projection revision needs revalidation. Equal payload bytes do
 * not make changed source, doctrine, policy or transformation current. */
export function classifyProjectionRevision(previous:unknown,next:unknown):'EXACT_REPLAY'|'REVALIDATION_REQUIRED' {
  const prior=parseProjectionProvenance(previous),current=parseProjectionProvenance(next);
  if(prior.recordId===current.recordId)return 'EXACT_REPLAY';
  if(prior.projectionRef!==current.projectionRef||current.predecessorRef!==prior.recordId||
    current.revisionRef===prior.revisionRef||compareProfileTimestamps(current.observedAt,prior.observedAt)<=0)
    throw new Error('Projection succession requires exact prior revision and later observation.');
  return 'REVALIDATION_REQUIRED';
}
export interface ProvenanceAuthority {
  maxArtifactBytes:number; maxProjectionBytes:number; maxSupportTiles:number; maxSupportTileBytes:number;
  // Authority must implement these checks before any storage lookup; this
  // contract neither authenticates the authority nor performs durable writes.
  authorize:(handle:SupportHandle)=>boolean;
  identityAuthorized:(record:ProjectionProvenance)=>boolean;
  current:(handle:SupportHandle)=>Lifecycle;
  policyCurrent:(record:ProjectionProvenance)=>boolean;
  // Storage owners must enforce the remaining byte budget before returning
  // bytes. Post-return checks are defensive, not a remote I/O guarantee.
  resolveTile:(cid:string,remainingBytes:number)=>TileEnvelope|undefined;
  readArtifactText:(cid:string,remainingBytes:number)=>string|undefined;
  verifyReceipt:(receipt:TileEnvelope,handle:SupportHandle)=>boolean;
  matchesProjection:(record:ProjectionProvenance,projectionBytes:Uint8Array)=>boolean;
  hold:'active'|'inactive'|'unknown';
}
type ResolvedSupport={lineageRef:string;artifactCid:string;spans:{observationCid:string;text:string}[];receiptRefs:string[]};
type Inspection={status:'UNAVAILABLE';support:null}|{status:'RESOLVED';support:ResolvedSupport[];lineageRefs:string[];plane:ProjectionProvenance['plane'];writeRoute:'SAFE_HOLD'|'WRITE_ADMISSION_REQUIRED'};
const unavailable=():Inspection=>({status:'UNAVAILABLE',support:null});
function sameScopes(left: unknown, right: unknown, requested: string): boolean {
  const scopes = (value:unknown):string[]|null => Array.isArray(value) &&
    value.every(v=>typeof v==='string'&&v.length>0) &&
    new Set(value).size===value.length ? value.slice().sort() : null;
  const a=scopes(left),b=scopes(right);
  return a!==null&&b!==null&&a.includes(requested)&&canonicalTraceJson(a)===canonicalTraceJson(b);
}
function receiptBindsArtifact(receipt:TileEnvelope,artifactCid:string):boolean {
  // Use the native receipt subject/evidence coordinates. A successful
  // issuer check cannot repair a missing artifact-version relationship.
  const p=receipt.payload as {subjects?:{cid?:unknown}[];claims?:{evidence?:{cid?:unknown}[]}[]};
  return (Array.isArray(p.subjects)&&p.subjects.some(s=>s?.cid===artifactCid))||
    (Array.isArray(p.claims)&&p.claims.some(c=>Array.isArray(c?.evidence)&&c.evidence.some(e=>e?.cid===artifactCid)));
}
/** Bounded read-only resolution. A receipt's integrity is not issuer authority. */
export function inspectProjectionProvenance(input:unknown,projectionBytes:Uint8Array,authority:ProvenanceAuthority):Inspection {
  try {
    const record=parseProjectionProvenance(input);
    const budgets=[authority.maxArtifactBytes,authority.maxProjectionBytes,authority.maxSupportTiles,authority.maxSupportTileBytes];
    if(budgets.some(b=>!Number.isSafeInteger(b)||b<0)||projectionBytes.byteLength>authority.maxProjectionBytes)return unavailable();
    // Count the exact requested work before asking any storage owner.
    const lookups=record.support.reduce((n,h)=>n+3+h.spans.length+h.receiptRefs.length,0);
    if(lookups>authority.maxSupportTiles)return unavailable();
    const bytes=Uint8Array.from(projectionBytes);
    const authorized=()=>authority.policyCurrent(structuredClone(record))===true &&
      record.identitySensitive.classification!=='unknown' &&
      (record.identitySensitive.classification==='ordinary'||Boolean(record.identitySensitive.policyRef&&record.identitySensitive.authorizationRef&&authority.identityAuthorized(structuredClone(record))===true)) &&
      record.support.every(h=>authority.authorize(structuredClone(h))===true);
    if(!authorized()||createHash('sha256').update(bytes).digest('hex')!==record.projectionSha256||authority.matchesProjection(structuredClone(record),Uint8Array.from(bytes))!==true) return unavailable();
    if(record.support.some(h=>authority.current(structuredClone(h))!=='current'))return unavailable();
    let tileBytes=0;
    const tile=(cid:string,kind:string)=>{
      const remaining=authority.maxSupportTileBytes-tileBytes;
      if(remaining<=0)throw new Error('Support tile budget exhausted.');
      const value=structuredClone(authority.resolveTile(cid,remaining));
      if(!value||value.cid!==cid||value.kind!==kind||!verifyTileIntegrity(value).ok||!value.payload||typeof value.payload!=='object'||!validatePayload(kind,value.payload).ok)throw new Error('Unresolved tile.');
      tileBytes+=Buffer.byteLength(canonicalTraceJson(value));
      if(tileBytes>authority.maxSupportTileBytes)throw new Error('Support tile budget exhausted.');
      return value;
    };
    // Establish source, rights, exact artifact-version and receipt closure
    // for every constituent before asking the raw-artifact owner for bytes.
    const admitted=record.support.map(h=>{
      tile(h.sourceRecordCid,'source.record');
      const manifestation=tile(h.sourceManifestationCid,'source.manifestation');
      const artifact=tile(h.artifactCid,'source.canonical_artifact');
      const m=manifestation.payload as {sourceRecordCid:string;byteHashes:Record<string,string>;accessRequirements:unknown};
      const a=artifact.payload as {sourceRecordCid:string;sourceManifestationCid:string;byteHash:string;normalizedText:string;normalizedTextHash:string;rightsScopes:unknown};
      if(m.sourceRecordCid!==h.sourceRecordCid||a.sourceRecordCid!==h.sourceRecordCid||a.sourceManifestationCid!==h.sourceManifestationCid||m.byteHashes?.sha256!==a.byteHash||
        !sameScopes(m.accessRequirements,a.rightsScopes,h.scopeRef)||typeof a.normalizedText!=='string'||traceHash(a.normalizedText)!==a.normalizedTextHash)throw new Error('Conflicting artifact or rights.');
      for(const {observationCid,span} of h.spans) {
        const observation=tile(observationCid,'rosetta.observation');
        const payload=observation.payload as {sourceSpans?:SourceSpanRef[]};
        if(!observation.parents.includes(h.artifactCid)||!payload.sourceSpans?.some(s=>canonicalTraceJson(s)===canonicalTraceJson(span)))throw new Error('Conflicting exact artifact span.');
      }
      for(const cid of h.receiptRefs) {
        const receipt=tile(cid,'rosetta.receipt');
        if(!receiptBindsArtifact(receipt,h.artifactCid)||authority.verifyReceipt(receipt,structuredClone(h))!==true)throw new Error('Conflicting receipt support.');
      }
      return {h,byteHash:a.byteHash};
    });
    if(!authorized()||record.support.some(h=>authority.current(structuredClone(h))!=='current'))return unavailable();
    const resolved:ResolvedSupport[]=[];
    let artifactBytes=0;
    for(const {h,byteHash} of admitted) {
      const text=authority.readArtifactText(h.artifactCid,authority.maxArtifactBytes-artifactBytes);
      if(typeof text!=='string')return unavailable();
      artifactBytes+=Buffer.byteLength(text);
      if(artifactBytes>authority.maxArtifactBytes)return unavailable();
      if(traceHash(text)!==byteHash)return unavailable();
      const spans=h.spans.map(({observationCid,span})=>{
        if(span.endOffset>text.length)throw new Error('Conflicting source span.');
        const slice=text.slice(span.startOffset,span.endOffset);
        if(traceHash(slice)!==span.textHash)throw new Error('Span digest mismatch.');
        return {observationCid,text:slice};
      });
      resolved.push({lineageRef:h.lineageRef,artifactCid:h.artifactCid,spans,receiptRefs:[...h.receiptRefs]});
    }
    if(!authorized()||record.support.some(h=>authority.current(structuredClone(h))!=='current'))return unavailable();
    return {status:'RESOLVED',support:resolved,lineageRefs:[...new Set(resolved.map(s=>s.lineageRef))].sort(),plane:record.plane,
      writeRoute:authority.hold==='inactive'?'WRITE_ADMISSION_REQUIRED':'SAFE_HOLD'};
  }catch{return unavailable();}
}
