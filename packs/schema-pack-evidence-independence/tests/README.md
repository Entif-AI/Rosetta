# Qualification

Run the repository Pack conformance target and the focused schema package behavioral tests:

```sh
pnpm exec nx run pack-conformance:conformance --skip-nx-cache
pnpm exec nx run pack-conformance:test --skip-nx-cache
pnpm exec vitest run packages/rosetta-schemas/src/lib/evidence-independence.spec.ts
```

These fixtures cover the proposed contract, not the authenticity of a source or evidence issuer. The schema mirror must equal the executable exported schema. A malformed, contradicted or incomplete assessment may not acquire independence from metadata alone.

This is a schema-only governed extension, not a Core Tile Profile. The empty manifest `profiles` array intentionally makes no Core Profile descent claim. The Pack test target executes the declared example using both the Draft 2020-12 instance validator and the semantic parser and rejects fabricated lineage and authority injection. Full Pack admission and independent issuer verification remain separate.
