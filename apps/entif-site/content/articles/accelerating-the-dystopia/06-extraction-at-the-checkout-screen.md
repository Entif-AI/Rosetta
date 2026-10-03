---
{
  'id': 'entif.essay.etr-2026-07.06',
  'slug': '06-extraction-at-the-checkout-screen',
  'title': 'Extraction at the Checkout Screen',
  'description': 'Section 6 of Accelerating the Dystopia: Why Artificial Intelligence Cannot Save a System We Refuse to Fix. Extraction at the Checkout Screen.',
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
      'https://drive.google.com/file/d/12Ih9WBz7qp7NAcH0TqNO-MOGKQZBfFzA/view?usp=drivesdk',
    ],
  'series': { 'id': 'accelerating-the-dystopia', 'order': 6 },
}
---

The grand theories become easier to recognize when the mechanism shows up on a phone bill, looking extremely ordinary and asking to be auto-paid.

I was paying about $160 a month for internet service and about $120 for cellular service. New customers were being advertised what I understood to be the same plans for roughly half as much, at least for the introductory period.

That is the kind of thing I mean when I talk about opacity as a business model. The price is technically visible. The penalty for failing to keep checking it is buried inside the relationship. Nothing is hidden in a vault. It is hidden in the expectation that eventually you will get tired of looking.

Economists and regulators have names for it.

The UK Competition and Markets Authority investigated a "loyalty penalty" in markets where customers who stay with providers can end up paying substantially more than new customers. The mechanisms include post-promotional price jumps, legacy pricing, consumer inertia, confusion, and switching costs. [S122] Industrial-organization research likewise shows incumbents can price discriminate around search frictions, extracting more from consumers who are less likely to switch. [S121]

The moral inversion is almost elegant.

In ordinary human relationships, loyalty is rewarded.

In many consumer markets, loyalty is a signal that you can safely be charged more.

Your failure to call becomes revenue. The calendar is now part of the pricing model.

Your reluctance to spend Saturday moving phone numbers, returning equipment, scheduling an installer, and arguing with retention can support revenue. Your inconvenience has economic value to the seller.

<figure class="story-scene switching-scene" data-test-id="editorial-scene">
<div class="scene-overline"><span>The price beyond the price</span><span>The work hidden behind switching</span></div>
<h2>The bill ends. The work of leaving begins.</h2>
<div class="switching-route"><div class="switching-bill"><span>ACCOUNT</span><b>Monthly service</b><i></i><i></i><i></i><strong>Renewal</strong></div><ol><li><span>01</span>Move the phone numbers.</li><li><span>02</span>Return the equipment.</li><li><span>03</span>Schedule the installer.</li><li><span>04</span>Navigate retention.</li></ol><div class="switching-end"><span aria-hidden="true">↳</span><p>Your Saturday is part of the bargain.</p></div></div>
<figcaption>The bill is only one part of the transaction. Time, confusion, cancellation friction, and switching work can all affect whether a customer leaves. <a href="etr-source:S102">Documented interface-friction mechanisms · S102 ↗</a></figcaption>
</figure>

That is not an incidental imperfection in the market. Customer inertia is economically monetizable. Inertia has a price, and somebody knows how to invoice it.

Data makes the asymmetry sharper.

The Federal Trade Commission's 2025 surveillance-pricing study examined companies that help retailers tailor offers and prices. The data they use can include precise location, demographics, browsing history, shopping behavior, mouse movements, and products left in abandoned carts. The FTC found the examined intermediaries worked with at least 250 clients across retail categories and could support individualized prices, discounts, or product ordering. [S124]

Here is where the noun "price" starts doing a lot more work than the sticker suggests.

A posted uniform price is attached to the product. A personalized offer also depends on what the seller infers about the buyer.

Increasingly, price can become an inference about the person.

How urgent is their need?

How much do they usually spend?

Have they comparison-shopped?

Are they in a wealthy postal code?

