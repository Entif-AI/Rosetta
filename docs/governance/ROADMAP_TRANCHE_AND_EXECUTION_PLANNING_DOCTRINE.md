# Roadmap, Tranche, and Execution Planning Doctrine

**Version:** 0.1-draft  
**Status:** Proposed governance doctrine  
**Date:** 2026-09-03  
**Authority class:** Engineering planning and execution doctrine  
**Scope:** Rosetta roadmap construction, capability grouping, priority tranches, comparative grooming, dependency-aware scheduling, sprint formation, estimation, execution telemetry, and planning recalibration

## 1. Purpose

Rosetta's issue backlog is not itself a roadmap.

A large collection of individually useful issues can still produce poor execution if work is sequenced by issue age, local urgency, isolated estimates, or intuitive priority without considering architectural dependency, requirement authority, implementation readiness, verification cost, and downstream leverage.

This doctrine defines how Rosetta SHOULD transform its requirements graph and issue inventory into a coherent execution roadmap.

It is subordinate to:

- `PUBLIC_COMMONS_AND_PRIVATE_OPERATION_BOUNDARY.md`; and
- `AUTHORITY_CLOSURE_AND_REQUIREMENTS_TRACEABILITY.md`.

Those doctrines decide what may be public and what authorities govern implementation. This doctrine decides how already-admissible work is grouped, prioritized, groomed, scheduled, executed, measured, and recalibrated.

The governing sequence is:

> **Clean the authority surface. Normalize the map. Group capabilities. Stage tranches. Groom comparatively. Execute the dependency-ready frontier. Measure reality. Replan from evidence.**

## 2. Core invariants

### 2.1 The backlog is evidence, not the roadmap

GitHub issues MAY represent requirements, implementation work, research questions, governance decisions, experiments, maintenance, or historical artifacts.

Issue count, issue age, or issue numbering MUST NOT determine execution priority by themselves.

The roadmap SHOULD be derived from capability outcomes and dependency structure, with issues serving as one implementation projection.

### 2.2 Capability groups precede sprint assignment

Work SHOULD first be organized into coherent capability groups before being assigned to delivery tranches or sprints.

A capability group SHOULD answer:

- What coherent system ability does this group establish?
- What public or protected authorities govern it?
- What proof demonstrates that the capability exists?
- What downstream capabilities depend on it?
- Which issues, schemas, packages, Profiles, Packs, fixtures, and tests implement it?

### 2.3 Priority tranches are architectural investment bands, not calendars

A tranche groups work by architectural necessity and strategic leverage.

A tranche is NOT a sprint, release date, or fixed duration.

Multiple sprints MAY be required to satisfy one tranche. A single sprint MAY contain work from more than one tranche only when dependency and capacity conditions make that safe and explicit.

### 2.4 Comparative estimation is preferred to isolated estimation

Absolute engineering estimates made in isolation are often unstable for novel systems work.

Rosetta SHOULD compare sibling work items within a capability group or tranche using common dimensions before assigning effort bands or sprint placement.

### 2.5 Dependency readiness outranks nominal priority

A highly important issue that is blocked, underspecified, authority-incomplete, or unverifiable SHOULD NOT displace lower-ranked work that is dependency-ready and advances the same proof objective.

Execution SHOULD prefer the highest-value work on the legal, dependency-ready frontier.

### 2.6 Planning estimates are hypotheses

Initial estimates, velocity assumptions, and execution forecasts are provisional.

Observed engineering outcomes SHOULD progressively replace speculative estimates.

Planning systems MUST preserve predicted-versus-observed evidence rather than silently rewriting old estimates.

## 3. Planning sequence

### Phase 0: constitutional and authority cleanup

Before constructing a durable roadmap, the project SHOULD first reduce ambiguity in the governing surface.

This includes:

- public/private/split classification;
- protected-authority migration where required;
- removal or retirement of misleading historical public artifacts;
- authority closure and requirements-graph normalization;
- elimination of duplicate or superseded requirement owners;
- confirmation that public contracts remain independently meaningful.

### Phase 1: map normalization

The requirements graph, issue inventory, implementation tree, and governing specifications SHOULD be reconciled into one navigable planning model.

Normalization SHOULD identify:

- orphan requirements;
- orphan implementation surfaces;
- duplicate requirement owners;
- dead or stale dependency edges;
- circular dependencies;
- hidden decision prerequisites;
- issues whose requirement authority moved elsewhere;
- capabilities with no verification artifact;
- implementation surfaces with no declared requirement owner.

The spreadsheet or tabular inventory SHOULD remain useful as the attribute-oriented view of work.

The requirements graph SHOULD remain useful as the relationship-oriented view.

Neither projection SHOULD become a rival source of normative authority.

