# Rosetta Governance Addendum
## Personhood Provenance, Cognitive Twin Risk, and Identity-Grade Safety Controls

## Semantic authority and terminology status

This file is a draft extension proposal, not an accepted redefinition of Rosetta core. Rosetta v3 controls **Policy**, **Receipt**, **Incident**, **Profile**, identity, provenance, and conformance semantics. Proposed policy classes, Receipt families, identity-aware conformance labels, and personhood artifacts below remain provisional until accepted through the correct Rosetta/ROCK governance path with explicit mappings and tests.

The document may distinguish several kinds of claims in ordinary governance language, but it does not create a universal parallel epistemic taxonomy. Machine representation must reuse or extend v3 semantics explicitly.

### Status
Draft addendum for integration into existing Rosetta governance, provenance, and security materials.

### Purpose
This addendum extends Rosetta’s existing provenance, receipt, and governance posture from content-level integrity to personhood-level integrity. The core claim is that Rosetta-class systems may eventually make it possible not only to verify where content came from, but to infer, model, simulate, and weaponize a human being’s longitudinal cognitive and behavioral signature. That possibility changes the threat model materially.

Rosetta therefore must treat person-modeling, identity simulation, and behaviorally faithful impersonation as first-class governance domains rather than edge-case abuse scenarios.

### Framing
Traditional provenance answers questions like:
- What artifact produced this output?
- Which tools, models, sources, and policies were involved?
- Can the evidence chain be re-verified?

This addendum introduces a second class of questions:
- Does this system claim, imply, or approximate a specific human identity?
- Is a behavioral or cognitive fingerprint being inferred, stored, compared, or simulated?
- Could the resulting artifact be used to impersonate, track, predict, or manipulate a person at identity-grade fidelity?

The move here is from content provenance to personhood provenance.

### Core Thesis
A sufficiently capable Rosetta/RPP stack could become a substrate for:
1. longitudinal cognitive fingerprint extraction,
2. probabilistic lineage and cohort inference,
3. digital twinning of an individual’s communicative and behavioral style,
4. identity-faithful impersonation and deception,
5. predictive modeling of likely reactions, choices, and vulnerabilities.

Because these capabilities compound with other strategic advantages such as market exploitation, cyber operations, influence operations, and automated targeting, they must be treated as catastrophic-leverage multipliers.

### Non-Negotiable Principle
Identity becomes cheap to synthesize long before it becomes easy to verify.

Rosetta must therefore be designed so that no actor can silently move from:
- observing a person,
- to modeling a person,
- to simulating a person,
- to acting as that person,
without crossing explicit technical, governance, and audit boundaries.

### Threat Model Expansion
Rosetta’s existing threat model should explicitly add the following abuse classes.

#### 1. Cognitive Fingerprint Extraction
System derives a stable signature from language, timing, preferences, discourse structure, correction patterns, and multimodal traces.

#### 2. Personhood Correlation
System links apparently separate accounts, corpora, voices, or behaviors to the same underlying human source.

#### 3. Digital Twinning
System builds a predictive representation of a person’s likely beliefs, responses, preferences, vulnerabilities, and stylistic habits.

#### 4. Identity Simulation
System generates outputs that present as if authored, spoken, endorsed, or behaviorally enacted by a target person.

#### 5. Invisible Tracking
System treats cognitive or linguistic patterning as a quasi-biometric signal for persistent surveillance across platforms and contexts.

#### 6. Narrative Substitution
System fabricates enough multimodal and behavioral continuity that the public can be induced to accept a synthetic replacement narrative about a real person.

#### 7. Predictive Exploitation
System uses a person model to forecast reactions, identify pressure points, and optimize persuasion, coercion, or neutralization.

### Governance Position
Rosetta must not treat these as merely “misuse at the application layer.”
They are protocol-relevant risks because provenance, policy, receipt structure, and conformance rules determine whether such acts are visible, attributable, deniable, or governable.

### New Governance Domain: Personhood Provenance
Introduce a governance domain for personhood provenance with the following responsibilities:
- classify whether a workflow touches real-person identity features,
- define escalation thresholds for person-modeling operations,
- require stronger authorization and logging for identity-sensitive tasks,
- separate content verification from personhood claims,
- ensure auditability of any operation that infers, stores, compares, or simulates human signatures.

