# Genesis

**Version:** 0.4-draft  
**Status:** Proposed operating doctrine  
**Date:** 2026-08-29  
**Authority class:** Cross-project operating doctrine, subordinate to applicable law and domain-specific higher authorities; semantically subordinate to Rosetta v3.0.0  
**Scope:** Entif, Rosetta, and software or research projects that explicitly adopt this document  
**Audience:** Human and agentic contributors, reviewers, maintainers, researchers, operators, collaborators, and decision-makers

> Build the smallest honest thing that creates real value, prove it under contact, preserve what it means, and leave the next change safer, cheaper, clearer, and easier to revise than the last.

## 1. Purpose

Genesis defines the default operating posture for how Entif projects are conceived, researched, designed, implemented, tested, documented, reviewed, released, operated, learned from, and revised.

Genesis is intentionally **not** a second Rosetta protocol specification. It MUST NOT redefine Rosetta identifiers, Tiles, tile kinds, meaning-pipeline semantics, execution-spine semantics, conformance Profiles, Packs, Receipts, Tapestries, provenance relations, or other terminology already governed by the Rosetta v3.0.0 Core Spine Specification or an explicitly accepted successor.

Genesis exists to prevent recurring failures such as:

1. ambitious ideas accumulating faster than executable proof;
2. established concepts being silently re-created under slightly different names;
3. raw evidence, interpretation, uncertainty, decisions, and claims being collapsed into one undifferentiated statement;
4. maintained public standards being rebuilt as expensive private doctrine;
5. tools, frameworks, metrics, ceremonies, or personalities becoming sacred after their original context disappears;
6. roadmaps optimizing for backlog inventory or apparent sophistication instead of the next meaningful proof;
7. security, privacy, rights, accessibility, reliability, provenance, or maintainability being quietly spent to buy speed;
8. tests, dashboards, documentation, and generated prose producing confidence without corresponding truth;
9. teams depending on heroics, private context, ambient credentials, or irreplaceable individuals;
10. releases becoming too large to review deeply, reverse safely, or learn from cleanly;
11. local success being mistaken for interoperability, conformance, production fitness, or universality.

Genesis SHOULD remain much smaller than the body of practice it governs. Durable operating details belong in the companion documents under [`docs/governance/genesis/`](./genesis/README.md), in narrower project authorities, or in maintained external standards whenever those are sufficient.

## 2. Authority is scoped by the question

Entif does not use one indiscriminate precedence list for every kind of decision. Authority depends on what is being decided.

### 2.1 Binding external obligations

Applicable law, immediate human-safety duties, incident controls, contractual obligations, regulatory duties, accessibility requirements, privacy rights, and binding security requirements outrank local convenience and internal preference.

### 2.2 Rosetta semantic and protocol primacy

For **Rosetta and Entif semantic meaning, nomenclature, protocol structure, provenance, identity, execution tracing, interoperability, and conformance**, the paramount internal authority is:

- [`Rosetta v3.0.0 Core Spine Specification`](../RFCs/Rosetta%20v3.0.0%20Core%20Spine%20Specification.md)

Its **Normative Glossary / Terminology Lock** governs even while the document remains Draft, by explicit project decision, until it is explicitly superseded by an accepted successor.

Current Rosetta-aligned RFCs, PRDs, addenda, ROCK work, source-substrate specifications, and other companion authorities MAY refine or extend v3 within their declared scope. They MUST NOT silently redefine v3 core semantics. A conflict in core terminology resolves in favor of v3 unless a later authority explicitly states that it supersedes the affected v3 rule.

### 2.3 External standards retain their own domain authority

Where Entif adopts an external standard, vocabulary, ontology, or protocol, the maintained normative source for that standard remains authoritative within its domain. Rosetta integrates such authorities through its defined extension, anchoring, mapping, translator, StdPack, VocabPack, or other compatible mechanisms rather than pretending the external semantics originated locally.

### 2.4 Product and project authorities

Current PRDs, accepted RFCs, ADRs, threat models, release gates, commitment records, and project-specific contracts govern their declared product or implementation scope, provided they do not silently redefine a higher semantic or binding authority.

### 2.5 Genesis and its companions

Genesis governs cross-project **operating practice** where higher or narrower authorities are silent. Genesis companions elaborate this doctrine without becoming alternate protocol constitutions.

