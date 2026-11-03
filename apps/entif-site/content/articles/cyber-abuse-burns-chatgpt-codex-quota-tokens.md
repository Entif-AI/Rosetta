---
{
  'id': 'entif.essay.cyber-abuse-burns-chatgpt-codex-quota-tokens',
  'slug': 'cyber-abuse-burns-chatgpt-codex-quota-tokens',
  'title': 'Cyber Abuse Flag Appears to Double ChatGPT Codex Token Burn Rate',
  'description': 'After a Cyber Abuse warning, one Codex seat began burning roughly twice the five-hour quota per output token, raising a simple question: who pays for OpenAI’s safety compute?',
  'kind': 'essay',
  'status': 'published',
  'published': '2026-11-02',
  'authors': ['Crates McDade'],
  'tags':
    [
      'openai',
      'gpt-6-1-sol',
      'codex',
      'quota',
      'billing',
      'token-costs',
      'cyber-abuse',
      'alignment',
      'moderation',
      'safety',
    ],
  'projects': [],
  'routeTag': 'cyber-abuse',
  'related':
    ['entif.essay.100-percent-of-what-exactly-gpt-6-1-sol-quota-rug-pull'],
  'sourceRefs': [],
  'featured': false,
}
---

## Am I Paying OpenAI to Investigate Me?

A couple of weeks ago, I asked a fairly simple question about OpenAI’s Codex quota meter:

<a href="/tags/token-costs/2026/10/25/100-percent-of-what-exactly-gpt-6-1-sol-quota-rug-pull/" target="_top">100% of what, exactly?</a>

I had two clean GPT-6.1 Sol Max five-hour windows. Same model. Same reasoning setting. Same visible 0-to-100% allowance. Yet the later window bought roughly half the input, a third of the output, a third of the reasoning output, and about 40% of the logged working time.

The number on the meter stayed the same.

What I got for the number did not.

That was irritating enough.

Now I have a nastier question.

**100% of whose compute, exactly?**

Because on October 24, I received my first Cyber Abuse warning from OpenAI on one of my Codex seats.

Then the machine started behaving differently.

And then I started measuring the bill.

## The warning came with a new personality

I use these systems enough that changes in their operating behavior are about as subtle to me as somebody replacing my left hand with a prosthetic while I am asleep.

After the warning, requests on that seat began showing:

> “The system is thinking a bit more about this request before responding.”

Not occasionally.

Persistently.

The visible reasoning behavior changed at the same time. Beforeward, long-running reasoning streamed incrementally as the system worked. Afterward, I could get several minutes of radio silence, followed by the result arriving in a lump.

Meanwhile, another seat on my MacBook Pro was doing closely related semantic-engineering work. It received the milder:

> “Giving this request a little extra thought.”

No Cyber Abuse warning.

No corresponding disappearance of the incremental reasoning stream.

Same household. Same human. Same project family. Different seat state.

That was interesting before I read OpenAI’s documentation.

After reading it, it became considerably more interesting.

## OpenAI says the machinery exists

GPT-6.1 Sol is classified by OpenAI as having **Critical cybersecurity capability**. OpenAI says Sol uses the same safeguards stack as GPT-6 Astra.

And the Astra documentation describes something remarkably close to the behavior I started seeing.

OpenAI says its safeguards include activation classifiers watching the model’s internal activity. When those classifiers see a concerning pattern, the system **pauses streaming to the user while a separate check runs**. If that check clears the response, streaming resumes. Higher-risk conversations can then be escalated to a specially trained safety reasoner.

There is also a two-tier monitoring system running across conversations.

Tier one decides whether content concerns one of OpenAI’s Preparedness domains.

Tier two is a specially trained **safety reasoner**.

That reasoner examines the generated material against OpenAI’s threat taxonomy and can block responses above its policy boundary.

Then there is the account layer.

OpenAI says accounts crossing biological, chemical, or cybersecurity risk thresholds can receive **deeper automated review** and, in some cases, manual review. The company says it may apply additional monitoring, move an account into a more restrictive configuration, restrict access to capabilities, suspend it, or ban it.

OpenAI’s earlier Codex documentation was even more explicit about the conceptual architecture: conversation monitoring, reasoning-based cyber classification, aggregate risk tracked over time for each account, strikes, escalation, and expert review.

So let me translate that from Safety Department into English.

OpenAI has models watching models.

Some requests can trigger another reasoning system.

Some accounts can receive deeper automated scrutiny.

That scrutiny can alter routing and access.

And one of the documented safeguard paths literally pauses what I see while another process decides what happens next.

Fine.

My question is considerably less philosophical:

**Who pays for it?**

## So I measured the meter

I went through my local Codex telemetry and reduced the comparison to one intentionally stupid metric:

**How many percentage points of my five-hour allowance disappeared per 1,000 output tokens I actually received?**

Lower is better.

Here is what happened on the warned workstation:

