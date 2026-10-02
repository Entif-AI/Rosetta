---
{
  'id': 'entif.essay.etr-2026-07.08',
  'slug': '08-how-money-expertise-and-access-meet',
  'title': 'How Money, Expertise, and Access Meet',
  'description': 'Section 8 of Accelerating the Dystopia: Why Artificial Intelligence Cannot Save a System We Refuse to Fix. How Money, Expertise, and Access Meet.',
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
      'https://drive.google.com/file/d/1Yp_AmCmGA6Br92kxtGrbcAZmlfhdwxnB/view?usp=drivesdk',
    ],
  'series': { 'id': 'accelerating-the-dystopia', 'order': 8 },
}
---

I have watched the machinery of “influence” from inside institutions that sell expertise to the people making enormous decisions.

That does not mean every dinner buys a contract, every lobbyist buys a vote, or every analyst recommendation is corrupt. It means access, prestige, expertise, hospitality, research, procurement, and commercial relationships can reinforce one another long before anything looks like a cash envelope.

I learned that lesson at Gartner.

## The product is also the room

Magic Quadrant always bothered me because of how much authority it compresses into a picture. My crude version of the pitch is: imagine buying a television and receiving a matrix of size and price, then being told the quadrant tells you which one is “best.” The serious version has more methodology than that, of course. The underlying problem still matters. Categories, axes, inclusion rules, and analyst framing help define what the buyer is invited to regard as a serious option.

Then the buyer can purchase more research, more analyst access, and more interpretation from the institution that constructed the frame.

When I worked there, I also saw how strangely the economics could line up. My recollection was that a senior analyst producing the advice could earn roughly what one enterprise user seat cost annually, and less than many junior engineers elsewhere in the industry. At sufficient scale, I remember thinking, you could nearly hire the analyst.

But the research product was only part of what Gartner sold. Symposium made the institution physical.

At a Barcelona Symposium dinner around 2013 or 2014, I was one of roughly two dozen people at a table whose food-and-drink bill exceeded €3,000. At an Orlando event, Gartner rented out Hollywood Studios for several hours. The rides had no normal lines. Food kiosks were free to guests. The entrance was staged as a Hollywood premiere, with television-quality cameras, interview backdrops, models, fake paparazzi, and more than a hundred extras crowding a red carpet. I asked a security guard whether this was normal. He told me that in about thirty years working there, he had never seen anything like it.

That experience matters because “access” is too bloodless a word. The highest-ranking people in an industry can spend several days being treated as unusually important, surrounded by peers and senior analysts, while the people who later build the internal business case move through the same halls. Nobody needs to think, “I owe Gartner.” Influence does not need to be that stupid.

At another Symposium, I was personally tasked with handing out a hundred or more $50 Amazon gift cards to attendees who sat through ten-minute sessions testing a product I had spent the previous six weeks designing and building while still leading my normal engineering work. We called it market research. From where I stood, it was also product exposure. Some attendees refused the cards because their employers prohibited them from accepting gifts. We did not maintain a recipient ledger that would have let me verify who accepted what.

These are firsthand recollections from my time there. They are why I do not treat “legal,” “disclosed,” “research,” “hospitality,” and “influence” as synonyms for one another. The interesting question is how the pieces work together.

The same pattern can appear in less theatrical forms. At PwC, I watched the global digital stack migrate from Google to Microsoft, an enormous operational change. My understanding inside the firm was that a joint-business arrangement included broad reciprocal commercial discounts between PwC and Microsoft. Whether one thinks that arrangement was sensible or not, it illustrates the point: procurement decisions can sit inside commercial relationships much larger than the line item being purchased.

Campaign spending, lobbying, technical consultation, hospitality, procurement, and research are different mechanisms. A disclosed relationship is not proof of a purchased outcome. A legal channel can still change who gets heard, how often, and with what surrounding authority.

The Federal Election Commission states that independent expenditure-only committees, commonly called Super PACs, may accept unlimited contributions from individuals, corporations, labor organizations, and other political committees, subject to restrictions on sources and other rules. The permission to receive contributions is not permission to coordinate spending with a candidate, and it does not eliminate reporting obligations. [S138]