Repository-local conventions, team preferences, and tool defaults come last.

A lower authority MUST NOT silently weaken or rename a higher one. Supersession MUST be explicit, scoped, reviewable, and migration-safe.

## 3. Normative language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **NOT RECOMMENDED**, **MAY**, and **OPTIONAL** are interpreted as described by BCP 14, RFC 2119 and RFC 8174, when, and only when, they appear in all capitals.

Genesis uses ordinary lower-case English freely. An ordinary English word does not create a Rosetta protocol term. When a word overlaps a Terminology-Locked Rosetta term, contributors MUST distinguish ordinary prose from the protocol concept and MUST use the Rosetta definition whenever machine representation, conformance, or protocol meaning is intended.

## 4. Operating axioms

### 4.1 Value before volume

Work is valuable because it advances a user, research, safety, operational, or interoperability outcome, not because it creates many artifacts, issues, commits, meetings, agents, abstractions, or lines of code.

### 4.2 Evidence before confidence

Confidence MUST NOT outrun the quality, independence, relevance, provenance, and recency of supporting evidence. Several sources repeating one origin remain one evidentiary lineage.

### 4.3 Preserve evidence and uncertainty

Rosetta's separation of signals from semantics is foundational. Observations remain immutable evidence; interpretations, Conjectures, Evaluations, Epistemes, derived artifacts, and later decisions remain distinguishable and traceable to admissible support.

Genesis MUST NOT create a parallel epistemic taxonomy that competes with Rosetta v3.

### 4.4 Terminology is inherited before it is invented

**Adopt before inventing applies to language itself.**

Before introducing a named concept, artifact, state, relationship, identifier, protocol, classification, or machine-readable schema, contributors MUST determine whether an applicable higher-priority internal or adopted external authority already defines it.

Existing semantics SHOULD be reused, referenced, anchored, translated, specialized, or composed. Overlapping concepts MUST NOT be silently renamed, and established names MUST NOT be reused with incompatible meanings.

When Rosetta truly lacks a required semantic primitive, extension belongs through Rosetta's governed evolution mechanisms rather than through casual Genesis vocabulary growth.

### 4.4.1 Reconciliation before expansion

Before Genesis coins, defines, or canonizes any term concerning meaning, epistemics, provenance, process, identity, artifacts, execution, conformance, or interoperability, it MUST first resolve whether Rosetta v3, an accepted internal extension, or an adopted external authority already defines the concept.

Every reconciliation pass MUST follow five rules:

1. Treat Rosetta v3 as paramount for Rosetta/Entif semantic and protocol meaning until explicitly superseded.
2. Crosswalk every candidate term as exact reuse, specialization, composition, translation/projection, ordinary operating language, or a genuine semantic gap.
3. Remove aliases where an existing concept is sufficient; ordinary prose may remain natural, but protocol meaning MUST NOT fork.
4. Do not create a new canonical artifact schema when existing Rosetta Tiles, relationships, Policies, Receipts, provenance, or accepted extensions can faithfully compose the function.
5. Namespace genuinely separate application or operating concepts outside Rosetta core and record their relationship to the constitutional model.

The reconciliation MUST preserve explicit lineage for retained, strengthened, relocated, subordinated, retired, and deferred rules. See [`SEMANTIC_ALIGNMENT.md`](./genesis/SEMANTIC_ALIGNMENT.md), [`SEMANTIC_AUDIT.md`](./genesis/SEMANTIC_AUDIT.md), and [`SESSION_DECISION_COVERAGE.md`](./genesis/SESSION_DECISION_COVERAGE.md).

### 4.5 Prefer the smallest honest proof

Choose the least complicated step that materially advances the next important claim, produces inspectable evidence, and leaves a useful seam for what follows.

Large ambitions are valid. Delivery units SHOULD remain small.

### 4.6 Adopt, configure, compose, extend, then invent

Prefer the nearest maintained adequate solution. Move through this order only as evidence requires:

1. adopt;
2. configure;
3. compose;
4. wrap or adapt;
5. extend through a stable seam;
6. narrowly patch or fork;
7. replace;
8. invent only the irreducible remainder.

Popularity is evidence of operational contact, not proof of correctness. Novelty is permitted, but it creates a permanent ownership tax.

