---
id: entif:pack-schema-entrypoint-conformance
task: T7902
status: in-progress
depends: [pack-manifest-schema-gate]
awaits: []
specs: [specs/architecture.md]
issues: [790]
pr: 1824
---
# Validate declared Pack JSON Schema entrypoints

## Scope and authority

ROCK-3111-C section 8 requires parsing/validation of Pack schema documents where applicable, but the current checker proves only the existence of paths named by `entrypoints.schema[]`. This bounded #790 leaf consumes the manifest-schema-first stage of draft PR #1816 and adds standards-level JSON Schema meta-validation to the existing Pack checker. It does not create a new schema registry, replace the manifest contract, change Pack IDs, alter Core semantics, execute instance examples, or implement external-reference resolution or SHACL conformance.

The branch is intentionally stacked on `codex/790-pack-release-gate` (PR #1816) to review only the new leaf's validator/tests/docs. The independent bootstrap evidence lane is draft PR #1823, with distinct task identity `T7901`; this plan uses `T7902` to satisfy SpecOps uniqueness when the branches compose. Drafts are not normative promotion/merge authority.

## Validation

- [x] Red-before-green: malformed JSON and a syntactically valid but meta-schema-invalid file were falsely admitted because their declared paths existed.
- [x] Declared Draft 2020-12 JSON Schemas receive standards meta-schema checks, not Ajv implementation-specific strict-lint policy.
- [x] Malformed JSON, invalid JSON Schema, and an unsupported declared dialect produce distinct repairable error codes; unsupported is not misrepresented as invalid.
- [x] Missing declared schema paths retain the existing single `declared-path-missing` error; no extra schema error is invented.
- [x] All four current Pack roots, including RRP and source-substrate JSON Schemas, remain green.
- [x] `pack-conformance:test`, `pack-conformance:conformance`, `packs-rrp:test`, and `packs-rrp:conformance` pass (16 focused fixture cases).
- [x] `pnpm verify`, `nx sync:check`, and `git diff --check` passed on the initial published source commit.
- [x] GitHub verified the first pushed commit `c2c2ae7b840581a8e53fc4f5462be649075d6a88`; review-only stacked PR #1824 is open and draft.
- [ ] The final plan checkpoint SHA, #790 public issue receipt, and hosted admission check are read back.
- [ ] Human source-owner acceptance/merge is separate. The issue #790 release gate remains open for remaining required-file, example/vector, changelog and wider conformance work.

## Run policy

Run focused tests and `pnpm verify` instead of repeated full admission/distribution suites. Keep logs ignored and local. Commit and push coherent checkpoints with remote SHA verification to GitHub, not Google Drive. Preserve the main checkout, draft #1816 and draft #1823. Do not merge, deploy, promote, or assert runtime execution authority.

## Handoff

Review-only stacked PR: https://github.com/Entif-AI/Rosetta/pull/1824, based on `codex/790-pack-release-gate` (draft PR #1816). The source-owner issue #790 remains open and authorizes only this narrow already-specified schema parse/meta-validation requirement. Do not retarget the PR to `main` until #1816 is separately accepted and integrated. The separately open #1823 bootstrap proof requires its own review and has task identity `T7901`; #1816 remains `T790`; this plan is `T7902`. All current Pack roots and focused tests passed before publishing. Hosted CI on the final PR head remains independent evidence. Further Pack file/example/vector/changelog and #1118 RRP conformance claims are not delivered in this PR; it does not change Core or release/promotion authority.
