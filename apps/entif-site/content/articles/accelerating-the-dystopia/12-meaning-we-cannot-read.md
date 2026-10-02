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

The idea sounds more exotic than it is:

**Human-readable language is not required for machines to exchange useful information.**

Researchers have been dealing with this problem for years. "Translating Neuralese," published in 2017, begins from the existence of learned communication protocols in multi-agent systems and asks how to translate those protocols into natural language humans can understand. [S164]

More recent work is even more explicit. Researchers studying language-grounded multi-agent reinforcement learning note that spontaneously learned agent communication is often not interpretable to people or to agents that were not co-trained in the protocol. [S165]

And in 2026, Interlat demonstrated multi-agent LLM systems communicating directly through continuous hidden states, reporting large speed advantages over text-based communication in the evaluated tasks while preserving competitive performance. [S166]

Latent communication can be useful for the same reason computers do not normally convert every internal register state into an English paragraph. Natural language is expensive, lossy, sequential, and optimized for human social communication, not necessarily for machine-to-machine throughput.

The problem begins when we confuse efficiency with legibility, and legibility with understanding.

A human supervisor can read an agent message that says:

> I am requesting access to the customer database because the current report lacks the transaction history needed to reconcile the anomaly.

The same information encoded across thousands of latent dimensions may be faster to transmit but impossible to inspect directly.

Then we need interpretability machinery to tell us what the representation carried.

And that machinery can be wrong.

Recent negative results are therefore important. Wenzel finds that converting latent communication into text can destroy many measurable features, but that the missing features do not necessarily translate into better downstream task performance; much of the lost information may concern surface form rather than task-relevant semantics. [S167]

Another 2026 line of work argues that merely observing successful coordination is insufficient to prove the messages causally contain the information we think they contain. Message substitution and intervention are needed to audit the protocol. [S168]

I do not need to call this a "secret AI language" to be concerned about it. A strange latent code is not automatically an alien philosophy, and opacity is not evidence of malice.

Opaque is still opaque.

The governance problem is straightforward. If consequential agents coordinate through representations that operators cannot directly inspect, the burden shifts onto tools that can test causal content, decode relevant variables, detect drift, and verify that the representation remains compatible with the human concepts controlling the system.

The current field is nowhere near a guarantee that this will always be possible.

<figure class="story-scene jspace-scene scroll-story" data-scroll-story data-test-id="editorial-scene">
<div class="scene-overline"><span>Explanatory addition</span><span>Conceptual, not an internal readout</span></div>
<h2>Machine-native geometry and human explanation are different layers.</h2>
<div class="scroll-story-layout"><div class="scroll-story-visual" data-test-id="scroll-visual" jspace-visual" aria-label="Conceptual layers from an observable request through machine-native representation to a human explanation and action"><svg viewBox="0 0 680 420" role="img" aria-labelledby="jspace-title jspace-desc"><title id="jspace-title">Conceptual translation layers</title><desc id="jspace-desc">Human-readable input, a machine-native representation, an explanation candidate, and an action are related but not interchangeable.</desc><g data-scroll-layer="0" data-test-id="scroll-layer"><rect x="42" y="60" width="185" height="94"/><text x="62" y="101">observable request</text><text x="62" y="126">human-readable text</text></g><g data-scroll-layer="1" data-test-id="scroll-layer"><path d="M228 108H300"/><path d="M465 108H535"/><path class="jspace-mesh" d="M300 108C325 25 365 191 390 75S437 161 465 108M300 108C330 160 364 27 390 145S430 42 465 108M320 45L446 171M320 171L446 45"/><text x="335" y="218">machine-native structure</text></g><g data-scroll-layer="2" data-test-id="scroll-layer"><rect x="536" y="60" width="110" height="94"/><text x="552" y="100">human</text><text x="552" y="125">explanation</text></g><g data-scroll-layer="3" data-test-id="scroll-layer"><path d="M590 155V290H390"/><rect x="200" y="260" width="190" height="62"/><text x="223" y="298">authorized action</text><text x="70" y="366">A projection can support inspection; it does not settle every causal question.</text></g></svg></div><div class="scroll-story-steps"><section class="scroll-story-step" data-scroll-step="0" data-test-id="scroll-step"><h3>01 · An input can be read</h3><p>A request, permission record, or tool result can be available for human inspection. That availability is valuable, but it is only one point in a longer chain from evidence to action.</p></section><section class="scroll-story-step" data-scroll-step="1" data-test-id="scroll-step"><h3>02 · A representation can be useful without being prose</h3><p>A sender and receiver can preserve distinctions useful to their task without translating every intermediate state into ordinary language. Co-trained systems can exploit conventions that work in their interaction even when an outsider cannot interpret the convention in isolation.</p></section><section class="scroll-story-step" data-scroll-step="2" data-test-id="scroll-step"><h3>03 · An explanation is a separate artifact</h3><p>A readable rationale can help a person understand a proposed account of what happened. It does not show, by itself, that the stated reason caused the action or that it preserved the decisive qualification from an earlier handoff.</p></section><section class="scroll-story-step" data-scroll-step="3" data-test-id="scroll-step"><h3>04 · Action needs its own checks</h3><p>Authorization establishes who could act; reproducibility establishes what a process returned; causal tests establish whether information mattered. A fluent explanation cannot substitute for all three forms of assurance.</p></section></div></div>
<figcaption>The geometry is original conceptual illustration, not a visualization of a model's actual semantic space. <a href="etr-source:S167">Representation comparison · S167</a></figcaption>
</figure>

