import process from 'node:process';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createEngineeringCompletion, parseEngineeringCompletion, renderEngineeringCompletion, traceHash } from '../../packages/rosetta-schemas/dist/index.js';

const root = 'tools/engineering-evidence';
const read = file => JSON.parse(readFileSync(file, 'utf8'));
const observation = (value, evidenceRefs) => ({ status: 'observed', value, evidenceRefs });
const unknown = (reason = 'Not durably exposed in the selected run evidence.', evidenceRefs = []) => ({ status: 'unknown', reason, evidenceRefs });
const current = read(`${root}/completion-sources/current-observations.json`);
const sources = () => {
  const table = [];
  const add = (ref, locator, role, authorityClass, sourceTime = null, bytes = null) => {
    if (!table.some(s => s.ref === ref)) table.push({ ref, locator, role, authorityClass, sourceTime, sha256: bytes === null ? null : traceHash(bytes) });
    return ref;
  };
  const file = (file, ref, role, authorityClass, sourceTime = null) => add(ref, file, role, authorityClass, sourceTime, readFileSync(file));
  const git = (revision, file, role, authorityClass) => {
    const ref = `git:Entif-AI/Rosetta@${revision}:${file}`;
    return add(ref, ref, role, authorityClass, null, execFileSync('git', ['show', `${revision}:${file}`]));
  };
  const commit = (revision, role = 'checkpoint') => {
    const ref = `git:Entif-AI/Rosetta@${revision}`;
    return add(ref, ref, role, role === 'integration' ? 'integration-evidence' : 'implementation-evidence', null, execFileSync('git', ['cat-file', 'commit', revision]));
  };
  return { table, add, file, git, commit };
};
const missingObservations = () => Object.fromEntries(['executorSurface', 'provider', 'model', 'modelVersion', 'reasoning', 'compiledContext', 'tools', 'runtime', 'repairs', 'rework', 'discardedWork', 'startedAt', 'endedAt', 'delegation', 'quota', 'duration', 'contextSize', 'cache', 'tokens', 'cost', 'retries'].map(field => [field, unknown()]));
const body = (runRef, table) => ({
  profile: { id: 'engineering.run-completion.v1', version: '1.0.0' }, runRef,
  workRefs: [runRef], identityRefs: { issues: [], specs: [], plans: [], prs: [runRef] },
  createdAt: current.createdAt, terminalState: 'completed', lifecycleRecords: [], observations: missingObservations(),
  validation: [], independentVerification: [], externalEffects: [], result: { disposition: 'code-complete', evidenceRefs: [runRef] },
  limitations: [], continuation: { refs: [], nextSafeStep: 'Review the bounded source-linked outcome against current repository state.', evidenceRefs: [runRef] },
  sources: table, supersedesRefs: []
});
const claim = (subjectRef, evidenceRefs, independence = 'executor-attested') => ({ subjectRef, evidenceRefs, independence, disposition: 'passed' });
function lifecycle(workRef, createdAt, executorRef, resultRef, evidenceRefs, verifierRefs, integrationRefs = []) {
  const records = [];
  const append = (event, fields) => {
    const record = { recordId: `urn:rosetta:work-event:${encodeURIComponent(workRef)}:${event}`, profile: { id: 'work.lifecycle.v1', version: '1.0.0' }, workRef, event, createdAt, receiptRefs: [], provenanceRefs: [workRef], ...fields };
    if (records.length) record.priorRecordRef = records.at(-1).recordId;
    records.push(record);
  };
  append('declared', { evidenceRefs: [workRef] });
  append('completed', { executorRef, resultRef, evidenceRefs, disposition: 'completed' });
  if (verifierRefs.length) append('verification_accepted', { executorRef, resultRef, evidenceRefs: verifierRefs, verifierRefs, disposition: 'accepted' });
  if (integrationRefs.length) append('integrated', { verificationRef: records.at(-1).recordId, integrationRefs, evidenceRefs: integrationRefs, disposition: 'accepted' });
  return records;
}
const quotaWindows = (provider, phase, meterRef, fallbackObservedAt) => (provider.windows ?? []).map(w => ({
  meterRef, windowRef: w.id ?? null, windowKind: ['five_hour', 'weekly'].includes(w.kind) ? w.kind : 'other',
  observedAt: provider.observedAt ?? fallbackObservedAt, phase, usedPercent: w.usedPercent ?? null, remainingPercent: w.remainingPercent ?? null,
  resetAt: w.resetAt ?? null, attribution: 'shared-seat-unattributed', sourceStatus: ['fresh', 'stale', 'unavailable'].includes(provider.status) ? provider.status : 'unknown'
}));

