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
  heartbeat_at: "2026-10-05T22:43:57.630Z"
  expires_at: "2026-10-05T23:13:57.631Z"
  released_at: null
focus:
  summary: "Conformance evidence closure, immutable worker signing and consumer documentation complete"
  acceptance_refs: "[]"
checkpoint:
  sha: "2e239ff7126f5b75a0f1130d5dd3fb7e2f4847a6"
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
Original red: missing conformance.mjs. Resume regression red: 5 pass / 2 fail; returned signed projection fails fresh integrity verification and rrp-receipt-v1 is unregistered. Red committed at aa2cc14b. Green: all 8 focused Node tests pass, including the 45 case/path matrix and fresh integrity/signature/registry checks. Signed payload mutation removed; worker source resolution now precedes signing, signed/evaluated projections match, and all 45 combinations independently verify complete artifact/Receipt closure. Unrecognized consumer results count as unknown rather than pass. Canonical rosetta.receipt output reference used. Nx sync passes with no generated drift. Live rebased predecessor #1748 b9e17dcc passes hosted admission 37377290999; #1747 04166bf1 passes 37377290315. Neither is merged.

## Next Safe Step
Evidence review and consumer documentation are complete. Persist pre-QA freeze, then run Nx conformance/report, inspect JSON, affected checks, cold admission and hosted CI. Finalize for review only; do not merge or close issues.

## Handoff Notes
Work Stack 5bd7ac99-e188-4b52-a7a8-b5f19f45ba94 / AUTHZ-1749-CONFORMANCE executing. AUTHZ-RESUME-20261005 and AUTHZ-PERSIST-CP0012 committed. CP0013 exact-byte private Drive readback verified; CP0011 and CP0012 verified. New private recovery journal cursor 4; remote lease acquisition 64274ac1. User authorized the completed #1750 merge. Remaining merges, promotion, release and issue closure remain reserved.


### Recovery 2026-10-05T22:32:39.890Z
Recovered stale lease from prior branch state. Prior lease metadata remains available in Git history.

## Resume reconciliation
PR #1750 was explicitly merged by the user at 55013bb; current origin/main is d23d6ad3217bfbb992782d07f2d0d6ca77392736. Existing remote stack was rebased; AuthZ code/tests remain identical. Predecessors #1751/#1753 are unmerged and review-ready. #1754 is the active implementation frontier. Preserve the old local history and dirty implementation outside the public candidate. New lease replaces the expired prior epoch; no force push or integration is required.
