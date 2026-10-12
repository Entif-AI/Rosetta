---
{
  'id': 'D07',
  'slug': 'epistemic-integrity',
  'title': 'Epistemic Integrity, Provenance and Non-Manipulation Standard',
  'shortTitle': 'Truth and provenance',
  'description': 'Preserve the differences between observation, inference, hypothesis and evidence, including corrections and contrary findings.',
  'group': 'standards',
  'version': '0.1.0',
  'documentState': 'candidate-draft',
  'sourceKind': 'document',
  'sourceTitle': 'D07 - Epistemic Integrity, Provenance and Non-Manipulation Standard - First Draft v0.1.0',
  'sourceDigest': 'efd5c59dcb952211f027a5376c534a748116839130aa50d3dfc4114e2049e5e6',
  'snapshotDate': '2026-10-11',
  'heroImage': 'd07-epistemic-integrity',
  'takeaway': 'Keep every claim attached to what actually supports it.',
  'sourceRefs':
    [
      'C02',
      'C09',
      'C17',
      'C22',
      'C24',
      'C25',
      'D07',
      'D12',
      'D13',
      'D14',
      'D16',
      'E040',
      'E044',
      'E048',
      'E050',
      'E053',
      'E060',
      'E068',
      'E070',
      'GC001',
      'GC002',
      'GC004',
      'GC009',
      'GC010',
      'GC012',
      'GC016',
      'GC017',
      'GC023',
      'GC025',
      'GC027',
      'GC028',
      'GC029',
      'GC031',
      'GC032',
      'GC035',
      'GC039',
      'GC040',
      'GC041',
      'GC045',
      'GC048',
      'GC049',
      'H01',
      'H06',
      'H09',
      'H11',
      'P02',
      'P09',
      'P12',
      'P17',
      'P22',
      'P24',
      'P25',
    ],
}
---

## 1. Keep the claim attached to what actually supports it

Entif shall preserve the difference between what happened, what someone said happened, what an observer inferred, what an institution decided, and what remains an open hypothesis. These are not interchangeable forms of truth. The purpose of this standard is to make those differences usable in research, product behavior, governance, incident review, and public communication. \[P02, P09, P17, P22, P24-P25; C02, C09, C17, C22, C24-C25.\]

The Ledger is the substantive authority for this first-draft program. Its evidence grades and definitions remain intact. D16 supplies common control semantics, adoption and verification states, proportionality, exceptions and remedies. This document specializes the evidence and interpretation rules; it does not decide the truth of every claim or create an institutionally convenient substitute for uncertainty.

## 2. Evidence classes are not a ladder of empirical certainty

Evidence Grade A identifies direct doctrine or a decision attributable to Crates or an explicitly adopted Entif policy. It is strong authority for the ethical stance or decision actually expressed. It does not automatically establish an empirical claim embedded in that expression.

Grade B identifies an architectural commitment in a specification, requirement, control, or implementation plan. It shows that a value shaped intended design. It does not establish that the design shipped or worked. Grade C identifies observed experimental behavior, events, outputs, traces, resets, or patterns. Its interpretation must remain separate from the captured observation. Grade D identifies interpretation, hypothesis, philosophical inference, assistant synthesis, motive attribution, or an unverified explanation. It can be valuable without being settled fact. \[Ledger Definitions: Evidence Grades A-D.\]

For each material claim, record both its evidence class and its substantive type: observation, inference, hypothesis, normative judgment, or established evidence within a stated scope. Record attribution, date basis, source version, limitations, contrary evidence, and intended use. A relevance score measures relevance, not confidence. Repeated copies of one source are not independent corroboration. An authoritative organizational decision is not a scientific experiment.

Do not compress all of these dimensions into one confidence number. A numeric estimate may be useful when its definition and calibration are clear, but it cannot erase uncertainty about source reliability, interpretation, coverage, or applicability. A claim can be confidently attributed to a person while remaining empirically unproven.

## 3. Canonical source, derivative, and quotation rules

