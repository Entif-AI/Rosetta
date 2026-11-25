import { createHash } from 'node:crypto';
import { verifyTileIntegrity, type TileEnvelope } from '@entif-ai/rosetta-core';
import {
  canonicalTraceJson, classifyProjectionRevision, inspectProjectionProvenance, parseProjectionProvenance, traceHash,
  validatePayload, type ProvenanceAuthority, type ProjectionProvenance
} from '@entif-ai/rosetta-schemas';
import { createReceipt, digestTile, type ReceiptPayload } from './rosetta-receipts.js';

export type ProjectionTraceOperation = 'create'|'rebuild'|'inspect-current';
export interface ProjectionActionBinding {
  actionCid:string;
  operation:ProjectionTraceOperation;
  submittedRecordSha256:string;
  submittedPredecessorSha256:string|null;
  projectionSha256:string;
}

/**
 * Protected audit of a bounded support inspection. It neither rebuilds nor
 * invalidates durable state. Its action subject and byte digests are native
 * Receipt coordinates; a denied inspection does not emit source handles.
 */
export function createProjectionProvenanceReceipt(input:{
  operation:ProjectionTraceOperation;
  action:TileEnvelope;
  record:unknown;
  previous?:unknown;
  projectionBytes:Uint8Array;
  authority:ProvenanceAuthority;
  // The existing action/receipt owner authenticates the exact request.
  // A syntactically valid action is not evidence of its relationship to it.
  verifyActionBinding:(binding:ProjectionActionBinding)=>boolean;
}):TileEnvelope<ReceiptPayload> {
  const {operation,authority,verifyActionBinding}=input;
  const action=structuredClone(input.action);
  if(action.kind!=='rosetta.action'||!verifyTileIntegrity(action).ok||
    !action.payload||typeof action.payload!=='object'||!validatePayload(action.kind,action.payload).ok)
    throw new Error('Projection trace requires an exact native action.');
  if(!['create','rebuild','inspect-current'].includes(operation))
    throw new Error('Unknown projection inspection operation.');
  if(!(input.projectionBytes instanceof Uint8Array)||
    !Number.isSafeInteger(authority.maxProjectionBytes)||authority.maxProjectionBytes<0||
    input.projectionBytes.byteLength>authority.maxProjectionBytes)
    throw new Error('Projection trace byte budget exceeded.');
  const bytes=Uint8Array.from(input.projectionBytes);
  const submitted=structuredClone(input.record);
  const predecessor=input.previous===undefined?undefined:structuredClone(input.previous);
  const binding:ProjectionActionBinding={
    actionCid:action.cid,operation,
    submittedRecordSha256:traceHash(canonicalTraceJson(submitted)),
    submittedPredecessorSha256:predecessor===undefined?null:traceHash(canonicalTraceJson(predecessor)),
    projectionSha256:createHash('sha256').update(bytes).digest('hex')
  };
  const bound=()=>{
    try{return typeof verifyActionBinding==='function'&&verifyActionBinding(structuredClone(binding))===true;}
    catch{return false;}
  };
  // Do not emit even a refusal attributed to an unrelated action.
  if(!bound())throw new Error('Projection action binding unverified.');
  let record:ProjectionProvenance|undefined,prior:ProjectionProvenance|undefined;
  let event:'creation'|'rebuild'|'rejection'|'invalidation'|'inspection'='rejection';
  let evidence:ReceiptPayload['claims'][number]['evidence']=[];
  try {
    record=parseProjectionProvenance(submitted);
    if(operation==='create'&&record.predecessorRef!==null)throw new Error('Not a genesis.');
    if(operation==='rebuild'){
      prior=parseProjectionProvenance(predecessor);
      if(classifyProjectionRevision(prior,record)!=='REVALIDATION_REQUIRED'||record.replay.kind!=='rebuildable')
        throw new Error('Not a rebuild successor.');
    }
    const inspection=inspectProjectionProvenance(record,bytes,authority);
    if(inspection.status==='UNAVAILABLE'){
      event=operation==='inspect-current'?'invalidation':'rejection';
    }else if(operation!=='inspect-current'&&inspection.writeRoute==='SAFE_HOLD'){
      event='rejection';
    }else{
      event=operation==='create'?'creation':operation==='rebuild'?'rebuild':'inspection';
      evidence=[...new Set(inspection.support.flatMap(h=>[h.artifactCid,...h.spans.map(s=>s.observationCid),...h.receiptRefs]))].sort().map(cid=>({cid}));
    }
  }catch{
    // Preserve a bounded refusal without naming hidden support or claiming
    // that an invalid input was an authentic previous revision.
    event='rejection';
  }
  if(!bound())throw new Error('Projection action binding unverified.');
  const denied=event==='rejection'||event==='invalidation';
  const descriptions={
    creation:'Creation candidate has verified bounded support; no write performed.',
    rebuild:'Rebuild candidate has verified bounded support; no rebuild or write performed.',
    inspection:'Current bounded support inspection resolved; no authority granted.',
    rejection:'Projection candidate unavailable; no write performed.',
    invalidation:'Current support unavailable; affected reuse requires revalidation or invalidation by its owner.'
  };
  return createReceipt({
    claims:[{claimType:'rrp:projection.provenance.'+event,evidence:denied?[]:evidence,statement:descriptions[event],verdict:denied?'deny':'pass'}],
    subjects:[{cid:action.cid,role:'rrp:subject.step'}],
    digests:[
      digestTile(action,action.kind),
      {alg:'sha256',digest:binding.projectionSha256,of:'projection.bytes'},
      {alg:'sha256',digest:traceHash(canonicalTraceJson(binding)),of:'projection.action.binding'},
      {alg:'sha256',digest:binding.submittedRecordSha256,of:'projection.submitted.record'},
      ...(binding.submittedPredecessorSha256?[{alg:'sha256' as const,digest:binding.submittedPredecessorSha256,of:'projection.submitted.predecessor'}]:[]),
      ...(record?[{alg:'sha256' as const,digest:record.recordId,of:'projection.provenance.body'}]:[]),
      ...(prior?[{alg:'sha256' as const,digest:prior.recordId,of:'projection.predecessor.body'}]:[])
    ],
    // Policy references are bound by the provenance digest. This helper
    // does not claim to resolve a policy Tile or independently authenticate
    // an issuer. The governing write/lifecycle owner issues that evidence.
    policyRefs:[],
    receiptType:'rrp:projection.provenance.v1'
  });
}
