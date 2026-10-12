# Genesis Delivery and Collaboration Companion

**Status:** Proposed companion to Genesis 0.4-draft  
**Purpose:** Proof-oriented roadmaps, change flow, source control, pull requests, review, estimation, meetings, handoffs, team topology, and sustainable collaboration  
**Scope note:** This document uses ordinary project-management language. It does not redefine the Rosetta v3 execution Spine, Rosetta Profile, Receipt, or other Terminology-Locked concepts.

## 1. Progress is evidence-bearing change

Work should be organized around observable progress rather than inventory or ceremony.

A useful increment:

- advances a user, research, safety, operational, or interoperability outcome;
- tests an important assumption;
- produces inspectable evidence;
- is small enough to review deeply;
- preserves rollback or compensation;
- leaves a clearer next decision.

Large programs may require many increments. Each increment should still earn its place.

## 2. Valuable versus currently unblocking

A large backlog contains many good ideas. That does not make them equally urgent.

Distinguish:

- **valuable work** — likely to improve the eventual system;
- **currently unblocking work** — required for the next meaningful proof, decision, user outcome, safety property, or honest maturity claim.

Work may be very valuable and correctly remain dormant.

## 3. Maintain a small path to the next proof

Do not use `Execution Spine` for roadmap sequencing because Rosetta v3 already owns the term `Spine` for its canonical operational structure.

Instead, keep a **small current path to the next proof**.

Useful workflow states:

- `now`;
- `next`;
- `later`;
- `blocked`.

An item belongs in `now` when its absence would prevent the next declared proof, make that proof dishonest, or introduce unacceptable risk.

Broad parent epics, research maps, and coordination issues remain useful but SHOULD NOT crowd the active path unless completion of the parent itself produces the needed decision/artifact.

## 4. Minimum sufficient dependency closure

An upstream dependency is not automatically urgent because it matters to the final architecture.

Before doing it now, ask whether the next proof actually requires it.

Complete the minimum dependency closure needed to:

- execute the slice;
- inspect it;
- falsify it;
- measure it;
- learn what should happen next.

Do not spend months building horizontal layers that produce no end-to-end evidence.

## 5. Job contract

A major increment SHOULD state:

- person, agent, system, collaborator, or research program served;
- progress they are trying to make;
- current workaround/failure mode;
- smallest useful outcome;
- first-success path;
- evidence that progress occurred;
- security/rights/accessibility/operational constraints;
- deliberate non-goals.

Technical elegance without realized utility remains an unproven conjecture in the ordinary English sense, not necessarily a Rosetta Conjecture artifact.

## 6. Research contract

A research increment SHOULD identify:

- question or hypothesis in ordinary research language;
- prior evidence and competing explanations;
- smallest executable/representable test;
- acceptance and falsification criteria;
- expected information gain;
- cost and stopping condition;
- how the result changes the next decision.

If these research statements become Rosetta-native semantic artifacts, map them through the v3 meaning model instead of inventing a parallel research schema.

## 7. Evidence-bearing change lifecycle

Genesis is methodology-neutral, but material changes SHOULD preserve this learning loop:

1. **sense** — observe need, defect, opportunity, contradiction, or risk;
2. **orient** — locate authority, prior work, evidence, dependencies, and affected people;
3. **frame** — state job/question, boundaries, and smallest proof;
4. **decide** — authorize a proportionate commitment;
5. **isolate** — create bounded branch/experiment/sandbox/feature path;
6. **implement** — make the smallest coherent change;
7. **verify** — test relevant behavior, failure, security, rights, accessibility, compatibility, and docs;
8. **review** — challenge the highest-risk assumptions;
9. **integrate** — accept through the configured authority;
10. **release** — expose/promote known artifacts through controlled gates;
11. **observe** — verify real postconditions;
12. **learn** — preserve results, amend assumptions, and choose the next move.

These are conceptual states, not Rosetta tile kinds.

## 8. Small branches and healthy mainline

The ordinary posture is a healthy protected mainline plus short-lived purpose-specific branches or equivalent isolated changes.

A branch SHOULD:

- represent one coherent outcome;
- begin from a current accepted base;
- remain short-lived enough to control divergence;
- incorporate upstream state before review when material conflicts exist;
- contain only work required for the stated proof;
- disappear after integration when no longer useful.

Long-lived environment/integration/release branches are exceptions that require a real release-topology reason.

