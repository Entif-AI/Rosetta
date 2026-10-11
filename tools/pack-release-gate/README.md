# Pack release gate

The Pack release gate composes existing repository checks into one deterministic report. It does not implement a second Pack validator.

The gate runs four ordered stages:

1. Pack-root and manifest validation from `tools/pack-conformance/validate-packs.mjs`.
2. Pack identity, declared-path, schema-entrypoint, and Profile checks from the same validator.
3. Repo-local `doc_id` and dependency-graph checks from the same validator.
4. The existing bootstrap workspace proof in `packages/rosetta-schemas/src/lib/workspace-contract.spec.ts`.

If a stage fails, later stages are reported as blocked. The report still preserves every Pack-validator error observed before the first gate failure.

Run `pnpm run packs:release-gate` locally. Nx exposes the same check as `pack-release-gate:spec-admission`, which lets the existing semantic-governance CI run it through the repository's affected `spec-admission` target. The machine-readable result is `dist/pack-release-gate/report.json`.

A passing report is repository conformance evidence. It does not approve a merge, release, registry change, Pack promotion, or downstream write.
