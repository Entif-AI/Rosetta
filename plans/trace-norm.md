---
id: entif:trace-norm
task: T1666
status: planned
depends: [trace-src, jcs-001]
awaits: []
specs:
  - specs/architecture.md
issues: [1666, 1664, 1558, 1567]
pr:
---
# Normalize trace structure, deltas, duplicate refs, and loss report

Implement the model-free `trace.normalization.v1` derived-artifact/Profile contract and deterministic parser. Use the repaired shared JCS serializer. Hoist only provably invariant scope metadata, externalize exact duplicate large payloads by content reference, preserve explicit parent/request/result identity, emit added/changed/removed/repeated/unchanged deltas, keep temporal roles separate, and emit an exhaustive loss/reduction report.

## Validation

- [ ] Captured-derived fixture parses without model/network use.
- [ ] Generated edge fixture exercises all five delta dispositions.
- [ ] Malformed/unknown fields are preserved in bounded unknown/loss output rather than inferred.
- [ ] Exact duplicates share payload refs without semantic deduplication.
- [ ] Parent/request/result refs survive exactly after fixture id remapping.
- [ ] Event/effective, observation, and recorded/materialized time roles do not collapse.
- [ ] Timestamp/source order alone never emits causality.
- [ ] Two independent runs produce byte-identical normalized output and digest.
- [ ] Changing the normalizer profile/version changes materialized-view identity.

## External authorities

- docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md
