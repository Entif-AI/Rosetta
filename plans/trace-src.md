---
id: entif:trace-src
task: T1665
status: done
depends: [jcs-001]
awaits: []
specs:
  - specs/architecture.md
issues: [1665, 1664]
pr: 1725
---
# Establish immutable rights-safe TRACE-SRC fixture

Create the source-preserving TRACE-SRC fixture from an authorized captured ChatGPT SSE stream using Outcome B: preserve the private original by source identity/digest and derive a deterministic rights-safe structural fixture with a versioned redaction/substitution manifest. Reuse `SourceFamily = chat-transcript`; keep source record, original manifestation, derived fixture manifestation, package/window, and episode distinct.

## Validation

- [x] Private source bytes remain unchanged and are never committed publicly.
- [x] Source metadata and raw digest are recorded in protected/durable provenance.
- [x] Same bounded source bytes plus `trace-src-redaction-v1` produce byte-identical fixture output.
- [x] Deterministic first-seen ordinal remapping preserves equality/parentage.
- [x] Secret scanner proves no resume/JWT/bearer token, raw message text, attachment id/name, private URL/host, or original conversation/request/turn/message identifier survives.
- [x] Public fixture declares itself a derived redacted manifestation, not pristine source evidence.
- [x] Fixture path runs offline without a model call.

## External authorities

- docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md
