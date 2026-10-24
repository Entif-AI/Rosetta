---
{
  'id': 'entif.essay.100-percent-of-what-exactly-gpt-6-1-sol-quota-rug-pull',
  'slug': '100-percent-of-what-exactly-gpt-6-1-sol-quota-rug-pull',
  'title': '100% of What, Exactly? The GPT-6.1 Sol Quota Rug Pull',
  'description': 'My Codex logs show the same GPT-6.1 Sol Max allowance buying roughly half the input and one-third the output twelve days later. I think OpenAI tightened the meter after launch.',
  'kind': 'essay',
  'status': 'draft',
  'published': '2026-10-24',
  'authors': ['Crates McDade'],
  'tags': ['ai', 'openai', 'codex', 'gpt-6-1-sol', 'pricing', 'usage-limits'],
  'projects': [],
  'routeTag': 'ai',
  'related': [],
  'sourceRefs':
    [
      'Local Codex rollout telemetry, October 4-24, 2026',
      'https://openai.com/index/introducing-gpt-6-1-sol/',
      'https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers',
      'https://help.openai.com/en/articles/20001516-managing-usage-with-gpt-6-astra-in-work-and-codex',
      'https://community.openai.com/t/insane-usage-burn-rate-swing-on-pro-20x-potential-bug/1396093',
      'https://community.openai.com/t/new-usage-limits-are-hindering-my-productivity/1403058',
      'https://community.openai.com/t/pro-200-cut-from-20x-to-10x-how-can-customers-verify-what-these-multipliers-actually-mean/1402804',
      'https://community.openai.com/t/gpt-6-1-sol-suddenly-consuming-much-more-plus-usage-since-october-16/1407305',
      'https://community.openai.com/t/codex-usage-chart-attributes-80-of-usage-to-gpt-6-astra-which-i-never-selected/1407973',
      'https://www.reddit.com/r/codex/comments/1wo8fhw/okay_they_literally_cut_our_quota_by_half_gpt_6/',
      'https://www.reddit.com/r/codex/comments/1wtlkg6/gpt_61_brought_another_nerf_to_usage_table_update/',
      'https://www.reddit.com/r/codex/comments/1wvq11f/gpt61_sol/',
      'https://www.reddit.com/r/codex/comments/1wvy7ga/sol_61_on_max_quota_usage/',
      'https://www.reddit.com/r/codex/comments/1ww9cf7/holy_usage_increase_after_latest_reset/',
      'https://www.reddit.com/r/OpenaiCodex/comments/1xbbkip/sol_burns_through_my_fucking_quota_luna_is_dumb/',
    ],
  'featured': false,
}
---

I want to tell you about a five-hour window that lasted a little over an hour.

That sentence sounds like the opening move in a philosophy seminar, but this one came from the percentage meter inside OpenAI Codex.

A week or two ago, GPT-6.1 Sol was absurdly generous. I could run it at Max reasoning for hours. Real autonomous software engineering. Long context. Tool use. GitHub work. Tests. Commits. The kind of work for which a two-hundred-dollar AI subscription is supposed to earn its keep.

Then Sol started eating quota like somebody had quietly replaced the gas tank with a shot glass.

The most recent run finally made me stop staring at the percentage bar and start auditing the machine. I had already done the respectable thing. I blamed myself.

Maybe my prompts were too large.

Maybe my agent was reading too much.

Maybe my project instructions were bloated.

Maybe context compaction was forcing expensive rehydration.

Maybe I was making the model reconstruct the whole dependency graph.

Maybe Max reasoning was the problem.

Maybe cached context was not as cheap as I thought.

So I stripped the workflow down.

I made each GitHub issue independently executable. I stopped hydrating the global work graph. I constrained reads to the current ticket and its direct prerequisites. I constrained retries. I told the agent not to preload future work. I removed subagents. I stayed in a warm session so the cache remained hot. I dropped the model from Max to Medium.

The remaining 44 percent of the five-hour allowance disappeared in minutes.

At that point, continuing to blame my prompt engineering would have been less like debugging and more like Stockholm syndrome with YAML.

So I opened the Codex logs.

That changed the argument.

## The meter has receipts

Codex stores rollout logs locally. They contain a great deal more information than the cheerful little percentage bar OpenAI gives the customer.

Among other things, the logs record:

- the model;
- reasoning effort;
- timestamps;
- input tokens;
- cached input tokens;
- output tokens;
- reasoning-output tokens;
- the primary allowance percentage;
- the allowance reset timestamp;
- and the primary allowance window size.

The primary window in the runs I examined is explicitly recorded as 300 minutes.

Five hours.

That gave me something much better than memory, vibes, or screenshots of a shrinking progress bar. I could reconstruct the actual quota windows and compare what the model did inside them.

I found two unusually clean runs.

Same model: **GPT-6.1 Sol**.

Same reasoning setting: **Max**.

Same primary allowance: **0 percent used to 100 percent used**.

Same 300-minute quota window type.