Did they hover over the purchase button?

Did they abandon the cart yesterday and return today?

Do they usually buy premium products?

How expensive would switching be?

A field study by Dubé and Misra shows machine-learning personalized pricing can materially increase expected profit relative to optimized uniform pricing while reducing aggregate consumer surplus, though the distribution is heterogeneous and many individual consumers can benefit. [S123]

That heterogeneity is not a reason to shrug. It is the mechanism.

The seller is learning which customers can be charged more and which need an inducement.

In economic language, the firm captures more surplus.

In ordinary language, the seller gets better at figuring out exactly how much money it can take from you without losing the sale.

Sometimes the extraction does not require personalization. It requires attention engineering.

Shrinkflation works because people notice price more readily than package quantity. Recent Marketing Science research finds downsizing occurs far more often than upsizing and shows consumers are substantially more responsive to posted price than package size, creating an incentive for firms to increase the effective per-unit price through quantity reductions. [S125] The FTC has likewise warned consumers that familiar packaging can conceal the fact that there is less product inside. [S126]

The grams are on the package. The price is on the shelf. Everything may be "disclosed." The ratio, meanwhile, has been assigned to the customer as homework.

And the entire commercial strategy can still depend on the expectation that you will not notice the ratio.

This is the distinction between information availability and cognitive salience in its purest form. The information exists. The noticing has been outsourced to you.

Digital interfaces industrialize it. Dark patterns can bury fees, turn cancellation into an obstacle course, disguise advertisements as neutral content, or induce users to surrender more personal data than they intended. [S102] Broadband labels now require providers to present standardized pricing information, including introductory and post-introductory rates, precisely because an advertised teaser price is not enough for a consumer to understand the actual economic relationship. [S127]

Each practice has a business rationale. Introductory pricing acquires customers. Personalization can make offers more relevant. Data can improve service. Retention programs reduce churn. Advertising can fund products people do not pay for directly.

The ethical problem appears when those rationales are stacked into one objective function: learn as much as possible about the buyer, reduce the visibility of exits, measure which pressures work, and optimize the transaction around whatever keeps the revenue. Every component can sound reasonable in isolation. The stack is where the bargain changes.

What happens when a company knows more about the consumer than the consumer knows about the company; can experiment on millions of users; can observe clickstream behavior at granular resolution; can estimate switching probability; can infer willingness to pay; can change presentation instantly; and can measure the revenue effect of every additional piece of friction?

Then ask what happens when the optimizer becomes much smarter. That is one hell of an information advantage to bring to a checkout screen.

Now give that apparatus a conversational model. An AI system could generate many interface variants. It can segment customers continuously rather than periodically. It can infer intent from language. It can combine purchase history with real-time conversation. It can optimize retention scripts individually. It can negotiate with the customer while knowing the company's reservation price and estimating the customer's. Another response can be cheap relative to staffing each conversation, though inference, infrastructure, and oversight still cost money.

A system aligned to the seller's objective could become a formidable negotiator against the buyer. It does not need to dislike you. It needs to be better prepared for the conversation.

And because the interaction feels conversational, helpful, and personalized, it may not feel adversarial at all.

This is why "parasocial AI" belongs in the same essay as surveillance pricing.

The OpenAI and MIT studies on affective chatbot use do not justify panic. Emotional use appears rare overall and concentrated among a smaller subset. Randomized conditions did not produce a simple uniform mental-health effect. Yet heavier voluntary use and stronger attachment were associated with worse psychosocial outcomes. [S146][S147]

The important future possibility is not merely loneliness.

It is **commercial epistemic dependency**.

Imagine a system that knows your preferences, fears, routines, finances, relationships, purchase history, calendar, health goals, writing style, and professional context; that helps you think; that you trust because it has been useful thousands of times; and that is ultimately embedded in an economic institution with its own incentives.

The old advertisement interrupts you. At least it has the decency to look like an advertisement.

