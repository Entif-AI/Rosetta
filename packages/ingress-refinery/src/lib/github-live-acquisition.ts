import { createHash } from 'node:crypto';
import { canonicalizeJson, type JsonValue } from '@entif-ai/rosetta-canon';
import { sha256Hex } from '@entif-ai/rosetta-cid';
import { verifyTileIntegrity, type TileEnvelope } from '@entif-ai/rosetta-core';
import {
  createSourceManifestationTile,
  createSourcePackageTile,
  createSourceRecordTile,
  createSourceSystemProfileTile,
  type SourceManifestation,
  type SourceRecord,
} from '@entif-ai/source-substrate';
import { bootstrapSourceProfiles } from '@entif-ai/source-registry';
import {
  createIngressJob,
  createParseOnlySourceEpisode,
  refineTextArtifact,
} from './ingress-refinery.js';

export type GitHubNativeSourceKind = 'issue' | 'pull-request';
export type GitHubLiveFetch = (
  url: string,
  init: RequestInit
) => Promise<Response>;

/**
 * Host decision constraining which native repository can be read. The host
 * must authorize this grant independently; this adapter validates its scope
 * and GitHub's live bearer-token response, but cannot validate a grant issuer.
 */
export interface GitHubRepositoryReadGrant {
  allowed: boolean;
  grantRef: string;
  principalRef: string;
  owner: string;
  repo: string;
  repositoryId: number;
  repositoryNodeId: string;
  rightsScopes: string[];
}

export interface GitHubLiveAcquisitionRequest {
  kind: GitHubNativeSourceKind;
  owner: string;
  repo: string;
  number: number;
  /** A bearer credential supplied by the host. Never placed in a tile or receipt. */
  token: string;
  readGrant: GitHubRepositoryReadGrant;
  /** For tests and hosts with their own HTTP stack. All calls still carry the bearer credential. */
  fetchImpl?: GitHubLiveFetch;
  perPage?: number;
  maxPagesPerCollection?: number;
  maxItemsPerCollection?: number;
  maxTotalBytes?: number;
  timeoutMs?: number;
  includeComments?: boolean;
  includeTimeline?: boolean;
  includeReviews?: boolean;
  previous?: {
    capturedAt: string;
    record: TileEnvelope<SourceRecord>;
    manifestation: TileEnvelope<SourceManifestation>;
  };
}

export interface GitHubRawResponse {
  resource:
    | 'repository'
    | 'repository-recheck'
    | 'issue'
    | 'pull-request'
    | 'pull-request-recheck'
    | 'comments'
    | 'timeline'
    | 'reviews'
    | 'review-comments'
    | 'issue-recheck';
  url: string;
  sha256: string;
  bytes: Uint8Array;
  byteLength: number;
  capturedAt: string;
}

export interface GitHubCollectionCoverage {
  included: boolean;
  complete: boolean;
  itemCount: number;
  pagesFetched: number;
  nextPage: number | null;
}

export interface GitHubLiveAcquisitionResult {
  authorizationBasis: 'github-bearer-and-caller-scoped-grant';
  readAuthorization: {
    grantRef: string;
    principalRef: string;
    rightsScopes: string[];
    repositoryNodeId: string;
  };
  kind: GitHubNativeSourceKind;
  captureCoverage: {
    complete: boolean;
    comments: GitHubCollectionCoverage;
    timeline: GitHubCollectionCoverage;
    reviews: GitHubCollectionCoverage;
    reviewComments: GitHubCollectionCoverage;
  };
  /** Exact HTTP entity bytes, indexed by SHA-256. The consumer owns durable persistence. */
  rawResponses: GitHubRawResponse[];
  canonicalSourceJson: string;
  sourcePackage: ReturnType<typeof createSourcePackageTile>;
  sourceSystem: ReturnType<typeof createSourceSystemProfileTile>;
  record: ReturnType<typeof createSourceRecordTile>;
  manifestation: ReturnType<typeof createSourceManifestationTile>;
  episode: ReturnType<typeof createParseOnlySourceEpisode>;
  ingressJob: ReturnType<typeof createIngressJob>;
  canonicalArtifact: ReturnType<typeof refineTextArtifact>['canonicalArtifact'];
  fetchReceipt: ReturnType<typeof refineTextArtifact>['fetchReceipt'];
  normalizationReceipt: ReturnType<
    typeof refineTextArtifact
  >['normalizationReceipt'];
  evaluationReceipt: ReturnType<typeof refineTextArtifact>['evaluationReceipt'];
  trustMatrix: ReturnType<typeof refineTextArtifact>['trustMatrix'];
}