No other Codex model or session sharing either of those reset windows.

One was October 4, during what I am going to call the honeymoon.

The other was October 16.

Here is what 100 percent of the same primary allowance bought me.

| Logged quantity            |   October 4 |  October 16 | October 16 as share of October 4 |
| -------------------------- | ----------: | ----------: | -------------------------------: |
| Model                      | GPT-6.1 Sol | GPT-6.1 Sol |                             same |
| Reasoning                  |         Max |         Max |                             same |
| Primary allowance consumed |        100% |        100% |                             same |
| Logged time to exhaustion  |   174.7 min |    69.6 min |                            39.8% |
| Uncached input             |   1,300,707 |     711,453 |                            54.7% |
| Cached input               |  33,678,848 |  17,744,896 |                            52.7% |
| Total input                |  34,979,555 |  18,456,349 |                            52.8% |
| Total output               |     254,397 |      85,866 |                            33.8% |
| Reasoning output           |     126,346 |      40,044 |                            31.7% |
| Non-reasoning output       |     128,051 |      45,822 |                            35.8% |

Read the table from right to left if you enjoy nausea.

On October 16, the same model at the same Max reasoning setting exhausted the same full five-hour-window allowance while processing about **47 percent less total input**.

It produced about **66 percent less total output**.

It produced about **68 percent less reasoning output**.

It exhausted the allowance about **60 percent faster**.

Every visible token bucket went down.

The meter still reached 100 percent.

This is the part where an institution normally sends in a person wearing an extremely sensible cardigan to explain that usage is complicated.

Yes.

Usage is complicated.

Arithmetic is not.

## This is not a story about the model simply doing more work faster

I initially chased the most charitable explanation.

Maybe the newer runtime was simply faster.

That would make intuitive sense. If Codex can issue model calls faster, run tools faster, and cycle through work faster, then a nominal five-hour window can disappear sooner in wall-clock time without the economics changing. A faster engine empties the fuel tank sooner even if the miles per gallon stay constant.

For a few minutes, that explanation looked good.

In one direct comparison, the newer run was indeed chewing through fresh context several times faster per minute.

Then I looked at the output.

The October 4 Max run produced **254,397 output tokens** before the meter hit 100 percent.

The October 16 Max run produced **85,866**.

The earlier allowance bought almost three times as much output.

Reasoning output was worse. October 4 produced **126,346 reasoning-output tokens**. October 16 produced **40,044**.

The earlier allowance bought more than three times as much reasoning output.

And this happened while October 16 also used less uncached input and less cached input.

So no, the newer runtime was not merely burning the same quota-denominated workload faster.

If the quota meter were a fixed nonnegative combination of the token categories Codex logs, then a later run with less of every category could not consume the same full allowance.

Something else changed.

Either the effective weights changed, or OpenAI began charging the allowance for some consequential quantity the local telemetry does not expose.

From the customer's perspective, the distinction is mostly academic. If the company changes the invisible conversion function, or adds a new invisible term to it, the result is the same:

**100 percent stopped buying the same thing.**

That is the product.

## The maddening part is that OpenAI had already told people it was changing the meter

This did not begin with GPT-6.1 Sol.

On September 9, weeks before the Sol 6.1 launch, an OpenAI Community user named alyx posted one of the better pieces of amateur billing forensics I have seen. They compared local request logs against allowance movement and reported a spectacular discontinuity.

Their description was blunt:

> “my weekly Codex allowance suddenly started draining much faster despite a substantial drop in recorded token usage.”

<a href="https://community.openai.com/t/insane-usage-burn-rate-swing-on-pro-20x-potential-bug/1396093" rel="nofollow noreferrer noopener" target="_blank">Their September 8 to 9 comparison</a> showed 2.18 billion recorded tokens consuming six percentage points, followed by 472.9 million recorded tokens consuming another 65 points. They correctly refused to call that a literal 50x billing multiplier, because the two periods differed in model mix and routing. The important fact was the discontinuity.

Then something even more interesting appeared in the same thread.

On September 22, another user reported what OpenAI Support had told them:

> “There have also been changes to how Codex usage is measured.”

<a href="https://community.openai.com/t/insane-usage-burn-rate-swing-on-pro-20x-potential-bug/1396093/37" rel="nofollow noreferrer noopener" target="_blank">According to that posted Support response</a>, Codex credit consumption had been linked more directly to token usage instead of approximate per-turn averages.

There it is.

Not a leaked Slack message.

Not a shadowy anonymous source in a parking garage.

A customer reporting that OpenAI Support explicitly told them the company had changed how Codex usage was measured.

A week later, the company reopened its $200 Pro plan and publicly changed the economics again.

A September 29 post preserved a statement from OpenAI's Tibo Thielemans:

> “we are also changing how we calculate the usage for it.”

<a href="https://community.openai.com/t/new-usage-limits-are-hindering-my-productivity/1403058/4" rel="nofollow noreferrer noopener" target="_blank">The quoted announcement</a> said the new Pro $200 calculation would work out to roughly half the API-dollar-equivalent spend of the old plan.

