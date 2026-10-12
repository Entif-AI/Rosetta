---
id: entif:trace-graph
task: T1667
status: done
depends: [trace-norm]
awaits: []
specs:
  - specs/architecture.md
issues: [1667, 1664, 994, 1036, 1122, 1558, 1567]
pr: 1725
---
# Project TRACE-NORM into a real Neo4j operational graph

Add a development-grade Neo4j projection in `projection-adapters` plus a real-database proving tool. Neo4j is a rebuildable operational projection, never a Rosetta semantic authority. Project only mechanically justified structure and source lineage. Use stable identities, bounded fixture-specific reset, direct Cypher inspection, and a canonical exported closure digest to prove idempotent re-import.

## Validation

- [x] A clean Neo4j 5.26+ development database accepts the golden normalized fixture.
- [x] Uniqueness constraints cover every stable projected node family.
- [x] Re-import creates no duplicate semantic nodes/relationships.
- [x] Direct Cypher proves run/window membership, explicit parentage, request/result correlation, object lifecycle, and source lineage.
- [x] A bounded subgraph can be exported without reading the full graph.
- [x] Source sequence/timestamps are not represented as causal authority.
- [x] Projection reset deletes only the named `projectionId` namespace.
- [x] Reset + rebuild reproduces literal query results and graph-closure digest.
- [x] Source/canonical artifacts remain available when the Neo4j projection is absent.

## External authorities

- docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md
