import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { verifyTileIntegrity } from '@entif-ai/rosetta-core';

import {
  AGENT_STREAM_SOURCE_PROFILE,
  buildAgentStreamSourceArtifacts,
  verifyAgentStreamFixture,
  type AgentStreamFixtureManifest
} from './agent-stream-profile.js';

const fixtureUrl = new URL('../fixtures/agent-stream-synthetic.ndjson', import.meta.url);
const manifestUrl = new URL('../fixtures/agent-stream-synthetic.manifest.json', import.meta.url);

async function loadFixture(): Promise<{ bytes: Uint8Array; manifest: AgentStreamFixtureManifest }> {
  const [bytes, manifestBytes] = await Promise.all([readFile(fixtureUrl), readFile(manifestUrl)]);
  return { bytes, manifest: JSON.parse(manifestBytes.toString()) as AgentStreamFixtureManifest };
}

describe('agent-stream source profile and fixture', () => {
  it('describes the stream contract independently from the synthetic specimen', () => {
    expect(AGENT_STREAM_SOURCE_PROFILE.systemProfile.sourceSystemId).toBe('agent-stream.synthetic-public');
    expect(AGENT_STREAM_SOURCE_PROFILE.streamContract.mediaType).toBe('application/x-ndjson');
    expect(AGENT_STREAM_SOURCE_PROFILE.streamContract.requiredFields).toEqual(
      expect.arrayContaining(['event_id', 'run_id', 'sequence', 'turn_id', 'type', 'window_id'])
    );
    expect(AGENT_STREAM_SOURCE_PROFILE.streamContract.fieldTypes.source_timestamp).toBe('string | null');
    expect(AGENT_STREAM_SOURCE_PROFILE.streamContract.timeRoles).toEqual({
      observedAt: 'capture observer timestamp when available',
      recordedAt: 'fixture materialization timestamp',
      sourceTime: 'source-provided event timestamp when available'
    });
  });

  it('pins exact public source bytes and constructs separate source artifacts offline', async () => {
    const { bytes, manifest } = await loadFixture();

    expect(verifyAgentStreamFixture(manifest, bytes)).toEqual({ errors: [], ok: true });

    const artifacts = buildAgentStreamSourceArtifacts(manifest, bytes);
    expect(artifacts.systemProfile.kind).toBe('source.system_profile');
    expect(artifacts.record.kind).toBe('source.record');
    expect(artifacts.manifestation.kind).toBe('source.manifestation');
    expect(artifacts.sourcePackage.kind).toBe('source.package');
    expect(artifacts.episode.kind).toBe('source.episode');
    expect(artifacts.manifestation.payload.byteHashes.sha256).toBe(manifest.sourceArtifact.sha256);
    expect(artifacts.episode.payload.family).toBe('journal-log');
    expect(artifacts.episode.payload.mode).toBe('parse-only');
    expect(
      [artifacts.systemProfile, artifacts.record, artifacts.manifestation, artifacts.sourcePackage, artifacts.episode].every(
        (artifact) => verifyTileIntegrity<unknown>(artifact).ok
      )
    ).toBe(true);
    expect(
      [artifacts.systemProfile, artifacts.record, artifacts.manifestation, artifacts.sourcePackage, artifacts.episode].every(
        (artifact) => artifact.createdAt === manifest.capture.recordedAt
      )
    ).toBe(true);
    expect(artifacts.episode.payload.rawEvidenceRefs[0]).toMatchObject({
      evidenceKind: 'generated-fixture',
      sha256: manifest.sourceArtifact.sha256
    });

    const snapshots = bytes
      .toString()
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line) as { snapshot?: { objects?: Array<{ id: string; value: unknown }> }; type: string })
      .filter((event) => event.type === 'snapshot.window');
    expect(snapshots.map((event) => event.snapshot?.objects?.length)).toEqual([2, 4, 1, 2]);
    expect(snapshots[0]?.snapshot?.objects).toContainEqual({
      id: 'object.synthetic.context.001',
      value: { text: 'public synthetic context v1' }
    });
    expect(JSON.stringify(snapshots)).not.toContain('"added"');
    expect(snapshots[1]?.snapshot?.objects?.filter((object) => object.id === 'object.synthetic.result.001')).toHaveLength(2);
  });

  it('rejects source-byte and artifact-identity tampering', async () => {
    const { bytes, manifest } = await loadFixture();
    const alteredBytes = Uint8Array.from(bytes);
    alteredBytes[0] ^= 1;
    const alteredManifest = structuredClone(manifest);
    alteredManifest.sourceArtifact.sha256 = '0'.repeat(64);
    const captureMetadataTamper = structuredClone(manifest);
    captureMetadataTamper.capture.recordedAt = '2026-10-01T09:00:01.000Z';
    const sourceIdentityTamper = structuredClone(manifest);
    sourceIdentityTamper.sourceIdentity.packageId = 'agent-stream-synthetic-001.window-tampered';

    expect(verifyAgentStreamFixture(manifest, alteredBytes).errors).toContain('source bytes SHA-256 does not match manifest');
    expect(verifyAgentStreamFixture(alteredManifest, bytes).errors).toContain(
      'manifest source artifact SHA-256 is not the pinned fixture digest'
    );
    expect(verifyAgentStreamFixture(captureMetadataTamper, bytes).errors).toContain(
      'manifest recordCid does not match constructed source artifact'
    );
    expect(verifyAgentStreamFixture(sourceIdentityTamper, bytes).errors).toContain(
      'manifest packageCid does not match constructed source artifact'
    );
  });
});
