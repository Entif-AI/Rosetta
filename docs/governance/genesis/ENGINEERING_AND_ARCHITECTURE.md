# Genesis Engineering and Architecture Companion

**Status:** Proposed companion to Genesis 0.4-draft  
**Semantic authority:** Rosetta v3.0.0 Core Spine Specification  
**Purpose:** Cross-project engineering and architecture defaults that elaborate Genesis without redefining Rosetta protocol semantics

## 1. Engineering posture

Engineering work should improve the system while preserving optionality.

Prefer the smallest durable change that:

- solves a real problem or removes a real constraint;
- preserves higher-priority invariants;
- is easy to inspect and reason about;
- can be tested in proportion to its risk;
- has a plausible rollback, replacement, or migration path;
- leaves a cleaner seam for the next change.

A consistent marginal improvement to a strong baseline is usually more valuable than waiting for a grand redesign that arrives late, partial, and difficult to reverse.

## 2. Adopt before inventing

Use this escalation order:

1. adopt a maintained standard, library, framework, service, or pattern;
2. configure it;
3. compose it with existing components;
4. wrap or adapt it;
5. extend a stable seam;
6. narrowly patch or fork it;
7. replace it;
8. invent only the irreducible remainder.

The bar is not whether an external option is perfect. The bar is whether its deficiency materially prevents the required outcome or violates a higher invariant.

Before bespoke ownership, record:

- nearest maintained alternatives;
- exact unmet requirement;
- evidence the gap matters;
- why configuration/composition/adaptation is insufficient;
- maintenance and security burden;
- migration and exit path;
- who owns the result after the initial implementation.

If upstream later supplies the missing capability, deleting the local extension is a victory.

## 3. Boundaries make systems trustworthy

Important systems SHOULD explicitly identify:

- canonical source of truth;
- derived views, caches, indexes, summaries, and rendered state;
- read/write authorities;
- identity, tenant, rights, and classification domains;
- trust and validation boundaries;
- side-effect boundaries;
- failure, retry, cancellation, and recovery boundaries;
- version and compatibility boundaries;
- observability and Rosetta provenance/Receipt boundaries where applicable.

Do not collapse distinct facts because one object, database, prompt, graph, or API can physically contain them.

Within Rosetta/Entif, protocol artifacts MUST retain the meanings established by v3 and accepted addenda. Application stores and indexes are projections or derived views unless explicitly designated otherwise by an appropriate authority.

## 4. Composition before inheritance

Prefer composition for behavior and capabilities.

Use:

- small functions;
- explicit data flow;
- discriminated unions or equivalent typed variants;
- immutable values where practical;
- dependency injection through narrow contracts;
- adapters at integration seams;
- event or message composition when decoupling is genuinely useful;
- graphs, schemas, tags, or value objects for taxonomy.

Do not use class inheritance merely because the domain contains categories or a hierarchy.

Nominal inheritance may be justified where the host language/runtime/framework materially requires or rewards subtype identity and the substitutability is real. The hierarchy should remain shallow.

A class hierarchy deeper than two meaningful inheritance levels SHOULD require an explicit local design decision explaining why composition would be less clear, less safe, or materially more expensive.

Inheritance is an exception. Taxonomy is not evidence for the exception.

## 5. Bound mutation

State SHOULD be immutable by default.

Necessary mutation MUST live inside an explicit ownership boundary. Callers should observe a well-defined transition rather than shared mutable internals.

Prefer append-only or journaled history when it protects provenance, auditability, correction, or recovery without disproportionate operating cost.

Never mutate historical Rosetta Tiles in place. The v3 content-addressed model governs Rosetta state evolution.

## 6. Deterministic core, isolated effects

Prefer a functional core with an imperative shell.

Deterministic code SHOULD accept explicit inputs and produce explicit outputs. Network access, filesystem changes, clock reads, randomness, model inference, environment state, subprocess execution, user input, and other effects should be isolated behind clear interfaces.

When nondeterminism materially affects an outcome, preserve enough information to explain or reproduce the result where practical: model/version, seed when meaningful, timestamp, dependency version, external response identity, configuration, or equivalent evidence.

A successful function return or HTTP status is not sufficient evidence that an external side effect reached the intended postcondition.

## 7. Validation at trust boundaries

Validate untrusted input at the boundary where it acquires authority.

Prefer schemas, parsers, type refinements, signatures, capability checks, or explicit validation functions over scattered defensive conditionals.

Internal code SHOULD be allowed to rely on facts already established by a trusted boundary unless another check protects a distinct invariant.

Avoid:

- unchecked casts;
- implicit error contracts;
- stringly typed state machines where a stronger representation is practical;
- silent coercion of unknown values into allowed states;
- “best effort” parsing that loses evidence of malformed input.

Language-specific details belong in project guidance, but the boundary principle is cross-project.

## 8. Replaceability is a property, not a label

A component is meaningfully replaceable when it has:

- a bounded contract;
- representative fixtures or conformance tests;
- known dependencies;
- observable behavior;
- migration semantics;
- an exit path.

Calling a service, framework, or module “pluggable” does not make it replaceable.

