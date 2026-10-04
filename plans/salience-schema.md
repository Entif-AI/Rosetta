---
id: entif:salience-schema
task: T1694
status: planned
depends: []
awaits:
  - execute-only-as-separate-fallback-or-later-batch
specs:
  - specs/architecture.md
issues: [1694, 1670, 1558, 1567]
pr:
---
# Implement the public salience Profile/schema and conformance fixtures

Keep as a separate fallback/later batch. Compose Impact, Exigency, and Novelty as distinct evidence-bearing public assessments with scope, time, uncertainty, baseline/expectation refs, provenance, and append-only reassessment. Do not publish private IPR-0218 scoring machinery and do not define one total salience score.

## Validation

- [ ] Public Profile/schema validates without protected-repository access.
- [ ] Impact, Exigency, and Novelty remain machine-distinguishable.
- [ ] All nine #1694 fixture classes are represented, including invalid authority escalation and equivalent output from different private methods.
- [ ] Reassessment preserves prior state through supersession/lineage.
- [ ] No private weights, formulas, thresholds, routing, or execution authority appear in public schema.

## External authorities

- docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md
