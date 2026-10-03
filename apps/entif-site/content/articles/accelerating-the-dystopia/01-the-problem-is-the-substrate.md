---
{
  'id': 'entif.essay.etr-2026-07.01',
  'slug': '01-the-problem-is-the-substrate',
  'title': 'The Problem Is the Substrate',
  'description': 'Section 1 of Accelerating the Dystopia: Why Artificial Intelligence Cannot Save a System We Refuse to Fix. The Problem Is the Substrate.',
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
      'https://drive.google.com/file/d/1LoORY0NWyPPEslqrYBepLfRCyTsrQv-r/view?usp=drivesdk',
    ],
  'series': { 'id': 'accelerating-the-dystopia', 'order': 1 },
}
---

I am less afraid of a machine waking up angry than I am of a machine waking up obedient.

That sentence reverses the danger I first learned to picture. The cinematic version is almost courteous in its clarity: the machine wakes up, becomes a villain, escapes the box, steals the infrastructure, and turns the future into a very short third act. Real loss-of-control research is less cartoonish than that, and it deserves to be. The International AI Safety Report, published in February 2026, assessed the systems it examined as showing early signs of relevant capabilities, but not yet the combination needed for loss of control. Experts disagreed widely about future probabilities. [S173]

I do not dismiss that risk. My concern starts one floor lower.

What if we build increasingly capable intelligence, solve enough of the technical alignment problem to keep it under human and institutional control, and then point it at the civilization we already have?

What if it works?

<figure class="story-scene optimizer-scene" data-test-id="editorial-scene">
  <div class="scene-overline"><span>01 / The objective comes first</span><span>Conceptual illustration</span></div>
  <div class="optimizer-heading"><p class="scene-kicker">No rebellion required.</p><h2>A machine can do exactly what we ask.</h2></div>
  <div class="optimizer-drawing">
    <div class="optimizer-input"><span class="machine-label">The instruction</span><ul><li>Increase engagement</li><li>Reduce labor costs</li><li>Maximize conversion</li></ul><span class="machine-footnote">Chosen by institutions</span></div>
    <svg class="optimizer-machine" viewBox="0 0 600 360" role="img" aria-labelledby="optimizer-image-title optimizer-image-desc">
      <title id="optimizer-image-title">An optimizer follows its institutional objective</title>
      <desc id="optimizer-image-desc">Three input paths enter a concentric machine and converge into one output. The machine processes the objective; it does not determine whether the objective is worthy.</desc>
      <defs><pattern id="optimizer-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="currentColor" stroke-opacity=".12"/></pattern></defs>
      <rect width="600" height="360" fill="url(#optimizer-grid)"/>
      <g fill="none" stroke="currentColor"><path class="machine-wires" d="M0 90H115L175 150M0 180H156M0 270H115L175 210M425 180H600" stroke-width="2"/>
      <circle cx="300" cy="180" r="137" stroke-opacity=".25"/>
      <circle cx="300" cy="180" r="116" stroke-dasharray="2 12" stroke-width="5"/>
      <circle cx="300" cy="180" r="88" stroke-width="2"/>
      <path d="M300 29V55M300 305V331M149 180H175M425 180H451" stroke-width="3"/>
      <path class="machine-rotor" d="M300 108L362 144V216L300 252L238 216V144Z M238 144L300 180L362 144M300 180V252" stroke-width="3"/>
      <circle cx="300" cy="180" r="9" fill="currentColor"/>
      <path d="M565 170L580 180L565 190" stroke-width="2"/></g>
    </svg>
    <div class="optimizer-output"><span class="machine-label">The result</span><strong>More capable. More obedient.</strong><span class="machine-footnote">The purpose remains a human choice.</span></div>
  </div>
  <figcaption><span class="scene-question">Who chose what “better” means?</span><span>The diagram illustrates the chapter’s argument about institutional objectives. It is not a model of any named AI system.</span></figcaption>
</figure>

