# Strategic Opportunity Acceleration Overlay

**Version:** 0.1-draft  
**Status:** Proposed planning doctrine  
**Date:** 2026-09-03  
**Authority class:** Non-normative strategic planning overlay  
**Scope:** Time-sensitive market, regulatory, standards, partnership, procurement, research, ecosystem, and demonstration opportunities that may affect roadmap sequencing

## 1. Purpose

Rosetta's architecture should not be planned in a commercial vacuum.

A capability that is architecturally valid but ordinarily several tranches away may become worth accelerating when a concrete external opportunity makes its earlier proof materially more valuable.

Examples of legitimate opportunity pressure include:

- a regulatory implementation window;
- a public rulemaking or standards process;
- a partner or systems-integrator channel becoming available;
- a procurement or enterprise evaluation window;
- a research collaboration that can validate a protocol surface;
- an ecosystem adoption opportunity;
- a reference demonstration that can unlock several downstream decisions at once;
- a time-sensitive market need for an already-planned interoperability capability.

This doctrine defines how those opportunities MAY influence roadmap sequencing without becoming semantic authority or bypassing governance.

The governing rule is:

> **Strategic opportunity may accelerate a capability tranche. It may not redefine Rosetta semantics, relax authority closure, or widen disclosure by itself.**

## 2. Relationship to other governance

This overlay is subordinate to:

- `PUBLIC_COMMONS_AND_PRIVATE_OPERATION_BOUNDARY.md`;
- `AUTHORITY_CLOSURE_AND_REQUIREMENTS_TRACEABILITY.md`; and
- `ROADMAP_TRANCHE_AND_EXECUTION_PLANNING_DOCTRINE.md`.

An opportunity can influence planning judgment only after the relevant publication posture, governing authority, dependency state, and safety requirements are understood.

Commercial value, regulatory urgency, partner interest, or public visibility MUST NOT be treated as permission to publish protected operational machinery.

## 3. Opportunity is planning evidence, not normative authority

Strategic opportunity MAY affect:

- comparative priority among otherwise legitimate capabilities;
- the order in which public semantic contracts are specified;
- which integration Profile, Pack, adapter, or conformance surface receives earlier attention;
- which reference fixture or demonstration is built first;
- which research question is promoted from the research horizon into active evidence gathering;
- which dependency-ready work is selected first when several candidates are available;
- whether prerequisite work is accelerated because it unlocks a concrete external proof objective.

Strategic opportunity MUST NOT:

- redefine Core Spine semantics;
- override an accepted Pack, Profile, schema, or governance contract;
- make a blocked requirement dependency-ready;
- waive authority closure;
- waive write-admission, safety, privacy, rights, or identity-sensitive gates;
- convert private implementation strategy into public protocol law;
- justify a false conformance or production-readiness claim;
- force a premature normative commitment merely to create market visibility.

## 4. Strategic opportunity overlay

The roadmap MAY maintain non-authoritative opportunity relationships separately from normative requirement relationships.

Useful relationship classes include:

- `accelerated_by`
- `enables_market_wedge`
- `demonstrated_by`
- `supports_standards_engagement`
- `supports_procurement`
- `supports_partner_channel`
- `candidate_for_public_graduation_under`
- `time_window_depends_on`
- `validated_by_external_use_case`

These relationships belong to planning metadata or an authorized internal requirements projection.

They MUST NOT be confused with normative relationships such as `implements`, `constrains`, or `requires_review_of`.

A public roadmap MAY describe a generic external proof objective when disclosure is appropriate. Protected commercial strategy SHOULD remain in the protected planning surface.

## 5. Opportunity assessment

When an opportunity may accelerate roadmap work, planning SHOULD record enough evidence to explain the decision.

Useful dimensions include:

