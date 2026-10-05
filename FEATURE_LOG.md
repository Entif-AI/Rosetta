---
schema: "entif.feature-log/v1"
issue:
  repository: "Entif-AI/Rosetta"
  number: 1747
  title: "Effective-authority evaluator verification"
  url: "https://github.com/Entif-AI/Rosetta/issues/1747"
branch:
  name: "codex/1747-authz-evaluator"
  base_ref: "codex/1746-authz-schema"
  base_sha: "075d48c3a133e0a9d034fb674879e0596c787575"
initiator:
  type: "automation"
  principal: "codex"
  run_id: "5bd7ac99-e188-4b52-a7a8-b5f19f45ba94"
lease:
  id: "ad0ef261-2acd-4fc4-b164-7d22f1505236"
  holder: "codex"
  acquired_at: "2026-10-05T16:17:19.835Z"
  heartbeat_at: "2026-10-05T16:19:50.785Z"
  expires_at: "2026-10-05T16:49:50.785Z"
  released_at: null
focus:
  summary: "Evaluator regression green; finish admission"
  acceptance_refs: "[]"
checkpoint:
  sha: "4131b50c534a9a1a2587ebafdb6e60f5b9f877ae"
  pushed_at: null
state:
  status: "active"
  blocked: false
---

# Feature Worklog

## Objective
Complete #1747 effective-authority evaluation under #630 using the #1746 public schema and standard Core Evaluation.

## Acceptance Coverage
Current source/lineage/target/policy/context/validity resolution, attenuation and intersection, capability ceilings, independent gates, fail-closed inputs, evidence-only decisions, repeated standing-authority operations. Existing iam.decision API remains supported for #1748 migration.

## Decisions
WRAP_EXISTING_INTERFACE: internal Guard primitive consumed by existing Guard/AXI/runtime enforcement handlers. Trusted current resolver facts remain separate from intent/submitted projections; no authority store, Core kind or policy optimizer. Same-ref root/delegation alias fails schema admission.

## Validation
205 schema + 35 Guard tests pass. Affected lint/typecheck/test/build passed across 17 projects; Core-descent audit and Nx sync checks pass. Initial local spec admission reused failed desired-state evidence from before plugin build; targeted refresh in progress. Hosted evaluator confirmation pending checkpoint.

## Context Map
#630/#1746/#1747; effective-authority.ts/spec.ts; authz-evaluation-v1.json; authority-envelope.ts/spec.ts; effective-authority-v1.md. Repaired predecessor 075d48c merged normally; prior released lease preserved in Git.

## Known Risks
Fixture-backed enforcement proof. Consumers must resolve fresh authoritative state and enforce decisions before side effects; no production identity/provider service claim.

## Next Safe Step
Verify local admission, push evaluator checkpoint and inspect hosted CI; release/archive epoch after green acceptance, then take up #1748.

## Handoff Notes
Work Stack 5bd7ac99-e188-4b52-a7a8-b5f19f45ba94 / AUTHZ-1747-EVALUATOR. CP0006 exact-byte verified. No merge, promotion or issue closure. Private journals remain outside public merge candidates.
