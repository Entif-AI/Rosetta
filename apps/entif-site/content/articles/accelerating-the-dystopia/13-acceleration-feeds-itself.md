---
{
  'id': 'entif.essay.etr-2026-07.13',
  'slug': '13-acceleration-feeds-itself',
  'title': 'Acceleration Feeds Itself',
  'description': 'Section 13 of Accelerating the Dystopia: Why Artificial Intelligence Cannot Save a System We Refuse to Fix. Acceleration Feeds Itself.',
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
      'https://drive.google.com/file/d/1sVZ59EH8hRnHU9DWm3fWK9trj2B_f2Qr/view?usp=drivesdk',
    ],
  'series': { 'id': 'accelerating-the-dystopia', 'order': 13 },
}
---

There are at least two recursive loops hiding inside the phrase "AI acceleration," and I think we are underestimating both because neither one needs a science-fiction breakthrough before it starts to matter.

The first loop is epistemic.

Models increasingly generate material that future models, humans, institutions, search systems, and datasets will consume.

The second loop is productive.

Models increasingly help build the systems that will become the next generation of models.

Both can compound errors. Both can compound capability. Neither requires consciousness, selfhood, or a machine announcing that it intends to improve itself.

<figure class="story-scene recursion-scene scroll-story" data-scroll-story data-test-id="editorial-scene">
<div class="scene-overline"><span>Explanatory addition</span><span>Conceptual, not predictive</span></div>
<h2>Two loops can meet at deployment without becoming one loop.</h2>
<div class="scroll-story-layout"><div class="scroll-story-visual" data-test-id="scroll-visual" recursion-visual" aria-label="Two conceptual loops: epistemic and economic, joined through deployment"><svg viewBox="0 0 680 410" role="img" aria-labelledby="recursion-title recursion-desc"><title id="recursion-title">Two conceptual forms of recursion</title><desc id="recursion-desc">An epistemic loop concerns research and evaluation. An economic loop concerns adoption, returns, and investment. Deployment links them without showing a growth forecast.</desc><g data-scroll-layer="0" data-test-id="scroll-layer"><path d="M100 135C100 38 300 38 300 135S100 232 100 135Z"/><text x="154" y="111">research</text><text x="152" y="137">and evaluation</text><text x="151" y="163">improve tools</text><text x="143" y="269">epistemic recursion</text></g><g data-scroll-layer="1" data-test-id="scroll-layer"><path d="M381 135C381 38 581 38 581 135S381 232 381 135Z"/><text x="440" y="111">adoption</text><text x="432" y="137">and returns</text><text x="428" y="163">fund capacity</text><text x="419" y="269">economic recursion</text></g><g data-scroll-layer="2" data-test-id="scroll-layer"><path d="M300 136H381"/><rect x="292" y="310" width="98" height="47"/><text x="307" y="340">deployment</text></g><g data-scroll-layer="3" data-test-id="scroll-layer"><path d="M340 183V309"/><text x="83" y="389">Conceptual loops show possible reinforcing mechanisms, not a forecast or machine intention.</text></g></svg></div><div class="scroll-story-steps"><section class="scroll-story-step" data-scroll-step="0" data-test-id="scroll-step"><h3>01 · Epistemic recursion</h3><p>Research, generated material, evaluation, and improved tools can feed later research while still requiring external references.</p></section><section class="scroll-story-step" data-scroll-step="1" data-test-id="scroll-step"><h3>02 · Economic recursion</h3><p>Useful deployment can attract adoption and investment, which can fund more capability and deployment.</p></section><section class="scroll-story-step" data-scroll-step="2" data-test-id="scroll-step"><h3>03 · Deployment connects them</h3><p>Organizations decide whether to use an available capability. That decision can link technical progress and economic pressure.</p></section><section class="scroll-story-step" data-scroll-step="3" data-test-id="scroll-step"><h3>04 · Coordination is not intention</h3><p>Aggregate acceleration can emerge from locally understandable choices without a system desiring its own expansion.</p></section></div></div>
<figcaption>The diagram distinguishes mechanisms discussed in this chapter. It is conceptual and does not depict growth rates, time horizons, or a machine's intention. <a href="etr-source:S174">Recursive training conditions · S174</a> · <a href="etr-source:S176">Task-horizon limits · S176</a></figcaption>
</figure>

Start with the data loop.

The internet was once predominantly a record of human activity. That is changing. Search results, marketing copy, code, documentation, student assignments, customer support, product descriptions, political messaging, images, comments, summaries, and synthetic datasets increasingly contain model-generated material.

If the next generation learns indiscriminately from the previous generation's outputs, the model is no longer sampling only the underlying world. It is sampling a prior model's approximation of the world.

