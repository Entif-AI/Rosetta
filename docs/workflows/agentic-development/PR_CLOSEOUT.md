# Contract-aware PR closeout

**Scope:** This is public Rosetta repository **GitHub issue lifecycle policy**, not a new
Core semantic kind, universal Rosetta protocol, or automatic Pack acceptance rule.
The original issue body remains the historical work contract. Apply the narrower
accepted Core, ROCK document, Pack, Profile, Product, Design, and human release
authorities to their own domains.

## Boundaries

1. A PR merge is an observed integration event, not proof of issue acceptance,
   Core semantic correctness, Pack conformance, human accessibility approval,
   production deployment, or publication authorization.
2. The Rosetta Core Engineering Loop v0.1 governs **its own central engineering
   program**: single mutable writer, accepted specifications before dependent
   implementation, review-only PRs, and maintainer-controlled merging. Those
   restrictions are not imposed universally on unrelated Entif work.
3. ROCK-3001, ROCK-3003, ROCK-3005, and their companions are **normative
   documents identified by ROCK DocIDs**. StdPacks/VocabPacks and other
   manifest-based Packs are distinct artifacts. Their accepted authorities,
   descent requirements, profiles and tests may not be substituted for one another.
4. When a PR changes a Pack or Core normative document, the closeout contract
   must identify its accepted authority, bounded conformance evidence, and
   recorded acceptance decision. `implementation-only` leaves semantic
   acceptance separate and requires a linked pending authority issue. Existing
   `rosetta-governance:merge-admission` already owns deterministic Pack
   manifest validation and core-descent evidence through
   `tools/semantic-governance/governance.config.json`. Reuse that proof,
   not a second Pack validator. Mere schema validity, a green Nx run, or a
   passing demo is not a promotion receipt.
5. For new feature work, the working checkpoint belongs in an originating
   GitHub issue comment, scoped to branch, execution epoch and exact pushed
   SHA. No agent may add or modify a tracked root `FEATURE_LOG.md`. This
   repository gate rejects changed root logs **even when the PR has no issue
   references**; an unrelated already-existing root log is not automatically
   stale. Branch ownership and human release signoff remain separate.
6. Do not merge or close on behalf of the maintainer without that operation's
   authority. A PR's explicit `closureAuthority` disposition reviewed during
   human integration is a scope-specific **proposal**, not a permission grant.
   To automate issue closure, the actual human merger must additionally post
   an authenticated, exact-head and exact-contract approval comment on the PR.
   Bot/unknown merges are held for separate authorized reconciliation.

## PR issue disposition contract

Every PR description that uses `Refs #...`, `Closes #...`, `Fixes #...`
or `Resolves #...` must carry one machine-readable Markdown fenced block,
matching **every** referenced issue. PRs without those issue references need
no contract. This is a repository workflow rule, not a universal Rosetta
data shape. The version-1 validator supports these dispositions:

- `accepted`: bounded implementation issue delivered, accepted as specified,
  independently evidenced and explicitly approved for issue closure.
- `pending_human`: merged implementation but outstanding human/design,
  accessibility, Pack acceptance, or publication review. Remains open.
- `blocked`: unmet dependency or authority. Remains open.
- `reference_only`: informational relationship; no lifecycle mutation.

Use **Refs for all issue relationships**, including `accepted`. Do not use
GitHub's native auto-closing keywords for any disposition. GitHub may close an
issue before the reconciler checks its specific authorization and receipts.
The checker recognizes `close/closes/closed`, `fix/fixes/fixed`, and
`resolve/resolves/resolved`, with optional colons, and refuses native closing
keywords in PR commit messages. GitHub's manually chosen squash/merge commit
message is a separate merge-time risk; the maintainer must preserve the same
non-closing disposition there.

Example: an accepted child with a human-gated parent:

```closeout-contract
{
  "version": 1,
  "program": "general",
  "issues": [
    {
      "number": 1802,
      "disposition": "accepted",
      "closureAuthority": "explicit-merge-closeout",
      "evidence": ["https://github.com/Entif-AI/Rosetta/actions/runs/EXAMPLE"],
      "parent": 1801,
      "synopsis": "The accepted content model and source screening are complete."
    },
    {
      "number": 1801,
      "disposition": "pending_human",
      "reason": "Complete real desktop/mobile assistive-technology and zoom review before approving publication."
    }
  ]
}
```

The URLs above illustrate structure, **not evidence for a real PR**. For work
in the central Rosetta Core Engineering Loop set `"program": "core-engineering"`
and give every accepted issue an `authorityUrl` for its governing accepted
contract, then add a **v2 issue-backed final checkpoint** bound to the exact
candidate head:

```json
"checkpoint": {
  "status": "issue-backed",
  "commentUrl": "https://github.com/Entif-AI/Rosetta/issues/EXAMPLE#issuecomment-EXAMPLE",
  "sha256": "<64 actual lowercase hex digits>",
  "head": "<exact 40-character feature HEAD>"
}
```

The following historical v1 form remains accepted **only as a migration
fallback** for branches finalized under the old worklog contract:

