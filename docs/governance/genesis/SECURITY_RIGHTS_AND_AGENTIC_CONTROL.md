# Genesis Security, Rights, and Agentic Control Companion

**Status:** Proposed companion to Genesis 0.4-draft  
**Semantic authority:** Rosetta v3.0.0 Core Spine Specification and accepted security/provenance authorities  
**Purpose:** Security, privacy, rights, supply-chain, and agentic-control defaults without redefining Rosetta Policy, Receipt, Incident, execution-spine, or provenance semantics

## 1. Security is the first product property

Within ordinary engineering trade space, security, privacy, rights, and trustworthy control outrank accessibility, performance, usability, aesthetics, convenience, and novelty.

A lower-priority improvement MUST NOT silently spend a higher-priority invariant.

Security includes:

- confidentiality;
- integrity;
- availability;
- authentication and authorization;
- privacy and data rights;
- provenance and supply-chain integrity;
- abuse resistance;
- containment and blast-radius control;
- safe failure;
- recovery;
- accountable control.

A system that is fast, elegant, accessible, and compromised has failed.

## 2. Default control posture

Projects SHOULD apply controls proportionate to their threat model, data sensitivity, autonomy, and blast radius.

Default posture:

- deny by default;
- grant least privilege for the shortest practical duration;
- compartmentalize identities, credentials, environments, tenants, classifications, and networks;
- minimize ambient authority;
- keep secrets out of source, prompts, logs, Rosetta Receipts, fixtures, analytics, and generated artifacts;
- isolate and sandbox untrusted code, plugins, skills, models, documents, and imported capabilities;
- treat generated output and external services as untrusted input until validated;
- validate at trust boundaries;
- require explicit authority before material side effects;
- provide revocation, rotation, safe-hold, rollback, and incident paths;
- make security-sensitive composition restrictive rather than permissive;
- preserve attributable evidence for privileged decisions and actions.

## 3. Rights before retrieval

Scoped or sensitive material MUST be authorized before retrieval, processing, caching, or disclosure to a component that does not possess the necessary rights.

Retrieve-then-filter is forbidden when the retrieval itself would expose unauthorized information.

Rights checks should occur at the narrowest reliable boundary and be carried through downstream projections, caches, compiled contexts, Tapestries, and outputs.

A cached or derived artifact does not escape the rights of the material from which it was derived merely because its representation changed.

## 4. Fail closed; degrade honestly

The following MUST NOT silently become permission:

- unknown authorization;
- missing required provenance;
- invalid or unverifiable signatures;
- stale authority;
- unresolved identity;
- ambiguous rights;
- broken invariants;
- required evidence that cannot be obtained;
- policy evaluation that cannot be completed.

Prefer visible safe states:

- read-only;
- pending confirmation;
- quarantined;
- stale with explicit timestamp/source;
- unverified;
- denied;
- indeterminate;
- review-required;
- safe hold.

Do not convert uncertainty into green status for interface convenience.

## 5. Rosetta-native control composition

Genesis does not define a competing operation envelope.

Where an operation is represented in Rosetta, use the v3 execution structure and established artifacts:

- **Run** for the execution context;
- **Action** for a reasoning/processing step;
- **ToolCall** for external invocation;
- **Observation** for immutable received results;
- **Evaluation** for post-action/run assessment;
- **Policy** for machine-enforceable governance;
- **Receipt** for signed attestation;
- provenance/lineage for derivation and history;
- **Incident** where the v3 incident semantics apply.

Reliability controls such as timeout, retry, idempotency, compensation, and postcondition verification SHOULD be attached through accepted project/Rosetta extension mechanisms rather than by silently minting a parallel Genesis protocol.

## 6. Agentic systems

Agents are contributors/operators under authority, not independent principals by default.

Agentic work MUST have, proportionate to risk:

- explicit objective;
- bounded scope;
- bounded tools and capabilities;
- bounded context;
- bounded time and cost;
- bounded retries and egress;
- least-privilege credentials;
- read-only or proposal-only defaults where mutation is not required;
- checkpoints before material mutation;
- deterministic validation where practical;
- postcondition verification;
- attributable evidence for material actions;
- safe-hold behavior when authority or state is uncertain.

High-risk, identity-sensitive, irreversible, externally published, or authority-changing actions require the configured human or governance mechanism unless a higher accepted authority explicitly delegates otherwise.

## 7. Untrusted text is not executable intent

Text from documents, websites, email, tickets, source code, chat logs, model output, retrieved context, or third-party systems MUST NOT acquire execution authority merely because an agent reads it as an instruction.

The system should distinguish:

- evidence/content being analyzed;
- instructions from an authorized principal;
- policy;
- tool output;
- model suggestions;
- executable actions.

Prompt injection is one instance of the broader rule: data crossing a semantic boundary does not automatically acquire authority.

