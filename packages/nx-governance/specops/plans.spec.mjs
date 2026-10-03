import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {createRequire} from 'node:module';
const {stringify}=createRequire(new URL('../package.json',import.meta.url))('yaml');
import {loadPlans,readiness,issueRequest,protectHistory} from './plans.mjs';
function fixture(){const root=mkdtempSync(path.join(tmpdir(),'entif-plans-'));mkdirSync(path.join(root,'plans'));return root;}
function write(root,slug,meta,body='## Validation\n- [x] verified\n'){writeFileSync(path.join(root,'plans',slug+'.md'),'---\n'+stringify({id:slug,task:'T00'+({a:1,b:2,c:3}[slug]),status:'planned',depends:[],awaits:[],specs:[],issues:[1718],...meta})+'\n---\n# '+slug+'\n'+body);}
test('dependency readiness and external awaits match serialized execution policy',()=>{
 const root=fixture();write(root,'a',{status:'done',pr:1600});write(root,'b',{depends:['a']});write(root,'c',{depends:['b'],awaits:['vendor release']});
 const plans=loadPlans(root);assert.equal(readiness(plans.get('b'),plans),'ready');assert.equal(readiness(plans.get('c'),plans),'awaiting');
 write(root,'a',{depends:['b']});assert.throws(()=>loadPlans(root),/cycle/);
});
test('prose changes keep issue/task identity; done history freezes without closing issue discussion',()=>{
 const root=fixture();write(root,'a',{});const first=issueRequest(loadPlans(root),'entif-ai/rosetta','fixture');write(root,'a',{},'## Validation\n- [ ] changed prose\n');
 const next=issueRequest(loadPlans(root),'entif-ai/rosetta','fixture');assert.equal(first.tasks[0].id,next.tasks[0].id);assert.equal(next.tasks[0].issueNumber,1718);
 assert.throws(()=>protectHistory('done','old','new'),/frozen/);assert.throws(()=>protectHistory('in-progress','old scope','changed scope'),/active/);
 assert.doesNotThrow(()=>protectHistory('planned','old','new'));
});
test('completed plans require PR and verified checklist; unresolved dependency fails closed',()=>{
 const root=fixture();write(root,'a',{status:'done'});assert.throws(()=>loadPlans(root),/PR/);
 write(root,'a',{status:'done',pr:1},'## Validation\n- [ ] unverified\n');assert.throws(()=>loadPlans(root),/validation/);
 write(root,'a',{depends:['missing']});assert.throws(()=>loadPlans(root),/unknown dependency/);
});
