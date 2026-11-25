import { createHash } from 'node:crypto';
import { verifyTileIntegrity, type TileEnvelope } from '@entif-ai/rosetta-core';
import {
  classifyProjectionRevision, inspectProjectionProvenance, parseProjectionProvenance,
  validatePayload, type ProvenanceAuthority, type ProjectionProvenance
} from '@entif-ai/rosetta-schemas';
import { createReceipt, digestTile, type ReceiptPayload } from './rosetta-receipts.js';

/**
 * Protected audit of a bounded support inspection. It neither rebuilds nor
 * invalidates durable state. Its action subject and byte digests are native
 * Receipt coordinates; a denied inspection does not emit source handles.
 */
export function createProjectionProvenanceReceipt(input:{
  operation:'create'|'rebuild'|'inspect-current';
  action:TileEnvelope;
  record:unknown;
  previous?:unknown;
  projectionBytes:Uint8Array;
  authority:ProvenanceAuthority;
}):TileEnvelope<ReceiptPayload> {
  const action=structuredClone(input.action);
  if(action.kind!=='rosetta.action'||!verifyTileIntegrity(action).ok||
    !action.payload||typeof action.payload!=='object'||!validatePayload(action.kind,action.payload).ok)
    throw new Error('Projection trace requires an exact native action.');
  if(!['create','rebuild','inspect-current'].includes(input.operation))
    throw new Error('Unknown projection inspection operation.');
  if(!(input.projectionBytes instanceof Uint8Array)||
    !Number.isSafeInteger(input.authority.maxProjectionBytes)||input.authority.maxProjectionBytes<0||
    input.projectionBytes.byteLength>input.authority.maxProjectionBytes)
    throw new Error('Projection trace byte budget exceeded.');
  const bytes=Uint8Array.from(input.projectionBytes);
  let record:ProjectionProvenance|undefined,prior:ProjectionProvenance|undefined;
  let event:'creation'|'rebuild'|'rejection'|'invalidation'|'inspection'='rejection';
  let evidence:ReceiptPayload['claims'][number]['evidence']=[];
  try {
    record=parseProjectionProvenance(input.record);
    if(input.operation==='create'&&record.predecessorRef!==null)throw new Error('Not a genesis.');
    if(input.operation==='rebuild'){
      prior=parseProjectionProvenance(input.previous);
      if(classifyProjectionRevision(prior,record)!=='REVALIDATION_REQUIRED'||record.replay.kind!=='rebuildable')
        throw new Error('Not a rebuild successor.');
    }
    const inspection=inspectProjectionProvenance(record,bytes,input.authority);
    if(inspection.status==='UNAVAILABLE'){
      event=input.operation==='inspect-current'?'invalidation':'rejection';
    }else if(input.operation!=='inspect-current'&&inspection.writeRoute==='SAFE_HOLD'){
      event='rejection';
    }else{
      event=input.operation==='create'?'creation':input.operation==='rebuild'?'rebuild':'inspection';
      evidence=[...new Set(inspection.support.flatMap(h=>[h.artifactCid,...h.spans.map(s=>s.observationCid),...h.receiptRefs]))].sort().map(cid=>({cid}));
    }
  }catch{
    // Preserve a bounded refusal without naming hidden support or claiming
    // that an invalid input was an authentic previous revision.
    event='rejection';
  }
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
      {alg:'sha256',digest:createHash('sha256').update(bytes).digest('hex'),of:'projection.bytes'},
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
