---
id: entif:akasha-falkor-closeout
task: T1738
status: in-progress
depends: [trace-graph-falkor, trace-kin-falkor, trace-temp-falkor]
awaits: []
specs: [specs/architecture.md]
issues: [1738, 1734, 1664, 1667, 1668, 1669]
pr: 1732
---
# Reconcile the forward Akasha V0 backend path

#1734 governs the backend migration; the Core Spine and provider-neutral trace.projection.v1 retain semantic authority. Public documentation, catalog source and generated SpecOps dependency maps identify FalkorDB as active. Source/TRACE-NORM directly builds the graph; no Neo4j database contents are migration input. Historical plans, issue bodies, Profile IDs and receipt bytes remain preserved.

V0_VERSION_SPLIT_ACCEPTED_PENDING_UPSTREAM_COMPATIBILITY: operational/kinematics FalkorDB 6.0.1 with JS 6.8.0; semantic FalkorDB 4.20.7 with unchanged Graphiti 0.30.2/FalkorDriver and Python client 1.7.1. The first-party full-text incompatibility receipt remains discoverable. Fixture-backed experimental maturity remains unchanged. G15/#361/#1222 certification and SSPL public/network-service review precede promotion.

## Validation

- [x] #1735 operational proof: edfdff810bdbc3c649841686b2d51f0d56ebecc0ade3fa06268b5cfdc058f863.
- [x] #1736 kinematics proof: df4a04540de98bfe535fb07e82b4ecef524e2bb6d48ca445692d0eb2e31002d1.
- [x] #1737 semantic proof: 2fcb7bd5192f49f2e7f228fe64bbe955c9d8a724c7cc1bdf13a35c59eeab7d11; backend-only proof remains semanticAcceptance=false.
- [x] Native human roadmap Steps 5/7/14/15 and federation/anti-authority language reconciled with revision-guarded readback.
- [x] Append-only successor receipts on #1664/#1667/#1668/#1669; original bodies unchanged.
- [x] Active guidance, schema authority/catalog source and SpecOps maps synchronized; no ordinary V0 Neo4j service dependency.
- [x] Historical Neo4j receipts and six completion-envelope source digests unchanged.
- [x] Parent #1734 receives complete non-overlapping child coverage.
- [ ] Final full verification, exact-head runtime and hosted proof, worklog archive, merge and contract-based issue reconciliation.

## Evidence and boundaries

tools/trace-graph/evidence/falkordb-proof.json and falkordb-kinematics-proof.json own deterministic parity. tools/trace-temporal/evidence/falkordb-backend-proof.json owns persistence only; falkordb-semantic-proof.json owns attributed model-backed interpretation. The original Neo4j artifacts remain differential/reference proof. Fresh final-head replays use distinct --output paths and refuse existing receipts. GraphView/federation meaning and one-source/one-lineage rules stay backend-neutral. Step 14 live-data acceptance remains its existing separate source-admission obligation; fixture success does not claim TRACE-LIVE completion.
