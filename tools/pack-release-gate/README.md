# Pack release gate

The Pack release gate composes existing repository checks into one deterministic report. It does not implement a second Pack validator.

The generic evidence adapter in `vector-evidence.mjs` executes portable JSON Schema vector families named in `vector-bindings.json`, using each test case's declared `expectOk` result. It records the exact vector and schema SHA-256 digests, expected and actual verdicts, and case counts. New JSON vectors in a configured family are executed; new families or unmapped examples remain `not-evaluated`. Cases omitted from the Pack's declared test entrypoints fail. Unsupported RRP receipt/signature vectors remain owned by their existing Pack-specific executable harness and do not become a generic JSON Schema pass by association.

The Git-baseline audit also rejects version downgrades and normative candidate changes with no corresponding changelog change. It ignores content-ID-only manifest edits. Having a changelog is **not** proof that a change is backward compatible or that a major-bump migration is adequate; those semantic determinations remain `not-evaluated` until their public review/evidence contract exists.

The current composer runs four ordered implemented stages:

1. Pack-root and manifest validation from `tools/pack-conformance/validate-packs.mjs`.
2. Pack identity, declared-path, schema-entrypoint, and Profile checks from the same validator.
3. Repo-local `doc_id` and dependency-graph checks from the same validator.
4. The existing bootstrap workspace proof in `packages/rosetta-schemas/src/lib/workspace-contract.spec.ts`.

If a stage fails, later stages are reported as blocked. The report still preserves every Pack-validator error observed before the first gate failure.

The follow-on `rock-release-obligations` stage audits the Draft ROCK release contract separately from the accepted manifest schema. It checks actual required root artifacts and example declarations, portable mapped JSON Schema vectors, and Pack version bumps against their changelog. It records per-Pack `pass`, `fail`, `not-applicable`, and `not-evaluated` outcomes under `obligations`. A missing root document, example declaration, failed bound vector, or version/changelog mismatch blocks release. Unbound Markdown examples, RRP signature tests, traceability headers, normative-change classification, and breaking-change migration evidence still need explicit contracts and may remain `not-evaluated`. The top-level report is `blocked` on a proved violation and otherwise `partial` while coverage is incomplete. Both return nonzero. The target MUST NOT be described as release-ready.

An intentional `blocked` result on today's four Pack roots is not a regression in their accepted manifest conformance: each is missing the fuller ROCK root-document set. Their missing documents should be authored with genuine content, not placeholders. See `plans/pack-release-gate-report.md` for the accepted-schema versus Draft ROCK reconciliation matrix and pending implementation gates.

Run `pnpm run packs:release-gate` locally. Nx exposes the same report as `pack-release-gate:report`; it is intentionally not registered as a generic `spec-admission` target while release coverage remains partial. The machine-readable result is `dist/pack-release-gate/report.json`.

Pack-specific semantic fixtures remain owned by their Pack-specific issues and targets. They may consume this generic gate; they are not prerequisites that redefine whether the generic #790 gate is valid.

Even a future complete `pass` is conformance evidence only. It does not approve a merge, release, registry change, Pack promotion, or downstream write.