<a href="https://help.openai.com/en/articles/9793128-about-chatgpt-pro-tiers" rel="nofollow noreferrer noopener" target="_blank">OpenAI's own Help Center</a> now says the quiet part with less personality. New Pro $200 subscriptions receive a lower usage allowance than previously offered, the price remains $200, and eligible existing subscribers keep the prior allowance only through October 29. The stated justification is “increasingly efficient models.”

That is a fascinating retail proposition.

We halved the amount of the thing you receive because the thing is more efficient now.

You are welcome.

## This is why “they would never secretly change the weighting” is not a serious rebuttal

I spent too much of this investigation entertaining a standard of proof that would make any opaque platform immune from criticism.

Can I prove which internal coefficient changed?

No.

Can I see OpenAI's billing service?

No.

Can I inspect the server-side feature flags?

No.

Can I tell whether the hidden term is cached-context weighting, inference compute, context-window occupancy, service-tier normalization, request-level overhead, routing, or something else?

No.

That is not exculpatory evidence.

That is the power imbalance.

OpenAI controls the meter, the denominator, the server-side accounting rules, the rollout cohorts, the internal model routing, and the data required to distinguish a deliberate pricing change from a metering bug.

Customers get a percentage.

Then, when the percentage behaves differently, we are invited to prove which proprietary mechanism caused it before forming an opinion.

What evidence, exactly, is the customer supposed to produce?

A subpoena?

A whistleblower?

A screenshot of “quota multiplier equals quota multiplier times three” from somebody's production console?

This is not a criminal trial. I am not asking a jury to deprive anyone of liberty.

I am deciding what I think a company did to a product I pay for.

For that purpose, observed behavior, chronology, known precedent, company incentives, and corroborating reports are evidence.

The fact that the decisive internal records are inaccessible to the customer does not transform every external inference into superstition.

## Then GPT-6.1 Sol launched, and the honeymoon was spectacular

<a href="https://openai.com/index/introducing-gpt-6-1-sol/" rel="nofollow noreferrer noopener" target="_blank">OpenAI launched GPT-6.1 Sol on September 29</a> with an extremely attractive pitch: “Near-Astra intelligence for a fifth of the price.”

That was not marketing fluff around the edges. Cost efficiency was the product story.

OpenAI's launch page put the numbers directly beside each other: $2 per million input tokens and $10 per million output tokens for Sol, versus $10 and $50 for Astra. Cached Sol input was advertised at $0.10 per million tokens.

The company explicitly said the cheaper cached input gave developers “more room to build and run capable agents that reuse context across requests.”

That promise matters because persistent coding agents are almost entirely about context reuse. A model can be brilliant in a benchmark and economically useless if every long-running session burns through the subscription before lunch.

For a lot of users, early Sol 6.1 appeared to deliver exactly what OpenAI was selling.

On October 2, in an r/codex thread asking for a verdict on the model, u/The_Oracle\_\_\_ wrote:

> “Insanely cheap, feels like my weekly limits are endless on 100$ plan, but painfully slow”

<a href="https://www.reddit.com/r/codex/comments/1wvq11f/gpt61_sol/" rel="nofollow noreferrer noopener" target="_blank">That thread</a> is a time capsule of the launch experience.

Another user, E72M, said they had left Sol 6.1 working on one task for **38 hours**. They started at 48 percent weekly usage and were still at about 16 percent.

Another commenter wrote:

> “It’s slow but man you can run it all day.”

Another said five Sol 6.1 High agents had worked for fifteen hours and only moved a $200 Pro allowance down to 73 percent.

Another wrote that detailed website work had run for an hour and “usage has barely moved.”

In a separate October 2 thread specifically about Max reasoning, u/egomarker wrote:

> “6.1 max uses about 3-4x less quota than 5.6 max.”

<a href="https://www.reddit.com/r/codex/comments/1wvy7ga/sol_61_on_max_quota_usage/" rel="nofollow noreferrer noopener" target="_blank">The thread's premise</a> was already that Sol 6.1 was “super light on tokens.”

That was the buzz.

People were not merely saying the model was good.

They were saying the economics were insane.

There is a difference.

A developer telling another developer “this model is smart” is useful marketing.

A developer saying “I can run Max all day and the meter barely moves” changes behavior.

You build bigger workflows.

You stop rationing long-running agents.

You migrate work from competitors.

You tolerate the model being slow because the slowness feels almost charming when the quota barely moves. The machine can think all night. You will make coffee.

That is adoption fuel.

OpenAI did not have to write the copy.

Its customers did.

## The early reports were contradictory, which is exactly why I do not expect a single worldwide switch

Here is where the chronology gets more interesting.

The honeymoon was real for many users, including me.

It was not universal.

