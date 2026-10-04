---
id: entif:trace-temp
task: T1668
status: blocked
depends: [trace-graph]
awaits:
  - live-graphiti-credentials-and-model-configuration
specs:
  - specs/architecture.md
issues: [1668, 1664, 1558, 1567]
pr: 1732
---
# Bridge selected normalized episodes into Graphiti temporal semantics

The public selected-episode adapter and deterministic adversarial wrapper are implemented on PR #1732. Live donor inference remains blocked by absent credentials/model configuration. Consume selected TRACE-NORM episodes. Preserve machine-distinguishable source evidence, deterministic operational structure, and Graphiti-derived interpretation.

## Validation

- [x] Graphiti and Neo4j compatibility revisions are pinned before code change.
- [x] Selected normalized episodes, not the raw firehose, are the adapter input.
- [ ] Every Graphiti-derived artifact resolves to normalized/source evidence refs.
- [ ] Model/provider/config identity is recorded for inferred semantics.
- [ ] Temporal update/invalidation leaves prior state inspectable.
- [ ] Drop/rebuild loses no canonical source evidence.

## External authorities

- docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md

## Checkpoint evidence

The wrapper enforces independently admitted selection, provenance, rights fencing, separate invalidation knowledge time, bounded inspection support and one-source lineage. Eighteen focused tests and the model-off Python boundary are locally verifiable. The live Graphiti path, full ten-case donor matrix and physical semantic drop/rebuild remain unverified. See tools/trace-temporal/README.md. Implementation on an unmerged branch is not integrated acceptance.