### Phase 2: capability grouping

Work SHOULD be grouped around coherent capabilities rather than administrative issue clusters.

Candidate top-level groups MAY include:

- semantic/core substrate;
- provenance, receipts, and source integrity;
- schemas, Packs, Profiles, and conformance;
- memory and context representation;
- authorization, Guard, and write admission;
- workflow and runtime interoperability;
- cognitive/operator representation;
- OMOC and routing representation;
- federation, swarm, and public commons;
- developer tooling, inspection, and authoring;
- external integration Profiles;
- experimental and research tracks.

These group names are planning categories, not mandatory new protocol namespaces.

Each capability group SHOULD identify at least:

- capability objective;
- governing authorities;
- prerequisite capabilities;
- implementation owners;
- proof / acceptance artifact;
- downstream unlocks;
- unresolved decisions;
- current readiness state.

### Phase 3: priority tranches

The roadmap SHOULD stage capability work into architectural tranches before sprint placement.

A recommended first-wave structure is:

#### Tranche 0: Constitutional prerequisites

Requirements, governance, authority, safety, schema, or infrastructure decisions without which downstream work would be built on unstable law.

#### Tranche 1: Minimum coherent Rosetta

The smallest end-to-end capability set that truthfully demonstrates the Core Spine and required conformance behavior.

#### Tranche 2: Productive substrate

Capabilities that make Rosetta practically useful for integrations, development workflows, source handling, bounded context, inspection, and dependable downstream consumption.

#### Tranche 3: Leverage and intelligence

Higher-order capabilities such as richer memory/context use, cognitive/operator representation, OMOC-facing representations, governed decision artifacts, and advanced orchestration surfaces.

#### Tranche 4: Federation and ecosystem

External Profiles, public commons, federation, verifier surfaces, ecosystem distribution, and swarm-facing capabilities once prerequisite governance and evidence exist.

#### Research horizon

Work that remains deliberately outside delivery commitment until research, benchmark, architectural, legal, or operational evidence promotes it.

Tranche names MAY evolve, but their function SHOULD remain: separate architectural priority from calendar scheduling.

## 4. Comparative engineering grooming

Before sprint assignment, candidate work SHOULD be groomed comparatively against sibling items in the same capability group or tranche.

Useful comparison dimensions include:

- dependency leverage;
- architectural centrality;
- downstream unlock count;
- critical-path depth;
- uncertainty reduction;
- implementation readiness;
- specification maturity;
- authority closure status;
- evidence strength;
- reversibility;
- engineering effort;
- verification cost;
- integration complexity;
- blast radius;
- security/privacy/governance risk;
- opportunity cost;
- learning value;
- expected rework risk.

These dimensions SHOULD inform judgment. They MUST NOT become an unreviewable scalar authority.

Where a score or rank is used, the underlying dimensions and rationale SHOULD remain inspectable.

## 5. Requirements-graph planning signals

The requirements graph MAY derive non-authoritative planning signals to make structure visible.

Useful signals include:

- `downstream_unlock_count`;
- `blocked_requirement_count`;
- `critical_path_depth`;
- `dependency_centrality`;
- `unresolved_decision_count`;
- `authority_closure_status`;
- `implementation_readiness`;
- `specification_confidence`;
- `verification_complexity`;
- `estimated_effort_band`;
- `rework_risk`.

Derived graph signals are advisory planning evidence.

They MUST NOT override constitutional authority, safety gates, human strategic judgment, or explicit dependency facts.

## 6. Workability and dependency-ready frontier

An implementation item SHOULD enter ordinary sprint consideration only when it is sufficiently workable.

A workable unit generally has:

- one bounded objective;
- an observable desired outcome;
- explicit governing requirements;
- known dependencies;
- bounded context;
- explicit non-goals or scope boundaries where needed;
- independently verifiable acceptance criteria;
- acceptable blast radius;
- no material unresolved decision that implementation would have to invent.

The **dependency-ready frontier** is the current set of work items whose prerequisites are satisfied and whose authority, scope, and verification posture are sufficiently closed for execution.

Sprint planning SHOULD select primarily from this frontier.

## 7. Sprint formation

Rosetta SHOULD begin with short, evidence-rich sprint cadences.

A one-week sprint is a reasonable default while the project is improving its decomposition, estimation, execution, and verification discipline.

Sprint duration SHOULD NOT be shortened merely to create the appearance of velocity.

Shorter execution cycles SHOULD emerge only when work units become reliably smaller, better specified, more independently verifiable, and cheaper to integrate.

A sprint SHOULD have:

- one or more explicit proof objectives;
- a bounded set of dependency-ready work;
- known verification requirements;
- explicit capacity assumptions;
- explicit carryover rules;
- no requirement to fill capacity with lower-value work merely to maximize utilization.

