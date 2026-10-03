---
{
  'id': 'entif.research.semantic-latticing',
  'slug': 'semantic-latticing',
  'title': 'Cognitive Tapestries via Semantic Latticing',
  'description': 'Semantic latticing treats context as a compiled, provenance-bearing semantic working set rather than a flat pile of retrieved prose, with progressive disclosure and explicit context policy.',
  'kind': 'research',
  'status': 'published',
  'published': '2026-08-28',
  'updated': '2026-09-18',
  'authors': ['Entif AI'],
  'tags':
    [
      'research',
      'semantic-representation',
      'context',
      'agentic-systems',
      'bithkuil',
      'provenance',
    ],
  'projects': ['rosetta', 'bithkuil'],
  'routeTag': 'rosetta',
  'related':
    [
      'entif.project.rosetta',
      'entif.research.omoc',
      'entif.research.agentic-memory',
      'entif.research.prepaying-semantics',
      'entif.research.rosetta-pasigraphy-protocol',
    ],
  'sourceRefs':
    [
      'docs/PRDs/20251024 - PRD - Rosetta - Cognitive Tapestries via Semantic Latticing.md',
      'Rosetta v3.0.0 Core Spine Specification',
      'ETR-2026-05 - Prepaying Semantics',
      'ETR-2026-09 - Forget Me Not - Stage 2 near-final publication draft',
      'https://arxiv.org/abs/2412.08821',
      'https://arxiv.org/abs/2412.06769',
      'https://aclanthology.org/2022.acl-long.415/',
      'https://aclanthology.org/N19-1235/',
      'https://blog.modelcontextprotocol.io/posts/2026-07-28/',
    ],
  'featured': false,
  'noindex': false,
}
---

The long-context era produced an extremely understandable architectural reflex:

> if context helps, perhaps the answer is more context.

So we built larger windows, retrieved more documents, preserved longer histories, generated summaries of the histories, retrieved the summaries, and discovered that a model can be buried under an impressive quantity of perfectly relevant material.

Capacity is not structure.

**Semantic latticing treats context as something to compile, not something to shovel.**

The goal is not to squeeze an entire knowledge substrate through the model's front door. It is to construct a task-specific cognitive Tapestry from stable identities, relations, evidence, constraints, ambiguity, and policy, while preserving enough provenance to explain why each piece was admitted and what was left outside.

The difference is easy to miss because both approaches end with "context."

One is a pile.

The other is an artifact.

## A Tapestry is a working set, not the memory

Rosetta v3.0.0 already gives **Tapestry** a narrow and useful meaning: a compiled working set assembled under a particular context or set of constraints.

That distinction matters.

A Tapestry is not the global knowledge graph. It is not the persistent memory system. It is not the truth. It is not the complete conversation. It is not a larger prompt with a more romantic noun.

It is the slice of state assembled for a task.

```text
persistent evidence and knowledge
           ↓
candidate retrieval
           ↓
eligibility and compatibility
           ↓
context compilation
           ↓
       TAPESTRY
           ↓
     current consumer
```

The consumer might be a planner, coder, critic, classifier, policy evaluator, specialist model, large generative model, or human reviewer.

Those consumers do not necessarily need the same context.

The planner may need goals, constraints, prior attempts, and dependencies. The verifier may need source evidence, test expectations, and claims. The stylistic editor may need the semantic invariant and house voice without receiving credentials, private implementation details, or three thousand lines of unrelated operational history.

Same persistent substrate.

Different compiled view.

That is a context architecture.

## Retrieval is a council, not a funnel

Our agentic-memory work sharpened an assumption that was too implicit in the original semantic-latticing sketches: there is no reason one retrieval mechanism should own relevance.

Exact identifiers are good at exact identity.

Lexical search is good at words.

Embeddings are useful for semantic similarity.

Graph traversal exposes explicit relationships.

Temporal indexes answer sequence and validity questions.

Episodic recency captures another useful dimension.

Procedure and policy lookup are different again.

Activation or spreading activation can model accumulated associative relevance.

Provider-specific systems add still more mechanisms.

