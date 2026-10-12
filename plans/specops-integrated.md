---
id: entif:specops-integrated
task: T1716
status: done
pr: 1723
depends:
  - specops-dist
awaits: []
specs:
  - specs/architecture.md
issues:
  - 1716
---
# specops-integrated

## Scope
Execute the controlling GitHub #1716 contract; issue remains durable discussion identity.

## Implements
- specs/architecture.md: the owned substrate boundary for this issue.

## Approach
Inspect exact current source, Git state and controlling issue before execution. One mutable writer; no branch-per-plan requirement.

## Validation
- [x] Controlling issue acceptance is verified with commit-bound evidence.

## Notes
Integrated source checkpoint 47e4c28f7dcd0383c5b5d5592db38473cc590902: frozen install, sync, release plan, full verification, affected merge admission, packed upgrade/runtime E2E and hosted verify/admission passed. See tools/specops/evidence/run-evidence.json and PR #1723.

## Follow-ups
Tracked as: #1711 remains a separate efficiency experiment.
