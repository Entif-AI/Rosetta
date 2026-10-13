---
id: entif:pack-release-gate-report
task: T7904
status: in-progress
depends: [pack-path-confinement]
awaits: []
specs: [specs/architecture.md]
issues: [790]
pr: 1827
---
# Compose the Pack release-gate report

## Scope and authority

Issue #790 requires one generic workspace Pack release-gate signal that composes manifest authority, deterministic Pack checks, repo-local `doc_id` and dependency checks, and the existing bootstrap workspace proof. Pack-specific semantic fixtures remain downstream consumers of this gate and do not define generic #790 readiness.

The report is conformance evidence only. #676 still owns governed DocID registry semantics, #79 owns optional Pack subtrees, #1172 owns governed non-Pack roots, #240 owns broader Profile conformance, and #1118 owns RRP-specific closure. No #1118/#1825 behavior is a prerequisite for this generic gate.

## Contract

The current report uses four fixed ordered implemented stages: Pack-root/manifest, Pack integrity, DocID/dependencies, and bootstrap workspace. A failure blocks later stages. Errors already observed by the inherited Pack validator remain available in the report.

ROCK-3111-C §8 also names generic required-file presence, example validation, applicable vector execution, required traceability headers, changelog/version consistency, and breaking-change migration strategy. Those are not all computed by the current generic validator. Until they are, a clean four-stage run MUST report `disposition: partial`, enumerate the unevaluated obligations, and return nonzero instead of claiming release readiness.

Local execution uses `pnpm run packs:release-gate`; Nx exposes `pack-release-gate:report`. The incomplete report is deliberately not a generic `spec-admission` target. The report path is `dist/pack-release-gate/report.json`.

## Validation

- [x] Active #790 PRs and current open-PR file overlap were inspected before edits.
- [x] Current draft #1826 base head is incorporated without mutating #1826.
- [x] Red-before-green fixture run failed because `release-gate.mjs` did not yet exist after local dependencies were installed.
- [x] Positive and negative report fixtures pass with deterministic stage ordering.
- [x] A clean implemented-stage run is explicitly `partial`, never `pass`, while ROCK generic release obligations remain unevaluated.
- [x] Existing Pack conformance and bootstrap proof remain green.
- [x] RRP-specific #1118/#1825 dependency, target execution, and merged tree effects are removed from the generic #790 candidate.
- [x] The incomplete release report is not exposed as a generic `spec-admission` success surface.
- [x] `pnpm verify`, governance checks, SpecOps/Nx sync, focused Pack/gate tests, and `git diff --check` pass on the repaired final candidate.
- [ ] Remote feature SHA, draft PR, #790 receipt, and hosted admission are read back.
- [ ] Remaining generic ROCK release obligations are implemented or assigned to accepted follow-up motion before T7904 can become `done`.
