---
id: entif:development-substrate
kind: architecture
status: in-development
owner: Entif maintainers
principles: [specs/principles.md]
authorities: [docs/governance/AUTHORITY_CLOSURE_AND_REQUIREMENTS_TRACEABILITY.md]
---
# Development substrate

## Principles

Inherit [authority before implementation](principles.md#authority-before-implementation)
and [serialized mutation](principles.md#serialized-mutation).

## Ownership

Rosetta owns semantic meaning, identity, provenance and receipts. Specs express
reviewed desired state subordinate to Core/governance. Plans express bounded motion;
GitHub issues retain durable discussion identity and Git/PRs retain chronology.
Nx owns deterministic repository execution. AXI is local agent interchange; Chat
is the orchestration/analysis control plane. Generated context/catalogs/reports do
not become semantic authority. Existing source authorities remain at their exact
locators; this corpus references them rather than silently superseding them.

## Execution

One mutable writer drains dependency-ready plans. A dependency DAG grants no
permission for parallel mutation. No branch-per-plan requirement is imposed.
Bounded independent read-only analysis remains possible when authorized. Resume
requires exact source/Git/issue inspection before active work continues.

## Transition

Spec Kit historical payloads remain during successor proof; future desired-state
work uses specs/ and temporal motion uses plans/. The human Control Sheet is an
optional projection once plans provide readiness; it grants no execution authority.
#1711 consumes the completed substrate as a separate experiment, never this run.