| Period        | Five-hour quota points per 1,000 output tokens |
| ------------- | ---------------------------------------------: |
| October 21–22 |                                      **0.640** |
| October 24    |                                      **1.376** |
| October 25–26 |                                      **0.664** |
| October 28–31 |                                      **0.713** |
| November 1–2  |                                      **1.147** |

October 24 was **2.15 times worse** than the October 21–22 baseline.

Then it mostly recovered.

Then it got ugly again.

That intermittent shape is worth staring at for a moment.

If somebody had simply cut my allowance in half forever, I would expect something much closer to a step function.

But what would we expect from a conditional second-stage review system?

Would every request pay the same penalty?

Or would the meter get expensive when something in the request, generation, tools, account state, or accumulated risk score caused the heavier machinery to wake up?

Because that is exactly the sort of shape I have.

Quiet.

Expensive.

Quiet.

Then expensive again.

## Now add the other computer

The November comparison gets harder to wave away.

During November 1–2, the warned workstation consumed:

**1.147 quota points per 1,000 output tokens.**

The MacBook consumed:

**0.493.**

That makes the warned workstation **2.33 times worse** on the same output-normalized metric.

The starting windows make the disparity more visceral.

On the warned workstation, one comparable starting interval burned from zero to 93% of the five-hour meter in about **26 minutes**, producing **78,893 output tokens**.

The MacBook reached 99% in about **56 minutes**, while producing **147,914 output tokens**.

Same GPT-6.1 Sol Medium parent model.

Same reasoning setting.

Same Codex client build.

Same history mode.

Different work lanes, sure.

But twice the useful visible output for roughly the same trip across the meter is the sort of difference that should make anybody with an invoice begin behaving like a raccoon that just heard something move inside the garbage can.

Then I tried something else.

I took the relationship between visible fresh input, cached input, output tokens, and quota movement from my October 21–22 pre-warning baseline.

I froze it.

Then I asked what that relationship would predict later.

For the November 1–2 local batches, the pre-warning relationship predicts roughly **81 quota points**.

The meter moved **138**.

That is about **70% hotter than the visible pre-warning token relationship predicts**.

So what is the other term?

What am I buying?

## OpenAI has already admitted that the visible ledger can be incomplete

This is where OpenAI’s own usage documentation wanders into the room carrying a shovel.

For eligible Work and Codex billing surfaces, OpenAI tells customers that the chat-level usage number is only an estimate of the main conversation.

It specifically warns that automated or system-generated background activity may not appear there.

Then it says activity missing from the chat total may nevertheless **consume credits and count toward usage limits**.

Excuse me?

Read those concepts together again.

Some system-generated activity may be invisible in the conversational accounting.

That invisible activity can still count against usage.

OpenAI also operates automated monitoring around the model.

Some of that monitoring invokes separate model inference.

Some flagged sessions receive deeper automated analysis.

Some accounts receive additional monitoring after crossing risk thresholds.

So which system-generated activities are billable?

Which ones are not?

Where are they itemized?

Where do I see them in `/status`?

Which token counter contains them?

Which column in the usage dashboard says:

`SAFETY_REASONER_TOKENS`

or:

`DEEPER_ACCOUNT_REVIEW`

or:

`WE_ARE_CURRENTLY_DECIDING_WHETHER_CRATES_IS_BUILDING_SKOS_OR_SKYNET`

Because I seem to have misplaced that column.

## OpenAI knows how to say when safety compute is free

Here is the part that makes the silence particularly conspicuous.

OpenAI explicitly tells Codex customers that its **auto-review safety checks are free and do not count toward plan usage limits**.

Beautiful.

Specific.

Unambiguous.

A separate reviewer performs a safety-related function, and OpenAI tells the customer who pays.

OpenAI pays.

Excellent policy.

Now answer the same question about the cyber monitor.

Does the topical classifier count?

Does the activation classifier count?

Does the Safety Reasoner count?

Does the deeper automated analysis count?

Does account-level enhanced monitoring count?

Does rerouting through a different model change the effective deduction?

Does a paused-streaming safety check consume the same allowance as the model generation it is inspecting?

If a request is generated and then withheld while another model reviews it, how many models just touched my prepaid allowance?

One?

Two?

Three?

Is the policeman on my tab?

## I would especially like an answer because OpenAI warned me first

Think about the incentive structure if the answer is yes.

OpenAI decides an account deserves additional scrutiny.

OpenAI runs additional systems against that account.

The resulting service becomes slower.

The user sees less of the process while it happens.

OpenAI may route or restrict subsequent requests differently.

And the user’s prepaid allowance disappears faster because the company is spending more compute deciding whether to trust the user.

That would be an astonishing billing architecture.

You would be paying for the product.

Then you would be paying for the company to investigate your use of the product.

Then, if that investigation made the product more expensive to serve, your subscription would effectively contain less usable product.

It is the software equivalent of getting pulled over and discovering that the patrol car’s gasoline has been added to your toll statement.

## October 24 is where the timeline gets ugly

