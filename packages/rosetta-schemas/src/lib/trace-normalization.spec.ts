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
