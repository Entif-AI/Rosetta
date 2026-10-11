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
5. Worklog archive, branch ownership, runtime-cleanliness and release signoff
   still follow their governing workflows. This GitHub mechanism checks the
   **declared** archive link/digest, not the historical exact bytes themselves.
   A changed root `FEATURE_LOG.md` must not survive the PR's candidate diff;
   a different already-existing root log is **not** automatically stale.
6. Do not merge or close on behalf of the maintainer without that operation's
   authority. A PR's explicit `closureAuthority` disposition reviewed during
   human integration is a scope-specific declaration, not generic merge power.
   Bot merges require separately verified delegated closeout authority.

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

Use **Refs**, not GitHub's native auto-closing keywords, for
`pending_human`, `blocked`, and `reference_only` issues.
GitHub's native closing parser does not understand a deferred parent gate.

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
contract, then add:

```json
"worklog": {
  "status": "archived",
  "archiveUrl": "https://github.com/Entif-AI/Rosetta/issues/EXAMPLE#issuecomment-EXAMPLE",
  "sha256": "<64 actual lowercase hex digits>"
}
```

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

- [`tools/github/contract-closeout.mjs`](../../../tools/github/contract-closeout.mjs)
  validates the finite issue-to-disposition crosswalk and implements an
  idempotent, bounded post-merge reconciler.
- [`.github/workflows/pr-closeout.yml`](../../../.github/workflows/pr-closeout.yml)
  uses `pull_request_target` but checks out and runs **only trusted default
  branch code**. Its admission job has read-only permissions; its post-merge
  job gets narrowly scoped issue write access.
- An actual default-branch merge with an admitted contract can add a
  deterministic completion receipt, close accepted issues and add one
  `CHILD_SYNOPSIS` only to each immediate parent. Replays suppress duplicate
  comments and re-read issue state. Outstanding human/blocked issues get
  a deduplicated explanation and remain open.
- A missing or conflicting contract **fails** the workflow. It never guesses
  that `Refs` means completion. GitHub-reported merge metadata and the event
  payload must be verified, and no PR-head code is executed with write tokens.
- Enable **required status check** `contract-admission` in repository branch
  protection before claiming the pre-merge gate is mandatory. A YAML file alone
  is not a protected merge gate; maintainers must deliberately configure rules.
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
