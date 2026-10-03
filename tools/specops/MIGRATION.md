# S1 → SpecOps migration map

The machine inventory names every file in the selected S1 plugin, governance,
catalog, distribution, runtime fixture, workspace state and version-plan surfaces,
with exact S1 content digests. PR #1600's squash tree matches the specified S1 tip.

| Disposition | Ownership and migration |
| --- | --- |
| RETAIN_AS_GENERIC | Nx init/sync/inferred targets, admission, Core descent, source provenance; semantic meaning stays with owning Rosetta contracts |
| PORT | Baseline/convergence and durable issue-ledger contracts; reuse their adversarial fixtures under #1718/#1719 |
| GENERALIZE | Source catalog, distribution E2E and init/config; add SpecOps consumers without duplicating generic machinery |
| ADAPT | Pins, version intent, runtime veneer protections and .specify state; preserve prior data and explicit consumer-local authority |
| RETIRE | Spec Kit preset/extension/workflow/bundle installation wrappers only after #1721 equivalent successor proof; retain historical payloads for rollback |
| DEFER | No speculative runtime/browser/Slack/database adapters; #1711 remains the next efficiency experiment after integrated acceptance |

Forward path: add the pinned files-first donor CLI seam; prove plans/issue identity;
compose retained evidence into desired-state admission; add compact context; prove
portable upgrade and runtime generation. Readers can use old and new workflows
through expansion. No destructive contraction is implied by a retirement disposition.
Rollback reverts the migration commits and preserves the S1 payloads and local issue
ledger. Frozen historical execution plans must not be edited to make rollback convenient.

`node tools/axi/setup.mjs specops` installs the exact upstream source; no hook or
Skill is eagerly installed. The bundled upstream CLI is used directly for next/dag.
`node packages/nx-governance/specops/cli.mjs admit` invokes existing Nx merge
admission; it adds no new semantic authority or executor framework. SpecOps upstream
has no conventional license declaration at this pin: source is separately acquired,
not vendored into the public package, and legal cleanup remains explicit (#1716).
