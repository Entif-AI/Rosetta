---
id: entif:trace-kin
task: T1669
status: planned
depends: [trace-graph]
awaits: []
specs:
  - specs/architecture.md
issues: [1669, 1664, 1558, 1567]
pr:
---
# Measure trace kinematics and conservative representation shrinkage

Compute deterministic per-snapshot/window morphology over TRACE-NORM and prove equivalent lifecycle queries through Neo4j. Emit size/count/delta/duplicate/survival/disappearance/reappearance metrics. `trace-kin-v1` may label observable representation shrink and a conservative compaction candidate, but never model/provider internal memory state.

## Validation

- [ ] Golden metrics exist for every represented snapshot/window.
- [ ] Raw/normalized sizes, record/object counts, unique IDs, five delta counts, and duplicate counts are literal-tested.
- [ ] Survival, disappearance, and reappearance are reproducible.
- [ ] `representation_shrink` requires advancing source sequence, lower object count, lower normalized bytes, and removals.
- [ ] `compaction_candidate` additionally requires surviving prior objects and no explicit reset/new-run boundary.
- [ ] Explicit reset case does not become a compaction candidate.
- [ ] Pre/post transition subgraph inspection is reproducible.
- [ ] Output records source/normalization/profile/version refs and contains the epistemic caveat.

## External authorities

- docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md
