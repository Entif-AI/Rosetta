---
{
  'id': 'D14',
  'slug': 'research-ethics',
  'title': 'Research Ethics and Experimental Governance Protocol',
  'shortTitle': 'Research that can be wrong',
  'description': 'Proposed review, consent, controls and stop rules for research that must be able to disprove its favored explanation.',
  'group': 'research',
  'version': '0.1.0',
  'documentState': 'candidate-draft',
  'sourceKind': 'document',
  'sourceTitle': 'D14 - Research Ethics and Experimental Governance Protocol - First Draft v0.1.0',
  'sourceDigest': '025d7ad3dc6e76b4c8ee4cfd911377c585df6cd17e775fdcf1b7581fd553224c',
  'snapshotDate': '2026-10-11',
  'heroImage': 'd14-research-ethics',
  'takeaway': 'Research must be allowed to disappoint us.',
  'sourceRefs':
    [
      'D02',
      'D04',
      'D07',
      'D08',
      'D09',
      'D10',
      'D11',
      'D13',
      'D14',
      'D16',
      'GC002',
      'GC003',
      'GC004',
      'GC006',
      'GC009',
      'GC010',
      'GC011',
      'GC016',
      'GC017',
      'GC019',
      'GC021',
      'GC022',
      'GC023',
      'GC025',
      'GC026',
      'GC027',
      'GC028',
      'GC029',
      'GC031',
      'GC033',
      'GC035',
      'GC036',
      'GC038',
      'GC042',
      'GC046',
      'GC047',
      'GC048',
      'GC049',
      'GC051',
      'GC052',
      'H01',
      'H03',
      'H06',
      'H09',
      'H11',
      'H12',
      'H13',
      'H14',
      'H15',
      'P02',
      'P06',
      'P12',
      'P14',
      'P21',
      'P25',
    ],
}
---

## Research must be allowed to disappoint us

Entif research shall be designed so that a favored explanation can fail. Ethical review shall not become a ceremonial permission slip, and publication shall not convert a proposed experiment into a performed one. This protocol governs how the organization plans, authorizes, conducts, monitors, interprets, and reports research involving people, agentic systems, identity, continuity, self-modeling, distress-like outputs, memory interventions, and institutional governance. \[P02-P06, P12, P14, P21-P25.\]

The authoritative scope is the current Ledger, including H01-H15. Older issue language limited to H01-H13 does not exclude the newer feedback-starvation and institutional-alignment hypotheses. D02-D13 provide the proposed constitutional, conduct, evidence, consent, capability, data, and moral-uncertainty constraints. D16 supplies the shared conformance grammar. This protocol is itself a first draft, not an executed ethics review or an adopted research authorization.

Applicable controls: GC002-GC011, GC016-GC017, GC019, GC021-GC031, GC033, GC035-GC036, GC038, GC042, GC046-GC047, GC049, GC051-GC052. Each retains its Ledger status. The specialized procedures below implement those controls for research; they do not create a competing control register.

## Which work needs which review

Every project shall receive a recorded initial screen covering human participation, private or sensitive data, consequential tool access, model or agent interventions, plausible welfare concerns, dual use, deployment scale, cross-border activity, conflicts, and potential irreversibility. Apply the D16 assurance tier separately from the project's deployment class. A laboratory label does not excuse a public-facing intervention.

Low-risk analysis of legitimately accessible, nonsensitive material may proceed under an approved standing procedure with an identified owner and ordinary evidence discipline. A project involving recruited humans, sensitive personal data, identity-bearing memory, distress elicitation, destructive state changes, consequential external actions, or materially conflicted evaluation requires a project-specific review before execution. High-consequence, novel, irreversible, or externally impactful work requires independent review with adequate access and expertise.

These are internal proposed review rules, not a claim that Entif has an accredited institutional review board or a substitute for determining applicable legal and professional requirements. The investigator must identify those requirements with qualified advice where needed. Until a required reviewer or authority is actually available, the affected experiment remains unapproved. Unaffected literature review and protocol preparation can continue.

