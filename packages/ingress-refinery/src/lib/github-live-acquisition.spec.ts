import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { validatePayload } from '@entif-ai/rosetta-schemas';
import { verifyTileIntegrity } from '@entif-ai/rosetta-core';
import {
  acquireGitHubNativeSource,
  type GitHubLiveAcquisitionRequest,
  type GitHubLiveFetch,
} from './github-live-acquisition.js';

const repo = {
  id: 1001,
  node_id: 'R_repo',
  full_name: 'alpha/project',
  private: false,
};
const issue = {
  id: 42001,
  node_id: 'I_42',
  number: 42,
  title: 'Native issue',
  body: 'A  double-space source value',
  state: 'open',
  comments: 1,
  created_at: '2026-10-01T10:00:00Z',
  updated_at: '2026-10-01T11:00:00Z',
  url: 'https://api.github.com/repos/alpha/project/issues/42',
  html_url: 'https://github.com/alpha/project/issues/42',
  repository_url: 'https://api.github.com/repos/alpha/project',
};
const pull = {
  id: 991,
  node_id: 'PR_42',
  number: 42,
  created_at: '2026-10-01T10:00:00Z',
  updated_at: '2026-10-01T11:05:00Z',
  url: 'https://api.github.com/repos/alpha/project/pulls/42',
  issue_url: 'https://api.github.com/repos/alpha/project/issues/42',
  base: { repo: { id: 1001 } },
};
const root = '/repos/alpha/project';
const api = 'https://api.github.com';

function fixture(
  requestKind: 'issue' | 'pull-request' = 'issue'
): GitHubLiveAcquisitionRequest {
  return {
    kind: requestKind,
    owner: 'alpha',
    repo: 'project',
    number: 42,
    token: 'testing-secret-do-not-log',
    readGrant: {
      allowed: true,
      grantRef: 'host.github.read.grant.1',
      principalRef: 'host.operator.1',
      owner: 'alpha',
      repo: 'project',
      repositoryId: 1001,
      repositoryNodeId: 'R_repo',
      rightsScopes: ['public'],
    },
  };
}

function provider(
  options: {
    pr?: boolean;
    private?: boolean;
    pageLink?: boolean;
    hostilePageLink?: boolean;
    changedRecheck?: boolean;
    changedRepositoryRights?: boolean;
    deniedPath?: string;
    tamperedPr?: boolean;
    foreignComment?: boolean;
  } = {}
) {
  const calls: Array<{
    url: string;
    authorization: string | null;
    redirect: RequestRedirect | undefined;
  }> = [];
  const nativeIssue = {
    ...issue,
    comments: options.pageLink ? 2 : 1,
    ...(options.pr
      ? {
          html_url: 'https://github.com/alpha/project/pull/42',
          pull_request: { url: api + root + '/pulls/42' },
        }
      : {}),
  };
  const routes = new Map<string, unknown>([
    [root, { ...repo, private: options.private ?? false }],
    [root + '/issues/42', nativeIssue],
    [
      root + '/pulls/42',
      { ...pull, ...(options.tamperedPr ? { number: 43 } : {}) },
    ],
    [
      root + '/issues/42/comments?per_page=2&page=1',
      [
        {
          id: 10,
          node_id: 'IC_10',
          body: 'one',
          ...(options.foreignComment
            ? { issue_url: api + '/repos/other/repo/issues/42' }
            : {}),
        },
      ],
    ],
    [
      root + '/issues/42/timeline?per_page=2&page=1',
      [{ id: 11, event: 'labeled' }],
    ],
    [
      root + '/pulls/42/reviews?per_page=2&page=1',
      [{ id: 12, node_id: 'R_12', state: 'APPROVED' }],
    ],
    [
      root + '/pulls/42/comments?per_page=2&page=1',
      [{ id: 13, node_id: 'RC_13' }],
    ],
    [
      root + '/issues/42/comments?per_page=2&page=2',
      [{ id: 14, node_id: 'IC_14', body: 'two' }],
    ],
  ]);
  let issueReads = 0;
  let repositoryReads = 0;
  const fetchImpl: GitHubLiveFetch = async (url, init) => {
    const parsed = new URL(url);
    const headers = new Headers(init.headers);
    calls.push({
      url,
      authorization: headers.get('authorization'),
      redirect: init.redirect,
    });
    expect(parsed.origin).toBe(api);
    expect(init.method).toBe('GET');
    expect(headers.get('accept')).toBe('application/vnd.github+json');
    if (options.deniedPath && parsed.pathname === options.deniedPath) {
      return new Proxy(new Response('private-content', { status: 403 }), {
        get(target, key) {
          if (key === 'body') throw new Error('DENIED_BODY_READ');
          return Reflect.get(target, key, target);
        },
      });
    }
    const key = parsed.pathname + parsed.search;
    if (!routes.has(key))
      throw new Error('Unexpected test provider path: ' + key);
    let body = routes.get(key);
    if (key === root) {
      repositoryReads++;
      if (options.changedRepositoryRights && repositoryReads === 2) {
        body = { ...repo, private: true };
      }
    }
    if (key === root + '/issues/42') {
      issueReads++;
      if (options.changedRecheck && issueReads === 2)
        body = { ...nativeIssue, title: 'Changed midway' };
    }
    const link =
      (options.pageLink || options.hostilePageLink) &&
      key === root + '/issues/42/comments?per_page=2&page=1'
        ? '<' +
          (options.hostilePageLink
            ? 'https://untrusted.example/repos/alpha/project/issues/42/comments?per_page=2&page=2'
            : api + root + '/issues/42/comments?per_page=2&page=2') +
          '>; rel="next"'
        : null;
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: link ? { link } : undefined,
    });
  };
  return { calls, fetchImpl };
}

