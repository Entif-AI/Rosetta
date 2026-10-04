import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { canonicalTraceJson } from '@entif-ai/rosetta-schemas';
import { normalizeTrace } from './trace-normalizer.js';
const fixture = (name: string) => readFileSync(`packages/source-substrate/test-vectors/trace/${name}.sse`, 'utf8');
const options = { sourceFixtureRef: 'generated-edges', recordedAt: '2000-01-01T00:01:00.000Z', observedAt: '2000-01-01T00:00:30.000Z' };
describe('trace.normalization.v1', () => {
  it('replays exact deltas and dictionary references without model calls', () => {
    const raw = fixture('generated-edges');
    const n = normalizeTrace(raw, options);
    expect(canonicalTraceJson(n)).toBe(canonicalTraceJson(normalizeTrace(raw, options)));
    expect(n.snapshots).toHaveLength(6);
    expect(n.snapshots.map(s => s.normalizedBytes)).toEqual([1000, 1200, 760, 900, 200, 920]);
    expect(n.deltas[1]).toMatchObject({ added: ['E'], changed: ['A'], removed: [], repeated: [], unchanged: ['B', 'C', 'D'] });
    expect(n.deltas[2]).toMatchObject({ added: [], changed: ['A'], removed: ['B', 'D'], repeated: ['C'], unchanged: ['E'] });
    expect(n.deltas[3]).toMatchObject({ added: ['F'], unchanged: ['A', 'C', 'E'] });
    expect(n.deltas[4]).toMatchObject({ added: ['X'], removed: ['A', 'C', 'E', 'F'] });
    expect(n.deltas[5]).toMatchObject({ added: ['B'], removed: ['F'], repeated: ['A', 'C', 'E'] });
    expect(n.payloadDictionary.length).toBeGreaterThan(0);
    expect(n.loss.some(x => x.action === 'externalized')).toBe(true);
    expect(n.records[0].time).toEqual({ sourceEvent: '2000-01-01T00:00:00.000Z', observed: options.observedAt, recorded: options.recordedAt, basis: 'fixture' });
    expect(canonicalTraceJson(n)).not.toContain('CAUSES');
  });
  it('retains malformed/unknown records and distinguishes materialization from event time', () => {
    const n = normalizeTrace('event: unknown\ndata: malformed\n\n', options);
    expect(n.records[0].unknown).toEqual({ data: 'malformed' });
    expect(n.loss.some(x => x.action === 'preserved-unknown')).toBe(true);
    expect(n.snapshots).toHaveLength(0);
  });
  it('normalizes the captured derivative with explicit identity and hoisting scope', () => {
    const n = normalizeTrace(fixture('captured-derived'), { ...options, sourceFixtureRef: 'captured-derived' });
    expect(n.records).toHaveLength(75);
    expect(n.snapshots.length).toBeGreaterThan(0);
    expect(n.hoisted.conversation_id).toBe('conversation-001');
    expect(n.records.some(r => r.parentRef && r.requestRef)).toBe(true);
    expect(n.records.some(r => r.resultForRef)).toBe(true);
    expect(n.normalizedDigest).not.toBe(normalizeTrace(fixture('captured-derived'), { ...options, profileVersion: 'trace-norm-v2' }).normalizedDigest);
  });
});
