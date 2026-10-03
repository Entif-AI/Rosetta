---
{
  'id': 'entif.essay.can-semantically-typed-operands-make-cognition-local',
  'slug': 'can-semantically-typed-operands-make-cognition-local',
  'title': 'Can Semantically Typed Operands Make Cognition Local?',
  'description': 'A question about KANs opens into a larger architecture: typed semantic state, parallel decisions, local learned functions, cognitive compilation, and governed persistent learning.',
  'kind': 'essay',
  'status': 'published',
  'published': '2026-09-18',
  'authors': ['Crates McDade'],
  'tags':
    [
      'ai-research',
      'machine-learning',
      'semantic-representation',
      'agentic-systems',
      'model-architecture',
    ],
  'projects': ['bithkuil', 'rosetta'],
  'routeTag': 'ai-research',
  'related':
    [
      'entif.research.prepaying-semantics',
      'entif.research.omoc',
      'entif.research.agentic-memory',
      'entif.research.semantic-latticing',
    ],
  'sourceRefs':
    [
      'entif.research.prepaying-semantics',
      'ETR-2026-09 - Forget Me Not - Stage 2 research draft',
      'https://typesafe.ai/blog/introducing-system-one-models-and-jev',
      'https://github.com/NandhaKishorM/laya',
      'https://huggingface.co/convaiinnovations/laya',
      'https://arxiv.org/abs/2404.19756',
      'https://arxiv.org/abs/2607.15525',
      'https://proceedings.iclr.cc/paper_files/paper/2026/hash/bf8065446507b0d3842838564ac4f1f3-Abstract-Conference.html',
      'https://arxiv.org/abs/2412.08821',
      'https://arxiv.org/abs/2412.06769',
      'https://arxiv.org/abs/2402.17764',
    ],
  'featured': true,
}
---

There is a sentence buried in our Bithkuil research that I originally treated as a downstream question:

**Can semantically typed operands make small, separable learned functions useful as local cognitive transformations?**

That is a perfectly respectable research question. It is also, it turns out, a trap door.

The first time through it, the question sounds like it is about Kolmogorov-Arnold Networks. KANs replace ordinary scalar edge weights with learned one-dimensional functions. If those functions can be inspected, pruned, fitted, and changed locally, perhaps they give us a more legible way to learn small pieces of cognition.

Then the annoying question arrives: local functions over _what_?

If the input to a function is an opaque activation vector whose coordinates drift with the surrounding network, "local" may describe where the function sits in the architecture without telling us what the function _means_. We have located the plumbing. We have not labeled the pipes.

That is where this stopped being a KAN question for me.

The more interesting possibility is that a machine-oriented semantic representation gives learned functions stable operands: evidence, role, time, scope, causal direction, intended purpose, observed use, authority, uncertainty, quantity, membership, identity, and the other distinctions we currently pay large models to repeatedly reconstruct from prose. If those operands remain explicit enough, perhaps some cognitive operations stop requiring the entire model to wake up, reconstruct the scene, produce a miniature essay to itself, and then throw most of that work away after deciding whether a number is probably larger than another number.

We have spent the last several years getting very good at building bigger brains.

I am increasingly interested in how often we can avoid using the whole damn brain.

## The expensive part may be finding the operands

[_Prepaying Semantics_](/tags/research/2026/09/12/prepaying-semantics/) starts one layer upstream of model architecture. Its central hypothesis is that natural-language training may impose a **semantic reconstruction tax**: a bounded learner receives the information it needs, but receives it in a representation that makes reusable factors harder to discover, isolate, and recombine.

That claim is deliberately weaker than "natural language is bad for AI." Natural language is absurdly effective at the job humans evolved and engineered it to do. It is expressive, lossy when shared context can carry the difference, redundant when people need reinforcement, irregular because history happened, and ambiguous because humans routinely survive ambiguity by dragging half the surrounding world into interpretation.

