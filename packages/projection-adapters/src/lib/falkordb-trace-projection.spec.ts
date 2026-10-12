import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { type Graph } from 'falkordb';
import { TRACE_NODE_LABELS } from '@entif-ai/rosetta-schemas';
import { buildTraceProjection } from './trace-projection.js';
import { createTraceFalkorClient, importTraceFalkorProjection, resetTraceFalkorProjection, waitForTraceFalkorConstraints } from './falkordb-trace-projection.js';

const constraints = () => [
  ...TRACE_NODE_LABELS.map(label => ({ type: 'UNIQUE', entitytype: 'NODE', label, properties: ['id'], status: 'OPERATIONAL' })),
  ...[['SourceArtifact', 'cid'], ['TracePayload', 'sha256']].map(([label, key]) => ({ type: 'UNIQUE', entitytype: 'NODE', label, properties: ['projectionId', key], status: 'OPERATIONAL' }))
];
describe('FalkorDB fixture projection boundary', () => {
  it('rejects remote endpoints and invalid connection identities before opening a client', async () => {
    for (const options of [
      { host: 'example.org', port: 16379, graphName: 'entif_trace_1735' },
      { host: '127.0.0.1', port: 0, graphName: 'entif_trace_1735' },
      { host: '127.0.0.1', port: 16379, graphName: '' }
    ]) await expect(createTraceFalkorClient(options)).rejects.toThrow();
  });
  it('rejects a tampered closure before any schema or graph mutation', async () => {
    const p = buildTraceProjection(JSON.parse(readFileSync('packages/ingress-refinery/test-vectors/trace/generated-edges.json', 'utf8')), { projectionId: 'test', sourceArtifactCid: 'fixture-source-cid' });
    p.nodes[0].properties.id = 'foreign';
    const query = vi.fn();
    await expect(importTraceFalkorProjection({ query, roQuery: vi.fn(), constraintCreate: vi.fn() }, p)).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });
  it('refuses an empty namespace before reset', async () => {
    const query = vi.fn();
    await expect(resetTraceFalkorProjection({ query }, ' ')).rejects.toThrow('projectionId');
    expect(query).not.toHaveBeenCalled();
  });
});

describe('asynchronous FalkorDB constraint gate', () => {
  it('waits past PENDING until all required constraints are OPERATIONAL', async () => {
    const ready = constraints();
    const roQuery = vi.fn<Graph['roQuery']>()
      .mockResolvedValueOnce({ data: ready.map(row => ({ ...row, status: 'PENDING' })), metadata: [] })
      .mockResolvedValue({ data: ready, metadata: [] });
    expect(await waitForTraceFalkorConstraints({ roQuery: roQuery as Graph['roQuery'] }, { timeoutMs: 1000, pollIntervalMs: 1 })).toEqual(ready);
    expect(roQuery).toHaveBeenCalledTimes(2);
  });
  it('fails truthfully when a required constraint is FAILED', async () => {
    const rows = constraints(); rows[0].status = 'FAILED';
    const roQuery = vi.fn<Graph['roQuery']>().mockResolvedValue({ data: rows, metadata: [] });
    await expect(waitForTraceFalkorConstraints({ roQuery: roQuery as Graph['roQuery'] })).rejects.toThrow('FAILED');
  });
  it('times out on UNDER CONSTRUCTION without claiming readiness', async () => {
    const roQuery = vi.fn<Graph['roQuery']>().mockResolvedValue({ data: constraints().map(row => ({ ...row, status: 'UNDER CONSTRUCTION' })), metadata: [] });
    await expect(waitForTraceFalkorConstraints({ roQuery: roQuery as Graph['roQuery'] }, { timeoutMs: 0 })).rejects.toThrow('timeout');
  });
  it('requires every constraint, including composite source and payload identities', async () => {
    const roQuery = vi.fn<Graph['roQuery']>().mockResolvedValue({ data: constraints().slice(0, -1), metadata: [] });
    await expect(waitForTraceFalkorConstraints({ roQuery: roQuery as Graph['roQuery'] }, { timeoutMs: 0 })).rejects.toThrow('timeout');
  });
});
