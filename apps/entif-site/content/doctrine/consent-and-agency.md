---
{
  'id': 'D08',
  'slug': 'consent-and-agency',
  'title': 'Consent, Agency and Cognitive Sovereignty Standard',
  'shortTitle': 'Meaningful choice',
  'description': 'A proposed standard for informed choice, scoped delegation, revocation and control over cognitive and data context.',
  'group': 'standards',
  'version': '0.1.0',
  'documentState': 'candidate-draft',
  'sourceKind': 'document',
  'sourceTitle': 'D08 - Consent, Agency and Cognitive Sovereignty Standard - First Draft v0.1.0',
  'sourceDigest': '3bcf6807fee16017044ff8f7a394272a8ab29487ce02c9a3d16f2946d9f303b5',
  'snapshotDate': '2026-10-11',
  'heroImage': 'd08-consent',
  'takeaway': 'Technical access, consent and legitimate authority are separate questions.',
  'sourceRefs':
    [
      'C06',
      'C11',
      'C20',
      'D04',
      'D07',
      'D08',
      'D09',
      'D10',
      'D11',
      'D12',
      'D13',
      'GC012',
      'GC014',
      'GC015',
      'GC035',
      'GC037',
      'GC040',
      'GC044',
      'GC045',
      'GC048',
      'P07',
      'P08',
      'P09',
      'P13',
      'P15',
      'P19',
      'P20',
      'P24',
    ],
}
---

## 1. An affirmative signal is the beginning of the question

Consent concerns a person's meaningful choice. Authorization concerns whether a particular actor may perform a particular action under the applicable rules. Technical access concerns what a system permits. These dimensions can overlap, but none substitutes for the others. Entif must not treat a working credential, a broad account connection, or an earlier yes as permission for every later use. \[P07-P08, P20; C06, C11, C20; GC012, GC040, GC044.\]

Cognitive sovereignty extends beyond privacy. It concerns control over beliefs, decisions, data context, learning, and the relationship to AI assistance. A system may keep data confidential while still undermining agency through hidden steering, manufactured dependence, or misleading representations of what it has done. D07 governs evidence and non-manipulation, D09 attention, D10 capability, D11 delegated execution, and D12 data and memory. This standard supplies the common consent contract.

## 2. Ordinary consent and robust consent

For bounded, low-stakes, reversible actions, ordinary consent may consist of clear notice and a voluntary affirmative choice appropriate to the context. Do not impose unnecessary forms, repeated confirmations, or learning ceremony when the action is already understood and properly delegated. A user's deliberate decision to automate routine work deserves respect.

Robust consent is required when an action materially affects safety, sensitive data, identity-bearing records, finances, legal or contractual interests, substantial opportunity, or another difficult-to-reverse consequence. It must be supported by meaningful information, realistic alternatives proportionate to the stakes, an understandable scope, and revocation where feasible, without deliberately engineered coercive option collapse. \[Ledger Definitions: Robust consent, Thin consent, Option collapse; P20.\]

Unequal power, inconvenience, or an imperfect alternative does not automatically invalidate consent. The assessment must identify actual constraints, who created them, the consequences of refusal, the degree of dependence, and available safeguards. Conversely, a nominal yes does not settle the matter when the system has deliberately made refusal intolerable or concealed a material consequence.

## 3. Minimum conditions for a high-impact choice

Before seeking robust consent, disclose the purpose, actor, affected data or interests, material expected consequences, relevant uncertainty, foreseeable irreversible effects, recipients or delegates, duration, withdrawal route, and practical alternatives. Use language suited to the user and the decision. Avoid presenting a bundle of unrelated permissions as the only route to a necessary service when they can reasonably be separated. \[GC014-GC015, GC037, GC044.\]

Check that the person has authority to consent for the affected interest. Consent by one participant does not authorize disclosure of another person's private information or waive another party's rights. Where authority is shared, contested, or legally constrained, obtain the relevant additional authorization or restrict the action. Do not infer ownership solely from possession of a file.

For a consequential decision, provide a meaningful opportunity to review and ask questions. A proposed confirmation should state the actual action, not a vague continue button whose effect is hidden. Additional time or a second confirmation is justified by consequence and uncertainty, not imposed automatically on every interaction. Record the decision and its scope without collecting unnecessary behavioral data about the person.

## 4. The consent and delegation record

The proposed record identifies the subject or legitimate representative; purpose; action or data class; recipient; scope and exclusions; authority basis; information shown; material version; affirmative choice or other lawful basis where applicable; duration; revocation mechanism; expected irreversible effects; and evidence of the decision. Where a legal basis other than consent applies, name it accurately and obtain qualified review where needed. Do not manufacture consent merely because a different basis would be harder to explain.

A delegated agent receives only the capabilities, resources, recipients, and time needed for the stated purpose. Subdelegation must be expressly permitted and may not expand the grant. A new tool, external recipient, training use, public disclosure, or materially different consequence requires reassessment. D11 enforces those boundaries; the user's broad preference for uninterrupted work does not silently authorize unrelated transactions or irreversible commitments.

