import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const DISPOSITIONS = [
  'accepted',
  'pending_human',
  'blocked',
  'reference_only',
];
const CONTRACT_BLOCK = /```closeout-contract\s*\n([\s\S]*?)\n```/g;
const REFERENCE_GROUP =
  /\b(?:Refs?|Close(?:s|d)?|Fix(?:es|ed)?|Resolve(?:s|d)?)\s*:?\s+((?:(?:[\w.-]+\/[\w.-]+)?#\d+[\s,;]*)+)/gi;
const NATIVE_CLOSE_GROUP =
  /\b(?:Close(?:s|d)?|Fix(?:es|ed)?|Resolve(?:s|d)?)\s*:?\s+((?:(?:[\w.-]+\/[\w.-]+)?#\d+[\s,;]*)+)/gi;
const PACK_PATH =
  /^(?:packs\/|docs\/RFCs\/(?:ROCK-|Rosetta v3\.0\.0 Core Spine Specification\.md))/;
const HEX = /^[a-f0-9]{64}$/;

const isObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const validUrl = (value) =>
  typeof value === 'string' &&
  value.length < 1024 &&
  /^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(value);

export function referencedIssues(body = '') {
  const numbers = new Set();
  for (const match of body.matchAll(REFERENCE_GROUP)) {
    for (const issue of match[1].matchAll(/#(\d+)/g))
      numbers.add(Number(issue[1]));
  }
  return [...numbers].sort((a, b) => a - b);
}

function nativeClosingIssues(body = '') {
  const numbers = new Set();
  for (const match of body.matchAll(NATIVE_CLOSE_GROUP)) {
    for (const issue of match[1].matchAll(/#(\d+)/g))
      numbers.add(Number(issue[1]));
  }
  return numbers;
}

export function readContract(body = '') {
  const matches = [...body.matchAll(CONTRACT_BLOCK)];
  if (matches.length > 1)
    throw new Error('Exactly one closeout-contract block is permitted.');
  if (!matches.length) return null;
  if (matches[0][1].length > 65536)
    throw new Error('Closeout contract exceeds 64 KiB.');
  try {
    return JSON.parse(matches[0][1]);
  } catch {
    throw new Error('The closeout-contract block must contain valid JSON.');
  }
}

export function requiresSemanticGate(files = []) {
  return files.some((file) => PACK_PATH.test(file.filename ?? file.path ?? ''));
}

export function inspectCloseout({
  body = '',
  files = [],
  commitMessages = [],
  requireOnRefs = true,
} = {}) {
  const errors = [];
  if (
    [...body.matchAll(REFERENCE_GROUP)].some((match) =>
      /[\w.-]+\/[\w.-]+#\d+/.test(match[1])
    )
  ) {
    errors.push(
      'Qualified owner/repo#issue references are not supported by this repository-local contract; use unqualified #issue references and track cross-repository work separately.'
    );
  }
  if (commitMessages.some((message) => nativeClosingIssues(message).size)) {
    errors.push(
      'Commit messages must use non-closing issue references; native GitHub close/fix/resolve keywords bypass issue dispositions.'
    );
  }
  if (nativeClosingIssues(body).size) {
    errors.push(
      'PR bodies must use Refs instead of native GitHub closing keywords; automated reconciliation owns all issue closure transitions.'
    );
  }
  const refs = referencedIssues(body);
  let contract;
  try {
    contract = readContract(body);
  } catch (error) {
    errors.push(error.message);
  }
  if (!contract) {
    if (requireOnRefs && refs.length)
      errors.push(
        `Issue references [${refs.join(
          ', '
        )}] require a closeout-contract block.`
      );
    return {
      errors,
      refs,
      contract: null,
      semanticGateRequired: requiresSemanticGate(files),
    };
  }
  if (
    !isObject(contract) ||
    contract.version !== 1 ||
    !Array.isArray(contract.issues) ||
    !['general', 'core-engineering'].includes(contract.program)
  ) {
    errors.push(
      'Contract requires version: 1, program: general|core-engineering, and issues: [].'
    );
    return {
      errors,
      refs,
      contract,
      semanticGateRequired: requiresSemanticGate(files),
    };
  }
  if (contract.issues.length > 100)
    errors.push('At most 100 issue dispositions are permitted.');
  const seen = new Set();
  const semantic = requiresSemanticGate(files);
  for (const issue of contract.issues) {
    if (
      !isObject(issue) ||
      !Number.isSafeInteger(issue.number) ||
      issue.number < 1 ||
      !DISPOSITIONS.includes(issue.disposition)
    ) {
      errors.push(
        'Every issue requires a positive integer number and known disposition.'
      );
      continue;
    }
    if (seen.has(issue.number))
      errors.push(`Duplicate issue #${issue.number}.`);
    seen.add(issue.number);
    if (!refs.includes(issue.number))
      errors.push(
        `Issue #${issue.number} has no matching Refs/Closes/Fixes/Resolves reference in the PR body.`
      );
    if (
      issue.parent !== undefined &&
      (!Number.isSafeInteger(issue.parent) ||
        issue.parent < 1 ||
        issue.parent === issue.number)
    )
      errors.push(`Invalid parent for #${issue.number}.`);
    if (issue.disposition === 'accepted') {
      if (
        !Array.isArray(issue.evidence) ||
        !issue.evidence.length ||
        issue.evidence.some((url) => !validUrl(url))
      )
        errors.push(`Accepted #${issue.number} needs evidence URLs.`);
      if (issue.closureAuthority !== 'explicit-merge-closeout')
        errors.push(
          `Accepted #${issue.number} needs explicit-merge-closeout authority.`
        );
      if (
        contract.program === 'core-engineering' &&
        !validUrl(issue.authorityUrl)
      )
        errors.push(
          `Core-engineering accepted #${issue.number} requires its governing authority URL.`
        );
      if (
        issue.parent &&
        (typeof issue.synopsis !== 'string' ||
          issue.synopsis.trim().length < 16 ||
          issue.synopsis.length > 1200)
      )
        errors.push(
          `Accepted child #${issue.number} needs a bounded parent synopsis.`
        );
      if (semantic) {
        const gate = issue.semanticGate;
        if (
          !isObject(gate) ||
          !['accepted', 'implementation-only'].includes(gate.disposition) ||
          !validUrl(gate.authority) ||
          !validUrl(gate.conformance) ||
          !validUrl(gate.acceptance)
        ) {
          errors.push(
            `Core/Pack-related accepted #${issue.number} needs semanticGate with explicit disposition, authority, conformance, and acceptance URLs.`
          );
        }
        if (
          gate?.disposition === 'implementation-only' &&
          !contract.issues.some(
            (other) =>
              other?.number === gate.pendingAuthorityIssue &&
              other.number !== issue.number &&
              (other.disposition === 'pending_human' ||
                other.disposition === 'blocked')
          )
        ) {
          errors.push(
            `Core/Pack implementation-only #${issue.number} must retain a separate pending_human/blocked authority issue in this contract.`
          );
        }
      }
    } else if (issue.disposition !== 'reference_only') {
      if (
        typeof issue.reason !== 'string' ||
        issue.reason.trim().length < 12 ||
        issue.reason.length > 1200
      )
        errors.push(`Unresolved #${issue.number} needs a specific reason.`);
    }
  }
  for (const number of refs)
    if (!seen.has(number))
      errors.push(`Missing disposition for referenced issue #${number}.`);
  for (const file of files) {
    if (
      (file.filename ?? file.path) === 'FEATURE_LOG.md' &&
      file.status !== 'removed'
    ) {
      errors.push(
        'A PR adding/modifying FEATURE_LOG.md must archive and remove it from the merge candidate.'
      );
    }
  }
  if (
    contract.program === 'core-engineering' ||
    contract.worklog !== undefined
  ) {
    const log = contract.worklog;
    if (
      !isObject(log) ||
      log.status !== 'archived' ||
      !validUrl(log.archiveUrl) ||
      !HEX.test(log.sha256 ?? '')
    ) {
      errors.push(
        'Core-engineering work requires an exact archived worklog URL and SHA-256 before merge.'
      );
    }
  }
  return { errors, refs, contract, semanticGateRequired: semantic };
}

export const ADMISSION_CONTEXT = 'rosetta/contract-closeout';

// pull_request_target checks execute against the trusted default-branch SHA,
// not the PR candidate. Publish an explicit candidate-head commit status so
// branch protection can actually enforce this independent metadata gate.
export async function publishAdmission({
  owner,
  repo,
  pullNumber,
  api,
  runUrl,
}) {
  const request = { owner, repo, pull_number: pullNumber };
  const { data: pull } = await api.pulls.get(request);
  if (pull.state !== 'open' || !/^[a-f0-9]{40}$/i.test(pull.head?.sha ?? '')) {
    throw new Error('Admission requires an open PR with a concrete head SHA.');
  }
  const sha = pull.head.sha;
  const setStatus = (state, description) =>
    api.repos.createCommitStatus({
      owner,
      repo,
      sha,
      context: ADMISSION_CONTEXT,
      state,
      description: description.slice(0, 140),
      target_url: runUrl,
    });
  await setStatus(
    'pending',
    'Validating the current PR issue closeout contract.'
  );
  const files = await api.paginate(api.pulls.listFiles, {
    ...request,
    per_page: 100,
  });
  const commits = await api.paginate(api.pulls.listCommits, {
    ...request,
    per_page: 100,
  });
  const result = inspectCloseout({
    body: pull.body ?? '',
    files,
    commitMessages: commits.map((item) => item.commit?.message ?? ''),
  });
  // Metadata can change without a head commit. Never bless a stale PR body.
  const { data: latest } = await api.pulls.get(request);
  if (
    latest.head?.sha !== sha ||
    latest.body !== pull.body ||
    latest.state !== 'open'
  ) {
    result.errors.push(
      'PR head/body changed during validation; rerun admission on the new state.'
    );
  }
  await setStatus(
    result.errors.length ? 'failure' : 'success',
    result.errors.length
      ? `Closeout contract: ${result.errors.length} admission error(s).`
      : 'Issue dispositions admitted; no semantic approval implied.'
  );
  return result;
}

const marker = (kind, pr, issue, sha) =>
  `<!-- entif-closeout:v1 kind=${kind} pr=${pr} issue=${issue} merge=${sha} -->`;
const hasMarker = (comments, target) =>
  comments.some(
    (comment) =>
      comment.user?.login === 'github-actions[bot]' &&
      comment.user?.type === 'Bot' &&
      comment.body?.split('\n').some((line) => line.trim() === target)
  );

export function approvalMarker(pull, contract) {
  if (!/^[a-f0-9]{40}$/i.test(pull.head?.sha ?? ''))
    throw new Error('Closeout approval requires the exact PR head.');
  const digest = createHash('sha256')
    .update(JSON.stringify(contract))
    .digest('hex');
  return `<!-- entif-closeout-approval:v1 head=${pull.head.sha} contract=${digest} -->`;
}

export async function reconcileMerge({
  owner,
  repo,
  pull,
  files,
  commitMessages = [],
  api,
  defaultBranch = 'main',
}) {
  if (
    !pull.merged ||
    pull.base?.ref !== defaultBranch ||
    !/^[a-f0-9]{40}$/i.test(pull.merge_commit_sha ?? '')
  )
    throw new Error('Not a verified merged default-branch PR.');
  if (!pull.merged_by?.login || pull.merged_by.type !== 'User')
    throw new Error(
      'A human merger must be identified; bot/unknown merge needs separately verified delegated closeout authority.'
    );
  const audit = inspectCloseout({
    body: pull.body ?? '',
    files,
    commitMessages,
  });
  if (audit.errors.length)
    throw new Error(`Closeout contract invalid: ${audit.errors.join(' ')}`);
  if (!audit.contract)
    return {
      skipped: true,
      reason: 'No issue references or closeout contract.',
      outcomes: [],
    };
  // An arbitrary PR author can type closureAuthority into an untrusted PR
  // body. Only the authenticated human who actually merged this exact PR may
  // separately approve closing the exact contract at the exact feature head.
  if (
    audit.contract.issues.some(({ disposition }) => disposition === 'accepted')
  ) {
    const approval = approvalMarker(pull, audit.contract);
    const comments = await api.paginate(api.issues.listComments, {
      owner,
      repo,
      issue_number: pull.number,
      per_page: 100,
    });
    if (
      !comments.some(
        (comment) =>
          comment.user?.login === pull.merged_by.login &&
          comment.user?.type === 'User' &&
          comment.body?.includes(approval)
      )
    ) {
      throw new Error(
        `No authenticated merger approval for accepted issues at ${pull.head.sha}. ` +
          `The merger must post the exact approval marker on PR #${pull.number}; no issue states were changed.`
      );
    }
  }
  const outcomes = [];
  // Resolve the full issue/parent perimeter and every blocking disposition before writes.
  // Otherwise an invalid second issue could leave a first child prematurely closed.
  const resolved = [];
  for (const entry of audit.contract.issues) {
    const number = entry.number;
    const response = await api.issues.get({
      owner,
      repo,
      issue_number: number,
    });
    const issue = response.data;
    if (issue.pull_request)
      throw new Error(`#${number} is a PR, not an issue.`);
    if (entry.disposition === 'accepted' && issue.state === 'closed') {
      const prior = await api.paginate(api.issues.listComments, {
        owner,
        repo,
        issue_number: number,
        per_page: 100,
      });
      const receipt = marker(
        'accepted',
        pull.number,
        number,
        pull.merge_commit_sha
      );
      if (issue.state_reason !== 'completed' || !hasMarker(prior, receipt)) {
        throw new Error(
          `#${number} was previously closed without a matching trusted completion receipt; manual reconciliation required.`
        );
      }
    }
    if (entry.disposition === 'accepted') {
      const heldChildren = audit.contract.issues.filter(
        (child) => child.parent === number && child.disposition !== 'accepted'
      );
      if (heldChildren.length) {
        throw new Error(
          `#${number} has unresolved children in this contract: ${heldChildren
            .map((child) => `#${child.number}`)
            .join(', ')}.`
        );
      }
      // Native GitHub sub-issues are independent acceptance contracts. A
      // parent cannot close while any of its recorded sub-issues is open.
      const subIssues = await api.paginate(
        'GET /repos/{owner}/{repo}/issues/{issue_number}/sub_issues',
        { owner, repo, issue_number: number, per_page: 100 }
      );
      const openSubIssues = subIssues.filter(
        (child) => child.state !== 'closed'
      );
      if (openSubIssues.length) {
        throw new Error(
          `#${number} has open native sub-issues: ${openSubIssues
            .map((child) => `#${child.number}`)
            .join(', ')}.`
        );
      }
    }
    if (
      (entry.disposition === 'pending_human' ||
        entry.disposition === 'blocked') &&
      issue.state === 'closed'
    ) {
      throw new Error(
        `#${number} is closed despite disposition ${entry.disposition}; manual reconciliation needed.`
      );
    }
    if (entry.parent && entry.disposition === 'accepted') {
      const parent = (
        await api.issues.get({ owner, repo, issue_number: entry.parent })
      ).data;
      if (parent.pull_request)
        throw new Error(`Parent #${entry.parent} is a PR.`);
      const parentMentionsChild = new RegExp(
        `(?:#${number}\\b|/issues/${number}\\b)`
      ).test(parent.body ?? '');
      if (!parentMentionsChild)
        throw new Error(
          `Parent #${entry.parent} has no recorded link to child #${number}.`
        );
    }
    resolved.push({ entry, issue });
  }
  for (const { entry, issue } of resolved) {
    const number = entry.number;
    const url = `https://github.com/${owner}/${repo}/pull/${pull.number}`;
    const issueComments = async (target) =>
      api.paginate(api.issues.listComments, {
        owner,
        repo,
        issue_number: target,
        per_page: 100,
      });
    if (entry.disposition === 'accepted') {
      const tag = marker(
        'accepted',
        pull.number,
        number,
        pull.merge_commit_sha
      );
      if (!hasMarker(await issueComments(number), tag)) {
        await api.issues.createComment({
          owner,
          repo,
          issue_number: number,
          body: [
            tag,
            `Accepted implementation closeout for [PR #${pull.number}](${url}) at merge \`${pull.merge_commit_sha}\`.`,
            ...entry.evidence.map((item) => `- Evidence: ${item}`),
            audit.contract.worklog
              ? `- Exact worklog archive: ${audit.contract.worklog.archiveUrl} (SHA-256 \`${audit.contract.worklog.sha256}\`).`
              : '',
            entry.semanticGate
              ? `- Semantic authority: ${entry.semanticGate.authority}; conformance: ${entry.semanticGate.conformance}; acceptance: ${entry.semanticGate.acceptance} (${entry.semanticGate.disposition}).`
              : '',
            'This closes the declared implementation contract, not any undeclared release or Pack acceptance gate.',
          ]
            .filter(Boolean)
            .join('\n'),
        });
      }
      if (issue.state !== 'closed') {
        await api.issues.update({
          owner,
          repo,
          issue_number: number,
          state: 'closed',
          state_reason: 'completed',
        });
        const readback = await api.issues.get({
          owner,
          repo,
          issue_number: number,
        });
        if (readback.data.state !== 'closed')
          throw new Error(`Closeout readback failed for #${number}.`);
      }
      if (entry.parent) {
        const parentTag = marker(
          'child-synopsis',
          pull.number,
          number,
          pull.merge_commit_sha
        );
        if (!hasMarker(await issueComments(entry.parent), parentTag)) {
          await api.issues.createComment({
            owner,
            repo,
            issue_number: entry.parent,
            body: `${parentTag}\nCHILD_SYNOPSIS #${number}: ${entry.synopsis}\nAccepted PR: ${url}; merge \`${pull.merge_commit_sha}\`; child: https://github.com/${owner}/${repo}/issues/${number}.`,
          });
        }
      }
      outcomes.push({ issue: number, state: 'closed' });
    } else if (
      entry.disposition === 'pending_human' ||
      entry.disposition === 'blocked'
    ) {
      const tag = marker(
        entry.disposition,
        pull.number,
        number,
        pull.merge_commit_sha
      );
      if (!hasMarker(await issueComments(number), tag)) {
        await api.issues.createComment({
          owner,
          repo,
          issue_number: number,
          body: `${tag}\nAfter [merged PR #${pull.number}](${url}), this issue remains **${entry.disposition}**: ${entry.reason}\nThe merge does not grant completion or publication approval.`,
        });
      }
      outcomes.push({ issue: number, state: 'open', reason: entry.reason });
    } else
      outcomes.push({
        issue: number,
        state: issue.state,
        note: 'reference_only',
      });
  }
  return {
    skipped: false,
    outcomes,
    fingerprint: createHash('sha256')
      .update(
        JSON.stringify({
          pull: pull.number,
          merge: pull.merge_commit_sha,
          issues: audit.contract.issues,
        })
      )
      .digest('hex'),
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.stderr.write(
    'Import inspectCloseout/reconcileMerge from a trusted GitHub Actions caller; no standalone write CLI.\n'
  );
  process.exitCode = 2;
}
