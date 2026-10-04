# Deterministic trace development proof

Work tracked in #1693, #1665, #1666, #1667 and #1669. Public fixtures contain structural substitutions only. Private input and derivation receipts stay outside the checkout. No model/provider calls occur.

Build packages with `NX_DAEMON=false pnpm exec nx run-many -t build -p source-substrate,ingress-refinery,projection-adapters`.

- `node tools/trace-graph/derive-source.mjs PRIVATE_INPUT PRIVATE_RECEIPT` reproduces the public captured derivative using a separately held private original. Both private paths must be outside the repository.
- `node tools/trace-graph/generate-edges.mjs` regenerates the separately labeled synthetic six-snapshot fixture.
- `node tools/trace-graph/normalize-fixtures.mjs` regenerates both normalized reports and their schema.
- `JAVA_HOME=... TRACE_NEO4J_ROOT=/new/task/local/path tools/trace-graph/start-neo4j.sh` runs checksum-pinned Neo4j Community 5.26.0 with Java 21 in the foreground, bound only to loopback fixture ports. Keep that process running while proving. The fixture password is disposable development configuration.
- `TRACE_GRAPH_ISOLATED=true NX_DAEMON=false pnpm exec nx run trace-graph:prove` checks a real database and regenerates evidence/neo4j-proof.json. It defaults to bolt://127.0.0.1:17687. TRACE_NEO4J_URI and TRACE_NEO4J_PASSWORD can override the development fixture endpoint/credential. Only loopback endpoints are accepted. The explicit isolated declaration asserts ownership before scoped fixture resets.

Direct inspection queries are in cypher/. Proven snapshots/records retain physical source sequence, not causality. Exported graph closure is reconstructed from Rosetta-owned normalized artifacts. Removing this database does not remove source/canonical artifacts or change rosetta-store. Graphiti and parent acceptance remain separate work.
