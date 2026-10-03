---
{
  'id': 'entif.research.omoc',
  'slug': 'ontological-mixture-of-concepts',
  'title': 'Ontological Mixture of Concepts',
  'description': 'OMoC treats reasoning as a semantically routed computation graph: task-local concept signatures select heterogeneous cognitive operators instead of static agent roles.',
  'kind': 'research',
  'status': 'published',
  'published': '2026-08-28',
  'updated': '2026-09-18',
  'authors': ['Entif AI'],
  'tags':
    [
      'research',
      'semantic-representation',
      'agentic-systems',
      'orchestration',
      'model-architecture',
      'bithkuil',
    ],
  'projects': ['rosetta', 'bithkuil'],
  'routeTag': 'rosetta',
  'related':
    [
      'entif.research.semantic-latticing',
      'entif.research.agentic-memory',
      'entif.research.prepaying-semantics',
      'entif.research.rosetta-pasigraphy-protocol',
      'entif.research.babel-fish-alien-mind',
    ],
  'sourceRefs':
    [
      'docs/RFCs/ontological_mixture_of_concepts_research_spec.md',
      'ETR-2026-05 - Prepaying Semantics',
      'ETR-2026-09 - Forget Me Not - Stage 2 near-final publication draft',
      'https://typesafe.ai/blog/introducing-system-one-models-and-jev',
      'https://github.com/NandhaKishorM/laya',
      'https://huggingface.co/convaiinnovations/laya',
      'https://arxiv.org/abs/2404.19756',
      'https://arxiv.org/abs/2607.15525',
      'https://proceedings.iclr.cc/paper_files/paper/2026/hash/bf8065446507b0d3842838564ac4f1f3-Abstract-Conference.html',
    ],
  'featured': false,
  'noindex': false,
}
---

Agent systems have a habit of turning organization charts into metaphysics.

Give one agent a badge that says "Researcher," another "Critic," another "Architect," and a fourth "Implementer," then route the work according to the costume. This is useful as a coordination shortcut. It is not obvious that the problem itself cares what anybody's name tag says.

**Ontological Mixture of Concepts, or OMoC, starts from the opposite direction: route cognition by the semantic shape of the problem.**

A task can expose concept signatures, ambiguity, evidence density, constraints, temporal structure, causal structure, stakes, required precision, available memory, and other bounded signals. Those features can determine which cognitive operations are useful now, which are unnecessary, and which should not be allowed to influence the result at all.

That began as a routing idea.

It is starting to look more like a cognitive compiler.

## Route by the problem, not the costume

The simplest OMoC formulation replaces static agent identity with an inspectable route plan:

```text
problem state
    ↓
concept signature
    ↓
applicable cognitive operators
    ↓
execution plan
    ↓
outcomes and evaluation
```

The operator is the important unit. An operator might be a deterministic rule, a temporal reasoner, a causal comparison, a retrieval mechanism, a probabilistic decision model, a tiny specialist, a tool, a simulation, a large generative model, or a human reviewer.

Those are not semantically equivalent resources. They should not be forced to become one.

The useful abstraction is that each can transform some bounded part of a task state under declared preconditions. OMoC asks which transformations apply, which can execute together, what dependencies force ordering, and what evidence later tells us whether the route was worth taking.

The public Rosetta surface should make the resulting route intelligible enough to inspect and replay. It does not need to publish Entif's private scoring, ranking, tuning, or optimization machinery in order to do that. Public representation and private operation are different jobs.

## Bithkuil changes what can be routed

OMoC becomes much more interesting if the task state is not merely a paragraph of prose.

[_Prepaying Semantics_](/tags/research/2026/09/12/prepaying-semantics/) asks whether a Bithkuil-derived semantic intermediate representation can reduce the cost of learning reusable relational and compositional structure. The proposal exposes semantic factors directly: identity, relation, scope, evidence status, temporal order, causality, intended purpose, actual application, quantity, uncertainty, and other distinctions that natural language often distributes across syntax, vocabulary, context, and pragmatics.

That research must come first.

If explicit semantic structure does not produce stable, useful operands, there is little scientific value in building a baroque router around them. OMoC should not receive credit for competence that Bithkuil has not demonstrated, and Bithkuil should not receive credit for orchestration that has not been tested.