GitFlow is not a Genesis default. Its useful objectives survive: isolate unfinished work, make release intent explicit, minimize unrelated hotfix change, and preserve recoverability.

## 9. Commits

Commits SHOULD be coherent, attributable, and useful to debugging/review/release history.

When Conventional Commits is adopted, use it consistently enough that humans and automation can rely on the signal.

Do not mix independent behavior, broad generated churn, formatting, dependency upgrades, and cleanup unless separation would make validation materially worse.

Unshared feature-branch history MAY be rewritten to improve reviewability. Published or relied-upon history should not be rewritten without explicit impact analysis.

## 10. Pull-request contract

A material PR SHOULD state:

- problem and intended outcome;
- governing issue/decision/source;
- changed behavior/contracts/surfaces;
- security/privacy/rights implications;
- accessibility/usability implications;
- reliability/performance implications;
- compatibility/migration implications;
- tests and validation;
- known warnings/uncertainty/deferred risk;
- rollback/compensation where applicable;
- explicit non-goals;
- exact maturity claim supported.

Make the highest-value review path obvious.

Generated diffs, lockfiles, snapshots, and broad mechanical changes should be separated or explained when they obscure semantic review.

## 11. Review order

Review highest-consequence assumptions first:

1. authority and intended outcome;
2. security/privacy/rights/safety;
3. semantic/data integrity;
4. externally visible behavior and failure;
5. compatibility/migration/recovery;
6. tests/evidence quality;
7. accessibility/usability;
8. performance/operational cost;
9. maintainability/clarity;
10. style/preference.

Style comments MUST NOT distract from broken invariants.

## 12. Review as knowledge diffusion

Review is also a knowledge-transfer mechanism.

A review process that repeatedly produces one expert approving code nobody else understands does not reduce bus risk. It documents the dependency.

Select reviewers by risk/knowledge surface, not only hierarchy.

High-risk changes MAY require independent reviewers, CODEOWNERS, security/domain review, or quorum. Low-risk changes SHOULD not be buried in approval ceremony that adds latency without protection.

## 13. Merge authority

No PR merges solely because:

- CI is green;
- a respected person approves;
- a model reports high confidence;
- a deadline is near.

Each is evidence, not judgment itself.

Merge through the configured repository/governance authority. Exceptions need visible records.

## 14. Urgent repairs

Urgency narrows scope. It does not erase accountability.

A hot repair SHOULD still have, proportionate to the incident:

- named defect/incident;
- smallest effective change;
- risk-appropriate review;
- regression evidence;
- containment/rollback;
- follow-up for deferred root causes;
- post-incident learning where warranted.

## 15. Estimates are forecasts

An estimate is a conditional forecast under assumptions, not a promise or virtue signal.

Material forecasts SHOULD state:

- range rather than false precision;
- confidence;
- assumptions;
- dependencies;
- known unknowns;
- excluded work;
- analogous evidence;
- condition requiring re-estimation.

Complexity, effort, elapsed time, queue delay, business priority, and risk are different quantities. Do not collapse them into one number and pretend it explains all of them.

Story points MAY be used locally. They MUST NOT be mechanically converted to person-days, compared across unlike teams, or used to rank people.

## 16. Major commitments

For major bets, use the [Consensus-First Commitment Scoping Framework](<../../PRDs/20260325%20-%20Consensus-First%20Commitment%20Scoping%20Framework%20(v0.1).md>).

Genesis does not duplicate its full artifacts.

At minimum:

- synthesis is not readiness;
- identify the strongest informed objection;
- classify reversibility;
- state evidence/confidence;
- define disconfirmers;
- preserve dissent;
- define enter/continue/pivot/exit conditions;
- size commitment to the current board state.

Replanning when assumptions change is correct behavior.

## 17. Ceremonies are replaceable

Stand-ups, sprints, planning meetings, demos, retrospectives, story points, burndown charts, and boards MAY be used when they reduce uncertainty or coordination cost.

None is intrinsically required by Genesis.

A ceremony that no longer changes decisions, reveals risk, transfers knowledge, or accelerates repair SHOULD be shortened, redesigned, automated, or removed.

## 18. Async-first, not async-only

Use asynchronous communication when people can read/review/consider without simultaneous presence.

Use synchronous communication when it materially improves:

- incident coordination;
- high-ambiguity design convergence;
- sensitive conflict repair;
- collaborative discovery;
- immediate cross-functional negotiation;
- pairing/teaching where bandwidth matters.