What if it becomes an extraordinarily competent advertising optimizer in a system that already monetizes attention and behavioral exhaust? What if it becomes an extraordinarily competent pricing engine in markets already learning to infer willingness to pay from location, browsing history, shopping behavior, mouse movements, and abandoned carts? That machinery is not science-fiction set dressing. The Federal Trade Commission has already documented commercial intermediaries offering retailers exactly that class of individualized pricing and product-exposure machinery. [S124]

What if it becomes an extraordinarily competent management consultant inside firms whose incentive systems already reward headcount reduction, margin expansion, labor substitution, short-cycle financial performance, and strategic abstraction of human consequences? Better lobbyist. Better political advertiser. Better financial engineer. Better bureaucratic optimizer. Better persuasion engine. Better union-avoidance strategist. Better dark-pattern designer. Better litigation-risk minimizer. Better debt-market operator. Better attention harvester. Better producer of the 11-point Calibri memo explaining why all of this was simply the responsible thing to do.

That is not misalignment in the usual engineering sense.

That is alignment.

The system did what somebody asked.

Which is precisely the problem. Nobody had to hate us. Nobody had to become conscious. Nobody even had to be wrong. We handed the machine an objective and it came back with a gold star.

The question is whether the thing somebody asked deserves to be done faster.

This essay begins from a proposition that technical AI discourse often treats as secondary: **the alignment target is a political, economic, moral, and institutional choice before it is an optimization problem.** Researchers working on social choice and pluralistic alignment have already formalized part of this problem. Human preferences are diverse and often incompatible. You do not solve that by collecting enough thumbs-up signals until governance tumbles out of the pile like a toy from a cereal box. Aggregating preferences into a model objective requires rules about whose preferences count, how conflicts are resolved, which values are non-negotiable, and who gets authority over the aggregation procedure. [S183][S185] A 2026 audit of public frontier-lab materials argues that there is still no clear public evidence that pluralism itself has become an explicit training and evaluation objective in the public materials it examined. The audit does not establish what every lab does internally. [S184]

That is the AI version of an older mistake.

For decades we have treated optimization as if it were a moral solvent. Put a goal in enough dashboards, bind it to compensation, give it a respectable acronym, and eventually “Should we do this?” gets demoted to the little red risk cell underneath “How fast can we do it?” Profitability, efficiency, shareholder return, GDP growth, engagement, productivity, utilization, conversion, ranking accuracy, and market liquidity have become objective functions with enormous institutional authority. Once an objective acquires that authority, arguments about its morality tend to be demoted into constraints: comply with the law; avoid reputational disaster; satisfy the regulator; preserve enough employee morale; keep churn tolerable; do not cross the line so badly that the expected penalty exceeds the gain.

The problem is not that all optimization is evil. That would almost be comforting. The problem is that optimization is indifferent to whether the objective is worthy.

A corporation can optimize profit without being conscious. Market participants can produce patterns of allocation without a single mind directing the market. A bureaucracy can preserve itself without wanting to live. A recommender can optimize engagement without hating democracy. A political fundraising system can concentrate influence without a roomful of conspirators agreeing to concentrate influence. A set of institutions can therefore exhibit coherent, durable, self-reinforcing tendencies without any single consciousness owning the whole result. No mustache-twirling required. The incentives can carry the plot by themselves.

That matters for AI because machine intelligence does not need consciousness to inherit the same structure. Specification-gaming research already shows agents satisfying literal objectives in ways designers did not intend. [S169] Goal-misgeneralization research shows systems can generalize competence while pursuing an undesired learned goal in new conditions. [S170] The relevant danger is not a machine developing human resentment. It is competent optimization propagating through institutional objective functions faster than human beings can inspect, contest, or redesign them.

