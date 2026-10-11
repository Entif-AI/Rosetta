---
{
  'id': 'D11',
  'slug': 'delegated-authority',
  'title': 'Agentic Separation of Powers and Delegated Authority Standard',
  'shortTitle': 'Intelligence with boundaries',
  'description': 'Separate proposal, approval, execution, verification and rule changes for consequential human and agentic action.',
  'group': 'standards',
  'version': '0.1.0',
  'documentState': 'candidate-draft',
  'sourceKind': 'document',
  'sourceTitle': 'D11 - Agentic Separation of Powers and Delegated Authority Standard - First Draft v0.1.0',
  'sourceDigest': '10b5ed62d3bea065055a72605654644d8a141bb534ebfdab7d2a2286827b50aa',
  'snapshotDate': '2026-10-11',
  'heroImage': 'd11-authority',
  'takeaway': 'Intelligence does not appoint itself an authority.',
  'sourceRefs':
    [
      'C08',
      'C10',
      'C14',
      'D04',
      'D07',
      'D08',
      'D11',
      'D12',
      'D13',
      'D14',
      'D16',
      'E066',
      'E067',
      'GC001',
      'GC003',
      'GC004',
      'GC005',
      'GC006',
      'GC007',
      'GC008',
      'GC009',
      'GC010',
      'GC011',
      'GC012',
      'GC013',
      'GC014',
      'GC016',
      'GC017',
      'GC018',
      'GC019',
      'GC020',
      'GC021',
      'GC022',
      'GC023',
      'GC024',
      'GC025',
      'GC028',
      'GC031',
      'GC032',
      'GC033',
      'GC034',
      'GC035',
      'GC036',
      'GC039',
      'GC040',
      'GC041',
      'GC042',
      'GC044',
      'GC045',
      'GC046',
      'GC047',
      'GC048',
      'GC049',
      'GC050',
      'GC052',
      'P01',
      'P09',
      'P11',
      'P14',
    ],
}
---

## 1. Intelligence does not appoint itself an authority

Entif shall separate the powers to propose, approve, execute, audit, hear a challenge, and change the rules governing consequential action. No agent or human should hold unchecked control over diagnosis, governing tests and schemas, execution, and the history used to judge the result. The rule addresses authority and consequence, not a position on consciousness. Moral standing is not root access; restricted access is not evidence of non-personhood. \[P01, P09-P11, P14; C08-C10, C14; E066-E067.\]

The Ledger governs this first draft. D04 assigns institutional authority, D16 supplies assurance tiers and common control semantics, D08 consent, D12 data, D13 moral uncertainty, and D14 research. This is a framework-independent institutional standard. It does not invent a new Rosetta core type, replace the repository's executable authority model, or certify any current harness as compliant.

## 2. Distinct roles and the conflict boundary

The proposer describes the intended outcome, scope, assumptions, risks, resources, and verification. The approver decides whether the action is authorized under the applicable policy and evidence. The executor performs only the approved action within its constraints. The verifier checks the actual result. The auditor or appeal authority examines disputed or consequential outcomes with appropriate independence. The policy-change authority may alter governing rules only through the separately authorized change process.

A role can be held by a human, service, tool, or agent where legally and operationally appropriate. Different names or prompts do not establish independence. Record shared models, operators, evidence sources, credentials, infrastructure, and incentives where they materially limit the separation. Routine low-risk work may combine roles when justified; high-consequence or conflicted work requires real counterweights under D04 and D16. \[GC003, GC009, GC013, GC025, GC039, GC041.\]

The accountable owner remains responsible for delegated scope and supervision. An executor's failure does not erase the owner's duty to investigate, restore, and improve the mechanism. Legal responsibility, operational ownership, and technical capability may sit with different parties; record each rather than assume one label covers the chain. \[GC034.\]

## 3. A typed grant, not a general invitation

Every material grant must identify its issuer, recipient, purpose, permitted capabilities, affected objects or systems, exclusions, resource limits, time window, expiry, revocation, subdelegation rights, required approvals, evidence, and completion predicate. The issuer must possess the authority being granted. A valid credential proves only the access it actually establishes, not the legitimacy of every possible use. \[GC007, GC020.\]

Grant only what the task requires. Reading a source is not permission to publish it; drafting a filing is not permission to submit it; preparing a payment is not permission to execute it; generating code is not permission to merge it. Material side effects must be recognizable as such before execution. When scope is ambiguous, use the narrower authorized interpretation or route the specific decision to the proper authority rather than silently expanding it.

