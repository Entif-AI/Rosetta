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
  heartbeat_at: "2026-10-05T16:50:55.532Z"
  expires_at: "2026-10-05T17:20:55.533Z"
  released_at: null
focus:
  summary: "Migration adapters green; finish fixtures and consumer guidance"
  acceptance_refs: "[]"
checkpoint:
  sha: "02f1c011a58d8f75bd3f1aadc7ee78459cdd7a77"
  pushed_at: null
state:
  status: "active"
  blocked: false
---

# Feature Worklog

## Objective
Implement #1748 additive, versioned compatibility under #630 using stable schema/evaluator predecessor fc79ed9.

## Acceptance Coverage
Red tests cover all seven dispositions, native/legacy/unsupported/insufficient states, historical preservation, real legacy decision consumer, expiry/revocation/policy/target failures, source-bound delegation, restrictive workflow and optional approval handoff.

## Decisions
Expand/migrate/verify only; no destructive contraction. Existing artifacts/callers retain their meaning. iam.principal/delegation/cache_domain currently lack owned payload validators, so compatibility must not invent their payload schemas. Delegation projection requires current authority owner explicitly resolving the historical artifact CID; a bare record has no grant. WRAP_EXISTING_INTERFACE through Guard; no second authority store or broad AuthZ AXI.

## Validation
Red proof committed at 02f1c0. Focused compatibility tests: 14/14 passed, including fail-closed unknown constraints and malformed revocation evidence. Full-suite, build and affected admission will be refreshed after fixture/docs completion. Predecessors passed local and hosted admission.

## Next Safe Step
Complete fixture-driven migration states and downstream guidance; regenerate catalog/descent; run schema/Guard and affected admission; inspect recorded check statuses before finalization.

## Handoff Notes
Work Stack 5bd7ac99-e188-4b52-a7a8-b5f19f45ba94 / AUTHZ-1748-MIGRATION; CP0008 remote object recovered and SHA-256 verified. Private journal cursor 4; same active lease reconciled against remote 02f1c0. Recovery did not replay external writes. No merge, promotion, issue closure or destructive migration authorized.
