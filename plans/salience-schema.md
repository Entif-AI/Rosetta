---
id: entif:salience-schema
task: T1694
status: done
depends: []
awaits: []
specs:
  - specs/architecture.md
issues: [1694, 1670, 1558, 1567]
pr: 1697
---
# Implement the public salience Profile/schema and conformance fixtures

Integrated by merged PR #1697 at main 6a9ddc28853ab519064b3216c2d98f55e3b34251; no duplicate implementation is needed. Compose Impact, Exigency, and Novelty as distinct evidence-bearing public assessments with scope, time, uncertainty, baseline/expectation refs, provenance, and append-only reassessment. Do not publish private IPR-0218 scoring machinery and do not define one total salience score.

## Validation

- [x] Public Profile/schema validates without protected-repository access.
- [x] Impact, Exigency, and Novelty remain machine-distinguishable.
- [x] All nine #1694 fixture classes are represented, including invalid authority escalation and equivalent output from different private methods.
- [x] Reassessment preserves prior state through supersession/lineage.
- [x] No private weights, formulas, thresholds, routing, or execution authority appear in public schema.

## External authorities

- docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md

## Integrated verification

On 2026-10-04, the current integrated salience and counterfactual suites passed all 16 tests; all four Packs passed conformance. This plan records the merged implementation, not acceptance of unmerged PR #1732 code.
