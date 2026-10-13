---
id: entif:pack-lock-spec
task: T1790
status: planned
depends: []
awaits: [source-owner-spec-acceptance]
specs: [specs/pack-lock-graph.md]
issues: [1790, 1559]
pr: 1814
---
# Admit the Pack lock graph contract before the resolver

## Scope

Publish and review the proposed public desired-state specification `specs/pack-lock-graph.md`. Issue #1559 owns the semantic decision, #1790 owns the later executable schema/solver/verifier. This plan consumes the existing Core v3, ROCK-3111-C manifest and Pack ID rules, shared canonical JSON, Pack-cycle checks and schema catalog owners. The present work is **spec-only**; it cannot claim the resolver or fixtures implemented.

## Decision and dependency

Review first-wave range syntax, incomplete catalog/unknown semantics, plurality, tie-break rules, and the exact lock hash boundary with the public source owner. Once accepted, clear `source-owner-spec-acceptance` through an explicit reviewed artifact, then implement the 12 required deterministic and adversarial vectors on a separately reviewable feature branch. Keep parent #790 Pack release-gate work independent.

## Validation

- [x] The proposed spec has the correct in-development authority status, owner, source refs and 12 fixture oracles.
- [x] Plan DAG and proposed specification pass current SpecOps desired-state/source admission.
- [x] Generated catalog and Nx sync checks pass; public governance and source-digest checks remain green.
- [x] Draft spec-only PR #1814 links #1559 and #1790, with a verified first pushed head and explicit review limitations.
- [ ] Source-owner accepts consequential semantics; implementation is held until then.
- [ ] A later implementation PR produces schema, resolver, lock verifier and 12 passing fixtures with exact owner checks.

## Review handoff

Draft: https://github.com/Entif-AI/Rosetta/pull/1814. Reconcile current head and hosted admission before review. The first pushed head was `b1a67223e61df4f087fd224dd57d92fe006cf897` based on `2a8f98fccec7c413e0786e923853c383f61861e8`. No resolver or lock verifier is implemented here. Decisions on version syntax, plurality/unknown semantics, lock identity and schema ownership are intentionally held for the public source owner. Do not mark this spec accepted or clear `awaits` based on mechanical admission or PR creation. No agent is authorized to merge.