On September 29, the day Sol 6.1 launched, one Reddit user published a measured complaint titled <a href="https://www.reddit.com/r/codex/comments/1wtlkg6/gpt_61_brought_another_nerf_to_usage_table_update/" rel="nofollow noreferrer noopener" target="_blank">“GPT 6.1 brought another nerf to usage - table update.”</a>

They measured a fresh five-hour window twice and estimated the included usage at about $7.50 to $7.80 of current API-equivalent spend.

Four days later, on October 3, another r/codex user described a sudden change immediately after a reset. Before the reset, they said numerous agents over 24 hours had moved the meter about 30 percent. After the reset, continuing with Sol 6.1 High:

> “I am down to 74% remaining in just a couple hours. Huge usage increase.”

<a href="https://www.reddit.com/r/codex/comments/1ww9cf7/holy_usage_increase_after_latest_reset/" rel="nofollow noreferrer noopener" target="_blank">The thread</a> included another Pro 20x user saying Astra exhausted a weekly allowance in eight hours on work that had previously lasted about a day and a half.

Meanwhile, other users were still reporting almost endless Sol usage.

That does not make me less suspicious.

It makes me more suspicious.

Massive consumer infrastructure does not normally deploy consequential changes by having an engineer stand up at noon and press the giant red **FUCK EVERY CUSTOMER SIMULTANEOUSLY** button.

It uses staged rollouts.

Canary cohorts.

Feature flags.

Regional waves.

Account buckets.

Percentage allocations.

Rollback groups.

Experiments.

If the effective quota economics were being recalibrated across millions of users, I would expect the public evidence to look messy.

One user gets hammered on September 29.

Another after an October 3 reset.

Another still thinks Sol is practically free on October 4.

Another sees the change on October 11.

Then a large cluster starts screaming around October 16 and 17.

That is not a clean laboratory breakpoint.

It is exactly the kind of weather pattern I would expect from a staged platform change viewed by people standing outside the datacenter fence.

## October 16 is where the complaints start sounding eerily like my logs

My clean Max-to-Max comparison crosses October 4 to October 16.

That second date matters because unrelated users started naming the same date.

On October 17, a Plus subscriber opened an OpenAI Developer Community thread titled <a href="https://community.openai.com/t/gpt-6-1-sol-suddenly-consuming-much-more-plus-usage-since-october-16/1407305" rel="nofollow noreferrer noopener" target="_blank">“GPT-6.1 Sol suddenly consuming much more Plus usage since October 16.”</a>

The opening report said:

> “Starting yesterday, October 16, I noticed a dramatic increase in how quickly it consumes my usage allowance.”

That is twenty words. It is also almost exactly what my local telemetry says.

The replies got more specific.

A user named McDonalds_Mouse reported continuing the same task with GPT-6.1 Sol at Medium reasoning:

> “I was literally continuing the exact same task with the exact same model and reasoning settings”

<a href="https://community.openai.com/t/gpt-6-1-sol-suddenly-consuming-much-more-plus-usage-since-october-16/1407305/6" rel="nofollow noreferrer noopener" target="_blank">They said the allowance suddenly began running out much faster</a> and was exhausted within five hours.

Another user, Ni-Ni, estimated that their five-hour limit had started draining:

> “roughly 4 to 5 times faster by my estimate”

<a href="https://community.openai.com/t/gpt-6-1-sol-suddenly-consuming-much-more-plus-usage-since-october-16/1407305/11" rel="nofollow noreferrer noopener" target="_blank">They said the workload was comparable</a>, Standard service was in use, and they had disabled several possible background contributors.

Another user said comparable tasks were consuming about twice as much allowance. Another said Sol 6.1 Low, which had previously never exhausted the five-hour limit, was suddenly running out in roughly half an hour.

And this was happening on OpenAI's own forum.

Not a competitor's Discord.

Not a crypto Telegram channel.

OpenAI's house.

## The analytics themselves started looking haunted

Then came a report that should make anyone responsible for billing telemetry sit upright.

On October 20, a Pro user posted an OpenAI Community bug report saying they only used GPT-6.1 Sol in Codex, but the usage analytics began attributing most of their activity to Astra.

Their summary:

> “usage attributed to gpt-6-astra, a model I never selected.”

<a href="https://community.openai.com/t/codex-usage-chart-attributes-80-of-usage-to-gpt-6-astra-which-i-never-selected/1407973" rel="nofollow noreferrer noopener" target="_blank">The posted numbers</a> showed 79.4 percent of October 17 usage and 82.6 percent of October 18 usage attributed to Astra in the model chart.

At the same time, the per-chat breakdown reportedly showed the top five chats as 99 to 100 percent Sol.

This does not prove that OpenAI secretly routed Sol requests through Astra and billed them as such.

It proves something more immediately relevant to the customer:

**the company's own usage surfaces could not agree on what model consumed the usage.**

That matters because the customer is being asked to trust a hidden denominator whose visible attribution can contradict itself.

