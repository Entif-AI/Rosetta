# TRACE-LIVE source-adapter slice

#1685 independent adapter and fixture proof. The current tree has no executable
#1673 tunnel, #1674 MCP lifecycle or #1676 Mac navigation producer. Those owners
depend on #1688 donor verification/extraction. #1689 capture remains optional and
is not implemented here. This slice adds no capture stack or Core kind.

The boundary composes existing source-substrate records, manifestations, packages
and `journal-log` episodes, ingress-refinery TRACE-NORM, and trace projection.
Source bytes remain authoritative. Normalization and FalkorDB are derived and
rebuildable. `recorded-live` is a supplier declaration, never E2E acceptance.

Input is bounded UTF-8 JSONL: at most 4 MiB, 1,000 nonempty event lines and 64 KiB
per physical line. Every admitted event declares `family`, `eventType`, `eventId`,
`producerId` and `producerVersion`:

| Family | Event types |
| --- | --- |
| `tunnel` | `tunnel-health` |
| `mcp` | `user-request`, `mcp-request`, `tool-call`, `mcp-result`, `receipt` |
| `device` | `device-action`, `device-observation` |

Optional `observedAt` is a canonical ISO UTC instant. `correlation` may contain
`run`, `session`, `conversation`, `request`, `operation`, `tool` and `receipt`.
Each missing or invalid reference is explicitly unresolved. No missing run is
joined to another unscoped event. Correlation and producer/version identities use
domain-separated SHA-256 refs, preserving equality across families without copying
private identities. These refs are not anonymization guarantees or authorization.
Raw identities remain in local evidence. First admitted source time becomes
2000-01-01T00:00:00Z; subsequent source intervals are preserved and explicitly
marked relative-redacted. Caller-supplied recorded time remains separate.

`trace-live-source-v1` is a disclosure allowlist. Arbitrary strings, URLs, paths,
headers, cookies, auth material and unknown nested fields never enter the derived
SSE or TRACE-NORM. Only declared status/operation/error enums, `matched`, and
nonnegative latency/retry counters survive from `payload`. Exact canonical raw
payloads of at least 256 bytes are stored once by content hash in the local spool;
the derivative carries a ref, size and `local-private` access marker. It never
copies or automatically resolves the raw blob. The existing TRACE-NORM dictionary
may independently externalize safe derived content for reconstruction.

Exact repeated events are reduced to one normalized event plus occurrence/byte
counts. Reusing the same producer/version/event identity with different evidence
fails admission. Re-ingesting identical bytes with the same recorded time and
maturity produces identical source CIDs and normalized/projection digests.
Malformed/unsupported material stays in the original local source, with bounded
omission reasons and byte counts; no raw error fragment is echoed.

```sh
NX_DAEMON=false pnpm exec nx run-many -t build -p source-substrate,ingress-refinery,projection-adapters,rosetta-store
node tools/trace-live/run.mjs --input tools/trace-live/fixtures/correlated-action.jsonl --output-dir .axi/live-admission-1 --recorded-at 2000-01-01T00:00:00.000Z --maturity fixture
node tools/compute/run.mjs run --job akasha.live-fixture.prove --output .axi/live-ultra-proof-1
```

The offline adapter writes a fresh ignored folder, with exact JSONL and canonical
raw payloads under `local-source/`, separate `derived.sse`, source lineage,
`normalization.json` and `reduction.json`. Files are exclusive/private and source
input is never overwritten. Ordinary raw capture stays on its source workstation.
Send only screened derived evidence to a remote host. The allowlisted Ultra job
uses the checked-in **synthetic fixture**, never a caller's raw live spool.

Reduction reports count raw/retained/omitted/duplicate events and bytes, unselected
payload bytes, externalized occurrence bytes and unique blob bytes, omitted fields,
unresolved refs and exact occurrence counts. Omitted event bytes include framing;
omitted payload bytes measure canonical raw payload bytes absent from safe inline
fields. The byte measures overlap and are not an additive partition. Normalized
bytes include reconstruction/lineage overhead and can exceed raw bytes. No token
or model-cost saving is inferred from these deterministic measurements.

The Ultra proof verifies direct Cypher record/request/result joins, exact closure
readback, repeated import, isolated reset/rebuild, source preservation and owned
graph drop against the existing 6.0.1 operational service. It refuses an existing
`entif_trace_1685` graph. Fixture stages join the complete requested action chain;
`liveSourceAcceptance` and `endToEndAcceptance` remain false.

Next handoff: #1688 verifies/extracts donor producers; #1673/#1674/#1676 emit this
bounded envelope with real request/action/postcondition/result/receipt identities.
Run one genuine live source admission locally, then independently prove a screened
derived-only graph import on the Ultra. Rights/custody/deployment and selected
Graphiti interpretation remain separate acceptance obligations.