Shumailov and colleagues demonstrated a formal and empirical version of this problem in Nature. Under recursive training on generated data, models can undergo **model collapse**, progressively losing information about the true underlying distribution, with the tails disappearing first. [S174]

The finding is easy to sensationalize. It is also easy to sanitize into meaninglessness.

It does not show that synthetic data is bad.

Synthetic data can be deliberately generated to cover rare cases, test safety boundaries, augment scarce examples, teach formal reasoning, or balance a dataset. The failure appears when generated approximations recursively displace contact with the original distribution without sufficient controls.

That distinction is central to my larger thesis.

The danger is feedback without grounding, because once the approximation begins training the next approximation, yesterday's distortion can become tomorrow's baseline.

A historical social bias enters the corpus.

A model reproduces it in softened or reformulated language.

That output appears across the web.

Later models train on the output.

Organizations use those models to make decisions.

Those decisions change the world and generate new records.

The records return as training data.

At each step, a small asymmetry can become more structurally entrenched even if no individual step looks outrageous.

A similar loop exists in organizational reasoning. A company asks AI to summarize its policies. Employees rely on those summaries. The AI drafts future policies in the style of the old ones. Those policies enter the company's knowledge base. The model later treats its own lineage of generated language as institutional precedent.

The system begins to teach itself what the institution believes.

That is not the strongest version of recursive self-improvement.

It is already recursion.

The productive loop is more dramatic because it affects capability itself.

RE-Bench evaluates AI agents on realistic machine-learning research-engineering tasks and compares them directly with human experts. The best tested agents scored roughly four times the human expert level when both sides received a two-hour total budget. Humans displayed better returns to longer effort, narrowly surpassing the best agents at eight hours and scoring about twice as high at thirty-two hours. [S175]

That result is almost perfectly designed to puncture the lazy versions of both arguments.

AI already has remarkable short-horizon research-engineering ability. Humans still showed important long-horizon advantages in the tested conditions.

METR's task-horizon work measures how long a software task, expressed in expert-human completion time, a frontier agent can complete at a fixed success probability. Its historical measurements show rapid increases in horizon length, though extrapolating that trend into the future remains uncertain. [S176]

Then come the labs themselves.

OpenAI reported in September 2026 that it had reached an internal milestone it describes as an "automated research intern," with coding agents increasingly involved in experiment execution and AI research workflows. [S177] Anthropic has separately reported growing use of AI in AI development, including an internal increase in code output per engineer, and openly discusses the possibility of a future where AI systems participate in designing successors. Anthropic explicitly says full recursive self-improvement has not arrived and is not inevitable. [S178]

Those are first-party reports from the labs doing the work, so I do not treat them as independent proof of an intelligence explosion. I do treat them as evidence that AI-assisted AI development has moved from thought experiment into ordinary engineering practice.

And for my argument, we do not need the intelligence explosion.

Improvements in implementation, testing, and infrastructure can shorten parts of a research cycle. The total gain depends on which stages remain bottlenecks. Evaluation, institutional adaptation, and observation of social effects need not accelerate at the same rate.

That is the governance-latency problem.

Even benevolent acceleration can outrun institutional sense-making. That is the part I keep coming back to: the code can iterate faster than a school system, labor market, court, regulator, family, or culture can discover what the last iteration actually did.

Now place the result back inside the systems from the first half of this essay.

A corporation already has incentives to adopt a tool that reduces labor cost.

A political campaign already has incentives to adopt a tool that improves persuasion.

A financial firm already has incentives to adopt a tool that improves forecasting.

An intelligence agency already has incentives to adopt a tool that improves analysis.

A platform already has incentives to adopt a tool that improves engagement.

A military already has incentives to adopt a tool that improves operational speed.

If each actor expects competitors to accelerate first, restraint becomes individually costly even when everyone would prefer a world in which the race moved more carefully.

That is another recursion: competition accelerates adoption; adoption increases the value of AI R&D; AI R&D accelerates capability; capability increases competitive pressure to adopt.

The machine does not need to decide to accelerate itself.

We can do it for the machine.

<figure class="story-scene interruption-scene" data-test-id="editorial-scene">
<div class="scene-overline"><span>Explanatory addition</span><span>Inspect an interruption point</span></div>
<h2>A pause in one link does not settle the whole system.</h2>
<div class="interruption-path"><span>research assistance</span><b>→</b><span>deployment choice</span><b>→</b><span>adoption and returns</span><b>→</b><span>capacity for the next round</span></div>
<details><summary data-test-id="interruption-deployment">At deployment: require evidence, authorization, and a way to revise.</summary><p>This can slow or redirect one deployment decision and preserve a record of why it was made. It cannot by itself create shared incentives, make consequences immediately observable, or decide every contested objective.</p></details>
<details><summary data-test-id="interruption-reference">At evaluation: retain an external reference.</summary><p>Independent tests, held-out tasks, and observation can reveal some feedback failures. Their scope is local to the claim and conditions tested; they do not certify every later use.</p></details>
<figcaption>These are conceptual interruption points, not a prediction that any one control halts acceleration. The chapter's argument keeps technical, institutional, and distributional questions distinct.</figcaption>
</figure>

