import { describe, expect, it } from 'vitest';
import { sha256Hex } from '@entif-ai/rosetta-cid';
import { verifyTileIntegrity, type TileEnvelope } from '@entif-ai/rosetta-core';
import { validatePayload } from '@entif-ai/rosetta-schemas';

import {
  acquireGitHubIssueThroughRefinery,
  type GitHubIssueAcquisitionRequest,
} from './github-issue-acquisition.js';

function specimen(): GitHubIssueAcquisitionRequest {
  return {
    acquisitionMode: 'fixture',
    capturedAt: '2026-10-01T12:05:00Z',
    issue: {
      id: 42001,
      node_id: 'I_alpha42',
      number: 42,
      title: 'Native provider record, not inferred graph truth',
      body: 'Issue 42 proposes a development-stage graph view.',
      state: 'open',
      comments: 2,
      created_at: '2026-10-01T10:00:00Z',
      updated_at: '2026-10-01T11:00:00Z',
      url: 'https://api.github.com/repos/alpha/project/issues/42',
      html_url: 'https://github.com/alpha/project/issues/42',
      repository_url: 'https://api.github.com/repos/alpha/project',
    },
    repository: {
      id: 1001,
      node_id: 'R_alpha',
      full_name: 'alpha/project',
      private: false,
    },
    readDecision: {
      allowed: true,
      checkedAt: '2026-10-01T12:00:00Z',
      decisionRef: 'fixture.read.decision.1',
      principalRef: 'fixture.operator',
      policyRefs: ['policy.github.issue.read.v1'],
      repositoryNodeId: 'R_alpha',
      issueNodeId: 'I_alpha42',
      rightsScopes: ['project:alpha'],
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function issueObject(
  request: GitHubIssueAcquisitionRequest
): Record<string, unknown> {
  if (!isRecord(request.issue)) throw new Error('fixture');
  return request.issue;
}

function repoObject(
  request: GitHubIssueAcquisitionRequest
): Record<string, unknown> {
  if (!isRecord(request.repository)) throw new Error('fixture');
  return request.repository;
}

describe('GitHub issue REST source admission', () => {
  it('admits a bounded issue-only snapshot through Rosetta source, episode and refinery receipts', () => {
    const request = specimen();
    const first = acquireGitHubIssueThroughRefinery(request);
    const repeat = acquireGitHubIssueThroughRefinery(specimen());

    expect(first.sourceSystem.payload.sourceSystemId).toBe('github');
    expect(first.record.payload.recordType).toBe('github-issue');
    expect(first.record.payload.recordLocalId).toBe('github.issue:1001:42001');
    expect(first.record.payload.metadataBlob).toMatchObject({
      authorizationBasis: 'caller-supplied-attestation',
      captureCoverage: 'issue-object-only',
      commentCount: 2,
      issueNodeId: 'I_alpha42',
      issueNumber: 42,
      readDecisionRef: 'fixture.read.decision.1',
      readPolicyRefs: ['policy.github.issue.read.v1'],
      readPrincipalRef: 'fixture.operator',
      repositoryNodeId: 'R_alpha',
    });
    expect(first.authorizationBasis).toBe('caller-supplied-attestation');
    expect(first.captureCoverage).toBe('issue-object-only');
    expect(sha256Hex(first.canonicalSourceJson)).toBe(
      first.manifestation.payload.byteHashes.sha256
    );
    expect(first.episode.payload.family).toBe('github-issue');
    expect(first.episode.payload.rightsScope).toEqual(['project:alpha']);
    expect(first.episode.payload.mode).toBe('parse-only');
    expect(first.episode.payload.sourceManifestationCid).toBe(
      first.manifestation.cid
    );
    expect(first.episode.payload.sourceRecordCid).toBe(first.record.cid);
    expect(first.episode.payload.sourcePackageCid).toBeUndefined(); // direct REST read, not a fabricated listing
    expect(first.manifestation.payload.accessRequirements).toEqual([
      'project:alpha',
    ]);
    expect(first.manifestation.payload.structureProfile).toBe(
      'github.issue-object-only.v1'
    );
    expect(first.manifestation.payload.byteHashes.sha256).toBe(
      sha256Hex(first.canonicalArtifact.payload.normalizedText)
    );
    expect(first.fetchReceipt.payload.sourceManifestationCid).toBe(
      first.manifestation.cid
    );
    expect(first.evaluationReceipt.payload.policyRefs).toEqual([
      'policy.github.issue.read.v1',
    ]);
    expect(first.canonicalArtifact.payload.sourceRecordCid).toBe(
      first.record.cid
    );
    expect(first.canonicalArtifact.payload.sourceManifestationCid).toBe(
      first.manifestation.cid
    );
    expect(first.canonicalArtifact.payload.rightsScopes).toEqual([
      'project:alpha',
    ]);
    expect(first.fetchReceipt.payload.fetchedAt).toBe('2026-10-01T12:05:00Z');
    expect(first.evaluationReceipt.payload.evaluatedAt).toBe(
      '2026-10-01T12:05:00Z'
    );
    expect(first.canonicalArtifact.payload.normalizedText).toContain(
      'development-stage graph view'
    );
    expect(first.canonicalArtifact.payload.normalizedText).toContain(
      '"comments":2'
    );
    expect(first.record.cid).toBe(repeat.record.cid);
    expect(first.manifestation.cid).toBe(repeat.manifestation.cid);
    expect(first.canonicalArtifact.cid).toBe(repeat.canonicalArtifact.cid);
    const tiles: TileEnvelope[] = [
      first.sourceSystem,
      first.record,
      first.manifestation,
      first.episode,
      first.ingressJob,
      first.fetchReceipt,
      first.normalizationReceipt,
      first.evaluationReceipt,
      first.trustMatrix,
      first.canonicalArtifact,
    ];
    for (const tile of tiles) {
      if (!tile.payload || typeof tile.payload !== 'object')
        throw new Error('Invalid tile fixture.');
      expect(verifyTileIntegrity(tile).ok).toBe(true);
      expect(validatePayload(tile.kind, tile.payload).ok).toBe(true);
      expect(tile.createdAt).toBe(first.record.createdAt);
      expect(Date.parse(tile.createdAt)).toBeGreaterThanOrEqual(
        Date.parse('2026-10-01T12:05:00Z')
      );
    }
  });

  it('keeps issue number 42 in independent repos separate even with identical display title', () => {
    const alpha = acquireGitHubIssueThroughRefinery(specimen());
    const beta = specimen();
    repoObject(beta).id = 2002;
    repoObject(beta).node_id = 'R_beta';
    repoObject(beta).full_name = 'beta/project';
    issueObject(beta).id = 42002;
    issueObject(beta).node_id = 'I_beta42';
    issueObject(beta).url =
      'https://api.github.com/repos/beta/project/issues/42';
    issueObject(beta).html_url = 'https://github.com/beta/project/issues/42';
    issueObject(beta).repository_url =
      'https://api.github.com/repos/beta/project';
    beta.readDecision.repositoryNodeId = 'R_beta';
    beta.readDecision.issueNodeId = 'I_beta42';
    const second = acquireGitHubIssueThroughRefinery(beta);
    expect(second.record.payload.recordLocalId).toBe('github.issue:2002:42002');
    expect(second.record.cid).not.toBe(alpha.record.cid);
    expect(second.manifestation.cid).not.toBe(alpha.manifestation.cid);
  });

  it('retains the exact canonical JSON independently of lossy plain-text normalization', () => {
    const input = specimen();
    issueObject(input).body =
      'Two  spaces are evidence, not optional formatting.';
    const admitted = acquireGitHubIssueThroughRefinery(input);
    expect(admitted.canonicalSourceJson).toContain('Two  spaces');
    expect(admitted.canonicalArtifact.payload.normalizedText).toContain(
      'Two spaces'
    );
    expect(admitted.canonicalArtifact.payload.byteHash).toBe(
      sha256Hex(admitted.canonicalSourceJson)
    );
    expect(admitted.manifestation.payload.byteHashes.sha256).toBe(
      sha256Hex(admitted.canonicalSourceJson)
    );
    expect(admitted.episode.payload.rawEvidenceRefs[0].evidenceKind).toBe(
      'generated-fixture'
    );
  });

  it('does not accept any caller-declared live provider mode as production evidence', () => {
    const request = specimen();
    Object.assign(request, { acquisitionMode: 'live' });
    expect(() => acquireGitHubIssueThroughRefinery(request)).toThrow(/DENIED/u);
  });

  it('accepts offline local JSON without inventing a remote-fetch receipt', () => {
    const input = specimen();
    input.acquisitionMode = 'local';
    const local = acquireGitHubIssueThroughRefinery(input);
    expect(local.episode.payload.rawEvidenceRefs[0].evidenceKind).toBe(
      'inline-text'
    );
    expect(local.fetchReceipt.payload.method).toBe(
      'github-local-issue-snapshot'
    );
  });

  it('orders fractional-second capture and decision times numerically rather than lexically', () => {
    const input = specimen();
    input.readDecision.checkedAt = '2026-10-01T12:00:00.001Z';
    input.capturedAt = '2026-10-01T12:00:00.010Z';
    expect(acquireGitHubIssueThroughRefinery(input).captureCoverage).toBe(
      'issue-object-only'
    );
    input.capturedAt = '2026-10-01T12:00:00Z';
    expect(() => acquireGitHubIssueThroughRefinery(input)).toThrow(/DENIED/iu);
  });

  it('keeps corrected source manifestations immutable, linked and versioned', () => {
    const v1Request = specimen();
    const v1 = acquireGitHubIssueThroughRefinery(v1Request);
    const v2Request = specimen();
    issueObject(v2Request).body =
      'Corrected issue description after source review';
    issueObject(v2Request).updated_at = '2026-10-02T11:00:00Z';
    v2Request.readDecision.checkedAt = '2026-10-02T12:00:00Z';
    v2Request.capturedAt = '2026-10-02T12:05:00Z';
    v2Request.previous = {
      capturedAt: v1Request.capturedAt,
      record: v1.record,
      manifestation: v1.manifestation,
    };
    const v2 = acquireGitHubIssueThroughRefinery(v2Request);
    expect(v2.record.payload.recordLocalId).toBe(
      v1.record.payload.recordLocalId
    );
    expect(v2.manifestation.cid).not.toBe(v1.manifestation.cid);
    expect(v2.record.cid).not.toBe(v1.record.cid);
    expect(v2.record.payload.lineageRefs).toContain(v1.record.cid);
    expect(v2.manifestation.parents).toContain(v1.manifestation.cid);
    expect(v1.canonicalArtifact.payload.normalizedText).toContain('proposes');
    expect(v2.canonicalArtifact.payload.normalizedText).toContain('Corrected');
  });

  it('links a later rights recheck even when source JSON and its revision are unchanged', () => {
    const firstRequest = specimen();
    const first = acquireGitHubIssueThroughRefinery(firstRequest);
    const next = specimen();
    next.readDecision.rightsScopes = ['project:beta'];
    next.readDecision.decisionRef = 'fixture.read.decision.2';
    next.readDecision.checkedAt = '2026-10-02T12:00:00Z';
    next.capturedAt = '2026-10-02T12:05:00Z';
    next.previous = {
      capturedAt: firstRequest.capturedAt,
      manifestation: first.manifestation,
      record: first.record,
    };
    const second = acquireGitHubIssueThroughRefinery(next);
    expect(second.manifestation.payload.byteHashes.sha256).toBe(
      first.manifestation.payload.byteHashes.sha256
    );
    expect(second.manifestation.payload.accessRequirements).toEqual([
      'project:beta',
    ]);
    expect(second.record.payload.lineageRefs).toContain(first.record.cid);
    expect(second.manifestation.parents).toContain(first.manifestation.cid);
    expect(second.record.cid).not.toBe(first.record.cid);
    expect(second.manifestation.cid).not.toBe(first.manifestation.cid);
  });

  it('refuses denied external authorization before touching an inaccessible source', () => {
    const request = specimen();
    request.readDecision.allowed = false;
    const forbidden = new Proxy(
      {},
      {
        get() {
          throw new Error('SOURCE_READ_OCCURRED_BEFORE_DENIAL');
        },
        getPrototypeOf() {
          throw new Error('SOURCE_READ_OCCURRED_BEFORE_DENIAL');
        },
      }
    );
    request.issue = forbidden;
    request.repository = forbidden;
    expect(() => acquireGitHubIssueThroughRefinery(request)).toThrow(
      /DENIED.*external read-decision/iu
    );
  });

  it.each([
    [
      'missing decision reference',
      (r: GitHubIssueAcquisitionRequest) => {
        r.readDecision.decisionRef = '';
      },
    ],
    [
      'wrong repository scope',
      (r: GitHubIssueAcquisitionRequest) => {
        r.readDecision.repositoryNodeId = 'R_unauthorized';
      },
    ],
    [
      'wrong issue scope',
      (r: GitHubIssueAcquisitionRequest) => {
        r.readDecision.issueNodeId = 'I_unauthorized';
      },
    ],
    [
      'read decision older than revision',
      (r: GitHubIssueAcquisitionRequest) => {
        r.readDecision.checkedAt = '2026-10-01T10:00:00Z';
      },
    ],
    [
      'revoked read scope',
      (r: GitHubIssueAcquisitionRequest) => {
        r.readDecision.rightsScopes = [];
      },
    ],
    [
      'read granted after capture',
      (r: GitHubIssueAcquisitionRequest) => {
        r.readDecision.checkedAt = '2026-10-02T12:00:00Z';
      },
    ],
    [
      'no policy lineage',
      (r: GitHubIssueAcquisitionRequest) => {
        r.readDecision.policyRefs = [];
      },
    ],
    [
      'captured before provider revision',
      (r: GitHubIssueAcquisitionRequest) => {
        r.capturedAt = '2026-10-01T10:10:00Z';
      },
    ],
    [
      'forged issue REST URL',
      (r: GitHubIssueAcquisitionRequest) => {
        issueObject(r).url =
          'https://api.github.com/repos/alpha/project/issues/43';
      },
    ],
    [
      'forged repository link',
      (r: GitHubIssueAcquisitionRequest) => {
        issueObject(r).repository_url =
          'https://api.github.com/repos/other/repo';
      },
    ],
    [
      'forged display number',
      (r: GitHubIssueAcquisitionRequest) => {
        issueObject(r).number = 43;
      },
    ],
    [
      'misleading PR as issue',
      (r: GitHubIssueAcquisitionRequest) => {
        issueObject(r).pull_request = {};
      },
    ],
    [
      'incomplete native ID',
      (r: GitHubIssueAcquisitionRequest) => {
        issueObject(r).id = 0;
      },
    ],
    [
      'negative comments',
      (r: GitHubIssueAcquisitionRequest) => {
        issueObject(r).comments = -1;
      },
    ],
    [
      'invalid body',
      (r: GitHubIssueAcquisitionRequest) => {
        issueObject(r).body = { fake: 'text' };
      },
    ],
    [
      'unverifiable capture time',
      (r: GitHubIssueAcquisitionRequest) => {
        r.capturedAt = 'soon';
      },
    ],
    [
      'normalized impossible calendar date',
      (r: GitHubIssueAcquisitionRequest) => {
        r.capturedAt = '2026-02-30T12:05:00Z';
      },
    ],
    [
      'private source marked public',
      (r: GitHubIssueAcquisitionRequest) => {
        repoObject(r).private = true;
        r.readDecision.rightsScopes = ['public'];
      },
    ],
    [
      'unbounded source bytes',
      (r: GitHubIssueAcquisitionRequest) => {
        issueObject(r).body = 'x'.repeat(1_000_001);
      },
    ],
    [
      'forged native owner path',
      (r: GitHubIssueAcquisitionRequest) => {
        repoObject(r).full_name = 'alpha/x?scope=other';
      },
    ],
  ])('rejects %s rather than producing admitted evidence', (_name, mutate) => {
    const request = specimen();
    mutate(request);
    expect(() => acquireGitHubIssueThroughRefinery(request)).toThrow();
  });

  it('rejects stale and cross-source correction lineage without overwriting prior source', () => {
    const v1 = specimen();
    const baseline = acquireGitHubIssueThroughRefinery(v1);
    const next = specimen();
    next.previous = {
      capturedAt: v1.capturedAt,
      record: baseline.record,
      manifestation: baseline.manifestation,
    };
    expect(() => acquireGitHubIssueThroughRefinery(next)).toThrow(
      /stale or nonmonotonic/iu
    );

    next.capturedAt = '2026-10-02T12:05:00Z';
    issueObject(next).id = 42002;
    expect(() => acquireGitHubIssueThroughRefinery(next)).toThrow();

    const forged = specimen();
    forged.capturedAt = '2026-10-02T12:05:00Z';
    forged.previous = {
      capturedAt: v1.capturedAt,
      record: baseline.record,
      manifestation: {
        ...baseline.manifestation,
        payload: {
          ...baseline.manifestation.payload,
          byteHashes: { sha256: 'forged-prior-digest' },
        },
      },
    };
    expect(() => acquireGitHubIssueThroughRefinery(forged)).toThrow(
      /lineage|tampered/iu
    );

    const tampered = specimen();
    tampered.capturedAt = '2026-10-02T12:05:00Z';
    tampered.previous = {
      capturedAt: v1.capturedAt,
      record: {
        ...baseline.record,
        payload: {
          ...baseline.record.payload,
          metadataBlob: {
            ...baseline.record.payload.metadataBlob,
            sourceUpdatedAt: '2026-09-01T00:00:00Z',
          },
        },
      },
      manifestation: baseline.manifestation,
    };
    expect(() => acquireGitHubIssueThroughRefinery(tampered)).toThrow(
      /tampered/iu
    );
  });

  it('bounds nested source JSON before canonicalization instead of recursing indefinitely', () => {
    const request = specimen();
    const root: Record<string, unknown> = {};
    let cursor = root;
    for (let index = 0; index < 100; index++) {
      const nested: Record<string, unknown> = {};
      cursor['nested'] = nested;
      cursor = nested;
    }
    issueObject(request)['unbounded'] = root;
    expect(() => acquireGitHubIssueThroughRefinery(request)).toThrow(
      /over-bounded/u
    );
  });
});
