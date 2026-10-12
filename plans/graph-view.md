---
id: entif:graph-view
task: T1728
status: in-progress
depends: [impact-revalidation, materialized-view]
awaits: []
specs: [specs/architecture.md]
issues: [1728, 1671]
pr: 1732
---
# Bounded GraphView conformance

Compose generic materialized identity/currency, impact evidence, temporal roles, source jurisdiction and projection support. Preserve Core lattice/provenance where exact; namespaced descriptor relationships fill bounded inter-view gaps. No backend, selection/pruning/ranking algorithm or Core kind.

## Validation

- [x] Required source sharing, staleness, eviction, partial invalidation, meta-view and rebuild cases.
- [x] Current rights fence output/counts; shared projections cannot inflate source lineage.
- [x] Reject source deletion, Core truth promotion and dangling identities.
- [x] Owner lint/typecheck/build and 155 tests, including 13 GraphView cases.
- [x] Generated schema/catalog, authority, SpecOps and full merge admission pass.
- [ ] Integrated after merge.

Executable #1730/#1731 contracts are consumed on this authorized integration branch; integrated plan readiness remains truthful until merge.
