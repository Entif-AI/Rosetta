import { createHash } from 'node:crypto';

import type { TileEnvelope } from '@entif-ai/rosetta-core';

import {
  createSourceEpisodeTile,
  createSourceManifestationTile,
  createSourcePackageTile,
  createSourceRecordTile,
  createSourceSystemProfileTile,
  type SourceEpisode,
  type SourceManifestation,
  type SourcePackage,
  type SourceRecord,
  type SourceSystemProfile
} from './source-substrate.js';

const PINNED_SOURCE_SHA256 = '60e556bb5144659a6f2453e67a68a7d52193d6da41c3f18c010dc672e41c86f1';

export interface AgentStreamContract {
  contractVersion: string;
  mediaType: 'application/x-ndjson';
  requiredFields: string[];
  fieldTypes: Record<string, string>;
  optionalFields: string[];
  timeRoles: {
    observedAt: string;
    recordedAt: string;
    sourceTime: string;
  };
}

export interface AgentStreamSourceProfile {
  systemProfile: SourceSystemProfile;
  streamContract: AgentStreamContract;
}

export interface AgentStreamFixtureManifest {
  fixtureVersion: string;
  sourceArtifact: {
    path: string;
    mediaType: 'application/x-ndjson';
    sha256: string;
    sizeBytes: number;
    rightsPosture: string;
  };
  capture: {
    method: string;
    captureWindow: { startedAt: string; endedAt: string };
    recordedAt: string;
    sourceClientProfile: { sourceSystemId: string; clientId: string; clientVersion: string | null };
    parserProfile: null;
  };
  sourceIdentity: {
    recordLocalId: string;
    manifestationId: string;
    packageId: string;
    episodeId: string;
  };
  artifactIdentity: {
    systemProfileCid: string;
    recordCid: string;
    manifestationCid: string;
    packageCid: string;
    episodeCid: string;
  };
}

export interface AgentStreamSourceArtifacts {
  systemProfile: TileEnvelope<SourceSystemProfile>;
  record: TileEnvelope<SourceRecord>;
  manifestation: TileEnvelope<SourceManifestation>;
  sourcePackage: TileEnvelope<SourcePackage>;
  episode: TileEnvelope<SourceEpisode>;
}

export const AGENT_STREAM_SOURCE_PROFILE: AgentStreamSourceProfile = {
  systemProfile: {
    canonicalName: 'Public authored synthetic agent event stream',
    capabilityFacets: ['event-stream', 'ndjson', 'offline-fixture'],
    curationPosture: 'authored-synthetic-fixture',
    evidenceRefs: ['packages/source-substrate/src/fixtures/agent-stream-synthetic.manifest.json'],
    preservationPosture: 'checked-in-exact-bytes',
    reviewPosture: 'fixture-contract-test',
    rightsPosture: 'public-authored-synthetic-no-live-capture',
    sourceRoles: ['event-stream-fixture'],
    sourceSystemId: 'agent-stream.synthetic-public'
  },
  streamContract: {
    contractVersion: '1.0.0',
    mediaType: 'application/x-ndjson',
    requiredFields: ['event_id', 'run_id', 'sequence', 'turn_id', 'type', 'window_id'],
    fieldTypes: {
      event_id: 'string',
      observed_at: 'string | null',
      recorded_at: 'string',
      run_id: 'string',
      sequence: 'integer',
      source_timestamp: 'string | null',
      turn_id: 'string | null',
      type: 'string',
      window_id: 'string'
    },
    optionalFields: [
      'metadata',
      'observed_at',
      'parent_event_id',
      'recorded_at',
      'request_ref',
      'result_ref',
      'source_timestamp',
      'unrecognized_fields'
    ],
    timeRoles: {
      observedAt: 'capture observer timestamp when available',
      recordedAt: 'fixture materialization timestamp',
      sourceTime: 'source-provided event timestamp when available'
    }
  }
};