## There is more than one way to accelerate research

The phrase recursive self-improvement compresses several very different capabilities. An assistant that writes an experiment script is not doing the same job as a system that chooses the next research program. A system that proposes a promising idea is not doing the same job as one that establishes why the idea worked. A lab that uses AI throughout its workflow is not necessarily a lab that has transferred control of the workflow to AI.

These distinctions do not diminish the progress. They locate it.

At the first level, a system helps a person perform a defined task. At the next, it executes a sequence of tasks with tools and checks. At another, it chooses among experiments under a stated goal. Farther along, it helps set the goal, evaluate the results, revise the method, and decide which changes belong in a successor system. The boundaries can overlap, but each expansion adds decisions that were previously supplied by people.

That is why a single benchmark score cannot establish the whole sequence. An evaluation might test implementation, search, debugging, or optimization within a prepared environment. A real research program must also decide which question deserves effort, whether the test captures the intended property, and whether a result survives changes in assumptions. Faster execution is valuable even when those decisions remain human responsibilities.

RE-Bench makes the role of the time budget unusually clear. In its 2025 comparison, the relative advantage changed as participants received more time. The short-budget result is evidence of strong performance in the tested research-engineering environments. The longer-budget result shows why it cannot be read as a universal ranking of scientific ability. Both belong in the account. [S175]

METR's time horizon is also easy to misread. It is expressed in the time a human expert would take to complete a task at a specified success probability, not the uninterrupted duration for which an agent can safely run. The suite emphasizes relatively well-specified software, machine-learning, and cybersecurity work. The organization explicitly distinguishes those tasks from whole jobs and warns about unreliable estimates at the upper end of its current suite. [S176]

The useful inference is not that a line on a chart proves the date of complete automation. It is that more difficult units of work are becoming accessible to agents under some conditions. Organizations can change how they divide labor well before every task is automated. A capability need not be universal to be commercially important.

## The bottleneck moves

A simple thought experiment shows why speed gains do not translate mechanically into scientific progress. Suppose implementing an idea takes one day, running the experiment takes ten days, and interpreting it takes another day. Cutting implementation time in half does not double the number of completed experiments. The long run still dominates the schedule.

Now suppose the assistant also helps design a cheaper test that preserves the relevant evidence. That change could matter much more. Or suppose it generates ten times as many plausible ideas without improving the ability to evaluate them. The bottleneck shifts toward selection. More proposals can produce more discovery, more noise, or both.

These are illustrative schedules, not measurements from a laboratory. Their purpose is to show why the denominator matters. Code output, model calls, experiment launches, completed experiments, reproducible findings, and useful deployed improvements measure different things. A gain in one does not guarantee the same gain in the next.

The labs' own accounts acknowledge parts of this distinction. OpenAI's September 2026 report describes an internal research-assistance milestone while retaining human roles in prioritization, judgment, and decisions about larger runs and deployment. Anthropic reports growing use of AI in development but does not claim that full recursive self-improvement has been achieved. These are first-party accounts of internal workflows, not independent audits of the entire research process. [S177] [S178]

The economic consequence can arrive before the strongest technical interpretation. A lab may conduct more useful trials per researcher even while people choose the questions. It may reduce the cost of maintaining infrastructure, finding bugs, or preparing data. A firm with enough compute to exploit the extra throughput may benefit more than one whose main constraint is access to hardware or funds.

This is where acceleration reconnects to distribution. An improvement in research productivity does not distribute the resulting capability evenly by magic. The returns depend on who can use the tool, who can afford the experiments it enables, who controls the compute and data around it, and who owns the resulting assets. A cheaper idea is not the same thing as a cheaper production-scale test.

Nor does the existence of open research erase that distinction. Publicly shared methods can reduce barriers and spread knowledge. Their practical use can still require engineering skill, data, hardware, time, and access to complementary systems. A method being available to everyone does not mean everyone has the same ability to turn it into a working service.

The reverse possibility matters as well. A tool that makes implementation easier can help small teams attempt work they could not previously afford. That is part of the attraction for people building outside large institutions, including me. The same technology can lower one barrier while raising the value of another. Whether the result broadens participation is an empirical question about the whole process, not an answer contained in the release announcement.

