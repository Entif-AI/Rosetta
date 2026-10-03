import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const pin={version:'0.1.56',commit:'1f5875c3f3ebf09b0fa04e124e9f395fcec68b25'};
const nullable=(value)=>value ?? null;
export function projectQuota(raw,event,rawEvidenceRef){
 const rows=(raw.providers ?? []).filter(p=>p.provider==='codex');
 return {formatVersion:1,role:'quota-observation-only',event,capturedAt:raw.generatedAt,adapter:pin,rawEvidenceRef,
  observations:rows.length?rows.map(p=>({provider:p.provider,seatRef:p.account?.accountId?'seat:'+createHash('sha256').update(p.provider+':'+p.account.accountId).digest('hex').slice(0,24):null,
   source:p.source ?? 'unavailable',observedAt:p.state?.refreshedAt ?? raw.generatedAt,status:p.state?.status ?? 'unavailable',stale:p.state?.stale ?? true,reused:p.state?.reused ?? false,
   uncertainty:p.quotaSemantics?.status ?? 'unknown',untrustedWindowIds:p.state?.untrustedWindowIds ?? [],
   conflicts:(p.quotaSemantics?.effectiveAvailability ?? []).filter(e=>e.boundConflict).map(e=>({scope:e.scope,status:e.status,conflict:e.boundConflict})),
   windows:(p.windows ?? []).map(w=>({id:w.id,kind:w.windowSeconds===18000?'five_hour':w.kind,windowSeconds:nullable(w.windowSeconds),usedPercent:nullable(w.percentUsed),remainingPercent:nullable(w.percentRemaining),limitPercent:null,shareOf:nullable(w.shareOf),resetAt:nullable(w.resetsAt)}))})):
  [{provider:'codex',source:'unavailable',observedAt:raw.generatedAt,status:'unavailable',uncertainty:'unknown',windows:[]} ]};
}
if(fileURLToPath(import.meta.url)===path.resolve(process.argv[1] ?? '')){
 try{
  const event=process.argv[2] ?? 'checkpoint';
  if(process.argv.length>3 || !['before','after','checkpoint','failure','installed-mid-run'].includes(event)) throw new Error('usage: quota.mjs before|after|checkpoint|failure|installed-mid-run');
  let raw;
  try{
   const bin=JSON.parse(readFileSync('node_modules/quota-axi/package.json')).bin['quota-axi'];
   raw=JSON.parse(execFileSync(process.execPath,[path.resolve('node_modules/quota-axi',bin),'--provider','codex','--no-credential-refresh','--full','--json'],{encoding:'utf8',timeout:30000,stdio:['ignore','pipe','pipe']}));
  }catch{raw={generatedAt:new Date().toISOString(),providers:[]};}
  const folder=path.resolve('.axi/evidence'); mkdirSync(folder,{recursive:true,mode:0o700});
  const stem=raw.generatedAt.replace(/[^a-zA-Z0-9-]/g,'-')+'-'+event;
  const rawRef=path.join(folder,stem+'.raw.json');
  writeFileSync(rawRef,JSON.stringify(raw),{mode:0o600,flag:'wx'});
  const observation=projectQuota(raw,event,rawRef);
  const output=path.join(folder,stem+'.json');
  writeFileSync(output,JSON.stringify(observation,null,2)+'\n',{mode:0o600,flag:'wx'});
  console.log(JSON.stringify({event,evidence:output,observations:observation.observations},null,2));
 }catch(error){console.log('error: '+JSON.stringify(error.message));process.exitCode=1;}
}
