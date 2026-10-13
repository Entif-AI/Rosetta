# Pack release gate

The Pack release gate composes existing repository checks into one deterministic report. It does not implement a second Pack validator.

The current composer runs four ordered implemented stages:

1. Pack-root and manifest validation from `tools/pack-conformance/validate-packs.mjs`.
2. Pack identity, declared-path, schema-entrypoint, and Profile checks from the same validator.
3. Repo-local `doc_id` and dependency-graph checks from the same validator.
4. The existing bootstrap workspace proof in `packages/rosetta-schemas/src/lib/workspace-contract.spec.ts`.

If a stage fails, later stages are reported as blocked. The report still preserves every Pack-validator error observed before the first gate failure.

The follow-on `rock-release-obligations` stage audits the Draft ROCK release contract separately from the accepted manifest schema. It checks actual required root artifacts and example declarations, and verifies that Pack version bumps include an updated changelog that identifies the new version. It records per-Pack `pass`, `fail`, `not-applicable`, and `not-evaluated` outcomes under `obligations`, without inventing a generic semantics test runner. A missing root document, example declaration, or version/changelog match blocks release. Semantic example execution, applicable test-vector execution, required traceability headers, normative-change classification, and breaking-change migration evidence still need explicit contracts and may remain `not-evaluated`. The top-level report is `blocked` on a proved violation and otherwise `partial` while coverage is incomplete. Both return nonzero. The target MUST NOT be described as release-ready.

An intentional `blocked` result on today's four Pack roots is not a regression in their accepted manifest conformance: each is missing the fuller ROCK root-document set. Their missing documents should be authored with genuine content, not placeholders. See `plans/pack-release-gate-report.md` for the accepted-schema versus Draft ROCK reconciliation matrix and pending implementation gates.

Run `pnpm run packs:release-gate` locally. Nx exposes the same report as `pack-release-gate:report`; it is intentionally not registered as a generic `spec-admission` target while release coverage remains partial. The machine-readable result is `dist/pack-release-gate/report.json`.

Pack-specific semantic fixtures remain owned by their Pack-specific issues and targets. They may consume this generic gate; they are not prerequisites that redefine whether the generic #790 gate is valid.

Even a future complete `pass` is conformance evidence only. It does not approve a merge, release, registry change, Pack promotion, or downstream write.