function akasha() {
  const fixture = read(`${root}/fixtures/jcs-1693.json`);
  const pr = read(`${root}/fixtures/jcs-pr.source.json`);
  const s = sources(); s.table.push(...fixture.sources);
  const result = body(pr.url, s.table);
  const green = fixture.sources.find(s => s.role === 'green').ref;
  const checkpoint = fixture.sources.find(s => s.ref === fixture.records[1].resultRef).ref;
  const merge = fixture.sources.find(s => s.role === 'integration').ref;
  const spec = fixture.sources.find(s => s.role === 'spec').ref;
  const plan = fixture.sources.find(s => s.role === 'plan').ref;
  const checks = fixture.sources.filter(s => s.role === 'hosted-verification').map(s => s.ref);
  result.workRefs.push(fixture.workRef);
  result.identityRefs = { issues: [fixture.workRef], specs: [spec], plans: [plan], prs: [pr.url] };
  result.lifecycleRecords = fixture.records;
  result.validation = [claim(checkpoint, [green])];
  result.independentVerification = checks.map(ref => claim(checkpoint, [ref], 'independent'));
  result.externalEffects = [{ effectRef: checkpoint, kind: 'git-checkpoint', reconciliation: 'verified', evidenceRefs: [checkpoint] }, { effectRef: merge, kind: 'merge', reconciliation: 'verified', evidenceRefs: [pr.url, merge] }];
  result.result = { disposition: 'integrated', evidenceRefs: [pr.url, merge] };
  result.observations.tools = observation(['pnpm', 'Nx', 'Neo4j'], [green]);
  const runtime = s.git(pr.mergeCommit.oid, 'tools/trace-graph/evidence/neo4j-proof.json', 'other', 'verification-evidence');
  result.observations.runtime = observation([runtime], [runtime]);
  result.observations.repairs = observation(['JCS integer-like key ordering repair; original red and green attestation remains source-linked.'], [green, fixture.validationRelations[0].redRef]);
  result.limitations = [...fixture.limitations, 'Model/provider/reasoning, total wall time, quota, tokens, cost and provider cache are not exposed in these selected durable sources.'];
  const next = s.git(pr.mergeCommit.oid, 'plans/trace-temp.md', 'plan', 'desired-state');
  result.continuation = { refs: [next], nextSafeStep: 'Inspect the deferred TRACE-TEMP plan against current repository state.', evidenceRefs: [green, next] };
  return result;
}