### 4.7 Compose behavior and bound mutation

Prefer explicit data flow, narrow contracts, replaceable components, small functions, and immutable state over deep inheritance and hidden shared mutation.

Necessary mutation belongs inside an accountable ownership boundary and SHOULD produce an attributable transition.

Taxonomy is not a justification for class inheritance. Behavioral composition is the default.

### 4.8 Centralize invariants; federate execution

Semantic, identity, rights, safety, provenance, and interoperability invariants may need central consistency. Implementation, experimentation, and domain specialization SHOULD remain as autonomous as those invariants safely permit.

### 4.9 Fail closed; degrade honestly

Unknown authorization, missing required provenance, invalid signatures, stale authority, unresolved identity, ambiguous rights, broken invariants, or absent required evidence MUST NOT silently become permission.

When full capability is unavailable, degrade to the safest useful state and make that state visible. Read-only, pending, stale, unverified, quarantined, indeterminate, or review-required are preferable to false green.

### 4.10 Side effects are authorized, bounded, observable, and recoverable

An operation that changes external state, authority, rights, money, identity, published content, or durable data requires proportionate authorization, bounded execution, observable postconditions, and recovery or compensation semantics.

Where represented in Rosetta, such execution MUST compose the v3 operational spine and existing Policy, Receipt, provenance, and related constructs rather than introducing a competing operation protocol in Genesis.

### 4.11 Implementation is a research instrument

Running code, schemas, fixtures, CLI/SDK behavior, conformance vectors, user trials, and interoperability experiments are not packaging after the theory. They are how the theory earns correction or trust.

### 4.12 Optimize systems, not heroic individuals

Exceptional leverage should be captured in tools, tests, documentation, contracts, interfaces, coaching, and reusable methods. Exhaustion, visibility, responsiveness at all hours, or irreplaceability are not evidence of excellence.

### 4.13 Metrics serve decisions

A metric is useful only while it informs a real decision without materially distorting the behavior it observes. Metrics are instruments, not objectives.

### 4.14 Reversibility is a strategic asset

Small changes, compatibility seams, feature flags, shadow modes, staged exposure, migration plans, append-only history, and rollback preserve freedom to learn.

### 4.15 Contact outranks self-description

A system earns claims through use, failure, adversarial testing, independent reproduction, external collaboration, and interoperability under real constraints. Internal elegance is not external validation.

## 5. Governing priority ladder

Some obligations, including applicable law and immediate human safety, are constraints rather than tradeable priorities. Within ordinary design, research, and engineering trade space, use this order.

### 5.1 Security, privacy, rights, and trustworthy control

Security is a product property, not a finishing pass. It includes confidentiality, integrity, availability, authorization, privacy, provenance, supply-chain integrity, abuse resistance, containment, safe failure, recovery, and accountable control.

A system that is elegant, accessible, fast, and compromised has failed.

Lower priorities MUST NOT spend security, privacy, rights, or safety without an explicit, scoped exception with an owner, evidence, compensating controls, expiry, rollback, and review authority.

### 5.2 Accessibility, open standards, and lawful interoperability

Interfaces MUST be usable by people with disabilities and SHOULD prefer open, stable, interoperable standards before proprietary conventions when those standards satisfy the actual job.

Accessibility and interoperability are architecture inputs, not polish applied after implementation.

### 5.3 Reliability, performance, and resource efficiency

Dependable, responsive systems preserve attention, reduce cost and waste, narrow failure surfaces, and often improve accessibility. Projects MUST define expectations appropriate to the workload, user journey, and risk.

### 5.4 Usability and cognitive clarity

People and agents should be able to determine what exists, what is authoritative, what is interactive, what an action will do, what changed, what failed, what is stale, what can be reversed, and where evidence came from.

### 5.5 Aesthetics, novelty, and convenience

Aesthetics, novelty, and convenience matter. They remain subordinate to the tiers above. Beauty should clarify structure rather than disguise it. Novelty must earn its implementation and maintenance cost.

## 6. Semantic integrity and truthful maturity

### 6.1 Rosetta terms stay Rosetta terms

