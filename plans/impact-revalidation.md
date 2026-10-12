---
id: entif:impact-revalidation
task: T1730
status: in-progress
depends: []
awaits: []
specs: [specs/architecture.md]
issues: [1730]
pr: 1732
---
# Dependency impact and revalidation

Implement #1730 under semantic owner #1560. Public governed Profile composition references existing Observation, Evaluation, Receipt and Action authorities; it adds no Core kind. #1558 temporal/knowledge-frontier and #1557 external-effect posture remain referenced authorities. The public bridge has no protected policy edge for this representational surface. No reverse-index, ranking, scheduler, rollback or write policy is implemented.

## Validation

- [x] Eight positive and three adversarial impact fixtures.
- [x] Additive history rejects identity collisions, lost irreversible effects and historical-knowledge rewriting.
- [x] Dependency is not affectedness; unknown frontier prevents closure; rebuild alone is not revalidation.
- [x] Focused/owner checks, generated schemas/catalogs and governance pass.
- [ ] Completion-envelope dogfood from the pushed checkpoint.
- [ ] Integrated after merge.
