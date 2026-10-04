import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { createEngineeringCompletion, parseEngineeringCompletion, renderEngineeringCompletion, appendEngineeringCompletion } from './engineering-completion.js';

const fixture = (name = 'akasha-1725') => JSON.parse(readFileSync(`tools/engineering-evidence/completions/${name}.json`, 'utf8'));
const recreate = (value: ReturnType<typeof fixture>) => {
  const { envelopeId, ...body } = value;
  expect(envelopeId).toBeDefined();
  return createEngineeringCompletion(body);
};

describe('terminal source-linked engineering completion', () => {
  it('admits two real historical runs while keeping unavailable model/effort unknown', () => {
    for (const name of ['akasha-1725', 'specops-1723']) {
      const envelope = parseEngineeringCompletion(fixture(name));
      expect(envelope.result.disposition).toBe('integrated');
      expect(envelope.observations.model.status).toBe('unknown');
      expect(envelope.observations.reasoning.status).toBe('unknown');
      expect(renderEngineeringCompletion(envelope)).toContain(envelope.runRef);
      expect(renderEngineeringCompletion(envelope)).toContain('unknown');
      expect(recreate(envelope)).toEqual(envelope);
    }
  });
  it('preserves shared-meter uncertainty and checkpoint duration rather than total runtime', () => {
    const envelope = parseEngineeringCompletion(fixture('specops-1723'));
    const quota = envelope.observations.quota;
    expect(quota.status).toBe('observed');
    if (quota.status === 'observed') expect(quota.value.every(q => q.attribution === 'shared-seat-unattributed')).toBe(true);
    const duration = envelope.observations.duration;
    if (duration.status === 'observed') expect(duration.value.basis).toBe('checkpoint-interval');
    expect(envelope.observations.startedAt.status).toBe('unknown');
  });
  it('rejects fabricated unavailable values, unsupported policy and unattributed known claims', () => {
    for (const mutate of [
      (v: ReturnType<typeof fixture>) => { v.observations.model = { status: 'unknown', reason: 'not exposed', evidenceRefs: [], value: 'invented' }; },
      (v: ReturnType<typeof fixture>) => { v.observations.tokens = { status: 'observed', value: 123, evidenceRefs: [] }; },
      (v: ReturnType<typeof fixture>) => { v.routingPolicy = 'choose a model'; },
      (v: ReturnType<typeof fixture>) => { v.observations.cache.value = { hiddenCacheHitRate: 0.9 }; },
      (v: ReturnType<typeof fixture>) => { v.independentVerification[0].independence = 'executor-attested'; }
    ]) { const value = fixture(); mutate(value); expect(() => recreate(value)).toThrow(); }
  });
  it('does not infer integration or independent acceptance from execution completion', () => {
    const value = fixture();
    value.lifecycleRecords = value.lifecycleRecords.filter((r: { event: string }) => r.event !== 'integrated');
    expect(() => recreate(value)).toThrow(/integration/i);
    const noVerifier = fixture(); noVerifier.independentVerification = [];
    expect(() => recreate(noVerifier)).toThrow(/verification/i);
  });
  it('requires recorded completion and accepted verification for the actual verified subject', () => {
    const declared = fixture();
    declared.result.disposition = 'verified';
    declared.lifecycleRecords = declared.lifecycleRecords.filter((r: { event: string }) => r.event === 'declared');
    expect(() => recreate(declared)).toThrow(/completion|verification/i);
    const wrongSubject = fixture();
    wrongSubject.independentVerification.forEach((v: { subjectRef: string }) => { v.subjectRef = wrongSubject.workRefs[0]; });
    expect(() => recreate(wrongSubject)).toThrow(/subject|verification/i);
  });
  it('retains separately recorded integration as an external fact after later rejection', () => {
    const value = fixture();
    const accepted = value.lifecycleRecords.find((r: { event: string }) => r.event === 'verification_accepted');
    value.lifecycleRecords.push({ ...accepted, recordId: 'urn:synthetic:later-rejection', priorRecordRef: value.lifecycleRecords.at(-1).recordId, event: 'verification_rejected', disposition: 'rejected' });
    expect(recreate(value).result.disposition).toBe('integrated');
    value.result.disposition = 'verified';
    expect(() => recreate(value)).toThrow(/verification/i);
  });
  it('detects digest mutations, missing claim sources and unavailable quota attribution', () => {
    const changed = fixture(); changed.limitations.push('later correction');
    expect(() => parseEngineeringCompletion(changed)).toThrow(/digest|identity/i);
    const missing = fixture(); missing.sources = missing.sources.slice(1);
    expect(() => recreate(missing)).toThrow(/reference|source/i);
    const quota = fixture('specops-1723'); quota.observations.quota.value[0].attribution = 'run-attributed';
    expect(() => recreate(quota)).toThrow();
  });
  it('preserves correction history and rejects unresolved or cross-run supersession', () => {
    const previous = parseEngineeringCompletion(fixture());
    const correction = recreate({ ...previous, createdAt: '2026-10-04T07:00:00Z', supersedesRefs: [previous.envelopeId], limitations: [...previous.limitations, 'Attributable later correction.'] });
    const history = appendEngineeringCompletion([previous], correction);
    expect(history).toEqual([previous, correction]);
    expect(appendEngineeringCompletion(history, correction)).toEqual(history);
    const unresolved = recreate({ ...previous, supersedesRefs: ['sha256:' + 'a'.repeat(64)] });
    expect(() => appendEngineeringCompletion([previous], unresolved)).toThrow(/supersession/i);
    expect(() => appendEngineeringCompletion([previous], parseEngineeringCompletion(fixture('specops-1723')))).toThrow(/run/i);
  });
  it('backfills a fresh current-batch completion without claiming unmerged integration', () => {
    const current = parseEngineeringCompletion(fixture('batch-1732-lifecycle-1509'));
    expect(current.result.disposition).toBe('verified');
    expect(current.lifecycleRecords.some(r => r.event === 'integrated')).toBe(false);
    expect(current.observations.delegation).toMatchObject({ status: 'observed', value: [] });
    expect(current.validation.filter(v => v.disposition === 'failed')).toHaveLength(4);
    expect(current.observations.repairs.status).toBe('observed');
  });
});