## 19. Synchronous warrant

A recurring or consequential meeting SHOULD have:

- reason simultaneous presence is necessary;
- decision/shared model/artifact expected;
- essential participants and why;
- pre-read/evidence;
- timebox;
- facilitator/decision owner;
- durable output;
- cancellation condition.

Attendance is a cost, not a courtesy tax.

A transcript is not the decision. Preserve a concise **decision record** when the decision matters.

Do not call a meeting summary or decision record a Rosetta Receipt unless it actually satisfies the Receipt specification.

## 20. Retrospectives

Retrospectives and post-experiment reviews SHOULD be:

- blameless;
- evidence-bearing;
- timeboxed;
- action-oriented.

Ask:

- what was expected;
- what occurred;
- what helped;
- what impeded;
- what surprised us;
- which belief no longer survives;
- what system condition should change;
- how the change will be verified.

Repeating the same observation without changing the system is ritual, not learning.

## 21. Sustainable pace

Urgency is not a moral virtue. Exhaustion is not evidence of commitment.

The following are rejected as general performance doctrines:

- “no zero hours” expectations;
- coding-time leaderboards;
- camera-on attendance policing;
- judging motivation from hours at a keyboard;
- rewarding preventable heroics while ignoring the system that required them;
- equating all-hours responsiveness with ownership.

Exceptional pushes may occur during incidents or consciously chosen windows, but they MUST NOT become a hidden permanent baseline.

## 22. Distributed collaboration

Distributed teams need explicit context, not diminished trust.

Provide:

- written authority/decision records;
- asynchronous access to essential context;
- predictable handoffs;
- equitable access to consequential discussion;
- overlap windows only where live coordination is useful;
- clear response expectations across time zones;
- language/cultural humility;
- equal standards of trust and advancement across locations.

Geography, accent, native language, camera presence, or proximity to leadership MUST NOT be competence proxies.

## 23. Bounded autonomy

Contributors and agents SHOULD receive the widest autonomy consistent with capability, risk, and authority.

Autonomy requires:

- clear objective;
- owned boundaries;
- governing context;
- decision rights;
- escalation conditions;
- observability;
- accountable outcomes.

Micromanagement is not governance. Unbounded delegation is not autonomy.

## 24. Federated organization

As collaboration grows, prefer small outcome-owning cells connected by shared standards, reusable infrastructure, and cross-cutting councils/guilds where useful.

Centralize only what requires ecosystem-wide coherence:

- constitutional semantics;
- identity/rights;
- security/incident policy;
- conformance contracts;
- shared release/provenance expectations;
- organization-wide risk decisions.

Federate implementation, domain expertise, experimentation, and local workflow wherever safe.

Councils SHOULD spread knowledge, not become approval empires.

## 25. Bus-factor reduction

Critical work SHOULD NOT depend indefinitely on one person's private memory or credentials.

Use:

- clear contracts;
- shared review;
- runbooks/handoffs;
- reproducible environments;
- credential separation/recovery;
- pairing/ensemble work on critical surfaces;
- ownership rotation;
- executable examples;
- tests;
- incident/decision history.

## 26. Handoff records

A useful handoff states:

- current objective/authority;
- branch/work state;
- what changed;
- evidence gathered;
- validation state;
- warnings/uncertainty;
- next smallest action;
- prohibited/deferred actions.

Call this a **handoff record**, not a Receipt, unless it is explicitly encoded and attested according to Rosetta Receipt semantics.

## 27. Being blocked

Surface consequential blocks early with evidence:

- intended outcome;
- exact obstacle;
- attempts already made;
- logs/artifacts/reproduction;
- expertise/decision needed;
- productive work available while waiting.

Being blocked is not character failure. Hiding a critical block until a deadline is an operational failure.

## 28. Conflict and dissent

Disagreement should target claims, assumptions, evidence, and consequences, not status or identity.

Preserve the strongest informed objection before a major commitment.

Early consensus can indicate genuine clarity, but it can also indicate missing viewpoints, authority pressure, or insufficient independent analysis.

## 29. Delivery metric rule

Do not judge delivery health from one proxy.

Use multiple signals spanning outcome, flow, quality, reliability, security, accessibility, cost, and human cognitive load.

The goal is a system that learns quickly and reliably, not a dashboard that slopes upward.
