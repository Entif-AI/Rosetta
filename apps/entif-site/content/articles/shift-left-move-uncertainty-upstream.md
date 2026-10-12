---
{
  'id': 'entif.essay.shift-left-move-uncertainty-upstream',
  'slug': 'shift-left-move-uncertainty-upstream',
  'title': 'Shift LEFT: Move Uncertainty Upstream',
  'description': 'How Entif uses governed human-AI review to absorb new evidence early, revise research quickly, and improve experiments before execution.',
  'kind': 'essay',
  'status': 'published',
  'published': '2026-09-12',
  'authors': ['Crates McDade'],
  'tags':
    ['ai-research', 'governance', 'human-ai-collaboration', 'research-process'],
  'projects': ['rosetta', 'bilqis'],
  'routeTag': 'ai-research',
  'related':
    [
      'entif.research.the-cost-of-learning-too-late',
      'entif.research.after-the-inflection',
      'entif.research.prepaying-semantics',
    ],
  'sourceRefs':
    [
      'OpenAI - GPT-6 Astra: A new generation of intelligence - 2026-09-03',
      'OpenAI - Research acceleration: The view inside OpenAI - 2026-09-06',
      'Jakub Pachocki - An Alien Mind - OpenAI - 2026-09-06',
      'entif-ai/rosetta - GitHub issue and publication history - inspected 2026-09-12',
      'entif-ai/bilqis - GitHub issue and repository bootstrap history - inspected 2026-09-12',
    ],
  'featured': true,
}
---

On September 3, as we closed in on a finished draft of ETR-2026-02, [_The Cost of Learning Too Late_](/tags/research/2026/09/06/the-cost-of-learning-too-late/), OpenAI announced <a href="https://openai.com/index/gpt-6-astra/" rel="nofollow noreferrer noopener" target="_blank">GPT-6 Astra</a> and began its phased rollout.

That release changed the context of the paper during final edits. The easy option was to publish and deal with the change later. We reopened the work instead.

Three days later, ETR-2026-03, [_After the Inflection_](/tags/research/2026/09/07/after-the-inflection/), was close to publication-ready. OpenAI published <a href="https://openai.com/index/research-acceleration-view-inside-openai/" rel="nofollow noreferrer noopener" target="_blank"><em>Research acceleration: The view inside OpenAI</em></a> and Jakub Pachocki's <a href="https://openai.com/index/an-alien-mind/" rel="nofollow noreferrer noopener" target="_blank"><em>An Alien Mind</em></a> on September 6. The first described measurable acceleration inside OpenAI's research process. The second discussed the prospect that current progress could continue into recursive self-improvement.

We folded that material into the work in front of us. We also revisited [ETR-2026-02](/tags/research/2026/09/06/the-cost-of-learning-too-late/) because the new evidence touched claims that paper had already made.

This pattern is now normal. A research plan can become stale between final revision and publication. A design assumption can age while implementation is still underway. Feedback can arrive from a domain expert after a specification has already started to harden.

The practical response is to make change cheaper.

## Shift the hard questions left

Software teams use "shift left" to describe moving tests, security checks, and failure discovery earlier in development. We apply the same idea to research and architecture.

A concern found during ideation costs a conversation and a few edits. The same concern found after implementation can require new interfaces, migrations, experiments, or discarded results. A concern found after publication can also create a provenance problem because readers may already rely on the earlier claim.

That changes what speed means. Fast work reduces expensive rework instead of racing to execution.

Our process tries to expose uncertainty while claims, issue boundaries, experimental controls, and architecture choices are still cheap to change. We use human review, AI-assisted ideation, adversarial model review, source checks, and explicit issue decomposition for that purpose.

The output of a review is rarely a verdict. A useful review changes a question, adds a control, narrows a claim, exposes a dependency, or identifies a failure mode. Each material change needs a place in the issue graph.

This is where governance starts to affect research speed. A new objection does not require the team to reconstruct every earlier decision from memory. The issue graph already records scope, dependencies, acceptance criteria, and the work that owns each question.

## Turn criticism into executable work

Our recent work on ETR-2026-05, [_Prepaying Semantics_](/tags/research/2026/09/12/prepaying-semantics/), is a compact example.

The paper asks whether a Bilqis-derived semantic substrate can reduce the cost of learning relational and compositional structure. Before committing serious compute, we asked several independent model families to attack the paper and its experimental plan.

Many criticisms repeated concerns we had already captured. Sequence length, compiler cost, synthetic-world bias, ambiguity, curriculum order, and architecture dependence all had owners. Repetition did not justify new work.

Other criticisms exposed real gaps. We converted those gaps into bounded experiments rather than adding paragraphs of defensive prose.

One review asked whether explicit semantics could destroy useful ambiguity. The roadmap gained a <a href="https://github.com/entif-ai/bilqis/issues/44" rel="nofollow noreferrer noopener" target="_blank">delayed-commitment benchmark</a> that preserves several live interpretations and measures the cost of premature commitment.

Another raised the danger of a deterministic oracle that is consistently wrong. That became a <a href="https://github.com/entif-ai/bilqis/issues/46" rel="nofollow noreferrer noopener" target="_blank">semantic fault-injection and lineage-taint test</a>, including rollback before the first confirmatory trial.

A debate showed that a null result could be almost as easy to over-interpret as a positive one. We added a <a href="https://github.com/entif-ai/bilqis/issues/47" rel="nofollow noreferrer noopener" target="_blank">preregistered autopsy tree</a> that limits the follow-up experiments we permit after a null, reversal, ceiling, or integrity failure.

