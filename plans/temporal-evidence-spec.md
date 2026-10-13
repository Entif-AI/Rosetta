---
id: entif:temporal-evidence-spec
task: T1558
status: planned
depends: []
awaits: [source-owner-temporal-evidence-acceptance]
specs: [specs/temporal-evidence-v1.md]
issues: [1558, 1791]
pr: 1818
---
# Agree temporal/causal evidence semantics before runtime behavior

## Contract

Review `specs/temporal-evidence-v1.md` as a public, in-development Profile-level proposal under #1558. Compose Core v3 and accepted W3C provenance/time vocabularies with existing `impact.revalidation.v1`, time helpers and Core lattice evidence; do not redefine Core Tile identity. The proposed records are temporal assertion, causal relation and knowledge-frontier snapshot, with a pure, deterministic partial-order comparator and 12 specified fixture oracles.

The owner must first settle event/observation/recorded/correction time roles, uncertainty and calendar/timezone precision, when concurrency/noncomparability is proved, consistency with external vocabulary and exact schema ownership. Keep the implementation gate held until those choices are reviewed and accepted. A proposed spec cannot grant its own acceptance status.

## Downstream relationships

#1791 needs both #1558's executable causal/knowledge-frontier evidence and #1556's behavioral-equivalence semantics before its propagation-loop classifier can claim final conformance. #1560/#1730 already implements impact revalidation and remains the reusable owner of historical-context preservation. This plan does not implement or close either dependency.

## Validation

- [x] Current Core, impact, evaluation timestamp and lattice boundaries inspected; external PROV/OWL-Time mapping authority identified.
- [x] In-development proposal preserves unknown chronology, bounded partial order and 12 explicit future oracles without a new Core kind.
- [x] `pnpm verify`, Nx sync/source admission and clean diff verify proposed spec and plan mechanically.
- [x] Checkpoint feature branch on GitHub and verify remote SHA.
- [x] Draft PR #1818 and source-owner issue receipt created and independently read back; no merge.
- [ ] Human source-owner accepts or revises required temporal vocabulary, evidence and mapping decisions.
- [ ] Separate implementation PR supplies validators/comparator, schema/catalog and 12 executable test vectors.

Run policy: normal checks use `pnpm verify` plus focused tests after specific changes. Save coherent branch checkpoints to GitHub every few minutes and verify remote SHA; no Google Drive engineering mirror and no automatic merge. The Work Stack coordinates dependent side effects locally; GitHub branch/plan/issues/PR provide durable, public-safe recovery records.

Ownership/recovery: keep one branch writer. This checkout inherits a `FEATURE_LOG.md` from a separate historical feature on main and lacks the repository's documented native lease tool; do not overwrite that log or invent an acquired lease. Use a remote-SHA fence before every checkpoint push and preserve exact branch, plan, PR and issue references in GitHub for crash recovery.

## Handoff

Draft PR: https://github.com/Entif-AI/Rosetta/pull/1818. Public source-owner receipt: https://github.com/Entif-AI/Rosetta/issues/1558#issuecomment-6113154168. The first pushed and verified commit was `68edf87057544873c64947c9969b594edb2eff46` based on `2a8f98fccec7c413e0786e923853c383f61861e8`; the final review-plan checkpoint is a successor on the same feature branch. Re-fetch exact PR head and CI, inspect requested changes, and preserve the source-owner acceptance hold. Do not implement the comparator or downstream #1791 classifier before this contract is accepted, and do not merge automatically.
