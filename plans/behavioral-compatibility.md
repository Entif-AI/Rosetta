---
id: entif:behavioral-compatibility
task: T1556
status: in-progress
depends: []
awaits: [source-owner-behavioral-contract-acceptance]
specs: [specs/behavioral-compatibility-v1.md]
issues: [1556, 1553]
pr: 1822
---
# Behavioral interoperability Profile and deterministic proof

Implement the bounded issue #1556 contract as **one review unit**: proposed desired state, reusable dimension vocabulary, portable request/offer/result schema, conservative comparator, and adversarial executable fixtures. The in-development spec is not authority until accepted by its source owner. #1553 consumes scope-specific comparisons later; it does not grant permission to retry or run anything. Preserve #1051, #1035/#1038, #158, #994 and #1295 ownership. No Core kind or runtime orchestration is added.

## Validation

- [x] Existing adapter capability enum values are reused by reference and Core/Guard boundaries remain unchanged.
- [x] Eight issue-mandated and additional adversarial scenarios pass via exported APIs (19 focused tests; 224 schema-package tests).
- [x] Three portable JSON Schemas match source objects byte-for-semantics through executable tests; catalog/Core-descent and generated projections are synchronized.
- [x] `pnpm verify` passed, including governance and Nx affected lint/typecheck/tests/build. No full-project matrix or distribution rerun.
- [x] Draft PR #1822 is pushed to GitHub at the verified initial head `81aab4e272750b5dab771690a6d2ac90700440a5`, and issue #1556 has a read-back proof receipt.
- [ ] Source-owner resolves in-development semantic choices before implementation is treated as accepted.
- [ ] Human-governed merge only. No agent merge or main push.

## Continuity and limits

Isolated worktree: `rosetta-1556-behavioral`; branch: `codex/1556-behavioral-compatibility` from `origin/main` at `2a8f98fccec7c413e0786e923853c383f61861e8`. Normal verification: `pnpm verify`, focused tests when behavior changes. Every coherent unit is committed and pushed to GitHub with a remote SHA check before further lengthy work. Keep verbose logs ignored. This source tree inherits an unrelated historical `FEATURE_LOG.md` and lacks the documented native branch-lease tooling; do not overwrite it or claim a lease that was not acquired. Feature plan/issue/PR and Git history are the remote recovery source, with Work Stack only for dependent replay-sensitive actions. No Drive persistence for this engineering run.

## Handoff

Proposed and fixture-backed, not yet an accepted standard. Draft PR: https://github.com/Entif-AI/Rosetta/pull/1822. Verified source-owner issue receipt: https://github.com/Entif-AI/Rosetta/issues/1556#issuecomment-6113671665. Contract decisions still require source-owner review of strict equality-only comparison, evidence sufficiency, exact dimension value domains, normative-only posture when observation is not required, and binding of the eventual #1553 compatibility graph consumer. A compatible result is **not** an execution/retry/write grant. The original source issue #1556 is preserved; PR review and merge are separately governed. Next, reconcile live branch/PR SHA and GitHub CI before any new push; do not bypass unresolved semantic review.
