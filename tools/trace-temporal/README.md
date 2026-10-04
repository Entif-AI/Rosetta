# Selected temporal interpretation experiment

Issue #1668. This is a public adapter boundary for selected `trace.normalization.v1` records. Source evidence, deterministic operational projection and Graphiti interpretation remain separate. No private selection or attention policy is implemented.

Build `projection-adapters`, then run `node tools/trace-temporal/run.mjs`. The default is model-off. The script validates normalized evidence, explicitly selects three synthetic records, bounds the serialized selection, invokes Python and validates the resulting projection against the independently admitted selection. The schema files are generated from the adapter's exported schema constants.

The checked-in output is a **degraded-path proof**, not Graphiti ingestion. `--live` was attempted with no provider credentials or explicit models available; no model call or graph write occurred. Source and normalization remain intact. The pure wrapper fixtures prove admission, rights fencing, distinct temporal coordinates, ordered/historical inspection, explicit supersession, ambiguous identities, contradictions, duplicate lineage and accepted-output replay. They do not prove donor inference or physical graph reset/rebuild.

## Optional runtime

Use Python >=3.10,<4 in a disposable environment and install `requirements.txt`. Donor `graphiti-core==0.30.2` corresponds to upstream commit `eaa4128681bc53487138a4bbc22d58336ebe70d2`, Apache-2.0. API mappings were inspected at that exact commit. Start the isolated, checksum-pinned Neo4j 5.26.0 fixture with `tools/trace-graph/start-neo4j.sh`.

Set `TRACE_GRAPHITI_PYTHON` to that environment's Python, `TRACE_GRAPH_ISOLATED=true`, `OPENAI_API_KEY`, and explicit `TRACE_GRAPHITI_MODEL`, `TRACE_GRAPHITI_EMBEDDER`, `TRACE_GRAPHITI_RERANKER`. Then run `node tools/trace-temporal/run.mjs --live`. Do not put credentials in evidence files. Only loopback Bolt is permitted. The runner resets its digest-scoped fixture group before extraction, leaves other groups alone, and disables donor telemetry. Run it only against an owned disposable fixture database.

The live path is provided for continuation and has not been executed with a model. It must pass real extraction, current/history queries, revocation, a namespace sentinel and reset/rebuild acceptance before #1668 is complete. Pinning the top-level donor does not lock all transitive Python dependencies; record the resolved environment when running the proof.

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
