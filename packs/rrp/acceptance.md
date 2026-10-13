# RRP acceptance

This file records a proposed acceptance checklist for the draft RRP Pack. It does not approve release or replace ROCK-3111-C.

## Required positive checks

- The root manifest conforms to `packs/_schemas/pack-manifest.schema.json`, its content-addressed `pack_id` matches disk contents, and declared exports exist.
- Both declared JSON Schemas parse and satisfy the declared JSON Schema dialect.
- `pnpm exec nx run packs-rrp:test` executes the existing receipt-positive and tamper-negative fixtures without regression.
- Any release claim additionally verifies applicable SHACL, examples, traceability, migration, version/changelog, and Pack-specific vectors under ROCK-3111-C.

## Must fail

- Missing declared exports or a mismatched content ID.
- A receipt with invalid signed content or a tampered receipt accepted as verified.
- Missing evidence/subjects accepted as a complete bundle, or a promotion state accepted despite a negative vector.

## Merge and release blockers

Manifest, identifier, path, and existing executed fixture failures block changes to this Pack. **Release** additionally requires a complete, independently verified release-gate report; the current generic report remains partial until its obligations are evaluated. No signature, SHACL, or full profile-conformance claim is implied by this document.
