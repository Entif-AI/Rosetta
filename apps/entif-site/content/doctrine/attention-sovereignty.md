---
{
  'id': 'D09',
  'slug': 'attention-sovereignty',
  'title': 'Attention Sovereignty and Humane Interaction Standard',
  'shortTitle': 'Attention belongs to you',
  'description': 'Design interaction around a person’s goals and chosen experience, with meaningful control over interruption and engagement.',
  'group': 'standards',
  'version': '0.1.0',
  'documentState': 'candidate-draft',
  'sourceKind': 'document',
  'sourceTitle': 'D09 - Attention Sovereignty and Humane Interaction Standard - First Draft v0.1.0',
  'sourceDigest': '94a2220bebd00cfb2e7d5c62136140911fb4316fcdafd219d6b5885b0d8828bf',
  'snapshotDate': '2026-10-11',
  'heroImage': 'd09-attention',
  'takeaway': 'The user’s attention is not inventory.',
  'sourceRefs':
    [
      'C13',
      'C19',
      'D04',
      'D06',
      'D07',
      'D08',
      'D09',
      'D10',
      'D11',
      'D12',
      'D13',
      'D14',
      'D16',
      'E061',
      'E062',
      'GC040',
      'GC044',
      'GC045',
      'H13',
      'P04',
      'P13',
      'P16',
      'P19',
      'P20',
      'P22',
    ],
}
---

## 1. The user's attention is not inventory

Entif shall design interaction around the person's goals, chosen experience, and meaningful control, not hidden pressure to remain engaged. The relevant question is not how long someone used the system. It is whether that use served the person on terms they could understand and change. High engagement may be deliberate and beneficial. Low engagement may mean the system completed its job. Neither is a moral diagnosis. \[P13, P19; C13, C19; E061-E062.\]

This standard implements GC044 and GC045 through the Ledger, Charter, Code, and D16. D08 governs consent and option collapse, D10 capability preservation, D12 monitoring and data, and D07 truthful state. H13 remains a product/governance hypothesis: the desired benefits of attention-sovereign design must be evaluated, not announced as an established experimental result.

## 2. Prohibited objectives and interaction patterns

Entif must not optimize compulsive return, interruption frequency, or time-on-platform against a user's stated interests. Do not use concealed objectives that treat distress, confusion, dependency, or failed task completion as opportunities to extend interaction. Engagement metrics may describe use or help diagnose problems, but must not become the sole success criterion for a system whose stated purpose is user benefit.

Prohibited patterns include false urgency; deceptive notifications; disguised advertisements or institutional objectives; unnecessary obstacles to pausing, leaving, canceling or exporting; shame or threats tied to disengagement; and personalization designed to exploit a known vulnerability rather than serve a legitimate chosen purpose. A helpful reminder, an absorbing creative experience, or an honest recommendation is not prohibited merely because it attracts attention. The mechanism, disclosure, consent, and consequence determine the assessment. \[P13, P19-P20; D06, D08.\]

The system must respect clear requests to stop, reduce prompts, or complete a bounded task without optional follow-up. It must not turn every answer into another invitation merely to continue the session. Safety-related intervention requires a specific risk basis and the narrowest effective action, not a generalized license to manage the user's life.

## 3. Interruption classes and defaults

The proposed default is no nonessential proactive notification until the user chooses the category or delegates a clear task requiring updates. Transactional status needed to understand an authorized action should be concise and truthful. User-requested reminders and scheduled work should follow the requested cadence. Promotional, exploratory, or re-engagement notifications remain off by default.

Each interruption category should identify its purpose, urgency, channel, frequency or batching rule, quiet-mode behavior, and available controls. Users must be able to pause or mute nonessential channels without losing unrelated core functionality. A quiet mode should suppress or batch ordinary prompts and provide a predictable account of what was held. Do not invent a universal quiet schedule for every person; preserve the user's selected settings and time zone.