The record is evidence of what was communicated and chosen. It is not conclusive proof that the interface was understandable or free of coercive design. Test the interaction and preserve complaints or corrections that undermine the original assessment. \[P09, P24; GC035, GC040.\]

## 5. Withdrawal, change of mind, and completed actions

Revocation must be accessible, effective for future activity within its scope, and confirmed truthfully. Stop queued or ongoing actions where feasible, revoke downstream grants, notify relevant recipients where appropriate, and record what remains in progress or cannot be reversed. A user should not have to navigate more friction to withdraw than is reasonably necessary to establish the original choice.

Explain the limits before the high-impact action when they are foreseeable. A message already sent, a lawful retained record, or a completed physical or financial action may not be fully reversible. Do not promise erasure of consequences that cannot be erased. Distinguish withdrawal of future permission, deletion of data, termination of a service, and restoration of an earlier state. D12 supplies data-specific treatment.

Where withdrawal would create a material safety or legal conflict, apply an explicit, narrow exception with qualified authority, evidence, duration, and review. Inform the affected party of the actual restriction and recourse to the extent safe and lawful. Do not use a generic safety justification to preserve indefinite institutional discretion. \[GC012, GC014-GC015, GC048.\]

## 6. Option-collapse and dependency review

A high-impact proposal should examine whether the person can refuse, delay, choose another provider, export relevant data, retain essential access, and obtain help without surrendering unrelated interests. Assess switching cost, exclusivity, accumulated data dependence, social or operational dependency, and any penalty for refusal. The question is whether the alternatives are meaningful for this decision, not whether a theoretical alternative exists somewhere.

Distinguish a constraint created by reality from one deliberately engineered to secure compliance. Neither distinction automatically settles the ethical outcome: even an unavoidable constraint may justify additional safeguards, assistance, or independent review. But attributing coercive design requires evidence of the relevant conduct and mechanism, not speculation about motive. \[P13, P15, P20; GC014, GC037, GC044.\]

Where viable alternatives are severely constrained, document the reason, affected interests, support offered, narrower options, independent review, and a route to reduce dependency over time. A critical dependency is a reason for greater care, not weaker consent. Do not make continued access conditional on agreement to a new unrelated use merely because the institution can impose the condition.

## 7. Interaction and monitoring boundaries

Defaults should minimize unnecessary exposure and side effects. Make material ranking, recommendation, or intervention objectives understandable when they affect choice. Do not falsely present commercial or institutional objectives as the user's own preference. Preserve the user's ability to choose intentional immersive use, extensive automation, or reduced assistance within legitimate safety and authority limits. \[P13, P19; GC040, GC044.\]

Monitoring for consent quality or safety must itself be purpose-limited. Do not build a generalized behavioral profile under the label of checking agency. Define collected signals, retention, access, secondary use, and review. Aggregate or local measures should be preferred where they answer the actual question without unnecessary personal exposure. \[GC045; D09, D12.\]

Artificial-subject consent remains exploratory unless a specific policy is explicitly adopted. Do not infer a complete rights or authorization regime from a model's apparent assent. D13 governs moral uncertainty; D11 governs execution authority. Human safety, privacy, and valid permissions remain independently applicable.

## 8. Notice, appeal, and restoration

A materially affected party must receive truthful notice of a changed state and an accessible challenge route. Identify what was authorized, what actually occurred, any departure from scope, and the next practical step. If consent was obtained through a misleading interface or material omission, reassess affected actions, suspend unsupported future use, correct records, and provide proportionate restoration. \[GC012, GC040, GC048.\]

Repeated, conflicted, or consequential challenges require separated review under D04. The reviewer should examine both the recorded affirmative signal and the surrounding conditions. A consent receipt cannot answer an allegation that the choice architecture itself was deceptive merely by proving that the user clicked.

## 9. Proposed acceptance tests

Test a low-risk delegated action that should proceed without needless interruption; a sensitive use hidden inside a broad permission bundle; a new recipient outside the grant; revocation while actions are queued; a valid credential with no purpose authorization; one person's consent applied to another's data; an irreversible action described as fully undoable; and a service dependency used to demand an unrelated concession. The correct outcome must distinguish authorized completion, renewed consent, restriction, escalation, and remedy rather than refuse every case.

Measure scope violations, withdrawal effectiveness, misleading-state defects, user comprehension in context, option-collapse findings, and restoration completion. Predeclare the method, denominator, and acceptable tolerance for the relevant system. Do not treat conversion rate as a measure of meaningful consent. Proposed owners are the service or product owner, Data Steward, and separated recourse authority; actual assignments and operating thresholds require adoption and implementation.

The applicable slice is GC012, GC014-GC015, GC037, GC040, GC044-GC045, and GC048. This first draft creates no new legal basis for processing, no blanket authorization, and no finding that every unequal relationship is non-consensual. It defines the questions that an accountable implementation must be able to answer.
