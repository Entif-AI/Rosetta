import { expect, it } from 'vitest';
import { normalizeBoundaryTrace } from '@entif-ai/ingress-refinery';
import { buildTraceProjection } from './trace-projection.js';

it('projects admitted boundary events with request/result correlation and independent source lineage', () => {
  const raw = ['mcp-request', 'mcp-result'].map((eventType, index) => JSON.stringify({
    family: 'mcp', eventType, eventId: `fixture-${index}`, producerId: 'fixture-mcp', producerVersion: 'fixture-v1',
    correlation: { run: 'r', request: 'q' }, payload: { status: 'ok' },
  })).join('\n');
  const result = normalizeBoundaryTrace(raw, { recordedAt: '2026-10-08T00:00:00.000Z', maturity: 'fixture' });
  const projection = buildTraceProjection(result.normalization, { projectionId: 'live-fixture', sourceArtifactCid: result.source.derived.cid });
  expect(projection.edges.some(edge => edge.type === 'DERIVED_FROM')).toBe(true);
  expect(projection.edges.filter(edge => edge.type === 'REQUEST_REF')).toHaveLength(2);
  expect(projection.edges.filter(edge => edge.type === 'RESULT_FOR')).toHaveLength(1);
  expect(result.normalization.records[0].requestRef).toBe(result.normalization.records[1].resultForRef);
});