The surviving telemetry gives me one hard early anchor.

The first clearly degraded retained GPT-6.1 Sol Medium run I can still identify begins at **5:04 a.m. EDT on October 24**.

October 24 is also the date of my first Cyber Abuse warning.

I would love to give you the exact warning timestamp.

I cannot.

The original warning conversation is no longer accessible to me.

I searched the durable Session Minutes I still have from October 24 and the sessions that crossed midnight from October 23. They preserve a frankly absurd amount of surrounding engineering activity.

They do not preserve the warning banner itself.

So here is another question for the pile:

Why does an event consequential enough to change account enforcement state not come with a customer-accessible audit record showing exactly when it happened, which surface generated it, and which subsequent product controls changed because of it?

OpenAI asks customers reporting mistaken cybersecurity checks to provide the exact safety message, model, date, time, timezone, and request ID.

Splendid.

Can I have those too?

## The meter already had a credibility problem

This matters because the meter was already behaving strangely before October 24.

My first investigation compared two clean Sol Max five-hour windows on October 4 and October 16.

Both went from 0% to 100%.

But October 16 bought only about:

- **52.8%** as much total input,
- **33.8%** as much output,
- **31.7%** as much reasoning output,
- and **39.8%** as much logged working time.

That was the basis of my first article.

The meter said 100%.

The observable work underneath 100% had radically changed.

Now add another variable the customer cannot see: **account safety state**.

OpenAI itself says GPT-6.1 Sol receives its strongest safeguards because the model reaches its Critical cybersecurity threshold.

OpenAI itself says those safeguards include real-time monitoring, separate checks, a Safety Reasoner, deeper review, and account-level enforcement.

OpenAI itself says some invisible background or system-generated activity can count toward usage even when it does not appear in chat-level totals.

So why am I still being shown a percentage?

A percentage of what?

Model inference?

Weighted model inference?

Tool use?

Safety processing?

Background processing?

Routing?

Review?

The model answering me?

The model reading the model answering me?

The model deciding whether the first model should have answered me?

At some point the denominator begins to resemble a family secret.

## Show me the receipt

There is a wonderfully easy way to make this entire article boring.

Publish the ledger.

For every Codex task, show:

**Serving model:** GPT-6.1 Sol  
**Reasoning:** Medium  
**Fresh input:** X  
**Cached input:** Y  
**Output:** Z  
**Tools:** N  
**Safety classifier:** free  
**Safety Reasoner:** free  
**Deeper review:** free  
**Rerouting adjustment:** X  
**Allowance deduction:** 4.72 percentage points

Done.

Mystery over.

I can disagree with the pricing and still understand the transaction.

Instead I have a meter that says 100%, a local telemetry record that says the amount of visible work purchased by that 100% changes dramatically, a warning system that visibly changes the behavior of one seat, and OpenAI documentation describing hidden computational machinery operating around exactly that kind of safety event.

What conclusion does OpenAI expect a technically sophisticated customer to explore?

Seriously.

What question am I supposed to ask?

## So I am asking it

Does OpenAI deduct cyber-safety inference from a customer’s Codex allowance?

Does the answer change after a warning?

Do higher-risk account states invoke more expensive review paths?

Can those paths alter effective quota burn without appearing in the local token telemetry?

Does routing triggered by the cyber monitor change the weighting applied to a request?

Does “additional monitoring” have an allowance cost?

When OpenAI says its auto-review safety checks are free, which safety checks are included in that promise?

Why name that one?

What about the others?

And when OpenAI says background activity can be missing from a chat’s displayed usage while still consuming credits, what kinds of background activity are we talking about?

I have a very specific candidate.

## Who's paying for the compute to scan for Cyber Abuse?

The first article asked what a customer was actually buying when the interface said 100%.

I now want a more primitive answer.

**Whose work is feeding the meter?**

Mine?

The model’s?

The tools’?

The reviewers’?

The classifiers’?

The Safety Reasoner’s?

The account-enforcement machinery’s?

I haven't even done anything that merits a "Cyber Abuse" warning in the first place. Scout's Honor.

If OpenAI has decided that I need an AI chaperone, that is certainly OpenAI’s prerogative.

But if I am buying dinner for the chaperone too, **I would like that printed _on the fucking receipt._**

---

### OpenAI Statements

OpenAI’s GPT-6.1 Sol addendum says the model is treated as Critical in cybersecurity and uses GPT-6 Astra’s safeguards stack.

The GPT-6 Astra safeguards documentation describes paused streaming during separate safety checks, a two-tier monitor, a Safety Reasoner, deeper automated review, and account-level enforcement.

OpenAI’s Help Center confirms additional automated cybersecurity checks can delay responses.

OpenAI’s Work/Codex usage documentation says some automated or system-generated work may be absent from chat-level usage while still counting toward usage limits.

OpenAI separately states that Codex auto-review safety checks are free and do not count toward plan usage limits.

Crates McDade states that's a big ol' bag a _bullshit._
