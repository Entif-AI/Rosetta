---
id: entif:trace-kin
task: T1669
status: done
depends: [trace-graph]
awaits: []
specs:
  - specs/architecture.md
issues: [1669, 1664, 1558, 1567]
pr: 1725
---
# Measure trace kinematics and conservative representation shrinkage

Compute deterministic per-snapshot/window morphology over TRACE-NORM and prove equivalent lifecycle queries through Neo4j. Emit size/count/delta/duplicate/survival/disappearance/reappearance metrics. `trace-kin-v1` may label observable representation shrink and a conservative compaction candidate, but never model/provider internal memory state.

## Validation

- [x] Golden metrics exist for every represented snapshot/window.
- [x] Raw/normalized sizes, record/object counts, unique IDs, five delta counts, and duplicate counts are literal-tested.
- [x] Survival, disappearance, and reappearance are reproducible.
- [x] `representation_shrink` requires advancing source sequence, lower object count, lower normalized bytes, and removals.
- [x] `compaction_candidate` additionally requires surviving prior objects and no explicit reset/new-run boundary.
- [x] Explicit reset case does not become a compaction candidate.
- [x] Pre/post transition subgraph inspection is reproducible.
- [x] Output records source/normalization/profile/version refs and contains the epistemic caveat.

## External authorities

- docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md
