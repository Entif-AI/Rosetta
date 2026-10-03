---
id: entif:specops-context
task: T1720
status: in-progress
depends:
  - specops-drift
awaits: []
specs:
  - specs/architecture.md
issues:
  - 1720
---
# specops-context

## Scope
Execute the controlling GitHub #1720 contract; issue remains durable discussion identity.

## Implements
- specs/architecture.md: the owned substrate boundary for this issue.

## Approach
Inspect exact current source, Git state and controlling issue before execution. One mutable writer; no branch-per-plan requirement.

## Validation
- [ ] Controlling issue acceptance is verified with commit-bound evidence.

## Notes
Implementation evidence will be recorded before closeout.

## Follow-ups
None.
