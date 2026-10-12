import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { normalizeTrace } from '@entif-ai/ingress-refinery';
import { measureTraceKinematics } from './trace-kinematics.js';
const trace = (name: string) => JSON.parse(readFileSync(`packages/ingress-refinery/test-vectors/trace/${name}.json`, 'utf8'));
describe('trace-kin-v1', () => {
  it('matches the independently declared S0-S5 literal morphology series', () => {
    const result = measureTraceKinematics(trace('generated-edges'));
    const expected: unknown = JSON.parse(readFileSync('packages/projection-adapters/test-vectors/trace/generated-kinematics.expected.json', 'utf8'));
    expect(result.metrics.map(m => ({ sourceBytes: m.sourceBytes, normalizedBytes: m.normalizedBytes, recordCount: m.recordCount, objectCount: m.objectCount, uniqueObjectIds: m.uniqueObjectIds, duplicatePayloads: m.duplicatePayloads, deltaCounts: m.deltaCounts, survivors: m.survivors, disappeared: m.disappeared, reappeared: m.reappeared, objectShrinkRatio: m.objectShrinkRatio, byteShrinkRatio: m.byteShrinkRatio, representation_shrink: m.representation_shrink, compaction_candidate: m.compaction_candidate }))).toEqual(expected);
    expect(result.metrics.every(m => m.repeatedRequests === 0 && m.repeatedTools === 0 && m.repeatedResults === 0 && m.unchangedResults === 0)).toBe(true);
    expect(result).toEqual(measureTraceKinematics(trace('generated-edges')));
    expect(result.caveat).toContain('client-visible');
  });
  it('distinguishes recurring result identity from unchanged result content', () => {
    const event = (part: string) => 'event: message\ndata: ' + JSON.stringify({ conversation_id: 'run', message: { id: 'tool-1', author: { role: 'tool' }, metadata: { request_id: 'request-1' }, status: 'finished_successfully', content: { parts: [part] } } }) + '\n\n';
    const n = normalizeTrace(event('same') + event('same') + event('changed'), { sourceFixtureRef: 'generated-result-recurrence', recordedAt: '2000-01-01T00:00:00.000Z' });
    const result = measureTraceKinematics(n);
    expect(result.metrics[2]).toMatchObject({ repeatedRequests: 2, repeatedTools: 2, repeatedResults: 2, unchangedResults: 1, representation_shrink: false });
    expect(result.metrics[1].deltaCounts.repeated).toBe(1);
    expect(result.metrics[2].deltaCounts.changed).toBe(1);
  });
  it('counts explicit captured request recurrence without asserting causality', () => {
    const result = measureTraceKinematics(trace('captured-derived'));
    expect(result.metrics.find(m => m.sourceSequence === 5)?.repeatedRequests).toBe(3);
    expect(result.metrics.find(m => m.sourceSequence === 12)?.repeatedRequests).toBe(6);
    expect(result.metrics).toHaveLength(66);
  });
});
