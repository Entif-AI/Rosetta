# Pack manifest validation

`validate-packs.mjs` is the current local Pack-root conformance checker. It first validates each discovered `packs/*/pack.json` against the repository's [`pack-manifest.schema.json`](../../packs/_schemas/pack-manifest.schema.json). An invalid or unreadable manifest produces a typed `manifest-schema-invalid` or `manifest-json-invalid` error before the checker computes its Pack ID, reads declared paths/Profiles, or claims dependency-graph validity. Valid manifests then receive the existing `rosetta-pack-id-v1` integrity, declared asset/Profile and local DocID/dependency checks.

The JSON Schema defines the machine-recognized keys. `$schema` is an allowed local metadata field. `compatible_core` and `depends_on` remain required per [ROCK-3111-C](../../docs/RFCs/ROCK-3111-C-RRP-Pack-Filesystem-Contract-v0.2.0.md). Historical examples containing `primary_schema` or `primary_bundle_schema` do not expand the current JSON Schema. Invalid manifests must be corrected or migrated explicitly.

Run `pnpm exec nx run pack-conformance:test` for the focused negative vectors and `pnpm run packs:conformance` for current workspace roots. The conformance command verifies declared Pack structure and identity. It does **not** by itself provide a complete release decision, execute every Pack example and test vector, prove cryptographic signatures, admit an installation, or authorize a registry/promotion change.

The composed Pack release gate, bootstrap workspace proof, deterministic release report, CI integration, and any later admission/write workflow remain owned by [#790](https://github.com/Entif-AI/Rosetta/issues/790) and its downstream accepted work. This first step has no new Core semantics or Pack-ID algorithm.
