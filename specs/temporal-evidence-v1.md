---
id: rosetta:temporal-evidence-v1
kind: behavior
status: in-development
owner: Rosetta temporal/provenance maintainers
principles: [specs/principles.md]
authorities:
  - docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md
---
# Federated temporal and causal evidence (proposed v1)

**Source-owner issue:** [#1558](https://github.com/Entif-AI/Rosetta/issues/1558). **Downstream consumer:** [#1791](https://github.com/Entif-AI/Rosetta/issues/1791). This living desired-state proposal is **not accepted protocol authority** and does not supply implemented schema/comparator proof. The issue owner must accept the vocabulary, evidence rules and exact first-wave boundaries before implementation changes. Its purpose is to make chronology and causality inspectable without editing Core Tile semantics.

## Reuse existing standards and Rosetta owners

- [W3C PROV Constraints](https://www.w3.org/TR/prov-constraints/) already defines qualified provenance-event ordering, including generation, usage, invalidation and derivation. Reuse its named relations and consistency constraints where their prerequisites are satisfied; do not redefine them as arbitrary timestamp comparisons.
- [W3C OWL-Time](https://www.w3.org/TR/owl-time/) provides `time:Instant`, `time:Interval`, temporal reference systems and interval relations. Bind an explicit versioned mapping for supported time representations; a date, imprecise period or interval must not be silently interpreted as an exact instant.
- RFC 3339 timestamps identify full offset-bearing instants where suitable. Existing `isProfileTimestamp`/`compareProfileTimestamps` in `evaluation-profile-validation.ts` are reusable for lexical validation and fully stated timestamps, **not** for recovering causality from their numeric order.
- Rosetta Core v3 owns immutable `TileEnvelope` creation identity, parentage, Observation/Run/Action/ToolCall evidence and `rosetta.lattice_edge` temporal/causal/provenance families. This extension references those artifacts; it creates no new `rosetta.*` Tile kind or parallel execution spine.
- `impact.revalidation.v1` already distinguishes effective/observed/recorded/correction refs, knowledge-frontier evidence and immutable historical contexts. This proposal composes those fields rather than inventing a competing invalidation/repair state machine.

The resulting first-wave family is a proposed, namespaced **governed extension** named `temporal.evidence.v1`, with three composable records and one pure comparator. Rosetta's source authority determines which host Tile/Pack/Profile supplies them and how their exact schema IDs are registered.

## Bounded evidence records

### Temporal assertion

A versioned `TemporalAssertion` binds a stable assertion identity to an exact subject/artifact/event reference and a **single named time role**: `EVENT`, `EFFECTIVE`, `OBSERVED`, `RECORDED`, or `CORRECTED` (proposed initial vocabulary). Multiple roles are represented by separate assertions, never by an unlabeled timestamp list. `TileEnvelope.createdAt` is construction time only; it cannot silently populate any other role.

Each assertion carries its source provenance/evidence refs, one explicit value shape, precision, original time reference/basis, asserted timezone/calendar if known, optional uncertainty/clock-quality evidence and Profile/version. Proposed value shapes: full instant with offset, local date of declared calendar, closed/open interval with typed endpoints and inclusivity, or explicitly unknown with reason. Precision is retained and never increased by normalization. A UTC projection may supplement a source value but must preserve source basis/precision and must refuse unsupported calendars or unknowable offsets. Ordering of event/record/observation roles is not imposed universally; violations of an applicable qualified provenance constraint require evidence and a typed conflict result.

### Causal relation

A versioned `CausalRelation` binds two exact artifact/event refs to one asserted relation `BEFORE | AFTER | CONCURRENT | INCOMPARABLE | UNKNOWN`, its evidence/profile/basis, the supplying observer or validated source if applicable, and the completeness of the causal graph/scope on which the claim relies. `BEFORE/AFTER` require a traceable, valid relation path or accepted qualified provenance-event ordering. Physical wall-clock order, input sequence, shared request correlation, proximity in a graph, and `next_in_sequence` alone do **not** establish a causal edge.

The distinction among `CONCURRENT`, `INCOMPARABLE` and `UNKNOWN` is retained: observed/prescribed concurrency must be explicitly evidenced under its Profile; noncomparability requires a declared assessed relation/scope; missing, partial or disputed causal evidence is `UNKNOWN`. Absence of a path in an incomplete graph cannot establish concurrency. Opposing trusted causal paths are a conflict requiring refusal/`UNKNOWN` plus reasons rather than whichever arrival order happens to win.

### Knowledge-frontier snapshot

A `KnowledgeFrontier` binds a specific observer/actor/process, evaluation/decision ref, time-of-evaluation role/assertion, exact considered evidence CIDs or an independently verifiable closed-frontier reference, source/evaluation Profile, and completeness posture `complete | partial | unknown` with explicit unresolved gaps. The record reflects what was *available and considered* at that decision boundary, not an omniscient retrospective union of all later evidence. Closed-frontier status requires closure proof. Later arrivals and correction records produce additive revisions with `supersedes`/lineage references; they never rewrite the previous frontier or imply earlier awareness.

All three records need stable, versioned IDs, explicit source confidence/completeness, independent canonical serialization and references into existing provenance/receipts where available. Content-addressed identity is computed by the established Rosetta canonical JSON/CID mechanism where applicable; a record's digest proves its bytes, **not** the factual accuracy of its chronology or a human's knowledge state.

## Pure reference comparison contract

The proposed comparator accepts a bounded pair of subjects plus admitted temporal/causal evidence and a declared Profile, returns a deterministic disposition, ordered reason codes, considered evidence refs, scope/completeness and uncertainty. No I/O, clock polling, inferred current state, private storage topology, scheduler or policy threshold is part of the public comparator.

1. Validate record/identity/source references, temporal role and value precision first. Conflicting or malformed evidence cannot produce `BEFORE`/`AFTER`.
2. Apply only accepted, scope-matched qualified causal/provenance evidence and explicitly declared closed frontiers. Preserve PROV ordering impossibilities and contradictions instead of repairing them with clock order.
3. If explicit causal ordering is established, return `BEFORE` or `AFTER` with the exact evidence chain; a wall-clock discrepancy may be recorded but cannot reverse a proven causal relation.
4. If no direction is established, return only a Profile-justified `CONCURRENT`/`INCOMPARABLE`. Otherwise `UNKNOWN` with missing/conflicting frontier reasons. Date-only inputs cannot become sub-day ordered instants.
5. The result is evidence and does not authorize execution, retrospective correction, remote publication, write admission or withholding. `#1791` consumes its cited disposition but may not redefine its causal rules.

## First-wave conformance oracles (required for the later implementation PR)

| # | Observable input | Expected contract outcome |
| --- | --- | --- |
| 1 | Source event occurs before observation and is recorded much later | Separate EVENT/OBSERVED/RECORDED assertions; no inferred causal relationship from timestamps alone |
| 2 | Two provenance-linked events with wall clocks suggesting reverse order | Accepted causal evidence governs `BEFORE`/`AFTER`; clock discrepancy retained |
| 3 | Clock skew with no admissible causal edge | `UNKNOWN` or `INCOMPARABLE` with explicit missing evidence; never infer ordered cause |
| 4 | Two independent events with complete scoped noncausality evidence | Profile-justified `CONCURRENT` or `INCOMPARABLE`; no invented total order |
| 5 | A correction arrives after a prior decision | New superseding record; prior knowledge-frontier bytes/known set unchanged |
| 6 | Federation partner receives evidence after executing a decision | Historical frontier excludes the late evidence, even when event time precedes the decision |
| 7 | Source supplies date-only precision | Retain date/calendar/timezone limitations; reject fictitious midnight UTC instant |
| 8 | Daylight-saving or timezone normalization | Reversible normalized view retains original basis and offset/zone provenance |
| 9 | Opposite causal edges both claim authority in one scope | Explicit conflict/refusal/UNKNOWN; no arrival-order winner |
| 10 | Incomplete frontier but no known graph path | `UNKNOWN`, never manufacture `CONCURRENT` or causal absence |
| 11 | Identical input Profile/evidence with reordered irrelevant source enumeration | Byte-identical canonical comparator result and stable identifier |
| 12 | A late correction attempts to alter prior decision's evidence list | Validation refusal; require additive supersession preserving prior record |

The reference implementation must test actual exported validators/comparator through positive and adversarial fixtures and literal expected outcomes. Register exact schema IDs in the existing schema catalog and Core descent, with the source issue, documents and test owners. No new universal clock, Lamport/vector-clock mandate, service runtime, algorithmic inference policy, or private federation scheduler is required.

## Source-owner decisions before acceptance

1. Accept/narrow the time-role vocabulary and exact value/precision/uncertainty representations, including how existing `impact.revalidation.v1` refs map without migration.
2. Establish precise, publicly testable evidence requirements distinguishing `CONCURRENT`, `INCOMPARABLE`, and `UNKNOWN` under incomplete versus complete causal frontiers.
3. Fix the Profile family names, schema/Core-descent ownership, bounded comparison input contract and negative/contradiction dispositions.
4. Approve the external PROV/OWL-Time mapping table at the exact vocabulary-version level. Similar-looking Rosetta and W3C fields are not automatically equivalent.

Until reviewed, this specification remains **`in-development`**; test or generator success alone cannot promote it into accepted semantics.