## Feedback needs an external reference

The data loop and the research loop can interact. A model helps create evaluation data. Another model is trained against that data. A third summarizes the results. The summary becomes the basis for deciding that the next model is better. This can be a productive workflow when the links are tested. It can also create a closed circle in which the system becomes better at satisfying its own descriptions of success.

Model collapse is one studied failure of recursive data generation under particular conditions. It is not a theorem that all synthetic data degrades models. The broader lesson I draw is about maintaining contact with a source of correction that is not merely another version of the same approximation. [S174]

In research, that correction might be a held-out task, a physical measurement, a proof checked independently, a new population, or a result reproduced with a different method. Which reference is appropriate depends on the claim. The common requirement is that the test can reveal a failure the generating process did not already know how to avoid.

An evaluation can become less informative if it is repeatedly used as both a target and a certificate. An organization may then optimize the visible score while the relationship between the score and the desired capability weakens. That is the same problem we encountered with customer-service metrics and corporate rankings, now inside the machinery used to improve the machines.

The danger is not limited to deliberate gaming. Researchers can sincerely follow the available signal. If the signal is narrow, sincere optimization can still concentrate effort on a narrow form of success. That is the same institutional pattern I have been describing throughout this essay, except now the optimizer is helping us optimize the optimizer.

This does not mean every benchmark is worthless. It means that benchmarks are instruments with scopes. They reveal some differences under some conditions. Their value increases when the conditions and the important omissions remain visible. Treating a benchmark as an instrument leaves room to improve it. Treating it as an oracle makes its blind spots harder to discuss.

## The time needed to know what happened

The mismatch between technical and institutional speed is not simply that one side is smart and the other is slow. Different activities require different forms of evidence.

A software test can finish in seconds. Learning whether a change altered working conditions may require observing a workplace over time. A system can update its recommendations overnight. Establishing whether those recommendations changed access to opportunity may require data from people who never received an offer. An organization can issue a new policy immediately. Understanding how it behaves in difficult cases takes cases.

Some of that delay is avoidable friction. Some is the time required for consequences to exist. We cannot observe a year's cumulative effect before a year has passed merely by generating a more eloquent forecast. AI can help gather evidence and analyze it. It cannot turn every delayed outcome into an already observed fact.

This creates a specific form of risk when deployment cycles become shorter than evaluation cycles. Several versions may be in use before the effects of the first are understood. The population may have adapted to one version while another is being measured. Changes in the surrounding market can make attribution harder. A confident narrative about the latest improvement can then outrun evidence about the earlier one.

The issue is not a general argument against change. Delay also has costs: a useful tool not deployed can leave people without help. The relevant comparison includes both sides and names the uncertainties. What matters for this essay is that faster capability does not automatically supply faster knowledge of its social consequences.

That gap can favor actors whose benefits are immediate and measurable over people whose costs are delayed or dispersed. A firm can see lower processing expense now. A household may discover the cost of a mistaken record only when it later needs credit, employment, or service. The gain enters one organization's report. The loss may surface elsewhere, after the original decision has become hard to reconstruct.

Acceleration therefore changes more than the number of tasks completed. It changes who can adjust first, whose evidence arrives in time, and which consequences are visible when the next decision is made.

## Improvement can be appropriated before it is shared

The most important recursive loop may never look like a machine sitting alone and rewriting its own source code. It may look completely ordinary: a business uses better AI to earn more revenue, spends some of that revenue on more compute, data, distribution, and talent, then uses the new capability to strengthen the position that financed the next round.

That loop is not destiny. Competitors can offer alternatives, customers can switch, methods can diffuse, costs can fall, and incumbents can still make spectacularly stupid decisions. None of that makes the compounding mechanism disappear.

Its strength depends on complementarities. If the benefit of a model rises sharply with proprietary data, integrated distribution, or access to scarce compute, an already well-positioned actor may gain more from the same technical advance. If the model makes those complements less necessary, the advance may instead broaden entry. The direction cannot be read from the capability score alone.

This is the bridge between the first and second halves of the essay. The corporate structures, ownership patterns, information channels, and accounting conventions do not disappear when research becomes faster. They determine where the gains go and what those gains finance next.

The machine does not need to desire its own expansion. People and organizations can repeatedly choose to expand it because each local choice appears useful. The aggregate pace can then become difficult for any one participant to alter. That is a coordination problem built from ordinary incentives, not evidence of a hidden machine will.

A future with much more capable AI can therefore emerge through a long sequence of perfectly understandable decisions. That is exactly why I find it more worrying than a single dramatic moment. The machine does not need to seize the accelerator. We can keep pressing it ourselves, one rational local decision at a time, while the systems already holding the most resources become better at doing what they were already built to do.
