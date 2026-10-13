---
id: entif:pack-bootstrap-admission
task: T7901
status: done
depends: []
awaits: []
specs: [specs/architecture.md]
issues: [790]
pr: 1823
---
# Include bootstrap Pack evidence in merge admission

## Scope and authority

Bounded follow-on to #790 after the independent manifest-shape leaf in draft PR #1816. The current governance config already runs Pack ID, manifest, path, Profile, and dependency checks as `evidence-packs`. The Nx governance plugin already composes evidence and emits a machine-readable merge-admission report in CI. Reuse those facilities. Add a separate merge-stage check that runs the existing `workspace-contract.spec.ts` to verify bootstrap governance authorities, the Pack suite index, and expected Pack manifests and IDs.

This is a repository-local bootstrap-presence check, not an independently certified Pack release. It does not change `rosetta-pack-id-v1`, Pack manifests, Core semantics, DocID registry authority (#676), optional Pack subtrees (#79), non-Pack contribution roots (#1172), or broader Profile conformance (#240). Full ROCK-3111-C required-root-file, executable example/vector, changelog and RRP-specific closure obligations remain separate; #1118 owns RRP-specific completion. A green admission report is evidence, not permission to promote, merge, or perform a write under #994 or #1295.

## Validation

- [x] Before change, Nx creates `evidence-packs` but no `evidence-pack-bootstrap` target; confirmed in the unmodified #1816 worktree.
- [x] Existing two bootstrap-workspace tests pass when invoked as the new merge-stage check.
- [x] Generated `rosetta-governance:evidence-pack-bootstrap` yields a successful real evidence JSON record.
- [x] Composed `merge-admission.json` contains both `packs` and `pack-bootstrap` checks with passing results, using the existing report schema and GitHub CI workflow.
- [x] Hosted merge admission passed at the previous head `7c4bf146de589fb0e1da49a95be6c76bc98935c4`. Local composed runs were blocked by the missing and then relative-path `specify` CLI in an isolated worktree; the existing pinned CLI's focused distribution test subsequently passed with an absolute path. The final plan-identity-only checkpoint requires a new hosted readback.
- [x] Existing focused Pack conformance and Nx governance tests remain green; four Pack roots pass and Nx sync:check passes.
- [x] `pnpm verify` and `git diff --check` pass.
- [x] First pushed remote feature branch SHA `e74e43034d6f008e2c5927522dd4793c4c259f17` matches the local checkpoint.
- [x] Review-only draft PR #1823 opened; no automatic merge.
- [x] #790 owner receipt and final plan checkpoint were read back at https://github.com/Entif-AI/Rosetta/issues/790#issuecomment-6113984801.
- [x] Hosted Semantic governance admission passed on exact final head `95c28b38f500a551360f3a52419c218663b8a915`.

## Run constraints

Use `pnpm verify` and focused targets, not repeated full merge/distribution matrices. Keep verbose logs local and ignored. Commit and push coherent deltas to GitHub with remote SHA verification. Keep the original checkout and draft PR #1816 unchanged. Public-only conformance/configuration work uses accepted public Pack and repository governance; no protected operating mechanism is introduced.

## Handoff

Draft PR: https://github.com/Entif-AI/Rosetta/pull/1823. The bounded SpecOps motion is complete and frozen here; source-owner review and merge remain separate actions. The bootstrap evidence record is `dist/governance/rosetta-governance/pack-bootstrap.json`, and the existing composed merge report is `dist/governance/rosetta-governance/merge-admission.json`. Both Pack checks passed. The first complete local composition was blocked on the isolated worktree's absent pinned Spec Kit CLI; a second attempt exposed a relative path problem in the test's temporary consumer. The focused distribution E2E then passed with the existing pinned Spec Kit CLI from a sibling ignored virtual environment using an absolute path, without repository dependency changes. Hosted admission passed on exact final head `95c28b38f500a551360f3a52419c218663b8a915`. No full release certification, write/promotion authority, or merge is claimed. Further #790 obligations include ROCK-3111-C required-file/example/vector/changelog conformance, with RRP-specific cases owned by #1118.

The per-plan task identity is `T7901`, distinct from draft #1816's `T790`. Separate #790 leaves must not collide under SpecOps' unique task identity check when multiple draft PRs eventually compose.
