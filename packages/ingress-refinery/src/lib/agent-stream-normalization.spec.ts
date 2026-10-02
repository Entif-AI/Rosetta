import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import type { AgentStreamFixtureManifest } from '@entif-ai/source-substrate';

import { normalizeAgentStreamSource, reconstructAgentStreamRecords } from './agent-stream-normalization.js';

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
});