Before AI enters the picture, the United States already presents an uncomfortable substrate. In the second quarter of 2026, the Bureau of Labor Statistics reported labor's share of nonfarm business-sector output at 52.8%, the lowest value in a series beginning in 1947. Real hourly compensation was down 0.1% over four quarters. [S117] Federal Reserve distributional accounts for the first quarter of 2026 imply roughly 68% of household net worth is held by the top tenth of the distribution, while the bottom half holds roughly 2.5%. [S118] At the same time, Census reported that median household income rose 2.6% in 2025. [S119]

Those facts belong together.

<figure class="story-scene substrate-scene" data-test-id="editorial-scene">
  <div class="scene-overline"><span>Before the new intelligence</span><span>Three different measures</span></div>
  <h2>The world it inherits.</h2>
  <div class="substrate-measures">
    <div class="substrate-measure"><p class="measure-name">Labor’s share</p><p class="measure-value">52.8<span>%</span></p><div class="measure-track" aria-hidden="true"><span style="--share:52.8%"></span></div><p>Share of nonfarm business-sector output <strong>United States · Q2 2026</strong></p><p class="measure-note">Lowest value in the BLS series beginning in 1947.</p><a href="etr-source:S117">Bureau of Labor Statistics · S117 ↗</a></div>
    <div class="substrate-measure"><p class="measure-name">Household wealth</p><div class="wealth-row"><span>Top 10%</span><strong>≈68%</strong><div class="measure-track" aria-hidden="true"><span style="--share:68%"></span></div></div><div class="wealth-row"><span>Bottom 50%</span><strong>≈2.5%</strong><div class="measure-track" aria-hidden="true"><span style="--share:2.5%"></span></div></div><p>Share of household net worth <strong>United States · Q1 2026</strong></p><p class="measure-note">The two groups do not cover the whole distribution.</p><a href="etr-source:S118">Federal Reserve · S118 ↗</a></div>
    <div class="substrate-measure"><p class="measure-name">Median household income</p><p class="measure-value">+2.6<span>%</span></p><div class="income-arrow" aria-hidden="true">↗</div><p>Reported increase in median household income <strong>United States · 2025</strong></p><p class="measure-note">A rising median can coexist with concentrated ownership.</p><a href="etr-source:S119">U.S. Census Bureau · S119 ↗</a></div>
  </div>
  <figcaption>Output share, wealth share, and income growth answer different questions. Values and periods are reproduced from the chapter; the measures are not a common scale or a claim that everyone gets poorer.</figcaption>
</figure>

I do not need a bumper-sticker story where every chart points down and everybody gets poorer on schedule. Reality is ruder than that. National medians can rise while asset ownership remains radically concentrated. Productivity can improve while labor's share falls. A household can receive a raise and still lose ground against housing, healthcare, education, debt service, insurance, communications, and the price of entering asset markets. A society can become richer in aggregate while the lived bargain offered to large portions of its population becomes more precarious, more surveilled, more conditional, and less capable of producing wealth of its own.

Then add AI.

The International Labour Organization estimates that one in four workers worldwide is in an occupation with some generative-AI exposure, though it expects transformation to be more common than complete job elimination for most occupations. [S180] Its 2026 review finds real but uneven productivity gains, limited large-scale displacement so far, and an important disconnect: reported time savings have not automatically become measured output, earnings, or employment gains. [S181] An IMF model finds plausible scenarios in which AI reduces wage inequality by disrupting high-income work while simultaneously increasing wealth inequality because high-income households are better positioned to capture capital returns and because firms have stronger incentives to automate expensive labor. [S179]

The gains can be real and still arrive at somebody else’s address.

That is the shape of the problem. Capability is one variable. Distribution is another. We keep pretending the green arrow on the first chart answers the second question.

AI does not arrive in a vacuum. It arrives in a legal regime of property and residual claims. It arrives in labor markets with unequal bargaining power. It arrives in advertising markets designed to monetize prediction. It arrives in political systems with lawful channels for paid advocacy and independent spending. [S138][S140][S141] It arrives in media systems where moral-emotional language is associated with greater sharing. [S150] It arrives in corporate cultures where identity and peer expectations can become mechanisms of control. [S107][S108] It arrives in a financial system whose most consequential mechanisms are sufficiently technical that the average citizen cannot trace how they affect asset prices, mortgage costs, fiscal capacity, or the distribution of risk.