The IRS describes a different disclosure framework for tax-exempt organizations. Contributor names and addresses generally are not required to be made public from annual returns, with important exceptions, including private foundations and certain political organizations. A contributor identified in an exemption application can also be subject to different public-disclosure treatment. The details depend on the type of entity and filing. [S139]

Put those facts together and the practical problem appears: tracing money can require following several entities, filings, dates, and disclosure regimes. The name on the advertisement and the ultimate source of the money are different questions.

## Visibility is a chain, not a single document

A public filing can be accurate and still leave an ordinary reader with hours of reconstruction. Names, dates, entity types, amendments, pass-through organizations, and transactions have to be reconciled before the shape of the relationship becomes visible.

A payment can establish that a relationship existed without proving exactly what happened because of it. That is a limit on the claim, not a reason to stop looking at the relationship.

If a company funds a technical study and submits it in a public consultation, the methods matter and the provenance matters. A sound result does not make the choice of question neutral. A conflicted sponsor does not make a sound result false. The point is to preserve both facts at once.

AI could make this radically easier to inspect by linking filings, identifying amendments, matching entities, and separating direct records from later summaries. It could also make the opposite mistake at industrial speed: merge two similar names, treat a missing record as proof of absence, or turn an incomplete graph into a confident story.

<figure class="story-scene scroll-story evidence-trail-scene" data-scroll-story data-test-id="editorial-scene">
  <header class="scene-heading"><span class="scene-kicker">Explanatory addition</span><h2>What an evidence trail can—and cannot—carry</h2></header>
  <div class="scroll-story-layout">
    <div class="scroll-story-visual evidence-trail-visual" aria-label="A conceptual trail from public records to a decision outcome, with evidentiary gaps marked explicitly">
      <svg viewBox="0 0 700 470" role="img" aria-labelledby="trail-title trail-description">
        <title id="trail-title">From records to an outcome</title><desc id="trail-description">A conceptual evidence chain: a filing may document a transaction; contact may document access; neither alone proves why a decision occurred.</desc>
        <g class="trail-grid" aria-hidden="true"><path d="M40 90H660M40 190H660M40 290H660M40 390H660" /></g>
        <g data-scroll-layer="0" data-test-id="scroll-layer"><rect x="48" y="52" width="200" height="82" rx="4"/><text x="66" y="82">PUBLIC RECORD</text><text x="66" y="106">filing</text><text x="66" y="122">amendment</text><path d="M248 92H272" class="trail-line"/></g>
        <g data-scroll-layer="1" data-test-id="scroll-layer"><rect x="280" y="152" width="190" height="82" rx="4"/><text x="298" y="182">RELATIONSHIP</text><text x="298" y="206">payment</text><text x="298" y="222">service</text><path d="M375 134V152" class="trail-line"/><path d="M470 193H496" class="trail-line"/></g>
        <g data-scroll-layer="2" data-test-id="scroll-layer"><rect x="504" y="252" width="150" height="82" rx="4"/><text x="522" y="282">CONTACT</text><text x="522" y="306">meeting</text><text x="522" y="322">comment</text><path d="M579 234V252" class="trail-line"/><path d="M579 334V362" class="trail-gap"/></g>
        <g data-scroll-layer="3" data-test-id="scroll-layer"><text x="320" y="350" class="trail-gap-label">causal link requires additional evidence</text><rect x="404" y="368" width="244" height="78" rx="4"/><text x="422" y="398">DECISION /</text><text x="422" y="414">OUTCOME</text><text x="522" y="414">separate evidence</text><text x="522" y="430">needed</text></g>
      </svg>
    </div>
    <div class="scroll-story-steps">
      <section class="scroll-story-step" data-scroll-step="0" data-test-id="scroll-step"><h3>Start with the record</h3><p>A filing can document an entity, date, transaction, or amendment. Reconstructing a source still means reconciling entity types, dates, pass-through organizations, and different disclosure regimes.</p></section>
      <section class="scroll-story-step" data-scroll-step="1" data-test-id="scroll-step"><h3>Keep mechanisms separate</h3><p>Payment, research, lobbying, technical consultation, and hospitality can each establish different facts. A client may pay for process knowledge, expertise, or a relationship; their coexistence is not one claim.</p></section>
      <section class="scroll-story-step" data-scroll-step="2" data-test-id="scroll-step"><h3>Contact is evidence of access</h3><p>A meeting or submission can show an opportunity to be heard, and a technical study can document a position. Neither establishes which alternatives a decision-maker considered or what changed because of it.</p></section>
      <section class="scroll-story-step" data-scroll-step="3" data-test-id="scroll-step"><h3>Prove the outcome separately</h3><p>Causal influence needs its own dated chain. Keeping the gap visible makes room for further records without turning an incomplete graph into a confident story.</p></section>
    </div>
  </div>
  <figcaption>Conceptual provenance trail. It separates public records, relationships, access, and causal evidence; it does not depict a particular actor or outcome.</figcaption>
  <details class="evidence-notes" data-test-id="missing-evidence-notes"><summary>Open the missing-evidence notes</summary><p>Missing records can result from different disclosure rules, incomplete reconstruction, unavailable records, or an unresolved question. A gap is a prompt for further evidence, not proof of absence or causation.</p></details>