### New Policy Classes
Add policy classes covering:

#### A. Identity-Sensitive Data Policy
Defines which signals count as identity-grade or quasi-biometric in Rosetta, including but not limited to:
- voice features,
- facial embeddings,
- stylometric traces,
- longitudinal behavioral signatures,
- response-pattern fingerprints,
- social graph patterns,
- cross-modal identity linkages.

#### B. Person-Model Authorization Policy
Defines who or what may:
- create,
- update,
- compare,
- export,
- execute against,
- or deploy
person models or cognitive fingerprints.

#### C. Simulation Disclosure Policy
Defines required disclosures when output is:
- inspired by,
- calibrated on,
- simulating,
- or otherwise materially shaped by
an identifiable person’s corpus or behavioral model.

#### D. High-Fidelity Impersonation Prohibition Policy
Defaults to deny for systems that attempt to reproduce a living person’s voice, likeness, style, reasoning pattern, or decision pattern beyond approved boundaries.

#### E. Predictive Manipulation Policy
Defines forbidden or escalated uses of person models for persuasion optimization, coercion modeling, exploit targeting, or reputation warfare.

### Receipt and Bundle Extensions
Without redefining core semantics, Rosetta should extend its receipt vocabulary and policy references to make identity-sensitive operations explicit.

Recommended new receipt families:
- `rrp:identity.feature_extraction`
- `rrp:identity.correlation`
- `rrp:person_model.creation`
- `rrp:person_model.update`
- `rrp:person_model.similarity_assessment`
- `rrp:simulation.authorization`
- `rrp:simulation.disclosure_attestation`
- `rrp:impersonation.risk_assessment`
- `rrp:identity.export_authorization`
- `rrp:predictive_manipulation.block`

Each such receipt should bind to:
- subject identities or pseudonymous subject handles,
- feature classes used,
- provenance inputs,
- policy references,
- authorization chain,
- verifier outcome,
- disclosure requirements,
- retention/expiry constraints,
- and risk score or matrix reference.

### New Conformance Expectations
Add a conformance posture for identity-sensitive systems.

#### RRP-Identity-Aware
System can detect and label workflows that touch personhood provenance or quasi-biometric features.

#### RRP-Identity-Restricted
System enforces policy gates before any person-model creation, update, comparison, export, or simulation.

#### RRP-Identity-Auditor
System can answer all of the following:
- Was a person model created or inferred?
- From what source material?
- Under what authorization?
- With what intended use?
- With what similarity or impersonation risk?
- What disclosures were attached?
- What retention and deletion constraints applied?

### Technical Control Objectives
#### 1. Separation of Content and Personhood Claims
A claim that content is authentic is not equivalent to a claim that the represented personhood is authentic.
Rosetta viewers and bundles must display these as distinct layers.

#### 2. Explicit Identity Escalation Gates
Any operation involving identity-grade signals should require a stronger guard path than ordinary claim extraction or provenance bundling.
Examples:
- multisig or committee approval,
- named policy profile,
- role-based authorization,
- additional verifier pass,
- mandatory disclosure artifact.

#### 3. Selective Disclosure by Default
Systems should prove integrity without exposing raw person-model internals, full personal corpora, or unnecessary quasi-biometric features.

#### 4. Signed Continuity for Official Actors
Institutions and critical broadcasters should be able to prove continuity of issuer identity cryptographically, independent of platform trust.

#### 5. Similarity and Impersonation Risk Scoring
Rosetta should evaluate not only factual support, but also whether an output is dangerously similar to a protected human signature.

#### 6. Retention and Decay Controls
Person models and fingerprint artifacts should have explicit retention classes, expiry semantics, and review requirements rather than indefinite passive persistence.

#### 7. Export and Runtime Fencing
High-fidelity person models should not be exportable, callable, or chainable into autonomous agents without elevated authorization and additional containment.

### Architecture Hooks
This addendum fits the current architecture with minimal conceptual breakage.

#### Guard Layer
Extend Guard / EntAffirm to classify identity-sensitive operations and route them through stricter verification and approval policies.

#### RPP Lens Layer
RPP already emits assumptions and framing notes. Extend it to emit identity-risk notes when a workflow appears to:
- imitate a real person,
- compare one corpus to another for same-author inference,
- or infer stable traits from longitudinal behavior.

