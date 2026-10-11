---
id: entif:pack-bootstrap-admission
task: T790
status: in-progress
depends: []
awaits: []
specs: [specs/architecture.md]
issues: [790]
---
# Include bootstrap Pack evidence in merge admission

## Scope and authority

Bounded follow-on to #790 after the independent manifest-shape leaf in draft PR #1816. The current governance config already runs Pack ID, manifest, path, Profile, and dependency checks as `evidence-packs`. The Nx governance plugin already composes evidence and emits a machine-readable merge-admission report in CI. Reuse those facilities. Add a separate merge-stage check that runs the existing `workspace-contract.spec.ts` to verify bootstrap governance authorities, the Pack suite index, and expected Pack manifests and IDs.

This is a repository-local bootstrap-presence check, not an independently certified Pack release. It does not change `rosetta-pack-id-v1`, Pack manifests, Core semantics, DocID registry authority (#676), optional Pack subtrees (#79), non-Pack contribution roots (#1172), or broader Profile conformance (#240). Full ROCK-3111-C required-root-file, executable example/vector, changelog and RRP-specific closure obligations remain separate; #1118 owns RRP-specific completion. A green admission report is evidence, not permission to promote, merge, or perform a write under #994 or #1295.

## Validation

- [x] Before change, Nx creates `evidence-packs` but no `evidence-pack-bootstrap` target; confirmed in the unmodified #1816 worktree.
- [x] Existing two bootstrap-workspace tests pass when invoked as the new merge-stage check.
- [x] Generated `rosetta-governance:evidence-pack-bootstrap` yields a successful real evidence JSON record.
- [ ] Composed `merge-admission.json` contains both `packs` and `pack-bootstrap` checks with passing results, using the existing report schema and GitHub CI workflow.
- [x] Existing focused Pack conformance and Nx governance tests remain green; four Pack roots pass and Nx sync:check passes.
- [x] `pnpm verify` and `git diff --check` pass.
- [ ] Remote feature branch SHA is read back after push.
- [ ] Review-only PR and #790 issue receipt identify remaining release-gate limitations. No automated merge.

## Run constraints

Use `pnpm verify` and focused targets, not repeated full merge/distribution matrices. Keep verbose logs local and ignored. Commit and push coherent deltas to GitHub with remote SHA verification. Keep the original checkout and draft PR #1816 unchanged. Public-only conformance/configuration work uses accepted public Pack and repository governance; no protected operating mechanism is introduced.
