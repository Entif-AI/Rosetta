---
id: rosetta:behavioral-compatibility-v1
kind: behavior
status: in-development
owner: Rosetta interoperability/compatibility maintainers
principles: [specs/principles.md]
authorities:
  - docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md
---
# Bounded behavioral compatibility (proposed v1)

**Owner:** [#1556](https://github.com/Entif-AI/Rosetta/issues/1556); **consumer:** [#1553](https://github.com/Entif-AI/Rosetta/issues/1553); **downstream blocked consumer:** [#1791](https://github.com/Entif-AI/Rosetta/issues/1791). This is a public **in-development** Pack/Profile-level extension proposal with a reference comparator and conformance fixtures for review. It neither amends Core nor claims semantic acceptance by the source owner.

## Reuse before invention

The existing `AdapterCapabilityManifestInput` vocabulary is authoritative for this repository's adapter `effect_class`, `idempotency`, and `replay_safety` fields. The new records reuse those exact value domains via shared types/constants; any projection from the older manifest must preserve the three declared fields and leave absent dimensions **unknown**. There is no permissive conversion from HTTP method, adapter metadata, or a structural schema match to retry eligibility. RFC 9110 §9.2.2 governs HTTP retry constraints where HTTP is involved, but this portable model is not HTTP-specific. The current Core Observation, Evaluation and Receipt provide evidence/provenance context, not guarantees of behavioral compatibility or effect authorization.

## Exchange records

Three versioned records are proposed: `behavioral.requirement.v1`, `behavioral.capability.v1`, `behavioral.comparison.v1`. Each carries a fixed `{id, version}` Profile identity. A requirement names a request, an exact operation class/capability, optional implementation ID/version constraints, a named bounded process Profile, and an integration **node, edge or path** scope. A capability names the same operation and its exact implementation/version evidence, with **separate normative and observed** assertions. The result carries the request/capability identities, the same scope, ordered per-dimension reasons/evidence and `COMPATIBLE | INCOMPATIBLE | UNKNOWN`.

Every behavioral assertion names exactly one dimension and an enumerated value, with references to its supporting evidence. A missing assertion or the literal `unknown` value is not evidence of compatibility. Positive observed claims without supporting refs are insufficient. Evidence refs represent claims; their presence alone cannot authenticate the external source. A single source assertion cannot be reused to claim independent witnesses. Duplicate assertions for one dimension are invalid, as are unknown dimensions and values outside that dimension's vocabulary.

First-wave dimensions: existing `effectClass`, `idempotency`, `replaySafety`; plus `idempotencyKeyScope`, `delivery`, `ordering`, `acknowledgment`, `timeoutCommit`, `atomicity`, `partialSuccess`, `finality`, `reversibility`, `compensation`, and `concurrency`. Key scope is separate from idempotence. An available compensating action does **not** mean an irreversible original operation was rolled back. Acknowledgment is not commit. Timeout may leave an external commit unknown. `exactly-once`, `at-least-once` and `at-most-once` are distinct declared guarantees, never guessed from transport shape.

## Deterministic comparison and authority limits

The baseline comparator evaluates only explicitly required dimensions and exact operation/version scope. For v1, matching enumerated values are the only compatible comparison; differing advertised guarantees receive `INCOMPATIBLE` rather than an unreviewed assumption that one is stronger or automatically substitutable. Unsupported richer semantic substitutability requires a reviewed, versioned mapping. The comparator checks normative claims and field-observed claims separately; any conflict between the two is visible and blocks a positive result. When the request requires observed conformance, no normative-only claim can pass; missing or unsupported observed evidence produces `UNKNOWN`.

Each dimension reports `COMPATIBLE | INCOMPATIBLE | UNKNOWN` and exact reason/evidence refs. Aggregate disposition is incompatible if any required dimension is incompatible; otherwise unknown if any required dimension is unknown; otherwise compatible. Sorting and deduplication of report-only reason/evidence references make independent replay deterministic without mutating the original records. Different scoped process requirements can compare differently against the same operation/capability. A result identifies what was compared, **not** an execution, retry, refund, migration, rollback, transaction, or authority grant. #994, #1295 and the current AuthZ/Guard surface own apply-time effects.

## Independent conformance oracles

The reference implementation must prove through exported package APIs:

1. Identical input/output schema but incompatible idempotency values does not pass.
2. At-least-once offered delivery does not satisfy exactly-once required delivery.
3. Timeout with an unproven external commit remains `UNKNOWN` even if the request schema is valid.
4. Partial batch success differs from safe whole-batch retry.
5. Local reversibility is not interchangeable with externally final settlement.
6. A compatible happy-path exchange can still fail required ordering guarantees.
7. Contradictory normative and implementation-observed claims cannot pass.
8. An unevidenced required dimension yields `UNKNOWN` rather than a default pass.
9. Two operations with identical idempotency but different key scope are not equivalent.
10. Compensation availability does not prove rollback/reversibility.
11. The same offered capability can be compatible under one process Profile and incompatible under another.
12. Duplicate dimensions, unexpected values and mismatched operation/version scope are rejected or explicitly incompatible.

## Source-owner acceptance questions

Approve or narrow the strict equality-only baseline, claim evidence sufficiency, the enumerated dimension values and exact Profile names, and whether a profile can be declared compatible from normative evidence alone when the requester explicitly does not demand implementation observation. Any future broader assurance relation (e.g. a proven stronger delivery guarantee) requires a separately reviewed mapping and conformance vector. All runtime execution/exporter/probe details remain outside #1556. Until approved, the Profile is **proposed and fixture-tested only**.
