import test from 'node:test';
import assert from 'node:assert/strict';
import {
  inspectCloseout,
  readContract,
  reconcileMerge,
  referencedIssues,
  requiresSemanticGate,
} from './contract-closeout.mjs';

const sha = 'b'.repeat(40);
const evidence = 'https://github.com/Entif-AI/Rosetta/actions/runs/1234';
const accepted = (number = 1802) => ({
  number,
  disposition: 'accepted',
  closureAuthority: 'explicit-merge-closeout',
  evidence: [evidence],
  parent: 1801,
  synopsis: 'Verified complete implementation, with reusable child evidence.',
});
const pending = {
  number: 1801,
  disposition: 'pending_human',
  reason: 'Human VoiceOver and browser-zoom review remain unevaluated.',
};
const body = (contract, refs = 'Refs #1802, #1801.') =>
  `${refs}\n\n\`\`\`closeout-contract\n${JSON.stringify(contract)}\n\`\`\``;
const contract = (issues = [accepted(), pending]) => ({
  version: 1,
  program: 'general',
  issues,
});
const pull = {
  number: 1808,
  merged: true,
  merged_by: { type: 'User', login: 'Entif-AI' },
  merge_commit_sha: sha,
  base: { ref: 'main' },
  body: body(contract()),
};

function mockApi() {
  const entries = new Map([
    [
      1801,
      {
        number: 1801,
        state: 'open',
        body: 'Parent owns #1802 implementation.',
      },
    ],
    [1802, { number: 1802, state: 'open' }],
  ]);
  const comments = new Map([
    [1801, []],
    [1802, []],
  ]);
  const counts = { close: 0, comments: 0 };
  return {
    counts,
    entries,
    comments,
    issues: {
      get: async ({ issue_number }) => {
        if (!entries.has(issue_number)) throw new Error('Unknown issue.');
        return { data: { ...entries.get(issue_number) } };
      },
      listComments: async () => {
        throw new Error('Use paginate.');
      },
      createComment: async ({ issue_number, body }) => {
        comments.get(issue_number).push({ body });
        counts.comments++;
        return { data: { body } };
      },
      update: async ({ issue_number, state }) => {
        counts.close++;
        entries.get(issue_number).state = state;
        return { data: entries.get(issue_number) };
      },
    },
    paginate: async (_fn, { issue_number }) => comments.get(issue_number),
  };
}

test('multiple issue references and exactly one typed contract', () => {
  assert.deepEqual(
    referencedIssues('Refs #1802, #1801; #1807. Fixes #1657.'),
    [1657, 1801, 1802, 1807]
  );
  assert.equal(readContract(body(contract())).version, 1);
  assert.deepEqual(inspectCloseout({ body: body(contract()) }).errors, []);
});

test('fails on unclassified issues, missing contract, duplicate issue and unsupported disposition', () => {
  assert.match(
    inspectCloseout({ body: 'Refs #1802' }).errors.join(' '),
    /require a closeout-contract/
  );
  assert.match(
    inspectCloseout({ body: body(contract([accepted()])) }).errors.join(' '),
    /Missing disposition/
  );
  assert.match(
    inspectCloseout({
      body: body(contract([accepted(), accepted(), pending])),
    }).errors.join(' '),
    /Duplicate issue/
  );
  assert.match(
    inspectCloseout({
      body: body(contract([{ number: 1802, disposition: 'done' }, pending])),
    }).errors.join(' '),
    /known disposition/
  );
});

test('requires explicit closeout authority, evidence and concise human-gate reason', () => {
  const missing = accepted();
  delete missing.closureAuthority;
  delete missing.evidence;
  const unresolved = { ...pending, reason: 'TODO' };
  const errors = inspectCloseout({
    body: body(contract([missing, unresolved])),
  }).errors.join(' ');
  assert.match(errors, /evidence URLs/);
  assert.match(errors, /explicit-merge-closeout/);
  assert.match(errors, /specific reason/);
});

test('information-only references do not authorize closure', () => {
  const only = { number: 1802, disposition: 'reference_only' };
  assert.deepEqual(
    inspectCloseout({ body: body(contract([only]), 'Refs #1802') }).errors,
    []
  );
  assert.match(
    inspectCloseout({
      body: body(contract([only]), 'Closes #1802'),
    }).errors.join(' '),
    /native GitHub closing keyword/
  );
  assert.match(
    inspectCloseout({
      body: body(contract(), 'Closes #1802, #1801'),
    }).errors.join(' '),
    /native GitHub closing keyword/
  );
});