If my electric company sent a bill saying 82.6 percent of my consumption came from the industrial arc furnace I do not own, while the room-by-room breakdown said my refrigerator accounted for everything, I would not begin by apologizing to the utility for my insufficient understanding of electrical engineering.

I would ask them to fix the fucking bill.

## By October 21, the language had changed from “amazing value” to “what am I paying for?”

Reddit is not a scientific instrument.

It is, however, a very good place to watch product sentiment mutate in public.

On October 2:

> “Insanely cheap, feels like my weekly limits are endless”

By October 21, an r/OpenaiCodex poster opened with:

> “GPT-6.1 Sol is still burning through my included usage way too fucking fast.”

<a href="https://www.reddit.com/r/OpenaiCodex/comments/1xbbkip/sol_burns_through_my_fucking_quota_luna_is_dumb/" rel="nofollow noreferrer noopener" target="_blank">The thread</a> is not subtle.

One commenter wrote:

> “6.1 sol used to not use much quota now it rips through it”

Another said that at the beginning of the month they could get a lot of use before the five-hour limit, while now they were lucky to get four or five tasks.

Another described analyzing thousands of documents and said the same class of work had gone from two or three days of usage to exhausting the $200 weekly quota in hours.

Another Plus user said the five-hour limit had lasted a few hours the prior week, but that day lasted only three medium-difficulty prompts.

There are also dissenting comments in the same thread. One user said they were still hammering Sol High without making much of a dent.

Again: good.

That is what a cohort rollout looks like from outside.

If every user had crossed the line at the same second, I would be looking for a global configuration flip.

If different users report different effective economics across adjacent days, resets, plans, and sessions, I start looking for staged assignment.

The heterogeneity is part of the hypothesis.

## The company has already trained customers to expect invisible economic changes

This is not occurring in a vacuum.

On September 23, before GPT-6.1 Sol launched, a highly upvoted r/codex post was titled:

<a href="https://www.reddit.com/r/codex/comments/1wo8fhw/okay_they_literally_cut_our_quota_by_half_gpt_6/" rel="nofollow noreferrer noopener" target="_blank">“Okay, they literally cut our quota by half. GPT 6 Sol got hit too.”</a>

The author had been estimating API-dollar equivalents per percentage point and concluded:

> “YOU, as the user, now got a 50% cut of whatever your subscription was worth.”

Then came September 29, when OpenAI itself announced the new Pro $200 economics.

Then came the current Help Center language, which says a new Pro $200 subscription includes a **lower usage allowance than previously offered** while the monthly price remains $200.

OpenAI's justification is that models are increasingly efficient.

That sentence deserves to be mounted over the entrance to the Museum of Subscription Economics.

Imagine your mobile carrier announcing:

> Our network became twice as efficient, so your 100 GB plan now includes 50 GB at the same price.

Perhaps the network really is more efficient.

Wonderful.

Whose efficiency dividend is that?

The customer's, in the form of more value for the same money?

Or the vendor's, in the form of lower cost plus a smaller allowance plus the same subscription fee?

OpenAI has answered that question with a pricing page.

## “100 percent” is not a unit

The underlying problem is not merely that I think OpenAI tightened Sol 6.1's effective quota economics.

The underlying problem is that OpenAI has designed a metering system where customers cannot independently establish what they bought.

A user on OpenAI's own community forum asked Support what absolute quantity sits behind the 100 percent meter after the Pro 200 reduction.

Their report of Support's answer was extraordinary in its ordinariness:

- the quantity behind 100 percent is not disclosed as a customer-visible absolute unit;
- it is not defined as a fixed number of messages, tokens, tasks, or published compute credits;
- OpenAI does not document a fixed absolute equivalent for 5x, 10x, or 25x;
- and the documentation does not guarantee that the multipliers always map to one stable internal baseline.

<a href="https://community.openai.com/t/pro-200-cut-from-20x-to-10x-how-can-customers-verify-what-these-multipliers-actually-mean/1402804" rel="nofollow noreferrer noopener" target="_blank">That is not merely a documentation problem.</a>

It is the economic architecture of the product.

The customer sees a percentage.

The company controls what the percentage means.

If the company changes the function underneath it, the label on the gauge does not have to change.

Still says 100%.

Still says five hours.

Still says Sol.

The car just stops seventy minutes later.

## The current documentation almost reads like a legal wrapper for arbitrary effective pricing

<a href="https://help.openai.com/en/articles/20001516-managing-usage-with-gpt-6-astra-in-work-and-codex" rel="nofollow noreferrer noopener" target="_blank">OpenAI's current Work and Codex usage guidance</a> says the allowance “does not correspond to a fixed number of messages or tasks.”

It says usage depends on the model, task, settings, context, reasoning, tools, information retrieval, caching, and speed.

Those are all legitimate variables.

They are also an extraordinarily large discretionary surface.

The more dimensions that feed an undisclosed normalized meter, the easier it becomes to change the economic behavior without changing any customer-facing quantity.

Suppose cached tokens become twice as expensive against the allowance.

The percentage bar can absorb it.

