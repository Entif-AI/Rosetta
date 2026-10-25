# Evaluation Profiles Schema Pack

This draft SchemaPack defines public representations for [salience assessment](schema/salience-evaluation.schema.json) and [bounded historical counterfactual evaluation](schema/counterfactual-evaluation.schema.json). Both are Rosetta Core Evaluation Profiles, not private scoring procedures or authority grants. The governing public work is identified by the `source_of_truth` declaration in [pack.json](pack.json) and the schemas' `x-rosetta` metadata.

## Contents and prerequisites

The Pack targets Rosetta Core 3.x and exports two Profile schemas: `salience.evaluation.v1` and `counterfactual.evaluation.v1`. The [standalone example](examples/salience-evaluation.json) is taken from the authored positive salience vector. The [test directory](tests/README.md) describes the nine salience and nine counterfactual vectors, including expected negative cases.

## Validate

From the repository root, run `pnpm run packs:conformance` to check manifest and declared assets. Run `pnpm exec nx run pack-conformance:test` for the declared standalone salience example's JSON Schema proof, and the repository's `rosetta-schemas` tests for Profile-specific cross-field checks. Structural schema validation is not evidence of evaluation quality, historical replay isolation, or grant authority.

## Acceptance and status

Use [acceptance.md](acceptance.md) for concrete positive and negative cases. This Pack is **draft**, carries no release claim, and has no operative private evaluation policy. See [CHANGELOG.md](CHANGELOG.md).
