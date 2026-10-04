# Selected temporal interpretation experiment

The active successor is #1737 under #1734. Graphiti 0.30.2 uses its first-party `FalkorDriver` over RESP; source, deterministic operational structure and model-derived interpretation retain separate jurisdictions. No Graphiti/Falkor type is added to Rosetta Core.

## Active Falkor fixture

Install `requirements-falkordb.txt` in a disposable Python 3.13 environment and set `TRACE_GRAPHITI_PYTHON` to its interpreter. Graphiti is pinned to 0.30.2 / `eaa4128681bc53487138a4bbc22d58336ebe70d2`; the official Python Falkor client is 1.7.1. Graphiti directly imports `httpx`; this dependency is explicitly pinned because current OpenAI dependencies instead install `httpx2`.

Start `docker compose -p trace-temporal-1737 -f tools/trace-temporal/docker-compose.yaml up -d`. The checksum-pinned server is FalkorDB 4.20.7, container `entif-graphiti-falkor-1737`, RESP at `127.0.0.1:16380`, semantic graph `entif_graphiti_1737`. It exposes no browser port or persistent volume. `TRACE_GRAPHITI_FALKORDB_PORT` / `TRACE_GRAPHITI_FALKORDB_CONTAINER` can select an explicitly owned fixture with the same image and issue label. Operational adapter environment variables cannot redirect the semantic graph. The runner verifies the runtime before mutation and refuses an existing semantic graph until reconciled. On Falkor, Graphiti `group_id` selects a physical graph: it is fixed to the same semantic graph name.

The separate runtime is a bounded compatibility exception to the preferred shared runtime. Graphiti's current released and main first-party index builder fails on FalkorDB 6.0.1; the exact real failure is preserved in `evidence/falkordb6-graphiti-incompatibility.json` and matches [upstream #1947](https://github.com/getzep/graphiti/issues/1947). No custom driver, monkeypatch or hidden syntax rewrite is used. #1735/#1736 remain proven on 6.0.1. A unified runtime cannot be claimed until supported donor/server compatibility is independently re-proven.

Build the normal source/normalization/projection/store dependencies. `TRACE_GRAPH_ISOLATED=true node tools/trace-temporal/prove-falkordb.mjs --output .axi/falkor-backend-replay.json` runs the real first-party persistence baseline. It admits five synthetic normalized episodes from canonical `fixtures/temporal-evolution.sse`, checks exact content/time/support, repeat delivery, deletion and episode rebuild, preserves the complete operational projection in another named graph, then drops both scratch graphs. Immutable `evidence/falkordb-backend-proof.json` binds the image, resolved Python environment, unmodified donor code, source/implementation hashes and direct literal query results. Donor indexes are all OPERATIONAL; this pinned first-party builder creates no unique constraints. This proves persistence; its `semanticAcceptance=false` is unchanged.

`node tools/trace-temporal/run.mjs --output-dir .axi/model-off-replay` is model-off and writes a fresh ignored `falkordb-model-off-*` evidence bundle with exported schema copies. Existing evidence paths are refused before provider dispatch; checked-in receipts and schema files remain unchanged. For the verified LM Studio path set `TRACE_GRAPHITI_PROVIDER=lmstudio`, a credential-free loopback `TRACE_GRAPHITI_BASE_URL`, symbolic `TRACE_GRAPHITI_ENDPOINT_REF`/`TRACE_GRAPHITI_HOST_REF`, and explicit `TRACE_GRAPHITI_MODEL`, `TRACE_GRAPHITI_EMBEDDER`, `TRACE_GRAPHITI_RERANKER`. Other OpenAI-compatible providers use their own local credential reference. The provider helper probes actual chat/embedding capability; schema output and discovered embedding dimension are recorded separately. `--live` with absent configuration emits truthful unavailable evidence with zero artifacts and no graph/model calls. A configured run leaves its owned semantic graph for inspection; reconcile it before retrying. Keep secrets out of receipts. Model-backed extraction remains nondeterministic; unknown model revision/digest stays unknown.

The separate accepted `evidence/falkordb-semantic-proof.json` has SHA-256 `2fcb7bd5192f49f2e7f228fe64bbe955c9d8a724c7cc1bdf13a35c59eeab7d11`, tested source head `8912484aad2ab89745805c0989caec01d95b8879` and `semanticAcceptance=true`. Two actual sequential five-episode extractions produced 31 admitted artifacts each. Direct current/history queries, later invalidation, late older effective time, duplicate delivery, literal retraction/contradiction/ambiguous identity, rights/scope revocation, earlier knowledge frontier, actual provider refusal and semantic deletion/fresh invariant-equivalent rebuild pass. Source/normalization, deterministic operational closure/store and historical receipts remain preserved. #1738 now owns forward reconciliation.

Replay with explicit configuration using `TRACE_GRAPH_ISOLATED=true node tools/trace-temporal/prove-semantic-falkordb.mjs --output .axi/falkor-semantic-replay.json`. All proof harnesses refuse existing output paths before fixture mutation. The verified runtime is LM Studio 0.4.23+1, GGUF engine 2.33.0, chat/reranker `qwen3.8-27b-absolute-heresy-i1` and independent `text-embedding-nomic-embed-text-v1.5` embeddings (768 dimensions), colocated over loopback on `host:m3-ultra`. The accepted split is `V0_VERSION_SPLIT_ACCEPTED_PENDING_UPSTREAM_COMPATIBILITY`.