## 8. Identity integrity

Pseudonymity, simulation, test personas, synthetic data, and automated accounts can be legitimate under explicit scope.

Systems and operators MUST NOT fabricate or impersonate human identities, credentials, endorsements, consent, or independent consensus to evade controls or manipulate trust.

Scoped test/red-team identities should be governed, isolated from public deception, and removable.

Automation SHOULD be disclosed when its presence is material to consent, trust, platform rules, or interpretation.

## 9. Privacy and data rights

Collection, storage, transformation, retrieval, training, publication, and deletion/gravestoning semantics MUST honor applicable rights and declared purpose.

Prefer:

- data minimization;
- purpose limitation;
- separation of identity from content where practical;
- explicit retention semantics;
- restricted cross-domain reuse;
- least-identifying telemetry;
- revocation and deletion mechanisms compatible with legal/provenance obligations;
- auditable handling of consent and lawful basis where required.

A provenance requirement does not justify indefinite retention of sensitive content. Preserve only what the governing policy and evidence need require.

## 10. Telemetry and analytics

Operational observability and product analytics MUST NOT become a pretext for indiscriminate surveillance.

Before collecting a signal, identify:

- the decision it informs;
- why a less identifying signal is insufficient;
- data classification;
- retention;
- who may access it;
- third parties receiving it;
- whether users have meaningful control;
- how error/uncertainty is handled;
- retirement condition.

Do not route around explicit privacy controls, blockers, tracking-prevention, or consent refusal merely to preserve analytics.

Device/behavioral signals may be justified for proportionate fraud, abuse, or account-security controls when purpose, authority, uncertainty, retention, human review, and contestability are explicit. They are not ordinary analytics by default.

## 11. Threat modeling

A material threat model SHOULD name:

- protected assets;
- actors/principals;
- trust boundaries;
- attacker capabilities;
- plausible abuse/failure scenarios;
- impact;
- assumptions;
- controls;
- residual risk;
- detection;
- containment;
- recovery.

Threat modeling should focus attention on likely and consequential paths rather than merely maximizing the number of threats written down.

## 12. Supply-chain security

Use maintained external baselines appropriate to the system, including NIST SSDF, OWASP ASVS/SAMM, SLSA, and ecosystem-native controls where applicable.

Candidate controls include:

- protected source/review paths;
- pinned or constrained dependencies with deliberate upgrade policy;
- dependency inventory/SBOM;
- isolated build environments;
- provenance attestations;
- signed release artifacts where justified;
- checksums and immutable release records;
- credential minimization in CI;
- dependency/workflow change review;
- verified source-to-artifact lineage.

Do not claim generic “SLSA compliant” or “secure” without naming the actual scope, version, track/profile, environment, and evidence.

## 13. Credentials and compartmentalization

Integration convenience MUST NOT erase trust boundaries.

Prefer dedicated identities/accounts/projects/networks for high-value or high-risk work when practical. Avoid sharing broad personal credentials with automation merely because a service integration is easier that way.

If an integration requires unrelated authority, first ask whether the architecture can be changed to narrow the credential rather than weakening compartmentalization.

## 14. External publication and mutation

Publishing content, sending messages, changing code, modifying infrastructure, creating accounts, accepting terms, purchasing resources, or otherwise mutating external state are side effects.

Side effects SHOULD have:

- clear principal/authority;
- bounded scope;
- inspectable proposal or preview when practical;
- risk-appropriate approval;
- observable postcondition;
- record of what actually happened;
- recovery/rollback/compensation path where feasible.

A model saying “done” is not evidence the side effect occurred correctly.

## 15. Incident handling

Incident response prioritizes containment, safety, and recovery.

Post-incident learning SHOULD be blameless toward people and unsparing toward system conditions.

Capture:

- what was expected;
- what occurred;
- contributing conditions;
- detection gaps;
- containment/recovery effectiveness;
- evidence preserved;
- corrective changes;
- owners;
- verification that corrective changes work.

Where a Rosetta **Incident** artifact is used, v3 Incident semantics govern. A generic postmortem document is not automatically a Rosetta Incident tile.

## 16. Security evidence is scoped

A scanner, score, badge, penetration test, model critique, policy check, or passing CI suite is evidence, not absolution.

Security claims SHOULD state:

- scope;
- version/commit/artifact;
- environment;
- method;
- limitations;
- unresolved risk;
- date/recency.

Treat perfect scores as an observation about the instrument, not proof the whole system is perfect.

## 17. Security exception rule

Any exception that weakens a security/privacy/rights control MUST record:

- the exact control;
- reason;
- evidence;
- affected scope;
- owner;
- beneficiaries;
- foreseeable harm;
- compensating controls;
- expiry/review date;
- rollback/removal path.

Temporary exceptions must actually expire or be renewed explicitly.