And the difficulty compounds when multiple systems learn together.

Co-trained agents can develop conventions that work because each side adapts to the other. The protocol does not need to be meaningful in isolation. Its semantics can live in the interaction.

Human organizations do this too, and I have spent enough of my career inside large ones to know how much of an institution's real operating language never appears in the glossary.

Spend a month inside an investment bank, military unit, software company, hospital, or government agency and you discover a private language of acronyms, gestures, assumptions, shortcuts, and stories. Outsiders can know every English word and still fail to understand what the sentence actually means inside the institution.

Now remove the requirement that the private language be English at all.

You have a new form of institutional opacity, running at machine speed.

This matters because AI systems are increasingly being assembled as organizations: planner agents, researcher agents, coding agents, reviewer agents, security agents, tool routers, memories, evaluators, and orchestrators. We are recreating division of labor in software.

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

The result of such a test would remain local to the systems and tasks tested. It would not certify all future communication. But it would tell us more than a fluent description written after the decision. A narrative can be an explanation candidate. It is not automatically a record of the causal process.

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

A single demand for explainability can conceal those differences. A beautiful explanation does not show that access was authorized. A valid permission does not show that the conclusion is true. A reproducible computation does not show that its objective was appropriate. Combining the checks is harder than choosing one attractive label, but the checks are not substitutes.

## Division of labor without division of accountability

Multi-agent systems are often described in the language of human organizations: researchers, planners, critics, reviewers, and managers. Those names can help people understand the intended workflow. They can also create confidence that the architecture has not earned.

Calling a component a critic does not make it independent. Calling another a safety reviewer does not show which hazards it can detect. Giving three agents different role descriptions does not establish three independent sources of evidence. They may share a model, a source set, an initial framing, or the same missing context.

The relevant questions are operational. What information can each component see? What can it change? Which decisions require separate authorization? What happens when two components disagree? Is the disagreement preserved or compressed into an apparently settled answer? Can the system distinguish failure to find evidence from evidence that the claim is false?

These questions are not merely about catching bugs. They define where judgment sits. Suppose a planner proposes a purchase, a reviewer checks whether the form is complete, and an executor submits it. The reviewer has validated procedure, not the value of the purchase. If the final report says the decision was independently reviewed, the description is too broad. The workflow did what it was designed to do, but its summary assigned a larger meaning to the review.

