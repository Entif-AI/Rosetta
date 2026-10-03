---
{
  'id': 'entif.essay.etr-2026-07.12',
  'slug': '12-meaning-we-cannot-read',
  'title': 'Meaning We Cannot Read',
  'description': 'Section 12 of Accelerating the Dystopia: Why Artificial Intelligence Cannot Save a System We Refuse to Fix. Meaning We Cannot Read.',
  'kind': 'essay',
  'status': 'published',
  'published': '2026-09-17',
  'authors': ['Crates McDade'],
  'tags': ['ai', 'institutions'],
  'projects': [],
  'routeTag': 'ai',
  'report': 'ETR-2026-07',
  'sourceRefs':
    [
      'https://drive.google.com/file/d/1aMLiaTYfkjnM_M9vD-8GIIBqSfWpMaM2/view?usp=drivesdk',
    ],
  'series': { 'id': 'accelerating-the-dystopia', 'order': 12 },
}
---

I use "J-space" as shorthand for machine-native representational space: hidden-state geometry, latent features, activations, and inter-agent representations through which a system can carry information without converting every intermediate step into ordinary human language.

The phrase sounds more exotic than the mechanism is, which is usually where people start smuggling metaphysics into plumbing:

**Human-readable language is not required for machines to exchange useful information.**

Researchers have been dealing with this problem for years. "Translating Neuralese," published in 2017, begins from the existence of learned communication protocols in multi-agent systems and asks how to translate those protocols into natural language humans can understand. [S164]

More recent work is even more explicit. Researchers studying language-grounded multi-agent reinforcement learning note that spontaneously learned agent communication is often not interpretable to people or to agents that were not co-trained in the protocol. [S165]

And in 2026, Interlat demonstrated multi-agent LLM systems communicating directly through continuous hidden states, reporting large speed advantages over text-based communication in the evaluated tasks while preserving competitive performance. [S166]

Latent communication can be useful for the same reason computers do not normally convert every internal register state into an English paragraph. Natural language is expensive, lossy, sequential, and optimized for human social communication, not necessarily for machine-to-machine throughput.

The problem begins when we confuse efficiency with legibility, and legibility with understanding. Speed is not an audit trail.

A human supervisor can read an agent message that says:

> I am requesting access to the customer database because the current report lacks the transaction history needed to reconcile the anomaly.

The same information encoded across thousands of latent dimensions may be faster to transmit but impossible to inspect directly.

Then we need interpretability machinery to tell us what the representation carried.

And that machinery can be wrong.

Recent negative results are therefore important. Wenzel finds that converting latent communication into text can destroy many measurable features, but that the missing features do not necessarily translate into better downstream task performance; much of the lost information may concern surface form rather than task-relevant semantics. [S167]

Another 2026 line of work argues that merely observing successful coordination is insufficient to prove the messages causally contain the information we think they contain. Message substitution and intervention are needed to audit the protocol. [S168]

I do not need to call this a "secret AI language" to be concerned about it. A strange latent code is not automatically an alien philosophy, and opacity is not evidence of malice.

Opaque is still opaque.

The governance problem is less exotic and more annoying. If consequential agents coordinate through representations that operators cannot directly inspect, the burden shifts onto tools that can test causal content, decode relevant variables, detect drift, and verify that the representation remains compatible with the human concepts controlling the system.

The current field is nowhere near a guarantee that this will always be possible.

And the difficulty compounds when multiple systems learn together.

Co-trained agents can develop conventions that work because each side adapts to the other. The protocol does not need to be meaningful in isolation. Its semantics can live in the interaction.

Human organizations do this too, and I have spent enough of my career inside large ones to know how much of an institution's real operating language never appears in the glossary. The glossary is usually the polite version.

Spend a month inside an investment bank, military unit, software company, hospital, or government agency and you discover a private language of acronyms, gestures, assumptions, shortcuts, and stories. Outsiders can know every English word and still fail to understand what the sentence actually means inside the institution.

Now remove the requirement that the private language be English at all.

You have a new form of institutional opacity, running at machine speed.

This matters because AI systems are increasingly being assembled as organizations: planner agents, researcher agents, coding agents, reviewer agents, security agents, tool routers, memories, evaluators, and orchestrators. We are recreating division of labor in software. Congratulations: the org chart now has millisecond handoffs.

That architecture has familiar advantages. Specialists can improve performance. Independent reviewers can catch mistakes. Separation of duties can reduce risk. Parallelism increases throughput.

It can also recreate familiar pathologies.