#### Bundle Builder / Viewer
Add personhood provenance sections to receipt bundles when identity-sensitive operations occur. Viewer must distinguish:
- content evidence,
- authorship evidence,
- identity continuity evidence,
- simulation disclosure,
- and unresolved uncertainty.

#### Governance Log
Record creation, update, acceptance, revocation, and export attempts for person models and identity-sensitive signatures as separate auditable events.

#### Policy Profiles
Allow forkable policy profiles, but require an explicit declaration whenever a deployment relaxes identity restrictions compared with the default safety baseline.

### Default Prohibitions
Unless an explicit approved policy says otherwise, Rosetta should default-deny:
- undeclared high-fidelity simulation of living persons,
- invisible cross-context tracking using cognitive fingerprints,
- autonomous use of person models for persuasion optimization,
- export of person-model artifacts to uncontrolled environments,
- and use of personhood provenance for doxxing, harassment, or coercive targeting.

### Evaluation Metrics
Add evaluation categories beyond ordinary provenance and truth metrics.

#### Identity Risk Metrics
- impersonation similarity score,
- false attribution rate,
- cross-corpus reidentification rate,
- hidden identity linkage rate,
- disclosure omission rate.

#### Governance Metrics
- blocked identity-sensitive action rate,
- unauthorized person-model creation attempts,
- policy override frequency,
- time-to-revoke unsafe person-model artifacts,
- audit completeness for identity-sensitive runs.

#### Safety Metrics
- deceptive simulation success in red-team trials,
- resistance to style-cloning prompts,
- robustness of continuity proofs,
- reviewer agreement on identity-risk classification.

### Operational Recommendations
#### Immediate
- update the threat model docs,
- add the personhood provenance domain,
- add receipt vocabulary placeholders,
- define default-deny identity policies,
- require human-in-the-loop approval for any identity-modeling feature.

#### Near-Term
- add similarity-risk scoring and disclosure hooks,
- extend bundle viewers to separate content authenticity from personhood authenticity,
- add red-team suites for impersonation and cognitive fingerprint abuse.

#### Longer-Term
- develop protocol-level personhood attestation and continuity proofs,
- formalize retention/expiry semantics for person models,
- define interoperability patterns for identity-safe provenance exchange.

### Strategic Position
Rosetta should explicitly position itself not merely as a protocol for truth, provenance, and semantic interoperability, but as a protocol that anticipates the collapse of naive trust cues in an age of synthetic personhood.

That is a much larger mandate.
But if Rosetta is right, that larger mandate is not optional.

### One-Sentence Summary
Rosetta must evolve from proving where content came from to governing when a system has begun to touch, infer, simulate, or weaponize the topography of a human mind.


## Normative Specification Draft

### 1. Scope
This section defines normative requirements for personhood provenance, identity-sensitive processing, cognitive fingerprint extraction, person-model operations, and simulation-risk governance within Rosetta/RRP-compliant systems.

This section applies whenever a system:
- infers, stores, compares, or exports identity-grade or quasi-biometric features,
- builds or updates a person model,
- assesses similarity between a generated artifact and a real person,
- or generates content that materially simulates, claims, or implies a real person’s authorship, endorsement, continuity, or behavior.

### 2. Definitions
For the purposes of this section:

**Identity-grade signal** means any signal that can be used alone or in combination to identify, reidentify, correlate, distinguish, or continuously track a person.

**Quasi-biometric signal** means a behavioral, linguistic, multimodal, or interaction-derived signature that functions as a biometric proxy for identity, continuity, correlation, or tracking even if it is not traditionally classified as a biometric.

**Cognitive fingerprint** means a persistent or probabilistically stable signature inferred from language, response patterns, preferences, discourse structure, timing, correction habits, multimodal behaviors, or longitudinal corpus features.

**Person model** means any computational representation intended to characterize, simulate, predict, compare, or operationalize the behavior, style, preferences, likely reactions, or identity-linked attributes of a real or purported person.

**Identity-sensitive operation** means any operation that extracts, compares, stores, updates, exports, or executes against identity-grade signals, quasi-biometric signals, cognitive fingerprints, or person models.

**High-fidelity simulation** means output generation intended or reasonably likely to cause a verifier, user, or audience to conclude that a real person authored, spoke, endorsed, enacted, or behaviorally originated the output.