function materializeArtifacts(manifest: AgentStreamFixtureManifest): AgentStreamSourceArtifacts {
  const systemProfile = createSourceSystemProfileTile(AGENT_STREAM_SOURCE_PROFILE.systemProfile);
  const record = createSourceRecordTile(
    {
      metadataBlob: {
        capture: manifest.capture,
        fixtureVersion: manifest.fixtureVersion,
        sourceArtifact: manifest.sourceArtifact,
        streamContract: AGENT_STREAM_SOURCE_PROFILE.streamContract
      },
      publicationStatus: 'public-authored-synthetic-fixture',
      recordLocalId: manifest.sourceIdentity.recordLocalId,
      recordType: 'agent-event-stream',
      sourceSystemId: AGENT_STREAM_SOURCE_PROFILE.systemProfile.sourceSystemId,
      stableLocators: [`source-substrate/${manifest.sourceArtifact.path}`]
    },
    [systemProfile.cid]
  );
  const manifestation = createSourceManifestationTile(
    {
      accessRequirements: ['public-repository-fixture'],
      byteHashes: { sha256: manifest.sourceArtifact.sha256 },
      manifestationId: manifest.sourceIdentity.manifestationId,
      manifestationKind: 'ndjson-stream-snapshot',
      mediaType: manifest.sourceArtifact.mediaType,
      sourceRecordCid: record.cid,
      structureProfile: 'agent-stream-contract-1.0.0'
    },
    [record.cid]
  );
  const sourcePackage = createSourcePackageTile(
    {
      members: [manifestation.cid],
      packageId: manifest.sourceIdentity.packageId,
      packageKind: 'captured-agent-stream-window',
      profileRefs: ['agent-stream-contract-1.0.0'],
      sourceRecordCid: record.cid
    },
    [manifestation.cid]
  );
  const episode = createSourceEpisodeTile(
    {
      chronology: {
        primary: {
          date: manifest.capture.captureWindow.startedAt.slice(0, 10),
          kind: 'captureWindowStartedAt',
          source: 'fixture-manifest'
        }
      },
      classification: {
        confidence: 1,
        reasons: ['Public authored synthetic fixture classification is declared in the manifest.']
      },
      episodeId: manifest.sourceIdentity.episodeId,
      family: 'journal-log',
      locator: `source-substrate/${manifest.sourceArtifact.path}`,
      mode: 'parse-only',
      rawEvidenceRefs: [
        {
          evidenceId: manifest.sourceIdentity.manifestationId,
          evidenceKind: 'generated-fixture',
          locator: `source-substrate/${manifest.sourceArtifact.path}`,
          sha256: manifest.sourceArtifact.sha256
        }
      ],
      rightsScope: [manifest.sourceArtifact.rightsPosture],
      sourceManifestationCid: manifestation.cid,
      sourcePackageCid: sourcePackage.cid,
      sourceRecordCid: record.cid
    },
    [sourcePackage.cid]
  );

  const createdAt = manifest.capture.recordedAt;
  return {
    episode: { ...episode, createdAt },
    manifestation: { ...manifestation, createdAt },
    record: { ...record, createdAt },
    sourcePackage: { ...sourcePackage, createdAt },
    systemProfile: { ...systemProfile, createdAt }
  };
}

export function verifyAgentStreamFixture(
  manifest: AgentStreamFixtureManifest,
  bytes: Uint8Array
): { errors: string[]; ok: boolean } {
  const errors: string[] = [];
  const sourceDigest = createHash('sha256').update(bytes).digest('hex');

  if (manifest.sourceArtifact.sha256 !== PINNED_SOURCE_SHA256) {
    errors.push('manifest source artifact SHA-256 is not the pinned fixture digest');
  } else if (sourceDigest !== manifest.sourceArtifact.sha256) {
    errors.push('source bytes SHA-256 does not match manifest');
  }
  if (bytes.byteLength !== manifest.sourceArtifact.sizeBytes) {
    errors.push('source byte length does not match manifest');
  }

  const artifacts = materializeArtifacts(manifest);
  const expected = manifest.artifactIdentity;
  const actual = {
    episodeCid: artifacts.episode.cid,
    manifestationCid: artifacts.manifestation.cid,
    packageCid: artifacts.sourcePackage.cid,
    recordCid: artifacts.record.cid,
    systemProfileCid: artifacts.systemProfile.cid
  };
  for (const key of Object.keys(actual) as Array<keyof typeof actual>) {
    if (actual[key] !== expected[key]) {
      errors.push(`manifest ${key} does not match constructed source artifact`);
    }
  }

  return { errors, ok: errors.length === 0 };
}

export function buildAgentStreamSourceArtifacts(
  manifest: AgentStreamFixtureManifest,
  bytes: Uint8Array
): AgentStreamSourceArtifacts {
  const verification = verifyAgentStreamFixture(manifest, bytes);
  if (!verification.ok) {
    throw new Error(`Agent-stream fixture integrity verification failed: ${verification.errors.join('; ')}`);
  }
  return materializeArtifacts(manifest);
}
