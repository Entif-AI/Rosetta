import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { canonicalTraceJson, parseTraceNormalization, traceHash, type TraceNormalizationReport } from './trace-normalization.js';
const good = () => parseTraceNormalization(JSON.parse(readFileSync('packages/ingress-refinery/test-vectors/trace/generated-edges.json', 'utf8')));
const rehash = (report: TraceNormalizationReport) => {
  const body = Object.fromEntries(Object.entries(report).filter(([key]) => key !== 'normalizedDigest'));
  return { ...body, normalizedDigest: traceHash(canonicalTraceJson(body)) };
};
describe('normalized trace public boundary', () => {
  it('validates serialized golden bytes and rejects schema/digest drift', () => {
    expect(good().profile).toBe('trace.normalization.v1');
    expect(() => parseTraceNormalization({ ...good(), normalizedDigest: '0'.repeat(64) })).toThrow('digest');
    expect(() => parseTraceNormalization({ ...good(), secretField: true })).toThrow('shape');
    expect(() => parseTraceNormalization({ profile: 'trace.normalization.v1' })).toThrow('shape');
  });
  it.each([
    ['added', 1, 'added', 'changed'],
    ['changed', 2, 'changed', 'unchanged'],
    ['removed', 2, 'removed', 'added'],
    ['repeated', 2, 'repeated', 'unchanged'],
    ['unchanged', 2, 'unchanged', 'repeated']
  ] satisfies [string, number, 'added' | 'changed' | 'removed' | 'repeated' | 'unchanged', 'added' | 'changed' | 'removed' | 'repeated' | 'unchanged'][])('rejects a false %s disposition despite a valid recomputed digest', (_name, index, from, to) => {
    const report = good();
    const id = report.deltas[index][from].shift();
    if (id === undefined) throw new Error('Regression fixture lacks selected disposition.');
    report.deltas[index][to].push(id);
    expect(() => parseTraceNormalization(rehash(report))).toThrow('Delta disposition');
  });
  it.each([0, 4])('rejects false normalizedBytes for snapshot %i despite a valid recomputed digest', index => {
    const report = good(); report.snapshots[index].normalizedBytes += 1;
    expect(() => parseTraceNormalization(rehash(report))).toThrow('Snapshot normalizedBytes');
  });
  it.each([
    ['missing transition', (r: TraceNormalizationReport) => { r.deltas.pop(); }],
    ['duplicate target', (r: TraceNormalizationReport) => { r.deltas[2].toSnapshotId = r.deltas[1].toSnapshotId; }],
    ['duplicate identity', (r: TraceNormalizationReport) => { r.deltas[2].deltaId = r.deltas[1].deltaId; }],
    ['missing member', (r: TraceNormalizationReport) => { r.deltas[2].removed.pop(); }],
    ['invented member', (r: TraceNormalizationReport) => { r.deltas[2].removed.push('never-present'); }],
    ['skipped predecessor', (r: TraceNormalizationReport) => { r.deltas[2].fromSnapshotId = r.snapshots[0].snapshotId; }],
    ['self predecessor', (r: TraceNormalizationReport) => { r.deltas[2].fromSnapshotId = r.snapshots[2].snapshotId; }],
    ['future predecessor', (r: TraceNormalizationReport) => { r.deltas[2].fromSnapshotId = r.snapshots[3].snapshotId; }],
    ['unknown emission', (r: TraceNormalizationReport) => { r.snapshots[2].emittedIds.push('never-present'); }]
  ] satisfies [string, (r: TraceNormalizationReport) => void][])('rejects %s with correctly rehashed assertions', (_name, mutate) => {
    const report = good(); mutate(report);
    expect(() => parseTraceNormalization(rehash(report))).toThrow();
  });
  it('rejects invalid temporal roles and repeated source identities', () => {
    const invalid = good(); invalid.records[0].time.recorded = 'not-a-time';
    expect(() => parseTraceNormalization(rehash(invalid))).toThrow('time');
    const duplicate = good(); duplicate.records[1].recordId = duplicate.records[0].recordId;
    expect(() => parseTraceNormalization(rehash(duplicate))).toThrow('source records');
  });
  it('rejects dangling references and overlapping dispositions even with a correct envelope hash', () => {
    const missing = good();
    missing.snapshots[0].objects[0].content = { kind: 'dictionary', payloadRef: 'missing' };
    expect(() => parseTraceNormalization(rehash(missing))).toThrow('payload reference');
    const overlap = good(); overlap.deltas[0].changed = [...overlap.deltas[0].added];
    expect(() => parseTraceNormalization(rehash(overlap))).toThrow('Overlapping');
    const dictionary = good(); dictionary.payloadDictionary[0].value = 'tampered';
    expect(() => parseTraceNormalization(rehash(dictionary))).toThrow('Payload identity');
  });
});
