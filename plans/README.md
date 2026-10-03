# Temporal motion

Use `node packages/nx-governance/specops/cli.mjs next` / `dag` after pinned SpecOps
setup. Readiness comes from files, not a spreadsheet or committed status table.
Each plan names a stable `id`, immutable coordinator `task: T###`, lifecycle,
`depends` (slugs whose status must be done), `awaits` (external unresolved blockers),
`specs` (controlling desired-state sources), `issues` (first durable owner plus
related discussions) and completed `pr` identity. A Validation checklist supplies
proof; completion never closes future issue discussion.

Default execution is one serialized writer. DAG ordering grants no parallel
mutation permission or branch-per-plan requirement. Exact Git/source/issue state
must be inspected before resuming in-progress work. Planned scope may absorb
explicit deferrals; in-progress scope/identity is protected and done files freeze.
Amend a governing spec separately, then revise planned work or flag active owners;
add successor motion for frozen work. Git stores history, not a copied timeline.

Plan-to-issue requests feed the existing Nx issue-sync coordinator/retained ledger.
Stable task identity survives prose edits. Split/merge `originTasks`/`decision`,
finding refs and retained closed-owner disposition use that existing contract.
Unknown acknowledgements never authorize blind creation; no transport may replace
GitHub's durable identity. This bridge emits requests, never sends by itself.

#1711 is represented only to preserve sequencing; its awaits prevents accidental
execution during this run. The Control Sheet remains useful to humans but is not
required execution context when next/dag plus controlling source refs suffice.
