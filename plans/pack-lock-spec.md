---
id: entif:pack-lock-spec
task: T1790
status: planned
depends: []
awaits: [source-owner-spec-acceptance]
specs: [specs/pack-lock-graph.md]
issues: [1790, 1559]
---
# Admit the Pack lock graph contract before the resolver

## Scope

Publish and review the proposed public desired-state specification `specs/pack-lock-graph.md`. Issue #1559 owns the semantic decision, #1790 owns the later executable schema/solver/verifier. This plan consumes the existing Core v3, ROCK-3111-C manifest and Pack ID rules, shared canonical JSON, Pack-cycle checks and schema catalog owners. The present work is **spec-only**; it cannot claim the resolver or fixtures implemented.

## Decision and dependency

Review first-wave range syntax, incomplete catalog/unknown semantics, plurality, tie-break rules, and the exact lock hash boundary with the public source owner. Once accepted, clear `source-owner-spec-acceptance` through an explicit reviewed artifact, then implement the 12 required deterministic and adversarial vectors on a separately reviewable feature branch. Keep parent #790 Pack release-gate work independent.

## Validation

- [ ] The proposed spec has the correct in-development authority status, owner, source refs and 12 fixture oracles.
- [ ] Plan DAG and proposed specification pass current SpecOps desired-state/source admission.
- [ ] Generated catalog and Nx sync checks pass; public governance and source-digest checks remain green.
- [ ] A separate draft spec-only PR links #1559 and #1790, with exact head and review limitations.
- [ ] Source-owner accepts consequential semantics; implementation is held until then.
- [ ] A later implementation PR produces schema, resolver, lock verifier and 12 passing fixtures with exact owner checks.
