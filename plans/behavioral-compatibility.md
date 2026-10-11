---
id: entif:behavioral-compatibility
task: T1556
status: in-progress
depends: []
awaits: [source-owner-behavioral-contract-acceptance]
specs: [specs/behavioral-compatibility-v1.md]
issues: [1556, 1553]
---
# Behavioral interoperability Profile and deterministic proof

Implement the bounded issue #1556 contract as **one review unit**: proposed desired state, reusable dimension vocabulary, portable request/offer/result schema, conservative comparator, and adversarial executable fixtures. The in-development spec is not authority until accepted by its source owner. #1553 consumes scope-specific comparisons later; it does not grant permission to retry or run anything. Preserve #1051, #1035/#1038, #158, #994 and #1295 ownership. No Core kind or runtime orchestration is added.

## Validation

- [ ] Existing adapter capability enum values and Core/Guard boundaries are reused, not duplicated.
- [ ] Eight issue-mandated and four additional adversarial scenarios pass through exported APIs.
- [ ] Catalog/Core-descent and source-digest generated projections are synchronized.
- [ ] `pnpm verify` succeeds; run only affected/targeted follow-ups when needed.
- [ ] A review-only PR is pushed to GitHub and issue #1556 receives an exact verification receipt.
- [ ] Source-owner resolves in-development semantic choices before implementation is treated as accepted.
- [ ] Human-governed merge only. No agent merge or main push.

## Continuity and limits

Isolated worktree: `rosetta-1556-behavioral`; branch: `codex/1556-behavioral-compatibility` from `origin/main` at `2a8f98fccec7c413e0786e923853c383f61861e8`. Normal verification: `pnpm verify`, focused tests when behavior changes. Every coherent unit is committed and pushed to GitHub with a remote SHA check before further lengthy work. Keep verbose logs ignored. This source tree inherits an unrelated historical `FEATURE_LOG.md` and lacks the documented native branch-lease tooling; do not overwrite it or claim a lease that was not acquired. Feature plan/issue/PR and Git history are the remote recovery source, with Work Stack only for dependent replay-sensitive actions. No Drive persistence for this engineering run.
