import { canonicalizeJson, type JsonValue } from '@entif-ai/rosetta-canon';
import { sha256Hex } from '@entif-ai/rosetta-cid';
import { verifyTileIntegrity, type TileEnvelope } from '@entif-ai/rosetta-core';
import {
  createSourceManifestationTile,
  createSourceRecordTile,
  createSourceSystemProfileTile,
  type SourceEpisode,
  type SourceManifestation,
  type SourceRecord,
} from '@entif-ai/source-substrate';
import { bootstrapSourceProfiles } from '@entif-ai/source-registry';
import {
  createIngressJob,
  createParseOnlySourceEpisode,
  refineTextArtifact,
} from './ingress-refinery.js';

export type GitHubIssueAcquisitionMode = 'fixture' | 'local';
const MAX_ISSUE_SNAPSHOT_BYTES = 1_000_000;

/**
 * The provider client owns authentication and transport. This parse-only adapter
 * admits a caller-provided issue REST object on an OFFLINE proof path only.
 * A caller-supplied decision reference is provenance, not proof of provider
 * authentication or a live permission check for later GraphView reads.
 */
export interface GitHubIssueReadDecision {
  allowed: boolean;
  checkedAt: string;
  decisionRef: string;
  issueNodeId: string;
  policyRefs: string[];
  principalRef: string;
  repositoryNodeId: string;
  rightsScopes: string[];
}

export interface GitHubIssueAcquisitionRequest {
  acquisitionMode: GitHubIssueAcquisitionMode;
  capturedAt: string;
  issue: unknown;
  readDecision: GitHubIssueReadDecision;
  repository: unknown;
  previous?: {
    capturedAt: string;
    manifestation: TileEnvelope<SourceManifestation>;
    record: TileEnvelope<SourceRecord>;
  };
}

export interface GitHubIssueAcquisitionResult {
  acquisitionMode: GitHubIssueAcquisitionMode;
  authorizationBasis: 'caller-supplied-attestation';
  canonicalSourceJson: string;
  captureCoverage: 'issue-object-only';
  canonicalArtifact: ReturnType<typeof refineTextArtifact>['canonicalArtifact'];
  episode: TileEnvelope<SourceEpisode>;
  evaluationReceipt: ReturnType<typeof refineTextArtifact>['evaluationReceipt'];
  fetchReceipt: ReturnType<typeof refineTextArtifact>['fetchReceipt'];
  ingressJob: ReturnType<typeof createIngressJob>;
  manifestation: TileEnvelope<SourceManifestation>;
  normalizationReceipt: ReturnType<
    typeof refineTextArtifact
  >['normalizationReceipt'];
  record: TileEnvelope<SourceRecord>;
  sourceSystem: ReturnType<typeof createSourceSystemProfileTile>;
  trustMatrix: ReturnType<typeof refineTextArtifact>['trustMatrix'];
}

function isJson(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean')
    return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJson);
  return isJsonObject(value);
}

function isJsonObject(value: unknown): value is Record<string, JsonValue> {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    return false;
  }
  return Object.values(value).every(isJson);
}

function jsonObject(value: unknown, label: string): Record<string, JsonValue> {
  if (!isJsonObject(value)) {
    throw new Error(label + ' must be a native JSON object.');
  }
  return value;
}

function requiredString(value: JsonValue | undefined, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('GitHub issue snapshot requires ' + field + '.');
  }
  return value;
}

function requiredPositiveInteger(
  value: JsonValue | undefined,
  field: string
): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
    throw new Error('GitHub issue snapshot requires positive ' + field + '.');
  }
  return value;
}

function requiredNonnegativeInteger(
  value: JsonValue | undefined,
  field: string
): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(
      'GitHub issue snapshot requires nonnegative ' + field + '.'
    );
  }
  return value;
}

function instant(value: string, field: string): string {
  const time = Date.parse(value);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value) ||
    !Number.isFinite(time)
  ) {
    throw new Error(
      'GitHub issue snapshot requires UTC instant ' + field + '.'
    );
  }
  return value;
}

/**
 * Issues and pull requests share GitHub issue numbers, but NOT an acquisition
 * contract. PR/review admission and comment/timeline pagination are separate.
 * An issue-object snapshot never asserts completeness of the discussion.
 */
