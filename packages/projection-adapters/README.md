# projection-adapters

## Purpose

Exposes constitutional artifacts to external sidecars and shells without giving them ownership of meaning.

## Working Today

- builds read-only OB1 sidecar projections
- builds Prism shadow-memory projections
- builds Mission Control operator-shell projections
- preserves `mutable: false` across all three projection types

## Fixture Status

- executable as projection-contract generation
- not yet connected to live OB1, Prism, or Mission Control runtimes

## Not Yet

- transport layers
- synchronization with external runtimes
- round-trip integration testing against real sidecars

## Roadmap

- connect these projection contracts to actual sidecar/shell integrations after the refinery and cache mature

## Active agent-trace FalkorDB V0 proof (#1735/#1736/#1737)

`buildTraceProjection` consumes canonical source/TRACE-NORM directly through the
provider-neutral `trace.projection.v1` contract. Official JS Falkor client 6.8.0
imports, inspects and rebuilds the operational graph on pinned FalkorDB 6.0.1.
Direct Cypher, exact closure parity, repeat import, scoped reset, foreign-edge
refusal and source/store independence are proven by the active fixture harness.
Independent kinematics re-proof retains the same morphology criteria and results.

Build the normal dependencies, start the owned loopback fixture and write fresh
replay evidence:

```sh
NX_DAEMON=false pnpm exec nx run-many -t build -p source-substrate,ingress-refinery,projection-adapters,rosetta-store
docker compose -f tools/trace-graph/docker-compose.yaml up -d
TRACE_GRAPH_ISOLATED=true node tools/trace-graph/prove-falkordb.mjs --output .axi/falkor-operational-replay.json
TRACE_GRAPH_ISOLATED=true node tools/trace-graph/prove-kinematics-falkordb.mjs --output .axi/falkor-kinematics-replay.json
docker compose -f tools/trace-graph/docker-compose.yaml down
```

Existing output paths are refused before fixture mutation. See
[trace-graph guidance](../../tools/trace-graph/README.md) for ownership/runtime pins
and immutable historical receipts. No Neo4j service is needed for ordinary V0.
The `neo4j-driver` dependency remains necessary for preserved reference exports;
the reference harness is optional and is never migration input.

Selected Graphiti interpretation uses unchanged first-party FalkorDriver on a
separate pinned FalkorDB 4.20.7 fixture. Its accepted disposition is
`V0_VERSION_SPLIT_ACCEPTED_PENDING_UPSTREAM_COMPATIBILITY`; see
[temporal guidance](../../tools/trace-temporal/README.md). Source, deterministic
structure and interpretation remain distinct. All paths remain fixture-backed;
SSPL public-service review and G15/#361/#1222 promotion are separate gates.

## Historical Neo4j reference proof (#1667)

`planAgentTraceProjection` consumes verified TRACE-NORM output, checks its canonical
content and blob integrity, and emits scoped deterministic nodes/edges. Every item
binds source/normalization digests, source manifestation, receipt and projection
Profile. Nodes cover source artifacts, normalized view, run/window/turn, event
occurrences, request/result references, snapshots, object identities/versions and
content blobs. Snapshot duplicates remain occurrence edges with source ordinal.

`SOURCE_PARENT`, membership and request/result relations use explicit source fields.
`PREVIOUS_SNAPSHOT`, lifecycle sets, content addressing and view lineage are declared
derived conveniences. No edge type means causality, truth or permission. Event
JSON and separate source/observed/recorded properties preserve time roles. Graph
currency means current only for the pinned source and transformation frontier.
Unresolved/ambiguous parent references are reported instead of guessed.

`importAgentTraceProjection` uses composite node/relationship uniqueness constraints
and parameterized MERGE in a transaction. Re-import keeps the same closure.
Rebuild/reset delete only owned edges between owned nodes, then use ordinary node
DELETE. A foreign relationship blocks deletion and rolls back the transaction,
preserving both graph histories. Dropping the projection leaves source artifacts
and raw bytes intact; rosetta-store remains the canonical tile-store surface.

The native HTTP client accepts only credential-free loopback HTTP origins, refuses
redirects, limits requests/responses to 2 MB and transactions to 64 statements,
times out at 10 seconds and checks both HTTP status and Neo4j transaction errors.
`agentTraceNeighborhoodQuery` returns at most 100 incident edge rows for one event.
This integration writes to an ephemeral fixture database. It does not implement
#994 production admission, live ingestion, Graphiti, salience or private graph policy.

Reproduce with Node from `.nvmrc` and pnpm:

```sh
pnpm exec nx run projection-adapters:build
docker compose -f tools/trace-graph/docker-compose.neo4j-reference.yaml up -d
# Wait for Neo4j HTTP readiness, then import and leave the graph inspectable:
node tools/trace-graph/prove-agent-trace.mjs --rebuild
# Real database import/reimport/rebuild, bounded query and rollback proof:
AKASHA_NEO4J_ENDPOINT=http://127.0.0.1:17474 pnpm exec nx run projection-adapters:test
node tools/trace-graph/prove-agent-trace.mjs --reset
docker compose -f tools/trace-graph/docker-compose.neo4j-reference.yaml down
```

The proof script prints exact Cypher statements and bounded result rows for version,
node/edge counts, snapshot counts, source lineage and object lifecycle. The default
unit suite skips the database test unless `AKASHA_NEO4J_ENDPOINT` is set; a skipped
database test is not graph-backed acceptance evidence. Use the explicit environment
above and an isolated disposable development database.

## Observable trace kinematics (#1669)

`analyzeAgentTraceKinematics(normalized, sourceBytes)` verifies source bytes and
normalization/receipt/source-tile integrity, then emits a deterministic report bound
to source, normalizer, projection and kinematics versions/digests. Per-snapshot
metrics include source and normalized structural bytes, cumulative scoped record
count, occurrence/unique-object/duplicate counts and add/change/remove/unchanged
counts. Window totals, shared blob dictionary bytes and total materialization bytes
have explicit accounting; local record/snapshot sizes exclude shared dictionaries
and delimiter bytes. These measures do not claim net compression.

Object motion tracks uninterrupted survival, disappearance and reappearance within
each run/window. Signature reports count exact repeated canonical payloads,
request/result references and object values (including named tool-shaped values).
Repeated references/deliveries do not prove repeated requests or tool executions.
They do not create additional independent witnesses.

`representationShrink` means occurrence count decreased across a supported snapshot
transition. `compactionCandidate` requires fewer unique visible objects and at least
one removed ID within that uninterrupted scope. This is a conservative observation
of client-visible morphology, not provider/model internal memory, deletion, recall
or causal behavior. Malformed snapshot gaps never create continuity evidence.

The golden fixture shrinks at snapshot 3: occurrences 4 -> 1, unique IDs 3 -> 1,
with tool/result IDs removed. The tool-shaped object returns at snapshot 4; the
context object survives all three transitions. Two events share the same canonical
payload. `agentTraceTransitionQuery` inspects the pre/post graph neighborhood with
at most 100 rows. The proof script includes metrics and direct transition rows in
`tools/trace-graph/golden-proof.json`; no model is invoked.
