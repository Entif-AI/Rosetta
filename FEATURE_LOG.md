---
schema: "entif.feature-log/v1"
issue:
  repository: "Entif-AI/Rosetta"
  number: 1749
  title: "Agent-native AuthZ conformance"
  url: "https://github.com/Entif-AI/Rosetta/issues/1749"
branch:
  name: "codex/1749-authz-conformance"
  base_ref: "codex/1748-authz-migration"
  base_sha: "b9e17dcc09ae9bb3f552144c725592c6ea3f0514"
initiator:
  type: "recovery"
  principal: "codex"
  run_id: "5bd7ac99-e188-4b52-a7a8-b5f19f45ba94"
lease:
  id: "b4c8633e-580a-49b0-b582-49d599dc4d52"
  holder: "codex"
  acquired_at: "2026-10-05T22:32:39.890Z"
  heartbeat_at: "2026-10-05T22:32:39.890Z"
  expires_at: "2026-10-05T23:02:39.891Z"
  released_at: null
focus:
  summary: "Resume #1749 from rebased stack; repair integrity proof and complete acceptance"
  acceptance_refs: "[]"
checkpoint:
  sha: "0e425c9f16aa30731f4183875969a7388c40c801"
  pushed_at: null
state:
  status: "active"
  blocked: false
---

# Feature Worklog

## Objective
Prove all 15 #1749 invariants across Guard/AXI-style, worker/A2A and durable write-admission fixture paths, consuming #1746/#1747/#1748 without changing their semantics.

## Acceptance Coverage
Red proof specifies 45 case/path combinations, current-state denial, provider/mutation/dispatch absence, real filesystem checkpoint-before-apply, receipt closure, optional approval, unsupported/unknown reporting.

## Decisions
WRAP_EXISTING_INTERFACE at Guard; no universal AuthZ AXI. Reuse exported Core, schema, Guard, migration, receipt and store APIs. tools/authz owns the bounded conformance fixture adapter; #994/#1674/#1684/#1047/#1295/#1296 remain production owners. The in-memory store alone is not durable-write proof; add fsync/readback in isolated temporary files. No private policy or real privileged credential.

## Validation
Expected red: missing conformance.mjs, Node test log 2026-10-05T17-13-43-387Z-23003.log. Predecessor #1748 local/hosted admission verified at dcdf23e; finalized remote head 6ba724e, lease released and archived.

## Next Safe Step
Implement versioned fixture matrix and tools/authz/conformance.mjs with real owner APIs and denied-effect state snapshots; then narrow tests and Nx-backed report.

## Handoff Notes
Work Stack 5bd7ac99-e188-4b52-a7a8-b5f19f45ba94 / AUTHZ-1749-CONFORMANCE executing. CP0011 private exact-byte readback verified. Private journal cursor 3. Lease remotely acquired at 0e425c9. No merge, promotion, release or issue closure authorized.


### Recovery 2026-10-05T22:32:39.890Z
Recovered stale lease from prior branch state. Prior lease metadata remains available in Git history.

## Resume reconciliation
PR #1750 was explicitly merged by the user at 55013bb; current origin/main is d23d6ad3217bfbb992782d07f2d0d6ca77392736. Existing remote stack was rebased; AuthZ code/tests remain identical. Predecessors #1751/#1753 are unmerged and review-ready. #1754 is the active implementation frontier. Preserve the old local history and dirty implementation outside the public candidate. New lease replaces the expired prior epoch; no force push or integration is required.