A later critique asked a harder question. What happens when the ontology lacks a useful variable altogether? That became an <a href="https://github.com/entif-ai/bilqis/issues/50" rel="nofollow noreferrer noopener" target="_blank">open-world schema-extension experiment</a> that separates an unknown value from an unknown variable.

The same critique proposed that some reconstruction difficulty may act as useful regularization. We turned that into a <a href="https://github.com/entif-ai/bilqis/issues/51" rel="nofollow noreferrer noopener" target="_blank">controlled study of clean, noisy, and mixed developmental inputs</a> while holding oracle truth fixed.

The <a href="https://github.com/entif-ai/bilqis/issues" rel="nofollow noreferrer noopener" target="_blank">Bilqis repository now records 48 issues</a>. Their value here is that objections have become testable work with boundaries, dependencies, and stopping rules.

That review cycle happened over a few hours on September 12. The speed came from having a process that could absorb each critique without reopening the entire design.

This changes the role of AI in the process. A model can generate attack surfaces quickly. It can compare a critique against an existing roadmap and draft a precise issue when a real gap exists. It can also reject a suggestion because existing work covers it or the premise lacks support.

Human judgment still decides which questions matter, which claims are acceptable, and which changes enter the program. Model agreement does not create truth. Review only helps when evidence, authority, and decision state remain visible.

We use a related rule inside the <a href="https://github.com/entif-ai/bilqis/issues/5" rel="nofollow noreferrer noopener" target="_blank">Bilqis plan</a>: "LLM proposes. Formal machinery disposes." The same rule works well for research operations. AI can propose. Sources, tests, governance, and human decisions determine what survives.

## Make disagreement productive before merge

We used the same adversarial pattern when we created the <a href="https://github.com/entif-ai/bilqis" rel="nofollow noreferrer noopener" target="_blank">Bilqis repository</a> and migrated its first source tree. The code already existed from the [ETR-2026-05 research phase](/tags/research/2026/09/12/prepaying-semantics/), so the task was an extract-transform-load migration into a new repository.

Two agents, each running a frontier model at its highest available reasoning setting, received the migration brief. Each treated its own branch as the base and built a competing implementation. Their approaches and contents differed enough to create a useful comparison.

Each agent then reviewed the counterpart's pull request for code, structure, tests, or migration choices worth importing. After each round, both reassessed their own branch against the alternative. The loop continued until one agent said it preferred the other pull request over its own. The surviving migration became <a href="https://github.com/entif-ai/bilqis/pull/39" rel="nofollow noreferrer noopener" target="_blank">Bilqis PR #39</a>.

That concession did not certify the surviving branch. It supplied a strong convergence signal. One advocate had incorporated the best material it could find and still preferred the competing implementation.

A human technical lead reviewed the exchanges and code changes throughout the loop. Human review occurred as the branches evolved, rather than after the agents had produced a final candidate. The lead challenged quality and optimization choices, redirected the work when needed, and decided which changes entered the repository.

Continuous participation also helps the human operator learn. The review process creates opportunities to follow new techniques, test personal hypotheses, and notice tradeoffs the models miss. The human stays curious, builds technical depth, and remains the lead throughout the process.

## Governance as working memory

The <a href="https://github.com/entif-ai/rosetta" rel="nofollow noreferrer noopener" target="_blank">Rosetta repository</a> shows the same pattern at a larger scale. <a href="https://github.com/entif-ai/rosetta/issues" rel="nofollow noreferrer noopener" target="_blank">GitHub search returned 845 issue records</a> in the repository on September 12.

That number spans different work states, closed history, gated proposals, research tasks, and implementation issues. Its value here is that decisions have durable addresses.

A well-shaped issue compresses context. It states what must change, why the change exists, what blocks it, how to test completion, and what larger contract it serves. A future contributor does not need the original meeting or chat transcript to recover the basic decision.

That matters when outside research arrives. We contact researchers whose recent papers intersect with Rosetta. Some have replied with detailed comments and possible integration paths.

Their feedback enters the same system. We trace the source, compare the idea against current architecture, identify the semantic owner, and decide whether to update work or create a new experiment. A useful comment should not disappear into an inbox.

The same process protects flexibility. A frozen plan can become a trap when new evidence arrives. With explicit versioning, authority, and change rules, we can revise a plan without rewriting history.

This is why we do not treat governance and agility as opposing goals. Governance is working memory for a project that changes faster than any person can reliably remember.

It also gives AI collaborators better constraints. An agent can inspect the issue graph, find the controlling specification, check dependencies, and see what its authority permits it to change. Better context reduces improvisation and makes review easier.

The alternative is fast local progress with hidden global cost. Teams can generate code, papers, and proposals quickly while accumulating inconsistent assumptions behind them. The bill arrives when those assumptions collide.

## Build for revision

A process built for this pace needs to absorb new evidence without losing its previous reasoning. It needs short review loops, explicit claims, source provenance, bounded issues, and change records that survive the conversation that produced them.

AI makes those loops faster. Continuous human technical review and process keep the speed useful.

We expect more pivots. We cannot predict every surprise, so we design to absorb them cheaply.

Move uncertainty upstream, keep the evidence attached, and make material changes leave a receipt. The earlier a weak assumption becomes visible, the less we pay for it later.
