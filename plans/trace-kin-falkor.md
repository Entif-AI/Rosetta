---
id: entif:trace-kin-falkor
task: T1736
status: in-progress
depends: [trace-graph-falkor]
awaits: []
specs: [specs/architecture.md]
issues: [1736, 1734, 1669]
pr: 1732
---
# Re-prove deterministic trace kinematics on FalkorDB

Forward successor to the completed #1669 contract. Preserve its plan, metrics and Neo4j evidence. Reuse unchanged TRACE-NORM inputs, trace-kin-v1 criteria and the existing morphology/lifecycle/neighborhood Cypher corpus. One serialized writer; local/private fixture only.

## Validation

- [x] Both complete deterministic metric reports and result digests equal historical expectations: 66 captured and six generated snapshots.
- [x] All three query families exactly match historical literal results; pre/post neighborhoods remain directly inspectable.
- [x] Generated S2 remains a representation-shrink/compaction candidate; S4 reset is excluded; B disappears and reappears.
- [x] No source-order adjacency becomes causality; zero causal edges.
- [x] Separate named scratch graph uses the pinned official RESP adapter, nine indexes and eleven OPERATIONAL constraints.
- [x] Scratch graph deletion preserves canonical source/store and all historical proof bytes.
- [x] Active Step 7 / Step 14 instructions target FalkorDB.
- [ ] Integrated after merge.

Proof: tools/trace-graph/evidence/falkordb-kinematics-proof.json, sha256:df4a04540de98bfe535fb07e82b4ecef524e2bb6d48ca445692d0eb2e31002d1. Backend identity belongs in proof evidence; analytics meaning and thresholds are unchanged. Observable shrink does not establish provider/model internal memory compaction. #1737 independently owns Graphiti semantics; #1738 waits for its proof.
