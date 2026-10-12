---
description: Reconcile feature tasks with durable GitHub work identity
---
Read the existing tasks and governing work artifacts. Author a request using the
packaged issue-sync.schema.json. Keep stable T IDs and a feature namespace through
title/prose edits. Explicit existing issue refs win; preserve convergence finding IDs.
Do not match work by fuzzy semantic similarity. Splits/merges require original task IDs
and an explicit reconciliation decision/ref. Task/issue existence grants no semantic
authority. Removed/deferred projections do not close human-owned issues.

Run `pnpm exec nx run <projectName>:issue-sync --request=<request.json>` to preview.
Only explicit authorization to synchronize/create the proposed public issues permits
`--apply`. The coordinator executor requires the request repository to match GitHub
origin and preserves `<git-common-dir>/entif-issue-bindings/<repository-digest>/<featureId>.json` with an exclusive lock
and durable write-ahead send state. Never delete that ledger or bypass its pending state.

Closed owners, conflicting mappings and ambiguous delivery require disposition. Exact
marker recovery may bind a known send; zero search results do not prove non-delivery.
Only a human-confirmed non-delivery decision with a fresh durable reference permits
one retry (`retryRef`) separately from the split/merge decision; that decision is consumed by the next pending send.
Never blindly retry issue creation, silently replace an existing owner, or close an issue
because a task disappeared. A stale lock requires verifying its owner has stopped before
removal; no automatic takeover is performed.

Issue synchronization is owned by one coordinator across clones/machines. Git-common
ledger/locks serialize worktrees of that clone; GitHub offers no atomic marker uniqueness
across independent clones. Preserve/back up that ledger when transferring the coordinator.
A worktree-local legacy ledger requires explicit reconciliation, never silent import.
Marker recovery requires recorded pending-send evidence; reserved marker content is rejected.
Merge participants share one decision ref and declare original T IDs; split dependencies
are validated before any send. Decision refs must be non-whitespace durable human records.