Prefer adapters around volatile dependencies when the adapter isolates a real substitution or policy boundary. Do not wrap stable libraries merely to perform architecture theater.

## 9. Dependency discipline

Dependencies SHOULD earn their lifetime cost.

Evaluate:

- fitness;
- maintenance health;
- governance;
- security history/posture;
- licensing and rights;
- standards alignment;
- interoperability;
- runtime/bundle/compute cost;
- testability;
- upgrade path;
- portability and exit.

Do not introduce a second formatter, package manager, linter, test runner, schema dialect, state-management framework, or architectural convention when the repository already has an adequate authority.

Repository-wide toolchain concerns should be solved at the repository/workspace authority where possible, not rediscovered package by package.

## 10. Code clarity

Code should explain **what** it does through structure, naming, types, and small coherent units.

Prefer:

- names that expose domain intent;
- narrow functions and modules;
- explicit parameters over ambient state;
- data structures that make invalid states difficult to represent;
- simple control flow before clever abstraction;
- local reasoning before hidden framework behavior.

Do not optimize for a style guide at the expense of semantic clarity.

## 11. Comments preserve intent; tests preserve behavior

A comment is valuable when it preserves information the code cannot reliably express on its own.

Good reasons to comment include:

- why a non-obvious constraint exists;
- why a simpler-looking implementation is incorrect;
- which external bug, protocol quirk, legal requirement, incident, performance boundary, or compatibility constraint applies;
- which invariant a future refactor may accidentally violate;
- where the durable issue/ADR/spec/test/upstream reference lives.

Regression-sensitive code SHOULD carry a concise tripwire near the line a future contributor might “simplify.” Example:

```ts
// Preserve the inclusive comparison. Changing it reintroduces ENG-1847.
```

Tests and comments address different failure modes:

- tests preserve observable behavior;
- comments preserve intent, rationale, and historical context.

Blanket bans on comments and blanket comment quotas are both rejected.

Remove comments that merely restate syntax, preserve dead code, or no longer describe reality.

## 12. Architecture diagrams

Diagrams are navigational aids, not sources of truth.

A diagram SHOULD identify:

- scope;
- date/version;
- authoritative contracts it summarizes;
- omitted concerns;
- whether it shows current, target, or illustrative state.

A visually persuasive diagram does not become current by surviving in a folder.

## 13. Build once; promote known artifacts

Release candidates SHOULD be built once and promoted through environments without rebuilding mutable application content.

Environment-specific credentials/configuration belong at controlled boundaries.

When exact artifact promotion is impossible, record why and provide evidence that the rebuilt artifact satisfies the intended equivalence contract.

Avoid environment branches whose only purpose is to substitute for deployment configuration or release-state tooling.

## 14. Data evolution and migration

Every meaningful state migration SHOULD distinguish:

- forward migration;
- backward compatibility;
- rollback feasibility;
- compensation;
- replay;
- partial failure;
- validation of the migrated state.

Irreversible changes require explicit authorization, preservation/backup strategy, validation, and known recovery limits.

For Rosetta artifacts, use v3 lineage/supersession mechanisms rather than in-place mutation.

## 15. Legacy systems

Characterize before changing.

Before rewriting a legacy surface:

- identify users and critical jobs;
- map dependencies/data flows;
- capture representative behavior;
- distinguish required behavior from accidental behavior;
- measure actual failure/maintenance cost;
- identify security, rights, and operational constraints;
- preserve rollback.

Ugly code is not automatically harmful code.

Prefer incremental replacement behind stable seams, parallel runs, adapters, shadow reads, and bounded cutovers when these reduce risk.

A big-bang rewrite requires evidence that incremental migration is less safe or materially more expensive.

## 16. Deployable boundaries

Choose whether a capability is a module, package, process, worker, service, application, or independently deployed site by examining:

- change coupling;
- authority and data ownership;
- failure isolation;
- scaling requirements;
- compliance boundaries;
- release cadence;
- team ownership;
- operational tax.

Microservices and monoliths are not moral categories.

Splitting creates network, deployment, observability, consistency, and operating costs. Keeping together creates coupling and blast-radius costs. Make the trade explicit.

## 17. Performance starts with architecture

Do not ship code, models, media, dependencies, telemetry, or context that cannot justify its cost.

Prefer:

- static/server generation where interaction does not require client execution;
- lazy loading of non-critical work;
- bounded data movement;
- responsive media;
- cache semantics with explicit identity, freshness, invalidation, and rights;
- context selection based on value and evidence rather than brute-force inclusion.

Performance optimization MUST preserve correctness, security, accessibility, provenance, and debuggability.

## 18. Architectural decision test

Before accepting a new architectural primitive, ask:

1. Which user/research/operational job does it serve?
2. Is the concept already represented by Rosetta or an adopted standard?
3. Can an existing component be configured/composed/extended instead?
4. Which boundary becomes clearer?
5. Which coupling or failure mode does it reduce?
6. What new security/maintenance surface does it create?
7. How will it be tested?
8. How can it be replaced or removed?
9. What is the smallest proof that would falsify the need for it?

If those answers are weak, the architecture is probably premature.
