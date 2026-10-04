# Deterministic trace development proof

The active local operational graph path is FalkorDB under #1734/#1735. Source evidence and TRACE-NORM retain authority; trace.projection.v1 stays provider-neutral. No Neo4j database contents are migration input. Public fixtures contain structural substitutions only; no model/provider calls occur.

Build with `NX_DAEMON=false pnpm exec nx run-many -t build -p source-substrate,ingress-refinery,projection-adapters,rosetta-store`.

1. Start the disposable loopback runtime: `docker compose -f tools/trace-graph/docker-compose.yaml up -d`.
2. Run `TRACE_GRAPH_ISOLATED=true NX_DAEMON=false pnpm exec nx run trace-graph:prove`.
3. Stop the owned runtime: `docker compose -f tools/trace-graph/docker-compose.yaml down`.

The pinned image is `falkordb/falkordb:6.0.1@sha256:e2765e207e5ba4ee90e47ed31eb7491ad6dd3d42241c326e429375c02ad9882f`; the official `falkordb` client is 6.8.0 over RESP. Only Redis is published, at `127.0.0.1:16379`; no browser port or persistent volume is exposed. The container is `entif-falkor-1735`, graph `entif_trace_1735`. Optional TRACE_FALKORDB_PORT, TRACE_FALKORDB_GRAPH and TRACE_FALKORDB_CONTAINER select an explicitly owned fixture. The proving tool verifies the image and ownership label, drops its named graph, imports both canonical fixtures, and drops that graph again after success. Do not point it at retained data.

New evidence is written to `evidence/falkordb-proof.json`. It includes image/server/client identity, source and implementation digests, all eight unchanged Cypher corpus results, exact closure parity with the historical oracle, repeat-import idempotency, namespace and foreign-edge reset protection, rebuild, operational indexes/constraints, temporal non-causality, and canonical source/store independence after graph drop. Supporting exact-match indexes are verified before constraints; PENDING is never accepted as readiness. Schema polling fails on FAILED or a ten-second readiness timeout; individual queries are bounded at two seconds.

This is local/private fixture proof. FalkorDB SSPLv1 public/network service use and fixture/shadow promotion require explicit review and applicable #361/#1222 gates. Successful fixture parity does not authorize deployment.

Historical #1667/#1669 and PR #1725 evidence remains in `evidence/neo4j-proof.json`, `evidence/batch-validation.json` and `golden-proof.json`, unchanged. The existing Neo4j adapter/profile IDs and startup/query tooling remain a cheap reference lane. `trace-graph:prove-neo4j-reference` replays into ignored local evidence rather than overwriting historical receipts; its runtime uses `docker-compose.neo4j-reference.yaml` or the checksum-pinned `start-neo4j.sh`. Reference proof is optional and is not used to build FalkorDB.

Provider-neutral fixture tools remain:

- `derive-source.mjs PRIVATE_INPUT PRIVATE_RECEIPT` reproduces the public captured derivative; private paths must be outside the repository.
- `generate-edges.mjs` regenerates the synthetic six-snapshot fixture.
- `normalize-fixtures.mjs` regenerates normalized reports/schema.
- `measure.mjs` regenerates deterministic trace-kin-v1 series/schema.

Direct queries in `cypher/` preserve physical source order without promoting it into causality. Morphology and required neighborhoods are included here for parity. Independent TRACE-KIN acceptance (#1736), Graphiti/Falkor semantic proof (#1737), and final catalogs/roadmap/V0 reconciliation (#1738) retain their own acceptance boundaries. Generated S2 is an observable representation-shrink candidate; S4 is a reset; B reappears at S5. These measurements do not establish provider/model internal memory.
