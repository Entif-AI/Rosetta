import { describe, expect, it } from 'vitest';
import { validatePayload } from './rosetta-schemas.js';
import { appendWorkLifecycleRecord, materializeWorkLifecycle, parseWorkLifecycleRecord, WORK_LIFECYCLE_SCHEMA } from './work-lifecycle.js';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

function record(event = 'declared', extra: Record<string, unknown> = {}) {
  return {
    recordId: `record:${event}`, profile: { id: 'work.lifecycle.v1', version: '1.0.0' },
    workRef: 'work:software', event, createdAt: '2026-10-04T06:00:00Z',
    objectiveRefs: ['objective:repair'], commitmentRefs: ['commitment:repair'],
    acceptanceRefs: ['acceptance:red-green'], evidenceRefs: ['evidence:result'],
    receiptRefs: ['receipt:result'], provenanceRefs: ['provenance:adapter'], ...extra
  };
}
const valid = (value: object) => validatePayload('work.lifecycle.v1', value).ok;

describe('public bounded-work lifecycle admission', () => {
  it('represents explicit blocked dependencies and separate readiness/dispatch events', () => {
    expect(valid(record('blocked', { dependencyRefs: ['work:dependency'], disposition: 'blocked' }))).toBe(true);
    expect(valid(record('ready'))).toBe(true);
    expect(valid(record('dispatched', { procedureRef: 'procedure:test', capabilityRefs: ['capability:test'], executorRef: 'executor:worker', contextRef: 'context:bounded' }))).toBe(true);
  });
  it('admits completed execution rejected by an independent verifier and repair continuation', () => {
    expect(valid(record('completed', { resultRef: 'result:attempt', executorRef: 'executor:worker', disposition: 'completed' }))).toBe(true);
    expect(valid(record('verification_rejected', { resultRef: 'result:attempt', executorRef: 'executor:worker', verifierRefs: ['executor:reviewer'], disposition: 'rejected' }))).toBe(true);
    expect(valid(record('repair_required', { priorRecordRef: 'record:verification_rejected', continuationRef: 'work:repair', disposition: 'repair_required' }))).toBe(true);
  });
  it('represents human review, non-software integration and different orchestrator adapters', () => {
    expect(valid(record('human_requested', { contextRef: 'context:review' }))).toBe(true);
    expect(valid(record('human_responded', { priorRecordRef: 'record:human_requested' }))).toBe(true);
    for (const adapterProfileRef of ['orchestrator:a', 'orchestrator:b']) {
      expect(valid(record('integrated', { workRef: 'work:community-garden', adapterProfileRef, integrationRefs: ['integration:garden'], verificationRef: 'record:garden-verification', disposition: 'accepted' }))).toBe(true);
    }
  });
  it('rejects completion presented as automatic independent verification', () => {
    expect(valid(record('completed', { disposition: 'accepted', executorRef: 'executor:worker', resultRef: 'result:attempt' }))).toBe(false);
    expect(valid(record('verification_accepted', { disposition: 'accepted', executorRef: 'executor:worker', verifierRefs: ['executor:worker'], resultRef: 'result:attempt' }))).toBe(false);
    expect(valid(record('verification_accepted', { disposition: 'accepted', executorRef: 'executor:worker', resultRef: 'result:attempt' }))).toBe(false);
  });
  it('rejects integration without a separately referenced verification and outcome', () => {
    expect(valid(record('integrated', { disposition: 'accepted' }))).toBe(false);
  });
  it('rejects procedure/executor conflation and incomplete dispatch', () => {
    expect(valid(record('dispatched', { procedureRef: 'same:identity', executorRef: 'same:identity' }))).toBe(false);
    expect(valid(record('dispatched', { executorRef: 'executor:worker' }))).toBe(false);
  });
  it('rejects authority escalation and private policy at public boundaries', () => {
    for (const extra of [{ writeAuthority: true }, { routingPolicy: 'private' }, { schedulingWeights: [1, 2] }]) expect(valid(record('dispatched', { procedureRef: 'procedure:test', executorRef: 'executor:worker', ...extra }))).toBe(false);
    expect(valid(record('declared', { profile: { id: 'work.lifecycle.v1', version: '1.0.0', writeAuthority: true } }))).toBe(false);
  });
  it('requires attributable immutable identity, receipts, provenance and supported version', () => {
    for (const extra of [{ recordId: '' }, { receiptRefs: null }, { provenanceRefs: [] }, { createdAt: '2026-02-30T00:00:00Z' }, { priorRecordRef: 'record:declared' }, { continuationRef: 'work:software' }, { profile: { id: 'work.lifecycle.v1', version: '2.0.0' } }]) expect(valid(record('declared', extra))).toBe(false);
  });
  it('preserves explicit absence of a historical receipt without fabricating one', () => {
    expect(valid(record('declared', { receiptRefs: [] }))).toBe(true);
  });
});