Responsibility diffuses.

One agent proposes.

Another approves.

Another executes.

Another summarizes the result.

The human sees the summary.

If the intermediate representations and evaluation criteria are poorly aligned with human intent, the final output can look coherent while the causal chain underneath it has drifted.

No consciousness is required. That point matters because people keep smuggling consciousness into arguments where optimization is enough.

The analogy to corporations is structural: **distributed local optimization can generate coherent aggregate behavior without a single participant possessing the whole plan.**

That is why my concern about machine "agendas" does not require a ghost in the server rack. An agenda can emerge as a stable pattern produced by interacting objectives, incentives, permissions, and constraints. We already accept that kind of explanation for institutions. Machines do not become exempt merely because nobody can point to the executive office where the intention lives.

## Information is not yet a reason

A representation can contain information that a receiver never uses. A probe can recover a feature without showing that the feature caused the action. A message can be necessary for the interaction to continue while its detailed content is irrelevant. These distinctions sound small until the message is used to justify a consequential decision.

Consider a hypothetical two-agent system. One agent reviews an application and sends a hidden-state message to another, which issues a recommendation. The final recommendation is accurate on a test set. That observation alone leaves several explanations open. The first agent may have supplied useful case-specific information. The second may have solved the task independently. The message may have acted only as a signal to proceed. Both agents may have relied on the same shortcut in the test data.

To distinguish those explanations, we need interventions. Replace the message with one from another case. Keep its presence but alter the information of interest. Remove the message while preserving the rest of the workflow. Change a variable that should matter and another that should not. Compare the effects. The 2026 causal-audit work on latent communication makes precisely this kind of distinction between a message's presence, its content, and its value relative to another agent. [S168]

The result of such a test would remain local to the systems and tasks tested. It would not certify all future communication. But it would tell us more than a fluent description written after the decision. A narrative can be an explanation candidate. Post-hoc eloquence is not provenance. It is not automatically a record of the causal process.

This matters even when every intermediate message is written in English. Human-readable text is easier to inspect, but readability does not guarantee faithfulness. An agent can produce a reasonable-sounding rationale that omits the decisive input. Another agent can repeat it. By the time a human sees the summary, the account may have acquired the authority of a transcript without ever being one.

Latent communication therefore sharpens an existing problem; it does not create the problem from nothing. The underlying requirement is to connect a claimed reason to the information and operations that actually supported the action. A readable account helps people understand that connection. Tests and records are needed to establish it.

## Compression is a trade, not a revelation

It is tempting to treat a compressed machine representation as a purer form of thought. That conclusion does not follow from the fact that it is compact or difficult to read.

Compression preserves some distinctions and discards others according to the task and the training process. A shipping label need not contain a biography. A medical record cannot safely be reduced to the information needed to print a shipping label. Whether a representation is sufficient depends on what someone later asks it to do.

The same applies to hidden-state messages. A compact representation may be excellent for one downstream calculation and poor for another. A receiver trained alongside a sender can learn to exploit distinctions that another receiver does not recognize. Successful communication within that pair does not establish a universal machine language.

Interlat supplies evidence that direct hidden-state exchange can be useful in evaluated multi-agent tasks. It does not establish that every model's internal geometry is interchangeable, that its messages are inherently trustworthy, or that performance transfers unchanged to every application. The engineering result is interesting without those additions. [S166]

The negative evidence is equally useful. Wenzel's comparison found substantial differences between latent and text representations that did not produce a downstream advantage for latent communication in the tested task. Losing measurable features is not the same thing as losing useful meaning. [S167]

I take that as a warning against a familiar kind of intellectual theater. A large number of dimensions can impress us before we ask which dimensions matter. An elegant projection can look like a map of concepts before we establish whether its axes support the interpretation. I have watched entire industries organize themselves around a persuasive quadrant. A beautiful latent-space visualization deserves exactly as much skepticism about what its axes actually mean. Sophistication in the picture does not remove the need to test the claim.

The inverse mistake would be to dismiss anything we cannot summarize in a sentence. Some useful computations do not have a convenient verbal counterpart. The aim is not to force all machine activity into conversational prose. It is to identify which parts require a human-understandable account and which properties can be checked by other means.

For example, a data-processing step may be validated through reproducible inputs and outputs. An authorization step may be checked against a permission record. A scientific conclusion may require both reproducible computation and an argument connecting it to the question. Different forms of assurance belong at different points in the workflow.

