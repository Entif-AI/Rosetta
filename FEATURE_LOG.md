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
  heartbeat_at: "2026-10-05T22:35:12.490Z"
  expires_at: "2026-10-05T23:05:12.491Z"
  released_at: null
focus:
  summary: "Conformance regression red: immutable signed projection and registered schema references"
  acceptance_refs: "[]"
checkpoint:
  sha: "64274ac1a9af876bd935074f0a5d6de2d5fc690a"
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
Original red: missing conformance.mjs. Resume regression red: 5 pass / 2 fail; returned signed projection fails fresh integrity verification and rrp-receipt-v1 is unregistered. Node test log 2026-10-05T22-34-38-181Z-22489.log. Live rebased predecessor #1748 b9e17dcc passes hosted admission 37377290999; #1747 04166bf1 passes 37377290315. Neither is merged.

## Next Safe Step
Remove post-signing payload mutation, use the registered Receipt schema, strengthen observable approval/admission evidence, run the focused tests, and checkpoint the coherent green implementation. Then complete Nx conformance/report, affected checks, cold admission, hosted CI and review-only finalization.

## Handoff Notes
Work Stack 5bd7ac99-e188-4b52-a7a8-b5f19f45ba94 / AUTHZ-1749-CONFORMANCE executing. AUTHZ-RESUME-20261005 and AUTHZ-PERSIST-CP0012 committed. CP0012 exact-byte private Drive readback verified; CP0011 reverified. New private recovery journal cursor 3; remote lease acquisition 64274ac1. User authorized the completed #1750 merge. Remaining merges, promotion, release and issue closure remain reserved.


### Recovery 2026-10-05T22:32:39.890Z
Recovered stale lease from prior branch state. Prior lease metadata remains available in Git history.

## Resume reconciliation
PR #1750 was explicitly merged by the user at 55013bb; current origin/main is d23d6ad3217bfbb992782d07f2d0d6ca77392736. Existing remote stack was rebased; AuthZ code/tests remain identical. Predecessors #1751/#1753 are unmerged and review-ready. #1754 is the active implementation frontier. Preserve the old local history and dirty implementation outside the public candidate. New lease replaces the expired prior epoch; no force push or integration is required.
