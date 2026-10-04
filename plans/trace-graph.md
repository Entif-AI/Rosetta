---
id: entif:trace-graph
task: T1667
status: planned
depends: [trace-norm]
awaits: []
specs:
  - specs/architecture.md
issues: [1667, 1664, 994, 1036, 1122, 1558, 1567]
pr:
---
# Project TRACE-NORM into a real Neo4j operational graph

Add a development-grade Neo4j projection in `projection-adapters` plus a real-database proving tool. Neo4j is a rebuildable operational projection, never a Rosetta semantic authority. Project only mechanically justified structure and source lineage. Use stable identities, bounded fixture-specific reset, direct Cypher inspection, and a canonical exported closure digest to prove idempotent re-import.

## Validation

- [ ] A clean Neo4j 5.26+ development database accepts the golden normalized fixture.
- [ ] Uniqueness constraints cover every stable projected node family.
- [ ] Re-import creates no duplicate semantic nodes/relationships.
- [ ] Direct Cypher proves run/window membership, explicit parentage, request/result correlation, object lifecycle, and source lineage.
- [ ] A bounded subgraph can be exported without reading the full graph.
- [ ] Source sequence/timestamps are not represented as causal authority.
- [ ] Projection reset deletes only the named `projectionId` namespace.
- [ ] Reset + rebuild reproduces literal query results and graph-closure digest.
- [ ] Source/canonical artifacts remain available when the Neo4j projection is absent.

## External authorities

- docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md