describe('authenticated native GitHub issue and PR source acquisition', () => {
  it('checks the provider with a bearer token, retains exact raw bytes and closes source/refinery lineage', async () => {
    const server = provider();
    const result = await acquireGitHubNativeSource({
      ...fixture(),
      fetchImpl: server.fetchImpl,
      perPage: 2,
    });
    expect(server.calls.length).toBe(6); // repo, issue, comments, timeline, issue and repository rechecks
    expect(
      server.calls.every(
        (call) =>
          call.authorization === 'Bearer testing-secret-do-not-log' &&
          call.redirect === 'manual'
      )
    ).toBe(true);
    expect(result.authorizationBasis).toBe(
      'github-bearer-and-caller-scoped-grant'
    );
    expect(result.readAuthorization.grantRef).toBe('host.github.read.grant.1');
    expect(result.captureCoverage.complete).toBe(true);
    expect(result.captureCoverage.reviews.included).toBe(false);
    expect(result.record.payload.recordLocalId).toBe('github.issue:1001:42001');
    expect(result.episode.payload.family).toBe('github-issue');
    expect(result.episode.payload.sourcePackageCid).toBe(
      result.sourcePackage.cid
    );
    expect(
      result.canonicalArtifact.payload.provenanceRefs.sourcePackageCid
    ).toBe(result.sourcePackage.cid);
    expect(result.sourcePackage.payload.boundedness?.isComplete).toBe(true);
    expect(result.rawResponses.length).toBe(6);
    for (const raw of result.rawResponses) {
      expect(createHash('sha256').update(raw.bytes).digest('hex')).toBe(
        raw.sha256
      );
      expect(raw.bytes.byteLength).toBe(raw.byteLength);
      expect(
        result.episode.payload.rawEvidenceRefs.some(
          (e) => e.sha256 === raw.sha256
        )
      ).toBe(true);
    }
    expect(result.canonicalSourceJson).toContain('A  double-space');
    expect(result.canonicalArtifact.payload.normalizedText).toContain(
      'A double-space'
    );
    expect(result.manifestation.payload.accessRequirements).toEqual(['public']);
    expect(result.evaluationReceipt.payload.evaluatedAt).toBe(
      result.fetchReceipt.payload.fetchedAt
    );
    expect(JSON.stringify(result.record)).not.toContain(
      'testing-secret-do-not-log'
    );
    for (const tile of [
      result.record,
      result.manifestation,
      result.sourcePackage,
      result.episode,
      result.ingressJob,
      result.canonicalArtifact,
      result.fetchReceipt,
      result.normalizationReceipt,
      result.evaluationReceipt,
    ]) {
      expect(verifyTileIntegrity(tile).ok).toBe(true);
      expect(validatePayload(tile.kind, tile.payload).ok).toBe(true);
    }
  });

  it('rejects missing credentials before invoking the transport', async () => {
    const server = provider();
    const input = fixture();
    input.token = '';
    input.fetchImpl = server.fetchImpl;
    await expect(acquireGitHubNativeSource(input)).rejects.toThrow(
      /DENIED.*credential/u
    );
    expect(server.calls).toHaveLength(0);
  });

  it('rejects an ungranted or mismatched source before any network/payload read', async () => {
    const server = provider();
    const input = { ...fixture(), fetchImpl: server.fetchImpl };
    input.readGrant = { ...input.readGrant, allowed: false };
    await expect(acquireGitHubNativeSource(input)).rejects.toThrow(
      /DENIED.*grant/u
    );
    input.readGrant = { ...fixture().readGrant, repo: 'ungranted' };
    await expect(acquireGitHubNativeSource(input)).rejects.toThrow(
      /DENIED.*grant/u
    );
    expect(server.calls).toHaveLength(0);
  });

  it('rejects the native provider repository ID before touching issue contents', async () => {
    const server = provider();
    const input = { ...fixture(), fetchImpl: server.fetchImpl };
    input.readGrant = { ...input.readGrant, repositoryId: 2002 };
    await expect(acquireGitHubNativeSource(input)).rejects.toThrow(
      /DENIED.*repository identity/u
    );
    expect(server.calls).toHaveLength(1);
  });

  it('enforces a request deadline even when an injected transport ignores AbortSignal', async () => {
    const never: GitHubLiveFetch = async () =>
      new Promise<Response>(() => undefined);
    await expect(
      acquireGitHubNativeSource({
        ...fixture(),
        fetchImpl: never,
        timeoutMs: 5,
      })
    ).rejects.toThrow(/timed out/u);
  });

  it('fails closed on provider denial without inspecting protected response bytes', async () => {
    const server = provider({ deniedPath: root + '/issues/42' });
    await expect(
      acquireGitHubNativeSource({ ...fixture(), fetchImpl: server.fetchImpl })
    ).rejects.toThrow(/DENIED.*403/u);
    expect(server.calls).toHaveLength(2);
  });

  it('rejects cross-host pagination before following it', async () => {
    const server = provider({ hostilePageLink: true });
    await expect(
      acquireGitHubNativeSource({
        ...fixture(),
        fetchImpl: server.fetchImpl,
        perPage: 2,
      })
    ).rejects.toThrow(/pagination outside the authorized collection/u);
    expect(server.calls.every((call) => call.url.startsWith(api + '/'))).toBe(
      true
    );
    expect(
      server.calls.filter((call) => /[?&]page=2(?:&|$)/u.test(call.url))
    ).toHaveLength(0);
  });

  it('does not reclassify denied PR review requests as an empty review collection', async () => {
    const server = provider({
      pr: true,
      deniedPath: root + '/pulls/42/reviews',
    });
    await expect(
      acquireGitHubNativeSource({
        ...fixture('pull-request'),
        fetchImpl: server.fetchImpl,
        perPage: 2,
      })
    ).rejects.toThrow(/DENIED.*403.*reviews/u);
  });

  it('rejects a comment that claims a different source issue', async () => {
    await expect(
      acquireGitHubNativeSource({
        ...fixture(),
        fetchImpl: provider({ foreignComment: true }).fetchImpl,
        perPage: 2,
      })
    ).rejects.toThrow(/belongs to a different issue/u);
  });

  it('refuses stale visibility when the repository changes rights during paging', async () => {
    await expect(
      acquireGitHubNativeSource({
        ...fixture(),
        fetchImpl: provider({ changedRepositoryRights: true }).fetchImpl,
        perPage: 2,
      })
    ).rejects.toThrow(/rights changed during bounded capture/u);
  });

  it('marks bounded pagination as partial and does not fetch beyond the page cap', async () => {
    const server = provider({ pageLink: true });
    const result = await acquireGitHubNativeSource({
      ...fixture(),
      fetchImpl: server.fetchImpl,
      perPage: 2,
      maxPagesPerCollection: 1,
    });
    expect(result.captureCoverage.complete).toBe(false);
    expect(result.captureCoverage.comments).toMatchObject({
      included: true,
      complete: false,
      pagesFetched: 1,
      nextPage: 2,
    });
    expect(result.sourcePackage.payload.boundedness?.truncated).toBe(true);
    expect(
      server.calls.filter((call) => /[?&]page=2(?:&|$)/u.test(call.url))
    ).toHaveLength(0);
  });

  it('reads all pages when the next page is authorized and the cap allows it', async () => {
    const server = provider({ pageLink: true });
    const result = await acquireGitHubNativeSource({
      ...fixture(),
      fetchImpl: server.fetchImpl,
      perPage: 2,
      maxPagesPerCollection: 2,
    });
    expect(result.captureCoverage.complete).toBe(true);
    expect(result.captureCoverage.comments.itemCount).toBe(2);
    expect(result.rawResponses.some((r) => r.url.endsWith('page=2'))).toBe(
      true
    );
  });

  it('splits issue-number identity from native PR identity and captures bounded reviews', async () => {
    const server = provider({ pr: true });
    await expect(
      acquireGitHubNativeSource({
        ...fixture('issue'),
        fetchImpl: server.fetchImpl,
        perPage: 2,
      })
    ).rejects.toThrow(/type does not match/u);
    const source = await acquireGitHubNativeSource({
      ...fixture('pull-request'),
      fetchImpl: server.fetchImpl,
      perPage: 2,
    });
    expect(source.record.payload.recordLocalId).toBe(
      'github.pull-request:1001:991'
    );
    expect(source.episode.payload.family).toBe('github-pull-request');
    expect(source.captureCoverage.complete).toBe(true);
    expect(source.captureCoverage.reviews).toMatchObject({
      complete: true,
      itemCount: 1,
    });
    expect(source.captureCoverage.reviewComments).toMatchObject({
      complete: true,
      itemCount: 1,
    });
    expect(source.rawResponses.some((r) => r.resource === 'reviews')).toBe(
      true
    );
    expect(
      source.rawResponses.some((r) => r.resource === 'review-comments')
    ).toBe(true);
    await expect(
      acquireGitHubNativeSource({
        ...fixture('pull-request'),
        fetchImpl: provider().fetchImpl,
        perPage: 2,
      })
    ).rejects.toThrow(/type does not match/u);
    await expect(
      acquireGitHubNativeSource({
        ...fixture('pull-request'),
        fetchImpl: provider({ pr: true, tamperedPr: true }).fetchImpl,
        perPage: 2,
      })
    ).rejects.toThrow(/pull request native target disagrees/u);
  });

  it('preserves private rights and source correction lineage under a later provider observation', async () => {
    const first = await acquireGitHubNativeSource({
      ...fixture(),
      fetchImpl: provider().fetchImpl,
      perPage: 2,
    });
    // A next observation requires a strictly later capture timestamp.
    await new Promise((resolve) => setTimeout(resolve, 5));
    const granted = fixture();
    granted.readGrant.rightsScopes = ['github:repository:R_repo'];
    const second = await acquireGitHubNativeSource({
      ...granted,
      fetchImpl: provider({ private: true }).fetchImpl,
      perPage: 2,
      previous: {
        capturedAt: first.fetchReceipt.payload.fetchedAt,
        record: first.record,
        manifestation: first.manifestation,
      },
    });
    expect(second.record.payload.lineageRefs).toContain(first.record.cid);
    expect(second.manifestation.parents).toContain(first.manifestation.cid);
    expect(second.manifestation.payload.accessRequirements).toEqual([
      'github:repository:R_repo',
    ]);
    expect(second.record.payload.publicationStatus).toBe('restricted');
    expect(second.canonicalArtifact.payload.rightsScopes).toEqual([
      'github:repository:R_repo',
    ]);
  });

  it('reobserves unchanged source bytes without creating a new record or manifestation identity', async () => {
    const first = await acquireGitHubNativeSource({
      ...fixture(),
      fetchImpl: provider().fetchImpl,
      perPage: 2,
    });
    await new Promise((resolve) => setTimeout(resolve, 5));
    const second = await acquireGitHubNativeSource({
      ...fixture(),
      fetchImpl: provider().fetchImpl,
      perPage: 2,
      previous: {
        capturedAt: first.fetchReceipt.payload.fetchedAt,
        record: first.record,
        manifestation: first.manifestation,
      },
    });
    expect(second.record.cid).toBe(first.record.cid);
    expect(second.manifestation.cid).toBe(first.manifestation.cid);
    expect(second.sourcePackage.cid).toBe(first.sourcePackage.cid);
    expect(second.fetchReceipt.cid).not.toBe(first.fetchReceipt.cid);
  });

  it('refuses private-source admission under public-only host grant', async () => {
    const server = provider({ private: true });
    await expect(
      acquireGitHubNativeSource({
        ...fixture(),
        fetchImpl: server.fetchImpl,
      })
    ).rejects.toThrow(/DENIED.*private rights/u);
    expect(server.calls).toHaveLength(1);
  });

  it('refuses a capture if the provider issue changed during pagination', async () => {
    await expect(
      acquireGitHubNativeSource({
        ...fixture(),
        fetchImpl: provider({ changedRecheck: true }).fetchImpl,
        perPage: 2,
      })
    ).rejects.toThrow(/changed during bounded capture/u);
  });
});
