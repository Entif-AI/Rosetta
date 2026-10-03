import {test} from 'node:test';
import assert from 'node:assert/strict';
import {projectQuota} from './quota.mjs';
test('quota preserves observation provenance/windows/conflict without identity or routing advice',()=>{
 const q=projectQuota({generatedAt:'2026-10-03T00:00:00Z',providers:[{provider:'codex',source:'cli-rpc',account:{email:'secret@example.invalid',accountId:'secret-seat'},state:{status:'fresh',stale:false,refreshedAt:'2026-10-03T00:00:00Z'},windows:[{id:'five_hour',kind:'session',windowSeconds:18000,percentUsed:20,percentRemaining:80,resetsAt:'2026-10-03T05:00:00Z'}],quotaSemantics:{status:'partial',effectiveAvailability:[{scope:'model:x',status:'unknown',boundConflict:{kind:'inherited_zero',inheritedWindowIds:['weekly'],ownWindowIds:['five_hour']},selection:{spendPriority:42}}]}}]},'checkpoint','local-evidence.json');
 assert.equal(q.observations[0].windows[0].kind,'five_hour');
 assert.equal(q.observations[0].windows[0].usedPercent,20);
 assert.equal(q.observations[0].uncertainty,'partial');
 assert.equal(q.observations[0].conflicts.length,1);
 assert.equal(q.rawEvidenceRef,'local-evidence.json');
 assert.match(q.observations[0].seatRef,/^seat:[a-f0-9]{24}$/);
 assert.doesNotMatch(JSON.stringify(q),/secret|spendPriority/);
});
test('missing telemetry is explicit, not a zero balance',()=>{
 const q=projectQuota({generatedAt:'2026-10-03T00:00:00Z',providers:[]},'installed-mid-run',null);
 assert.equal(q.observations[0].status,'unavailable'); assert.deepEqual(q.observations[0].windows,[]);
});