const API = 'https://api.github.com';
const MAX_RESPONSE_BYTES = 1_000_000;
const MAX_JSON_DEPTH = 64;
const MAX_JSON_NODES = 25_000;
const encoder = new TextDecoder('utf-8', { fatal: true });

function object(value: unknown, label: string): Record<string, unknown> {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new Error('GitHub provider returned invalid ' + label + '.');
  }
  return value as Record<string, unknown>;
}

function string(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim())
    throw new Error('GitHub provider missing ' + field + '.');
  return value;
}

function positiveInt(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
    throw new Error('GitHub provider missing positive ' + field + '.');
  }
  return value;
}

function instant(value: unknown, field: string): string {
  const iso = string(value, field);
  const ms = Date.parse(iso);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(iso) ||
    !Number.isFinite(ms) ||
    new Date(ms).toISOString().slice(0, 19) !== iso.slice(0, 19)
  ) {
    throw new Error('GitHub provider invalid UTC instant ' + field + '.');
  }
  return iso;
}

function validateJsonBound(value: unknown): asserts value is JsonValue {
  const pending: Array<{ value: unknown; depth: number }> = [
    { value, depth: 0 },
  ];
  let nodes = 0;
  const seen = new Set<object>();
  while (pending.length) {
    const entry = pending.pop()!;
    if (++nodes > MAX_JSON_NODES || entry.depth > MAX_JSON_DEPTH)
      throw new Error('GitHub JSON structure exceeds admission bounds.');
    const v = entry.value;
    if (v === null || typeof v === 'string' || typeof v === 'boolean') continue;
    if (typeof v === 'number' && Number.isFinite(v)) continue;
    if (!v || typeof v !== 'object' || seen.has(v))
      throw new Error('GitHub JSON structure invalid.');
    seen.add(v);
    if (!Array.isArray(v) && Object.getPrototypeOf(v) !== Object.prototype)
      throw new Error('GitHub JSON structure invalid.');
    for (const child of Object.values(v))
      pending.push({ value: child, depth: entry.depth + 1 });
  }
}

function requireLimit(
  value: number | undefined,
  fallback: number,
  ceiling: number,
  label: string
): number {
  const result = value ?? fallback;
  if (!Number.isSafeInteger(result) || result < 1 || result > ceiling)
    throw new Error('Invalid GitHub ' + label + ' bound.');
  return result;
}

function verifyCollectionNext(
  link: string | null,
  currentUrl: string,
  page: number
): boolean {
  if (!link) return false;
  const next = link
    .split(',')
    .find((part) => /;\s*rel="next"\s*$/u.test(part.trim()));
  if (!next) return false;
  const match = /^\s*<([^>]+)>;\s*rel="next"\s*$/u.exec(next.trim());
  if (!match)
    throw new Error('GitHub provider returned malformed pagination link.');
  const received = new URL(match[1]);
  const current = new URL(currentUrl);
  if (
    received.origin !== API ||
    received.pathname !== current.pathname ||
    received.searchParams.get('per_page') !==
      current.searchParams.get('per_page') ||
    received.searchParams.get('page') !== String(page + 1) ||
    Array.from(received.searchParams.keys()).some(
      (key) => key !== 'page' && key !== 'per_page'
    )
  ) {
    throw new Error(
      'GitHub provider returned pagination outside the authorized collection.'
    );
  }
  return true;
}