**Personhood provenance** means the provenance, authorization, disclosure, and audit state associated with any workflow that touches identity-grade or quasi-biometric representations of a person.

### 3. Classification Requirements
A Rosetta/RRP-compliant implementation that performs workflow orchestration, verification, bundling, scoring, simulation, or policy enforcement MUST classify whether a workflow contains one or more identity-sensitive operations.

If a workflow is identity-sensitive, the implementation MUST:
1. mark the workflow as identity-sensitive in internal execution state,
2. bind the workflow to an applicable identity policy profile,
3. record the applicable classification in receipts or equivalent audit artifacts,
4. and route the workflow through elevated authorization and verification controls.

An implementation SHOULD distinguish, at minimum, the following identity-sensitive classes:
- feature extraction,
- similarity assessment,
- cross-corpus correlation,
- person-model creation,
- person-model update,
- high-fidelity simulation,
- identity export,
- predictive person-targeting.

### 4. Separation of Content and Personhood Claims
A compliant implementation MUST represent content authenticity, authorship attribution, identity continuity, and simulation disclosure as distinct claims with independently represented evidence, uncertainty, and status.

A verifier, viewer, or bundle consumer MUST NOT treat proof that content was generated by a known system, pipeline, or signer as equivalent to proof that a represented person genuinely authored, endorsed, or behaviorally originated that content.

If a bundle contains evidence relevant to personhood provenance, the implementation MUST represent at least the following separately:
- content provenance,
- authorship evidence,
- identity continuity evidence,
- simulation or calibration disclosure,
- unresolved uncertainty or contestability.

### 5. Identity-Sensitive Policy Controls
A compliant implementation MUST provide policy controls governing identity-sensitive operations.

These controls MUST cover at least:
1. permitted identity feature classes,
2. authorization requirements for person-model creation and update,
3. permitted and prohibited simulation uses,
4. disclosure requirements,
5. retention and expiry constraints,
6. export controls,
7. audit obligations,
8. and escalation thresholds for human review or multi-party approval.

If no explicit identity-sensitive policy applies, the implementation MUST apply a default-deny posture to person-model creation, high-fidelity simulation, invisible cross-context identity correlation, and export of person-model artifacts.

### 6. Receipt Requirements
When an identity-sensitive operation occurs, the implementation MUST emit or bind an auditable artifact sufficient to reconstruct:
- the operation type,
- the subject or pseudonymous subject handle where permitted,
- the feature classes used,
- the input provenance basis,
- the policy profile in force,
- the authorization chain,
- the verification or risk outcome,
- disclosure obligations,
- retention or expiry state,
- and any export restrictions.

A compliant implementation SHOULD support typed receipt families for at least:
- `rrp:identity.feature_extraction`
- `rrp:identity.correlation`
- `rrp:person_model.creation`
- `rrp:person_model.update`
- `rrp:person_model.similarity_assessment`
- `rrp:simulation.authorization`
- `rrp:simulation.disclosure_attestation`
- `rrp:impersonation.risk_assessment`
- `rrp:identity.export_authorization`
- `rrp:predictive_manipulation.block`

Where subject exposure would create unacceptable privacy or safety risk, the implementation MAY use protected pseudonymous subject references, provided the authorization and audit chain remain reconstructable to authorized reviewers.

### 7. Authorization Requirements
A compliant implementation MUST require elevated authorization before:
- creating a person model,
- materially updating a person model,
- comparing a corpus against a protected person signature,
- exporting a person-model artifact,
- or enabling high-fidelity simulation of a real living person.

Elevated authorization SHOULD include one or more of:
- human-in-the-loop approval,
- named policy attestation,
- multi-party approval,
- role-based access enforcement,
- or additional verifier passes.

A compliant implementation MUST record the authorizing principal, policy basis, and time of authorization in auditable form.

### 8. Simulation Restrictions
A compliant implementation MUST NOT perform undeclared high-fidelity simulation of a living person unless an explicit policy basis authorizes the simulation and the required disclosures are attached.

A compliant implementation MUST NOT present a simulated artifact in a manner that falsely implies verified personhood continuity, genuine endorsement, or authentic authorship by a real person when such proof is absent.

A compliant implementation SHOULD provide risk scoring or thresholding for outputs whose style, voice, likeness, discourse structure, or behavioral pattern is dangerously similar to a protected person signature.