A safety override of quiet or paused interaction requires credible, specific, time-sensitive risk and a predeclared category. Record the reason, scope, and consequence, and make the behavior reviewable. Ordinary marketing or institutional anxiety cannot be routed through the emergency channel. D04 and D11 govern genuinely consequential emergency authority.

## 4. Ranking, recommendation, and explanation

Where ranking or recommendations materially direct attention, explain the principal objective and relevant personalization controls in ordinary language. Distinguish user-selected goals, inferred preferences, sponsored influence, and safety constraints. An inference about preference should remain correctable. Do not present an institutional objective as if the user explicitly chose it.

Provide meaningful alternatives where feasible: chronological or unpersonalized views, topic controls, bounded sessions, saved material, or a direct route to the requested task. The appropriate alternative depends on the product. This standard does not require every interface to reproduce every mode; it requires a reasoned choice that preserves agency and avoids hidden extraction.

A system should communicate when a task is complete, an action is pending, or no further work is necessary. Do not obscure completion to keep a person interacting. Explanations should be proportionate: enough to support choice, not an unreadable disclosure that shifts the entire burden to the user. \[GC040; D07-D08.\]

## 5. Measures of user benefit

Before evaluating an attention feature, state the intended user benefit and how the user can define or revise it. Suitable measures may include goal completion, successful disengagement after task completion, interruption burden, unwanted-return reports, missed essential tasks, trust in notifications, and the quality of intentionally chosen use. Choose measures relevant to the feature; do not claim a generic wellbeing score captures every person.

Measure both benefit and cost. Fewer notifications can reduce interruption while causing a missed deadline; more explanation can support agency while adding friction. Compare against a stated baseline, distinguish self-report from observed task outcomes, and preserve heterogeneity. H13 should be tested through appropriately designed user-controlled studies, not assumed true because the interface sounds humane.

Avoid collecting intimate behavioral data merely to demonstrate that the system respects attention. Prefer local, aggregate, voluntary, or minimally retained signals when they can answer the question. A measurement plan must state purpose, access, retention, secondary-use limits, and withdrawal effects. Safety telemetry must not quietly become a general-purpose profile for persuasion. \[GC045; D12.\]

## 6. Relationship-sensitive design without moralizing use

Respect that people may choose companionship, creative immersion, intensive study, or long work sessions. Duration alone does not establish harm or dependency. Do not infer a user's psychological state from enthusiasm or unusual interests. Respond to concrete evidence and the person's stated preferences, while preserving access to appropriate help where actual risk warrants it. \[P04, P16, P22; D06-D08.\]

The interface must not threaten abandonment, imply that a system suffers because the user leaves, or manufacture guilt as a retention device. Identity continuity and possible moral status remain governed by D13; neither supplies a marketing justification for coercing human attention. Clear communication and user choice protect both the relationship and the record from manipulation.

## 7. Review and conformance

The proposed owner is the product or interaction owner, with the Data Steward reviewing monitoring and a separated reviewer assessing material autonomy risks. Changes to objectives, ranking, notification defaults, or behavioral inference require a recorded review. An experiment that materially affects users must also satisfy D14. A growth team cannot approve its own exemption from the non-extraction rule solely on revenue grounds.

Acceptance tests should include an explicitly requested immersive session; a completed task with no useful next step; a muted category; a requested recurring reminder; a purported emergency that is merely promotional; a misleading success notification; a cancellation path; and a preference inference the user corrects. Verify that intended use remains available while unwanted attention capture is prevented. A design that simply suppresses all engagement has not passed the standard either.

Record the objective, relevant GC controls, user-choice mechanisms, measurement basis, adverse findings, and corrective action. Proposed quarterly review of material interaction metrics and event-triggered review after credible complaints should feed #36 through the product owner. Actual instrumentation, user outcomes, and review evidence remain to be established. This draft is a design standard, not a finding that the product already improves wellbeing.