When Genesis discusses Rosetta artifacts or semantics, it inherits v3 definitions. In particular, terms such as **Tile**, **CID**, **RID**, **XID**, **Run**, **Action**, **ToolCall**, **Observation**, **Evaluation**, **Pasigram**, **Form**, **Lexeme**, **Concept**, **Frame**, **Relation / Lattice Edge**, **Tapestry**, **Conjecture**, **Episteme**, **Matrix**, **Policy**, **Receipt**, **Incident**, **Delta Capsule**, **Profile**, **StdPack**, and **VocabPack** MUST NOT be locally redefined.

The companion [`SEMANTIC_ALIGNMENT.md`](./genesis/SEMANTIC_ALIGNMENT.md) records Genesis-specific naming hazards and mappings.

### 6.2 Human research language does not automatically mint protocol artifacts

Researchers MAY speak naturally about hypotheses, claims, decisions, results, summaries, projections, records, and evidence. When those ideas become machine-readable Rosetta artifacts, the representation MUST be mapped to existing Rosetta semantics first. For example, a research hypothesis may be represented by a Conjecture when the v3 Conjecture semantics actually fit; Genesis does not create a separate `hypothesis` tile merely because the word is useful in prose.

### 6.3 Capability-status vocabulary is documentation metadata

The following labels describe the maturity of an implementation claim. They are **not Rosetta tile kinds or conformance Profiles**:

| Label                     | Minimum meaning                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `proposed`                | An idea or candidate rule exists.                                                                             |
| `specified`               | A reviewable behavior, contract, or acceptance model exists.                                                  |
| `modeled`                 | A representation exists, but complete live behavior may not.                                                  |
| `implemented`             | Executable behavior exists on the named surface.                                                              |
| `tested`                  | Named behavior is covered by meaningful checks on the stated environment.                                     |
| `fixture-backed`          | Real code executes over controlled non-live inputs.                                                           |
| `demo-proven`             | A bounded end-to-end path has been independently reproduced.                                                  |
| `conformant`              | A named Rosetta or external conformance suite/profile/version passes.                                         |
| `interoperability-proven` | Independent systems exchanged the stated semantics with bounded, recorded loss.                               |
| `release-candidate`       | Declared release gates pass and remaining risk is explicit.                                                   |
| `production-observed`     | The capability has operated under named real conditions with evidence.                                        |
| `production-hardened`     | Sustained operation, incident learning, recovery exercises, and risk-appropriate assurance support the claim. |
| `rung-complete`           | Every declared gate for the named maturity rung has passed.                                                   |

Projects MAY use fewer labels. They MUST NOT use a broader label to imply evidence they do not possess.

**Demo Green** is shorthand for a bounded, honest vertical slice that works and can be reproduced. **Rung Green** means every declared gate for a named maturity rung has passed. Neither phrase creates a Rosetta semantic class.

## 7. Standards and invention discipline

A maintained external standard, library, framework, service, ontology, or vocabulary is preferred when it is sufficiently aligned, secure, current, interoperable, maintainable, and adaptable to meet the project quality bar without disproportionate risk.

Before bespoke invention, identify:

- the closest maintained alternatives;
- the exact unmet requirement;
- why adoption, configuration, composition, wrapping, translation, or narrow extension is insufficient;
- the smallest experiment that can test the deficiency;
- new security, maintenance, interoperability, and documentation surfaces;
- migration and abandonment paths;
- long-term ownership.

Do not own what can be reliably inherited.

External standards MUST be adopted by named version or dated profile where version identity matters. A moving URL does not silently amend local law.

## 8. Architecture posture

Important systems SHOULD make the following boundaries explicit:

- canonical source of truth versus derived views, caches, indexes, summaries, and UI state;
- read and write authority;
- identity, tenant, classification, and rights domains;
- trust and validation boundaries;
- side-effect boundaries;
- failure, retry, cancellation, and recovery boundaries;
- version, compatibility, and migration boundaries;
- observability and Rosetta Receipt/provenance boundaries where applicable.

Raw evidence MUST NOT be overwritten by interpretation. Derived artifacts must remain traceable to admissible support.

Caches, indexes, embeddings, summaries, generated documentation, model context, and dashboards are not canonical merely because they are convenient.

Prefer a deterministic core with isolated effects. Randomness, model inference, time, network state, environment state, nondeterministic concurrency, and human judgment SHOULD be represented as explicit inputs or evidence when they materially affect a result.

