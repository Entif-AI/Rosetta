---
id: entif:pack-path-confinement
task: T7903
status: in-progress
depends: [pack-schema-entrypoint-conformance]
awaits: []
specs: [specs/architecture.md]
issues: [790]
pr: 1826
---
# Confine declared Pack paths to Pack identity

## Scope and authority

ROCK-3111-C defines a Pack root under `packs/<pack-name>/` and binds `rosetta-pack-id-v1` to regular files below that root. The current validator accepted entrypoint, export and Profile declarations that escaped the root or traversed symbolic links. Those declarations could read mutable bytes that the declared Pack ID did not cover. This #790 leaf rejects those declarations before any declared asset is read. It does not change the Pack-ID algorithm, manifest vocabulary, Core semantics or release authority.

This branch is stacked on `codex/790-pack-schema-entrypoints` (draft PR #1824). Draft #1824 remains the owner of JSON Schema entrypoint meta-validation. Draft #1816 remains the owner of manifest-schema-first validation, and draft #1823 remains the independent bootstrap admission lane. This plan uses task `T7903` after `T7902` so the branches compose without duplicate task identity.

## Validation

- [x] Red-before-green: traversal, escaped export/Profile paths and symbolic-link declarations were accepted before the confinement check.
- [x] Absolute paths and any `..` path component fail before filesystem access outside the Pack root.
- [x] Direct symbolic links, symbolic-link parent directories and in-root symbolic links fail before asset reads.
- [x] Safe missing paths keep the existing single missing-path error.
- [x] A regular nested declared file remains valid.
- [x] External target mutation leaves `rosetta-pack-id-v1` unchanged, while the escaped declaration remains non-conformant.
- [x] Focused Pack and RRP tests pass with 27 fixture cases, and all four current Pack roots remain conformant.
- [x] Focused RRP aliases, `pnpm verify`, `git diff --check`, Nx sync and SpecOps admission pass at the source checkpoint.
- [x] GitHub readback confirms draft stacked PR #1826 with the intended base, head and review-only state.
- [ ] Human source-owner acceptance and merge remain separate.

## Run policy

Keep this leaf limited to path confinement. Do not add a new manifest path grammar or change Pack-ID hashing. Preserve draft #1816, #1823 and #1824 worktrees. Commit and push coherent checkpoints, verify remote SHAs, and stop before merge, release or promotion.