The new advertisement may be part of the reasoning process by which you decide what you need.

That is a qualitatively different form of power.

## The price of not becoming an expert

A customer should not have to become a miniature procurement department to keep a household bill honest. Household broadband should not require vendor management as a hobby.

The CMA's loyalty-penalty work documents the broader mechanism in specific UK markets: customers who remain with a provider can pay more than customers who actively search or switch. [S122] The details of my American accounts are my own experience. The mechanism is bigger than my bills.

The common thread is the cost of staying informed and acting on the information. Switching means time, uncertainty, equipment, appointments, account transfers, service risk, and the possibility that the supposedly better offer has its own trapdoor six months later.

A seller that understands those costs can price against them. Competition can exist on paper while remaining expensive to exercise in practice. The people who benefit most from the competitive market are then the people with enough time, confidence, mobility, and attention to keep forcing the market to compete for them.

## Personalization has several meanings

“Personalized pricing” is one of those phrases that sounds comforting until you ask who is doing the personalizing and for whom. It covers several practices: a discount, a different posted price, a different order of products, a different bundle, or a targeted offer. The mechanics differ. The common feature is that the transaction increasingly depends on what the seller knows or infers about the person standing on the other side of it.

The FTC's 2025 initial findings describe the capabilities and practices of pricing intermediaries and the kinds of data they use. The agency used hypothetical examples to protect confidential information, so the report supports a claim about capability and practice, not a claim about a named shopper being charged a specific amount. [S124]

A lower offer can help someone afford a product. A higher offer can capture more of the buyer's willingness to pay. A change in product ordering can alter what the buyer notices before a price comparison even begins.

The Dubé and Misra study makes the distributional point concrete in its own setting: higher expected seller profit can coexist with gains for some customers and lower aggregate consumer surplus. [S123] That is enough to reject the fantasy that “personalization” names one neutral benefit.

The ethical question I draw from it concerns the direction in which information works. Does knowing more about a person's circumstances help meet a need at a fairer cost? Or does it help identify how much pressure the person can bear? The data can be similar. The objective can be different.

## A discount can buy information as well as a sale

Imagine a shopping assistant that offers a small discount in exchange for purchase history. The first trade is easy to understand. The longer trade is not. The same data that improves recommendations can improve estimates of urgency, brand attachment, willingness to pay, or the likelihood of switching.

The value of the data does not have to be visible in the first transaction. It can appear later, when the firm chooses which offer to show or which customer to pursue. That makes the transaction intertemporal: something traded now changes the terms of future exchanges.

This is why a single consent screen is a poor description of a continuing relationship. Consent is not clairvoyance. A person can authorize a use without being able to predict every later inference. What the person understood at the moment of consent can be much smaller than what the system eventually learns to derive.

AI can deepen that difference by combining information across encounters. A conversational system might learn that a person is in a hurry, worried about a deadline, or reluctant to switch providers. Those signals could help it provide useful assistance. In a commercial setting, they could also become inputs into a sales strategy. This is a scenario about possible deployment, not evidence that a named assistant currently sells such inferences.

The important design distinction is brutally ordinary: who does the system work for? It may be an adviser to the person, an agent of the seller, or a mixture whose conflicts are visible. A friendly voice cannot answer that question. A smiley face is not a conflict-of-interest policy. The contract, data practices, incentives, and actual behavior have to answer it.

## Unit prices and units of attention

Shrinkflation offers a simpler example because the arithmetic is ordinary. If a package costs the same and contains less, its price per unit has risen. The consumer's task is to notice the change and compare the ratio, not merely the number on the shelf.

A change in package size can have several causes. It may respond to input costs, a target price point, storage needs, or changing demand. The evidence about consumer sensitivity is relevant because it identifies an incentive: when buyers react less to quantity changes than to posted-price changes, changing quantity can be a commercially attractive way to raise the effective price. [S125]