</figure>

## What the lobbying evidence actually measures

Bertrand, Bombardini, and Trebbi studied federal lobbying using data from 1999 through 2008. Their analysis distinguishes issue expertise from connections to politicians. They find that connected lobbyists can follow politicians into new issue areas when committee assignments change, and that connections carry a substantial premium in their data. The result concerns a historical market for lobbying services. It does not establish that a particular law was purchased or that the same magnitude applies to every later period. [S141]

The finding matters because it identifies more than one thing a client may be buying. Expertise can help explain a technical problem. A relationship can help a message reach someone. Knowledge of process can help determine when and where to present it. A single fee can purchase a mixture of those services.

Access having market value does not mean every conversation changes policy. It means access itself is valuable enough that people pay for it. That deserves more attention than the fiction that only explicit quid pro quo matters.

The Government Accountability Office's June 2026 report provides a separate view of disclosure compliance. For the period it examined, most sampled filers could provide documentation for reported lobbying income and expenses. The report also estimated that 22% of quarterly disclosure reports included lobbyists who did not fully disclose relevant prior federal positions. Its sample and period should remain attached to that estimate; it is not a statement that 22% of all lobbying activity was unlawful. [S140]

The GAO report also describes more than twelve thousand filing referrals over 2016–2025 and their subsequent status. A referral is an administrative event, not a conviction or a finding that the underlying policy outcome was corrupt. Treating those categories accurately makes the transparency problem easier to understand rather than more dramatic. [S140]

Together, the studies illuminate different parts of the machine: relationships have market value, and disclosure systems leave measurable gaps. [S140][S141] Neither finding proves that one named policy was bought. Both make it harder to pretend that money, access, expertise, and public decisions occupy separate worlds.

## Capacity to participate is not evenly distributed

A document being public does not mean the public can use it. Reading a long technical proposal takes time and relevant knowledge. Preparing a detailed response takes more. Sustaining participation for months or years requires staff, money, and institutional memory.

Individuals, researchers, civil-society organizations, smaller firms, and public institutions can provide extraordinary expertise. They still do not enter the process with equal capacity. The cost of participation shapes whose concerns remain present at every round.

Consider a hypothetical technical standard with a short comment period. One organization has a team already working on the issue. Another has to find an expert, obtain the relevant documents, and decide whether the proposal affects it. The same formal opportunity can have different practical value. That difference can shape the record even without any participant being excluded by rule.

The next stage may amplify the difference. A decision-maker sees many detailed comments from participants with existing capacity and fewer from participants for whom the process is costly. The record may accurately reflect the submissions received while incompletely representing the people affected. The gap is between participation and representation, not necessarily between truthful and false comments.

AI may lower the cost of preparing a submission. It may also increase the volume of material that decision-makers must evaluate. Lower production costs do not automatically create more independent evidence. Many generated comments can repeat the same claim. A small number of careful submissions can contain more relevant information than a large number of fluent ones.

This is the same provenance problem encountered in market analysis. Apparent agreement can arise from independent observation or from shared ancestry. An information system that counts documents without tracing their dependence can mistake repetition for corroboration.

