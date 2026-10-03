# ingress-refinery

## Purpose

Turns source-aware inputs into canonical artifacts plus linked provenance receipts.

## Working Today

- creates parse-only ingress jobs
- normalizes supplied text
- generates fetch, normalization, and evaluation receipts
- builds canonical artifacts with PID, rights, and dedupe metadata
- threads bounded listing-snapshot package lineage through episodes, receipts, and canonical-artifact provenance
- provides a narrow GitHub text acquisition API for pinned markdown/plain-text blobs using injected fixture/local/live payloads
- emits a bootstrap demo snapshot stitching the whole flow together

## Fixture Status

- the mechanics are executable
- the current GitHub adapter boundary is executable with deterministic supplied payloads
- network-backed upstream fetch clients remain outside this package for now

## Not Yet

- built-in network fetch clients for upstream APIs
- HTML/PDF/document parsing
- durable job orchestration
- revision and correction polling against real sources

## Roadmap

- replace bootstrap inputs with real source adapters while preserving the existing contract surface

## Agent-stream structural normalization (#1666)

`normalizeAgentStreamSource(manifest, bytes)` verifies the synthetic source fixture
through source-substrate and emits an attributable structural view plus an existing
`source.normalization_receipt`. `normalizeAgentStreamRecords(bytes)` provides the
same bounded transformation without a source-identity or admission claim.

Profile `agent-stream-structural@1.0.0` uses the shared RFC 8785 canonicalizer.
Input limits are 1,000,000 bytes, 100,000 bytes per NDJSON line, and 10,000 records.
Only identical run/window/recorded metadata is hoisted. Payloads of at least 64
canonical bytes and snapshot object values are content-addressed. Snapshot deltas
are computed separately per run/window; duplicate occurrences retain exact order
and extra fields. Malformed or conflicting snapshots remain opaque and break the
state-delta chain. Repeated event identities are reported; reconstruction binds
snapshots to source line occurrences rather than ambiguous event identifiers.

Source-provided parent/request/result identifiers and time roles stay in the
record data. Sequence and timestamps confer no causality. Unknown event types and
opaque fields remain available and are named in the loss report. No transport
fields are omitted. JSON whitespace/property order and duplicate-property parsing
are declared canonicalization losses; original bytes remain authoritative.
`reconstructAgentStreamRecords` verifies referenced blob digests and reconstructs
parsed source objects, including duplicate snapshot occurrence order.

The pinned fixture's normalized SHA-256 is
`28b7ba996ac875dcf6b6128064aab93de21375cf9dae5a755a024c7160606f19`.
Materialization reports actual source/output byte counts and net byte delta.
This small fixture may grow after provenance and delta metadata; structural
redundancy removal is not a claim of net compression. This path calls no model,
infers no semantic state, performs no live capture, and replaces no source artifact.

Downstream projections use `verifyAgentStreamNormalizationContent` to check the
bound canonical view, normalization receipt, source tile integrity/identity links
and referenced blob bytes before reuse. This verifies preserved view content;
source admission remains with source-substrate and the pinned source bytes.
