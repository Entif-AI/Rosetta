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
  heartbeat_at: "2026-10-05T23:10:19.016Z"
  expires_at: "2026-10-05T23:40:19.016Z"
  released_at: null
focus:
  summary: "Conformance acceptance green; finalization pending"
  acceptance_refs: "[]"
checkpoint:
  sha: "7c8edabc12f6203bfd10c04cb5b5888663d9fe7e"
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
Acceptance verified at 833db8e8ac8ad255077faf323217a6cebf057436. Eight conformance tests and all 45 case/path combinations pass. Independent inspection of the generated JSON verifies 81 attempts, 51 effect-free denials, 30 executions, 823 intact artifacts, 81 closed Receipts, three signed-invalid-authority denials and ten persisted checkpoint artifacts. Nx report passes; cold merge-admission records all 13 checks pass, merge-admissible disposition and zero actionable convergence findings. Its implementation check passes lint/typecheck/test/build for 16 projects and 14 dependency tasks, including 205 schema and 59 Guard tests. Hosted Semantic governance 37385403068 passes at the same candidate, including frozen install, package E2E, release plan, sync, affected tests and full admission. Earlier lint failures and regression red proofs remain preserved. Production consumer conformance is outside this fixture proof.

## Next Safe Step
Update the canonical PR/delta evidence, release and archive this epoch, delete FEATURE_LOG from the candidate, verify finalization against the live archive and candidate tree, then obtain exact final-candidate hosted CI. Leave all remaining PRs review-ready for human integration.

## Handoff Notes
Work Stack 5bd7ac99-e188-4b52-a7a8-b5f19f45ba94 / AUTHZ-1749-CONFORMANCE executing pending pre-merge finalization. CP0018 is the highest exact-byte verified private Drive checkpoint; startup and prior persistence operations are not replayed. Private recovery journal 1749-resume-20261005.jsonl materialized through cursor 6. The user authorized the completed #1750 merge. PR #1751 targets main; #1753 and #1754 remain stacked. No remaining merge, promotion, release or issue closure is authorized. Public issue contracts and consumer ownership are unchanged; no authority-map change is required.

### Recovery 2026-10-05T22:32:39.890Z
Recovered stale lease from prior branch state. Prior lease metadata remains available in Git history.

## Resume reconciliation
PR #1750 was explicitly merged by the user at 55013bb; current origin/main was d23d6ad3217bfbb992782d07f2d0d6ca77392736. Existing remote stack was rebased; AuthZ code/tests remain identical. Predecessors #1751/#1753 are unmerged and review-ready. #1754 is the active implementation frontier. Preserve the old local history and dirty implementation outside the public candidate. New lease replaces the expired prior epoch; no force push or integration is required.

## Acceptance reconciliation
Current origin/main is 15d59210732765cc1e3dae33fa22f2aa32cee7d7; its latest delta only changes editorial project text. #1750 remains the authorized merged schema baseline. Live #1751/#1753 candidates have passing hosted checks and no review rejection; #1754 is accepted for fixture conformance and awaits final candidate CI after worklog finalization.