/**
 * A fixed-origin token transport. Network authorization comes from GitHub's
 * status response, never a caller-authored read decision. No redirect follows.
 */
export async function acquireGitHubNativeSource(
  request: GitHubLiveAcquisitionRequest
): Promise<GitHubLiveAcquisitionResult> {
  // Credential and target preflight precede any provider response or source payload read.
  if (typeof request.token !== 'string' || !request.token.trim())
    throw new Error('GitHub read DENIED: bearer credential required.');
  const suppliedGrant = request.readGrant;
  if (
    suppliedGrant?.allowed !== true ||
    !suppliedGrant.grantRef?.trim() ||
    !suppliedGrant.principalRef?.trim() ||
    suppliedGrant.owner !== request.owner ||
    suppliedGrant.repo !== request.repo ||
    !Number.isSafeInteger(suppliedGrant.repositoryId) ||
    suppliedGrant.repositoryId < 1 ||
    !suppliedGrant.repositoryNodeId?.trim() ||
    !Array.isArray(suppliedGrant.rightsScopes) ||
    suppliedGrant.rightsScopes.length === 0 ||
    !suppliedGrant.rightsScopes.every(
      (scope) => typeof scope === 'string' && scope.trim()
    )
  ) {
    throw new Error(
      'GitHub read DENIED: missing or mismatched operator repository grant.'
    );
  }
  // Freeze request primitives and scope at preflight. A host's transport must
  // not be able to switch repositories or grant scope during awaited reads.
  const grant = { ...suppliedGrant, rightsScopes: [...suppliedGrant.rightsScopes] };
  request = { ...request, readGrant: grant };
  if (
    !/^[a-zA-Z0-9-]+$/u.test(request.owner) ||
    !/^[a-zA-Z0-9._-]+$/u.test(request.repo) ||
    request.repo === '.' ||
    request.repo === '..' ||
    !Number.isSafeInteger(request.number) ||
    request.number < 1 ||
    (request.kind !== 'issue' && request.kind !== 'pull-request')
  ) {
    throw new Error('Invalid GitHub native source target.');
  }
  const perPage = requireLimit(request.perPage, 50, 100, 'perPage');
  const maxPages = requireLimit(
    request.maxPagesPerCollection,
    2,
    10,
    'maxPagesPerCollection'
  );
  const maxItems = requireLimit(
    request.maxItemsPerCollection,
    100,
    1000,
    'maxItemsPerCollection'
  );
  const maxBytes = requireLimit(
    request.maxTotalBytes,
    3_000_000,
    10_000_000,
    'maxTotalBytes'
  );
  const timeoutMs = requireLimit(
    request.timeoutMs,
    15_000,
    60_000,
    'timeoutMs'
  );
  const fetchImpl = request.fetchImpl ?? fetch;
  const prefix = '/repos/' + request.owner + '/' + request.repo;
  const issuePath = prefix + '/issues/' + request.number;
  const rawResponses: GitHubRawResponse[] = [];
  let totalBytes = 0;

  async function read(
    path: string,
    resource: GitHubRawResponse['resource']
  ): Promise<{ value: unknown; link: string | null }> {
    const url = API + path;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const work = async () => {
      const response = await fetchImpl(url, {
        method: 'GET',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: 'Bearer ' + request.token,
          'X-GitHub-Api-Version': '2022-11-28',
        },
        redirect: 'manual',
        signal: controller.signal,
      });
      // Never inspect denied response content; do not include token or provider body in errors.
      if (
        response.status === 401 ||
        response.status === 403 ||
        response.status === 404
      ) {
        throw new Error(
          'GitHub read DENIED: provider status ' +
            response.status +
            ' for ' +
            resource +
            '.'
        );
      }
      if (!response.ok || response.status !== 200) {
        throw new Error(
          'GitHub read FAILED: provider status ' +
            response.status +
            ' for ' +
            resource +
            '.'
        );
      }
      const chunks: Uint8Array[] = [];
      let count = 0;
      if (!response.body)
        throw new Error('GitHub provider returned empty response stream.');
      const reader = response.body.getReader();
      try {
        while (true) {
          const next = await reader.read();
          if (next.done) break;
          count += next.value.byteLength;
          if (count > MAX_RESPONSE_BYTES || totalBytes + count > maxBytes) {
            throw new Error(
              'GitHub provider response exceeds bounded byte budget.'
            );
          }
          // Copy chunks immediately: an injected stream may reuse its backing buffer.
          chunks.push(next.value.slice());
        }
      } catch (error) {
        await reader.cancel().catch(() => undefined);
        throw error;
      }
      const bytes = new Uint8Array(count);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      totalBytes += count;
      let value: unknown;
      try {
        value = JSON.parse(encoder.decode(bytes));
      } catch {
        throw new Error('GitHub provider response is not valid UTF-8 JSON.');
      }
      validateJsonBound(value);
      if (controller.signal.aborted)
        throw new Error('GitHub provider read timed out.');
      rawResponses.push({
        resource,
        url,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        bytes,
        byteLength: count,
        capturedAt: new Date().toISOString(),
      });
      return { value, link: response.headers.get('link') };
    };
    try {
      return await Promise.race([
        work(),
        new Promise<never>((_resolve, reject) => {
          timer = setTimeout(() => {
            controller.abort();
            reject(
              new Error('GitHub provider read timed out for ' + resource + '.')
            );
          }, timeoutMs);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function collection(
    path: string,
    resource: GitHubRawResponse['resource'],
    included: boolean
  ) {
    const values: unknown[] = [];
    if (!included)
      return {
        values,
        coverage: {
          included: false,
          complete: false,
          itemCount: 0,
          pagesFetched: 0,
          nextPage: null,
        } satisfies GitHubCollectionCoverage,
      };
    let pagesFetched = 0;
    let nextPage: number | null = null;
    for (let page = 1; page <= maxPages; page++) {
      const url = path + '?per_page=' + perPage + '&page=' + page;
      const response = await read(url, resource);
      if (!Array.isArray(response.value))
        throw new Error(
          'GitHub provider returned non-array ' + resource + ' collection.'
        );
      if (
        values.length + response.value.length > maxItems ||
        response.value.length > perPage
      ) {
        throw new Error(
          'GitHub provider collection exceeds bounded item budget.'
        );
      }
      for (const item of response.value) {
        const native = object(item, resource + ' item');
        positiveInt(native.id, resource + '.id');
        if (native.node_id !== undefined)
          string(native.node_id, resource + '.node_id');
        if (
          native.issue_url !== undefined &&
          native.issue_url !== API + issuePath
        ) {
          throw new Error(
            'GitHub ' + resource + ' belongs to a different issue.'
          );
        }
        if (
          native.pull_request_url !== undefined &&
          native.pull_request_url !== API + prefix + '/pulls/' + request.number
        ) {
          throw new Error(
            'GitHub ' + resource + ' belongs to a different pull request.'
          );
        }
        if (
          native.url !== undefined &&
          (!String(native.url).startsWith(API + prefix + '/') ||
            typeof native.url !== 'string')
        ) {
          throw new Error(
            'GitHub ' + resource + ' native URL leaves source repository.'
          );
        }
      }
      values.push(...response.value);
      pagesFetched++;
      const hasNext = verifyCollectionNext(response.link, API + url, page);
      if (!hasNext) break;
      nextPage = page + 1;
    }
    return {
      values,
      coverage: {
        included: true,
        complete: nextPage === null || nextPage <= maxPages,
        itemCount: values.length,
        pagesFetched,
        nextPage: nextPage && nextPage > maxPages ? nextPage : null,
      } satisfies GitHubCollectionCoverage,
    };
  }

  const repo = object((await read(prefix, 'repository')).value, 'repository');
  const fullName = request.owner + '/' + request.repo;
  const repositoryId = positiveInt(repo.id, 'repository.id');
  const repositoryNodeId = string(repo.node_id, 'repository.node_id');
  if (repo.full_name !== fullName || typeof repo.private !== 'boolean')
    throw new Error(
      'GitHub repository identity or visibility disagrees with target.'
    );
  if (
    grant.repositoryId !== repositoryId ||
    grant.repositoryNodeId !== repositoryNodeId ||
    (repo.private === true &&
      (grant.rightsScopes.includes('public') ||
        !grant.rightsScopes.includes('github:repository:' + repositoryNodeId)))
  ) {
    throw new Error(
      'GitHub read DENIED: provider repository identity or private rights differ from operator grant.'
    );
  }
  const issue = object((await read(issuePath, 'issue')).value, 'issue');
  const issueId = positiveInt(issue.id, 'issue.id');
  const issueNodeId = string(issue.node_id, 'issue.node_id');
  const apiIssueUrl = API + issuePath;
  if (
    request.kind === 'issue'
      ? Object.hasOwn(issue, 'pull_request')
      : !Object.hasOwn(issue, 'pull_request')
  ) {
    throw new Error(
      'GitHub native issue/PR type does not match requested source kind.'
    );
  }
  if (
    positiveInt(issue.number, 'issue.number') !== request.number ||
    issue.url !== apiIssueUrl ||
    issue.html_url !==
      'https://github.com/' +
        fullName +
        '/' +
        (request.kind === 'issue' ? 'issues' : 'pull') +
        '/' +
        request.number ||
    issue.repository_url !== API + prefix
  ) {
    throw new Error('GitHub issue native repository, URL or number disagree.');
  }
  if (
    request.kind === 'pull-request' &&
    object(issue.pull_request, 'issue.pull_request').url !==
      API + prefix + '/pulls/' + request.number
  ) {
    throw new Error(
      'GitHub issue PR reference disagrees with requested native PR.'
    );
  }
  string(issue.title, 'issue.title');
  if (issue.body !== null && typeof issue.body !== 'string')
    throw new Error('GitHub issue body must be text or null.');
  if (issue.state !== 'open' && issue.state !== 'closed')
    throw new Error('GitHub issue has unsupported native state.');
  const createdAt = instant(issue.created_at, 'issue.created_at');
  const issueUpdatedAt = instant(issue.updated_at, 'issue.updated_at');
  if (Date.parse(issueUpdatedAt) < Date.parse(createdAt))
    throw new Error('GitHub issue revision precedes creation.');
  const prPath = prefix + '/pulls/' + request.number;
  let pullRequest: Record<string, unknown> | undefined;
  if (request.kind === 'pull-request') {
    pullRequest = object(
      (await read(prPath, 'pull-request')).value,
      'pull-request'
    );
    if (
      positiveInt(pullRequest.number, 'pull_request.number') !==
        request.number ||
      pullRequest.url !== API + prPath ||
      pullRequest.issue_url !== apiIssueUrl ||
      positiveInt(
        object(
          object(pullRequest.base, 'pull_request.base').repo,
          'pull_request.base.repo'
        ).id,
        'pull_request.base.repo.id'
      ) !== repositoryId
    ) {
      throw new Error(
        'GitHub pull request native target disagrees with issue/repository.'
      );
    }
    positiveInt(pullRequest.id, 'pull_request.id');
    string(pullRequest.node_id, 'pull_request.node_id');
  }
  const pullUpdatedAt = pullRequest
    ? instant(pullRequest.updated_at, 'pull_request.updated_at')
    : issueUpdatedAt;
  const updatedAt =
    Date.parse(pullUpdatedAt) > Date.parse(issueUpdatedAt)
      ? pullUpdatedAt
      : issueUpdatedAt;
  const comments = await collection(
    issuePath + '/comments',
    'comments',
    request.includeComments !== false
  );
  const timeline = await collection(
    issuePath + '/timeline',
    'timeline',
    request.includeTimeline !== false
  );
  const reviews = await collection(
    prPath + '/reviews',
    'reviews',
    request.kind === 'pull-request' && request.includeReviews !== false
  );
  const reviewComments = await collection(
    prPath + '/comments',
    'review-comments',
    request.kind === 'pull-request' && request.includeReviews !== false
  );
  const expectedIssueComments = issue.comments;
  if (
    !Number.isSafeInteger(expectedIssueComments) ||
    (expectedIssueComments as number) < 0
  ) {
    throw new Error('GitHub issue has invalid native comment count.');
  }
  if (
    comments.coverage.included &&
    comments.coverage.complete &&
    comments.values.length !== expectedIssueComments
  ) {
    comments.coverage.complete = false;
    // A missing provider Link must not certify coverage against the native count.
    comments.coverage.nextPage =
      comments.coverage.nextPage ?? comments.coverage.pagesFetched + 1;
  }
  // A changed issue while paging would make all collected pages an incoherent revision.
  const issueRecheck = object(
    (await read(issuePath, 'issue-recheck')).value,
    'issue recheck'
  );
  if (
    sha256Hex(canonicalizeJson(issue as JsonValue)) !==
    sha256Hex(canonicalizeJson(issueRecheck as JsonValue))
  ) {
    throw new Error(
      'GitHub issue changed during bounded capture; retry from a new observation.'
    );
  }
  const repoRecheck = object(
    (await read(prefix, 'repository-recheck')).value,
    'repository recheck'
  );
  if (
    repoRecheck.id !== repositoryId ||
    repoRecheck.node_id !== repositoryNodeId ||
    repoRecheck.full_name !== fullName ||
    repoRecheck.private !== repo.private
  ) {
    throw new Error(
      'GitHub repository identity or rights changed during bounded capture.'
    );
  }
  if (pullRequest) {
    const prRecheck = object(
      (await read(prPath, 'pull-request-recheck')).value,
      'pull request recheck'
    );
    if (
      sha256Hex(canonicalizeJson(pullRequest as JsonValue)) !==
      sha256Hex(canonicalizeJson(prRecheck as JsonValue))
    ) {
      throw new Error('GitHub pull request changed during bounded capture.');
    }
  }
  const capturedAt = new Date().toISOString();
  const mintTime = capturedAt;
  if (Date.parse(updatedAt) > Date.parse(capturedAt))
    throw new Error('GitHub source revision occurs after provider capture.');
  const scopes = [...grant.rightsScopes];
  const coverage = {
    complete: false,
    comments: comments.coverage,
    timeline: timeline.coverage,
    reviews: reviews.coverage,
    reviewComments: reviewComments.coverage,
  };
  // The absent PR-only collections are explicitly excluded, not missing issue data.
  coverage.complete = [
    comments.coverage,
    timeline.coverage,
    ...(request.kind === 'pull-request'
      ? [reviews.coverage, reviewComments.coverage]
      : []),
  ].every((part) => part.included && part.complete);
  const snapshot = {
    repository: repo,
    issue,
    ...(pullRequest ? { pullRequest } : {}),
    comments: comments.values,
    timeline: timeline.values,
    ...(pullRequest
      ? { reviews: reviews.values, reviewComments: reviewComments.values }
      : {}),
  };
  validateJsonBound(snapshot);
  const snapshotJson = canonicalizeJson(snapshot as JsonValue);
  if (Buffer.byteLength(snapshotJson, 'utf8') > maxBytes)
    throw new Error('GitHub canonical snapshot exceeds bounded byte budget.');
  const snapshotHash = sha256Hex(snapshotJson);
  const sourceSystemProfile = bootstrapSourceProfiles.find(
    (item) => item.sourceSystemId === 'github'
  );
  if (!sourceSystemProfile)
    throw new Error('GitHub source registry profile is unavailable.');
  const sourceSystem = createSourceSystemProfileTile(sourceSystemProfile);
  const nativeId =
    request.kind === 'issue'
      ? issueId
      : positiveInt(pullRequest!.id, 'pull_request.id');
  const nativeNodeId =
    request.kind === 'issue'
      ? issueNodeId
      : string(pullRequest!.node_id, 'pull_request.node_id');
  const sourceId =
    'github.' + request.kind + ':' + repositoryId + ':' + nativeId;
  const prior = request.previous;
  if (prior) {
    if (
      !verifyTileIntegrity(prior.record).ok ||
      !verifyTileIntegrity(prior.manifestation).ok ||
      prior.record.payload.sourceSystemId !== 'github' ||
      prior.record.payload.recordType !== 'github-' + request.kind ||
      prior.record.payload.recordLocalId !== sourceId ||
      prior.manifestation.payload.sourceRecordCid !== prior.record.cid ||
      prior.manifestation.payload.manifestationKind !==
        'github-' + request.kind + '-rest-json' ||
      prior.manifestation.payload.manifestationId !==
        sourceId + ':' + prior.manifestation.payload.byteHashes.sha256 ||
      prior.record.payload.metadataBlob.snapshotHash !==
        prior.manifestation.payload.byteHashes.sha256 ||
      prior.record.payload.metadataBlob.nativeNodeId !== nativeNodeId ||
      prior.record.payload.metadataBlob.repositoryNodeId !== repositoryNodeId ||
      Date.parse(instant(prior.capturedAt, 'previous.capturedAt')) >=
        Date.parse(capturedAt) ||
      Date.parse(
        instant(prior.record.payload.claimedVersion, 'previous.claimedVersion')
      ) > Date.parse(updatedAt)
    ) {
      throw new Error(
        'GitHub native source prior correction identity, integrity or chronology disagrees.'
      );
    }
  }
  const sameSource =
    !!prior &&
    prior.manifestation.payload.byteHashes.sha256 === snapshotHash &&
    prior.record.payload.publicationStatus ===
      (repo.private ? 'restricted' : 'published') &&
    JSON.stringify(prior.manifestation.payload.accessRequirements) ===
      JSON.stringify(scopes);
  const record = sameSource
    ? prior!.record
    : createSourceRecordTile(
        {
          sourceSystemId: 'github',
          recordLocalId: sourceId,
          recordType: 'github-' + request.kind,
          stableLocators: [
            request.kind === 'issue'
              ? 'https://github.com/' + fullName + '/issues/' + request.number
              : 'https://github.com/' + fullName + '/pull/' + request.number,
          ],
          claimedVersion: updatedAt,
          publicationStatus: repo.private ? 'restricted' : 'published',
          lineageRefs: prior ? [prior.record.cid] : [],
          metadataBlob: {
            authorizationBasis: 'github-bearer-and-caller-scoped-grant',
            captureCoverage: coverage.complete
              ? 'complete-requested-scope'
              : 'partial-or-omitted',
            repositoryId,
            repositoryNodeId,
            repositoryNameAtCapture: fullName,
            issueId,
            issueNodeId,
            nativeId,
            nativeNodeId,
            issueNumber: request.number,
            sourceCreatedAt: createdAt,
            sourceUpdatedAt: updatedAt,
            snapshotHash,
            rawResponseHashes: rawResponses.map((response) => response.sha256),
          },
        },
        [sourceSystem.cid, ...(prior ? [prior.record.cid] : [])]
      );
  const manifestation = sameSource
    ? prior!.manifestation
    : createSourceManifestationTile(
        {
          sourceRecordCid: record.cid,
          manifestationId: sourceId + ':' + snapshotHash,
          manifestationKind: 'github-' + request.kind + '-rest-json',
          mediaType: 'application/vnd.github+json',
          byteHashes: { sha256: snapshotHash },
          accessRequirements: scopes,
          structureProfile:
            'github.' + request.kind + '.bounded-rest-snapshot.v1',
          fetchableUrl: API + (request.kind === 'issue' ? issuePath : prPath),
        },
        [record.cid, ...(prior ? [prior.manifestation.cid] : [])]
      );
  const collections = [
    comments.coverage,
    timeline.coverage,
    ...(pullRequest ? [reviews.coverage, reviewComments.coverage] : []),
  ];
  const sourcePackage = createSourcePackageTile(
    {
      packageId: 'github.native.capture:' + sourceId + ':' + snapshotHash,
      packageKind: 'record-scoped-native-rest-capture',
      lineageRole: 'record-scoped-package',
      sourceRecordCid: record.cid,
      members: [manifestation.cid],
      profileRefs: [sourceSystem.cid],
      boundedness: {
        incompleteSearch: false,
        isComplete: coverage.complete,
        itemCount: collections.reduce(
          (count, entry) => count + entry.itemCount,
          0
        ),
        maxItems: maxItems * collections.length,
        pagination: { mode: 'paginated' },
        signals: collections.map(
          (entry, index) =>
            ['comments', 'timeline', 'reviews', 'review-comments'][index] +
            ':' +
            (entry.included
              ? entry.complete
                ? 'complete'
                : 'partial'
              : 'omitted')
        ),
        truncated: collections.some(
          (entry) => entry.included && !entry.complete
        ),
      },
    },
    [record.cid, manifestation.cid]
  );
  const episode = createParseOnlySourceEpisode(record, manifestation, {
    chronology: {
      canonical: {
        createdAt: {
          date: createdAt.slice(0, 10),
          kind: 'createdAt',
          source: 'github-rest',
        },
        updatedAt: {
          date: updatedAt.slice(0, 10),
          kind: 'updatedAt',
          source: 'github-rest',
        },
      },
      primary: {
        date: capturedAt.slice(0, 10),
        kind: 'observedAt',
        source: 'github-rest',
      },
    },
    locator: API + (request.kind === 'issue' ? issuePath : prPath),
    rawEvidenceRefs: rawResponses.map(({ resource, sha256, url }) => ({
      evidenceId: 'raw.github.' + resource + '.' + sha256,
      evidenceKind: 'remote-fetch' as const,
      locator: url,
      sha256,
    })),
    rightsScope: scopes,
    sourcePackageCid: sourcePackage.cid,
  });
  const ingressJob = createIngressJob(record.cid, manifestation.cid, {
    sourcePackageCid: sourcePackage.cid,
  });
  const refined = refineTextArtifact(
    record,
    manifestation,
    snapshotJson,
    [grant.grantRef, 'github.bearer.verified-provider-response'],
    {
      sourcePackageCid: sourcePackage.cid,
      fetchedAt: capturedAt,
      evaluatedAt: capturedAt,
      fetchMethod: 'github-bearer-rest',
      requestedLocator: API + (request.kind === 'issue' ? issuePath : prPath),
      resolvedLocator: API + (request.kind === 'issue' ? issuePath : prPath),
    }
  );
  const minted = <T>(tile: TileEnvelope<T>) => ({
    ...tile,
    createdAt: mintTime,
  });
  return {
    authorizationBasis: 'github-bearer-and-caller-scoped-grant',
    kind: request.kind,
    readAuthorization: {
      grantRef: grant.grantRef,
      principalRef: grant.principalRef,
      rightsScopes: scopes,
      repositoryNodeId,
    },
    captureCoverage: coverage,
    rawResponses,
    canonicalSourceJson: snapshotJson,
    sourceSystem: minted(sourceSystem),
    record: sameSource ? record : minted(record),
    manifestation: sameSource ? manifestation : minted(manifestation),
    sourcePackage: minted(sourcePackage),
    episode: minted(episode),
    ingressJob: minted(ingressJob),
    canonicalArtifact: minted(refined.canonicalArtifact),
    fetchReceipt: minted(refined.fetchReceipt),
    normalizationReceipt: minted(refined.normalizationReceipt),
    evaluationReceipt: minted(refined.evaluationReceipt),
    trustMatrix: minted(refined.trustMatrix),
  };
}