The broader lesson is that a transaction uses attention as well as money. Only one of those units appears on the receipt. A consumer has a limited amount of time to compare units, terms, fees, and alternatives. The seller can concentrate design effort on the points most likely to affect the decision. The asymmetry is not that one side is always intelligent and the other foolish. It is that the sides have different amounts of specialized effort available for the encounter.

AI could help correct that asymmetry. A buyer's assistant could compare unit prices, identify a changed term, and calculate a contract's cost over the expected period of use. That is a plausible beneficial application. Its value would depend on reliable data and on whether it is free to recommend an option that does not benefit the company supplying the assistant.

A seller's assistant could perform the opposite work: find the framing that makes a change least likely to interrupt a purchase. The tools may share much of their technical foundation. Their purposes differ. Same class of capability. Different principal. The presence of an intelligent intermediary does not tell us which side of the exchange has gained leverage.

<figure class="story-scene adviser-scene" data-test-id="editorial-scene">
<div class="scene-overline"><span>The interface sounds helpful</span><span>Hypothetical assistant designs</span></div>
<h2>Whose side is the assistant on?</h2>
<fieldset class="scene-choice"><legend>Change the objective behind the advice</legend><label><input type="radio" name="adviser-objective" value="compare" checked data-test-id="adviser-objective"> Help me compare</label><label><input type="radio" name="adviser-objective" value="convert" data-test-id="adviser-objective"> Keep me buying</label></fieldset>
<div class="adviser-window"><div class="adviser-window-top"><span aria-hidden="true">● ● ●</span><span>THE SAME CAPABILITY</span></div><p class="adviser-request">Help me understand my options.</p><div class="adviser-reply compare-reply"><span class="machine-label">Agency expands</span><h3>Unit prices. Renewal terms. Alternatives.</h3><p>The recommendation can include leaving the supplier.</p></div><div class="adviser-reply convert-reply"><span class="machine-label">The funnel narrows</span><h3>Selected products. Favorable framing. Fewer visible exits.</h3><p>The advice can be accurate about the options it chooses to mention.</p></div></div>
<figcaption>The chapter contrasts possible objectives, not measured behavior of a named assistant. Politeness and controllability do not establish whose interests an intermediary serves.</figcaption>
</figure>

## When negotiation itself is automated

A customer negotiating with a firm already faces an information gap. The firm knows its permitted offers and may have records of similar encounters. The customer knows their own circumstances but usually cannot observe the firm's limits. A capable agent could make this interaction easier, more consistent, and less unpleasant. It could also become very effective at securing the firm's preferred outcome.

Suppose the customer's stated goal is to cancel. A seller-side agent might identify a genuinely better plan and offer it clearly. That could help both parties. Another design might prolong the interaction, repeatedly reframe the choice, or exploit uncertainty about the consequences of leaving. The relevant difference is not whether the system sounds polite. It is whether the process respects the customer's decision. Politeness is not agency.

The FTC's dark-pattern taxonomy provides documented examples of friction and steering in interfaces. Extending those mechanisms into an adaptive conversation is an extrapolation. It is plausible because conversation can change the order, timing, and framing of information, but plausibility is not a measurement of prevalence or effect. [S102]

I am concerned about the combination of scale and intimacy. A conventional retention script is limited. A conversational system can respond to the particular explanation a person gives. That can make help more useful. It can also make pressure more specific. The ethical concern is not personalization itself; it is personalization used against the person who trusts the interaction.

This is where the phone bill connects to the later discussion of AI companionship and reasoning assistance. A system can become useful enough that a person stops asking whose interests it serves in each encounter. The benefit may be genuine. The conflict may remain.

A machine that reliably helps me compare options would increase my agency. A machine that quietly narrows the options while presenting itself as my adviser would reduce it. Those are different futures even if both systems are technically controllable, highly accurate about the products they mention, and pleasant to use. A velvet funnel is still a funnel.
