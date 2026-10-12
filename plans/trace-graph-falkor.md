---
id: entif:trace-graph-falkor
task: T1735
status: in-progress
depends: [trace-graph]
awaits: []
specs:
  - specs/architecture.md
issues: [1735, 1734, 1664]
pr: 1732
---
# Re-prove the operational projection against FalkorDB

#1734 and its native migration specification govern this forward implementation. The completed #1667/#1725 Neo4j proof remains historical evidence. There is no database-content migration: canonical source and TRACE-NORM directly produce the unchanged Rosetta-owned trace.projection.v1.

One serialized writer; fixture/local/private only. FalkorDB SSPLv1 public/network deployment and #361/#1222 promotion remain separate gates.

## Classification and implementation

- Reuse neutral source/norm inputs, stable IDs, projection builder, closure logic, all eight Cypher files and literal query expectations.
- Extract neutral construction; retain historical Neo4j exports and profile IDs.
- Add official falkordb 6.8.0 RESP import/reset/export with pinned server/image 6.0.1.
- Create supporting RANGE exact-match indexes first, verify db.indexes(), then create unique constraints and poll db.constraints() to OPERATIONAL. FAILED or timeout fails acceptance.
- Make the normal local proof/compose path FalkorDB after parity; retain cheap historical reference tooling.
- Leave historical Neo4j/golden/batch evidence byte-preserved. Write new Falkor proof.

## Validation

- [x] Same two canonical normalized fixtures produce the historical provider-neutral closure digests.
- [x] All eight existing Cypher files run unchanged and match literal historical outputs.
- [x] Re-import has exact closure parity and no duplicates.
- [x] Scoped reset preserves another projection; foreign relationships cause refusal before mutation.
- [x] Reset/rebuild restores exact closure and all query results.
- [x] Nine required label indexes cover stable IDs, composite source/payload identity and inspection fields; all eleven unique constraints are OPERATIONAL.
- [x] Source sequence/time remains observation data with zero causal edges.
- [x] Graph drop leaves canonical source/norm bytes and rosetta-store tiles intact.
- [x] Red/green readiness, admission and reset regressions; owner package checks.
- [ ] Integration on main (PR remains unmerged).

Real proof: tools/trace-graph/evidence/falkordb-proof.json. It binds exact implementation/input/query digests and historical oracle digests. Initial contract red was missing neutral/adapter modules; the real foreign-edge red exposed destructive DETACH reset and passed after ownership fencing. No queries or public projection semantics changed.

## Successors

#1736 owns independent TRACE-KIN/agent-stream structural acceptance. #1737 owns first-party Graphiti/Falkor wiring and live semantic proof. #1738 owns final catalog/roadmap/V0 reconciliation after all leaves pass. Their completion is not inferred from this leaf.

## External authorities

- docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md