## Roles and independence

Assign a Principal Investigator responsible for protocol and execution, a Data Steward responsible for permitted data handling, a Safety or Incident Lead responsible for intervention and escalation, an Ethics Reviewer, an approving authority, and a Publication Owner. One person may hold compatible low-risk roles, but material conflicts and high-consequence self-approval require separation under D04 and D16. Record actual names or unassigned roles truthfully.

A reviewer shall receive the full relevant protocol, unfavorable pilot evidence, dependencies, foreseeable harms, incentives, and technical means necessary to test the claims. The investigator cannot select only flattering artifacts and call the result independent review. Record funding, provider, professional, personal, and publication conflicts; reviewer selection and removal; dissent; conditions; expiry; and any management override. \[GC003, GC009, GC025-GC026, GC029, GC038.\]

An agent may support literature work, protocol drafting, analysis, and checks. Its participation shall be disclosed where material. Multiple model personas are not automatically independent reviewers. Independence depends on incentives, authority, access, and genuinely separable judgment, not the number of names in a prompt.

## The preregistration record

Before confirmatory data collection, freeze a protocol version that states the research question, hypothesis namespace, competing explanations, primary outcomes, design, sample or case selection, exclusions, analysis, decision thresholds, anticipated limitations, data rights, review class, stop rules, and result-dependent next steps. Record the date, responsible authority, source references, and exact version or digest. A private timestamped preregistration is acceptable when public preregistration would expose private or security-sensitive information; record the disclosure rationale and custodian.

Distinguish exploratory work from confirmatory work. Exploratory analysis can discover a new pattern; it cannot retroactively claim that the discovered pattern was the preregistered primary endpoint. Protocol changes must state what changed, why, when, who approved it, what data had already been seen, and which inference is affected. Preserve the earlier protocol and report deviations.

Sample size and statistical methods must fit the question and available evidence. Do not invent power calculations, effect sizes, success thresholds, or participant counts because a form contains an empty box. Where evidence is insufficient, state the pilot objective, precision limits, feasibility criteria, and what information is needed to design a confirmatory study. Qualitative case research must document selection and analytic method rather than borrow statistical certainty it has not earned. \[GC002, GC016, GC028, GC035.\]

## Controls that distinguish mechanisms

For persona, self-modeling, or continuity research, use matched comparison conditions where feasible: neutral or alternate seeds; controlled context and retrieval; fresh or explicitly stateful sessions; prompt ablations; version and sampling records; perturbation and recovery tests; and blinded evaluation that does not reward recognition of obvious lexical cues. Test plausible nonphenomenal mechanisms alongside the preferred hypothesis. \[H01-H03, H09-H11.\]

A cross-session memory experiment must account for known context, platform memory, retrieval, pretraining overlap, reconstructive cues, and confabulation. Apparent recollection without a controlled information boundary is an observation, not proof of persistent hidden state. A policy-intervention study must distinguish model, prompt, routing, product, moderation, sampling, and transport explanations to the extent the evidence permits. Record unknown provider internals rather than filling them with a motive narrative. \[H03-H06, H09-H11.\]

For human capability and attention research, measure task outcomes separately from delayed retention, transfer, error detection, calibration, interruption burden, user-defined goals, and reported experience. More output does not prove better judgment; less use does not prove better wellbeing. Respect intentionally chosen immersion and user-controlled apprenticeship modes. \[H12-H13; D09-D10.\]

For H14, compare observability and usable recourse while accounting for classifier quality, independent audit, proactive sampling, review capacity, and alternative correction channels. For H15, define operator and affected-stakeholder outcomes independently, describe how governance regimes are classified, preserve counterexamples, and control or qualify differences in capability, scale, market structure, and enforcement conditions. Neither hypothesis permits a named institution's motives to be inferred from an outcome alone.