function history(...events: object[]) {
  return events.map((event, i) => parseWorkLifecycleRecord({ ...event, recordId: `record:${i}`, ...(i ? { priorRecordRef: `record:${i - 1}` } : {}) }));
}
const completed = () => record('completed', { executorRef: 'executor:worker', resultRef: 'result:attempt', disposition: 'completed' });
const verified = (event = 'verification_accepted') => record(event, { executorRef: 'executor:worker', resultRef: 'result:attempt', verifierRefs: ['executor:reviewer'], disposition: event === 'verification_accepted' ? 'accepted' : 'rejected' });

describe('append-only history and separate materialized current state', () => {
  it('does not infer verification or integration from completion', () => {
    const records = history(record(), completed());
    const before = JSON.stringify(records);
    expect(materializeWorkLifecycle(records)).toMatchObject({ execution: { state: 'completed' }, verification: { state: 'unverified' }, integration: { state: 'not_recorded' } });
    expect(JSON.stringify(records)).toBe(before);
  });
  it('materializes explicit verification and non-software integration independently', () => {
    const records = history(record(), completed(), verified(), record('integrated', { disposition: 'accepted', integrationRefs: ['integration:garden'], verificationRef: 'record:2' })).map(r => ({ ...r, workRef: 'work:community-garden' }));
    expect(materializeWorkLifecycle(records)).toMatchObject({ workRef: 'work:community-garden', execution: { state: 'completed' }, verification: { state: 'accepted' }, integration: { state: 'integrated', verificationRef: 'record:2' } });
  });
  it('keeps recorded integration visible when later verification rejects it', () => {
    const records = history(record(), completed(), verified(), record('integrated', { disposition: 'accepted', integrationRefs: ['integration:garden'], verificationRef: 'record:2' }), verified('verification_rejected'));
    expect(materializeWorkLifecycle(records)).toMatchObject({ verification: { state: 'rejected' }, integration: { state: 'integrated' } });
  });
  it('rejects integration based on superseded verification evidence', () => {
    const records = history(record(), completed(), verified(), verified('verification_rejected'), record('integrated', { disposition: 'accepted', integrationRefs: ['integration:garden'], verificationRef: 'record:2' }));
    expect(() => materializeWorkLifecycle(records)).toThrow(/verification/i);
  });
  it('rejects overwritten identities, unresolved references and mixed-work histories', () => {
    const records = history(record(), completed());
    expect(() => appendWorkLifecycleRecord(records, { ...records[1], evidenceRefs: ['evidence:changed'] })).toThrow(/conflict/);
    expect(() => materializeWorkLifecycle([{ ...records[1], priorRecordRef: undefined }])).not.toThrow();
    expect(() => materializeWorkLifecycle(history(record(), verified()))).toThrow(/earlier/);
    expect(() => materializeWorkLifecycle([records[0], { ...records[1], priorRecordRef: 'record:missing' }])).toThrow(/prior/);
    expect(() => materializeWorkLifecycle([records[0], { ...records[1], workRef: 'work:other' }])).toThrow(/bounded work/);
  });
  it('reingests identical records idempotently and isolates the returned history', () => {
    const records = history(record(), completed());
    const next = appendWorkLifecycleRecord(records, structuredClone(records[1]));
    expect(next).toEqual(records);
    next[0].receiptRefs.push('receipt:later');
    expect(records[0].receiptRefs).toEqual(['receipt:result']);
  });
  it('rejects new-attempt verification without a resolvable attributed result', () => {
    expect(() => materializeWorkLifecycle(history(record(), completed(), { ...verified(), executorRef: 'executor:other' }))).toThrow(/attributed/);
    const records = history(record(), completed(), verified(), { ...completed(), resultRef: 'result:repair' });
    expect(materializeWorkLifecycle(records).verification.state).toBe('unverified');
  });
});

describe('published lifecycle contract', () => {
  it('ships the exact schema used by the runtime validator', () => {
    const schema = JSON.parse(readFileSync(resolve(process.cwd(), 'packages/rosetta-schemas/docs/work-lifecycle-v1.schema.json'), 'utf8'));
    expect(schema).toEqual(WORK_LIFECYCLE_SCHEMA);
  });
  it('admits the public conformance vectors with their declared outcome', () => {
    const root = resolve(process.cwd(), 'packages/rosetta-schemas/test-vectors/work-lifecycle');
    for (const name of readdirSync(root).filter(n => n.endsWith('.json'))) {
      const fixture = JSON.parse(readFileSync(resolve(root, name), 'utf8')) as { expectOk: boolean; records: unknown[]; currentState?: object };
      expect(fixture.records.every(r => valid(r as object)), name).toBe(fixture.expectOk);
      if (fixture.currentState) expect(materializeWorkLifecycle(fixture.records.map(parseWorkLifecycleRecord)), name).toEqual(fixture.currentState);
    }
  });
});
