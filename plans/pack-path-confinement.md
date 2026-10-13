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

ROCK-3111-C defines a Pack root under `packs/<pack-name>/` and binds `rosetta-pack-id-v1` to regular files below that root. The inherited validator accepted entrypoint, export and Profile declarations that escaped the root or traversed symbolic links. It also followed a supplied Pack root or workspace Packs root when that exact root was a symbolic link, and repeated one missing asset across manifest surfaces as multiple failures. This #790 leaf closes those filesystem-boundary gaps before declared assets are read or Pack IDs are repaired. It does not change the Pack-ID algorithm, manifest vocabulary, Core semantics or release authority.

This branch is stacked on `codex/790-pack-schema-entrypoints` (draft PR #1824). Draft #1824 remains the owner of JSON Schema entrypoint meta-validation. Draft #1816 remains the owner of manifest-schema-first validation, and draft #1823 remains the independent bootstrap admission lane. This plan uses task `T7903` after `T7902` so the branches compose without duplicate task identity.

## Validation

- [x] Red-before-green: traversal, escaped export/Profile paths and symbolic-link declarations were accepted before the confinement check.
- [x] Absolute paths and any `..` path component fail before filesystem access outside the Pack root.
- [x] Direct symbolic links, symbolic-link parent directories and in-root symbolic links fail before asset reads.
- [x] Repeated declarations of one safe missing asset deduplicate by normalized asset identity; Profile-only absence retains `profile-path-missing`.
- [x] A direct symbolic-link Pack root and workspace Packs root fail before manifest discovery, hashing or Pack-ID repair; symbolic-link ancestors remain allowed.
- [x] A direct workspace Packs root fails closed with `pack-root-unsafe` when a non-internal child Pack entry is a symbolic link; the red fixture previously returned an empty successful workspace result.
- [x] A trailing path separator cannot turn the exact-root `lstat` check into a symbolic-link dereference.
- [x] A regular nested declared file remains valid.
- [x] External target mutation leaves `rosetta-pack-id-v1` unchanged, while the escaped declaration remains non-conformant.
- [x] Red-before-green reviewer follow-up: duplicate missing declarations and both exact-root symlink bypasses failed four focused fixtures before the fix.
- [x] Focused Pack tests pass with 36 fixture cases, and all four current Pack roots remain conformant.
- [x] Focused Pack/RRP aliases, `pnpm run governance:authority`, `pnpm verify`, `git diff --check`, Nx sync and SpecOps admission pass on the symlink-child closeout state.
- [x] GitHub readback confirms draft stacked PR #1826 with the intended base, head and review-only state.

## Integration boundary

Human source-owner acceptance and merge remain separate from bounded implementation validation. This plan must remain `in-progress` until its declared dependency `pack-schema-entrypoint-conformance` is `done`; completion of this leaf does not merge the PR, close #790, certify Pack release readiness or authorize promotion.

## Run policy

Keep this leaf limited to path confinement. Do not add a new manifest path grammar or change Pack-ID hashing. Preserve draft #1816, #1823 and #1824 worktrees. Commit and push coherent checkpoints, verify remote SHAs, and stop before merge, release or promotion.
