# Genesis Assurance and Operations Companion

**Status:** Proposed companion to Genesis 0.4-draft  
**Purpose:** Testing, adversarial assurance, reliability, observability, metrics, release evidence, and operational learning  
**Scope note:** This document elaborates operating practice. It does not redefine Rosetta Evaluation, Receipt, Incident, Profile, or conformance semantics.

## 1. Assurance reduces uncertainty

Tests, checks, reviews, scanners, simulations, and metrics are instruments for reducing uncertainty about important behavior.

They do not manufacture certainty by volume.

Assurance effort SHOULD follow consequence and uncertainty. A trivial wording change does not need a chaos program. Authorization, provenance, identity, parser, migration, payment, publication, and irreversible mutation paths may require much stronger evidence.

## 2. Tests are executable claims

A useful test:

- protects behavior or an invariant that matters;
- fails when that behavior is wrong;
- explains the violated expectation well enough to guide repair;
- is deterministic or exposes relevant uncertainty;
- lives in an appropriate normal validation path.

Prefer observable contracts over tests that mirror implementation details. Internal tests are justified when the internal contract itself is important.

### 2.1 Stable selectors for user-interface tests

Automated tests for user-interface elements under project control MUST locate those elements through explicit `data-test-id` attributes rather than user-facing text, translated strings, CSS classes, DOM position, incidental element nesting, or accessibility labels used as test hooks.

`data-test-id` values are test contracts. They SHOULD:

- describe durable semantic identity or responsibility rather than presentation;
- remain stable across copy edits, localization, hydration strategy changes, and harmless DOM refactors;
- use domain identity for repeated or dynamic elements where one stable global identifier is insufficient;
- avoid encoding layout accidents such as left/right position, wrapper depth, CSS utility names, or current visual treatment.

Tests SHOULD assert behavior, state, navigation, structure, and machine-stable attributes independently of localized/editorial wording. Exact text MAY be asserted only when the wording itself is the requirement, such as a legally mandated disclosure or a localization/content-contract test; even then, locate the element through `data-test-id` first.

Test hooks MUST NOT replace or weaken semantic HTML, accessible names, labels, landmarks, or ARIA. Accessibility semantics exist for users and assistive technology. `data-test-id` exists only to give automation a stable, non-user-facing identity surface.

When a third-party or otherwise uncontrolled interface cannot expose a project-owned test hook, use the narrowest stable contract the dependency provides and document the exception.

### 2.2 Repeated correction should strengthen the system

Repeated human correction is evidence that a stronger durable control may be missing. When the same class of defect, agent mistake, review finding, operational repair, or contributor intervention recurs, contributors SHOULD ask how to prevent or detect that class of failure before relying on continued vigilance.

Prefer controls in this order when they are reliable and proportionate:

1. eliminate the failure mode structurally through architecture, data modeling, types, interfaces, capability boundaries, safe defaults, or a better foundational tool choice;
2. detect it mechanically through static analysis, schema validation, lint rules, tests, policy checks, conformance checks, or CI gates;
3. encode repeatable guidance or automation through repository-native generators, platform tooling, agent skills, workflow rules, templates, or other maintained mechanisms;
4. rely on human review when contextual judgment is genuinely required or when no stronger control is presently economical.

Do not automate a recurring repair before asking whether the condition requiring repair can be removed. Prefer the lowest durable layer that can enforce the intended invariant correctly.

Human review is not intrinsically weaker than automation. Semantic judgment, security review, publication decisions, product intent, adversarial reasoning, and novel situations may properly require people. The avoidable failure is using scarce human attention as the permanent detector for deterministic recurring mistakes the system could prevent or catch reliably.

When a human intervention cannot yet be eliminated, preserve enough evidence to make recurrence measurable and future strengthening possible.

## 3. Red, green, refactor

For defect repair or behavior change, contributors SHOULD first demonstrate the incorrect/missing behavior with a failing test or equivalent reproducible evidence, then implement the smallest repair and retain the evidence as a regression guard.

When automation is impossible, a preserved reproducible proof may serve as the initial red state if the reason is recorded.

## 4. Tests preserve behavior; comments preserve intent

Tests cannot reliably preserve historical rationale, external quirks, or the reason a tempting refactor is unsafe.

Regression-sensitive behavior SHOULD use both:

- a meaningful test that fails if the behavior regresses;
- a concise comment where necessary to preserve the non-obvious reason.

Neither replaces the other.

## 5. Coverage law

Coverage reports where tests traveled. It does not establish whether they would detect incorrect behavior.

Coverage MAY identify untested risk.