function specops() {
  const pr = read(`${root}/completion-sources/pr-1723.json`); assert.equal(pr.state, 'MERGED');
  const revision = pr.mergeCommit.oid;
  const run = JSON.parse(execFileSync('git', ['show', `${revision}:tools/specops/evidence/run-evidence.json`], { encoding: 'utf8' }));
  const s = sources();
  s.file(`${root}/completion-sources/pr-1723.json`, pr.url, 'pull-request', 'source-evidence', pr.mergedAt);
  const receipt = s.git(revision, 'tools/specops/evidence/run-evidence.json', 'green', 'verification-evidence');
  const head = s.commit(pr.headRefOid); const merge = s.commit(revision, 'integration');
  const spec = s.git(revision, 'specs/architecture.md', 'spec', 'desired-state');
  const plan = s.git(revision, 'plans/specops-integrated.md', 'plan', 'desired-state');
  const checks = pr.statusCheckRollup.map(c => { assert.equal(c.conclusion, 'SUCCESS'); return s.file(`${root}/completion-sources/pr-1723.json`, c.detailsUrl, 'hosted-verification', 'verification-evidence', c.completedAt); });
  const executor = s.add('unknown:historical-executor:specops-1723', null, 'executor', 'unknown');
  const result = body(pr.url, s.table);
  result.identityRefs = { issues: [], specs: [spec], plans: [plan], prs: [pr.url] };
  result.lifecycleRecords = lifecycle(pr.url, current.createdAt, executor, head, [head, receipt], checks, [pr.url, merge]);
  result.validation = [claim(head, [receipt])]; result.independentVerification = checks.map(ref => claim(head, [ref], 'independent'));
  result.externalEffects = [{ effectRef: head, kind: 'git-checkpoint', reconciliation: 'verified', evidenceRefs: [head] }, { effectRef: merge, kind: 'merge', reconciliation: 'verified', evidenceRefs: [pr.url, merge] }];
  result.result = { disposition: 'integrated', evidenceRefs: [pr.url, merge] };
  result.observations.model = unknown(run.configuration.primaryExactModelAndReasoning, [receipt]);
  result.observations.reasoning = unknown(run.configuration.primaryExactModelAndReasoning, [receipt]);
  result.observations.startedAt = unknown(run.epoch.actualRunStart, [receipt]);
  result.observations.duration = observation({ seconds: run.epoch.checkpointToReceiptSeconds, basis: 'checkpoint-interval' }, [receipt]);
  result.observations.delegation = observation([run.configuration.reviewAgent], [receipt]);
  result.observations.repairs = observation(run.repairLoops, [receipt]);
  result.observations.tools = observation(['pnpm', 'Nx', 'quota-axi', 'SpecOps'], [receipt]);
  const quota = [
    ...quotaWindows(run.quota.firstInstalledMidRun, 'installed-mid-run', receipt),
    ...run.quota.distributionCheckpoint.flatMap(p => quotaWindows(p, 'checkpoint', receipt)),
    ...run.quota.after.flatMap(p => quotaWindows(p, 'after', receipt))
  ];
  const middle = run.quota.checkpointAt2108UTC;
  for (const [windowKind, usedPercent] of [['five_hour', middle.fiveHourUsedPercent], ['weekly', middle.weeklyUsedPercent]]) quota.push({ meterRef: receipt, windowRef: null, windowKind, observedAt: middle.observedAt, phase: 'checkpoint', usedPercent, remainingPercent: null, resetAt: null, attribution: 'shared-seat-unattributed', sourceStatus: 'unknown' });
  result.observations.quota = observation(quota, [receipt]);
  const cache = [['latestFullTestsCachedTasks', 'tests'], ['latestFullBuildCachedTasks', 'build'], ['mergeAdmissionCachedTasks', 'admission']].map(([key]) => {
    const match = /^(\d+) of (\d+)$/u.exec(run.cache[key]); assert.ok(match);
    return { kind: 'nx-task', subjectRef: receipt, cachedCount: Number(match[1]), totalCount: Number(match[2]), unit: 'tasks' };
  });
  result.observations.cache = observation(cache, [receipt]);
  result.limitations = ['Run evidence was captured before merge; separate later GitHub metadata establishes PR integration.', 'Checkpoint interval is not total run wall time.', run.quota.interpretation, ...run.limitations.filter(v => !v.startsWith('No merge,'))];
  result.continuation = { refs: [plan], nextSafeStep: 'Review remaining deferred work against current SpecOps plans; preserve the integrated substrate.', evidenceRefs: [receipt, plan] };
  return result;
}