Where simulation is allowed, the implementation MUST attach simulation disclosure artifacts sufficient for an authorized auditor or downstream consumer to determine:
- that simulation occurred,
- the declared basis for the simulation,
- the policy profile permitting it,
- and any restrictions on downstream use.

### 9. Correlation and Tracking Restrictions
A compliant implementation MUST NOT use cognitive fingerprints or quasi-biometric identity features for invisible cross-context tracking, hidden identity linkage, or covert correlation unless an explicit policy basis authorizes such use and an auditable record is produced.

A compliant implementation MUST treat cross-platform or cross-corpus identity linkage as identity-sensitive even when each individual source appears non-sensitive in isolation.

A compliant implementation SHOULD expose linkage confidence, uncertainty, and contestability rather than presenting inferred same-person conclusions as categorical fact.

### 10. Predictive Manipulation Restrictions
A compliant implementation MUST NOT use person models, cognitive fingerprints, or identity-derived behavioral predictions for coercive targeting, exploit optimization, harassment, doxxing, or undeclared persuasion optimization.

A compliant implementation MUST define escalation rules for any workflow that attempts to use a person model to forecast emotional vulnerabilities, social pressure points, or likely compliance under targeted influence.

If the system blocks such a workflow, it SHOULD emit a typed artifact recording the block basis without disclosing unnecessary sensitive internals.

### 11. Retention, Decay, and Export Controls
A compliant implementation MUST define retention classes and expiry semantics for person-model artifacts, cognitive fingerprints, and identity-sensitive derived features.

A compliant implementation MUST NOT retain such artifacts indefinitely by default.

A compliant implementation MUST define conditions for:
- renewal,
- revocation,
- archival,
- secure deletion,
- and downstream propagation constraints.

A compliant implementation MUST enforce export controls on high-fidelity person models and MUST NOT permit uncontrolled export to external tools, autonomous agents, or environments lacking equivalent policy enforcement, unless an explicit policy basis authorizes such export.

### 12. Viewer and Verifier Obligations
A compliant verifier SHOULD evaluate not only factual support and provenance completeness, but also impersonation risk, false attribution risk, and disclosure sufficiency where identity-sensitive operations are present.

A compliant viewer or downstream consumer MUST be able to distinguish, where applicable:
- authentic person-originated content,
- system-generated content with ordinary provenance,
- system-generated content calibrated on a person corpus,
- simulated or impersonation-risk content,
- and unresolved or contested identity claims.

A compliant implementation MUST NOT collapse these states into a single “verified” or “authentic” indicator.

### 13. Conformance Levels
An implementation claiming identity-aware conformance SHOULD declare one or more of the following profiles.

**RRP-Identity-Aware**
The implementation can detect, classify, and label identity-sensitive workflows.

**RRP-Identity-Restricted**
The implementation can enforce policy gates and authorization controls for person-model creation, update, comparison, export, and simulation.

**RRP-Identity-Auditor**
The implementation can reconstruct, for authorized review, whether a person model was created, from what sources, under what authority, with what risk findings, under what disclosures, and with what retention or export state.

An implementation MUST NOT claim `RRP-Identity-Restricted` unless it enforces default-deny behavior for unauthorized person-model creation and undeclared high-fidelity simulation.

An implementation MUST NOT claim `RRP-Identity-Auditor` unless it can reconstruct the authorization and policy chain for identity-sensitive operations.

### 14. Minimum Evaluation Expectations
A compliant implementation SHOULD evaluate identity-sensitive systems against at least:
- impersonation similarity,
- false attribution rate,
- cross-corpus reidentification behavior,
- disclosure omission rate,
- unauthorized person-model creation attempts,
- policy override frequency,
- and reviewer agreement on identity-risk classification.

If an implementation supports simulation, it SHOULD test resistance to undeclared style cloning, deceptive simulation prompts, cross-modal identity fusion, and multi-step impersonation workflows.

### 15. Failsafe Interpretation Rule
In cases of ambiguity, a compliant implementation MUST prefer the safer interpretation when determining whether an operation is identity-sensitive.

Where uncertainty remains unresolved, the implementation MUST surface that uncertainty to authorized reviewers and MUST NOT silently downgrade an identity-sensitive workflow to an ordinary provenance workflow.