Raw coverage percentage MUST NOT be:

- a standalone release gate;
- a team performance target;
- an individual metric;
- a mandated fixed increase per sprint.

Ceremonial assertions written only to increase coverage are prohibited.

Branch coverage, mutation resistance, fault detection, property preservation, meaningful regression capture, and independent reproduction may provide stronger evidence. None should become a sacred score.

## 6. Critical-path adversarial assurance

For critical behavior, deliberately introduce plausible faults and verify that the assurance system detects and explains them.

Use proportionately:

- mutation testing;
- property-based testing;
- metamorphic testing;
- malformed-input fuzzing;
- protocol/parser fuzzing;
- differential testing;
- dependency/network fault injection;
- clock/concurrency/retry/duplicate-delivery tests;
- resource exhaustion and timeout tests;
- contained chaos experiments;
- security abuse cases;
- backup/restore drills;
- rollback/compensation drills;
- cross-version/cross-implementation tests.

Expensive checks should target changed critical surfaces, release candidates, scheduled deep gates, and incident-driven risks rather than burning the entire monorepo indiscriminately.

## 7. Conformance and interoperability testing

Where a protocol, schema, codec, or cross-implementation contract is involved, prefer:

- canonical positive fixtures;
- invalid/adversarial fixtures;
- deterministic vectors;
- machine-readable expected failures;
- round-trip/loss tests;
- versioned conformance targets;
- at least one genuinely independent implementation/harness when making interoperability claims.

A reference implementation that only tests itself demonstrates internal consistency, not independent interoperability.

Rosetta conformance claims MUST name the Rosetta Profile/suite/version involved.

## 8. Dependency contracts

Test assumptions the project makes about third-party systems.

Do not duplicate an external library's entire test suite without a project-specific reason.

Contract tests SHOULD cover the versions, configuration, failure modes, and semantic guarantees on which the project actually relies.

## 9. Flake policy

A flaky test is an unreliable instrument.

Fix it, quarantine it visibly with reduced authority, or remove it.

Any accepted known-red test MUST have:

- owner;
- linked issue;
- reason;
- first-seen date;
- review/expiry condition;
- release semantics.

Known-red registries are not permission for indefinite failure.

Release-critical gates MUST be green unless an explicit release exception is approved and disclosed.

## 10. Test environments

Test environments SHOULD differ only where the difference is the subject of the test.

Environment drift, mutable dependencies, hidden credentials, and undeclared external state reduce evidentiary value.

A result SHOULD identify enough version/environment information for meaningful reproduction when the environment affects the claim.

## 11. Reliability requirements

Material operations SHOULD define or inherit:

- identity/correlation;
- authority;
- preconditions;
- idempotency or duplicate semantics;
- timeout/cancellation;
- retry classification and limits;
- partial-progress/atomicity semantics;
- postconditions;
- observable outcome;
- compensation/rollback/repair path;
- terminal states including indeterminate where appropriate.

Where represented in Rosetta, these requirements MUST compose the established v3 execution/provenance model rather than create a second canonical operation schema in Genesis.

## 12. Retry discipline

Retry only failures plausibly transient under a bounded policy.

Permanent validation, authorization, semantic, quota, or contract failures SHOULD fail without repeated load.

Retry systems MUST avoid unbounded amplification. Use, as appropriate:

- attempt limits;
- deadlines;
- exponential backoff;
- jitter;
- concurrency controls;
- circuit breaking;
- idempotency/duplicate protection.

A retry is another attempt within one logical operation, not permission to repeat side effects blindly.

## 13. Backpressure and overload

Systems SHOULD define what happens when demand exceeds safe capacity.

Responses may include:

- queueing;
- admission control;
- degraded mode;
- load shedding;
- batching;
- rate limiting;
- refusal.

Overload MUST NOT silently corrupt ordering, rights, provenance, or durability guarantees.

## 14. Indeterminate work and quarantine

Work that cannot complete or be safely retried SHOULD become inspectable rather than disappearing.

Preserve enough information to answer:

- what operation was attempted;
- which inputs/identities were involved;
- how many attempts occurred;
- why completion is uncertain/failed;
- which rights/classification apply;
- what can be replayed, repaired, compensated, or escalated.

Do not leak sensitive payloads merely to make a dead-letter record convenient.

## 15. Observability

Logs, metrics, traces, Rosetta Receipts, and alerts should help answer:

- what happened;
- to which artifact/user/tenant/operation;
- under which version/authority;
- what was expected;
- what occurred;
- whether state is safe/complete;
- what can be retried/reversed/repaired.