Suppose context-window occupancy becomes a new charge.

The percentage bar can absorb it.

Suppose Max reasoning gets a larger hidden multiplier.

The percentage bar can absorb it.

Suppose a model is moved to a different internal compute tier.

The percentage bar can absorb it.

Suppose customers in one cohort receive one weighting formula and another cohort gets a new one.

The percentage bar can absorb it.

This is the sort of abstraction engineers love because it lets the backend evolve without breaking the interface.

It is also the sort of abstraction monopolists love because it lets the economics evolve without changing the price tag.

## My hypothesis: OpenAI subsidized the honeymoon, harvested the hype, then tightened the meter

Here is where I stop pretending the only respectable editorial position is agnosticism.

I think OpenAI launched GPT-6.1 Sol under unusually favorable effective quota economics for at least a substantial share of users.

I think those economics helped manufacture the early perception that Sol 6.1 was an almost absurd bargain.

I think that perception mattered to adoption.

And I think OpenAI subsequently moved users, probably in stages, onto materially harsher effective quota accounting.

Call it normalization.

Call it calibration.

Call it capacity management.

Call it aligning subscription consumption with API-equivalent economics.

Call it EntitlementRebalancingServiceV2 if that makes the Jira ticket feel cleaner.

I call it a rug pull.

The hypothesis fits the chronology uncomfortably well.

First, OpenAI was already experimenting with or changing Codex usage accounting in September. We have community reports of enormous allowance discontinuities and a posted Support statement that usage measurement had changed.

Second, the company publicly reduced the economic value of its Pro $200 entitlement while keeping the price fixed.

Third, Sol 6.1 launched with a cost-efficiency story as one of its central selling points.

Fourth, many early users experienced astonishingly generous quota behavior and advertised it for OpenAI at no charge.

Fifth, reports of harsher economics appear at different times across accounts, which is what I would expect from staged rollout rather than a universal switch.

Sixth, my own clean local telemetry shows the same Sol 6.1 Max primary allowance buying about half the input and one-third the output on October 16 compared with October 4.

Seventh, OpenAI's public usage model remains opaque enough that a server-side weighting change can occur without any customer-verifiable contract being visibly violated.

Means.

Motive.

Opportunity.

Precedent.

And a pile of contemporaneous witnesses yelling from different parts of the deployment map.

That is enough for me to have an opinion.

## The launch-hype mechanism would be almost embarrassingly effective

If this was intentional, the clever part is that OpenAI would not need to buy a single advertisement about quota efficiency.

Give the new model unusually favorable included-usage economics for the early cohort.

Make it slow enough that a long task accumulates impressive wall-clock duration while barely moving the meter.

Let power users discover that Max can grind for hours.

Let them post screenshots.

Let them tell each other their weekly limits feel endless.

Let people build five-agent and ten-agent workflows because the economics suddenly permit it.

Let the sentence “you can run it all day” propagate through the exact communities that influence developer adoption.

Then, once the model has established its reputation as the bargain frontier worker, move the meter toward the production economics you actually want.

The headlines remain.

The Reddit search results remain.

The YouTube videos remain.

The architectural decisions users made during the honeymoon remain.

The model is already inside the workflow.

This is a classic introductory subsidy with a uniquely modern twist: the introductory price is not printed on the box.

It lives inside an invisible percentage function.

You can remove the subsidy without ever changing the sticker.

## The early contradictory reports make the hypothesis stronger, not weaker

If I were trying to falsify my own argument, the obvious objection would be that some people complained about usage immediately while others continued reporting excellent economics later.

That is true.

It also maps cleanly onto staged experimentation.

We already have September evidence that different accounts could show wildly different API-dollar-equivalent value per percentage point.

In the September 9 OpenAI Community thread, alyx later reported tests across multiple 20x accounts with dramatically different effective dollar-per-percent results.

The exact figures are less important than the pattern: account-level economics were not uniform.

If OpenAI was tuning accounting, cohorting, correcting bugs, or testing new weightings, one should expect inconsistent reports.

The mistake is imagining that a platform change must appear as a single timestamp visible to everybody.

That is not how modern infrastructure is normally operated.

The public sees weather.

The platform sees feature flags.

## “Maybe it was a bug” is not the defense people think it is

Suppose I am completely wrong about strategic intent.

Suppose nobody planned a honeymoon.

Suppose there was no deliberate post-launch tightening.

Suppose this entire thing is a metering regression, delayed reconciliation bug, cache-accounting defect, routing error, or some other giant invisible billing gremlin.

Okay.

Then OpenAI shipped a billing or quota-accounting system that can make the same named model and reasoning setting consume a full customer allowance with roughly half the logged input and one-third the logged output, while multiple users report similar discontinuities, and the company did not give customers the ledger needed to reconcile it.

That is not a comforting alternative.

If the restaurant intentionally shrank my steak, we have a pricing problem.

If the kitchen accidentally throws away two-thirds of my steak every night and still charges me for dinner, we have an operations problem.

