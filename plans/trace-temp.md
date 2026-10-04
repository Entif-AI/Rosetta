---
id: entif:trace-temp
task: T1668
status: planned
depends: [trace-graph]
awaits:
  - separate-run-capacity-and-pinned-graphiti-runtime
specs:
  - specs/architecture.md
issues: [1668, 1664, 1558, 1567]
pr:
---
# Bridge selected normalized episodes into Graphiti temporal semantics

Deferred from the first deterministic implementation run. In a separate run, pin Graphiti and its model/embedder configuration and consume selected TRACE-NORM episodes. Preserve machine-distinguishable source evidence, deterministic operational structure, and Graphiti-derived interpretation.

## Validation

- [ ] Graphiti and Neo4j compatibility revisions are pinned before code change.
- [ ] Selected normalized episodes, not the raw firehose, are the adapter input.
- [ ] Every Graphiti-derived artifact resolves to normalized/source evidence refs.
- [ ] Model/provider/config identity is recorded for inferred semantics.
- [ ] Temporal update/invalidation leaves prior state inspectable.
- [ ] Drop/rebuild loses no canonical source evidence.

## External authorities

- docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md