If the representation work succeeds, however, routing gains a different kind of address.

Instead of:

```text
send this paragraph to Agent 7
```

we can begin to ask:

```text
this task contains:
  temporal conflict
  uncertain causal attribution
  policy-bound evidence
  one deterministic comparison
  one open-ended synthesis
```

That can support a task-local graph in which exact work goes to exact machinery, probabilistic work goes to probabilistic machinery, and open-ended work earns the expensive model only where it is actually needed.

The distinction sounds obvious after it is stated.

So does indoor plumbing.

## From mixture of experts to mixture of cognitive functions

Conventional mixture-of-experts systems route hidden activations among learned expert blocks. OMoC is not intended as a prettier name for the same thing.

The candidate resource set is heterogeneous by design.

```text
exact relation               → deterministic code
typed probabilistic judgment → decision model
smooth learned mapping       → local neural function
semantic retrieval           → memory mechanism
novel synthesis              → generative model
external state               → tool
simulation                   → simulator
ambiguous interpretation     → competing conjectures
high-stakes judgment         → human review
```

This matters because intelligence is not the correct implementation for every operation.

If a constraint can be checked exactly, running a frontier model to "reason" about it is not more intelligent. It is an expensive way to introduce uncertainty into a solved problem. If a decision is genuinely fuzzy, pretending it can be reduced to a brittle hand-written rule is equally silly.

The architecture should let implementations compete for the job.

That requires a stable contract at the semantic boundary, not one universal model underneath it.

## Jev and Laya expose a useful instruction class

TypeSafe AI's September 14 release of [Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) gives this discussion a very concrete neighbor.

TypeSafe describes Jev as a "System One Model": unstructured state comes in, predefined typed questions accompany it, and typed probabilistic decisions come out. The company says Jev uses a parallel sampler rather than token-by-token generation and trains with Reinforcement Learning for Calibrated Decisions. Its published speed, cost, and workflow comparisons are first-party claims from a new system, so the interesting fact here is the architecture before it is the benchmark.

The architectural fact is enough.

Many useful machine decisions are not prose.

