---
id: entif:trace-temp-falkor
task: T1737
status: in-progress
depends: [trace-graph-falkor]
awaits: []
specs: [specs/architecture.md]
issues: [1737, 1734, 1668, 1558]
pr: 1732
---
# First-party Graphiti temporal bridge on FalkorDB

Forward successor; preserve #1668 history and its Neo4j evidence. Reuse trace.graphiti-selection/projection.v1 admission, support, rights and distinct temporal coordinates. The pinned first-party donor owns RESP persistence. One serialized writer; fixture/local/private only; SSPL/public-service and promotion gates remain explicit.

## Compatibility decision

Graphiti 0.30.2 / eaa4128681bc53487138a4bbc22d58336ebe70d2 is the current released pin. Its index builder fails against FalkorDB 6.0.1, reproduced locally and tracked by upstream getzep/graphiti#1947. Preserve the new incompatibility receipt. Use a separate pinned FalkorDB 4.20.7 fixture for the unchanged first-party driver; #1735/#1736 retain their 6.0.1 proof. This temporary version split does not alter Rosetta semantics or infer a unified runtime. No custom driver/monkeypatch is introduced.

## Validation

- [x] Bounded canonical source/TRACE-NORM fixture with explicit effective times, later change, late old evidence, retraction, contradictory dates and ambiguous identity.
- [x] First-party FalkorDriver and client 1.7.1 with distinct semantic/operational graph jurisdictions.
- [x] Five literal episode rows, operational indexes, duplicate-delivery idempotency, graph deletion and episode persistence rebuild on real FalkorDB 4.20.7.
- [x] Semantic graph deletion preserves exact operational closure, canonical source/store and historical proof bytes.
- [x] Model-off / absent configuration / outage handling admit zero semantic claims; shared donor support mapping and eighteen Rosetta conformance cases pass.
- [ ] Actual model-backed extraction/evolution/invalidation; current/history direct-query acceptance.
- [ ] Live out-of-order/retraction/contradiction/identity/rights adversarial cases.
- [ ] Live semantic re-extraction/rebuild and recorded model/provider/config/version/nondeterminism/loss.
- [ ] Supported single-runtime compatibility re-proof or explicit final version-split disposition.
- [ ] Integrated after merge.

Backend-only proof: tools/trace-temporal/evidence/falkordb-backend-proof.json, sha256:6245e8aa247c6ec872577dd8750f7813d4926e7fbe7133df99372b7e149cab18. It explicitly records semanticAcceptance=false. API key and model/embedder/reranker configuration are absent in the attempted live run. #1738 and #1664 cannot infer semantic acceptance from this baseline.