The pinned semantic server's indexed AND/OR interval predicate over-admitted future facts. A real database regression proves native Cypher CASE; each query row is also independently interval-checked. Donor punctual facts may retain open intervals, retraction/contradiction extraction is incomplete, and identity stays unresolved. Literal source conflicts and donor state remain inspectable. These are attributed interpretations governed by Rosetta support/rights/time admission. Rebuild equivalence compares semantic invariants rather than UUIDs or inferred text.

Stop the owned fixture with `docker compose -p trace-temporal-1737 -f tools/trace-temporal/docker-compose.yaml down`. Local/private SSPLv1 fixture success does not authorize public/network service promotion.

## Historical Neo4j reference lane

Issue #1668 is the original planning predecessor. Its checked-in `evidence/projection.json` / `inspection.json` remain historical. The public adapter boundary for selected `trace.normalization.v1` records remains unchanged. Source evidence, deterministic operational projection and Graphiti interpretation remain separate. No private selection or attention policy is implemented.

For reference replay, run `node tools/trace-temporal/run.mjs --neo4j-reference --output-dir .axi/neo4j-reference-replay`. The default is model-off. This lane explicitly selects the original three synthetic records and writes only to ignored `.axi/trace-temporal-neo4j-reference`, preserving historical receipts. Both runtime lanes reuse the same neutral support/revision/invalidation mapping and existing exported schemas.

The checked-in output is a **degraded-path proof**, not Graphiti ingestion. `--live` was attempted with no provider credentials or explicit models available; no model call or graph write occurred. Source and normalization remain intact. The pure wrapper fixtures prove admission, rights fencing, distinct temporal coordinates, ordered/historical inspection, explicit supersession, ambiguous identities, contradictions, duplicate lineage and accepted-output replay. They do not prove donor inference or physical graph reset/rebuild.

## Historical optional Neo4j runtime

Use Python >=3.10,<4 in a disposable environment and install `requirements.txt`. Donor `graphiti-core==0.30.2` corresponds to upstream commit `eaa4128681bc53487138a4bbc22d58336ebe70d2`, Apache-2.0. API mappings were inspected at that exact commit. Start the isolated, checksum-pinned Neo4j 5.26.0 fixture with `tools/trace-graph/start-neo4j.sh`.

Set `TRACE_GRAPHITI_PYTHON` to that historical environment's Python, `TRACE_GRAPH_ISOLATED=true`, `OPENAI_API_KEY`, and explicit `TRACE_GRAPHITI_MODEL`, `TRACE_GRAPHITI_EMBEDDER`, `TRACE_GRAPHITI_RERANKER`. Then run `node tools/trace-temporal/run.mjs --neo4j-reference --live --output-dir .axi/neo4j-live-reference-replay`. Do not put credentials in evidence files. Only loopback Bolt is permitted in this reference lane. The runner resets its digest-scoped fixture group before extraction, leaves other groups alone, and disables donor telemetry. Run it only against an owned disposable fixture database.

This historical Neo4j model path has not been executed with a model. #1737 supplies the accepted forward semantic outcome; #1668 is reconciled by an append-only migration disposition, never a retroactive Neo4j inference claim. Pinning the top-level donor does not lock all transitive Python dependencies; the accepted Falkor receipt records its resolved environment.

## Contract limits

- Supply `admittedSelection` from a trusted admission step. A donor projection cannot supply its own rights, source or time authority. The adapter verifies selected bytes and identities against the normalized report; source-artifact references and rights grants still require caller-owned authority.
- `effectiveAt`, original source/observation/recording time, correction time, materialization time and query knowledge frontier are separate. Unknown fact validity is excluded. Later interval termination has separate known time and support, so it cannot rewrite earlier knowledge views.
- Every visible artifact retains a permitted support manifest with record, source and normalized digest/Profile/version. Revoked support is excluded at query time even if physical graph state remains. Allow/deny inputs must come from current rights authority, not the projection itself.
- Entities and facts are unresolved donor interpretations. Conflicting claims are preserved. No source Observation or independent witness is minted from an interpretation.
- One source digest remains one lineage across all projections. Summing lineage counts from several views would be invalid.
- Live extraction conservatively attributes each result to all earlier selected context. This sacrifices coverage when any support is revoked rather than allowing hidden context to affect permitted output.
- Recorded accepted-output replay is deterministic. Fresh model extraction and a donor rebuild can change UUIDs and inferred claims. Neither is certified as production memory.
- Python is an internal runtime bridge invoked after the Node admission boundary. Its output is admitted again before being exposed. It is not a general ingestion endpoint.

## Verification

`pnpm exec vitest run packages/projection-adapters/src/lib/graphiti-trace.spec.ts`

`python3 -m unittest discover -s tools/trace-temporal -p 'test_*.py'`

No model provider is required for either check.