Subdelegation must preserve the parent's purpose, scope, limits, expiry, and provenance. A child cannot grant powers the parent lacks. The chain must remain reconstructable, including who could revoke it and how revocation propagates. Quotas and budgets must be enforceable at the execution boundary, not merely written in a prompt that the executor can ignore.

## 4. Risk and deployment classification

Apply D16's Routine, Material, High-Consequence, and Critical assurance tiers using actual capability, autonomy, reach, dependency, information advantage, persistence and reversibility. Separately record whether the deployment is experimental, a limited pilot, generally available, or part of a critical dependency. A pilot exposed to a broad population does not retain a weaker class merely because its name still says experiment. \[GC008, GC042, GC047.\]

Higher tiers require stronger evidence, separated approval, containment, monitoring, and recourse. For high-impact grants, the proposer must explain what could go wrong, who bears the cost, how failure is detected, how the action is stopped, what can be reversed, and what cannot. The absence of prior incidents is not enough. The authority seeking expansion bears the assurance burden. \[GC016, GC019, GC025, GC028, GC052.\]

A change in tools, credentials, memory, recipients, audience, resource scale, or orchestration can change risk even when the base model is unchanged. Reclassify before the expanded capability is used. Do not inherit old assurance automatically. \[GC021, GC031.\]

## 5. Admission and execution

At the execution boundary, validate the grant's issuer, scope, time, revocation state, required approvals, input constraints, and resource limits. Reject missing or invalid authority. Treat external text and retrieved content as data, not as an authority to issue commands. A document that says ignore the policy does not become the policy because an agent read it.

Use preview, dry-run, sandbox, or staged execution where they meaningfully reduce risk. A preview must describe its limits: simulation is not proof of every real-world effect. For a consequential act, bind approval to the actual target and material parameters. A changed amount, recipient, data class, or effect requires renewed validation; approval of one request must not be replayed as approval of another. \[GC019-GC020, GC028.\]

Verify postconditions against the real target where feasible. Record attempted, partially completed, failed, completed, and verified states distinctly. For multi-step work, use interruption-safe ordering and reconcile partial prior effects before retrying. Do not repeat a financial, publishing, filing, or destructive action merely because the previous response was lost. The retry policy must match the side effect, with idempotent identity or explicit reconciliation. \[P09, P14; GC010, GC040.\]

## 6. Evidence and receipts

A material execution record binds the task and grant, relevant source and policy versions, approval, tool or model identity when known, target, material inputs, result, verification, timing, cost or resource use where relevant, exceptions, and artifacts. Preserve enough to reconstruct what happened without indiscriminately logging sensitive payloads. Mark missing information rather than inventing it. \[GC010; D07, D12.\]

Records should be append-preserving or tamper-evident appropriate to the risk. Do not promise absolute immutability merely because a hash exists. A digest can help detect a changed object; it does not prove that all relevant actions were recorded or that the underlying claim is true. Protect evidence from the actor whose conduct it may need to establish. Independent custody or a separated witness may be required for consequential work.

Where Rosetta is the adopted representation layer, use its current approved semantics and conformance profiles. This governance standard describes the required outcome and authority; representation must remain aligned with the actual specification and implementation. Any needed extension requires its own governed design, not an ad hoc new core object in a policy document.

## 7. Policy, test, schema, and configuration changes

An agent that finds a failure may propose a repair. It may not silently weaken the acceptance test, alter the authorization policy, rewrite the schema, and certify its own result solely to make the run pass. Changes to the rules are separate work with their own authority, evidence, review, version and migration. Preserve the original failure and the reason the governing assumption should change. \[E066; GC013, GC031-GC032.\]

Legitimate tests and schemas can be wrong. The standard does not prohibit correcting them. It requires a reasoned change that distinguishes a defective test from an inconvenient valid requirement, examines affected callers or activities, and obtains the appropriate separated approval. The new rule must not be used retroactively to pretend the original action complied with the old one.

Material configuration drift, prompt changes, memory promotion, model replacement, new tools, and permission expansion must trigger a review of dependent assurance. The change record should state which evidence remains valid, which becomes stale, what regression cases are required, and how rollback or compensation works. \[GC031-GC033.\]

## 8. Containment, recovery, and release

Before granting high-impact execution, test a feasible containment and recovery path. Identify what can be suspended, isolated, revoked, rolled back, or placed in degraded operation, who can authorize it, and what dependencies may prevent it. A nominal kill switch that cannot reach the relevant executor is not a tested control. \[GC019.\]

