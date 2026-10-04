---
id: entif:substrate-principles
kind: principles
status: in-development
owner: Entif maintainers
principles: []
authorities: [docs/governance/AUTHORITY_CLOSURE_AND_REQUIREMENTS_TRACEABILITY.md]
---
# Substrate principles

## Authority before implementation

Resolve controlling source and public/private boundary before changing behavior.
Code observations reveal drift but cannot author desired-state intent. Core and
narrower accepted source contracts keep their semantic authority.

## Serialized mutation

One mutable writer is the default. Dependency order is execution order, not an
implicit permission for parallel writers. Credentialed/mutating operations stay
coordinator-owned; pure deterministic checks may cache.

## Projection remains evidence

TOON is an interchange format. Generated catalogs, plans dashboards and context
packets carry source locators/digests and remain auditable projections.