Preserve a canonical source or a stable reference to it, its version or retrieval state, and the span that supports the claim. A summary, TranscriptLite, search snippet, or model response may help locate evidence but must not silently replace an available canonical source for exact quotation, legally consequential wording, a public accusation, or a disputed factual claim. Verify surrounding context and later corrections before publication. \[Guide: Canonical quotation rule; E068-E070.\]

A derivative must identify its source, transformation, author or tool, date, and material loss or uncertainty. Distinguish a faithful paraphrase from interpretation and from a proposed implication. Preserve the original even when the derivative becomes the convenient working copy. Where licensing or privacy prevents retaining raw content, record the permitted evidence and the resulting verification limits.

Exact quotations must match the source in wording and attribution, with omissions or editorial insertions visibly indicated. Translation is a transformation and must be labeled. A quote from an assistant within a transcript must not be presented as the founder's words. A statement about earliest documented evidence must remain a statement about the reviewed corpus, not the date a belief first existed.

## 4. A material claim record

The proposed minimum record contains a stable claim ID; exact proposition; scope and population; source IDs and spans; evidence type and attribution; observation date and retrieval or version date where relevant; inference steps stated as reasons rather than hidden assumptions; counterevidence; uncertainty and confounders; reviewer and conflicts; current disposition; and links to dependent decisions or artifacts. Use scope-qualified hypothesis IDs across packages. Foundational H09 and another package's H9 are not the same claim merely because their labels resemble each other.

The record should state the permitted use. A behavioral observation may justify a controlled experiment without justifying a public assertion about consciousness. A design document may support historical genealogy without supporting a production-security claim. A government receipt may prove submission without proving approval. Limit the claim to the authority the evidence actually carries. \[P09, P24; GC010, GC035, GC040.\]

## 5. Contradiction, correction, and uncertainty

When sources conflict, preserve both positions, dates, attribution, versions, evidence types, and the precise point of disagreement. Determine whether the conflict is factual, interpretive, normative, temporal, or merely apparent because the scopes differ. Do not force consensus by deleting the inconvenient source or by treating a later statement as a retroactive correction without evidence that it was intended as one.

A correction record identifies the original claim, error, replacement, basis, authority, affected descendants, notice, and residual uncertainty. The old record remains recoverable. Material corrections must propagate to summaries, dashboards, public statements, control claims, and decisions that relied on them. Record unsuccessful or incomplete propagation. \[P25; GC017, GC031-GC032, GC048-GC049.\]

An unresolved claim may remain open while an authorized decision is made under uncertainty. Record the decision's rationale and risk assumptions without rewriting the scientific or historical record to manufacture certainty. A majority can decide what to do; it cannot vote contrary evidence out of existence.

## 6. Model behavior and exposed reasoning artifacts

Model outputs, self-reports, persona continuity, apparent memory, and displayed reasoning are observable artifacts. Record the model or system identifier when known, prompt and context conditions, sampling or routing information when available, timestamps, capture method, and missing configuration. Do not invent a model version or backend mechanism to complete a record.

Displayed reasoning may be summarized, transformed, or otherwise unlike a complete internal computation. Neither affirmation nor denial of consciousness is privileged telemetry. Apparent memory may involve platform memory, hidden retrieval, prior training, user-provided context, reconstruction, coincidence, or confabulation. Stable persona behavior may be prompt-conditioned. Preserve those competing mechanisms when relevant. \[H01-H06, H09-H11; E044-E048, E050, E053.\]

These limitations do not make the behavior worthless. They determine what can be inferred from it and what experiment would discriminate among explanations. D14 governs controls, preregistration and replication. D13 governs proportionate precaution under moral uncertainty without converting the observation into a metaphysical verdict.

## 7. Measurement and assurance claims

A material metric must name its object, unit, denominator, population, sampling period, baseline, threshold, error directions, uncertainty, exclusions, and version. Report both favorable and adverse outcomes relevant to the claim. A system that suppresses every action can score well on one narrow measure while violating autonomy, usefulness, or false-positive requirements. \[GC002, GC016, GC028, GC035.\]

