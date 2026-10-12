# Genesis Source Synthesis and Disposition Ledger

**Status:** Non-normative review companion  
**Date:** 2026-08-29  
**Applies to:** [Genesis 0.2-draft](./Genesis.md)  
**Primary historical corpus:** [`crates/industry-best-practices/Development Book`](https://github.com/crates/industry-best-practices/tree/master/Development%20Book)  
**Purpose:** Preserve the lineage of the operating doctrine without turning historical tools, terminology, or assumptions into timeless law

> **Historical status note:** This ledger records the Genesis 0.2 synthesis. The current candidate is [`Genesis 0.4-draft`](./Genesis.md), with semantic corrections recorded in [`genesis/V0_4_RECONCILIATION.md`](./genesis/V0_4_RECONCILIATION.md), [`genesis/SEMANTIC_AUDIT.md`](./genesis/SEMANTIC_AUDIT.md), and [`genesis/SESSION_DECISION_COVERAGE.md`](./genesis/SESSION_DECISION_COVERAGE.md). This file remains unchanged in substance so the earlier synthesis is inspectable rather than retroactively rewritten.

## 1. Why this ledger exists

Genesis 0.2 is a synthesis, not an anthology.

The Development Book contains more than two decades of practical engineering instincts expressed through the tools, organizational structures, and vocabulary available when its notes were written. Much of its strongest advice remains valuable. Some of its implementation prescriptions have aged. A smaller set now conflicts with the evidence-centered, rights-aware, sustainable, agent-governed posture of Rosetta and Entif.

This ledger records what happened to those ideas.

It serves four purposes:

1. preserve intellectual provenance;
2. prevent silent deletion or silent canonization;
3. distinguish durable intent from historical mechanism;
4. make later Genesis revisions challengeable against the actual source material.

This document is not itself operating law. When it conflicts with Genesis, a higher Rosetta authority, or a source it characterizes, inspect the source and resolve the discrepancy explicitly.

## 2. Source boundary

The synthesis used three source families.

### 2.1 Historical Development Book

The complete path inventory under `Development Book/` was reviewed. The analysis then concentrated on the Markdown files that contain substantive engineering, delivery, architecture, testing, operations, team, privacy, analytics, and product doctrine. Tool-specific and resource-only Markdown was classified by family rather than promoted line by line.

The corpus also contains:

- placeholders and empty outlines;
- link collections;
- diagrams and PDF handouts;
- historical vendor and library notes;
- language-specific examples;
- career, interview, compensation, and general business resources;
- security reference material whose subject belongs in narrower profiles.

Those materials were not all promoted into Genesis. A universal operating doctrine should not become an attic merely because the attic is interesting.

### 2.2 Genesis 0.1 and the 2026-08-28/29 design sessions

Genesis 0.1 supplied the initial cross-project doctrine: priority ordering, standards-first adoption, composition, bounded mutation, evidence-conscious claims, testing as assurance, governed agentic work, the Execution Spine, Demo Green versus Rung Green, the Rosetta workbench, collaboration pressure signals, and earned interoperability.

The design-session transcripts supplied additional context around:

- security, accessibility, and performance precedence;
- requirements versus recommendations versus preferences;
- publication as a governed research pipeline;
- human publication authority;
- content quality and prose linting;
- epistemic quality preceding editorial polish;
- metrics as instruments rather than objectives;
- adoption, composition, extension, and invention thresholds.

### 2.3 Current Rosetta repository authorities

The live repository supplied the implementation and governance context in which Genesis must operate, including:

- Rosetta as the constitutional meaning and provenance lane;
- focused `codex/` branches and coherent pull-request slices;
- Conventional Commits;
- test-first behavior changes;
- targeted development validation and broader integration gates;
- current handoffs and documentation intake;
- TypeScript, Nx, and pnpm as Rosetta's current canonical implementation lane;
- explicit separation between planning-time documentation intelligence and future Rosetta-native corpus ingestion.

## 3. Disposition vocabulary

Each source idea received one or more of the following dispositions.

| Disposition     | Meaning                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| **Preserve**    | The principle remains sound with little semantic change.                                                     |
| **Elevate**     | A useful practice becomes a clearer cross-project invariant.                                                 |
| **Transmute**   | The original objective survives, but the mechanism or framing changes materially.                            |
| **Constrain**   | The idea remains useful only within a named context, risk class, or profile.                                 |
| **Retire**      | The idea is omitted because evidence, ethics, tooling, or current architecture makes it harmful or obsolete. |
| **Exclude**     | The material may remain useful, but it is outside Genesis's scope.                                           |
| **Defer**       | The question belongs in a later profile, RFC, ADR, or experiment.                                            |
| **Subordinate** | The material remains relevant but is governed by a higher or more current authority.                         |

Retirement is not condemnation of the historical author or context. It means the idea should not govern current work by default.

## 4. Synthesis principles

### 4.1 Preserve intent more readily than machinery

The older notes often identify a real organizational or technical failure, then solve it with the best available mechanism of the period. Revision 2 preserves the failure analysis while reconsidering the mechanism.

Example:

- durable intent: unfinished work should be isolated, releases should have explicit state, hotfixes should minimize unrelated change;
- historical mechanism: long-lived `develop`, `staging`, `release`, and production branches;
- Revision 2 mechanism: protected mainline, short-lived branches, known-artifact promotion, release tags, environment controls, canaries, and feature flags where useful.

### 4.2 Convert rules into outcomes and evidence

Several older practices use activity or conformance proxies because they were easy to observe: comments per review, tests per method, coding hours, velocity, branch choreography, or meeting attendance.

Revision 2 asks what outcome the proxy was meant to protect, then chooses evidence closer to that outcome.

### 4.3 Keep universal doctrine thinner than project profiles

React conventions, Node libraries, serverless vendors, cloud architecture, specific branch names, issue trackers, and team calendars may be excellent local choices. They do not become Genesis invariants merely because they once worked well.

### 4.4 Add the missing epistemic and agentic layer

The historical corpus predates Rosetta's mature distinction among source, observation, interpretation, conjecture, evaluation, receipt, cache, and projection. It also predates contemporary agentic execution, model-generated code, prompt injection, autonomous tools, and AI-assisted publication.

Revision 2 adds those controls without pretending they were present in the old notes.

## 5. Source-control and integration crosswalk

Paths in the tables below are relative to `Development Book/`.

| Source                                      | Disposition           | Durable contribution                                                                                   | Revision 2 treatment                                                                                                                                           |
| ------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `00 - Shaping the Book.md`                  | Exclude               | Early outline intent                                                                                   | Placeholder content does not create doctrine.                                                                                                                  |
| `01 - Source Control Strategies.md`         | Exclude               | Section framing                                                                                        | The substantive rules come from its child documents.                                                                                                           |
| `01.01 - GitFlow.md`                        | Transmute, Constrain  | Isolate unfinished work; make release state explicit; separate urgent repairs; preserve recoverability | GitFlow is not the default. Revision 2 uses protected mainline and short-lived branches, while permitting GitFlow when release topology genuinely requires it. |
| `01.02 - Conventional Commits.md`           | Preserve, Subordinate | Commit history should communicate intent to humans and automation                                      | Retained and aligned to Conventional Commits 1.0.0. Commit types do not replace meaningful descriptions.                                                       |
| `01.03 - Merge Requests.md`                 | Preserve, Transmute   | Small reviewable changes; clear purpose; validation; collaboration before integration                  | Generalized to the pull-request evidence contract and risk-ordered review. Tool-specific GitLab language is removed.                                           |
| `01.04 - Peer Reviews and Pull Requests.md` | Preserve, Elevate     | Review catches defects, transfers knowledge, and reduces concentrated ownership                        | Elevated into review as knowledge diffusion, risk-based reviewer selection, and avoidance of one-lead bottlenecks.                                             |
| `01.04.01 - Code Merge Checklist.pdf`       | Defer                 | Practical merge checklist                                                                              | Binary handout remains reference material. Applicable ideas are represented by Definition of Done and the PR contract.                                         |
| `01.04.02 - Gitflow Branching Scheme.pdf`   | Constrain             | Visual explanation of historical GitFlow topology                                                      | Retained only as historical/reference material, not Genesis law.                                                                                               |

### Resulting doctrine

Revision 2 keeps source-control history meaningful but refuses to confuse branch topology with governance. The governing outcomes are isolation, reviewability, integration safety, artifact identity, recoverability, and traceable authority.

## 6. Planning, flow, and feedback crosswalk

| Source                                             | Disposition                         | Durable contribution                                                                  | Revision 2 treatment                                                                                                                                       |
| -------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `02 - Agile Practices and Ceremonies.md`           | Preserve, Transmute                 | Feedback, incremental value, implementer involvement, sustainable improvement         | Genesis is method-neutral. Ceremonies are replaceable mechanisms that must earn their coordination cost.                                                   |
| `02 - Sprint Planning and Story Grooming.pdf`      | Constrain                           | Planning preparation and shared scope                                                 | Useful within sprint-based profiles, not universal doctrine.                                                                                               |
| `02.01 - Tracking Work.md`                         | Exclude                             | Placeholder                                                                           | No substantive rule to preserve.                                                                                                                           |
| `02.01.01 - JIRA Tips.md`                          | Preserve selectively, Transmute     | Short composable labels and closure evidence improve discoverability and verification | Tool-specific labels become taxonomy guidance; closure comments become evidence-bearing completion records rather than a JIRA mandate.                     |
| `02.01.02 - JIRA Filters.md`                       | Constrain, Archive                  | Saved views expose stalled, unassigned, unreviewed, or aging work                     | The queries are employer- and schema-specific. Their intent survives in observable workflow states and exception views.                                    |
| `02.02 - Daily Developer Checklist.md`             | Transmute                           | Keep work synchronized, validated, documented, and visible                            | Generalized into the evidence-bearing change lifecycle and handoff contract. Daily ritual is optional.                                                     |
| `02.02.01 - Getting Help with Blocking Tasks.md`   | Preserve, Correct                   | Surface blocks early; show attempts and evidence; reroute useful work                 | Retained. "No zero hours" and optics-driven activity are explicitly retired. Being blocked is not moral failure.                                           |
| `02.02.02 - Daily Jira Checkups.md`                | Transmute, Retire in part           | Keep assigned work states, ownership, and handoffs accurate                           | Retains truthful state and self-management. Retires frequent status ritual, reputation optics, and the assumption that visible ticket motion proves value. |
| `02.03 - Sprint Retrospectives.md`                 | Preserve, Elevate                   | Blameless learning, action items, continuous improvement                              | Expanded to retrospectives, post-experiment reviews, and incident learning with owners and verification.                                                   |
| `02.04 - Estimating Effort.md`                     | Transmute                           | Make uncertainty and assumptions visible; use analogous evidence                      | Estimates become conditional ranges with confidence, dependencies, and re-estimation triggers. False precision and point-to-day conversion are rejected.   |
| `02.05 - Velocity and Productivity.md`             | Transmute, Retire in part           | Understand flow and remove systemic friction                                          | Team/system flow survives. Velocity as individual productivity, output pressure, and activity worship are retired.                                         |
| `02.05.01 - OODA Loop in Agile.md`                 | Preserve, Elevate                   | Fast observe-orient-decide-act feedback                                               | Integrated into the twelve-state change lifecycle and implementation-as-research loop.                                                                     |
| `02.05.01 - Sprint Health Metrics.md`              | Preserve, Transmute, Retire in part | Use delivery, defect, review, rollback, and morale signals to diagnose the system     | Retains balanced signals. Retires PRs-per-developer, comments-per-review, coverage quotas, and cross-team rankings.                                        |
| `02.06 - Hosting Productive Meetings.md`           | Preserve, Transmute                 | Meetings need purpose, preparation, facilitation, decisions, and follow-through       | Becomes the synchronous communication warrant and decision-receipt model.                                                                                  |
| `02.06.01 - Cardinal Meeting Sins.md`              | Preserve, Correct                   | Protect attention; avoid aimless or oversized meetings                                | Retained without camera policing, attendance theater, or personality judgments.                                                                            |
| `02.06.02 - More Efficient Whole-Team Meetings.md` | Preserve                            | Use the smallest necessary audience and asynchronous preparation                      | Elevated into "attendance is a cost, not a courtesy tax."                                                                                                  |
| `02.07 - Writing and Actioning Stories.md`         | Preserve, Transmute                 | State value, acceptance, boundaries, and completion                                   | Generalized from user stories into job contracts, research contracts, change evidence packets, and Definition of Ready.                                    |
| `02.07.01 - Story Granularity.md`                  | Preserve, Elevate                   | Prefer small vertical slices with observable value                                    | Integrated into the Execution Spine and minimum sufficient dependency closure.                                                                             |

### Resulting doctrine

Revision 2 keeps Agile's learning metabolism and discards Agile theater. The unit of progress is an evidence-producing change, not a completed ceremony or a favorable velocity graph.

## 7. Team and organization crosswalk

| Source                                                 | Disposition                     | Durable contribution                                                                       | Revision 2 treatment                                                                                                                                    |
| ------------------------------------------------------ | ------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `03 - Building and Grooming the Team.md`               | Preserve, Modernize             | Deliberate team design, coaching, knowledge distribution                                   | Integrated into bounded autonomy, onboarding, handoffs, bus-factor reduction, and federated organization.                                               |
| `03.01 - 10x Devs.md`                                  | Transmute, Retire in part       | Exceptional contributors multiply others through teaching, design, and leverage            | The multiplier survives. The hero label, irreplaceability, and output mythology are retired.                                                            |
| `03.02 - Distributed and Remote Teams.md`              | Preserve, Correct               | Written context, autonomy, overlap, trust, and deliberate communication                    | Retained with explicit rejection of geography, accent, native language, camera presence, or proximity as competence proxies.                            |
| `03.03 - 8 Cs of Successful Teamwork.md`               | Preserve selectively            | Clarity, communication, collaboration, competence, commitment, and related team conditions | Folded into collaboration defaults without canonizing a mnemonic.                                                                                       |
| `03.04 - Teaching the Team.md`                         | Preserve as intent, Subordinate | Technical teaching and self-education deserve deliberate practice                          | The file is chiefly a link pointer. Revision 2 preserves teaching as a bus-factor and multiplier obligation while relying on current learning practice. |
| `03.05 - Massive, Successful Teams.md`                 | Preserve, Elevate               | Small autonomous teams, shared services, communities of practice, limited centralization   | Becomes "centralize invariants; federate execution," with cells and councils/guilds.                                                                    |
| `03.06 - Laws of Software and Agile.md`                | Preserve selectively            | Historical laws can expose recurring system behavior                                       | Treated as heuristics, not deterministic laws or substitutes for local evidence.                                                                        |
| team hiring, interview, career, and compensation notes | Exclude                         | Potentially useful management resources                                                    | Outside the scope of a cross-project engineering operating doctrine.                                                                                    |

### Resulting doctrine

Revision 2 shifts the object of optimization from the heroic developer to the knowledge-multiplying system. Individual excellence is welcomed, but the organization must capture it in reusable infrastructure and shared understanding.

## 8. Architecture and implementation crosswalk

| Source                                               | Disposition                     | Durable contribution                                                                                | Revision 2 treatment                                                                                                                                                         |
| ---------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `04 - App Architecture Patterns and Processes.md`    | Preserve, Transmute             | Reusable architecture, automation, consistency, and explicit process                                | Converted into boundary, replaceability, evidence, and standards-inheritance rules rather than a universal application stack.                                                |
| `04.01 - Jumpstarting New Projects.md`               | Preserve, Modernize             | Automate repeatable setup; make good defaults cheap; reduce bootstrap variance                      | Retained through adoption profiles, reproducible environments, and clone-to-insight goals. Specific generators and vendors remain local.                                     |
| `04.01.01 - Patterns and Best Practices.md`          | Preserve selectively            | Functional decomposition, API separation, reusable components, immutable data, CI/CD, observability | Strong ideas elevated; language-specific and era-specific prescriptions moved below Genesis.                                                                                 |
| `04.01.02 - App Architecture Diagrams.md`            | Transmute                       | Diagrams improve shared understanding                                                               | Diagrams become versioned maps with declared scope, omissions, and links to authoritative contracts.                                                                         |
| `04.02 - Paid Integrations.md`                       | Preserve, Elevate               | Evaluate integrations by more than purchase price                                                   | Expanded to lifetime ownership, lock-in, privacy, failure, portability, and exit.                                                                                            |
| `04.03 - Framework Fatigue.md`                       | Preserve, Elevate               | Avoid novelty churn; isolate dependencies; favor replaceable seams                                  | Integrated into the adoption ladder and replaceability contract.                                                                                                             |
| `04.04 - Request Performance and Resilience.md`      | Preserve, Elevate               | Timeouts, retries, fallbacks, caching, circuit breaking, and observable failure                     | Generalized into the recoverable-operation contract, backpressure, and reliability doctrine.                                                                                 |
| `04.05 - Progressive Web Apps vs Native Apps.md`     | Constrain, Archive              | Choose delivery form from capability and user needs rather than fashion                             | The file is mainly a 2016-2020 bibliography. PWA, native, and web choices belong in a current product profile.                                                               |
| `04.06 - Taking On Legacy Code.md`                   | Preserve, Elevate               | Characterize before changing; test behavior; avoid reflex rewrites                                  | Expanded into legacy characterization, strangler migration, and behavioral compatibility classification.                                                                     |
| `04.07 - Readable, Hygienic Code.md`                 | Preserve, Correct               | Clear naming, small units, actionable critique, maintainable structure                              | Retained. Vague labels such as "bad architecture" are not actionable until tied to expectation, evidence, affected surface, and acceptable repair.                           |
| `06.02 - Microsites.md`                              | Preserve selectively, Transmute | Independent deployment can improve ownership, scaling, security isolation, and failure containment  | Becomes evidence-based deployable boundaries. Revision 2 rejects both microservice and monolith dogma and requires the operational tax to be counted.                        |
| `06.04 - JAM Stack Sites.md`                         | Preserve selectively, Modernize | Pre-rendered output can improve speed, security, cacheability, and operating simplicity             | Retained as static-first guidance when interaction does not require client or live-server execution. Gatsby, Ghost, Netlify, and similar choices remain historical examples. |
| framework-, library-, and language-specific children | Constrain, Defer                | Local implementation knowledge                                                                      | Belong in project profiles, package docs, or ADRs. They do not become cross-project constitutional rules.                                                                    |

### Resulting doctrine

The old architecture notes already contain ancestors of Rosetta's current posture: immutable or journaled state, audit history, generic reusable components, controlled promotion, observability, and separation of concerns. Revision 2 makes the invariant explicit while allowing the implementation to evolve.

## 9. Testing and assurance crosswalk

| Source                                                | Disposition                          | Durable contribution                                                                   | Revision 2 treatment                                                                                                                                                                       |
| ----------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `05 - Test Implementation and Coverage.md`            | Preserve, Transmute                  | Tests belong with behavior; boundaries and failure need coverage; tests support design | Reframed as risk-proportionate assurance and executable claims.                                                                                                                            |
| `05.01 - Unit Testing React.md`                       | Transmute, Constrain                 | Interactive behavior, state transitions, and visual change need automated evidence     | Enzyme, shallow rendering, and snapshot-first practice are historical. Current profiles should test observable semantics, accessibility, user behavior, and high-value visual regressions. |
| `05.02 - Using Test Coverage to Limit Regressions.md` | Preserve selectively, Retire in part | Coverage can reveal untraveled code and regression risk                                | Coverage remains diagnostic. Percentage targets and confidence claims based on coverage alone are retired.                                                                                 |
| `05.03 - Using Tests to Shift Left.md`                | Preserve, Elevate                    | Find defects closer to creation; automate repeatable checks                            | Integrated into the change lifecycle and red-green evidence contract.                                                                                                                      |
| "one test per method" style prescriptions             | Retire                               | Intended to ensure local accountability                                                | Method count is not a risk model. Tests should protect meaningful contracts and faults.                                                                                                    |
| universal 100 percent coverage aspirations            | Retire as default                    | Intended to avoid blind spots                                                          | Replaced by risk mapping, branch and boundary evidence, mutation testing, property testing, fuzzing, fault injection, conformance vectors, and interoperability trials.                    |

### Resulting doctrine

Tests do not prove the system correct. They make selected incorrect states detectable. Revision 2 therefore asks whether the assurance system catches plausible faults and whether another implementation can reproduce the contract.

## 10. Operations, resilience, and security crosswalk

| Source                                                | Disposition                        | Durable contribution                                                                                                             | Revision 2 treatment                                                                                                                                                                                                                                           |
| ----------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `06.01 - Serverless Cloud Functions.md`               | Preserve, Generalize               | Idempotency, bounded retries, asynchronous work, dead letters, observable execution                                              | Generalized beyond serverless into the universal recoverable-operation contract.                                                                                                                                                                               |
| `06.03 - Ops Change Management.md`                    | Preserve, Elevate                  | Promote the same artifact; automate gates; observe; roll back                                                                    | Integrated into build-once promotion, release evidence, canaries, and postcondition verification.                                                                                                                                                              |
| other cloud, deployment, vendor, and platform notes   | Constrain, Defer                   | Useful implementation patterns                                                                                                   | Belong in environment or platform profiles.                                                                                                                                                                                                                    |
| `07 - Security and Hardening.md`                      | Subordinate, Expand externally     | Security must be deliberate                                                                                                      | The historical section is too thin to govern current systems. Revision 2 relies on current Rosetta security doctrine and maintained baselines such as NIST SSDF, OWASP ASVS/SAMM, and SLSA.                                                                    |
| `Fingerprinting/20201102 - Browser Fingerprinting.md` | Constrain, Correct, Retire in part | Device and behavioral signals can sometimes support fraud or account-risk analysis; uncertainty and changing observations matter | Fingerprinting is not an ordinary analytics default. Any use requires necessity, proportionality, rights, purpose limitation, minimal collection, uncertainty, retention, review, and contestability. Covert tracking and user re-identification are rejected. |
| RBAC reference folder                                 | Defer, Subordinate                 | Explicit roles and rights remain important                                                                                       | The folder contains non-Markdown implementation artifacts. Current Rosetta rights, identity, and policy authorities govern the subject.                                                                                                                        |

### Resulting doctrine

The historical reliability instincts are preserved, but current agentic and supply-chain threats require a stronger control plane: rights before retrieval, untrusted text never becoming executable intent, bounded agent tools, explicit authority, safe hold, provenance, and release attestations.

## 11. Product and business crosswalk

| Source                                                                           | Disposition                     | Durable contribution                                                                                  | Revision 2 treatment                                                                                                                                                                                                |
| -------------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `08.02 - Jobs to be Done.md`                                                     | Preserve, Elevate               | Start from progress the user is trying to make, not feature inventory                                 | Becomes the job contract and first-success evidence requirement.                                                                                                                                                    |
| `08.03 - Selling Software Products.md`                                           | Preserve selectively, Modernize | Adoption, onboarding, retention, lifecycle economics, and feedback matter                             | Product progress and first success are retained. Era-specific sales tactics and channel assumptions are excluded.                                                                                                   |
| `08 - Marketing and Sales.md`, `08.01*`, `08.05 - Search Engine Optimization.md` | Constrain, Exclude in part      | Adoption loops, audience learning, discoverability, and product economics can inform product strategy | Tactics, platforms, demographic assumptions, pricing examples, and channel recipes are product-local and time-sensitive. Genesis retains only ethical adoption and evidence principles.                             |
| `08.04.02 - Fake Social Media Accounts.md`                                       | Retire                          | The file describes fabricated identities and platform-evasion tactics                                 | Identity deception, manufactured social proof, and evasion of platform controls conflict with Genesis's trustworthy-control and provenance doctrine.                                                                |
| `08.06.01 - Google Analytics.md`                                                 | Transmute, Retire in part       | Define events before collection, separate environments, and connect telemetry to decisions            | Retains intentional measurement design. Sending direct user identities to third parties and proxying around blockers or tracking prevention are rejected absent explicit necessity, authority, rights, and consent. |
| `09* - Machine Learning` and NLP notes                                           | Archive, Defer                  | Historical learning links and tool references                                                         | The files are primarily bibliographies and do not supply current ML or Rosetta doctrine.                                                                                                                            |
| `10* - Looking for Work` and interview notes                                     | Exclude                         | Career and interview material                                                                         | Outside Genesis's cross-project operating scope.                                                                                                                                                                    |
| general business, cap-table, commissions, and startup resources                  | Exclude                         | May be useful to venture operations                                                                   | Outside Genesis's engineering and research operating scope.                                                                                                                                                         |

### Resulting doctrine

Genesis refuses spec-driven navel-gazing. A technically beautiful increment must still identify whose progress it enables, what workaround it displaces, and how first success will be observed.

## 12. Resource collections and archival material

The `11 - Resources/` collection contains valuable reading lists and historical references. It is treated as a library, not as a normative authority.

| Source family                             | Disposition                          | Reason                                                                                                                                                                       |
| ----------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| developer patterns and habits             | Preserve as bibliography             | Useful pointers, but linked essays and books have different authority and age.                                                                                               |
| business practices                        | Exclude from Genesis                 | Venture and management reference material belongs elsewhere.                                                                                                                 |
| productivity and process optimization     | Retire in part, preserve selectively | General productivity resources remain optional. Coding-time surveillance, WakaTime leaderboards, and inferences about competence from keyboard time are explicitly rejected. |
| humorous programming essays               | Exclude                              | Cultural material, not operating law.                                                                                                                                        |
| old framework and library links           | Archive                              | May aid historical research but should not drive current architecture without fresh evaluation.                                                                              |
| copyrighted PDFs and third-party handouts | Reference only                       | Genesis links to official maintained sources where possible and does not republish private copies as doctrine.                                                               |

## 13. Explicitly retired doctrines

The following ideas are intentionally not carried forward as defaults.

### 13.1 GitFlow as universal branch law

Reason: long-lived integration and environment branches increase divergence, repeated merging, ambiguity, and release-state complexity for most continuously integrated repositories. The underlying release and isolation goals remain.

### 13.2 "No zero hours"

Reason: it confuses visible activity with value, punishes uncertainty and recovery, and invites performative work. Blocks should be surfaced early, not hidden behind meaningless motion.

### 13.3 Hero and "10x" mythology

Reason: individual brilliance is real, but irreplaceability, unsustainable output, and status mythology weaken the system. Genesis optimizes for multipliers whose knowledge becomes reusable.

### 13.4 Coding-time surveillance and leaderboards

Reason: keyboard time is an invalid proxy for engineering value and creates privacy, trust, and Goodhart failures. Research, review, design, mentoring, incident response, and simplification often reduce coding time while increasing value.

### 13.5 Velocity, PR count, commit count, review-comment count, and defect count as individual performance measures

Reason: each can be gamed by splitting, withholding, over-commenting, avoiding hard work, or generating low-value churn. They may diagnose flow at a coherent system level, not rank people.

### 13.6 Coverage percentage as quality law

Reason: coverage measures execution reach, not fault detection. It remains a diagnostic input within a broader assurance portfolio.

### 13.7 One test per method

Reason: method count does not correspond to user risk, contract boundaries, or plausible failure.

### 13.8 Rigid Scrum or meeting calendars

Reason: ceremonies should exist only while they improve coordination, decisions, feedback, or learning.

### 13.9 Camera and attendance policing

Reason: presence signals are poor proxies for understanding or contribution and can create accessibility, privacy, cultural, and trust harms.

### 13.10 Universal technology mandates

Reason: Genesis protects outcomes and invariants. Repository and product profiles choose languages, frameworks, clouds, and tools based on current evidence.

### 13.11 Rewrite-by-disgust

Reason: aesthetic dislike is not an economic, security, or product case. Characterize behavior and migrate incrementally unless evidence supports replacement.

### 13.12 Fabricated identities and manufactured social proof

Reason: deceptive personas, fake endorsements, and coordinated output presented as organic human agreement corrupt provenance, consent, and audience trust. Scoped test personas remain possible when governed and isolated from public deception.

### 13.13 Tracking-control evasion and covert fingerprinting

Reason: proxying around blockers, ignoring consent refusals, or collecting identifying behavioral and device signals merely because they are technically available violates purpose limitation and user agency. Legitimate security use requires explicit, proportionate governance.

## 14. Major additions introduced after the historical corpus

The following Revision 2 doctrines do not claim historical provenance from the Development Book.

### 14.1 Epistemic artifact classes

Source, observation, inference, hypothesis, aspiration, decision, result, evaluation, and projection are separated to prevent semantic collapse.

### 14.2 Truthful maturity vocabulary

Proposed, specified, modeled, implemented, tested, fixture-backed, demo-proven, conformant, interoperability-proven, production-observed, production-hardened, and rung-complete distinguish different claims.

### 14.3 Rights before retrieval

Sensitive or scoped content must be filtered by authority at retrieval and processing boundaries, not exposed first and removed later.

### 14.4 Governed agentic work

Agents receive bounded objectives, context, tools, authority, retries, cost, and egress. Agent output remains untrusted until validated. High-risk mutation and publication retain human or governed authority.

### 14.5 Implementation as research instrument

Reference code, fixtures, workbench commands, and interoperability experiments are how protocol claims earn correction or credibility.

### 14.6 Collaboration pressure signals

External researchers and users supply missing primitives, incompatible semantics, translation loss, desired queries, falsification cases, and reusable fixtures that can reshape roadmap priority.

### 14.7 Earned universality

Rosetta's universality remains a hypothesis until contact with diverse independent systems demonstrates bounded, inspectable semantic exchange.

### 14.8 Governed publication and content lineage

Public content follows source and rights validation, claim inspection, semantic review, accessibility and editorial review, authorized publication, and correction. Claims retain source-to-publication lineage.

### 14.9 Stable versus developing standards

External standards are adopted by named version and status. Draft guidance may inform experiments but cannot be presented as settled conformance law.

### 14.10 Universal recoverable-operation contract

Identity, authority, idempotency, retry, timeout, partial state, postconditions, terminal status, receipts, and repair are made explicit for material operations across platforms.

### 14.11 Identity integrity and rights-aware telemetry

Pseudonymity and automation remain possible, but systems may not counterfeit human authority or independent consensus. Analytics, fingerprinting, and behavioral signals must earn their collection through declared purpose, necessity, proportionality, rights, and review.

## 15. Changes from Genesis 0.1 to 0.2

Revision 0.2 preserves the first draft's center of gravity and adds operational depth.

| Area                 | Genesis 0.1                                         | Genesis 0.2                                                                                                               |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| authority            | priority and precedence                             | adds guidance classes, adoption record, and explicit supersession contract                                                |
| epistemics           | honest maturity and evidence                        | adds claim classes, negative knowledge, and a fuller maturity vocabulary                                                  |
| roadmap              | Execution Spine, pressure signals, Demo/Rung Green  | adds job and research contracts, dependency closure, and work granularity                                                 |
| process              | small changes and PR doctrine                       | adds a twelve-state evidence-bearing change lifecycle                                                                     |
| source control       | small PRs and frequent releases                     | explicitly retires GitFlow as default while preserving its durable objectives                                             |
| review               | risk-conscious PR content                           | adds reviewer selection, knowledge diffusion, bus-risk reduction, and merge authority                                     |
| testing              | assurance, coverage law, adversarial tests          | adds conformance vectors, independent implementation, dependency contracts, red-state evidence, and environment identity  |
| reliability          | deterministic effects and rollback                  | adds recoverable-operation schema, retry discipline, backpressure, dead letters, and incident learning                    |
| people               | limited                                             | adds sustainable pace, distributed equality, bounded autonomy, federated teams, blockers, conflict, and handoffs          |
| meetings             | limited                                             | adds synchronous warrants, decision receipts, and non-ceremonial retrospectives                                           |
| estimation           | limited                                             | adds conditional forecasts, separation of size/duration/priority, and replanning doctrine                                 |
| metrics              | anti-Goodhart principle                             | adds metric contracts, balanced DORA examples, qualitative signals, measurement economy, and telemetry-rights constraints |
| identity and privacy | bounded agent authority and rights before retrieval | adds anti-impersonation, anti-manufactured-consensus, privacy-control, fingerprinting, and direct-identifier rules        |
| legacy               | implicit parsimony                                  | adds characterization, strangler migration, compatibility classification, and build-versus-buy economics                  |
| templates            | none                                                | adds change evidence, synchronous warrant, recoverable operation, and adoption templates                                  |

## 16. Deferred profile work

Revision 2 deliberately does not define every implementation profile. Candidate future profiles include:

- Rosetta repository contribution profile;
- protocol and conformance profile;
- web application accessibility and performance profile;
- secure agentic execution profile;
- privacy, retention, and data-rights profile;
- release and supply-chain profile;
- documentation and publication profile;
- regulated-domain assurance profile;
- incident response and recovery profile;
- research collaboration and disclosure profile.

A profile should be created only after repeated use proves that local decisions are both durable and shared.

## 17. Limitations of this synthesis

This pass reviewed the full Development Book path inventory, deeply analyzed its substantive Markdown doctrine, and classified tool-specific or resource-only Markdown by family. It did not independently re-evaluate every external article linked from the historical resource collections, nor did it treat every binary attachment as current authority.

Some source files are incomplete, duplicative, or shaped by a specific employer and period. The ledger therefore records a reasoned synthesis, not a claim that every sentence was exhaustively adjudicated.

The right challenge to any disposition is evidence:

- a source passage was misunderstood;
- a retired mechanism remains necessary in a defined context;
- a preserved principle conflicts with a higher authority;
- a Revision 2 rule introduces more harm than it prevents;
- a better maintained standard now exists.

Such challenges should produce a reviewable amendment rather than an oral exception that disappears into memory.

## 18. Closing finding

The oldest notes and the newest Rosetta doctrine are not strangers. Their strongest common instinct is this:

> Good engineering turns hard-won judgment into a system that makes the next correct action easier, the next incorrect action more visible, and the next person less dependent on private heroics.

Revision 2 keeps that inheritance. It removes the machinery that no longer deserves constitutional status and adds the epistemic, agentic, rights, provenance, and interoperability controls that the present demands.
