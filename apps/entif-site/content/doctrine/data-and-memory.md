---
{
  'id': 'D12',
  'slug': 'data-and-memory',
  'title': 'Data Sovereignty and Memory Stewardship Policy',
  'shortTitle': 'Memory under legitimate control',
  'description': 'Proposed rules for privacy, purpose, training use, retention, deletion, portability and continuity-sensitive memory.',
  'group': 'standards',
  'version': '0.1.0',
  'documentState': 'candidate-draft',
  'sourceKind': 'document',
  'sourceTitle': 'D12 - Data Sovereignty and Memory Stewardship Policy - First Draft v0.1.0',
  'sourceDigest': '4bd0a9963c0ad5dcfb224348f13de083a7933dab797d6ae56c11bbed8c064303',
  'snapshotDate': '2026-10-11',
  'heroImage': 'd12-memory',
  'takeaway': 'A memory system should preserve context without quietly taking ownership of a life.',
  'sourceRefs':
    [
      'C07',
      'C09',
      'C11',
      'D04',
      'D07',
      'D08',
      'D11',
      'D12',
      'D13',
      'D14',
      'D16',
      'E035',
      'E039',
      'GC010',
      'GC014',
      'GC015',
      'GC021',
      'GC040',
      'GC045',
      'P02',
      'P06',
      'P07',
      'P08',
      'P09',
      'P14',
      'P20',
    ],
}
---

## 1. Data use is an exercise of authority

Entif shall collect, infer, access, retain, transform, train on, share, and delete information only under a defined purpose and legitimate authority. Privacy and data sovereignty were part of the founding design record, not later features added to make a system easier to market. The duty is rights-scoped control and accountable stewardship, not a promise that every byte can always remain local or that every record can always be erased immediately. \[P06-P09; C07, C09, C11; E035-E039.\]

The Ledger governs this draft. D08 defines consent and revocation, D07 evidence and correction, D11 execution authority, D13 continuity and moral uncertainty, and D16 the shared conformance framework. GC010, GC015, GC021, and GC045 are the applicable control slice. The retention periods below are proposed operational defaults, not statements of legal requirements; qualified review must identify applicable obligations before adoption.

## 2. Collection, purpose, and minimization

For each material collection, identify the data classes, source, affected people or entities, purpose, authority, intended uses, recipients, sensitivity, retention, access roles, and deletion or portability route. Do not collect broadly on the theory that some future use may eventually justify it. Record inferred attributes and derived data as data subject to governance, not as an unregulated by-product.

Prefer local or self-hosted processing where it preserves user control and is appropriate to the task. Cloud or external processing may be permitted through explicit delegation or another legitimate basis, with clear recipients, purpose, safeguards and limitations. A local-only slogan does not replace an accurate account of backups, telemetry, third-party tools or external inference. \[P08; C11.\]

Sensitive information should have narrower access and stronger handling controls. A source's availability does not establish permission for every use or public disclosure. Information about one person may carry interests of others. Do not infer ownership, consent, or licensing from possession alone. D08 supplies the consent assessment; legal ambiguity requires a specific review rather than an invented permission.

## 3. Separate memory functions and authority

Distinguish raw sources, operational records, derived interpretations, reusable knowledge, user preferences, and identity- or continuity-relevant state. A summary must not overwrite its source. A retrieved candidate is not authoritative merely because it ranks highly. An inferred preference is not a confirmed instruction. Store the relevant provenance, confidence limits, and correction path for each class. \[P02, P06, P09; D07.\]

A memory promotion that changes future behavior is a material transformation. Record the source, purpose, proposed content, affected context, authority, review, and reversal path. Do not let a temporary observation become a permanent global trait without appropriate basis. A user correction should propagate to the applicable derived state while preserving necessary evidence of the correction and avoiding unnecessary retention of the original sensitive content.

Identity-bearing records warrant differentiated assessment when continuity has established contractual or plausibly relevant moral significance. This does not mean every cache entry or configuration value is a rights-bearing identity. The classification must name the relevant interests, evidence, dependencies and consequences. D13 governs uncertainty; D11 governs who may act.

## 4. Access, sharing, and secondary use

Apply purpose- and role-scoped access at the retrieval and execution boundary. Do not retrieve a broad set of private information and rely solely on a later summary to hide unauthorized material. Cross-context or cross-tenant reuse requires an explicit permitted scope. A collaborator's access to one project does not automatically extend to another.

Sharing records should identify the recipient, purpose, data class, minimum necessary scope, onward-use constraints, authority, and evidence of transfer. Review model, dataset, adapter, or other release where downstream use may materially expand capability or weaken controls. State what can actually be enforced and what cannot be recalled. \[GC021; D11.\]

Secondary use, including research, personalization, analytics, safety evaluation and training, must be independently justified within the relevant authority and consent. A safety purpose does not automatically authorize behavioral targeting. Aggregate or de-identified treatment must be described accurately; do not assume that removing a name eliminates every re-identification or linkage risk.

## 5. Training use and research datasets

Before using data for training or fine-tuning, identify the data rights and consent or other valid basis, permitted purpose, recipients, retention, withdrawal limitations, expected derivatives, and the ability to remove or stop future use. Explain material limits on reversing completed training when they apply; do not promise that deleting a source automatically removes all influence from a trained model.