I still did not get the steak.

The distinction matters for culpability inside OpenAI.

It matters much less for whether customers should tolerate the product design.

## The burden of proof cannot be “steal the server logs”

There is a peculiar rhetorical move that appears whenever customers accuse a cloud platform of quietly changing something.

The customer produces behavior.

The platform produces opacity.

Then somebody demands internal proof from the customer.

Show the exact multiplier.

Show the config diff.

Show the server-side pricing function.

Show the rollout plan.

Show the meeting notes.

Otherwise, speculation is irresponsible.

No.

The institution with exclusive access to decisive evidence does not get to use that exclusivity as evidence of innocence.

If OpenAI wants customers to stop inferring changes from external behavior, it can publish enough information to make inference unnecessary.

The customer should not need forensic tooling to answer the question, “What did this task cost against my subscription?”

That should be a receipt.

## What a minimally honest usage receipt would contain

This is not hard to specify.

For every Work or Codex task, give me:

1. The selected model.
2. The model that actually served the request, if routing substituted anything.
3. Reasoning effort.
4. Service tier.
5. Cached input tokens.
6. Uncached input tokens.
7. Cache-write tokens.
8. Output tokens.
9. Reasoning-output tokens.
10. Any other normalized compute unit charged against the allowance.
11. Five-hour allowance deduction attributable to the task.
12. Weekly allowance deduction attributable to the task.
13. Credits charged, if any.
14. The weighting schedule version used.
15. The time the usage was incurred.
16. The time the deduction was posted.
17. Any later adjustment or refund.
18. Any experiment or rollout cohort that materially changed accounting.

That is not radical transparency.

That is a receipt.

My grocery store gives me one.

My cloud provider gives me one.

My electric utility gives me one.

Stripe can tell a merchant which line item created a charge.

AWS can achieve such granularity that a sane person begins to miss the comforting simplicity of ignorance.

OpenAI is one of the most technically capable companies on Earth.

I reject the premise that “100% remaining” is the best accounting interface it can produce.

## Publish the weighting schedule

There is one additional item I want because this product is sold as an ongoing subscription rather than a bag of fixed tokens.

Publish the weighting schedule.

Not the proprietary inference implementation.

Not the datacenter topology.

Not the secret sauce behind the model.

The economic conversion.

If one million uncached Sol input tokens consume X normalized units, say X.

If cached input consumes one-twentieth of that, say so.

If output consumes five times input, say so.

If Max carries a multiplier, publish it.

If long context changes the rate, publish the thresholds.

If Fast is 2.5x, as the documentation currently says, put it on the task receipt.

If Ultrafast is 8x, put it on the task receipt.

And when those values change, version the schedule and publish the effective date.

The API already has token prices.

The subscription product should not be allowed to hide economically equivalent information behind a percentage gauge merely because the customer prepaid.

## If you are running an experiment on my account, tell me

OpenAI loves staged rollouts.

Fair enough.

Staged rollouts are how competent teams keep large systems from detonating everybody at once.

But economic experiments are not ordinary UI experiments.

Changing button placement is not the same as changing what a paid subscription buys.

If my account is placed into a cohort with a different usage-calculation regime, I want to know.

If my allowance is being calculated under usage-weighting-v3 while somebody else's is on v2, I want that displayed.

If the purpose is capacity management, say so.

If the experiment changes expected subscription value by 30, 50, or 70 percent, obtain consent or provide compensation.

Do not hide economic experimentation inside a generic “usage may vary” clause and then treat the resulting confusion as an educational opportunity for the customer.

## The Pro $200 cut tells me how OpenAI thinks about the efficiency dividend

The most revealing sentence in the current Pro documentation is not the price.

It is the rationale.

New Pro $200 subscriptions receive a lower usage allowance “to reflect our increasingly efficient models.”

That tells me where OpenAI thinks the efficiency dividend belongs.

OpenAI improves the model.

The model becomes cheaper or more efficient to run.

The customer does not necessarily receive more work.

OpenAI can reduce the included allowance.

The subscription stays $200.

This is not a technical inevitability.

It is an allocation decision.

The company could pass efficiency gains to customers by keeping the allowance stable.

It could split the gains.

It could lower the subscription price.

It could increase margins temporarily and leave usage untouched.

Instead, the documented policy is that improved efficiency can justify giving the customer less included usage for the same fee.

Once you understand that philosophy, the idea that Sol's effective usage economics might tighten after launch stops sounding paranoid.

It sounds consistent.

## I am not asking OpenAI to sell unlimited compute for $20

I want to be explicit about what I am not demanding, because otherwise somebody will inevitably respond to this article as if I believe a twenty-dollar subscription entitles me to a private nuclear reactor.

Inference costs money.

Frontier models cost more.

Long contexts cost more.

Tool use costs more.

Reasoning costs more.

I run ridiculous workloads.

I know.

I am not asking OpenAI to lose money so I can entertain myself by making twelve agents debate a type definition until sunrise.