- opportunity class;
- time window or deadline;
- external dependency;
- capability groups implicated;
- prerequisite work required;
- dependency-ready subset available now;
- expected proof value;
- adoption or interoperability value;
- standards or regulatory leverage;
- partner or procurement leverage;
- research or validation value;
- implementation effort;
- verification burden;
- reversibility;
- disclosure posture;
- opportunity decay if delayed;
- downstream capabilities unlocked even if the external opportunity disappears.

The final priority decision remains a judgment, not an automatic scalar score.

## 6. Acceleration test

A capability SHOULD be considered for opportunity-driven acceleration when most of the following are true:

1. the underlying capability is already architecturally legitimate;
2. the external opportunity is concrete rather than hypothetical;
3. timing materially changes the value of delivery;
4. required prerequisites can be satisfied without semantic shortcuts;
5. the work produces reusable Rosetta infrastructure rather than a disposable one-off;
6. the proof objective is independently verifiable;
7. acceleration does not force protected operational logic into the public commons;
8. the work still creates meaningful project value if the external opportunity disappears;
9. the capability can be expressed as a thin vertical slice rather than a premature platform build;
10. opportunity-driven work will not silently strand higher-authority prerequisites.

## 7. Reference demonstrations as planning pressure

A bounded reference demonstration MAY function as a product-pressure fixture for roadmap planning.

A good reference demonstration should:

- exercise several generic Rosetta capabilities together;
- preserve native external semantics rather than invent convenient fake equivalence;
- include positive and negative/adversarial fixtures;
- produce independently inspectable evidence and receipts;
- expose missing contracts through concrete use rather than speculation;
- remain small enough to finish and verify;
- avoid claiming production capability beyond what the evidence demonstrates.

The demonstration MAY accelerate generic capabilities such as provenance, receipts, semantic correlation, lifecycle events, authority versioning, translation evidence, conformance, Packs, Profiles, or adapters.

The demonstration MUST NOT become the hidden semantic authority for those capabilities.

## 8. Public-spec graduation

A time-sensitive opportunity may create pressure to publish a new Rosetta contract early.

That pressure does not alter the publication boundary.

Before public graduation, the work SHOULD still determine:

- whether Rosetta already owns the meaning;
- whether an external standard owns the meaning;
- whether the candidate is genuinely an interoperability contract;
- whether the public surface is independently meaningful and conformable;
- whether private scoring, matching, routing, optimization, delivery, or commercialization logic has been removed or separated;
- whether the external authority or regulatory basis is mature enough for the claimed status;
- whether the artifact should be public, private, split, screened, experimental, or deferred.

## 9. Roadmap representation

A roadmap view MAY show an opportunity overlay alongside architectural tranches.

For example:

```text
Normative authorities
  -> requirements graph
  -> capability groups
  -> architectural tranches
         ^
         |
strategic opportunity overlay
  -> time-sensitive proof objective
  -> accelerated dependency-ready capabilities
         |
         v
comparative grooming
  -> execution
  -> verification
  -> observed evidence
```

The arrow from opportunity into tranche planning changes prioritization pressure, not semantic authority.

## 10. Anti-patterns

The project SHOULD reject these failure modes:

- chasing a market headline with architecture that has no reusable value;
- pretending urgency resolves an unresolved semantic question;
- moving blocked work into a sprint because a buyer might exist;
- overbuilding a vertical solution before the minimum reusable substrate exists;
- publishing protected machinery to prove momentum;
- treating a partner's preferred implementation as protocol law;
- letting one customer or sector mutate the Core Spine for local convenience;
- allowing a demonstration fixture to become the only source of truth for a generic contract;
- using strategic value as a reason to skip conformance or negative fixtures;
- confusing commercialization strategy with public protocol governance.

## 11. Constitutional summary

> **Rosetta may deliberately accelerate architecturally legitimate capabilities when a concrete external opportunity makes timing valuable. Opportunity pressure is planning evidence, not semantic authority. It may change when a capability is pursued, which proof objective is demonstrated first, and which dependency-ready work receives priority. It may not redefine Rosetta meaning, waive authority or safety gates, or convert protected operational advantage into public protocol law.**
