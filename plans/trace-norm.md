---
id: entif:trace-norm
task: T1666
status: done
depends: [trace-src, jcs-001]
awaits: []
specs:
  - specs/architecture.md
issues: [1666, 1664, 1558, 1567]
pr: 1725
---
# Normalize trace structure, deltas, duplicate refs, and loss report

Implement the model-free `trace.normalization.v1` derived-artifact/Profile contract and deterministic parser. Use the repaired shared JCS serializer. Hoist only provably invariant scope metadata, externalize exact duplicate large payloads by content reference, preserve explicit parent/request/result identity, emit added/changed/removed/repeated/unchanged deltas, keep temporal roles separate, and emit an exhaustive loss/reduction report.

## Validation

- [x] Captured-derived fixture parses without model/network use.
- [x] Generated edge fixture exercises all five delta dispositions.
- [x] Malformed/unknown fields are preserved in bounded unknown/loss output rather than inferred.
- [x] Exact duplicates share payload refs without semantic deduplication.
- [x] Parent/request/result refs survive exactly after fixture id remapping.
- [x] Event/effective, observation, and recorded/materialized time roles do not collapse.
- [x] Timestamp/source order alone never emits causality.
- [x] Two independent runs produce byte-identical normalized output and digest.
- [x] Changing the normalizer profile/version changes materialized-view identity.

## External authorities

- docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md
