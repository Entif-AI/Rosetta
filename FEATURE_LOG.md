---
schema: "entif.feature-log/v1"
issue:
  repository: "Entif-AI/Rosetta"
  number: 1748
  title: "Agent-native AuthZ migration"
  url: "https://github.com/Entif-AI/Rosetta/issues/1748"
branch:
  name: "codex/1748-authz-migration"
  base_ref: "codex/1747-authz-evaluator"
  base_sha: "fc79ed941dab2a190adcbc1a2c49d37d9ed9aa5b"
initiator:
  type: "automation"
  principal: "codex"
  run_id: "5bd7ac99-e188-4b52-a7a8-b5f19f45ba94"
lease:
  id: "91072a22-c3b6-48d7-80a3-31f5ebd903ed"
  holder: "codex"
  acquired_at: "2026-10-05T16:27:57.132Z"
  heartbeat_at: "2026-10-05T17:00:15.411Z"
  expires_at: "2026-10-05T17:30:15.412Z"
  released_at: null
focus:
  summary: "Migration fixtures/docs green; verify affected and hosted admission"
  acceptance_refs: "[]"
checkpoint:
  sha: "96f2830346c85aff3e7391ad56e975335993c9c0"
  pushed_at: null
state:
  status: "active"
  blocked: false
---

# Feature Worklog

## Objective
Implement #1748 additive, versioned compatibility under #630 using stable schema/evaluator predecessor fc79ed9.

## Acceptance Coverage
All seven dispositions and ten migration fixture states implemented. Actual legacy consumer, historical preservation, invalidity, source-bound delegation, restrictive workflow and optional approval handoff tested. Catalog compatibility annotations and downstream owner guidance complete.

## Decisions
Expand/migrate/verify only; no destructive contraction. Existing artifacts/callers retain their meaning. iam.principal/delegation/cache_domain currently lack owned payload validators, so compatibility must not invent their payload schemas. Delegation projection requires current authority owner explicitly resolving the historical artifact CID; a bare record has no grant. WRAP_EXISTING_INTERFACE through Guard; no second authority store or broad AuthZ AXI.

## Validation
Red proof 02f1c0 -> green implementation 96f2830. Current fixture/catalog change set: 205 schema + 59 Guard tests passed; typecheck/lint/build passed (Nx cache 8/14 tasks). nx sync and sync:check passed. Affected regression running; admission/hosted proof pending. Initial full check exposed an additive catalog assertion and missing test-fixture typing; both repaired and owner suites green.

## Next Safe Step
Finish affected checks and cold merge admission; inspect all recorded statuses, obtain hosted admission, update PR/digest-bound delta, finalize exact log and release lease; then start #1749 from the stable branch.

## Handoff Notes
Work Stack 5bd7ac99-e188-4b52-a7a8-b5f19f45ba94 / AUTHZ-1748-MIGRATION; CP0009 exact-byte remote readback verified. Private journal cursor 4; active lease reconciled against remote 96f2830. Recovery did not replay external writes. No merge, promotion, issue closure or destructive migration authorized.
