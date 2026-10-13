# Pack release gate

The Pack release gate composes existing repository checks into one deterministic report. It does not implement a second Pack validator.

The current composer runs four ordered implemented stages:

1. Pack-root and manifest validation from `tools/pack-conformance/validate-packs.mjs`.
2. Pack identity, declared-path, schema-entrypoint, and Profile checks from the same validator.
3. Repo-local `doc_id` and dependency-graph checks from the same validator.
4. The existing bootstrap workspace proof in `packages/rosetta-schemas/src/lib/workspace-contract.spec.ts`.

If a stage fails, later stages are reported as blocked. The report still preserves every Pack-validator error observed before the first gate failure.

These four stages are not the whole generic release contract. ROCK-3111-C also names generic required-root-file presence, example validation, applicable vector execution, required traceability headers, changelog/version consistency, and breaking-change migration/translator strategy. The current implementation does not evaluate those obligations generically, so a clean four-stage run reports `disposition: partial`, lists the unevaluated obligations under `coverage.notEvaluated`, and exits nonzero. It MUST NOT be described as release-ready.

Run `pnpm run packs:release-gate` locally. Nx exposes the same report as `pack-release-gate:report`; it is intentionally not registered as a generic `spec-admission` target while release coverage remains partial. The machine-readable result is `dist/pack-release-gate/report.json`.

Pack-specific semantic fixtures remain owned by their Pack-specific issues and targets. They may consume this generic gate; they are not prerequisites that redefine whether the generic #790 gate is valid.

Even a future complete `pass` is conformance evidence only. It does not approve a merge, release, registry change, Pack promotion, or downstream write.
