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
- [x] Actual model-backed extraction/evolution/invalidation; current/history direct-query acceptance.
- [x] Live out-of-order/retraction/contradiction/identity/rights adversarial cases.
- [x] Live semantic re-extraction/rebuild and recorded model/provider/config/version/nondeterminism/loss.
- [x] Explicit V0_VERSION_SPLIT_ACCEPTED_PENDING_UPSTREAM_COMPATIBILITY disposition.
- [ ] Integrated after merge.

Backend-only proof: tools/trace-temporal/evidence/falkordb-backend-proof.json, sha256:6245e8aa247c6ec872577dd8750f7813d4926e7fbe7133df99372b7e149cab18. It explicitly records semanticAcceptance=false. API key and model/embedder/reranker configuration are absent in the attempted live run. #1738 and #1664 cannot infer semantic acceptance from this baseline.

## Model-backed successor acceptance

The separate tools/trace-temporal/evidence/falkordb-semantic-proof.json binds tested source head 8912484aad2ab89745805c0989caec01d95b8879, sha256:2fcb7bd5192f49f2e7f228fe64bbe955c9d8a724c7cc1bdf13a35c59eeab7d11. semanticAcceptance=true records two real five-episode extractions with 31 admitted artifacts each, direct current/history queries, actual later invalidation, retained retraction/contradiction/identity behavior, duplicate transport, rights/scope exclusion, earlier knowledge frontier, unavailable-provider degradation and semantic deletion/rebuild. Source, normalization, operational closure/store and earlier receipts are preserved; both owned scratch graphs are dropped.

Execution, inference and graph host are host:m3-ultra; provider transport is loopback. LM Studio 0.4.23+1, selected GGUF engine 2.33.0, chat/reranker qwen3.8-27b-absolute-heresy-i1 and independent text-embedding-nomic-embed-text-v1.5 (768 dimensions) were discovered and probed. API revision/digest is unavailable, not invented. Explicit native json_schema, schema-in-prompt and reasoning_effort=none configuration remains attributed runtime evidence, not broker policy.

The pinned semantic server's indexed AND/OR predicate over-admits temporal rows. A real red/green indexed-runtime test proves the native CASE predicate used by direct inspection; each returned interval is independently checked. Donor facts remain unresolved interpretation: its late event can retain an open interval and it does not reliably extract retraction/contradiction facts. All literal donor state and selected source conflict remain inspectable. Current rights and Rosetta temporal admission govern visible output. Fresh inference/rebuild is qualified by invariants, not UUID or inferred-text equality. #1738 may now enter its own acceptance; public-service/promotion and unified-runtime compatibility remain separate gates.
