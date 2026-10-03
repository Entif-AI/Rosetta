import { describe, expect, it } from 'vitest';
import { synchronizeTasks, type IssueSnapshot, type TaskSyncRequest, type TaskLedger } from './issue-sync';

function fixture() {
  let ledger: TaskLedger | undefined;
  const issues: IssueSnapshot[] = [{ number: 1698, title: 'Promotion Profile', body: 'Existing Rosetta work', state: 'open' }];
  let sends = 0;
  let loseAck = false;
  const client = {
    get: async (number: number) => { const issue = issues.find((entry) => entry.number === number); if (!issue) throw new Error('Missing issue'); return issue; },
    find: async (marker: string) => issues.filter((issue) => issue.body.includes(marker)),
    create: async (title: string, body: string) => { sends++; const issue = { number: 2000 + sends, title, body, state: 'open' as const }; issues.push(issue); if (loseAck) throw new Error('Lost acknowledgement'); return issue; },
  };
  const store = { load: () => ledger, save: (value: TaskLedger) => { ledger = structuredClone(value); } };
  const request = (): TaskSyncRequest => ({ formatVersion: 1, repository: 'Entif-AI/Rosetta', featureId: 'promotion', publicationPosture: 'public',
    tasks: [{ id: 'T001', title: 'Formalize promotion Profile', body: 'Exact existing work.', issueNumber: 1698,
      sourceRef: 'spec-surfaces/promotion/tasks.md#T001', findingRefs: ['finding:promotion:profile'], originTaskIds: [], decision: null, closedDisposition: null }] });
  return { client, store, request, issues, sends: () => sends, ledger: () => ledger!, loseAck: () => { loseAck = true; } };
}
describe('durable task issue identity #1709', () => {
  it('binds existing Rosetta issue and retains identity through title/prose changes and retries', async () => {
    const f = fixture(); await synchronizeTasks(f.request(), f.client, f.store, true);
    const original = structuredClone(f.ledger());
    await synchronizeTasks(f.request(), f.client, f.store, true);
    expect(f.ledger()).toEqual(original);
    const changed = f.request(); changed.tasks[0].title = 'Reworded task'; changed.tasks[0].body = 'Reworded projection';
    await synchronizeTasks(changed, f.client, f.store, true);
    expect(f.ledger().bindings.T001.issueNumber).toBe(1698);
    expect(f.ledger().bindings.T001.bindingId).toBe(original.bindings.T001.bindingId);
    expect(f.ledger().bindings.T001.findingRefs).toEqual(['finding:promotion:profile']);
    expect(f.sends()).toBe(0);
    expect(f.issues[0].title).toBe('Promotion Profile');
  });
  it('proposes by default and creates exactly once only in apply mode', async () => {
    const f = fixture(); const input = f.request(); input.tasks[0].issueNumber = null;
    expect((await synchronizeTasks(input, f.client, f.store, false)).actions[0].kind).toBe('propose-create');
    expect(f.sends()).toBe(0);
    await synchronizeTasks(input, f.client, f.store, true);
    await synchronizeTasks(input, f.client, f.store, true);
    expect(f.sends()).toBe(1);
    expect(f.issues[1].body).toContain(f.ledger().bindings.T001.marker);
  });
  it('recovers duplicate-send ambiguity by exact marker instead of another creation', async () => {
    const f = fixture(); f.loseAck(); const input = f.request(); input.tasks[0].issueNumber = null;
    expect((await synchronizeTasks(input, f.client, f.store, true)).actions[0].kind).toBe('delivery-unknown');
    expect(f.ledger().bindings.T001.state).toBe('pending');
    expect((await synchronizeTasks(input, f.client, f.store, true)).actions[0].kind).toBe('recovered');
    expect(f.sends()).toBe(1);
    expect(f.ledger().bindings.T001.issueNumber).toBe(2001);
  });
  it('never retries an unresolved pending send or merges duplicate markers', async () => {
    const f = fixture(); f.loseAck(); const input = f.request(); input.tasks[0].issueNumber = null;
    await synchronizeTasks(input, f.client, f.store, true); f.issues.pop();
    expect((await synchronizeTasks(input, f.client, f.store, true)).actions[0].kind).toBe('delivery-unknown');
    expect(f.sends()).toBe(1);
    const marker = f.ledger().bindings.T001.marker;
    f.issues.push({ number: 2001, title: '', body: marker, state: 'open' }, { number: 2002, title: '', body: marker, state: 'open' });
    expect((await synchronizeTasks(input, f.client, f.store, true)).actions[0].kind).toBe('conflict');
    expect(f.sends()).toBe(1);
  });
  it('surfaces closed owners and removed tasks without replacement or closure', async () => {
    const f = fixture(); await synchronizeTasks(f.request(), f.client, f.store, true);
    f.issues[0].state = 'closed';
    expect((await synchronizeTasks(f.request(), f.client, f.store, true)).actions[0].kind).toBe('closed-owner');
    const removed = f.request(); removed.tasks = [];
    expect((await synchronizeTasks(removed, f.client, f.store, true)).actions[0].kind).toBe('removed-projection');
    expect(f.ledger().bindings.T001.issueNumber).toBe(1698);
    expect(f.sends()).toBe(0);
  });
  it('requires traceable split/merge decisions and refuses identity replacement', async () => {
    const f = fixture(); await synchronizeTasks(f.request(), f.client, f.store, true);
    const replaced = f.request(); replaced.tasks[0].issueNumber = 9999;
    expect((await synchronizeTasks(replaced, f.client, f.store, true)).actions[0].kind).toBe('conflict');
    const merged = f.request(); merged.tasks.push({ ...merged.tasks[0], id: 'T002' });
    expect((await synchronizeTasks(merged, f.client, f.store, true)).actions.some((action) => action.kind === 'conflict')).toBe(true);
    merged.tasks[1].originTaskIds = ['T001'];
    for (const task of merged.tasks) task.decision = { kind: 'merge', ref: 'spec-surfaces/promotion/reconciliation.md' };
    expect((await synchronizeTasks(merged, f.client, f.store, true)).actions.every((action) => action.kind === 'bound')).toBe(true);
  });
  it('refuses unproven first-sync markers and reserved-marker injection', async () => {
    const f = fixture(); const input = f.request(); input.tasks[0].issueNumber = null;
    await synchronizeTasks(input, f.client, f.store, true);
    const marker = f.ledger().bindings.T001.marker;
    const fresh = fixture(); fresh.issues[0].body = marker;
    expect((await synchronizeTasks(input, fresh.client, fresh.store, true)).actions[0].kind).toBe('conflict');
    expect(fresh.sends()).toBe(0);
    input.tasks[0].body = marker;
    await expect(synchronizeTasks(input, fresh.client, fresh.store, true)).rejects.toThrow('Reserved');
  });
  it('validates the complete reconciliation graph before sending and independently of task order', async () => {
    const f = fixture(); const invalid = f.request(); invalid.tasks[0].issueNumber = null;
    invalid.tasks.push({ ...invalid.tasks[0], id: 'T002', originTaskIds: ['T999'], decision: { kind: 'split', ref: 'decisions/split-1' } });
    expect((await synchronizeTasks(invalid, f.client, f.store, true)).success).toBe(false);
    expect(f.sends()).toBe(0);
    const merged = f.request(); merged.tasks.push({ ...merged.tasks[0], id: 'T002' });
    for (const task of merged.tasks) task.decision = { kind: 'merge', ref: 'decisions/merge-1' };
    expect((await synchronizeTasks(merged, f.client, f.store, true)).success).toBe(false);
    const split = f.request(); split.tasks.unshift({ ...split.tasks[0], id: 'T002', issueNumber: null, findingRefs: [],
      originTaskIds: ['T001'], decision: { kind: 'split', ref: 'decisions/split-1' } });
    const result = await synchronizeTasks(split, f.client, f.store, true);
    expect(result.success).toBe(true);
    expect(result.ledger.bindings.T002.findingRefs).toEqual(['finding:promotion:profile']);
    expect(f.sends()).toBe(1);
  });
  it('keeps deferred identity conflicts and closed-owner status visible', async () => {
    const f = fixture(); await synchronizeTasks(f.request(), f.client, f.store, true);
    const input = f.request(); input.tasks[0].disposition = 'deferred'; input.tasks[0].issueNumber = 9999;
    expect((await synchronizeTasks(input, f.client, f.store, true)).actions[0].kind).toBe('conflict');
    input.tasks[0].issueNumber = null; f.issues[0].state = 'closed';
    expect((await synchronizeTasks(input, f.client, f.store, true)).actions[0].kind).toBe('closed-owner');
    input.tasks[0].closedDisposition = 'retain';
    expect((await synchronizeTasks(input, f.client, f.store, true)).actions[0].kind).toBe('deferred-projection');
  });
  it('rejects whitespace retry dispositions', async () => {
    const f = fixture(); const input = f.request();
    input.tasks[0].retryRef = ' ';
    await expect(synchronizeTasks(input, f.client, f.store, true)).rejects.toThrow();
  });
  it('does not recover a pending binding into another task owner', async () => {
    const f = fixture(); f.loseAck(); const input = f.request(); input.tasks[0].issueNumber = null;
    await synchronizeTasks(input, f.client, f.store, true);
    const marker = f.ledger().bindings.T001.marker;
    f.issues.pop(); f.issues[0].body = marker;
    input.tasks.push({ ...input.tasks[0], id: 'T002', issueNumber: 1698, decision: null });
    expect((await synchronizeTasks(input, f.client, f.store, true)).success).toBe(false);
    expect(f.ledger().bindings.T001.state).toBe('pending');
    expect(f.sends()).toBe(1);
  });
  it('rejects cyclic merge ancestry before persisting bindings', async () => {
    const f = fixture(); const input = f.request(); input.tasks.push({ ...input.tasks[0], id: 'T002' });
    input.tasks[0].originTaskIds = ['T002']; input.tasks[1].originTaskIds = ['T001'];
    for (const task of input.tasks) task.decision = { kind: 'merge', ref: 'decisions/cyclic' };
    expect((await synchronizeTasks(input, f.client, f.store, true)).success).toBe(false);
    expect(f.sends()).toBe(0);
  });
  it('consumes an explicit confirmed-not-delivered retry decision only once', async () => {
    const f = fixture(); f.loseAck(); const input = f.request(); input.tasks[0].issueNumber = null;
    await synchronizeTasks(input, f.client, f.store, true); f.issues.pop();
    input.tasks[0].retryRef = 'human-reconciliation/attempt-1';
    await synchronizeTasks(input, f.client, f.store, true); f.issues.pop();
    expect((await synchronizeTasks(input, f.client, f.store, true)).actions[0].kind).toBe('delivery-unknown');
    expect(f.sends()).toBe(2);
  });
  it('blocks split sends until closed original owners have explicit disposition', async () => {
    const f = fixture(); await synchronizeTasks(f.request(), f.client, f.store, true); f.issues[0].state = 'closed';
    const split = f.request(); split.tasks = [{ ...split.tasks[0], id: 'T002', issueNumber: null,
      originTaskIds: ['T001'], decision: { kind: 'split', ref: 'decisions/split-1' } }];
    expect((await synchronizeTasks(split, f.client, f.store, true)).success).toBe(false);
    expect(f.sends()).toBe(0);
    split.tasks.push({ ...f.request().tasks[0], closedDisposition: 'retain' });
    expect((await synchronizeTasks(split, f.client, f.store, true)).success).toBe(true);
    expect(f.sends()).toBe(1);
  });
  it('retries a split child without discarding its original lineage or reusing consumed decisions', async () => {
    const f = fixture(); await synchronizeTasks(f.request(), f.client, f.store, true); f.loseAck();
    const split = f.request(); split.tasks = [{ ...split.tasks[0], id: 'T002', issueNumber: null, findingRefs: [],
      originTaskIds: ['T001'], decision: { kind: 'split', ref: 'decisions/split-1' } }];
    await synchronizeTasks(split, f.client, f.store, true); f.issues.pop();
    split.tasks[0].retryRef = 'decisions/not-delivered-1';
    await synchronizeTasks(split, f.client, f.store, true); f.issues.pop();
    expect(f.sends()).toBe(2);
    expect(f.ledger().bindings.T002.originTaskIds).toEqual(['T001']);
    split.tasks[0].retryRef = 'decisions/not-delivered-2';
    await synchronizeTasks(split, f.client, f.store, true); f.issues.pop();
    split.tasks[0].retryRef = 'decisions/not-delivered-1';
    expect((await synchronizeTasks(split, f.client, f.store, true)).success).toBe(false);
    expect(f.sends()).toBe(3);
  });
  it('defers new work without creating an issue and keeps split lineage explicit', async () => {
    const f = fixture(); const deferred = f.request(); deferred.tasks[0].issueNumber = null; deferred.tasks[0].disposition = 'deferred';
    expect((await synchronizeTasks(deferred, f.client, f.store, true)).actions[0].kind).toBe('deferred-projection');
    expect(f.sends()).toBe(0);
    await synchronizeTasks(f.request(), f.client, f.store, true);
    const split = f.request(); split.tasks = ['T002', 'T003'].map((id) => ({ ...split.tasks[0], id, issueNumber: null,
      findingRefs: [], originTaskIds: ['T001'], decision: { kind: 'split', ref: 'human-reconciliation/split-1' } }));
    await synchronizeTasks(split, f.client, f.store, true);
    await synchronizeTasks(split, f.client, f.store, true);
    expect(f.sends()).toBe(2);
    expect(f.ledger().bindings.T002.findingRefs).toEqual(['finding:promotion:profile']);
    expect(f.ledger().bindings.T001.issueNumber).toBe(1698);
  });
});