```json
"worklog": {
  "status": "archived",
  "archiveUrl": "https://github.com/Entif-AI/Rosetta/issues/EXAMPLE#issuecomment-EXAMPLE",
  "sha256": "<64 actual lowercase hex digits>"
}
```

The two forms are mutually exclusive. The structural checker validates the
receipt and candidate head, not the authenticity of arbitrary linked content.
Human approval and the protected v2 Skill/BIOS adoption remain separate gates.

An `accepted` disposition in a change touching `packs/` or normative Core
documents also requires:

```json
"semanticGate": {
  "disposition": "implementation-only",
  "authority": "https://github.com/Entif-AI/Rosetta/...accepted-spec...",
  "conformance": "https://github.com/Entif-AI/Rosetta/...bounded-test-receipt...",
  "acceptance": "https://github.com/Entif-AI/Rosetta/...implementation-review...",
  "pendingAuthorityIssue": 1234
}
```

Use `"disposition": "accepted"` in `semanticGate` **only** with an actual
semantic/Pack acceptance decision; do not let an implementation-only merge
silently promote an in-development specification. The URLs are evidence
references for reviewer judgment, not mechanically authenticated semantic
truth.

## Enforcement and limits

### Explicit merger approval for accepted issue closure

Before merging a PR with any `accepted` issues, the _intended merger_ must
post an authenticated PR comment containing exactly the marker printed by:

````sh
gh pr view <PR-NUMBER> --repo Entif-AI/Rosetta --json body,headRefOid > /tmp/pr-closeout.json
node --input-type=module -e '
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const pr = JSON.parse(readFileSync("/tmp/pr-closeout.json", "utf8"));
const blocks = [...pr.body.matchAll(/```closeout-contract\s*\n([\s\S]*?)\n```/g)];
if (blocks.length !== 1) throw Error("Exactly one closeout contract required");
const contract = JSON.parse(blocks[0][1]);
const digest = createHash("sha256").update(JSON.stringify(contract)).digest("hex");
console.log(`<!-- entif-closeout-approval:v1 head=${pr.headRefOid} contract=${digest} -->`);
'
````

Review the issue disposition list, relevant acceptance evidence, unresolved
parent/Pack requirements and the exact commit before posting this comment.
The marker alone is **not** authorization to merge. The post-merge worker
independently checks its author against GitHub's recorded merger identity.
Without this comment, no `accepted` issue is automatically closed. A status
check passing does not substitute for this authorization.

- [`tools/github/contract-closeout.mjs`](../../../tools/github/contract-closeout.mjs)
  validates the finite issue-to-disposition crosswalk and implements an
  idempotent, bounded post-merge reconciler.
- [`.github/workflows/pr-closeout.yml`](../../../.github/workflows/pr-closeout.yml)
  uses `pull_request_target` but checks out and runs **only trusted default
  branch event-SHA code**, never the PR head. Its admission job can publish only a commit status to the
  **actual PR head**; its post-merge job gets narrowly scoped issue write
  access. The admission check's default-branch job SHA is not the PR head.
  Admission is serialized per PR; issue mutation is serialized per repository
  with GitHub Actions `queue: max` to avoid losing pending closeout jobs.
- An actual default-branch merge with an admitted contract can add a
  deterministic completion receipt, close accepted issues and add one
  `CHILD_SYNOPSIS` only to each immediate parent. Replays suppress duplicate
  comments and re-read issue state. Outstanding human/blocked issues get
  a deduplicated explanation and remain open.
- A missing or conflicting contract **fails** the workflow. It never guesses
  that `Refs` means completion. GitHub-reported merge metadata and the event
  payload must be verified, and no PR-head code is executed with write tokens.
  Same-repository `#number` references are supported; qualified `owner/repo#number`
  closers are rejected rather than silently misclassified. Existing native
  sub-issues and closed-without-receipt state block automatic parent closeout.
- Enable **required commit status** `rosetta/contract-closeout`, supplied by
  GitHub Actions, in repository branch protection before claiming the pre-merge
  gate is mandatory. **Do not require the `contract-admission` job**: its
  `pull_request_target` workflow runs on the default branch SHA rather than
  the candidate. A YAML file alone is not a protected merge gate.
- GitHub's default `pull_request_target` restriction for public repositories
  is scheduled for enforcement on **November 2, 2026**. The maintainer must
  inspect the repository/organization Actions event policy and explicitly
  permit this carefully scoped event if the default restriction would block
  it. Do not assume a successful run today means future activation is safe.
- The validator proves structural obligations and idempotent operations.
  It cannot independently authenticate a human's interpretation of Pack
  semantics, prove every evidence URL's claims, or certify WCAG/release readiness.

## Recovery and legacy merges

If issue status lags a previously merged PR, recover its source issue
contracts, test evidence, archived worklog, merge SHA and required approvals.
Write source-preserving issue closeout comments, close only accepted children,
propagate one-hop synopses, and leave genuinely unresolved parent gates open.
Never edit an old merged PR body merely to manufacture a passing new contract.
The historical case is [PR #1808](https://github.com/Entif-AI/Rosetta/pull/1808):
seven implementation issues closed with receipts, parent #1801 retained for
human accessibility/publication checks, and the original feature log archived.