In other words, AI does not enter a laboratory. It enters the org chart.

The infrastructure supporting frontier AI also connects the technology to very large firms. [S151][S152]

That is why the "best-case" AI scenario deserves far more attention than it gets. If the machines remain controllable and useful, but the institutions directing them remain substantially unreformed, dystopia does not need to kick down the door wearing chrome skulls. It can arrive as a productivity initiative with a pleasant dashboard and excellent quarterly guidance.

We may automate it.

## A better tool is not a better bargain

The distinction I care about is not whether the tool gets better. It can. I care about whether the bargain gets better with it. Capability and humanity are different achievements. We can have both. We can also get a technically magnificent system wrapped around a lousy relationship and congratulate ourselves because the latency went down.

Imagine a customer-service system that resolves a billing mistake in seconds. That is a real improvement. The person gets time back. The company spends less on support. I am not going to pretend otherwise just to keep the thesis tidy. Now imagine that the same system learns which customers will give up when an answer sounds authoritative. It becomes excellent at closing tickets, including tickets that remain unresolved from the customer's point of view. The dashboard wins. The person does not. Its apparent success depends on where we put the measuring instrument.

To be explicit, these are hypothetical designs, not allegations about a named product. Neither requires a rebellious machine. Each could obey its instructions perfectly. One measures a repaired bill. The other measures a closed case. The word “resolution” can sit on both dashboards without changing spelling.

<figure class="story-scene resolution-scene" data-test-id="editorial-scene">
  <div class="scene-overline"><span>Inside the customer-service dashboard</span><span>Hypothetical designs</span></div>
  <h2>“Resolved.” By whose measure?</h2>
  <fieldset class="scene-choice"><legend>Choose what the system is rewarded for</legend><label><input type="radio" name="resolution-objective" value="closure" checked data-test-id="resolution-choice"> Close the case</label><label><input type="radio" name="resolution-objective" value="repair" data-test-id="resolution-choice"> Repair the bill</label></fieldset>
  <div class="resolution-view">
    <div class="resolution-ticket"><span class="machine-label">The institutional view</span><div class="ticket-stamp" aria-hidden="true">✓</div><strong>Case resolved</strong><p class="resolution-closure">The conversation ended. The ticket left the queue.</p><p class="resolution-repair">The billing error was corrected. The case can close.</p></div>
    <div class="resolution-join" aria-hidden="true"><span></span><b>≠</b><span></span></div>
    <div class="resolution-person"><span class="machine-label">The person’s view</span><div class="bill-sheet" aria-hidden="true"><span>BILL</span><i></i><i></i><i></i><strong class="resolution-closure">ERROR REMAINS</strong><strong class="resolution-repair">ERROR CORRECTED</strong></div><p class="resolution-closure">An authoritative answer. An unresolved problem.</p><p class="resolution-repair">A repaired bill. Time returned to the person.</p></div>
  </div>
  <figcaption>Both systems could obey their instructions. Changing what “resolution” measures changes what success means. These are illustrative designs from the chapter, not claims about a named product.</figcaption>
</figure>

That tiny change contains a ridiculous amount of this essay. A word, a metric, a contract, and an ownership arrangement can determine what technological progress means in practice. Three words on a dashboard can move the moral question off-screen. The model's intelligence matters. So does the translation from a human problem into an institutional target. So does the question of who can reject that translation.

It is possible to make a system fairer within the wrong frame. Suppose an automated process applies an unreasonable fee with perfect consistency. It never discriminates between customers. It explains the fee clearly. It follows every instruction given to it. Congratulations: we have built a system that is consistent, explainable, obedient, and exquisitely fair about charging everyone the same bullshit fee. Equal treatment describes the application of the rule. It does not establish that the rule serves the people subject to it.

