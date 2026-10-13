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

The ROCK release-obligations audit follows these stages only when the generic Pack validator succeeds. It is a separate fifth stage so a draft ROCK filesystem rule cannot silently become a new requirement of the accepted `pack.json` JSON Schema. The audit emits per-Pack outcomes (`pass`, `fail`, `not-applicable`, `not-evaluated`) and exact failure details. A proven failure blocks release, while incomplete/undetermined evidence keeps the report `partial`, and the exit code remains nonzero in either case. This is a **release-evidence** target, not generic manifest conformance, core semantics, or authorization to merge.

ROCK-3111-C §8 also names generic required-file presence, example validation, applicable vector execution, required traceability headers, changelog/version consistency, and breaking-change migration strategy. Those are not all computed by the current generic validator. Until they are, a clean four-stage run MUST report `disposition: partial`, enumerate the unevaluated obligations, and return nonzero instead of claiming release readiness.

## ROCK §2/§5/§7/§8 reconciliation and acceptance matrix

Source posture: ROCK-3111-C is **Draft**. The accepted live manifest contract in `packs/_schemas/pack-manifest.schema.json` is authoritative for `pack.json` shape, including the `entrypoints` enum. Historical ROCK example keys such as `primary_schema` are not accepted aliases. The generic filesystem/release requirements are evaluated as a distinct draft release contract; this change does not quietly add requirements to the manifest validator, grant Packs certification, or invent approved exceptions.

| Requirement | Current release audit and executable failure case | Unfinished acceptance proof |
| --- | --- | --- |
| Required root files / §2 | Inspect regular, nonempty README, acceptance, and JSON object metadata; require CHANGELOG after `0.0.x` (the specific §2.1 grace rule); require nonempty `examples/`, `tests/`. Symlinks and empty files do not count. Missing artifacts produce `fail` with paths. | Existing Packs need genuine authored root artifacts, not placeholder files. Confirm whether full §2.0 minimum overrides the §2.1 changelog grace period before acceptance. |
| Example validation / §§2,8 | Require a declared example and directory. Execute examples covered by an explicit portable JSON Schema binding; attach exact bytes/schema digests. | Resolve the three older Markdown walkthroughs and any unmapped examples through semantic fixture/runner contracts before claiming cross-Pack validation. |
| Vector execution / §§3,6,8 | Execute all 18 salience/counterfactual JSON Schema vectors through an explicit declarative Pack-specific schema binding, checking expected accept/reject outcomes. Each case retains vector/schema SHA-256 receipt. Unmapped families remain `not-evaluated`. | Bind RRP receipt/signature and promotion-state vectors through verified Pack harness receipts without promoting RRP-specific semantics to generic authority. |
| Traceability / §5 | Per-file audit of declared JSON Schemas and SHACL: fingerprint assets, reject contradictory Pack descent and Turtle DocID/export headers, distinguish missing or incomplete headers as `not-evaluated`. A governing JSON `x-rosetta.authority` is not assumed to be the owning file path. | Adopt a compatible DocID sidecar/metadata projection for JSON, settle generated canonical-vector/policy/translator header classification, and verify all required normative classes before claiming complete traceability. |
| Changelog for normative edits / §§7,8 | Git diff against the selected base fails if a candidate normative schema/vocabulary/policy/manifest change lacks a changed changelog; content-ID-only manifest rewrites do not count. A present changelog keeps actual semantic classification `not-evaluated`. | Link changelog claims to accepted semantic-impact classification and tests. |
| Release version versus changelog / §§7,8 | Reject a version downgrade or unchanged/wrong changelog on a bump; compare semver and require a changed changelog identifying the new version. Missing baseline remains `not-evaluated`. | Check bump *magnitude* against a confirmed semantic change classification rather than guessing from diff paths. |
| Breaking migration / §7 | Candidate semantic paths are flagged for review; lack of change is `not-applicable`, not a fabricated migration waiver. | Record breaking/additive classification and require migration notes, translator, or before/after fixtures as appropriate. |

Observed baseline on the checked `main`: all four Packs lack root README, CHANGELOG, acceptance and metadata files; evaluation-profile SchemaPack also lacks an example directory. These must be fixed or expressly reconciled through accepted specification motion before this draft release check could pass. **Do not** write synthetic acceptance claims to make the report green.

The release gate has three distinct evidence conditions: `fail` means a requirement was checked and violated; `not-evaluated` means its test/authority/evidence contract is incomplete; `not-applicable` means the specific trigger was absent; `pass` requires actual verification. Failure or incomplete coverage must never yield exit code zero. A green generic Pack report is evidence only, not merge/release/promotion authorization.

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
- [x] Required-root-file, undeclared-example and version/changelog failures are independently observable in the release report with negative fixtures.
- [x] Non-applicable conditions are represented separately from unverified example, vector, traceability and migration semantics.
- [x] A generic portable JSON Schema adapter checks bound positive and negative vectors, verifies manifest declarations, fingerprints executed evidence and refuses silent coverage of newly introduced unbound families.
- [x] Candidate normative changes without changelog deltas and version downgrades fail closed; content-address-only manifest rewrites are not misclassified as normative changes.
- [x] JSON Schema and Turtle/SHACL provenance audit distinguishes contradictory, complete and incomplete evidence, with digest-bearing per-file findings and an explicit unresolved JSON header mapping.
- [ ] Remaining `not-evaluated` obligations gain authoritative machine-readable binding and runner/fixture proofs; existing Pack root deficiencies are resolved by separate maintained Pack changes.
