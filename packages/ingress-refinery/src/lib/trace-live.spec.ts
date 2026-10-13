import { describe, expect, it } from 'vitest';
import { normalizeBoundaryTrace } from './trace-live.js';

const options = { recordedAt: '2026-10-08T00:00:00.000Z', maturity: 'fixture' as const };
const refs = { run: 'private-run', session: 'private-session', conversation: 'private-conversation', request: 'private-request', operation: 'private-operation', tool: 'private-tool', receipt: 'private-receipt' };
const event = (family = 'mcp', eventType = 'mcp-request', id = 'event-1', extra = {}) => ({
  family, eventType, eventId: id, producerId: `private-${family}`, producerVersion: 'fixture-v1',
  observedAt: '2026-10-08T00:00:01.000Z', correlation: refs, payload: { status: 'ok' }, ...extra,
});
const encode = (events: unknown[]) => events.map(e => JSON.stringify(e)).join('\n') + '\n';
const exportable = (result: ReturnType<typeof normalizeBoundaryTrace>) => JSON.stringify({
  source: result.source, fixture: result.fixture, report: result.report, normalization: result.normalization,
});

describe('TRACE-LIVE bounded source adapter', () => {
  it('admits three producer families through existing source and TRACE-NORM contracts', () => {
    const raw = encode([event('tunnel', 'tunnel-health'), event(), event('device', 'device-observation')]);
    const result = normalizeBoundaryTrace(raw, options);
    expect(result.localEvidence.source.bytes).toBe(raw);
    expect(result.source.original.payload.accessRequirements).toContain('no-external-publish');
    expect(result.source.derived.parents).toContain(result.source.original.cid);
    expect(result.source.episode.payload.family).toBe('journal-log');
    expect(result.source.profiles).toHaveLength(3);
    expect(result.normalization.records).toHaveLength(3);
    expect(result.normalization.snapshots).toHaveLength(3);
    expect(result.report.retainedEvents).toBe(3);
    expect(Object.values(refs).some(ref => exportable(result).includes(ref))).toBe(false);
    expect(normalizeBoundaryTrace(raw, options)).toEqual(result);
  });
  it('excludes auth, paths, arbitrary text and sensitive identifiers without erasing local evidence', () => {
    const raw = encode([event('mcp', 'mcp-result', 'sensitive', {
      headers: { authorization: 'Bearer AUTH_FIXTURE' }, cookie: 'COOKIE_FIXTURE',
      correlation: { ...refs, request: '/Users/fixture/private/token' },
      payload: { status: 'ok', token: 'TOKEN_FIXTURE', path: '/Users/fixture/private', text: 'IDENTITY_FIXTURE', nested: { cookie: 'COOKIE_FIXTURE' } },
    })]);
    const result = normalizeBoundaryTrace(raw, options);
    expect(exportable(result)).not.toMatch(/AUTH_FIXTURE|COOKIE_FIXTURE|TOKEN_FIXTURE|IDENTITY_FIXTURE|Bearer|\/Users\//);
    expect(result.localEvidence.source.bytes).toContain('AUTH_FIXTURE');
    expect(result.report.omittedFields).toBeGreaterThan(0);
    expect(result.report.omittedPayloadBytes).toBeGreaterThan(0);
    expect(result.normalization.records[0].resultForRef).toBe(result.normalization.records[0].requestRef);
  });
  it('externalizes identical large payloads once and keeps occurrences and exact byte counts', () => {
    const payload = { text: 'SENSITIVE_BODY'.repeat(80) };
    const a = event('mcp', 'mcp-result', 'large-1', { payload });
    const result = normalizeBoundaryTrace(encode([a, event('device', 'device-observation', 'large-2', { payload }), a]), options);
    expect(result.report.rawEvents).toBe(3);
    expect(result.report.retainedEvents).toBe(2);
    expect(result.report.duplicateEvents).toBe(1);
    expect(result.report.externalizedEvents).toBe(2);
    expect(result.localEvidence.payloads).toHaveLength(1);
    expect(result.report.externalizedBytes).toBe(result.report.uniqueExternalizedBytes * 2);
    expect(exportable(result)).not.toContain('SENSITIVE_BODY');
    expect(result.localEvidence.payloads[0].bytes).toContain('SENSITIVE_BODY');
    expect(result.report.occurrences[0].count).toBe(2);
  });
  it('keeps absent joins unresolved and does not group unrelated unscoped events into one run', () => {
    const result = normalizeBoundaryTrace(encode([event('mcp', 'mcp-request', 'a', { correlation: {} }), event('device', 'device-action', 'b', { correlation: {} })]), options);
    expect(result.report.unresolvedEvents).toBe(2);
    expect(result.report.unresolved[0].fields).toContain('request');
    expect(result.normalization.records[0].requestRef).toBeUndefined();
    expect(result.normalization.records[0].runRef).not.toBe(result.normalization.records[1].runRef);
  });
  it('preserves unsupported/malformed source locally and accounts for omissions without guessing', () => {
    const raw = encode([event('browser', 'unrecognized', 'unsupported')]) + 'malformed AUTH_FIXTURE\n';
    const result = normalizeBoundaryTrace(raw, options);
    expect(result.localEvidence.source.bytes).toBe(raw);
    expect(result.report.omittedEvents).toBe(2);
    expect(result.report.omittedBytes).toBe(Buffer.byteLength(raw));
    expect(result.normalization.records).toHaveLength(0);
    expect(exportable(result)).not.toContain('AUTH_FIXTURE');
  });
  it('refuses conflicting event identities and bounded-input overflow', () => {
    expect(() => normalizeBoundaryTrace(encode([event(), event('mcp', 'mcp-request', 'event-1', { payload: { status: 'failed' } })]), options)).toThrow(/identity conflict/i);
    expect(() => normalizeBoundaryTrace('x'.repeat(4 * 1024 * 1024 + 1), options)).toThrow(/limit/i);
    expect(() => normalizeBoundaryTrace(encode(Array.from({ length: 65 }, (_, i) => event('mcp', 'mcp-request', `bounded-${i}`))), options)).toThrow(/limit/i);
  });
  it('declares fixture maturity and preserves relative source time without promoting it to live proof', () => {
    const result = normalizeBoundaryTrace(encode([event(), event('device', 'device-observation', 'later', { observedAt: '2026-10-08T00:00:03.000Z' })]), options);
    expect(result.report.maturity).toBe('fixture');
    expect(result.normalization.records.map(r => r.time.sourceEvent)).toEqual(['2000-01-01T00:00:00.000Z', '2000-01-01T00:00:02.000Z']);
    expect(result.normalization.records.every(r => r.time.basis === 'relative-redacted')).toBe(true);
  });
});
