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
  heartbeat_at: "2026-10-05T23:09:21.098Z"
  expires_at: "2026-10-05T23:39:21.099Z"
  released_at: null
focus:
  summary: "Conformance acceptance verified; prepare review-only finalization"
  acceptance_refs: "[]"
checkpoint:
  sha: "833db8e8ac8ad255077faf323217a6cebf057436"
  pushed_at: null
state:
  status: "active"
  blocked: false
---

# Feature Worklog

## Objective
Prove all 15 #1749 invariants across Guard/AXI-style, worker/A2A and durable write-admission fixture paths, consuming #1746/#1747/#1748 without changing their semantics.

## Acceptance Coverage
Committed red proof specifies 45 case/path combinations, current-state denial, provider/mutation/dispatch absence, filesystem checkpoint-before-apply, receipt closure, optional approval and unsupported/unknown reporting. Resume review adds fresh verification of returned signed projections and registry resolution of capability schema refs.

## Decisions
WRAP_EXISTING_INTERFACE at Guard; no universal AuthZ AXI. Reuse exported Core, schema, Guard, migration, receipt and store APIs. tools/authz owns the bounded conformance fixture adapter; #994/#1674/#1684/#1047/#1295/#1296 remain production owners. The in-memory store alone is not durable-write proof; add fsync/readback in isolated temporary files. No private policy or real privileged credential.

## Validation
Eight focused tests and the 45 case/path matrix pass. Independent inspection of the actual bb938da report verified 81 attempts, 51 effect-free denials, 30 executions, 823 intact artifacts and 81 closed Receipts. Nx report passes (7/9 cached prerequisite tasks). Hosted admission 37384334970 and cold local admission were red solely on inferred authz-conformance lint: Node globals were undeclared. Fixed using existing explicit Node import conventions, including the preexisting schema exporter; no schema bytes or semantics changed. Focused lint and all eight tests pass after repair. Cold/hosted acceptance must be rerun. Prior failures and full evidence preserved privately.

## Next Safe Step
Push the coherent lint repair, persist updated checkpoint, rerun cold merge-admission and inspect all recorded checks, verify hosted CI at the repaired candidate, then release/archive and finalize for review only.

## Handoff Notes
Work Stack 5bd7ac99-e188-4b52-a7a8-b5f19f45ba94 / AUTHZ-1749-CONFORMANCE executing. AUTHZ-RESUME-20261005 and AUTHZ-PERSIST-CP0012 committed. CP0016 exact-byte private Drive readback verified, including pre-QA freeze; all earlier checkpoints verified. New private recovery journal cursor 5; remote lease acquisition 64274ac1. User authorized the completed #1750 merge. Remaining merges, promotion, release and issue closure remain reserved.


### Recovery 2026-10-05T22:32:39.890Z
Recovered stale lease from prior branch state. Prior lease metadata remains available in Git history.

## Resume reconciliation
PR #1750 was explicitly merged by the user at 55013bb; current origin/main is d23d6ad3217bfbb992782d07f2d0d6ca77392736. Existing remote stack was rebased; AuthZ code/tests remain identical. Predecessors #1751/#1753 are unmerged and review-ready. #1754 is the active implementation frontier. Preserve the old local history and dirty implementation outside the public candidate. New lease replaces the expired prior epoch; no force push or integration is required.
