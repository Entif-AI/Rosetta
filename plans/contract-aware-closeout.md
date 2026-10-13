---
id: entif:contract-aware-pr-closeout
task: T1815
status: done
depends: []
awaits: []
specs: [specs/architecture.md]
issues: [1815]
pr: 1817
---
# Enforce contract-aware issue closeout and retire shared root worklogs

## Scope and authority

Implement the repository-local closeout policy owned by #1815. A merge remains an
observed integration event, not semantic acceptance. Core/Pack authority, human
release decisions, and repository settings remain separate gates.

The maintainer-directed amendment on #1815 retires both legacy shared-root issue
state files, `FEATURE_LOG.md` and `FEATURE_MAP.md`, after preserving historical
payloads on their owning GitHub issue or PR. New working checkpoints belong in
append-only issue comments.

## Validation

- [x] Closeout admission requires typed issue dispositions and exact human merger approval before accepted issue closure.
- [x] Core/Pack semantic gates remain distinct from merge/build evidence and reuse existing governance proof.
- [x] Issue-backed Core Engineering checkpoints are primary; archived v1 worklogs remain migration-only.
- [x] Historical UCA state is preserved on #1801 and its child issues; the orphaned About/doctrine log is preserved on owning PR #1812.
- [x] Root `FEATURE_LOG.md` is removed, both legacy names are ignored, and add/modify mutations of either name are rejected while removal remains admissible.
- [x] `node --test tools/github/contract-closeout.spec.mjs`, `pnpm run governance:authority`, `pnpm run verify`, and `git diff --check` pass on the completed implementation diff.
- [x] Draft PR #1817 and the #1815 source-owner amendment preserve the remaining human activation boundary without claiming ruleset activation or merge authority.

## Handoff

This SpecOps motion is complete and frozen. Hosted admission on the final PR head
remains independent merge-readiness evidence. After a separately authorized merge,
the maintainer must prove the `rosetta/contract-closeout` PR-head status, configure
and test the default-branch ruleset, and confirm the applicable
`pull_request_target` Actions policy before #1815 can close.