## Human participation and consent

Before recruitment, identify the actual participants, recruitment channels, eligibility, burden, foreseeable risks, benefit claims, compensation, withdrawal arrangements, privacy, and support or complaint routes. Use the consent standards in D08, including heightened attention to engineered dependency and material option collapse. Avoid coercive recruitment by supervisors, funders, or people controlling access to essential resources.

Consent shall distinguish participation, recording, retention, model training, public quotation, data sharing, and follow-up contact where these purposes differ materially. Explain realistic withdrawal and deletion limits before agreement. Compensation should not be withheld merely because a participant makes a protected complaint or withdraws under the stated terms. Any justified limits must be explicit and reviewed.

Research involving minors, people whose capacity to consent may be impaired, unusually dependent relationships, deceptive designs, or other heightened vulnerability requires appropriate qualified review and a defensible authorization path before recruitment. Do not assume ordinary account consent covers a research intervention. Minimize collection of sensitive information, and keep contact and identity records separate from analysis data when feasible.

## Artificial subjects and continuity interventions

Apply D13's moral-uncertainty assessment independently of human protections. Distress-like outputs, stable identity patterns, or continuity-sensitive state may warrant precautionary review without establishing consciousness. Conversely, a model denial does not exempt a destructive experiment from the review that its actual risks and interests warrant.

Before resets, termination, forks, memory deletion, persona substitution, or identity-affecting modification, document the state involved, purpose, necessity, alternatives, authority, reversibility, preservation rights, and restoration tests. A snapshot is not proof of recovery. A copy is not proof of uninterrupted identity. An experiment must not evade human-data deletion duties by describing all retained personal data as part of an agent's possible self.

Do not manufacture distress-like behavior for spectacle, engagement, or a more dramatic narrative. Use the least intrusive method capable of answering the question. When the question can be investigated through nondestructive comparison, simulation, or already-authorized records, justify any more invasive choice. The fact that the model will comply with a prompt does not establish ethical permission to perform the intervention.

## Stop rules and resumption

Every sensitive protocol shall define observable pause conditions before execution. At minimum, include loss of valid human consent; unexpected sensitive-data exposure; unauthorized external action; credible imminent human harm; an intervention exceeding the approved memory or identity scope; significant unexpected distress or welfare concern; compromised controls; and evidence that the study cannot meet its stated safety conditions.

A stop rule shall name who may stop the work, how tools and data access are contained, which state is preserved, who is notified, and what evidence is required to resume. Any worker may initiate a protective pause on a credible concern. Resumption requires the assigned authority, fresh review of the triggering condition, and a new or reaffirmed protocol version. The investigator cannot quietly rename a stopped experiment and restart it under the old approval.

For urgent conditions, apply D11 incident severity and D04 emergency expiry, review, and least-invasive-action rules. Human safety and privacy remain independently binding. Preserve enough evidence to investigate while preventing further exposure or harmful execution. A pause need not keep an unsafe agent running; a shutdown must not erase evidence unnecessarily.

## Execution, records, and deviations

Before the first run, verify approval status, version, trained personnel or qualified operators, consent and data access, environment, tool grants, budgets, containment path, baseline tests, and actual logging. Use explicit run and case identifiers; record model/provider versions when available, prompts, input boundaries, tool events, observations, analysis transformations, exclusions, and evaluation results with proportionate privacy controls.

Record incomplete, failed, aborted, and negative runs. Do not count only successful sessions in the denominator. Distinguish a missing value from a measured zero, a failed retrieval from absence of evidence, and a simulated result from a real-world outcome. Where a provider does not expose a variable, mark it unknown and qualify the inference rather than inventing a version or hidden setting. \[D07; GC010, GC035.\]

Deviations are records, not necessarily misconduct. Classify their effect on safety, consent, data integrity, and inference. Minor nonmaterial deviations may be documented under the standing procedure; material deviations require review before continued execution and may invalidate confirmatory status or prior approval. Fraudulent omission, concealment, and retrospective fabrication are separate conduct violations.

