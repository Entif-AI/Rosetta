# Evaluation Profile Pack acceptance

These are candidate acceptance criteria for the current draft schema exports; they do not authorize a release.

## Required positive cases

- Manifest and both exported schemas conform to the live Pack manifest and JSON Schema rules.
- `examples/salience-evaluation.json` validates against the salience schema as a standalone payload.
- The nine authored salience vectors and nine counterfactual vectors run through their existing public Profile validators and expected outcomes.
- Cross-field ordering, baseline references, no-live-effect posture, and evidence preservation follow the Profile validators described in [tests/README.md](tests/README.md).

## Must fail

- A salience result without its required assessment/provenance fields.
- A verdict or Profile value that implies activation or execution authority.
- A historical counterfactual comparison that includes later evidence in its frozen input frontier or claims an unauthorized live effect.
- Mismatched Pack content ID, schema path, or declared Profile identity.

## Release blockers

Failed positive/negative Profile cases, missing examples, or manifest/identity errors block this Pack. Release still requires completed generic ROCK-3111-C root, traceability, changelog, and migration evidence. A schema-valid representation is not proof that the underlying assessment or replay is correct.
