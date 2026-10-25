# Source Substrate Standard Pack

This draft StdPack describes public source-system and source-artifact representations: systems, records, manifestations, packages, trust properties, and correction histories. See [pack.json](pack.json) for its exact Core compatibility, dependency on RRP, and exported assets.

## Exports and use

The Pack exports [source substrate JSON Schema](schema/source-substrate.schema.json), [SHACL](shacl/source-substrate.shacl.ttl), and [source substrate vocabulary](vocab/source-substrate.ttl). The [bootstrap example](examples/source-registry-bootstrap.md) distinguishes infrastructure authorities from concrete repository hosts.

From the repository root, run `pnpm run packs:conformance` for manifest, Pack identity, paths, schema shape, and dependencies. The tests documented in [tests/README.md](tests/README.md) cover related packages; that document is not itself proof that every scenario is executed as a standalone Pack vector.

## Status

The Pack remains **draft**. It does not assert that a source's tier proves truth or trustworthiness. [Acceptance criteria](acceptance.md) separate existing conformance from release requirements; [CHANGELOG.md](CHANGELOG.md) describes the draft baseline.
