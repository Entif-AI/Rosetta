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
  heartbeat_at: "2026-10-05T16:27:43.551Z"
  expires_at: "2026-10-05T16:57:39.254Z"
  released_at: "2026-10-05T16:27:43.551Z"
focus:
  summary: "Effective-authority evaluator acceptance green: 205 schema + 35 Guard tests, affected checks across 17 projects, cold local admission (13 recorded pass checks), hosted Semantic governance 37340008889 at 9f441923e366e6c1c16c32a83b26ff02465ec763 and site verification 37340008801. Ready for compatibility migration consumption."
  acceptance_refs: "[]"
checkpoint:
  sha: "3b870ca2d61512e514cd9001e615fb2193a176dc"
  pushed_at: null
state:
  status: "available"
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
205 schema + 35 Guard tests pass. Affected lint/typecheck/test/build passed across 17 projects; Core-descent audit and Nx sync checks pass. Recorded desired-state and spec-admission artifacts now pass after refreshing evidence without cache; the wrapper exit alone was insufficient proof. Hosted Semantic governance 37340008889 passed at 9f441923e366e6c1c16c32a83b26ff02465ec763. Site verification 37340008801 also passed. Cold local merge-admission rerun passed with all 13 recorded checks and no convergence findings.

## Context Map
#630/#1746/#1747; effective-authority.ts/spec.ts; authz-evaluation-v1.json; authority-envelope.ts/spec.ts; effective-authority-v1.md. Repaired predecessor 075d48c merged normally; prior released lease preserved in Git.

## Known Risks
Fixture-backed enforcement proof. Consumers must resolve fresh authoritative state and enforce decisions before side effects; no production identity/provider service claim.

## Next Safe Step
Complete cold local admission, finalize this review candidate and take up #1748 from the exported schema/evaluator contracts.

## Handoff Notes
Work Stack 5bd7ac99-e188-4b52-a7a8-b5f19f45ba94 / AUTHZ-1747-EVALUATOR. CP0007 exact-byte verified; private resume journal cursor 3. No merge, promotion or issue closure. Private journals remain outside public merge candidates.
