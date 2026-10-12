import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { canonicalTraceJson, traceHash } from './trace-normalization.js';
import { parseTraceKinematics } from './trace-kinematics.js';
describe('kinematics public admission', () => {
  it('rejects wrong digests, hidden-state claims and unjustified reset candidates', () => {
    const input: unknown = JSON.parse(readFileSync('packages/projection-adapters/test-vectors/trace/generated-edges.kinematics.json', 'utf8'));
    const report = parseTraceKinematics(input);
    expect(() => parseTraceKinematics({ ...report, resultDigest: 'wrong' })).toThrow('digest');
    expect(() => parseTraceKinematics({ ...report, caveat: 'Provider memory has been compacted.' })).toThrow('shape');
    report.metrics[4].compaction_candidate = true;
    const body = Object.fromEntries(Object.entries(report).filter(([key]) => key !== 'resultDigest'));
    expect(() => parseTraceKinematics({ ...body, resultDigest: traceHash(canonicalTraceJson(body)) })).toThrow('criteria');
  });
});
