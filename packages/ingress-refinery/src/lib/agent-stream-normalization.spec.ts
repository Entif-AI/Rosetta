import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import type { AgentStreamFixtureManifest } from '@entif-ai/source-substrate';

import { normalizeAgentStreamRecords, normalizeAgentStreamSource, reconstructAgentStreamRecords, verifyAgentStreamNormalizationContent } from './agent-stream-normalization.js';

const fixtureUrl = new URL('../../../source-substrate/src/fixtures/agent-stream-synthetic.ndjson', import.meta.url);
const manifestUrl = new URL('../../../source-substrate/src/fixtures/agent-stream-synthetic.manifest.json', import.meta.url);

async function loadFixture(): Promise<{ bytes: Uint8Array; manifest: AgentStreamFixtureManifest }> {
  const [bytes, manifestBytes] = await Promise.all([readFile(fixtureUrl), readFile(manifestUrl)]);
  return { bytes, manifest: JSON.parse(manifestBytes.toString()) as AgentStreamFixtureManifest };
}

describe('agent-stream normalization', () => {
  it('produces a deterministic, reconstructable JCS view from pinned source bytes', async () => {
    const { bytes, manifest } = await loadFixture();
    const first = normalizeAgentStreamSource(manifest, bytes);
    const second = normalizeAgentStreamSource(manifest, bytes);

    expect(first.sha256).toBe('28b7ba996ac875dcf6b6128064aab93de21375cf9dae5a755a024c7160606f19');
    expect(verifyAgentStreamNormalizationContent(first)).toEqual(reconstructAgentStreamRecords(first));
    expect(second).toMatchObject({ canonicalJson: first.canonicalJson, sha256: first.sha256 });
    expect(first.envelope).toEqual({ recordedAt: '2026-10-01T09:00:00.000Z', runId: 'run.synthetic.001', windowId: 'window.synthetic.001' });
    expect(first.snapshots.map((snapshot) => snapshot.objects.length)).toEqual([2, 3, 1, 2]);
    expect(reconstructAgentStreamRecords(first)).toEqual(
      bytes
        .toString()
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line))
    );
  });

  it('retains unknown fields explicitly and reports actual materialization size', async () => {
    const { bytes, manifest } = await loadFixture();
    const normalized = normalizeAgentStreamSource(manifest, bytes);
    expect(normalized.lossReport.unresolved).toContainEqual(expect.objectContaining({ eventId: 'evt.synthetic.009', path: 'type' }));
    expect(normalized.lossReport.unknownTimeEventIds).toEqual(['evt.synthetic.004']);
    expect(normalized.materialization.netByteDelta).toBe(Buffer.byteLength(normalized.canonicalJson) - bytes.byteLength);
    expect(normalized.normalizationReceipt.createdAt).toBe(manifest.capture.recordedAt);
    expect(normalized.snapshots[1]).toMatchObject({ added: ['object.synthetic.result.001'], changed: ['object.synthetic.context.001'], removed: [], unchanged: ['object.synthetic.tool.001'], repeated: [{ id: 'object.synthetic.result.001', occurrences: 1 }] });
    expect(normalized.snapshots[2]).toMatchObject({ added: [], changed: ['object.synthetic.context.001'], removed: ['object.synthetic.tool.001', 'object.synthetic.result.001'], repeated: [], unchanged: [] });
  });

  it('rejects corrupted evidence and bounds input before expensive source verification', async () => {
    const { bytes, manifest } = await loadFixture();
    const corrupted = Buffer.from(bytes); corrupted[0] ^= 1;
    expect(() => normalizeAgentStreamSource(manifest, corrupted)).toThrow();
    expect(() => normalizeAgentStreamSource(manifest, new Uint8Array(1_000_001))).toThrow('byte limit');
    expect(() => normalizeAgentStreamRecords(Buffer.from('{broken'))).toThrow('malformed JSON');
    expect(() => normalizeAgentStreamRecords(Uint8Array.from([0xff]))).toThrow('UTF-8');
  });

  it('reconstructs duplicate occurrence order without inventing fields or crossing scopes', () => {
    const event = (id: string, window: string, objects: unknown[]) => ({ type: 'snapshot.window', event_id: id, run_id: 'r', window_id: window, snapshot: { snapshot_id: id, objects } });
    const records = [
      event('e1', 'w1', [{ id: 'a', value: 1 }, { id: 'b', value: 2 }, { id: 'a', value: 1 }]),
      event('e2', 'w2', [{ id: 'z', value: 3 }]),
      event('e3', 'w1', [{ id: 'a', value: 1 }]),
      { event_id: 'e4', payload: 'x'.repeat(100), payload_blob_sha256: 'source-owned-field', type: 'vendor.unknown' }
    ];
    const normalized = normalizeAgentStreamRecords(Buffer.from(records.map((record) => JSON.stringify(record)).join('\n')));
    expect(reconstructAgentStreamRecords(normalized)).toEqual(records);
    expect(normalized.snapshots[1].removed).toEqual([]);
    expect(normalized.snapshots[2]).toMatchObject({ removed: ['b'], unchanged: ['a'], added: [] });
  });

  it('preserves malformed snapshot fields without deriving false state transitions', () => {
    const records = [{ type: 'snapshot.window', event_id: 'e1', snapshot: { snapshot_id: 's1', objects: [{ id: 'a' }, null] } }, { type: 'vendor.unknown', event_id: null, extra: { flag: true } }];
    const normalized = normalizeAgentStreamRecords(Buffer.from(records.map((record) => JSON.stringify(record)).join('\n')));
    expect(normalized.snapshots).toEqual([]);
    expect(reconstructAgentStreamRecords(normalized)).toEqual(records);
    expect(normalized.records[1].eventId).toBeNull();
    expect(normalized.lossReport.unresolved.length).toBeGreaterThan(0);
  });

  it('enforces independent line/record limits and preserves ambiguous object values', () => {
    expect(() => normalizeAgentStreamRecords(Buffer.from(JSON.stringify({ payload: 'x'.repeat(100_000) })))).toThrow('line 1');
    expect(() => normalizeAgentStreamRecords(Buffer.from(Array(10_001).fill('{}').join('\n')))).toThrow('record limit');
    const records = [{ type: 'snapshot.window', event_id: 'e', run_id: 'r', window_id: 'w', snapshot: { snapshot_id: 's', objects: [{ id: 'a', value: 1 }, { id: 'a', value: 2 }] } }];
    const result = normalizeAgentStreamRecords(Buffer.from(JSON.stringify(records[0])));
    expect(result.snapshots).toEqual([]);
    expect(result.lossReport.unresolved).toContainEqual(expect.objectContaining({ path: 'snapshot' }));
    expect(reconstructAgentStreamRecords(result)).toEqual(records);
  });

  it('rejects drift in source artifact payloads before a downstream projection', async () => {
    const { bytes, manifest } = await loadFixture();
    const result = normalizeAgentStreamSource(manifest, bytes);
    result.sourceArtifacts.record.payload.recordLocalId = 'tampered';
    expect(() => verifyAgentStreamNormalizationContent(result)).toThrow('integrity');
  });

  it('verifies referenced blob bytes during reconstruction', async () => {
    const { bytes, manifest } = await loadFixture();
    const result = normalizeAgentStreamSource(manifest, bytes);
    const digest = Object.keys(result.blobs)[0];
    result.blobs[digest].canonicalJson = 'null';
    expect(() => reconstructAgentStreamRecords(result)).toThrow('digest verification');
  });

  it('never assigns one occurrence to another event with a repeated identifier', () => {
    const records = [{ type: 'snapshot.window', event_id: 'e', run_id: 'r', window_id: 'w', snapshot: { snapshot_id: 's', objects: [{ id: 'a', value: 1 }] } }, { type: 'vendor.unknown', event_id: 'e', opaque: true }];
    expect(reconstructAgentStreamRecords(normalizeAgentStreamRecords(Buffer.from(records.map((record) => JSON.stringify(record)).join('\n'))))).toEqual(records);
  });
});
