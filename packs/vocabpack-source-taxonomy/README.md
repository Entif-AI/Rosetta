# Source Taxonomy Vocabulary Pack

This draft VocabPack provides a controlled public starter vocabulary for source tiers and classes used by the source substrate. It depends on the Source Substrate Standard Pack. The declared version, dependencies, and export are in [pack.json](pack.json).

## Vocabulary and usage

The exported [Turtle vocabulary](vocab/source-taxonomy.ttl) distinguishes infrastructure, repository, volatility, tier, and trust concepts. [Tiering and trust](examples/tiering-and-trust.md) gives the intended reading: tier position is not evidence of truth, authorship, or integrity on its own.

From the repository root, run `pnpm run packs:conformance` to check the manifest, content ID, dependency graph and exported path. There is no JSON Schema export in this Pack. See [tests/README.md](tests/README.md) for current coverage limitations.

## Status

This is **draft vocabulary**, with no release certification or standalone SKOS/SHACL conformance claim. The release blockers are listed in [acceptance.md](acceptance.md); draft history is in [CHANGELOG.md](CHANGELOG.md).