export function acquireGitHubIssueThroughRefinery(
  request: GitHubIssueAcquisitionRequest
): GitHubIssueAcquisitionResult {
  const decision = request.readDecision;
  // Check supplied authorization before inspecting any potentially protected source data.
  if (
    (request.acquisitionMode !== 'fixture' &&
      request.acquisitionMode !== 'local') ||
    decision?.allowed !== true ||
    !decision.decisionRef?.trim() ||
    !decision.principalRef?.trim() ||
    !decision.repositoryNodeId?.trim() ||
    !decision.issueNodeId?.trim() ||
    !Array.isArray(decision.rightsScopes) ||
    decision.rightsScopes.length === 0 ||
    !decision.rightsScopes.every(
      (scope) => typeof scope === 'string' && scope.trim()
    ) ||
    !Array.isArray(decision.policyRefs) ||
    decision.policyRefs.length === 0 ||
    !decision.policyRefs.every(
      (policy) => typeof policy === 'string' && policy.trim()
    )
  ) {
    throw new Error(
      'GitHub issue read DENIED: missing or denied external read-decision evidence.'
    );
  }

  const capturedAt = instant(request.capturedAt, 'capturedAt');
  const checkedAt = instant(decision.checkedAt, 'readDecision.checkedAt');
  if (Date.parse(checkedAt) > Date.parse(capturedAt)) {
    throw new Error(
      'GitHub issue read DENIED: read decision occurred after the admitted capture.'
    );
  }

  const repository = jsonObject(request.repository, 'GitHub repository');
  const issue = jsonObject(request.issue, 'GitHub issue');
  const repositoryId = requiredPositiveInteger(repository.id, 'repository.id');
  const repositoryNodeId = requiredString(
    repository.node_id,
    'repository.node_id'
  );
  const fullName = requiredString(repository.full_name, 'repository.full_name');
  const issueId = requiredPositiveInteger(issue.id, 'issue.id');
  const issueNodeId = requiredString(issue.node_id, 'issue.node_id');
  const issueNumber = requiredPositiveInteger(issue.number, 'issue.number');
  const createdAt = instant(
    requiredString(issue.created_at, 'issue.created_at'),
    'issue.created_at'
  );
  const updatedAt = instant(
    requiredString(issue.updated_at, 'issue.updated_at'),
    'issue.updated_at'
  );
  const comments = requiredNonnegativeInteger(issue.comments, 'issue.comments');
  requiredString(issue.title, 'issue.title');
  const state = requiredString(issue.state, 'issue.state');
  if (state !== 'open' && state !== 'closed') {
    throw new Error('Unsupported native GitHub issue state.');
  }
  if (issue.body !== null && typeof issue.body !== 'string') {
    throw new Error('Native GitHub issue body must be text or null.');
  }
  if (Object.hasOwn(issue, 'pull_request')) {
    throw new Error(
      'GitHub pull requests require a separate native PR/review source contract.'
    );
  }
  if (repository.private !== true && repository.private !== false) {
    throw new Error('Native GitHub repository visibility is required.');
  }
  if (repository.private && decision.rightsScopes.includes('public')) {
    throw new Error(
      'GitHub issue read DENIED: private repository cannot use public-only rights.'
    );
  }
  const apiUrl =
    'https://api.github.com/repos/' + fullName + '/issues/' + issueNumber;
  const htmlUrl = 'https://github.com/' + fullName + '/issues/' + issueNumber;
  if (
    !/^[a-zA-Z0-9-]+\/[a-zA-Z0-9._-]+$/u.test(fullName) ||
    issue.url !== apiUrl ||
    issue.html_url !== htmlUrl ||
    issue.repository_url !== 'https://api.github.com/repos/' + fullName
  ) {
    throw new Error('GitHub issue native URL, repository and number disagree.');
  }
  if (
    decision.repositoryNodeId !== repositoryNodeId ||
    decision.issueNodeId !== issueNodeId
  ) {
    throw new Error(
      'GitHub issue read DENIED: external decision is bound to a different source.'
    );
  }
  if (
    Date.parse(updatedAt) < Date.parse(createdAt) ||
    Date.parse(capturedAt) < Date.parse(updatedAt) ||
    Date.parse(checkedAt) < Date.parse(updatedAt)
  ) {
    throw new Error(
      'GitHub issue read DENIED: source revision or rights decision is stale.'
    );
  }

  const snapshotJson = canonicalizeJson({ repository, issue });
  if (Buffer.byteLength(snapshotJson, 'utf8') > MAX_ISSUE_SNAPSHOT_BYTES) {
    throw new Error('Refusing over-bounded GitHub issue JSON snapshot.');
  }
  const snapshotHash = sha256Hex(snapshotJson);
  const sourceId = 'github.issue:' + repositoryId + ':' + issueId;
  const previous = request.previous;
  let supersedes = false;
  if (previous) {
    if (
      previous.record.kind !== 'source.record' ||
      previous.manifestation.kind !== 'source.manifestation' ||
      !verifyTileIntegrity(previous.record).ok ||
      !verifyTileIntegrity(previous.manifestation).ok
    ) {
      throw new Error(
        'GitHub issue correction has tampered or non-source prior Rosetta tiles.'
      );
    }
    const previousUpdatedAt =
      previous.record.payload.metadataBlob.sourceUpdatedAt;
    const previousHash = previous.manifestation.payload.byteHashes.sha256;
    if (
      previous.record.payload.sourceSystemId !== 'github' ||
      previous.record.payload.recordType !== 'github-issue' ||
      previous.record.payload.recordLocalId !== sourceId ||
      previous.manifestation.payload.sourceRecordCid !== previous.record.cid ||
      previous.manifestation.payload.manifestationKind !==
        'github-issue-rest-json' ||
      previous.record.payload.metadataBlob.repositoryNodeId !==
        repositoryNodeId ||
      previous.record.payload.metadataBlob.issueNodeId !== issueNodeId ||
      previous.record.payload.metadataBlob.snapshotHash !== previousHash ||
      previous.record.payload.claimedVersion !== previousUpdatedAt ||
      previous.manifestation.payload.manifestationId !==
        'github.issue.snapshot:' +
          repositoryId +
          ':' +
          issueId +
          ':' +
          previousHash ||
      typeof previousUpdatedAt !== 'string' ||
      typeof previousHash !== 'string'
    ) {
      throw new Error(
        'GitHub issue correction has mismatched native source identity or lineage.'
      );
    }
    const earlierCapture = instant(previous.capturedAt, 'previous.capturedAt');
    if (
      Date.parse(capturedAt) <= Date.parse(earlierCapture) ||
      Date.parse(updatedAt) <
        Date.parse(instant(previousUpdatedAt, 'previous.sourceUpdatedAt'))
    ) {
      throw new Error('GitHub issue correction is stale or nonmonotonic.');
    }
    supersedes = snapshotHash !== previousHash;
  }

  const sourceProfile = bootstrapSourceProfiles.find(
    (profile) => profile.sourceSystemId === 'github'
  );
  if (!sourceProfile)
    throw new Error('GitHub source-system profile is not registered.');
  const sourceSystem = createSourceSystemProfileTile(sourceProfile);
  const record = createSourceRecordTile(
    {
      claimedVersion: updatedAt,
      lineageRefs: supersedes && previous ? [previous.record.cid] : [],
      metadataBlob: {
        authorizationBasis: 'caller-supplied-attestation',
        captureCoverage: 'issue-object-only',
        commentCount: comments,
        issueId,
        issueNodeId,
        issueNumber,
        readDecisionCheckedAt: checkedAt,
        readDecisionRef: decision.decisionRef,
        readPolicyRefs: decision.policyRefs,
        readPrincipalRef: decision.principalRef,
        repositoryId,
        repositoryNodeId,
        repositoryNameAtCapture: fullName,
        snapshotHash,
        sourceCreatedAt: createdAt,
        sourceUpdatedAt: updatedAt,
      },
      publicationStatus: repository.private ? 'restricted' : 'published',
      recordLocalId: sourceId,
      recordType: 'github-issue',
      sourceSystemId: 'github',
      stableLocators: [htmlUrl],
    },
    [sourceSystem.cid, ...(supersedes && previous ? [previous.record.cid] : [])]
  );
  const manifestation = createSourceManifestationTile(
    {
      accessRequirements: decision.rightsScopes,
      byteHashes: { sha256: snapshotHash },
      fetchableUrl: apiUrl,
      manifestationId:
        'github.issue.snapshot:' +
        repositoryId +
        ':' +
        issueId +
        ':' +
        snapshotHash,
      manifestationKind: 'github-issue-rest-json',
      mediaType: 'application/vnd.github+json',
      sourceRecordCid: record.cid,
      structureProfile: 'github.issue-object-only.v1',
    },
    [
      record.cid,
      ...(supersedes && previous ? [previous.manifestation.cid] : []),
    ]
  );
  const episode = createParseOnlySourceEpisode(record, manifestation, {
    chronology: {
      canonical: {
        createdAt: {
          date: createdAt.slice(0, 10),
          kind: 'createdAt',
          source: 'github-issues-rest',
        },
        updatedAt: {
          date: updatedAt.slice(0, 10),
          kind: 'updatedAt',
          source: 'github-issues-rest',
        },
      },
      primary: {
        date: capturedAt.slice(0, 10),
        kind: 'observedAt',
        source: 'github-issues-rest',
      },
    },
    locator: apiUrl,
    rawEvidenceRefs: [
      {
        evidenceId:
          'raw.github.issue.' +
          repositoryId +
          '.' +
          issueId +
          '.' +
          snapshotHash,
        evidenceKind:
          request.acquisitionMode === 'fixture'
            ? 'generated-fixture'
            : 'inline-text',
        locator: 'inline:github-issue-json:' + snapshotHash,
        sha256: snapshotHash,
      },
    ],
    rightsScope: decision.rightsScopes,
  });
  const ingressJob = createIngressJob(record.cid, manifestation.cid);
  const refined = refineTextArtifact(
    record,
    manifestation,
    snapshotJson,
    decision.policyRefs,
    {
      fetchedAt: capturedAt,
      fetchMethod: 'github-' + request.acquisitionMode + '-issue-snapshot',
      requestedLocator: apiUrl,
      resolvedLocator: apiUrl,
    }
  );
  return {
    acquisitionMode: request.acquisitionMode,
    authorizationBasis: 'caller-supplied-attestation',
    canonicalSourceJson: snapshotJson,
    captureCoverage: 'issue-object-only',
    episode,
    ingressJob,
    manifestation,
    record,
    sourceSystem,
    ...refined,
  };
}