## 8. Continuous execution maturity

As planning quality improves, Rosetta MAY evolve from fixed sprint batches toward a continuously refreshed dependency-ready execution frontier.

This transition is justified only when evidence shows that:

- requirements are consistently execution-ready;
- dependency state is reliable and machine-readable;
- verification is fast and repeatable;
- review latency is low;
- rework rates are controlled;
- estimation error has narrowed;
- work can be decomposed into independently verifiable vertical slices.

At that maturity level, sprint boundaries MAY function primarily as planning/review checkpoints rather than the sole unit of execution admission.

## 9. Predicted-versus-observed engineering telemetry

Execution SHOULD preserve enough evidence to compare planning assumptions against reality.

Useful fields include:

- capability group;
- tranche;
- issue/work-item identifier;
- work-shape classification;
- predicted effort band;
- predicted confidence;
- predicted verification complexity;
- actual elapsed engineering time where available;
- execution/model/tool invocations where relevant;
- review cycles;
- rework rounds;
- defects discovered;
- dependency surprises;
- acceptance result;
- downstream work unlocked;
- human intervention;
- final disposition.

Derived empirical measures MAY include:

- first-pass acceptance rate;
- rework rate;
- estimate bias by work family;
- verification-cycle distribution;
- accepted units per engineering day;
- accepted units per model/tool invocation;
- cost or quota per accepted unit where relevant;
- dependency surprises by capability family;
- decomposition characteristics correlated with successful execution.

## 10. Estimation evolution

Rosetta SHOULD move from coarse estimation toward empirical, work-family-specific forecasting.

Early planning MAY use broad relative bands such as XS/S/M/L/XL or equivalent.

Later planning SHOULD calibrate those bands against actual project history.

For example, the project may eventually be able to distinguish typical effort and rework profiles for:

- schema/Profile changes;
- receipt/provenance work;
- cross-package runtime changes;
- Guard/write-admission changes;
- adapter/integration work;
- conformance-fixture additions;
- governance changes;
- research/benchmark tasks.

The goal is not false precision. The goal is progressively reducing uncertainty with local evidence.

## 11. Roadmap artifact requirements

The roadmap SHOULD be a maintained planning artifact rather than a one-time narrative.

A useful roadmap view SHOULD expose:

- capability groups;
- tranche assignment;
- capability proof objectives;
- major requirement nodes;
- major dependency edges;
- unresolved decisions;
- implementation readiness;
- estimated effort bands;
- current dependency-ready frontier;
- active sprint mapping where applicable;
- research-horizon items;
- recent evidence that materially changed prioritization.

The roadmap SHOULD link to authoritative requirements rather than restating large normative contracts.

## 12. Relationship to issues and sprints

The intended planning hierarchy is:

```text
Normative authorities
  -> requirements graph
  -> capability groups
  -> priority tranches
  -> comparative engineering grooming
  -> dependency-ready frontier
  -> sprint candidates
  -> execution
  -> verification
  -> observed engineering data
  -> roadmap recalibration
```

GitHub issues remain implementation and coordination artifacts inside this hierarchy.

They are not the hierarchy itself.

## 13. Anti-patterns

The planning process SHOULD reject or correct these failure modes:

- treating the entire open issue list as one priority queue;
- assigning sprints before dependency normalization;
- estimating issues independently with no sibling comparison;
- treating priority labels as sufficient sequencing logic;
- scheduling blocked work because it is strategically important;
- confusing research horizon with delivery commitment;
- creating giant epics with no proof objective;
- decomposing unstable requirements prematurely;
- using a scalar ranking formula as unreviewable strategic authority;
- optimizing team/model utilization instead of accepted, verified progress;
- shortening sprint duration before decomposition and verification quality justify it;
- silently rewriting prior estimates after observed results arrive.

## 14. Planning review cadence

At each planning review, maintainers SHOULD inspect:

- whether capability grouping still reflects current architecture;
- whether tranche boundaries remain sensible;
- whether the dependency-ready frontier is accurate;
- whether new authority or research changed sequencing;
- whether estimates remain calibrated;
- whether recurring rework suggests a decomposition/specification defect;
- whether recurring blocked work suggests missing prerequisite capabilities;
- whether sprint length still matches actual execution granularity.

## 15. Constitutional summary

> **Rosetta plans from capabilities and dependency structure, not from issue order. Capability groups are staged into architectural priority tranches before sprint assignment. Candidate work is groomed comparatively, execution is drawn from the dependency-ready frontier, and estimates remain provisional until replaced by observed engineering evidence. Sprint cadence is a consequence of workability and verification maturity, not a substitute for them.**