Telemetry MUST respect privacy, classification, retention, and rights.

Observability is not permission for indiscriminate surveillance.

## 16. Metrics are instruments

Before adopting a metric, define:

- decision informed;
- outcome approximated;
- unit/scope;
- collection method and quality;
- lag/leading behavior;
- confounders;
- how it can be gamed;
- counter-metrics/qualitative evidence;
- privacy/retention consequences;
- owner;
- collection cost;
- review/retirement condition.

A metric that can improve while the underlying outcome worsens is dangerous.

### 16.1 Multidimensional judgment

Do not collapse context-dependent dimensions into one universal master score merely because one scalar is convenient to sort.

Trust, novelty, relevance, urgency, value, resilience, risk, verification cost, decay, and revisitability can dominate different decisions in different ways. Preserve the meaningful vector and use decision-specific reducers, dominance rules, thresholds, guardrails, or qualitative review.

Any reducer SHOULD state:

- the decision it serves;
- included dimensions;
- weighting or dominance logic;
- hard constraints that cannot be traded away;
- uncertainty and missing-data behavior;
- gaming and sensitivity risks;
- review and retirement condition.

## 17. Prohibited individual-output metrics

Do not rank individual engineers by:

- story points;
- commits;
- PR count;
- lines changed;
- coding time;
- coverage;
- defect count;
- review-comment count;
- meeting attendance;
- similar gameable activity proxies.

System/team metrics may help diagnose flow, but comparisons across unlike teams/domains/maturity stages require context.

## 18. Balanced delivery signals

Useful signals may include, where applicable:

- time from accepted need to verified outcome;
- deployment frequency;
- change lead time;
- failed-deployment recovery time;
- change fail/rework rates;
- review latency;
- regression recurrence;
- rollback success;
- flaky-test burden;
- dependency/maintenance burden;
- documentation freshness;
- clone-to-first-insight time;
- provenance completeness;
- accessibility regressions;
- performance-budget regressions;
- incident detection/containment;
- qualitative frustration/cognitive load.

DORA metrics are useful examples for deployed software systems, not universal scorecards.

## 19. Measurement economy

Do not spend more building telemetry than the decision is worth.

Start with the smallest credible measurement that can change action. Increase precision only when value is demonstrated.

Measurement need does not override privacy, consent, accessibility, or rights.

## 20. Performance assurance

Performance should be measured under representative conditions:

- realistic device/network/compute;
- cold/warm start where relevant;
- realistic data volume;
- expected concurrency;
- degraded dependencies;
- failure/retry paths;
- large and small context sizes where relevant.

Performance metrics are not an excuse to weaken correctness, provenance, accessibility, or security.

## 21. Release posture

Prefer small, evidence-bearing releases.

A release SHOULD:

- advance a coherent capability/invariant;
- name maturity and limits;
- promote known artifacts;
- include migration/rollback where relevant;
- expose known risk;
- preserve compatible paths or explicitly declare breaking change;
- be observed after exposure.

A successful pipeline with a failed user outcome is a failed release.

## 22. Build once and promote

Release candidates SHOULD be built once and promoted without rebuilding mutable application content.

When exact promotion is impossible, record why and verify equivalence under the relevant contract.

Inject environment configuration/credentials at controlled boundaries.

## 23. Release evidence

Release evidence may include, according to risk:

- source/build revision;
- checksums;
- signed attestations;
- dependency inventory/SBOM;
- conformance results;
- security scan results with scope;
- known limitations;
- migration/rollback guidance;
- environment/config assumptions;
- release notes tied to accepted changes.

A Rosetta Receipt may attest relevant evidence, but ordinary release notes/checklists are not automatically Rosetta Receipts.

## 24. Observe after release

Confirm actual:

- deployment state;
- user-visible behavior;
- error/failure rates;
- rights boundaries;
- accessibility;
- latency/resource cost;
- rollback readiness;
- incident signals.

Release completes a learning loop, not just a pipeline stage.

## 25. Incident learning

Containment and recovery come first.

Post-incident analysis SHOULD identify:

- expected behavior;
- observed behavior;
- contributing conditions;
- detection gaps;
- containment/recovery gaps;
- corrective actions;
- owners;
- verification.

A single “root cause” label should not end inquiry when multiple system conditions contributed.

Blame individuals only where accountability genuinely requires it; do not use blame as a substitute for repairing the system.

## 26. Assurance review question

For every important claim, ask:

> If this were wrong in a plausible way, would our assurance system notice, explain, and help us recover?

If the answer is no, passing tests are not enough yet.