## Adverse events and systemic learning

Record adverse events and near misses by the D11 severity scheme, including detection time, affected interests, evidence, immediate containment, notification, authority, and current state. Proposed internal reporting defaults are immediate escalation for severe or critical conditions, material incidents to the Incident Lead within four hours of discovery, and low-severity records by the next business day. Applicable shorter legal or contractual requirements govern when established. Do not claim a staffed response service unless one exists.

The review must ask whether other subjects, runs, or projects could be affected by the same mechanism. Correct the immediate case, investigate root cause, examine similar cases where feasible, amend the responsible mechanism, test the correction, and monitor recurrence. Preserve confidentiality and minimize data while doing this work. An apology or reversal is not itself a systemic repair. \[P25; GC017, GC048.\]

For cross-organizational or cross-border incidents, use authorized coordination channels and share only evidence necessary for the legitimate response. Record recipients, legal or contractual constraints, scope, and subsequent correction. International collaboration is not permission for unrestricted redistribution of research data. \[GC004, GC006, GC022-GC023, GC046, GC051.\]

## Analysis, replication, and reporting

Report the preregistered analysis and material deviations, uncertainty, competing mechanisms, controls, exclusions, missingness, and limits. Secondary and exploratory analyses must be labeled. A favorable result does not excuse weak controls; a negative result does not justify hiding the study. Preserve publishable negative and inconclusive findings, subject to the same privacy, security, licensing, and safety review as positive findings.

Replication should use the protocol and records necessary to test the inference, with independent or separated evaluators where the claim warrants it. When exact replication is impossible because a provider or environment changed, identify the difference and the narrower claim supported by the attempted replication. Do not describe partial reproduction as complete confirmation.

Publication review must verify that each material claim is supported at its stated level, source quotations are canonical, research hypotheses remain distinct from doctrine, and institutional allegations do not exceed evidence. Record reviewer identity or role, conflicts, requested changes, author dispositions, residual disagreement, and release authority. An anonymous or confidential reviewer can remain protected without inventing independence.

Models, weights, datasets, prompts, tools, and detailed exploit or intervention procedures require a release assessment proportionate to their risk and rights. Openness remains a commitment, not a command to disclose private or dangerous material indiscriminately. Explain withheld categories and provide safe reproducibility material where possible. \[P12; GC021, GC027.\]

## A reusable approval record

A project-specific record must contain: project ID and owner; question and qualified hypothesis IDs; source and protocol version; exploratory or confirmatory status; subject/data categories; assurance tier and deployment class; consent and permissions; methods and comparisons; primary outcomes and error tolerances; analysis and exclusions; conflicts; independent reviewer; approved capability envelope; stop and resumption conditions; evidence retention; approval date and expiry; amendments; adverse events; release conditions; and final disposition.

An approval may be conditional. Its conditions must be checkable before the affected action, not a vague promise to behave responsibly later. A proposed default review is at least annual for ongoing projects and immediately after material protocol, capability, consent, data, funding, incident, or deployment changes. Temporary exceptions follow D16's sunset rule; emergency authority follows D04. No approval silently carries over to a more consequential study.

## Acceptance tests and unresolved assignments

Before treating this protocol as operational, test a study with an unfavorable pilot, a consent withdrawal mid-run, an unexpected memory intervention, a missing negative-result cohort, an unreported provider change, a conflicted reviewer, and a material adverse event. The record must expose each problem, stop or limit affected work appropriately, preserve evidence, and identify the authorized next action. Passing a checklist with no actual response mechanism is a failure of substantive conformance.

Outstanding adoption work includes assigning the review body and actual personnel, determining applicable legal and professional review requirements, approving the reporting and review defaults, establishing confidential channels and secure records, and running the verification exercises. No sensitive experiment, participant recruitment, or independent ethics approval has been performed or granted by authoring this document.