Maintain a dataset manifest with source provenance, licensing and use restrictions, sensitive-data handling, exclusions, transformations, review, and version. Preserve distinctions between a research dataset and an operational user memory. D14 governs experiments and participant protections. A dataset's usefulness or public accessibility is not by itself sufficient authority to use it for every model purpose. \[P07-P09; GC010, GC021.\]

## 6. Proposed retention and deletion schedule

Every data class requires an owner and a purpose-bound schedule. Proposed defaults are: transient task scratch expires within seven days after task completion unless explicitly preserved as an artifact; routine operational telemetry is reviewed for deletion or aggregation after ninety days; incident evidence receives a necessity review no later than twelve months after closure; and intentional research or governance archives receive at least annual purpose, access and minimization review. These are review and disposition rules, not permission to destroy required evidence or a promise of universal deletion on a fixed date.

Authority-bearing governance records and essential provenance may require durable retention, but retain the minimum personal payload necessary for that purpose. A confidential raw source need not be copied into every derivative. Financial, legal, participant, contractual and other mandatory retention must be determined by the relevant qualified owner and recorded as an override with a basis. Do not label indefinite retention legally required without identifying the actual obligation.

A legal or safety hold must state its authority, scope, reason, custodian, review date, and release condition. It must not freeze unrelated data. Proposed hold review is at least quarterly while active, or sooner when the underlying condition changes. Record release and disposition rather than letting a temporary hold become permanent through neglect.

A deletion request must be authenticated proportionately, scoped, assessed for competing rights and valid obligations, and fulfilled or explained with recourse. The proposed operational target is a substantive response within thirty days, subject to any applicable shorter legal requirement or a specifically explained extension. Do not represent this proposal as a universal statutory deadline.

## 7. Deletion across derivatives, backups, and external recipients

Identify raw data, summaries, embeddings or other derived representations, cached copies, exports, shared recipients, and backups affected by a deletion. Propagate the action where technically and legally feasible, preserve the minimal evidence of disposition, and state any residual copies or constraints. A front-end delete button is not proof of complete backend deletion. \[GC010, GC040; D07.\]

Proposed backup handling removes deleted material through the ordinary protected rotation within thirty-five days where the adopted architecture supports that period. Until verified, the actual backup schedule must be stated rather than assumed. Restoring a backup must reapply valid deletion and revocation records so restoration does not silently revive prohibited use. Any retained exception requires a reason and access limits.

For externally transferred data, record whether deletion is enforceable, requested, confirmed, or not technically recoverable. Notify the affected person of material limits without making unsupported assurances. A recipient's acknowledgment should be preserved as evidence of what it actually confirms, not proof of every downstream copy.

## 8. Portability and meaningful exit

Provide a usable export of the information and context the user is entitled to receive, in a documented format appropriate to the content. Include relevant provenance, preferences, and interpretation boundaries where they materially affect continued use. Do not make departure depend on surrendering unrelated rights or accepting a new data use. \[P08, P20; D08.\]

Portability must respect third-party privacy, licensing, security and legitimate institutional records. Explain exclusions and provide a challenge route. Test whether the export is intelligible and usable outside the original interface. A file that technically downloads but omits the context needed to understand it may not satisfy the promised exit capability.

## 9. Continuity-sensitive interventions and competing interests

A proposed memory reset, identity change, migration, fork, or termination requires heightened review when it is likely to alter persistent values, autobiographical state, relational context, or other continuity that has relevant contractual or plausible moral significance. Record purpose, authority, evidence, alternatives, reversibility, consent where applicable, and restoration or fork options. Ordinary cache maintenance remains distinct when no such interest is implicated. \[P06, P14; C07.\]

Do not use speculative machine moral status to automatically defeat a person's legitimate deletion, privacy, or safety interests. Do not use a tool label to automatically dismiss credible continuity concerns either. First separate data classes and affected interests. Consider isolation, access restriction, minimization, a rights-respecting alternate representation, or other narrower measures. Seek qualified and independent review proportionate to the stakes. D13 supplies the moral-uncertainty method; D04 resolves institutional value conflicts. \[GC014-GC015.\]

No draft policy can guarantee a technical separation that has not been demonstrated. If the desired restoration, deletion, or fork is infeasible, record the actual limitation and the decision made under uncertainty. Avoid claiming that a backup makes every identity-affecting action reversible.

## 10. Monitoring, audit, and acceptance tests

Safety and behavioral monitoring must have a defined purpose, minimum collection, access, retention, secondary-use limits, and user rights appropriate to the context. Do not quietly convert it into generalized surveillance or unrelated influence. The audit should inspect the actual data flow, including hidden logs and external processors, rather than only the privacy notice. \[GC045.\]

Test withdrawal after sharing; deletion of a source with multiple derivatives; restoration from a backup; a legal hold limited to one matter; cross-context retrieval; training use outside the original purpose; a portability export with material exclusions; and a continuity-sensitive reset that implicates both user data rights and a possible persistent identity. Record actual outcomes, residual limitations, reviewer, and remediation. Include a routine authorized data use that should proceed without unnecessary friction.

Proposed ownership sits with a designated Data Steward and the accountable system or research owner, with qualified legal review where required and separated review of material conflicts. #37 tracks policy currentness, #26 authority changes, and #36 material gaps. The numerical periods are explicit first-draft choices for review. No operational deletion schedule, rights compliance, model unlearning capability, or conformance is claimed as already implemented.