[_Agentic Memory Needs More Than Retrieval_](/tags/rosetta/2026/08/28/agentic-memory/) therefore treats retrieval as a **council**. Several mechanisms may produce candidates. They do not automatically vote one another into truth.

That last sentence is load-bearing.

If one source becomes a chunk, an embedding, a graph edge, a summary, and a wiki entry, five retrieval hits have not produced five independent witnesses. They have produced five descendants wearing different jackets.

Lineage comes before majority.

## Cheap relevance should precede expensive cognition

The obvious way to make a giant context window affordable is not to fill it.

Hashes, stable identifiers, lexical terms, structural patterns, embeddings, source traits, known relations, recency, scope, volatility, authority class, and task metadata can all narrow the candidate field before deep hydration or frontier-model inference.

This creates a practical hierarchy:

```text
cheap exact filters
      ↓
cheap structural relevance
      ↓
semantic and relational retrieval
      ↓
selective hydration
      ↓
expensive interpretation only where needed
```

The point is not that every early stage must be deterministic. It is that the system should not repeatedly pay frontier-model prices to rediscover distinctions it already has in structured form.

Past cognition should make future narrowing cheaper.

Otherwise memory growth becomes a tax on intelligence: every useful thing the system learns increases the amount of material it must reread forever.

That is a terrible retirement plan.

## Prepaying semantics moves context below prose

[_Prepaying Semantics_](/tags/research/2026/09/12/prepaying-semantics/) changes the latticing question again.

The original semantic-latticing work focused on concepts and relations outside the model. Bithkuil asks whether the machine's developmental representation can expose useful semantic factors directly rather than repeatedly reconstructing them from natural-language surface forms.

If that signal survives its experiments, a Tapestry can become more than a curated bag of text.

It can become a **typed semantic working state**.

Instead of hydrating:

```text
"The report says X, but only for population Y, during period Z,
and it was inferred rather than directly observed..."
```

a machine-facing representation could preserve the relevant factors structurally:

```text
CLAIM: X
POPULATION: Y
VALID_TIME: Z
EPISTEMIC_STATUS: inferred
SOURCE: S
AUTHORITY: A
```

That does not make the representation correct.

It makes certain distinctions harder to accidentally erase.

This is the same experimental boundary emphasized in _Prepaying Semantics_: a compiler can reduce the learner's burden by making structure local, but the compiler's own cost, errors, and blind spots belong on the ledger. A semantic compiler that consumes more resources than it saves has moved the bill. A hand-built ontology that excludes the variable that matters can make the system efficiently wrong.

Explicit structure is an intervention.

It still has to earn its keep.

## Other projects already show that tokens are not the only useful unit

This direction sits beside several external research lines without being equivalent to them.

Meta's [Large Concept Models](https://arxiv.org/abs/2412.08821) operate autoregressively over sentence-level embeddings in the multilingual SONAR space rather than ordinary word or subword tokens. The work is useful here because it demonstrates that a generative architecture can move its prediction unit above the token level.

