---
id: entif:badger-experiment
task: T1711
status: in-progress
depends:
  - specops-integrated
awaits: []
specs:
  - specs/architecture.md
issues:
  - 1711
---

# badger-experiment

## Scope

Execute the controlling GitHub #1711 contract; issue remains durable discussion identity.

## Implements

- specs/architecture.md: the owned substrate boundary for this issue.

## Approach

Inspect exact current source, Git state and controlling issue before execution. One mutable writer; no branch-per-plan requirement.

## Validation

- [ ] Controlling issue acceptance is verified with commit-bound evidence.

## Preparation checkpoint

Local setup, smoke harness, frozen-trial template and ecological baseline locators:
`tools/badger/README.md`. No live trial, completion or adoption decision.
Preparation branch must remain unmerged until the concurrent Medium baseline
finishes. Readiness does not authorize model execution in this preparation run.

## Notes

Migration prerequisites passed; next separate efficiency experiment. Explicitly excluded from the #1712–#1721 migration run; readiness is not execution authorization.

## Follow-ups

None.
