---
schema: "entif.feature-log/v1"
issue:
  repository: "Entif-AI/Rosetta"
  number: 1746
  title: "AUTHZ-SCHEMA-001: Authority Envelope Profile"
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
  id: "059927d3-5a32-47be-8867-ed17f051c834"
  holder: "codex"
  acquired_at: "2026-10-05T15:16:48.413Z"
  heartbeat_at: "2026-10-05T15:31:51.828Z"
  expires_at: "2026-10-05T16:01:51.829Z"
  released_at: null
focus:
  summary: "Schema acceptance green; prepare #1747 dependent evaluator"
  acceptance_refs: "[]"
checkpoint:
  sha: "d2f5dc8bd1bf855285a33e6d0b84ee97ad3f8452"
  pushed_at: null
state:
  status: "active"
  blocked: false
---

# Feature Worklog

## Objective
Implement #1746 under #630 as a governed public extension/Profile.

## Acceptance Coverage
Public TypeScript/JSON Schema exports; catalog/Core descent; exact bounded resource/domain/operations/effects/context; authority roots and conditional actor evidence; delegation lineage/ceiling/depth; policy/source frontier; distinguishable expiry/revocation/invalidity/supersession; provenance/integrity/Receipt refs; positive and negative fixtures.

## Decisions
V1 supports exact resource references and finite conjunctive context values. Structural validation never returns an execution grant; current-state evaluation belongs to #1747. No Core kind or authority store introduced.

## Validation
Red proof: absent schema surface. Green: schema/Guard build,test,typecheck: 205 schema + 15 existing Guard tests passed on the implementation tree following d2f5dc8. JSON projection parity and authority governance passed. Catalog edit required nx sync; regenerated projections and nx sync:check passed.

## Context Map
Live #630/#1746; authority-envelope-v1.md; authority-envelope.ts/spec.ts; schema-catalog.ts/core-descent.ts; #711 domain comparison; #1037 effect vocabulary.

## Known Risks
Fixture-backed public contract; no production provider/identity integration. Reference declarations require external authoritative owner resolution.

## Next Safe Step
Acquire #1747 lease on the schema branch successor and write evaluator red tests using the exported AuthorityEnvelope.

## Handoff Notes
Work Stack 5bd7ac99-e188-4b52-a7a8-b5f19f45ba94 / AUTHZ-1746-SCHEMA. CP0002 exact-byte verified. Private journal stays outside the public branch; cursor 3. No merge, promotion or issue closure authorized.