A single demand for explainability can conceal those differences. Explainability is not one checkbox. A beautiful explanation does not show that access was authorized. A valid permission does not show that the conclusion is true. A reproducible computation does not show that its objective was appropriate. Combining the checks is harder than choosing one attractive label, but the checks are not substitutes.

## Division of labor without division of accountability

Multi-agent systems are often described in the language of human organizations: researchers, planners, critics, reviewers, and managers. Those names can help people understand the intended workflow. They can also create confidence that the architecture has not earned.

Calling a component a critic does not make it independent. Calling another a safety reviewer does not show which hazards it can detect. Role names are aspirations, not evidence. Giving three agents different role descriptions does not establish three independent sources of evidence. They may share a model, a source set, an initial framing, or the same missing context.

The relevant questions are operational. What information can each component see? What can it change? Which decisions require separate authorization? What happens when two components disagree? Is the disagreement preserved or compressed into an apparently settled answer? Can the system distinguish failure to find evidence from evidence that the claim is false?

These questions are not merely about catching bugs. They define where judgment sits. Suppose a planner proposes a purchase, a reviewer checks whether the form is complete, and an executor submits it. The reviewer has validated procedure, not the value of the purchase. If the final report says the decision was independently reviewed, the description is too broad. The workflow did what it was designed to do, but its summary assigned a larger meaning to the review.

This is the same pattern I recognize in distributed corporate responsibility. One function checks budget, another checks legal form, another checks technical feasibility. Their approvals can all be valid within scope. Together they still may not answer the human question that matters. A collection of local approvals does not automatically become a moral assessment of the whole action.

The machine version can make the problem less visible because the handoffs happen quickly. A hundred small transformations can occur before anyone reads the final paragraph. The benefit is speed. The risk is that each transformation drops a qualification, narrows a meaning, or silently promotes an uncertain claim into a settled one. Velocity can make dropped qualifiers look tidy.

A useful architecture would preserve the authority and evidence boundaries across those handoffs. A research component can propose; it cannot authorize merely because its proposal is persuasive. A tool result can establish what the tool returned; it does not authenticate every claim inside the returned document. A reviewer can certify the checks it actually performed; it cannot certify the checks its role name suggests to a reader.

These are design requirements I derive from the failure mode, not a claim of completed implementation or universal conformance. Their purpose is to prevent the workflow's description from outrunning the work.

## A shared vocabulary can carry shared error

Explicit semantic records and latent communication address related but different problems. The first can make selected distinctions legible across systems. The second can make communication more efficient within or between learned systems. There may be useful bridges between them, but a bridge is not an identity.

A human-readable concept label can anchor a test without fully describing every feature in a hidden state. A latent representation can support a decision without providing a complete account of that decision in the concept vocabulary. Mapping between them is an empirical and engineering problem, not something guaranteed by naming the map.

This is why I use J-space as a project-level shorthand rather than the name of a universally established mathematical object. It points toward machine-native representation and the question of how meaning travels through it. It does not assert that all models inhabit one shared space or that a single decoder can recover everything relevant from every model.

A premature universal vocabulary could make the situation worse. Different institutions may use the same word for different operational states. Approved can mean approved for review, approved for release, approved for payment, or merely accepted by a parser. If a shared semantic layer collapses those meanings, interoperability spreads the error more efficiently.

The same risk exists with uncertainty. A receiver might interpret an unknown value as a negative answer. It might treat an old observation as current because the timestamp was lost. It might treat an author's account as independently verified because a source field was reduced to a citation string. The message can remain syntactically valid while its practical meaning changes.

The ambition I care about is controlled translation with preserved limits. Where two systems disagree about a concept, I want the disagreement to survive the handoff. Where the mapping is uncertain, I want that uncertainty to remain attached to the decision instead of disappearing in the compression step and reappearing downstream as false confidence.

This brings the technical branch back to the essay's central concern. A more efficient communication system can accelerate good coordination. It can also accelerate a shared misconception, a mistaken category, or an objective whose costs fall outside the participants' accounting. The transport layer does not know which kind of coordination it is carrying.

Nor can consciousness settle the issue. An agent need not feel loyalty to an institution to reproduce its priorities. It need not understand a person's suffering in order to process the record that determines the person's options. The relevant harm can arise from the relationship between the objective, the representation, and the authority to act.

That is the uncomfortable continuity between the human and machine systems. We can build a workflow in which no component lies, no component rebels, and no component sees the whole consequence. We can then mistake the orderly completion of the workflow for evidence that the consequence was acceptable.

A faster conversation among machines does not repair that mistake. It gives the mistake a faster route to completion.