## Expertise can inform and constrain

Complex decisions often require knowledge held by the organizations being affected. Engineers know how systems operate. Providers have data about costs and usage. Workers and customers know things that formal models may omit. The challenge is not to choose between expertise and no expertise. It is to understand what each source knows, what it does not know, and which interests shape the account it provides.

An industry participant may accurately explain that a requirement would be difficult to implement under its current architecture. That does not establish that every architecture faces the same difficulty. A customer may accurately describe a harmful experience without knowing which technical process caused it. A researcher may identify an average effect that does not describe every subgroup. Each source can be informative within a boundary.

A useful analysis therefore distinguishes feasibility under current arrangements from feasibility under all possible arrangements. The first is often what an organization can speak to directly. The second is a much broader claim. Moving from one to the other without explanation can narrow the range of alternatives before they have been examined.

The same issue appears in cost estimates. A proposal can create costs for one participant and savings for another. Whether a cost is called large depends on the denominator and time horizon. Whether a change is called efficient depends on which costs and benefits are counted. These are analytical choices that should be visible, not verdicts supplied by the word “expert.”

AI systems could improve this work by comparing assumptions and identifying where different estimates use different boundaries. They could also make a single account more persuasive by presenting its assumptions as background fact. The relevant question is whether the system helps readers inspect the disagreement or merely smooths it into one authoritative answer.

## The feedback between rules and resources

Economic arrangements and public rules interact over time. A rule can change the costs, risks, or opportunities facing an organization. The resulting resources can affect its later capacity to participate in research, consultation, litigation, and public communication. That is a possible feedback structure. Establishing that it operated in a particular case requires dated evidence for each step.

The structure does not require one coordinated plan. Different actors can pursue their own goals and still produce cumulative effects. It also does not imply that every feedback favors the same participants. New entrants can benefit from a change. Public scrutiny can alter a process. A court decision, technical innovation, or change in demand can disrupt an established arrangement.

For this essay, the important point is that the economic environment is not fixed background scenery for AI. It includes rules and institutions that are themselves shaped by human participation. A model deployed within that environment inherits permissions, constraints, incentives, and sources of information. Increasing the model's capability does not make those conditions disappear.

A system used to analyze a proposed rule might be helpful in several distinct ways. It could identify inconsistent definitions, trace effects under specified assumptions, or summarize documented positions. Those tasks support a person's judgment. A system that silently selects which interests matter or treats one disputed objective as self-evident is performing a different role.

The distinction is especially important when an AI system is used by several sides of a process. The presence of similar technology does not imply equal capacity. Access to data, staff, integration, compute, and time can still differ. At the same time, a lower-cost tool can create opportunities for participants who previously lacked specialized support. Which effect is larger is an empirical question, not a fact determined by the label “AI.”

## What this machinery means for AI

The evidence here does not require a cartoon in which money mechanically buys every outcome. Legal channels let resources fund political communication and lobbying. Disclosure rules differ across entities and filings. Historical research finds market value in connections as well as expertise. A recent compliance review finds substantial documentation alongside specific reporting gaps. [S138][S139][S140][S141]

They do show why the relationship between intelligence and institutional power deserves more attention than a simple count of who can access a chatbot. A person may have access to a model while lacking the records, time, or authority needed to use its analysis effectively. An organization may have the same model embedded in a continuing process with specialized staff and proprietary information. Access to a tool is one input into capacity, not the entire capacity.

The relevant question is what the tool changes in that relationship. Does it make the provenance of a claim easier to inspect? Does it help compare effects on different groups? Does it reveal assumptions that would otherwise remain hidden? Or does it mainly increase the speed and volume with which an existing participant can advance its account?

That is exactly why AI capability does not arrive on a level field. A powerful model can faithfully serve the task it is given while massively increasing the speed, reach, and polish of whichever institution already has the data, staff, access, and authority to put it to work.

The next difficulty is cultural. Even when a person has good reason to be concerned about their circumstances, identifying the causes can be hard. The explanations that travel most easily through an attention market are not necessarily the explanations that preserve the most important distinctions.
