# ETR editorial treatments

Status: experience implementation in progress. Existing articles are the foundation.
No broad browser/a11y/HTML/performance audits until every chapter treatment is finished.
Use direct visual inspection while authoring. Preserve source prose and distinguish
measured findings, conceptual diagrams, hypotheticals, and personal evidence.

## Chapter 1 — the obedient optimizer

1. After “What if it works?”: a full-width original machine schematic connects an
   institutional objective, capable optimization, and consequences. The visual question
   is who chooses the destination, rather than whether the machine rebels.
2. At the economic-substrate paragraph: separate, registry-linked measures for labor
   share, wealth concentration, and median income. Never combine unlike denominators.
3. After the customer-service hypothetical: native radio controls compare ticket closure
   with actual repair. Preserve the distinction between an institutional metric and a
   person's problem. Explicitly illustrative, no invented performance statistics.
4. After the three productivity outcomes: the same task takes half the time; native
   controls change who receives the gain. Three concrete arrangements, no probabilities.
5. At the personal recollection: an annotated typographic time ledger, explicitly
   personal testimony, never represented as an industry measurement.

## Remaining chapter-specific directions

2. An annotated offer makes material information visible but difficult to use; reader
   switches institutional and human frames without claiming every euphemism is false.
3. An original market-map diagram exposes how changing category boundaries changes
   apparent position. No invented vendor data or allegations.
4. A chain of ordinary roles accumulates consequences without a villain node; connect
   local metrics and distributed responsibility, without fictitious network weights.
5. Accounting layers distinguish revenue, costs and residual claims; a separate
   distribution diagram follows the productivity gain. Use only supplied quantities.
6. A bill/renewal anatomy and a reversible assistant comparison make friction and
   agency concrete. Label all reconstructed interfaces and personal recollections.
7. Parallel Treasury/Federal Reserve balance-sheet paths expose differences and shared
   transmission channels. Do not collapse their legal authority or goals.
8. A filing-to-outcome evidence trail preserves missing links: payment/contact is not
   proof of causation. Visually separate the mechanisms of influence.
9. One experienced burden, several causal pathways, one compressed story. Let the reader
   see which distinctions compression removes, without faction-targeting imagery.
10. Retrieval, attention, interpretation and delegated action become an infrastructure
    cross-section; a portability view shows the cost of leaving the relationship.
11. Historical records, labels, proxies and objectives enter through different channels.
    A mitigation lens shows what one intervention changes and what remains.
12. Machine-native representation and human explanation occupy different layers; an
    agent relay exposes local versus global visibility. Entirely conceptual geometry.
13. Epistemic and economic recursion remain two distinct loops, visually connected
    through deployment without anthropomorphizing machine intent.
14. Technical success and the human bargain are parallel ledgers. Conditional scenario,
    not a forecast; the calmness of the machine is the point.
15. Three failure pathways retain their different mechanisms and evidence status.
    No severity scores, probability claims, or threat leaderboard.
16. Reprise the institutional choices as a destination diagram. A closing composition
    returns agency to ownership, bargaining, recourse and governance without rewriting
    the author's conclusion into a stronger manifesto.
17. An inspectable reference ledger with source-role navigation; preserve one dataset
    and direct fragments. Exploration is optional, not a prerequisite to access.

## Implementation ownership

Authored semantic HTML scenes live directly in chapter Markdown so Astro owns content
compilation and cache invalidation. A source-link placeholder resolves captions through
the same registry at build time. Chapter styles remain separate under
`src/styles/editorial/chapters/`. Reuse interaction patterns where they fit, while
composing each chapter around its actual argument. No new client framework or dependency.

## Scroll-driven treatment contract (September 18)

Keep the user's completed heading/navigation styling. Replace static, sparse color slabs
with diagrams that develop alongside substantial reading passages. Use an open canvas,
fine rules, annotations, and occasional paper/document surfaces. Color is not the story.

Shared markup: `figure.story-scene.scroll-story[data-scroll-story]` contains a heading,
`div.scroll-story-layout`, and a caption. Inside the layout, a
`div.scroll-story-visual` stays alongside `div.scroll-story-steps`. The latter contains
`section.scroll-story-step[data-scroll-step="0"]`, then 1, 2, etc., each with a short
heading and meaningful explanatory prose. The visual's corresponding groups use
`data-scroll-layer="0"`, etc. All content exists in static HTML. An IntersectionObserver
sets `data-scroll-state="past|active|future"` on steps and layers; it never hides content.
`data-parallax="back|front"` is optional for purely graphical SVG groups. CSS view
timelines supply restrained depth, with static reduced-motion and print fallbacks.

Every scene has `data-test-id="editorial-scene"`; steps and visual layers use
`data-test-id="scroll-step"` and `data-test-id="scroll-layer"`. Native details/radios
add reader agency where a real comparison exists; give their controls data-test-id.
Sources in raw HTML use `href="etr-source:S###"`. Preserve manuscript paragraphs,
their order, caveats and citations; scenes are labeled explanatory additions.

Parent owns shared scroll script/styles/layout, chapters 1–7, references, and QA.
Bounded builders own only their assigned chapter Markdown and chapter CSS. No global
CSS changes, source acquisition, dependency changes, tests, audits, commits, or pushes
by builders. Visual authoring checks only until all chapter work is complete.