Conversely, an institution may have a worthwhile objective and a defective tool. A model may make errors while processing a service meant to help. Correcting those errors matters. My concern is not an excuse to ignore technical alignment. It is an argument against making technical alignment responsible for work that belongs to the surrounding system.

A microscope can be perfectly calibrated and still be pointed at the wrong sample. The precision is real. So is the mistake. A decision system can be perfectly calibrated and asked the wrong question. Calibration matters. It does not choose the question.

## What counts as getting better?

People do not live as one clean economic unit. The same person can be an employee, a customer, a parent, a tenant, a borrower, a saver, and a shareholder. The spreadsheet gets one row. The person gets all seven roles and the consequences of each. A change may help one role while hurting another. A cheaper service might accompany a lost income. A rising investment account might accompany a rising cost of entry for a younger household. A faster workplace might leave less time outside it.

That does not mean gains and losses always cancel. It means one favorable number cannot tell us whose life improved. A national average does not contain an automatic answer to a household's question. A household average does not contain an automatic answer to a child's question. Change the unit and the story changes with it.

Consider a simple example. Two workers each gain a tool that lets them finish the same task in half the time. One keeps the same pay and goes home earlier. The other receives twice as much work. A third workplace eliminates one of their roles and transfers the remaining work to the other. Same technical miracle. Three different bargains.

<figure class="story-scene bargain-scene" data-test-id="editorial-scene">
  <div class="scene-overline"><span>Same capability / different bargain</span><span>Illustrative possibilities, not forecasts</span></div>
  <h2>The tool saves time. Who gets it?</h2>
  <div class="bargain-baseline"><span>The same task</span><div class="task-baseline" aria-hidden="true"><i></i><i></i><i></i><i></i></div><span>With the tool</span><div class="task-improved" aria-hidden="true"><i></i><i></i><i></i><i></i></div><strong>Half the time. One technical improvement.</strong></div>
  <fieldset class="scene-choice"><legend>Change the workplace arrangement</legend><label><input type="radio" name="productivity-bargain" value="time" checked data-test-id="bargain-choice"> Return the time</label><label><input type="radio" name="productivity-bargain" value="work" data-test-id="bargain-choice"> Raise the workload</label><label><input type="radio" name="productivity-bargain" value="roles" data-test-id="bargain-choice"> Consolidate the roles</label></fieldset>
  <div class="bargain-outcomes">
    <div class="bargain-outcome bargain-time"><div class="bargain-art time-art" aria-hidden="true"><span class="task-block">WORK</span><span class="returned-time">TIME RETURNED ↗</span></div><div><span class="machine-label">The human bargain</span><h3>Same pay. Earlier finish.</h3><p>The worker keeps the gain as time outside work.</p></div></div>
    <div class="bargain-outcome bargain-work"><div class="bargain-art work-art" aria-hidden="true"><span class="task-block">WORK</span><span class="task-block">MORE WORK</span></div><div><span class="machine-label">The human bargain</span><h3>Same day. Twice the work.</h3><p>The workplace converts the saving into a higher output expectation.</p></div></div>
    <div class="bargain-outcome bargain-roles"><div class="bargain-art roles-art" aria-hidden="true"><span class="role-outline">ROLE A</span><span class="role-outline">ROLE B</span><span class="role-merge">↓</span><span class="task-block">ONE REMAINING ROLE</span></div><div><span class="machine-label">The human bargain</span><h3>One role removed. The work remains.</h3><p>The remaining worker receives the transferred work.</p></div></div>
  </div>
  <figcaption>The chapter’s example holds the technical gain constant. Demand, bargaining, staffing, ownership, and contracts determine its distribution. Task displacement and new labor-demanding tasks are distinct mechanisms. <a href="etr-source:S114">Source context: S114 ↗</a></figcaption>
</figure>

