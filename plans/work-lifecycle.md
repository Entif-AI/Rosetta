---
id: entif:work-lifecycle
task: T1509
status: in-progress
depends: []
awaits: []
specs: [specs/architecture.md]
issues: [1509]
pr: 1732
---
# Public bounded-work lifecycle representation

Implement the current #1509 public contract in the existing schema owner. Compose references to existing execution, Evaluation and Receipt authority; preserve procedure/executor, completion/verification/integration and dispatch/write distinctions. No IPR-0053 operational policy changes.

## Validation

- [x] Public schema and runtime relational validation agree.
- [x] Required blocked, dispatched, rejected, repair, human, non-software and interoperable adapter vectors pass.
- [x] Append-only identity conflicts and stale-verification integration are rejected.
- [x] Independent materialized state preserves history and recorded external integration.
- [x] Owner lint/typecheck/test/build passes: 102 tests, including 18 focused lifecycle cases. Governance is required again before checkpoint.
- [ ] Integrated after PR merge; branch implementation alone is not terminal plan completion.

## Authority closure

Public boundary, authority traceability, Core conformance/Profile contract, schema authority map, existing application-contract descent and live #1509 were read. Public bridge IPR-0053 constrains operational policy; this leaf changes only public representation and is fully determined by the public issue. No private selection, routing, scheduling, thresholds or learning mechanisms are implemented or disclosed.
