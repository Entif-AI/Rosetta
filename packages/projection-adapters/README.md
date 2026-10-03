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

## Agent-trace Neo4j development proof (#1667)

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
docker compose -f tools/trace-graph/docker-compose.yaml up -d
# Wait for Neo4j HTTP readiness, then import and leave the graph inspectable:
node tools/trace-graph/prove-agent-trace.mjs --rebuild
# Real database import/reimport/rebuild, bounded query and rollback proof:
AKASHA_NEO4J_ENDPOINT=http://127.0.0.1:17474 pnpm exec nx run projection-adapters:test
node tools/trace-graph/prove-agent-trace.mjs --reset
docker compose -f tools/trace-graph/docker-compose.yaml down
```

The proof script prints exact Cypher statements and bounded result rows for version,
node/edge counts, snapshot counts, source lineage and object lifecycle. The default
unit suite skips the database test unless `AKASHA_NEO4J_ENDPOINT` is set; a skipped
database test is not graph-backed acceptance evidence. Use the explicit environment
above and an isolated disposable development database.