Excellent human interface.

Possibly expensive machine intermediate representation.

Bithkuil is our attempt to test that distinction without hiding the answer inside the intervention. The early representation is not surface Ithkuil with all of its human-facing morphology and phonology. It is closer to a semantic abstract syntax tree: stable machine identities for semantic factors, explicit defaults and nulls, structural scope, controlled composition, and a developmental traversal that can be tested against shuffled and deliberately bad alternatives.

The relevant idea is simple. A learner can infer from many sentences that:

> this tool was designed for one purpose, but was actually used for another.

Or we can provide two typed operands:

```text
INTENDED_PURPOSE: X
ACTUAL_APPLICATION: Y
```

The fields do not answer the question. They do something more modest: they make the distinction available as a stable place to stand.

That distinction matters because a lossless encoding does not create new information. If two encodings preserve the same underlying world, an unrestricted ideal learner can recover the same answer from either. The research question is whether a _bounded_ model, finite dataset, real optimizer, and limited compute budget can reach useful functions more cheaply when important factors are exposed instead of repeatedly reconstructed.

That gives us the first bridge to local computation.

A compact function is only useful if its inputs are compact enough to identify.

## KANs become more interesting after semantics, not before it

The original [KAN paper](https://arxiv.org/abs/2404.19756) by Ziming Liu and colleagues made an arresting architectural move. Instead of using fixed activation functions on nodes and learned scalar weights on edges, Kolmogorov-Arnold Networks put learnable one-dimensional functions on the edges themselves.

That exposes a joint.

You can inspect a learned scalar transformation, visualize it, potentially simplify it, prune it, or replace it. That is immediately appealing if what you want is a machine whose cognitive machinery can be examined below the level of "well, somewhere inside these 70 billion numbers it apparently learned causality."

It is also very easy to get carried away.

Felippe Alves and Renato Vicente recently tested KAN-family replacements in [small language models](https://arxiv.org/abs/2607.15525). Their result is useful precisely because it is inconvenient: the KAN machinery offered a practical interface for auditing learned scalar transformations, but the tested replacements did **not** produce a consistent benchmark, quality, or latency advantage over strong MLP baselines. Some local results looked promising. They did not generalize into a coronation ceremony.

Good.

That kills the boring version of the idea.

I am not especially interested in replacing every transformer feed-forward block with a KAN block, printing a graph with prettier curves, and declaring that we have reinvented cognition because the weights acquired calligraphy.

The cleaner question is conditional:

> **If Bithkuil produces stable, semantically typed operands, can some relations be implemented as small, inspectable, locally mutable learned functions?**

That is different.

Consider the difference between asking a generic network to discover whatever hidden representation happens to support a task and giving a local operator an interface like:

```text
TemporalValidity:
    Claim × ValidTime × QueryTime
    → Applicability

EvidenceContribution:
    Evidence × Reliability × Context
    → SupportDistribution

CausalCompatibility:
    ObservationSet × Hypothesis
    → Compatibility
```

Those are schematic, not proposed Rosetta Core types and certainly not evidence that KANs are the correct implementation. An MLP, spline, tiny transformer, probabilistic head, symbolic routine, lookup table, or six lines of boring deterministic code may win a particular operation.

That is the point.

Once the operands have semantic identity, **the implementation can compete for the job**.

## Jev and Laya arrive from the other side

On September 14, TypeSafe AI publicly introduced [Jev and its "System One Model" architecture](https://typesafe.ai/blog/introducing-system-one-models-and-jev). Their framing starts from automation rather than semantic representation, but it lands on a closely related architectural pressure point.

Jev does not generate arbitrary strings. It takes unstructured state plus predefined typed questions and returns structured decisions with probability distributions. TypeSafe says those outputs are generated in parallel rather than token by token, and it trains the model with a method it calls Reinforcement Learning for Calibrated Decisions, or RLCD.

TypeSafe's speed, cost, and workflow benchmark claims are first-party results from a newly released system. I would not tattoo the Pareto frontier on anybody's chest yet.

The shape is what matters.

State in.

Typed probabilistic decisions out.

Ordinary software composes the decisions.

That is a dramatically different contract from asking a chat model to produce a paragraph that hopefully contains the JSON you wanted somewhere between its helpful introduction and its sudden spiritual awakening.

TypeSafe also says Jev "can't hallucinate" because the output is restricted to a predefined type. I would phrase that more narrowly. A typed model can still be wrong inside the type. If the choices are red, blue, and green, it can choose blue when reality is red with immaculate schema compliance. The important guarantee is that it cannot invent a fourth value called "Tuesday" and then explain why Tuesday is emotionally adjacent to green.

Wrong is still wrong.

Typed wrong is easier to compose.

The open-source [Laya project](https://github.com/NandhaKishorM/laya) makes the shape easier to inspect. Its [published model card](https://huggingface.co/convaiinnovations/laya) describes a 421 million parameter system built from a fully fine-tuned ModernBERT-large bidirectional encoder plus a two-layer decision head. It supports typed choice, score, and probability-like boolean questions, evaluates multiple questions in one forward pass, and reports calibrated distributions rather than generating prose.

Laya's own latency and Jev comparison numbers are also author-reported. Again, receipts before religion.

What matters for this discussion is that a proprietary release and an open implementation have now put the same useful object on the table:

**a model can be useful because it is good at making many bounded probabilistic judgments quickly, not because it is good at writing the next token.**

That is a very useful cognitive primitive.

## Parallelize cognition, not sentences

Autoregressive language generation carries an architectural assumption that is so familiar it can disappear from view: the next unit of computation is organized around the next position in a sequence.

But many cognitive dependencies are not linguistic dependencies.

Suppose a system needs to evaluate:

```text
Is this memory relevant?
Is its source current?
Does this evidence contradict the active hypothesis?
Is this procedure applicable?
Does this context join cross a policy boundary?
Should this case escalate?
Is this provider stale?
How likely is this route to succeed?
```

Those questions may depend on the same semantic state without depending on one another.

Why serialize them into prose?

The important serial dimension is not necessarily token position. It is **semantic dependency**.

If five operations consume the same current state and none requires the output of another, run them together. If one operation depends on the result of two earlier operations, wait at that edge. If a hard rights or authority check must complete before information can enter context, that becomes a barrier. If an action requires an authorization decision, that becomes another barrier.

The architecture starts to look less like one enormously talented typist and more like a dataflow system:

```text
semantic state
      │
      ├── temporal analysis
      ├── contradiction scan
      ├── retrieval
      ├── applicability checks
      ├── confidence estimation
      └── specialist inference
              │
              ▼
       semantic integration
              │
        [authorization barrier]
              │
              ▼
            action
```

That does **not** mean "everything in parallel." Causality still exists. Dependencies still exist. Governance still exists. A machine that parallelizes the part where it checks whether it has permission to do the thing _after_ doing the thing has merely reinvented bureaucracy with CUDA.

The right phrase is closer to **bulk-synchronous semantic dataflow**: parallel wherever the dependency graph permits it, explicit barriers wherever meaning, privilege, or causal order requires them.

## OMoC stops looking like a fancier MoE

Our existing [Ontological Mixture of Concepts](/tags/rosetta/2026/08/28/ontological-mixture-of-concepts/) work began with a routing question. Instead of assigning work to fixed agent costumes like "researcher," "critic," and "architect," represent the problem by its local concept signature, ambiguity, evidence density, constraints, and stakes, then activate cognitive operators because they apply to that shape.

I used to think of this primarily as smarter orchestration.

With Bithkuil, KANs, Jev/Laya-style decision models, and explicit persistent cognitive state on the same table, OMoC starts looking more like a **runtime compiler for cognition**.

The compiler is not choosing one model.

It is assembling an execution graph from heterogeneous machinery:

```text
exact relation               → deterministic code
typed probabilistic judgment → Jev/Laya-shaped decision model
smooth local learned mapping → small neural or KAN-like function
semantic retrieval           → memory mechanism
causal or temporal relation  → specialized operator
novel synthesis              → generative model
external state               → tool
unresolved ambiguity         → competing conjectures
high-stakes judgment         → human review
```

This is where the phrase **semantically sparse, physically batched** becomes useful.

Semantically, the system should activate only the machinery relevant to the current task. Physically, GPUs still like large predictable matrix operations and become substantially less philosophical when fed thousands of tiny irregular branches. A practical implementation therefore needs to batch equivalent operator calls, group compatible work, and keep the semantic sparsity from turning into a magnificent scheduler that spends more time scheduling cognition than performing it.

There is a research question hiding inside that engineering problem:

> Can semantic sparsity reduce total computation without destroying the hardware efficiency that made dense neural models fast in the first place?

If the answer is no, OMoC can become very sophisticated theater.

That outcome has to be allowed.

## Forget Me Not changes the unit of analysis

Then I left out the piece that made the architecture much stranger.

Our current ETR-2026-09 work, **Forget Me Not**, treats long-horizon agent memory not as a bag of retrieved facts but as **governed cognitive metabolism**. Evidence, derived representations, provider projections, activation state, compiled context, procedures, routing policies, evaluations, and actions are different persistent states with different authority, lifecycle, and recovery behavior.

That changes what "learning" means.

A successful cognitive episode can produce a memory. It can also produce a better retrieval strategy, a validator, a test, a prompt fragment, a routing rule, a workflow, a deterministic transform, or a reusable procedure. Those artifacts can influence future cognition even if no vector search ever retrieves them.

In other words:

**procedure is memory when procedure carries cognition forward.**

That gives the architecture a slow loop around the fast one.

The fast loop solves the present task:

```text
current state
  → compile context
  → compile cognitive operators
  → execute
  → integrate
  → act
  → evaluate
```

The slow loop changes how future tasks will be solved:

```text
evaluation
  → identify reusable cognition
  → propose persistent change
  → validate and promote
  → alter memory / procedure / routing
  → observe future outcomes
  → revalidate, demote, replace, or roll back
```

That second loop is not a memory feature bolted onto a model.

It changes the transition function.

## Three graphs, not one giant prompt

Once I stopped flattening this into "model plus memory," I ended up with three graphs.

The first is the **semantic-state graph**: entities, relations, time, evidence, causal structure, scope, uncertainty, goals, constraints, conjectures.

The second is the **cognitive-function graph**: the operations capable of transforming that state. A causal operator, a temporal operator, a probabilistic decision head, a retrieval mechanism, a tool, a specialist model, a deterministic validator.

The third is the **warrant and lifecycle graph**: where the state and procedures came from, what supports them, which authority admitted them, what they influenced, what depends on them, when they should be reconsidered, and what must be repaired if their premises fail.

That third graph is what keeps the first two from quietly becoming institutional folklore encoded in tensors.

Suppose a source supports a synthesis. The synthesis informs a procedure. The procedure changes a routing rule. The routing rule changes which evidence future agents see. Correcting the original source without finding those descendants can leave the organization behaving as if the error were never corrected.

The database row is fixed.

The cognition is still haunted.

Forget Me Not therefore treats promotion and demotion as paired operations, derivation and invalidation as paired operations, learned routing and rollback as paired operations, determinization and revalidation as paired operations. The system should be able to answer not only "what do we remember?" but "what did this memory teach us to do, where did that behavior propagate, and what has to change if the memory was wrong?"

That is a much more interesting machine than a chatbot with a vector database stapled to its ankle.

## Progressive determinization may be the real learning engine

One implication deserves more attention than I initially gave it.

If the system repeatedly spends expensive general intelligence rediscovering the same stable cognitive transformation, that repeated expense is evidence.

Maybe the task should compile.

The progression might look something like this:

```text
frontier generative model
        ↓ repeated success
structured decomposition
        ↓
parallel probabilistic heads
        ↓
small specialist or local learned function
        ↓
deterministic procedure
```

Not every operation moves downward.

Novel synthesis may remain generative. A messy social inference may remain probabilistic. A mathematical identity should probably not be serviced by a moody neural spline once ordinary arithmetic has entered the building.

The important thing is that the architecture can **search for cheaper equivalent machinery** as experience accumulates.

This is more than caching. A cache remembers an answer. Progressive determinization tries to preserve a _method_ at lower recurring cost.

Jev and Laya make an especially interesting middle tier in that picture. A problem may begin as:

> "Read this entire situation and decide the correct operational route."

After enough experience, the system may discover that the route depends on six bounded questions with stable output types. Now the cognitive task can be compiled from open-ended generation into parallel probabilistic decisions.

After more experience, two of those decisions may turn out to be exact policy checks.

Compile them again.

The machine learns partly by becoming cleverer.

It may also learn by **needing less cleverness for things it already understands**.

## Calibration is evidence, not permission

This is where the decision-model work intersects sharply with persistent-state governance.

The 2026 ICLR paper [Rewarding Doubt](https://proceedings.iclr.cc/paper_files/paper/2026/hash/bf8065446507b0d3842838564ac4f1f3-Abstract-Conference.html) trains language models to express better-calibrated confidence using a logarithmic proper scoring rule. TypeSafe's RLCD framing and Laya's implementation similarly make probability distributions central to the model contract.

That is useful.

It is not authority.

Forget Me Not spends a frankly unhealthy amount of time preserving distinctions like:

```text
confidence ≠ authority
salience ≠ authority
activation ≠ retrieval eligibility
retrieval eligibility ≠ context inclusion
context inclusion ≠ permission to act
```

The distinction matters because probabilistic routing invites a very attractive mistake. If a model says a memory is relevant with 0.97 probability and a route will succeed with 0.94 probability, somebody will eventually want to multiply two numbers, put a threshold under them, and call the result governance.

No.

Hard rights, tenancy, jurisdiction, quarantine, invalidation, and authority constraints have to define the eligible set before optimization begins.

The learned controller can say:

```text
P(relevant) = 0.97
P(route_success) = 0.94
P(stale) = 0.04
```

The policy layer can still say:

```text
DENIED
```

And **DENIED wins**.

This is another reason I do not want the whole architecture buried in one giant learned policy. Fuzzy cognition is useful. Exact constraints are useful. Confusing them because both can be represented by numbers is how you end up with a highly calibrated machine explaining, at 99.2 percent confidence, why it was mathematically efficient to leak the wrong tenant's data.

The problem was never confidence.

## Context itself becomes compiled cognition

Our earlier [semantic latticing](/tags/rosetta/2026/08/28/semantic-latticing/) work treated context as a structured composition rather than a pile of retrieved prose. Forget Me Not pushes the idea further.

Retrieval does not feed the prompt directly.

A **context compiler** decides which evidence and semantic objects may reach a consumer, under what scope, authority, confidentiality, resolution, token budget, latency budget, and risk posture. Different consumers can receive different compiled views of the same persistent state.

Then OMoC performs a second compilation:

> given this task-local semantic state, which cognitive machinery should execute?

That gives us two different compilers.

The first compiles **what the machine is allowed and needs to know right now**.

The second compiles **how the machine should operate on it**.

I do not mean "compiler" poetically here. The system increasingly exhibits compiler-like behavior:

1. normalize a higher-level representation;
2. identify dependencies;
3. select an execution plan;
4. choose implementations;
5. allocate limited resources;
6. execute;
7. profile outcomes;
8. cache or compile stable work;
9. invalidate compiled paths when assumptions change.

At some point, calling all of that a "prompt" starts to feel like calling an operating system a very elaborate text file.

## The representation tax has company

Prepaying Semantics names the possible cost of repeatedly reconstructing useful semantic factors from surface language.

Putting the rest of this architecture beside it exposes several additional taxes that may be measurable.

There is an **autoregressive serialization tax** if a bounded decision has to be expressed through token-by-token generation before software can use it.

There is an **irrelevant-computation tax** if every task activates a large general model when only a small subset of cognitive functions is required.

There is a **rehydration tax** if the system repeatedly reconstructs the same task-relevant state from raw memory instead of maintaining compact provenance-bearing semantic structure.

There is a **global-interference tax** if every learned improvement has to alter shared parameters rather than a local function, route, procedure, or activation policy.

And Forget Me Not adds what I would call a **cognitive maintenance tax**: the cost of discovering which persistent conclusions, procedures, projections, caches, and routes became stale when an upstream premise changes.

That last one matters because text is a lousy dependency graph.

If a prose summary silently entangles time, scope, evidence, authority, and causal interpretation, changing one premise may require regenerating and re-evaluating the whole artifact. A typed semantic object could, in principle, let us identify which dimension changed and which downstream operations actually depend on it.

That is not yet a result.

It is an experiment I very much want.

[BitNet b1.58](https://arxiv.org/abs/2402.17764) is another useful reminder to keep the axes separate. Low-bit weights can change arithmetic, memory traffic, and hardware economics without answering the semantic-organization question at all. Representation, output architecture, routing, persistence, local plasticity, and numerical precision may interact, but I do not want one good result in any of them laundering itself into evidence for the others.

## Language may be the perimeter, not the machine

This also changes where natural language belongs.

Large Concept Models demonstrated that a generative model can operate autoregressively over [sentence-level semantic embeddings](https://arxiv.org/abs/2412.08821) rather than ordinary word or subword tokens. [Coconut](https://arxiv.org/abs/2412.06769) explores reasoning by feeding continuous hidden states back into the model without first serializing each intermediate step into language. Both are useful precedents for the broader claim that the token stream is not the only possible computational substrate.

Bithkuil asks a different question.

What if the intermediate state is not merely latent or higher-level, but **explicitly typed enough to support stable composition, local operators, provenance, and external memory?**

Then language starts to move toward the boundary:

```text
human language / code / sensors
            ↓
        surface codecs
            ↓
      semantic machine IR
            ↓
      cognitive computation
            ↓
        semantic state
            ↓
        surface codecs
            ↓
language / code / action
```

That does not make language unimportant. It makes language a magnificent interface instead of requiring it to double as the machine's only internal bus.

Compilers do not hate source code because they lower it into an intermediate representation.

They respect it enough not to make the optimizer rediscover the parser on every pass.

## The model may stop having a meaningful size

If this direction survives experimentation, one familiar question becomes increasingly weird:

> How many parameters does the model have?

Which model?

Imagine a system with:

```text
one semantic encoder
one parallel decision engine
several tiny specialists
dozens of local learned functions
hundreds of deterministic operators
multiple retrieval mechanisms
a persistent semantic graph
a procedure library
a frontier generative fallback
```

Adding every parameter in the building produces a number. I am not sure it produces a useful measurement.

More interesting quantities might be:

- active parameters per cognitive event;
- average semantic state hydrated per task;
- parallel depth of the execution graph;
- fraction of tasks resolved without frontier inference;
- cost per successful outcome;
- energy per verified outcome;
- fraction of repeated cognition compiled into cheaper procedures;
- rollback and revalidation cost when persistent state changes;
- useful cognition per unit of context;
- and the amount of general model capacity required after semantic structure and local machinery have done their jobs.

This would be a different scaling regime.

Not "how large is the brain?"

More like "how much of the cognitive system needs to become active to solve _this_ problem?"

## This is a machine cognitive architecture, not a new model block

Put the pieces together and the stack now looks roughly like this:

```text
EXTERNAL WORLD
      │
      ▼
INGRESS / GUARD
      │
      ▼
PERSISTENT EVIDENCE + SEMANTIC STATE
      │
      ▼
CONTEXT COMPILER
      │
      ▼
BITHKUIL-LIKE SEMANTIC IR
      │
      ▼
OMoC COGNITIVE COMPILER
      │
      ├── deterministic operators
      ├── parallel decision heads
      ├── local learned functions
      ├── memory mechanisms
      ├── specialist models
      ├── tools
      ├── simulators
      └── generative models
      │
      ▼
PARALLEL STATE DELTAS
      │
      ▼
SEMANTIC INTEGRATION
      │
      ▼
ACTION / OUTPUT
      │
      ▼
EVALUATION
      │
      ▼
COGNITIVE METABOLISM
retain / compile / promote / revalidate / roll back
      │
      └──────────────► future cognition
```

Rosetta belongs around this machinery as semantic constitution and lifecycle/provenance substrate, not as the proprietary brain that decides every route. Rosetta should preserve identity, provenance, ambiguity, authority, lineage, receipts, and interoperable meaning. It should not quietly absorb a particular KAN architecture, Jev-like head, routing algorithm, or private optimization strategy into Core because I had an exciting Thursday.

Entif can experiment with the operating machinery.

Rosetta should keep the meanings from moving underneath it.

That separation is boring in exactly the way constitutions are supposed to be boring.

## The experiment can kill this

The fastest way to ruin an architecture this interesting would be to build the entire cathedral before testing whether gravity works.

The research sequence matters.

First, test representation.

Does a Bithkuil-derived semantic substrate actually reduce sample, parameter, or compute requirements for relational and compositional competence against natural-language and generic typed controls?

If not, stop crediting Bithkuil with downstream miracles it never earned.

Second, separate representation from output architecture.

Compare:

```text
representation:
    natural language
    generic typed semantic IR
    Bithkuil-derived IR

output:
    autoregressive generation
    parallel typed decision head
```

If the typed representation helps only when the model also receives a convenient structured output format, that tells us something. If the parallel head erases the Bithkuil advantage, that tells us something else. If Bithkuil plus parallel decision computation produces a multiplicative gain, I will become considerably more annoying about this.

Third, test local learned functions.

Hold the semantic operands fixed and compare KAN-like functions, ordinary small MLPs, tiny transformer heads, and deterministic implementations where a deterministic answer exists. Measure auditability, data efficiency, generalization, latency, mutability, and whether a local update damages unrelated competence.

The KAN should be allowed to lose.

Fourth, test dynamic composition.

Compare a fixed execution graph with deterministic OMoC routing and later with learned routing. Measure total compute, latency, route quality, hardware utilization, and the orchestration overhead itself. A routing system that saves 20 percent of model compute by adding 40 percent of scheduler cost has successfully optimized the slide deck.

Fifth, add persistence.

Compare stateless execution, ordinary retrieval-augmented memory, and governed persistent cognition. Measure not only task accuracy but repeated reconstruction cost, context efficiency, stale-state exposure, descendant invalidation, rollback, and the cost of maintaining the cognitive machinery over time.

Only then do we earn the larger claim.

## What would make me abandon it

I can already see several ways this architecture could fail.

Bithkuil may simply move difficult semantic work into an expensive compiler without reducing total cost.

Explicit factorization may destroy useful ambiguity or omit variables the learner would otherwise discover.

The local-function idea may turn out to be a category mistake: semantically named operands could still require highly entangled transformations whose useful implementation is distributed across a dense model.

KANs may remain interesting principally as an auditing interface without earning a computational role.

Parallel decision models may excel only on bounded classification and routing tasks while contributing little to deeper reasoning.

OMoC may spend more compute deciding what should think than dense models spend thinking.

Persistent cognitive metabolism may create so much lineage, revalidation, and recovery machinery that the maintenance bill eats the inference savings.

And the nastiest failure is ontological blindness. A typed architecture can become exquisitely efficient at reasoning over the variables it knows while becoming systematically blind to the variable nobody thought to name.

That is why an explicit semantic system needs a first-class way to say:

> none of my current types fit what I am seeing.

Otherwise the ontology becomes the world's most organized blind spot.

## The model may be the wrong unit of analysis

I started with a question about whether semantically typed operands could make small learned functions useful.

I still think that is the right question.

I no longer think it is a small one.

Jev and Laya suggest that many machine-useful judgments do not inherently need token-by-token language generation. KANs suggest that learned transformations can, in some settings, expose smaller inspectable functional joints, while the current evidence very helpfully refuses to promise that those joints automatically outperform MLPs. Bithkuil asks whether explicit semantic factorization can make those joints mean something stable. OMoC asks whether the useful ones can be conditionally assembled instead of activating everything. Forget Me Not asks how successful cognition survives across time without becoming immortal garbage. Rosetta asks whether the meaning, evidence, uncertainty, and lineage can remain inspectable while all of that machinery changes.

Those are no longer independent curiosities.

They form a coherent architectural question:

> **What if machine cognition is better modeled as persistent semantic state whose task-local computation graph is dynamically compiled from heterogeneous cognitive operators, executed in parallel where dependencies permit, and gradually converted into cheaper cognitive capital when repeated experience justifies it?**

That sentence contains enough unproven machinery to keep us busy for quite a while.

It also suggests why the conventional phrase "model architecture" may eventually become too small for the thing we are building.

The model may be one component inside the cognitive architecture.

Language may be one codec around it.

Memory may be active computational state.

Learning may include deciding which parts of yesterday's intelligence no longer need intelligence today.

And if that last sentence survives the experiments, I suspect it will matter more than whether the winning local function happens to be a KAN.

## Research and development referenced

- Entif AI, [_Prepaying Semantics_](/tags/research/2026/09/12/prepaying-semantics/), ETR-2026-05.
- Entif AI, [Ontological Mixture of Concepts](/tags/rosetta/2026/08/28/ontological-mixture-of-concepts/).
- Entif AI, [Cognitive tapestries via semantic latticing](/tags/rosetta/2026/08/28/semantic-latticing/).
- Entif AI, [Agentic memory needs more than retrieval](/tags/rosetta/2026/08/28/agentic-memory/).
- TypeSafe AI, [Introducing System One Models and Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev), September 14, 2026.
- Nandakishor M., [Laya](https://github.com/NandhaKishorM/laya), open-source System One decision engine; [model card and checkpoint](https://huggingface.co/convaiinnovations/laya).
- Ziming Liu et al., [KAN: Kolmogorov-Arnold Networks](https://arxiv.org/abs/2404.19756), 2024.
- Felippe Alves and Renato Vicente, [Kolmogorov-Arnold Networks for Small Language Models](https://arxiv.org/abs/2607.15525), 2026.
- David Bani-Harouni et al., [Rewarding Doubt: A Reinforcement Learning Approach to Calibrated Confidence Expression of Large Language Models](https://proceedings.iclr.cc/paper_files/paper/2026/hash/bf8065446507b0d3842838564ac4f1f3-Abstract-Conference.html), ICLR 2026.
- LCM Team et al., [Large Concept Models: Language Modeling in a Sentence Representation Space](https://arxiv.org/abs/2412.08821), 2024.
- Shibo Hao et al., [Training Large Language Models to Reason in a Continuous Latent Space](https://arxiv.org/abs/2412.06769), 2024, revised 2026.
- Shuming Ma et al., [The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits](https://arxiv.org/abs/2402.17764), 2024.
