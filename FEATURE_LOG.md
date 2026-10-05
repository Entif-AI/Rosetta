---
schema: "entif.feature-log/v1"
issue:
  repository: "Entif-AI/Rosetta"
  number: 1747
  title: "Agent-native AuthZ evaluator"
  url: "https://github.com/Entif-AI/Rosetta/issues/1747"
branch:
  name: "codex/1747-authz-evaluator"
  base_ref: "codex/1746-authz-schema"
  base_sha: "a36d12ec1f0e318a73c41503e77e9101d019aa77"
initiator:
  type: "automation"
  principal: "codex"
  run_id: "5bd7ac99-e188-4b52-a7a8-b5f19f45ba94"
lease:
  id: "aa7ac511-2e27-4408-b87d-850e5500ad8c"
  holder: "codex"
  acquired_at: "2026-10-05T15:39:15.472Z"
  heartbeat_at: "2026-10-05T15:55:51.987Z"
  expires_at: "2026-10-05T16:25:46.712Z"
  released_at: "2026-10-05T15:55:51.987Z"
focus:
  summary: "Resume after schema hosted admission repair; no downstream uptake yet"
  acceptance_refs: "[]"
checkpoint:
  sha: "7bb76f68025eddbc770cd34bfb86832c8c352548"
  pushed_at: null
state:
  status: "available"
  blocked: false
---

# Feature Worklog

## Objective
#1747 effective authority using shared #1746 schema, current sources/lineage, independent ceilings and gates.

## Acceptance Coverage
Owner tests/build/typecheck green: 205 schema and 35 Guard tests. Includes broad provider containment, standing delegation, current invalidity/frontiers, source/lineage closure, empty intersections, context and conditional actor/gate evidence. Source-role alias regression first incorrectly allowed, now denied by the owning schema. Existing #1029 tests remain green.

## Current Focus
Preserve evaluator checkpoint while repairing #1746 hosted admission: core-descent audit projection was not regenerated. No migration/conformance uptake before predecessor admission is green.

## Decisions
Internal Guard/PEP primitive: WRAP_EXISTING_INTERFACE. Owner-supplied current evidence never comes from intent/cache. Emits standard Core Evaluation with decision-evidence posture; no new decision Profile or authority store.

## Validation
205 schema + 35 Guard tests/build/typecheck green. #1746 CI 37334241675 failed core-descent admission; local audit confirms generated projection drift. Local desired-state setup needs nx-governance build, not authority semantics changes.

## Next Safe Step
Resume #1746 canonical branch with a new lease; run governance:descent:generate, validate admission, commit/push, then reconcile the evaluator dependency.

## Handoff
Work Stack 5bd7ac99-e188-4b52-a7a8-b5f19f45ba94, AUTHZ-1747-EVALUATOR executing. CP0004 exact-byte verified. Private journal cursor 3. No merge, promotion or issue closure.
