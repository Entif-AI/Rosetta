---
schema: "entif.feature-log/v1"
issue:
  repository: "Entif-AI/Rosetta"
  number: 1746
  title: "Authority Envelope schema admission repair"
  url: "https://github.com/Entif-AI/Rosetta/issues/1746"
branch:
  name: "codex/1746-authz-schema"
  base_ref: "origin/main"
  base_sha: "555503eead2f532bb133e3eaffd8f4dbacdf2a7a"
initiator:
  type: "automation"
  principal: "codex"
  run_id: "5bd7ac99-e188-4b52-a7a8-b5f19f45ba94"
lease:
  id: "317ff852-cff1-4f04-9ecd-3d9ade9e4e4a"
  holder: "codex"
  acquired_at: "2026-10-05T15:59:42.282Z"
  heartbeat_at: "2026-10-05T16:07:43.236Z"
  expires_at: "2026-10-05T16:37:43.237Z"
  released_at: null
focus:
  summary: "Generated audit repaired; verify hosted admission"
  acceptance_refs: "[]"
checkpoint:
  sha: "89e32b869365ba917fabf9fe00fddd4783b24ddf"
  pushed_at: null
state:
  status: "active"
  blocked: false
---

# Feature Worklog

## Objective
Repair #1746 generated Core-descent admission without changing the accepted Profile/schema contract or earlier archive.

## Acceptance Coverage
Schema implementation and 25 AuthZ fixtures are unchanged. Generated audit now includes authz.authority_envelope.v1 as a governed extension.

## Validation
Hosted run 37334241675 exposed audit drift. Regeneration and local spec-admission now pass. Affected lint/typecheck/test/build passed for 12 projects and 18 dependencies on 2026-10-05 (10 of 56 tasks cached). Full logs are recoverable. Hosted confirmation remains pending after this checkpoint.

## Context Map
#630/#1746; authority-envelope-v1.md; authority-envelope.ts/spec.ts; schema-catalog.ts/core-descent.ts; CORE_DESCENT_AUDIT.json.

## Decisions
This epoch repairs generated projection only. Earlier archive remains immutable; no new Core kind, authority store, or semantic override.

## Next Safe Step
Verify hosted admission at the repair head, then release/archive this epoch and resume existing #1747 branch with a fresh remote lease and a normal dependency merge.

## Handoff Notes
Work Stack 5bd7ac99-e188-4b52-a7a8-b5f19f45ba94 / AUTHZ-1746-SCHEMA; CP0005 exact-byte verified. Private journals remain outside public artifacts. No merge, promotion or issue closure authorized.
