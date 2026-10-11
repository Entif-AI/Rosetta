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

Issue #790 requires one workspace Pack release-gate signal that composes manifest authority, deterministic Pack checks, repo-local `doc_id` and dependency checks, and the existing bootstrap workspace proof. This leaf adds that composition without changing the validator from draft #1826 or the bootstrap proof wired separately by draft #1823.

The report is conformance evidence only. A passing disposition does not approve merge, release, promotion, registry mutation, or another write. #676 still owns governed DocID registry semantics, #79 owns optional Pack subtrees, #1172 owns governed non-Pack roots, and #240 owns broader Profile conformance.

## Contract

The report uses fixed ordered stages: Pack-root/manifest, Pack integrity, DocID/dependencies, then bootstrap workspace. A failure blocks later stages. Errors already observed by the inherited Pack validator remain available in the report, but blocked stages cannot become a green release signal.

Local execution uses `pnpm run packs:release-gate`. Nx exposes `pack-release-gate:spec-admission`, so the existing semantic-governance CI affected-target command runs the gate without editing the CI workflow currently owned by draft PR #1817. The report path is `dist/pack-release-gate/report.json`.

## Validation

- [x] Active #790 PRs and current open-PR file overlap were inspected before edits.
- [x] Base is draft #1826 head `9233b1841242a524c4ab2b461f38812db8207ef0`; draft #1826 remains unmodified.
- [x] Red-before-green fixture run failed because `release-gate.mjs` did not yet exist after local dependencies were installed.
- [x] Positive and negative report fixtures pass with deterministic stage ordering.
- [x] Current workspace Pack gate passes and writes stable JSON; two runs produced SHA-256 `090bb76dc3fc255e018adf73a09229bb807bbe4f10faf7580dd8c06a711c0b55`.
- [x] Existing Pack conformance and bootstrap proof remain green.
- [x] Nx affected/spec-admission reaches the new gate in CI-equivalent execution.
- [x] `pnpm verify`, governance checks, SpecOps/Nx sync, and `git diff --check` pass before the PR-identity checkpoint.
- [ ] Remote feature SHA, draft PR, #790 receipt, and hosted admission are read back.
- [ ] Human source-owner acceptance and merge remain separate.