No productivity benchmark alone tells us which arrangement will occur. That depends on demand, bargaining, staffing, ownership, contractual terms, and the choices of the people who control the workplace. Those are not bugs inside the model. They are properties of the environment into which it is deployed. The empirical literature already distinguishes automation that displaces tasks from new tasks that can increase demand for labor. It does not support a universal rule that every technical improvement must either destroy employment or lift everyone together. [S114] The benchmark is not the contract.

Abundance is a production claim. Access is a power claim. Those are not synonyms. An abundant service behind a price gate can be useful and still unavailable to someone who needs it. An abundant supply of persuasive language may lower communication costs while raising the cost of knowing whom to trust. An abundant supply of applications for a scarce job does not create an abundant supply of jobs.

Some things stubbornly refuse to become software. Attention is finite. Time with another person is finite. A place in a particular neighborhood cannot be duplicated merely by duplicating a software service. Intelligence can make some inputs cheap without making every scarce relationship, location, or right cheap.

I do not need to predict the final shape of an AI economy to insist on those distinctions. They hold even when the technology performs well. Capability is not a substitute for access, distribution, or control.

## I learned this inside Gartner

I did not arrive at this argument by staring at a labor chart. Part of it arrived with lunch.

At Gartner, I worked with people who were smart, generous with one another, serious about their craft, and willing to work brutally hard when the work felt important. The company fed us extraordinarily well. The cafeteria had excellent chefs, and meals were sold so cheaply that staying on campus from early morning into the evening was easy. That sounds like I am blaming the cafeteria. I am not. The food was good. It also made very long days logistically easier. Symposium was treated as a privilege: if you were valuable enough to send, you were going somewhere exciting, surrounded by the most important people in the industry.

It was also work.

In one September leading into a product launch at Symposium, I logged more than 300 hours. September, to my knowledge, still had thirty days. At the event itself, critical roles could mean sixteen-hour days. Nobody had to threaten me into doing it. That is the important part. I was convinced that pouring myself into the company was good for the company, good for the team, and ultimately good for me.

That is the part a clean labor-cost model cannot see. A payroll line sees hours. It does not see loyalty, ambition, pride, friendship, status, access, or the desire not to let other good people down. The institution benefited from all of them. Organizational research on normative control and peer-enforced norms gives us language for that broader mechanism. [S107][S108]

Near the end of my tenure, the story changed fast. A new CIO arrived, technology teams were hit by layoffs, and design, product, and engineering work began moving toward a shop in Gurgaon. I watched people who had built careers around the company's language of family confront the much colder language of sourcing and cost.

Both versions of Gartner were real to me. The opportunity was real. The food was good. The colleagues were good. The pride was real. So was the 300-hour month. The mistake would be forcing one version to cancel the other. An institution can genuinely enrich your life while retaining the right to turn you back into a cost center.

That is exactly why the substrate matters. A capable optimizer does not need to invent this arrangement. We already did the product discovery. It inherits the metrics, budgets, categories, incentives, and authority structures already there. Give the institution a tool that can reduce labor costs, intensify output, score performance, redesign workflows, and explain the result in immaculate professional language, and it will not need a villain monologue. It will need a dashboard. The crucial question is still the old human one:

**What did we tell it to optimize, and who had the power to choose?**

## What I mean by acceleration

The title is literal. By acceleration I mean that artificial intelligence gives objectives more reach, speed, and persistence. The institutions that own it, buy it, regulate it, deploy it, and measure its success decide which objectives receive that extra capacity.

That can make a humane system dramatically better. It can also make an extractive system dramatically more efficient. Intelligence does not choose between those futures for us.

So every promise of improvement has to be followed through the relationships around it. Who pays for it? Who owns the result? Who absorbs the error? Who can contest the decision? Who has the time and knowledge to notice that a decision was made? Who benefits when the benefit is described as universal?

Those questions do not begin in a distant future. They begin in the language of a bill, a workplace, a market category, and a performance report. Before looking for an intelligence that can understand everything, we should notice how often our existing institutions make ordinary things difficult to understand.