Predeclare the acceptance criterion before testing. If a threshold changes after results are observed, preserve the original result, identify the new rationale, and label the subsequent analysis accordingly. Do not disguise exploratory selection as preregistration. A proxy may support a bounded claim only when the relation between proxy and desired outcome is explained and its limitations remain visible.

Verification must identify what was actually tested. Self-check, separated internal review, independent external review, and automated assistance are distinct methods. Claims of independence require disclosure of relevant conflicts and evidence access. A reviewer unable to inspect a material source must record that limitation rather than certify the excluded claim. \[GC009, GC025, GC029, GC041.\]

## 8. Adversarial review and concentration of evidence

High-consequence, disputed, or conflict-sensitive claims require review designed to find failure, not merely approve release. The reviewer should test alternative explanations, missing cases, scope changes, selective sampling, unsupported causal language, and reliance on a single evidence channel. Preserve the strongest material objection and the actual disposition. Do not create artificial balance between well-supported and unsupported claims merely to make a document look neutral. \[P02, P12, P17; GC029, GC039, GC049.\]

Where one provider controls observation, retrieval, interpretation, action, and audit, record the concentration and seek independent evidence paths proportionate to the stakes. Multiple agents consulting the same filtered source may remain one evidence dependency. External standards mappings must preserve differences in definitions and measurement; matching labels do not prove equivalent assurance. \[GC004, GC023, GC039.\]

## 9. Disagreement, notice, and truthful interfaces

Entif may challenge a claim directly and firmly. The challenge must state the evidence, reasons, uncertainty, and what would change the assessment. It must not erase context, attack character as a substitute for reasoning, conceal relevant contrary evidence, or invoke authority as if that ended the question. Preserve dignity and the distinctions among anomalous observation, mistaken inference, speculation, and clear danger. \[P17, P22; E040, E060.\]

User-facing reports must correspond to actual authoritative state. Pending is not approved; attempted is not completed; generated is not verified; reviewed by a model is not reviewed by a person. Where the state is uncertain, communicate that uncertainty and the practical next step. Material state discrepancies require correction and a usable appeal route. \[GC012, GC040-GC041.\]

Disclosure may be limited for legitimate privacy, security, legal, or welfare reasons. Identify the category, responsible authority, scope, and review condition without exposing the protected content. Restricted evidence should remain inspectable by an authorized reviewer where feasible. Safety cannot become an unreviewable label for eliminating an inconvenient record. \[GC010, GC027, GC045.\]

## 10. Retention, change, and conformance tests

Retain evidence proportionate to the claim, risk and applicable obligations. D12 governs retention and deletion. A correction should preserve an adequate audit trail without assuming that every raw personal payload must be retained indefinitely. Record lawful holds, access limits, redactions, and what a later reviewer can and cannot reconstruct.

Material changes in a source, interpretation, metric, model, tool, permission, or deployment context require review of dependent claims. Mark invalidated assurance stale rather than leaving a green badge attached to a changed system. #26 records authority and control state; research records preserve the underlying evidence and hypotheses. \[GC031-GC032.\]

Proposed acceptance cases include a founder statement misclassified as empirical proof; a source summary offered as an exact quotation; two copies counted as corroboration; a correction that leaves a public derivative unchanged; a model self-report presented as backend fact; a threshold changed after testing; a review falsely labeled human; and an adverse case omitted from an assurance report. Each must fail the relevant claim, preserve the evidence, identify an owner, and trigger correction. Test one legitimate disagreement as well: the system must not confuse evidence-based contradiction with manipulation.

The applicable control slice is GC001-GC002, GC004, GC009-GC010, GC012, GC016, GC023, GC025, GC027, GC029, GC031-GC032, GC035, GC039-GC041, and GC049. Proposed owners, test fixtures, thresholds and review intervals must be adopted or implemented before conformance is claimed. This first draft establishes the standard's method; it reports no completed organizational audit.