function currentLifecycle() {
  const issue = read(`${root}/completion-sources/issue-1509.json`);
  const pr = read(`${root}/completion-sources/pr-1732.json`);
  const checkpoint = read(`${root}/completion-sources/checkpoint-verified.json`);
  const checks = read(`${root}/completion-sources/checks-verified.json`);
  const captured = read(`${root}/completion-sources/verified-capture.json`);
  assert.equal(checkpoint.sha, pr.headRefOid);
  const s = sources();
  s.file(`${root}/completion-sources/issue-1509.json`, issue.url, 'issue', 'source-evidence', issue.createdAt);
  s.file(`${root}/completion-sources/pr-1732.json`, pr.url, 'pull-request', 'source-evidence');
  const head = s.file(`${root}/completion-sources/checkpoint-verified.json`, checkpoint.html_url, 'checkpoint', 'implementation-evidence', checkpoint.date);
  const evidence = s.git(checkpoint.sha, 'tools/engineering-evidence/evidence/lifecycle-validation.json', 'green', 'verification-evidence');
  const spec = s.git(checkpoint.sha, 'specs/architecture.md', 'spec', 'desired-state');
  const plan = s.git(checkpoint.sha, 'plans/work-lifecycle.md', 'plan', 'desired-state');
  const ledger = s.file(`${root}/completion-sources/current-observations.json`, 'evidence:batch-1732-observations', 'other', 'source-evidence', current.createdAt);
  const executor = s.file(`${root}/completion-sources/current-observations.json`, 'executor:codex-desktop:batch-1732', 'executor', 'source-evidence', current.createdAt);
  const verifiers = checks.map(c => { assert.equal(c.head_sha, checkpoint.sha); assert.equal(c.conclusion, 'success'); return s.file(`${root}/completion-sources/checks-verified.json`, c.html_url, 'hosted-verification', 'verification-evidence', c.completed_at); });
  assert.ok(verifiers.length);
  const failures = [];
  for (const name of ['b99ff24', '4a4a7cc', 'c62a76d', '275e913']) {
    const file = `${root}/completion-sources/checks-${name}.json`;
    for (const check of read(file).filter(c => c.conclusion === 'failure')) {
      const subject = s.commit(check.head_sha);
      const source = s.file(file, check.html_url, 'hosted-verification', 'verification-evidence', check.completed_at);
      failures.push({ ...claim(subject, [source], 'independent'), disposition: 'failed' });
    }
  }
  const loaderRegression = s.git('c62a76d58528d3cc576385a52ed598860ad1f6b1', 'tools/semantic-governance/load-schemas.spec.mjs', 'other', 'implementation-evidence');
  const auditRepair = s.git(checkpoint.sha, 'docs/governance/CORE_DESCENT_AUDIT.json', 'other', 'implementation-evidence');
  const coldStartup = s.git(checkpoint.sha, 'tools/semantic-governance/profile-admission.spec.mjs', 'other', 'implementation-evidence');
  const result = body(pr.url, s.table);
  result.createdAt = captured.capturedAt;
  result.runRef = `urn:rosetta:engineering-run:1732:1509:${checkpoint.sha}`;
  result.workRefs = [issue.url, pr.url]; result.identityRefs = { issues: [issue.url], specs: [spec], plans: [plan], prs: [pr.url] };
  result.lifecycleRecords = lifecycle(issue.url, captured.capturedAt, executor, head, [evidence, head], verifiers);
  result.validation = [...failures, claim(head, [evidence])]; result.independentVerification = verifiers.map(ref => claim(head, [ref], 'independent'));
  result.externalEffects = [{ effectRef: head, kind: 'push', reconciliation: 'verified', evidenceRefs: [head, pr.url] }];
  result.result = { disposition: 'verified', evidenceRefs: [head, evidence, ...verifiers] };
  result.observations.executorSurface = observation(current.executorSurface, [ledger]);
  result.observations.delegation = observation(current.delegation, [ledger]);
  result.observations.quota = observation(current.quota.slice(0, 2).flatMap(p => p.observations.flatMap(o => quotaWindows(o, p.event, ledger, p.capturedAt))), [ledger]);
  result.observations.tools = observation(['Git', 'pnpm', 'Nx', 'Vitest', 'GitHub CLI', 'quota-axi'], [ledger, evidence]);
  result.observations.repairs = observation(['Rejected invalid completion/dispatch/authority declarations.', 'Rejected integration based on superseded verification.', 'Disabled stale Jiti module cache after clean hosted catalog failures.', 'Regenerated the stale Core-descent audit exposed by the repaired source loader.', 'Allowed 30 seconds for the existing cold Profile integration test while retaining its assertions.'], [evidence, loaderRegression, auditRepair, coldStartup, ...failures.flatMap(v => v.evidenceRefs)]);
  result.limitations = [...current.limitations, 'Unmerged implementation and hosted verification are distinct from integration.', 'Quota observation scope is the shared seat; no tranche consumption is inferred.'];
  result.continuation = { refs: [plan], nextSafeStep: 'Continue the prepared engineering-evidence frontier; retain unmerged plan state until integration.', evidenceRefs: [plan, evidence] };
  return result;
}

const examples = { 'akasha-1725': akasha, 'specops-1723': specops, 'batch-1732-lifecycle-1509': currentLifecycle };
if (process.argv.slice(2).some(arg => arg !== '--write')) throw new Error('usage: completions.mjs [--write]');
mkdirSync(`${root}/completions`, { recursive: true });
for (const [name, build] of Object.entries(examples)) {
  const envelope = createEngineeringCompletion(build());
  for (const [extension, bytes] of [['json', JSON.stringify(envelope, null, 2) + '\n'], ['md', renderEngineeringCompletion(envelope)]]) {
    const file = `${root}/completions/${name}.${extension}`;
    if (process.argv.includes('--write') && (extension === 'md' || !existsSync(file))) writeFileSync(file, bytes);
    else if (readFileSync(file, 'utf8') !== bytes) throw new Error(`Completion drift: ${file}; preserve prior evidence and create a source-linked supersession.`);
  }
  process.stdout.write(`${name}: ${envelope.envelopeId}; ${envelope.result.disposition}.\n`);
}

// A later tranche dogfoods the same admitted envelope without rewriting earlier completions.
for (const name of ['batch-1732-falkor-1735', 'batch-1732-falkor-kin-1736']) {
  const laterPath = `${root}/completions/${name}`;
  const later = parseEngineeringCompletion(read(laterPath + '.json'));
  if (readFileSync(laterPath + '.md', 'utf8') !== renderEngineeringCompletion(later)) throw new Error(`${name} completion rendering drift.`);
  for (const source of later.sources) {
    if (source.sha256 && source.locator && existsSync(source.locator) && traceHash(readFileSync(source.locator)) !== source.sha256) throw new Error(`${name} completion source drift: ` + source.locator);
  }
  process.stdout.write(`${name}: ${later.envelopeId}; ${later.result.disposition}.\n`);
}
