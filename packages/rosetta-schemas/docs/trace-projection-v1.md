# trace.projection.v1

Rosetta-owned derived projection exchange Profile for #1667. It consumes validated trace.normalization.v1 and an existing source-manifestation CID. It adds no Core kind and grants no rights. Neo4j is a disposable development adapter; source/canonical artifacts and rosetta-store retain their authority independently.

The nine exported node labels and sixteen relationship types are declared in TRACE_PROJECTION_SCHEMA. Stable identities include projectionId, family and escaped source identities. All nodes and edges carry projectionId, sourceDigest and normalizedDigest. Canonical closureDigest binds the entire sorted exchange artifact excluding itself. Scalar properties exclude null; structured evidence is retained as canonical JSON strings. parseTraceProjection checks shape, digest, identities, endpoints and provenance.

Only explicit source mechanics are projected: run/window membership, materialization, parent IDs, request IDs, content references and snapshot membership. Under the captured-client profile, a finished tool message's explicit request_id is also recorded as resultForRef; correlation denotes a shared request identifier, not execution causality or proof of the invoking assistant message. Reference-only stubs retain external parent/request identities without inventing observations. Source order and timestamps never become causal edges.

TraceTransition directly exposes added, changed, removed, repeated and unchanged dispositions. FROM/TO refer to normalized snapshot predecessors. Snapshot CONTAINS relationships preserve canonical object state. DERIVED_FROM binds normalized trace to the distinct source manifestation. Generated evidence remains labeled generated-fixture.

Neo4j import uses parameterized properties and fixed whitelisted labels/types. Constraints cover every node label; source CID/payload hash uniqueness is scoped by projectionId, so reset cannot remove another namespace's shared evidence. Re-import is idempotent for the same immutable exchange. Use a new projectionId for a changed artifact. Reset requires a nonempty declared projectionId and deletes only that scope.

Checked-in Cypher proves membership, parentage, correlation, five lifecycle dispositions, lineage and bounded record/object neighborhoods. The real-runtime proof compares exported closure to the pure adapter, re-imports, checks a second namespace survives reset, rebuilds and repeats query literals/digest checks. This is fixture-backed development capability, not production retention, policy, model interpretation or Neo4j semantic authority.