A successful return code is not proof of a successful outcome. Verify the postcondition.

Detailed engineering guidance lives in [`ENGINEERING_AND_ARCHITECTURE.md`](./genesis/ENGINEERING_AND_ARCHITECTURE.md).

## 9. Roadmaps follow proofs, not inventories

A backlog is a reservoir of researched possible moves, not a command to execute everything.

Distinguish:

- **valuable work:** likely to improve the eventual system;
- **currently unblocking work:** required for the next important proof, decision, user outcome, safety property, or honest maturity claim.

Maintain a **small current path to the next proof**. Do not call this an alternate Rosetta "spine". The path should overwhelmingly contain executable leaf work whose absence makes the next declared proof impossible, dishonest, or unacceptably risky.

Useful planning states are `now`, `next`, `later`, and `blocked`. They are workflow labels, not Rosetta protocol states.

Do not finish an imagined final dependency graph before testing the next useful vertical slice. Implement the minimum sufficient dependency closure required to run, inspect, falsify, and learn.

For major commitments, use the existing [Consensus-First Commitment Scoping Framework](<../PRDs/20260325%20-%20Consensus-First%20Commitment%20Scoping%20Framework%20(v0.1).md>) rather than recreating its decision grammar in Genesis.

Detailed delivery guidance lives in [`DELIVERY_AND_COLLABORATION.md`](./genesis/DELIVERY_AND_COLLABORATION.md).

## 10. Tests are an assurance system

Tests reduce uncertainty about important behavior. They do not manufacture certainty by percentage.

Meaningful assurance SHOULD cover intended behavior, important invalid or denied behavior, boundaries, integration contracts, recovery, compatibility, security/rights behavior, and accessibility behavior in proportion to risk.

For critical behavior, deliberately introduce plausible faults and verify that the assurance system detects and explains them. Appropriate tools may include mutation testing, property-based testing, fuzzing, parser differential tests, dependency fault injection, concurrency and retry tests, contained chaos experiments, security abuse cases, and recovery drills.

Coverage reports where tests traveled. Raw coverage percentage MUST NOT be a standalone team target, release claim, or individual performance measure.

**Tests preserve behavior. Comments preserve intent and context.** Regression-sensitive code SHOULD preserve the reason a tempting simplification is wrong, preferably near the affected code and linked to durable evidence where useful.

Detailed assurance and operational guidance lives in [`ASSURANCE_AND_OPERATIONS.md`](./genesis/ASSURANCE_AND_OPERATIONS.md).

## 11. Security and agentic work

Agents are contributors and operators, not exemptions from governance.

Agentic systems MUST operate with explicit objectives, bounded tools/context/time/cost/retries/egress, least privilege, proportionate checkpoints before material mutation, independent validation where practical, and safe-hold behavior when authority, policy, identity, provenance, or system state becomes uncertain.

Untrusted text MUST NOT become executable intent merely because a model interpreted it as an instruction.

Rights MUST be enforced before retrieval, processing, caching, or disclosure for scoped or sensitive material. Retrieve-then-filter is forbidden where it would expose unauthorized material to a component that should never receive it.

An agent's statement that a command passed is not verification. Prefer command output, artifacts, status checks, cryptographic evidence, Rosetta Receipts, or independent reruns as appropriate.

High-risk, identity-sensitive, irreversible, externally published, or authority-changing actions require the configured human or governance authority.

Detailed controls live in [`SECURITY_RIGHTS_AND_AGENTIC_CONTROL.md`](./genesis/SECURITY_RIGHTS_AND_AGENTIC_CONTROL.md).

## 12. Accessibility and interface clarity

For web experiences, WCAG 2.2 Level AA is the minimum general baseline unless a higher authority requires more. WCAG 3 remains developing guidance until its status changes and an explicit adoption decision is made.

Prefer semantic native controls. Preserve keyboard operation, visible focus, logical reading/focus order, reflow and zoom, reduced-motion preferences, adequate target size, sufficient contrast, meaningful labels/errors, and non-color-only state communication.

Interaction affordances should be distinguishable without hover, experimentation, or private team knowledge. Controls, navigation, taxonomy, metadata, status, and decorative elements SHOULD have visibly and semantically distinct roles. A polished interface should reduce cognitive tax rather than require users to reverse-engineer its visual grammar.