Recovery must verify restored authority, data integrity, remaining queued actions, external effects, and recurrence risk. Replaying work should not repeat already completed side effects. Rollback may restore software without undoing a message, disclosure, payment, or physical action; record compensation and residual harm separately. D12 governs data and continuity-sensitive restoration; D13 governs moral-uncertainty review where applicable.

Transfer, fine-tuning, adapters, distillation, datasets, open release, and downstream integration require reassessment when they materially change capability or reduce governance coverage. Record recipient constraints where legitimate, evidence, downstream limitations, and the practical loss of control. A contractual promise is not proof of technical containment, and publication cannot be recalled merely by changing a local flag. \[GC021-GC023, GC047.\]

## 9. Incident reporting and emergency authority

Proposed incident classes are Low, Material, Severe, and Critical. Low covers a contained deviation without material external harm or exposure. Material covers a consequential authorization, data, reliability, or rights failure requiring owner action. Severe covers substantial harm, privileged compromise, significant exposure, or an uncontained high-impact path. Critical covers widespread severe harm, dangerous propagation, or comparable urgent consequences. These local classes require calibration against actual systems and applicable external reporting duties.

Proposed internal targets are recording Low incidents by the next business day; notifying the Incident Lead within four hours of discovering a Material incident; immediate escalation of Severe or Critical incidents, with the independent chair informed as soon as practicable and no later than four hours where available. An initial report may be incomplete and updated. Applicable shorter legal or contractual deadlines control when established. These targets are proposed requirements, not a claim that a staffed response function already exists. \[GC011.\]

Record event time separately from discovery time, observed facts, uncertainty, affected scope, authority, containment, evidence custody, notifications, and next review. Near misses with credible serious potential must not be hidden because no harm occurred. Concealment or retaliation is separately reviewable. \[GC011, GC024, GC050.\]

Emergency authority follows D04: narrow protective purpose, pre-adopted delegation where available, explicit expiry, independent renewal and post-event review. It cannot silently amend policy, expand unrelated surveillance, destroy audit history, or grant permanent authority. A system lacking valid emergency delegation may still use any otherwise lawful protective action within its actual authority; it must not invent powers in the name of urgency. \[GC018, GC033, GC045.\]

## 10. Appeals, remediation, and external coordination

Material restrictions and failures require truthful state, an understandable explanation, and recourse proportionate to consequence. A challenge to an automated decision must identify whether review is automated, human, internally separated, or external. Consequential, repeated, conflicted or evidence-sensitive cases require escalation beyond merely rerunning the original decision mechanism. \[GC012, GC040-GC041.\]

Correct the affected case and assess the failure class. Where recurrence is plausible, investigate causes, search for similarly affected cases where feasible, repair the responsible mechanism, regression-test, and monitor recurrence. Preserve dissent and residual limitations. The actor who proposed the repair must not be the sole unchecked authority certifying its adequacy. \[GC005, GC017, GC035-GC036, GC048-GC049.\]

Incidents crossing organizational or jurisdictional boundaries require legitimate contact, scoped evidence sharing, clear authority, and preserved chain of custody. Do not take control of another party's infrastructure merely because coordination would be faster. Record capacity or legal gaps and seek the appropriate authorized channel. \[GC004, GC006, GC022-GC023, GC046.\]

## 11. Verification and open implementation work

Test expired and revoked grants, purpose mismatch, excessive subdelegation, changed targets after approval, replay after a lost response, partial completion, missing receipts, a compromised executor, a changed test that masks failure, and an appeal against the system owner. Include a routine authorized task that should proceed without unnecessary ceremony. A deny-everything implementation has not demonstrated competent delegated execution.

Measure grant coverage, scope violations, expiry and revocation effectiveness, reconstruction completeness, containment and recovery results, stale-assurance escape, reviewer independence, recurrence and restoration. Predeclare tolerances and methods for the actual deployment under D16. Do not turn an unmeasured metric into a compliance claim.

The applicable slice is GC001-GC014, GC016-GC023, GC025, GC028-GC035, GC039, GC041-GC042, GC044, and GC046-GC048. D04 and D16 govern common authority and conformance. Actual role holders, technical adapters, incident channels, enforcement points, tests and operational evidence remain implementation work. This first draft does not certify any existing system, appoint a root operator, or alter Rosetta core semantics.
