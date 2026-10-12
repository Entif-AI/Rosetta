---
id: entif:materialized-view
task: T1731
status: in-progress
depends: [impact-revalidation]
awaits: []
specs: [specs/architecture.md]
issues: [1731, 1567]
pr: 1732
---
# Materialized view identity, frontier and currency

Compose executable #1730 impact/revalidation into the public #1567 derived metadata contract. Preserve Core/source/rights/time/canonicalization owners; no cache, refresh, ranking or private reuse algorithm.

## Validation

- [x] All twelve required cases and boundary/history regressions.
- [x] Unknown is not current; byte validity is not currency; current rights fence historical material.
- [x] Complete environment drift and additive rematerialization are attributable.
- [x] Remint does not close semantic revalidation.
- [x] Owner lint/typecheck/build, 142 tests, published schema and SpecOps admission.
- [ ] Integration after merge.

#1728 is the next dependent specialization; #1729 remains independent. The plan remains in-progress until actual integration.