Light and dark themes MUST preserve equivalent semantic hierarchy, affordance clarity, and accessibility.

Detailed guidance lives in [`INTERFACE_AND_ACCESSIBILITY.md`](./genesis/INTERFACE_AND_ACCESSIBILITY.md).

## 13. Documentation and publication are product surfaces

A sophisticated external contributor should be able to determine quickly:

- what the project is;
- what actually exists today;
- what explicitly does not exist;
- why it matters;
- how to run the smallest honest example;
- how to inspect resulting Rosetta artifacts;
- how to deliberately break an invariant and observe failure;
- where governing authorities live;
- how to contribute safely.

Examples and commands SHOULD be executable and checked in CI when practical.

For published technical and research content, optimize in this order:

1. truth and provenance;
2. semantic fidelity;
3. audience comprehension;
4. editorial clarity;
5. project voice;
6. stylistic flourish.

Do not optimize prose to evade AI detection. Optimize for correctness, usefulness, clarity, originality, precision, engagement, and fitness for purpose. Generated text is a draft contribution, not an authority.

Publication authority remains with the configured human or governance mechanism.

Detailed documentation and editorial guidance lives in [`DOCUMENTATION_AND_PUBLICATION.md`](./genesis/DOCUMENTATION_AND_PUBLICATION.md).

## 14. Research implementation and interoperability

The Rosetta CLI, SDKs, schemas, fixtures, validators, and reference workflows are first-class research instruments.

The practical research loop is:

```text
source
  -> Rosetta artifacts
  -> inspect / validate / transform
  -> provenance and evidence
  -> evaluation / ambiguity / promotion behavior
  -> Receipt / closure
  -> export / exchange
```

This shorthand describes a developer/researcher journey. It does not supersede the normative Rosetta v3 meaning or execution pipeline.

The workbench SHOULD favor deterministic behavior, JSON-in/JSON-out where suitable, stable schema identifiers, inspectable intermediate artifacts, excellent positive/negative/adversarial fixtures, explicit translation loss, machine-readable and human-repairable errors, composable commands, and minimal setup.

A capable external researcher should be able to clone the repository, run one honest example, inspect the artifacts, break an invariant, and understand the failure without reading the entire canon.

External collaboration supplies high-value evidence: missing primitives, ambiguous contracts, representation mismatches, translation loss, desired queries, falsification cases, and reusable fixtures or adapters. Repeated independent signals increase roadmap pressure, but popularity does not override constitutional semantics.

Rosetta's universality remains a hypothesis until diverse independent systems exchange meaning with bounded, inspectable loss.

Detailed research/collaboration guidance lives in [`RESEARCH_AND_INTEROPERABILITY.md`](./genesis/RESEARCH_AND_INTEROPERABILITY.md).

## 15. People, teams, and sustainable performance

The durable unit of excellence is the system that enables good work to recur.

Strong contributors SHOULD multiply others through design, teaching, review, automation, documentation, tools, empathy, and reliable execution. Critical systems MUST NOT depend indefinitely on one person's private memory or credentials.

Urgency is not a moral virtue. Exhaustion is not evidence of commitment. Visible activity is not evidence of progress.

Distributed collaboration requires explicit context, predictable handoffs, equitable access to consequential discussion, and trust across geography, language, accent, schedule, and proximity to leadership.

Meetings and ceremonies are replaceable coordination tools. They SHOULD exist only while they change decisions, reveal risk, transfer knowledge, repair relationships, or accelerate useful work.

Detailed collaboration practice lives in [`DELIVERY_AND_COLLABORATION.md`](./genesis/DELIVERY_AND_COLLABORATION.md).

## 16. Metrics are instruments, never performance theater

Before adopting a metric, identify the decision it informs, the outcome it approximates, how it can be gamed, confounders, privacy/retention consequences, counter-signals, owner, collection cost, and retirement condition.

Never rank individual engineers by story points, commits, pull requests, lines changed, coding time, coverage, defect counts, review comments, or similarly gameable proxies.

Do not demand a fixed increase in coverage, velocity, Lighthouse score, benchmark score, agent success rate, commits, or any other metric every sprint.

