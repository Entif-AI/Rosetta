---
id: entif:trace-live-adapter
task: T1685
status: done
depends: []
awaits: []
specs: [specs/architecture.md]
issues: [1685]
pr: 1795
---
# Prove the bounded TRACE-LIVE source-adapter fixture

## Scope and authority

Deliver the independently reviewable fixture slice owned by #1685 by composing
existing source-substrate records, manifestations, packages and episodes with
TRACE-NORM and derived projection. Raw source bytes remain authoritative and
separate from normalization, correlation and graph outputs. This motion does not
claim genuine producer admission or end-to-end live acceptance.

## Validation

- [x] Three declared producer families are admitted through one bounded UTF-8 JSONL source boundary with deterministic size/event limits and explicit failure on overflow.
- [x] Disclosure allowlisting excludes secrets, paths, headers, cookies and unknown nested fields from derived output while preserving the local raw source.
- [x] Large raw payloads are content-addressed once in the local private spool and referenced without automatic disclosure or resolution.
- [x] Repeated evidence, conflicting producer/event identity, unresolved joins and exact occurrence counts have explicit deterministic behavior.
- [x] Source evidence remains separately identifiable from TRACE-NORM and graph projection, and repeated identical admission is content-stable.
- [x] The synthetic Ultra fixture proves direct correlation queries, repeated import, isolated reset/rebuild, source preservation and owned cleanup while keeping `liveSourceAcceptance=false` and `endToEndAcceptance=false`.
- [x] Focused compute/TRACE-LIVE tests, repository governance, Nx sync/check and full `pnpm verify` pass on the refreshed PR branch.
- [x] PR #1795 leaves #1685 open for the real producer/E2E proof after #1688 and the #1673/#1674/#1676 producer hooks.

## Handoff

This fixture motion is complete and frozen. The next #1685 work is a successor
motion over genuine live producers and screened derived-only Ultra proof. Capture,
rights/custody, deployment and model interpretation remain separate authorities.