The open-source [Laya project](https://github.com/NandhaKishorM/laya) makes that shape inspectable. Its [published checkpoint](https://huggingface.co/convaiinnovations/laya) uses a fully fine-tuned ModernBERT-large bidirectional encoder plus a two-layer decision head, about 421 million parameters in total. It evaluates typed choice, ordinal score, and probability-like boolean questions without generating text and reports multiple questions in one forward pass. Its latency and comparative claims remain author-reported, but again, the important object is visible.

A useful cognitive primitive can be:

> **encode state once, evaluate many bounded questions, return calibrated distributions.**

That fits OMoC unusually well.

A route planner might need estimates for applicability, contradiction, route success, evaluator pass probability, likely staleness, or whether an ambiguous case deserves escalation. Those questions can share the same current semantic state without depending on one another.

There is no prize for serializing them into paragraphs first.

## Parallelize the dependency graph, not the sentence

Autoregressive generation makes sequence position look like the natural clock of cognition because the next token cannot exist until the previous token does.

Semantic operations have a different clock.

Suppose the current task requires:

```text
temporal check
contradiction scan
source lookup
policy eligibility
specialist classification
cost estimate
```

If those operations depend on the same current state and not on one another, they can run concurrently.

If a later causal analysis needs the temporal result, that edge remains serial.

If context cannot be assembled until rights and scope checks complete, that becomes a barrier.

If an action cannot execute until authorization completes, that becomes another barrier.

The practical architecture is therefore not "everything in parallel." It is closer to **bulk-synchronous semantic dataflow**: parallel where the dependency graph permits it, synchronized where meaning, policy, or causality requires ordering.

That distinction matters because a system can be very parallel and still be very wrong. The part where it checks whether it was allowed to use the data should ideally not finish three milliseconds after it sends the email.

## KANs become interesting only after the operands mean something

The original [Kolmogorov-Arnold Network](https://arxiv.org/abs/2404.19756) work replaces scalar edge weights with learned univariate functions. That provides an unusually visible local transformation interface and makes KANs attractive for systems interested in inspectable learned functions.

The obvious mistake is to jump straight from "inspectable functions" to "replace transformer MLPs everywhere."

The 2026 study [Kolmogorov-Arnold Networks for Small Language Models](https://arxiv.org/abs/2607.15525) is useful because it refuses to cooperate with that story. Alves and Vicente found that small-basis KANs can expose learned scalar transformations in an auditable way, but their tested KAN-family replacements showed no consistent benchmark, quality, or latency advantage over strong MLP baselines.

So the interesting OMoC question is conditional:

> If Bithkuil yields stable semantically typed operands, can some cognitive relations be implemented as small, inspectable, locally mutable learned functions?

The function might be a KAN.

It might be an MLP.

It might be a lookup table.

It might be four lines of deterministic code and a developer wondering why the research team brought a spline to a subtraction problem.

The semantic interface should survive whichever implementation wins.

## Activation can address knowledge and computation

The OMoC work also converges with our agentic-memory research around **activation**.

[_Agentic memory needs more than retrieval_](/tags/rosetta/2026/08/28/agentic-memory/) now treats persistent cognition as broader than stored facts. Memories, procedures, evaluators, prompts, policies, tools, specialists, and routing rules can all alter future behavior.

That suggests a common family of activation questions:

```text
Should memory M activate?
Should procedure P activate?
Should operator O activate?
Should specialist S activate?
Should tool T activate?
```

The candidate signals overlap: semantic relevance, applicability, recency, prior success, scope, cost, latency, risk, authority, expected information gain.

The control rules do not.

A highly relevant memory can still be unauthorized. A frequently successful procedure can still be invalid under a changed dependency. A low-cost specialist can still be inappropriate for a high-stakes case.

This is where OMoC must resist collapsing everything into one score.

The learned layer can estimate useful fuzzy quantities. The policy layer still determines hard eligibility.

The 2026 ICLR paper [Rewarding Doubt](https://proceedings.iclr.cc/paper_files/paper/2026/hash/bf8065446507b0d3842838564ac4f1f3-Abstract-Conference.html) is relevant here because it demonstrates that proper-scoring-rule reinforcement learning can materially improve confidence calibration in a generative model. TypeSafe's RLCD and Laya's training use related proper-scoring ideas for decision distributions. Calibrated estimates are useful inputs to routing.

They are not permission.

Confidence can inform a gate. Confidence does not become the gate merely because it arrives with three decimal places and a very professional haircut.

## The first compiler chooses context; the second chooses cognition

Our [semantic-latticing work](/tags/rosetta/2026/08/28/semantic-latticing/) now makes the OMoC boundary cleaner.

Retrieval first produces candidates from a larger knowledge substrate. A context compiler then decides what the current consumer is allowed and needs to receive, at which resolution, under which scope, authority, confidentiality, and resource constraints.

Only then does OMoC answer a different question:

> Given this task-local semantic state, what should compute?

That gives the architecture two distinct compilation stages.

The **context compiler** compiles a working set.

The **cognitive compiler** compiles an execution graph.

Those compilers interact, but they should not become one invisible prompt-building function whose only documentation is "seemed to work in prod."

## Semantically sparse, physically batched

Dynamic sparse computation has an ugly practical enemy: hardware.

GPUs are very good at dense, predictable work. A semantically elegant system that generates thousands of tiny irregular kernels, device synchronizations, and network hops can spend so much time orchestrating thought that a dense model finishes first and goes for lunch.

So the implementation objective is not merely semantic sparsity.

It is **semantically sparse, physically batched** execution.

Equivalent operator calls should be grouped. Shared state should be encoded once where possible. Compatible decision heads should share forward passes. Specialist work should be batched across tasks. The runtime should preserve the semantic reason that an operator was chosen without requiring the physical hardware schedule to mirror the conceptual graph one node at a time.

This is one of the most important ways OMoC can fail.

If route selection saves 20 percent of model computation and introduces 40 percent of scheduling overhead, the architecture has successfully optimized the diagram.

## Rosetta records meaning; OMoC should not redefine it

[_Meaning That Survives Change_](/tags/research/2026/09/09/rosetta-pasigraphy-protocol/) describes Rosetta's job more precisely than the earliest OMoC sketches did.

Rosetta provides stable identity, provenance, explicit ambiguity, immutable lineage, receipts, execution traces, and governed extension. It is a semantic and interoperability spine.

OMoC is downstream operating machinery.

That boundary is constitutional.

Rosetta may publicly represent a route plan: which operators were selected, which were skipped, which evidence or constraints mattered, and which result followed. Public artifacts can make routing inspectable and interoperable.

They do not need to publish Entif's proprietary coefficients, learned ranking policy, provider-selection heuristics, resource-allocation strategy, or context-budget optimizer. Those are operational mechanisms unless and until a genuine interoperability requirement proves otherwise.

The current Rosetta repository also matters for maturity language. Rosetta today is a provenance-kernel prototype with fixture-backed source-aware flows, implemented content identity, receipts, validation, rights checks, and related bounded mechanics. The broader OMoC runtime described here remains research architecture, not a production capability already hiding behind the website.

We should be excited without lying.

It is surprisingly affordable.

## What would make OMoC lose

The architecture needs opponents, not fans.

Several results would weaken or kill major versions of the idea:

- Bithkuil or another explicit semantic representation fails to produce stable useful factors.
- A fixed dense model matches dynamic routing at lower total cost and latency.
- A strong single specialist handles the target workload better than heterogeneous composition.
- Parallel typed heads add little once a well-prompted generative model receives the same structure.
- Routing overhead erases the compute saved through sparsity.
- Learned routing becomes brittle under distribution shift or hides systematic errors behind confident scores.
- A generic typed representation works as well as the Bithkuil-derived one, weakening the donor-language-specific claim while preserving the broader typed-state result.
- Semantically local functions still require globally entangled internal representations, making "local cognition" mostly a naming convenience.

Those are useful losses.

OMoC should survive because it earns a better frontier of quality, cost, latency, inspectability, and recovery, not because the architecture diagram looks like somebody dropped a motherboard into a philosophy department.

## The larger bet

The deepest OMoC hypothesis is no longer that agents should be routed more cleverly.

It is that **task-local cognition may be compilable**.

A persistent semantic state can expose the current problem. A context compiler can produce the bounded working set. OMoC can select the smallest adequate set of cognitive operators. Independent operations can execute in parallel. Their outputs can return as typed state deltas rather than prose. Evaluation can tell us which operators helped. Persistent memory can preserve those outcomes and alter future activation.

At that point, "the model" becomes one participant in a larger cognitive machine.

That is the research direction.

Not one smarter agent.

A system that knows when not to wake one up.

## Research and development referenced

- Entif AI, [_Prepaying Semantics_](/tags/research/2026/09/12/prepaying-semantics/), ETR-2026-05.
- Entif AI, [Cognitive Tapestries via Semantic Latticing](/tags/rosetta/2026/08/28/semantic-latticing/).
- Entif AI, [Agentic Memory Needs More Than Retrieval](/tags/rosetta/2026/08/28/agentic-memory/).
- Entif AI, [_Meaning That Survives Change_](/tags/research/2026/09/09/rosetta-pasigraphy-protocol/), ETR-2026-04.
- Entif AI, [_We Had the Seeds of a Babel Fish for an AGI "Alien Mind" 48 Years Ago_](/tags/research/2026/09/10/babel-fish-alien-mind/), ETR-2026-01.
- TypeSafe AI, [Introducing System One Models and Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev), September 14, 2026.
- Nandakishor M., [Laya](https://github.com/NandhaKishorM/laya), with the [published model checkpoint](https://huggingface.co/convaiinnovations/laya).
- Ziming Liu et al., [KAN: Kolmogorov-Arnold Networks](https://arxiv.org/abs/2404.19756), 2024.
- Felippe Alves and Renato Vicente, [Kolmogorov-Arnold Networks for Small Language Models](https://arxiv.org/abs/2607.15525), 2026.
- David Bani-Harouni et al., [Rewarding Doubt](https://proceedings.iclr.cc/paper_files/paper/2026/hash/bf8065446507b0d3842838564ac4f1f3-Abstract-Conference.html), ICLR 2026.
