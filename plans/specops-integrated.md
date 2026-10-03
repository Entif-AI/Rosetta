---
id: entif:specops-integrated
task: T1716
status: planned
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
- [ ] Controlling issue acceptance is verified with commit-bound evidence.

## Notes
Implementation evidence will be recorded before closeout.

## Follow-ups
Tracked as: #1711 remains a separate efficiency experiment.