test('requires distinct Core/Pack authority, conformance and acceptance evidence when those files change', () => {
  assert.equal(
    requiresSemanticGate([{ filename: 'packs/rrp/pack.json' }]),
    true
  );
  assert.equal(
    requiresSemanticGate([{ filename: 'apps/entif-site/src/index.astro' }]),
    false
  );
  const files = [{ filename: 'packs/rrp/pack.json', status: 'modified' }];
  assert.match(
    inspectCloseout({ body: body(contract()), files }).errors.join(' '),
    /semanticGate/
  );
  const withGate = accepted();
  withGate.semanticGate = {
    disposition: 'implementation-only',
    authority: evidence,
    conformance: evidence,
    acceptance: evidence,
    pendingAuthorityIssue: 1801,
  };
  assert.deepEqual(
    inspectCloseout({ body: body(contract([withGate, pending])), files })
      .errors,
    []
  );
  const withoutHold = {
    ...withGate,
    semanticGate: { ...withGate.semanticGate, pendingAuthorityIssue: 9999 },
  };
  assert.match(
    inspectCloseout({
      body: body(contract([withoutHold, pending])),
      files,
    }).errors.join(' '),
    /separate pending_human/
  );
});

test('rejects modified worklog and requires Core program archival without blocking an unrelated historic root log', () => {
  const standard = body(contract());
  assert.deepEqual(
    inspectCloseout({
      body: standard,
      files: [{ filename: 'src/x.js', status: 'modified' }],
    }).errors,
    []
  );
  assert.match(
    inspectCloseout({
      body: standard,
      files: [{ filename: 'FEATURE_LOG.md', status: 'added' }],
    }).errors.join(' '),
    /archive and remove/
  );
  assert.deepEqual(
    inspectCloseout({
      body: standard,
      files: [{ filename: 'FEATURE_LOG.md', status: 'removed' }],
    }).errors,
    []
  );
  const core = { ...contract(), program: 'core-engineering' };
  assert.match(
    inspectCloseout({ body: body(core) }).errors.join(' '),
    /exact archived worklog/
  );
  core.worklog = {
    status: 'archived',
    archiveUrl: evidence,
    sha256: '0'.repeat(64),
  };
  assert.match(
    inspectCloseout({ body: body(core) }).errors.join(' '),
    /governing authority URL/
  );
  core.issues[0].authorityUrl = evidence;
  assert.deepEqual(inspectCloseout({ body: body(core) }).errors, []);
});

test('post-merge first run closes child, retains human gate, and appends one-hop synopsis; retries are idempotent', async () => {
  const api = mockApi();
  const input = { owner: 'Entif-AI', repo: 'Rosetta', pull, files: [], api };
  const first = await reconcileMerge(input);
  assert.deepEqual(
    first.outcomes.map((x) => [x.issue, x.state]),
    [
      [1802, 'closed'],
      [1801, 'open'],
    ]
  );
  assert.equal(api.entries.get(1802).state, 'closed');
  assert.equal(api.entries.get(1801).state, 'open');
  assert.equal(api.counts.close, 1);
  assert.equal(api.counts.comments, 3);
  assert.match(api.comments.get(1801)[0].body, /CHILD_SYNOPSIS #1802/);
  await reconcileMerge(input);
  assert.equal(api.counts.close, 1);
  assert.equal(api.counts.comments, 3);
});

test('refuses unchecked default-branch, unmerged, bot, and malformed merge identities', async () => {
  const api = mockApi();
  const run = (changes) =>
    reconcileMerge({
      owner: 'Entif-AI',
      repo: 'Rosetta',
      files: [],
      api,
      pull: { ...pull, ...changes },
    });
  await assert.rejects(run({ merged: false }), /verified merged/);
  await assert.rejects(run({ base: { ref: 'staging' } }), /verified merged/);
  await assert.rejects(run({ merge_commit_sha: 'garbage' }), /verified merged/);
  await assert.rejects(
    run({ merged_by: { type: 'Bot', login: 'automation-bot' } }),
    /bot\/unknown merge/
  );
  assert.equal(api.counts.close, 0);
});

test('post-merge rejects a missing contract and never infers success from GitHub Refs', async () => {
  const api = mockApi();
  await assert.rejects(
    reconcileMerge({
      owner: 'Entif-AI',
      repo: 'Rosetta',
      pull: { ...pull, body: 'Refs #1802' },
      files: [],
      api,
    }),
    /require a closeout-contract/
  );
  assert.equal(api.counts.close, 0);
});

test('fails closed when an issue marked pending human is already closed', async () => {
  const api = mockApi();
  api.entries.get(1801).state = 'closed';
  await assert.rejects(
    reconcileMerge({
      owner: 'Entif-AI',
      repo: 'Rosetta',
      pull,
      files: [],
      api,
    }),
    /manual reconciliation needed/
  );
  assert.equal(api.entries.get(1801).state, 'closed');
  assert.equal(api.entries.get(1802).state, 'open');
  assert.equal(api.counts.comments, 0);
});

test('refuses a fabricated parent link before closing any issue', async () => {
  const api = mockApi();
  api.entries.get(1801).body = 'Unrelated parent with no child ownership.';
  await assert.rejects(
    reconcileMerge({
      owner: 'Entif-AI',
      repo: 'Rosetta',
      pull,
      files: [],
      api,
    }),
    /no recorded link to child/
  );
  assert.equal(api.entries.get(1802).state, 'open');
  assert.equal(api.counts.close, 0);
  assert.equal(api.counts.comments, 0);
});