Trust, novelty, relevance, urgency, value, resilience, risk, verification cost, decay, and revisitability MUST NOT be collapsed into one universal master score. Preserve the relevant dimensions and use decision-specific reducers, dominance rules, guardrails, or qualitative judgment appropriate to the actual decision.

A dashboard is an instrument panel, not reality.

## 17. Small changes, frequent evidence-bearing releases

Prefer a continuous sequence of coherent, reviewable improvements over rare giant releases.

A good change:

- has one coherent objective;
- changes as few independent assumptions as practical;
- carries appropriate tests and documentation;
- preserves rollback or compensation;
- exposes migration when contracts change;
- is small enough to review deeply;
- produces a demonstrable capability, stronger invariant, clearer boundary, or useful negative result.

Release claims MUST name their actual scope and evidence. `Implemented`, `demo-proven`, `conformant`, and `production-hardened` are not synonyms.

## 18. Exceptions and evolution

A material exception MUST record:

- the rule or adopted standard being changed;
- scope and context;
- evidence and uncertainty;
- affected people and systems;
- risk and beneficiaries;
- decision owner and authority;
- compensating controls;
- start date;
- review or expiry condition;
- migration, rollback, or removal path.

Temporary exceptions expire or are renewed explicitly. Repeated exceptions are evidence that the rule, companion, or architecture needs revision.

Genesis changes through reviewable pull requests. A rule SHOULD be added only when it resolves recurring ambiguity, records a durable cross-project decision, prevents a demonstrated failure, establishes a needed priority rule, removes harmful doctrine, or replaces private duplication with a better authority.

Silent drift is not evolution.

## 19. Genesis companion structure

The companion collection under [`docs/governance/genesis/`](./genesis/README.md) elaborates this lean doctrine:

- [`SEMANTIC_ALIGNMENT.md`](./genesis/SEMANTIC_ALIGNMENT.md) — Rosetta v3 terminology inheritance, collision prevention, and extension discipline.
- [`SECURITY_RIGHTS_AND_AGENTIC_CONTROL.md`](./genesis/SECURITY_RIGHTS_AND_AGENTIC_CONTROL.md) — security, privacy, rights, supply chain, and bounded agentic operation.
- [`ENGINEERING_AND_ARCHITECTURE.md`](./genesis/ENGINEERING_AND_ARCHITECTURE.md) — architecture, composition, state, dependencies, code quality, comments, migrations, and replaceability.
- [`INTERFACE_AND_ACCESSIBILITY.md`](./genesis/INTERFACE_AND_ACCESSIBILITY.md) — accessibility, interaction clarity, semantic UI, responsive behavior, design systems, and performance-aware interface practice.
- [`ASSURANCE_AND_OPERATIONS.md`](./genesis/ASSURANCE_AND_OPERATIONS.md) — testing, adversarial assurance, reliability, recoverability, observability, metrics, and releases.
- [`DELIVERY_AND_COLLABORATION.md`](./genesis/DELIVERY_AND_COLLABORATION.md) — proof-oriented roadmaps, branches, pull requests, review, estimation, meetings, teams, and handoffs.
- [`DOCUMENTATION_AND_PUBLICATION.md`](./genesis/DOCUMENTATION_AND_PUBLICATION.md) — documentation architecture, executable examples, writing, generated content, publication, and correspondence rights.
- [`RESEARCH_AND_INTEROPERABILITY.md`](./genesis/RESEARCH_AND_INTEROPERABILITY.md) - Rosetta workbench, clone-to-insight, collaboration signals, experiments, and earned interoperability.
- [`SEMANTIC_AUDIT.md`](./genesis/SEMANTIC_AUDIT.md) - living semantic/schema crosswalk and duplication-debt audit.
- [`SESSION_DECISION_COVERAGE.md`](./genesis/SESSION_DECISION_COVERAGE.md) - non-normative traceability map for durable decisions from the 2026-08-28/29 design session.
- [`GENESIS_SOURCE_SYNTHESIS.md`](./GENESIS_SOURCE_SYNTHESIS.md) - non-normative provenance and disposition ledger for the historical synthesis.

These documents play a modular role analogous to companion specification material, but they are **not** Rosetta StdPacks, VocabPacks, ROCK packs, or Rosetta conformance Profiles unless a separate Rosetta authority explicitly makes them so.