I am asking the company to stop selling an opaque economic abstraction whose underlying value can move without a customer-verifiable unit.

Charge more if you need to.

Sell smaller plans.

Sell credits.

Offer explicit compute tiers.

Publish the weights.

Tell me the truth about what the product costs.

I can make adult decisions with numbers.

What I cannot make adult decisions with is “you have 63% of something left.”

## This matters because agents turn quota opacity into operational risk

For a chat product, an unpredictable quota is annoying.

For an agentic development system, it is architecture.

A developer decides how much work to delegate based on expected runway.

Do I let the agent refactor the entire subsystem?

Do I start a long migration before bed?

Do I parallelize the work?

Do I spend Max reasoning on the hard ticket?

Do I keep the session warm?

Do I split work across models?

Do I reserve enough weekly allowance for tomorrow's production incident?

Do I buy credits?

Do I switch providers?

Those decisions require an economic model.

If the model changes invisibly, the customer pays twice.

First in quota.

Then in workflow disruption.

That second cost can be larger.

I spent time redesigning my own orchestration because I initially assumed the problem was mine.

I removed context.

I changed prompts.

I altered execution boundaries.

I constrained reasoning.

I ran experiments.

Some of those changes improved the workflow anyway.

But I should not have needed to reverse-engineer my subscription to determine whether the product economics had moved under my feet.

## The most insulting version of this story is the one where the honeymoon did exactly what a honeymoon is supposed to do

I keep coming back to the launch threads.

“Insanely cheap.”

“Weekly limits are endless.”

“3-4x less quota.”

“Run it all day.”

Those are extraordinary testimonials.

They are also exactly the testimonials a company would want in the first days after launching a model positioned around cost efficiency.

If the generous early economics were intentional, even temporarily, the strategy was superb.

Developers performed the marketing.

The model's slowness became evidence of thrift instead of a defect.

The quota bar became a product demo.

People built habits around the result.

Then, by the time the complaints grew loud enough to become their own genre of forum post, the launch narrative was already established.

Search results do not reorder themselves when the meter changes.

Reviews do not rewrite themselves.

The first impression remains indexed.

That is why timing matters.

A subsidy after the hype dies does little.

A subsidy during the launch window buys narrative.

## Maybe “rug pull” is impolite

Good.

I paid for the rug.

On October 4, my full GPT-6.1 Sol Max five-hour-window allowance bought roughly **35 million input tokens and 254,000 output tokens**.

On October 16, the same model, same Max reasoning setting, and same full primary allowance bought roughly **18.5 million input tokens and 86,000 output tokens**.

The later run had less uncached input.

Less cached input.

Less output.

Less reasoning output.

Everything visible went down.

The meter still reached 100 percent.

At the same time, other customers were describing abrupt changes in the same period.

OpenAI had already changed Codex usage measurement in September.

OpenAI had already reduced the economic value of Pro $200 while keeping the price at $200.

OpenAI's own documentation leaves the allowance denominator undisclosed.

And OpenAI alone possesses the server-side records that could distinguish a deliberate reweighting from an accounting defect.

I do not need access to those records to know what happened to me.

I received dramatically less observable model activity for the same allowance movement.

I think OpenAI deliberately tightened the effective economics.

I think the early Sol 6.1 experience functioned as an introductory compute subsidy.

I think the subsidy helped create the launch buzz.

I think the company then started moving customers onto harsher accounting once the reputation was established.

That is my hypothesis.

OpenAI is free to disprove it.

The company knows exactly how.

Publish the meter.

---

## Methodology note: how I reconstructed the comparison

I did not derive the October 4 and October 16 numbers from screenshots or from the current Usage page.

Codex stores JSONL rollout logs locally.

For each session, I extracted token-count events and the associated primary rate-limit object. In both comparison sessions, that object reported a 300-minute window.

I used the cumulative token counters recorded in those events:

- input tokens;
- cached input tokens;
- output tokens;
- reasoning-output tokens.

Uncached input is input tokens minus cached input tokens.

I grouped events by the primary reset timestamp and reconstructed each primary allowance window.

I then checked the local session archive for other Codex sessions reporting the same reset window.

The October 4 Max window contained only the GPT-6.1 Sol Max session used in the comparison.

The first October 16 Max window also contained only the GPT-6.1 Sol Max session used in the comparison.

That matters because concurrent Codex sessions can share an account-level allowance and contaminate a naive per-session comparison.

The October 4 primary meter moved from 0 to 100 percent over approximately 174.7 logged minutes.

The October 16 primary meter moved from 0 to 100 percent over approximately 69.6 logged minutes.

The table above uses the difference between the cumulative token counters at the beginning and end of each reconstructed window.

This method does not reveal OpenAI's internal quota formula.

It reveals something simpler.

Whatever that formula was doing, the October 16 full allowance was exhausted after substantially less activity in every token category exposed by the local Codex telemetry.

That is the fact on which the editorial argument rests.