[Coconut](https://arxiv.org/abs/2412.06769) goes somewhere else: instead of decoding every intermediate reasoning state into language, it feeds hidden states back into the model as continuous thought. The authors report that this can represent multiple possible next reasoning steps and improve selected tasks involving search and backtracking.

Neither system gives us Bithkuil.

That is precisely why they are useful neighbors.

LCM says: the modeling unit can be a higher-level semantic representation.

Coconut says: intermediate reasoning need not be serialized through natural language.

Bithkuil asks: can the intermediate state become **explicitly typed enough** that outside systems can address, preserve, compare, route, and govern its semantic parts?

That is a more demanding claim, and an unproven one.

## Semantic graphs also teach an annoying lesson about order

Abstract Meaning Representation and Minimal Recursion Semantics provide another relevant precedent.

[Graph pre-training for AMR](https://aclanthology.org/2022.acl-long.415/) treats sentence meaning as a graph of semantic units and relations, while [work generating text from rich MRS structures](https://aclanthology.org/N19-1235/) demonstrates that structured semantic representations can serve as effective inputs for natural-language realization.

The important lesson for latticing is not "use AMR."

It is that **graph content and sequence presentation are different things**.

A semantic graph may be invariant under several traversal orders while a sequence model is not. Once a graph is linearized into tokens, where a relation appears can change how easily the model learns or uses it.

That gives semantic latticing two jobs:

1. decide **which** semantic state belongs in the working set;
2. decide **how** that state should be presented or traversed by the current consumer.

The second job is not formatting.

It can change cognition.

## Context compilation is a governed transformation

Our current ETR-2026-09 research, _Forget Me Not_, makes this point much harder to ignore.

Retrieval results should not flow directly into prompts.

A context compiler must decide:

- which candidates are eligible at all;
- whether individually valid items are mutually compatible;
- what semantic resolution the consumer needs;
- which constraints must survive compression;
- which source and lineage references must remain attached;
- which material is omitted because of budget;
- which material is omitted because policy forbids it;
- which version of policy governed the compilation;
- which scope, tenant, jurisdiction, and confidentiality boundaries apply;
- which uncertainty or contradiction must remain visible rather than being "helpfully" summarized away.

That makes a compiled context a derivative artifact with its own provenance.

The context is not innocent because it contains no new facts.

Selection is a transformation.

Omission is a transformation.

Compression is a transformation.

Ordering is a transformation.

The model sees the result, not the warehouse.

## A valid item can participate in an invalid context

One of the most important results from _Forget Me Not_ is the distinction between item authorization and **join compatibility**.

Two memories can each be valid and individually permissible while their combination is not.

Examples include:

- a policy from the wrong jurisdiction joined with an otherwise valid case;
- an old preference joined after a later revocation;
- a statistic for one population attached to another;
- an allegation collapsed into an established fact;
- separately accessible records combined to reveal protected information;
- a staging exception reused in production;
- a private agent reflection promoted into shared organizational context.

This is not a similarity-search failure.

It is a context-construction failure.

So the order should be:

```text
candidate retrieval
      ↓
hard eligibility
      ↓
set-level compatibility
      ↓
relevance / ranking / budget
      ↓
compiled context
```

Relevance cannot buy its way past a hard boundary.

A gorgeous cosine similarity score is not a hall pass.

## Context inclusion is still not permission to act

Semantic latticing ends before authority to act begins.

That boundary matters because a context compiler may legitimately include an item as evidence without granting the downstream consumer permission to treat it as policy, truth, or executable instruction.

The _Forget Me Not_ non-flattening rules are useful here:

```text
persistence ≠ authority
authority ≠ confidence
confidence ≠ salience
salience ≠ activation
activation ≠ retrieval eligibility
retrieval eligibility ≠ context inclusion
context inclusion ≠ permission to act
```

Those are different state dimensions.

Flatten them and the system starts laundering relevance into authority.

Preserve them and the Tapestry becomes a bounded working set rather than a small temporary dictatorship run by whichever chunk ranked first.

## Progressive disclosure is a semantic policy

Not every consumer needs the full source representation immediately.

A Tapestry can expose compact semantic state first, then hydrate additional source evidence, history, or detail when the task crosses a threshold.

This is progressive disclosure:

```text
L0: identity and task-local summary
L1: structured semantic neighborhood
L2: detailed evidence, source, history, exceptions
```

The exact levels are implementation choices, not Rosetta constitutional law.

The principle is that resolution should follow need.

A lightweight classifier does not need the entire research corpus to answer a bounded eligibility question. A human auditor investigating a consequential failure may need every receipt and source manifestation available. A small edge device and a frontier research model can work from the same underlying state at different hydration levels.

That can improve cost and latency.

It can also create failure.

If the short representation drops the governing exception, the compression has changed the effective rule.

The context compiler therefore needs conformance tests, not merely a token counter.

## Stable context can be cached, if its identity includes the things that matter

Repeatedly recompiling identical stable context wastes time.

Caching is attractive.

Caching is also how yesterday's authorization becomes tomorrow's security incident if cache identity ignores the policy that made the content legal.

Stable compiled context can be cached only when identity includes the dependencies that control validity: source versions, policy versions, scope, tenant, jurisdiction, confidentiality, quarantine state, and other material constraints.

The July 2026 [Model Context Protocol specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/) now includes cache hints for list and resource results. That is useful transport and caching infrastructure.

It is not memory authority.

MCP can help carry context.

Rosetta and application policy still need to preserve what the context means, where it came from, and whether it remains eligible.

## The Tapestry and OMoC form two different compilers

The newer [OMoC work](/tags/rosetta/2026/08/28/ontological-mixture-of-concepts/) makes the overall architecture cleaner by refusing to make one compiler do two jobs.

Semantic latticing asks:

> **What should this consumer know right now?**

OMoC asks:

> **What should compute over that state?**

So:

```text
persistent cognitive substrate
          ↓
    context compiler
          ↓
       Tapestry
          ↓
    OMoC compiler
          ↓
task-local computation graph
```

This is not a claim that Rosetta currently implements a production context compiler or OMoC runtime. The current repository is a provenance-kernel prototype with fixture-backed source flows and bounded implemented mechanics around identity, receipts, validation, rights, and related contracts.

The diagram is research architecture.

That distinction stays in the article because the easiest way to corrupt a provenance project is to become vague about the provenance of its own capabilities.

## Context economics may be a first-class research problem

[_Prepaying Semantics_](/tags/research/2026/09/12/prepaying-semantics/) names a possible semantic reconstruction tax during learning.

Semantic latticing suggests another:

**rehydration tax**.

If every task requires reconstructing the same useful semantic neighborhood from raw prose, the system pays repeatedly for work that persistent structure might preserve.

There is also a **context dilution tax**: useful information can become harder to exploit when surrounded by large amounts of merely relevant material.

And there is a **maintenance tax**: when an upstream premise changes, a poorly structured context system may have to rediscover every summary, cache, and compiled package that inherited the old assumption.

These are hypotheses, not accepted metrics.

They are measurable enough to deserve experiments.

Compare:

- raw retrieval into a prompt;
- ordinary RAG with reranking;
- structured semantic retrieval;
- compiled Tapestries with progressive disclosure;
- the same Tapestries with explicit compatibility and lifecycle controls.

Measure task success, source faithfulness, context tokens, latency, cost, stale-state exposure, policy failures, correction propagation, and how much source material an auditor needs to reconstruct why an item appeared.

If a simpler RAG pipeline performs just as well with lower cost and fewer moving parts, semantic latticing should lose.

The name does not get tenure.

## The actual objective

The point of semantic latticing is not to create a prettier graph database.

It is to stop treating the prompt as the natural home of organizational cognition.

Persistent evidence can remain outside the model.

Semantic relations can remain outside the model.

Ambiguity can remain explicit.

The Tapestry can compile the smallest useful working state for the present task.

The model can operate on that state.

And when the task ends, the entire history does not need to remain sweating inside a context window in case somebody asks about it later.

That is the larger bet:

> **context should be a deliberate, inspectable, provenance-bearing projection of cognition, not the accidental residue of everything we managed to retrieve.**

## Research and development referenced

- Entif AI, [_Prepaying Semantics_](/tags/research/2026/09/12/prepaying-semantics/), ETR-2026-05.
- Entif AI, [Ontological Mixture of Concepts](/tags/rosetta/2026/08/28/ontological-mixture-of-concepts/).
- Entif AI, [Agentic Memory Needs More Than Retrieval](/tags/rosetta/2026/08/28/agentic-memory/).
- Entif AI, [_Meaning That Survives Change_](/tags/research/2026/09/09/rosetta-pasigraphy-protocol/), ETR-2026-04.
- LCM Team et al., [Large Concept Models: Language Modeling in a Sentence Representation Space](https://arxiv.org/abs/2412.08821), 2024.
- Shibo Hao et al., [Training Large Language Models to Reason in a Continuous Latent Space](https://arxiv.org/abs/2412.06769), Coconut, 2024, revised 2026.
- Xuefeng Bai, Yulong Chen, and Yue Zhang, [Graph Pre-training for AMR Parsing and Generation](https://aclanthology.org/2022.acl-long.415/), ACL 2022.
- Valerie Hajdik et al., [Neural Text Generation from Rich Semantic Representations](https://aclanthology.org/N19-1235/), NAACL 2019.
- Model Context Protocol, [The 2026-07-28 Specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/).
