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
  heartbeat_at: "2026-10-05T16:31:28.383Z"
  expires_at: "2026-10-05T17:01:28.383Z"
  released_at: null
focus:
  summary: "Migration red proof committed; implement bounded adapters"
  acceptance_refs: "[]"
checkpoint:
  sha: "da8db2f893662950c26820e9e9d241e424e9d21b"
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
Expected red: missing authority-compatibility module/export (2026-10-05T16-30-16-731Z-41105.log). Green implementation pending. Predecessors passed local and hosted admission.

## Next Safe Step
Implement schema-owned mapping metadata and Guard adapters; validate old and new callers, negative cases, catalog/descent and affected checks.

## Handoff Notes
Work Stack 5bd7ac99-e188-4b52-a7a8-b5f19f45ba94 / AUTHZ-1748-MIGRATION; CP0007 exact-byte verified. Private journal cursor 3. No merge, promotion, issue closure or destructive migration authorized.
