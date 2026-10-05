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
  heartbeat_at: "2026-10-05T17:08:49.117Z"
  expires_at: "2026-10-05T17:38:49.118Z"
  released_at: null
focus:
  summary: "Migration acceptance green locally and hosted; finalize for review"
  acceptance_refs: "[]"
checkpoint:
  sha: "dcdf23e9954ab28769e954a4967d949f07c49741"
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
Red proof 02f1c0 -> green implementation 96f2830. Current fixture/catalog change set: 205 schema + 59 Guard tests passed; typecheck/lint/build passed (Nx cache 8/14 tasks). nx sync and sync:check passed. Affected regression green (16 projects, 61/64 tasks cached). Cold merge-admission recorded 13/13 pass at dcdf23e; hosted admission 37345382606 passed at dcdf23e9954ab28769e954a4967d949f07c49741. Initial full check exposed an additive catalog assertion and missing test-fixture typing; both repaired and owner suites green.

## Next Safe Step
Archive/release this verified migration epoch; start AUTHZ-1749-CONFORMANCE from its final stable branch. Full #1748 acceptance is implemented and tested; human integration review remains reserved.

## Handoff Notes
Work Stack 5bd7ac99-e188-4b52-a7a8-b5f19f45ba94 / AUTHZ-1748-MIGRATION; CP0011 exact-byte remote readback verified; private continuity destination is owner-only. Private journal cursor 5; active lease reconciled against remote dcdf23e. Recovery did not replay external writes. No merge, promotion, issue closure or destructive migration authorized.