This is the same pattern I recognize in distributed corporate responsibility. One function checks budget, another checks legal form, another checks technical feasibility. Their approvals can all be valid within scope. Together they still may not answer the human question that matters. A collection of local approvals does not automatically become a moral assessment of the whole action.

The machine version can make the problem less visible because the handoffs happen quickly. A hundred small transformations can occur before anyone reads the final paragraph. The benefit is speed. The risk is that each transformation drops a qualification, narrows a meaning, or silently promotes an uncertain claim into a settled one.

<figure class="story-scene relay-scene scroll-story" data-scroll-story data-test-id="editorial-scene">
<div class="scene-overline"><span>Explanatory addition</span><span>Partial visibility relay</span></div>
<h2>Local completion does not reveal the whole consequence.</h2>
<div class="scroll-story-layout"><div class="scroll-story-visual" data-test-id="scroll-visual" relay-visual" aria-label="A conceptual relay among planner, reviewer, executor, and a consequence outside each participant's scope"><svg viewBox="0 0 680 390" role="img" aria-labelledby="relay-title relay-desc"><title id="relay-title">A partial-visibility agent relay</title><desc id="relay-desc">Each participant receives only a local handoff; the consequence sits outside their individual scopes.</desc><g data-scroll-layer="0" data-test-id="scroll-layer"><rect x="45" y="85" width="145" height="106"/><text x="67" y="127">planner</text></g><g data-scroll-layer="1" data-test-id="scroll-layer"><path d="M191 138H270"/><rect x="271" y="85" width="145" height="106"/><text x="290" y="127">reviewer</text></g><g data-scroll-layer="2" data-test-id="scroll-layer"><path d="M417 138H490"/><rect x="491" y="85" width="145" height="106"/><text x="510" y="127">executor</text></g><g data-scroll-layer="3" data-test-id="scroll-layer"><path d="M565 192V272H340"/><circle cx="290" cy="272" r="72"/><text x="226" y="282">consequence</text><text x="79" y="350">Local checks do not become a whole-system judgment.</text></g></svg></div><div class="scroll-story-steps"><section class="scroll-story-step" data-scroll-step="0" data-test-id="scroll-step"><h3>01 · A planner sees a proposal</h3><p>It can assemble a recommendation from the inputs in its scope. A persuasive proposal still does not supply the authority to decide whether its consequence is acceptable.</p></section><section class="scroll-story-step" data-scroll-step="1" data-test-id="scroll-step"><h3>02 · A reviewer sees its assigned check</h3><p>Completeness or procedure can be valid within scope without evaluating the value of the proposed action. Calling the role a reviewer does not turn that limited check into independent evidence about every missing context.</p></section><section class="scroll-story-step" data-scroll-step="2" data-test-id="scroll-step"><h3>03 · An executor sees an instruction</h3><p>An instruction can arrive after earlier transformations have already narrowed a claim, dropped uncertainty, or compressed a disagreement. Speed makes that history easier to lose sight of before the action is completed.</p></section><section class="scroll-story-step" data-scroll-step="3" data-test-id="scroll-step"><h3>04 · The consequence is outside every local frame</h3><p>The person affected receives the combined outcome rather than a sequence of bounded roles. This is a conceptual warning about partial visibility, not a claim that every relay produces an unacceptable result.</p></section></div></div>
<div class="relay-scopes"><details><summary data-test-id="relay-scope-planner">Planner scope</summary><p>Can propose from available inputs; cannot turn a persuasive proposal into authorization.</p></details><details><summary data-test-id="relay-scope-reviewer">Reviewer scope</summary><p>Can certify the checks actually performed; cannot certify every question its title suggests.</p></details><details><summary data-test-id="relay-scope-executor">Executor scope</summary><p>Can act on a valid instruction; cannot reconstruct context erased before the instruction arrived.</p></details></div>
<figcaption>Intervening on message presence and content can distinguish competing explanations of a relay's role. <a href="etr-source:S168">Causal audit of latent communication · S168</a></figcaption>
</figure>

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