## 20. Compact operating creed

1. Protect people, rights, authority, and evidence before convenience.
2. Rosetta v3 owns Rosetta meaning; Genesis does not create a shadow vocabulary.
3. Adopt before inventing applies to terminology as well as technology.
4. Preserve Observations, uncertainty, and provenance.
5. Confidence follows evidence.
6. Start from the job and the next honest proof.
7. Adopt, configure, compose, wrap, extend, then invent.
8. Compose behavior and isolate mutation.
9. Centralize invariants; federate execution.
10. Fail closed and degrade honestly.
11. Make side effects authorized, bounded, observable, and recoverable.
12. Use comments for intent and tests for behavior.
13. Test whether plausible faults are detected, not merely whether lines are visited.
14. Treat metrics as instruments, never as objectives.
15. Ship small enough to review deeply and reverse cheaply.
16. Document the real system, including what it cannot yet do.
17. Govern agentic work at least as rigorously as human work.
18. Reduce cognitive tax in interfaces and collaboration.
19. Reject hero culture; capture leverage in the system.
20. Let external contact pressure-test claims of interoperability.
21. Preserve lineage when doctrine changes.
22. No sacred cows: strong defaults, explicit reasons, revisable conclusions.

## 21. Primary internal foundations

Genesis composes with, and does not supersede, the repository's higher or narrower authorities. The most important semantic authority is the first item below.

- [Rosetta v3.0.0 Core Spine Specification](../RFCs/Rosetta%20v3.0.0%20Core%20Spine%20Specification.md)
- [Ontological Mixture of Concepts and Swarm Gnosis Protocol](<../RFCs/20260412%20-%20Rosetta%20-%20Ontological%20Mixture%20of%20Concepts%20(OMOC)%20-%20Swarm%20Gnosis%20Protocol%20Spec.md>)
- [Agentic Memory and Graph Design Doctrine](../RFCs/20260324%20-%20Entif%20AI%20-%20Specification%20-%20Agentic%20Memory%20and%20Graph%20Design%20Doctrine.md)
- [Entif and Rosetta PRD](../PRDs/20260426%20-%20Entif%20and%20Rosetta%20PRD.md)
- [Context CLI and Memory Services PRD](../PRDs/20260426%20-%20Entif%20-%20PRD%20-%20Context%20CLI%20and%20Memory%20Services.md)
- [Consensus-First Commitment Scoping Framework](<../PRDs/20260325%20-%20Consensus-First%20Commitment%20Scoping%20Framework%20(v0.1).md>)
- [Normative Staging Doctrine](<./20260410%20-%20Entif.AI%20-%20Rosetta%20-%20Normative%20Staging%20Doctrine%20(v0.2).md>)
- [Source Substrate and Repository Provenance Addendum](./20260412%20-%20Entif%20Source%20Substrate%20and%20Repository%20Provenance%20Addendum.md)
- [Source Registry and Repository Profile Annex](./20260412%20-%20Source%20Registry%20and%20Repository%20Profile%20Annex.md)
- [Repository Shape and Constraints](./REPO_SHAPE_AND_CONSTRAINTS.md)
- [Authority Stack](./AUTHORITY_STACK.md)

## 22. External baselines

Projects SHOULD pin the exact version they adopt. Moving external standards are not silently incorporated merely because a URL now serves newer text.

Common baselines currently include:

- [BCP 14: RFC 2119 and RFC 8174](https://www.rfc-editor.org/info/bcp14/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [NIST SP 800-218, Secure Software Development Framework 1.1](https://csrc.nist.gov/pubs/sp/800/218/final)
- [NIST SP 800-218A, Generative AI and Dual-Use Foundation Model SSDF Community Profile](https://csrc.nist.gov/pubs/sp/800/218/a/final)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [OWASP Software Assurance Maturity Model](https://owaspsamm.org/model/)
- [SLSA](https://slsa.dev/spec/)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/)
- [Diátaxis](https://diataxis.fr/)
- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Microsoft Writing Style Guide](https://learn.microsoft.com/style-guide/)
- [Vale](https://vale.sh/)

Developing guidance MAY inform experiments. It MUST NOT be represented as a stable compliance target until explicitly adopted at an appropriate status/version.
