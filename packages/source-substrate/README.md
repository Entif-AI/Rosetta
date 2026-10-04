# source-substrate

## Purpose

Defines the source-aware artifact model used by the repository.

## Working Today

- models source-system profiles, records, manifestations, packages, trust matrices, and correction events
- models bounded acquisition listing snapshots as `source.package` artifacts distinct from source records and manifestations
- publishes a rights-safe, exact-byte synthetic agent-stream NDJSON fixture with an offline manifest verifier
- emits each of those as Rosetta tiles

## Fixture Status

- executable as a modeling layer
- values are currently populated by bootstrap fixtures elsewhere
- bounded listing snapshots preserve scope, pagination/truncation signals, discovered record refs, and replay posture
- `AGENT_STREAM_SOURCE_PROFILE`, `verifyAgentStreamFixture`, and `buildAgentStreamSourceArtifacts` keep stream contract, capture evidence, package/window, and episode separate; the builder rejects tampered source bytes or artifact metadata

## Not Yet

- live identity resolution
- evidence-derived trust scoring
- source-specific lifecycle watchers
- source-event normalization or inferred snapshot deltas; those remain downstream work

## Roadmap

- keep expanding the model as live adapters, corrections, and rights handling become real
