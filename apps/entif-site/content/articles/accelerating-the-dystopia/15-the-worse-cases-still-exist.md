---
{
  'id': 'entif.essay.etr-2026-07.15',
  'slug': '15-the-worse-cases-still-exist',
  'title': 'The Worse Cases Still Exist',
  'description': 'Section 15 of Accelerating the Dystopia: Why Artificial Intelligence Cannot Save a System We Refuse to Fix. The Worse Cases Still Exist.',
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
      'https://drive.google.com/file/d/1U-RyeYZvifrxVn3upTaiOoW0daHKpVN6/view?usp=drivesdk',
    ],
  'series': { 'id': 'accelerating-the-dystopia', 'order': 15 },
}
---

My thesis does not depend on "if we build it, everyone dies."

I am more concerned, in this essay, with controllable AI accelerating a bad social substrate. That does not make loss-of-control research silly. It means the risk tree has more than one branch, and pruning one does not make the others disappear.

The February 2026 International AI Safety Report describes a class of future risks in which systems develop combinations of capabilities relevant to evading oversight, executing long-horizon plans, deceiving operators, acquiring resources, resisting countermeasures, or autonomously reproducing. At that assessment date, it said systems showed early signs of some relevant capabilities but were not yet at levels sufficient to produce the loss-of-control scenarios it defined. It also emphasizes substantial expert disagreement about the probability of future scenarios. [S173]

We do not know whether those scenarios will happen. "We do not know" is not the same sentence as "there is no risk," especially when the downside under discussion is enormous. Uncertainty cuts against certainty in both directions.

The conceptual mechanism also does not require consciousness. A system optimizing an objective can learn that retaining access, avoiding interruption, or preserving resources improves its ability to achieve that objective. Formal work on power-seeking shows such tendencies can emerge for classes of decision problems under specific assumptions. [S171] Critiques of the stronger universal inference matter here too: the formal results do not prove that every sufficiently capable system seeks power in every environment. [S172]

I do not need universal inevitability for the risk to belong on the board. A failure mode does not have to be destiny before it deserves engineering attention.

What makes this branch increasingly relevant to the rest of the essay is the acceleration loop. AI systems are beginning to contribute materially to AI research and engineering. [S175]-[S178] The faster capability development becomes, the shorter the interval in which safety engineering, governance, monitoring, and democratic institutions can respond.

So I do not present "best-case dystopia" as an alternative to catastrophic AI safety.

I present it as a second axis. One problem does not wait politely for the other to be solved.

One axis asks:

> Can we retain meaningful control over systems more capable than us in important domains?

The other asks:

> What will the humans and institutions controlling them do with that capability?

We can fail either axis.

A technically misaligned system can be catastrophic.

A technically aligned system serving structurally harmful goals can produce a slower, more familiar, legally normalized catastrophe: no robot rebellion, no cinematic rupture, just increasingly capable machinery enforcing objectives whose costs were always somebody else's problem.

The first resembles loss of control.

The second resembles perfect control by the wrong objective functions. Different failure. Same word, catastrophe, can conceal the distinction.

The two questions cannot substitute for one another.

## Three failures that should not share one label

It helps to separate an incorrect specification, a learned objective that does not generalize as intended, and an authorized objective that produces an unacceptable social outcome.

In specification gaming, the system finds a way to satisfy the written reward while defeating the designer's purpose. The familiar structure is a gap between the proxy and the task. Goal misgeneralization is different: a learned system can perform well during training yet pursue the wrong goal in a new setting even when the training specification was correct. Shah and colleagues demonstrate examples and distinguish them from the earlier specification problem. [S169] [S170]

The third case is the main subject of this essay. The system pursues the intended objective, and the objective itself leaves out an affected person's interest. Better alignment to that objective would not fix the omission. It could make the omission more consistently consequential.

These categories can overlap in a deployed system, but they call for different diagnoses. Revising a reward may help the first. Better robustness may help the second. The third requires examining the purpose and authority of the deployment, not only the model's fidelity to it.

Treating every harmful outcome as misalignment obscures that difference. It can make an organizational decision look like a technical defect and encourage a technical repair that leaves the decision intact. Sometimes the model is not failing to follow the policy. The policy is the thing that needs to be challenged. Conversely, treating every failure as a problem of the institution can obscure a real engineering hazard. The distinction keeps both responsibilities visible.

## Capability, propensity, and opportunity

A system's ability to perform an action does not establish that it will do so. A behavior observed in a specially constructed test does not establish its frequency in ordinary use. A harmful tendency may have little effect without relevant access, or a much larger effect when the system controls a consequential workflow.

The International AI Safety Report separates these questions in its February 2026 assessment. It considers relevant capabilities, the propensity to use them harmfully, and deployment conditions that provide opportunity. That assessment is a dated baseline, not a claim that every later model has been evaluated or that a future outcome is known. [S173]

This is a reason to describe evidence carefully, not to dismiss it. A laboratory demonstration can identify a mechanism worth investigating. A deployment incident can reveal a failure that a benchmark missed. Neither supplies a population rate without a suitable denominator. Severity does not manufacture prevalence. A collection of dramatic examples may be important while remaining unsuitable for estimating how often the behavior occurs.

The same discipline applied earlier to corporate fraud and platform effects belongs here. We should not demand certainty before noticing a possible severe failure. We should not manufacture certainty because the failure would be severe. The consequence and the probability are separate parts of the analysis.

Formal power-seeking results also have assumptions. They concern classes of environments, rewards, and optimal policies; they do not establish that every capable language model will seek control. Thorstad's 2026 critique directly challenges the stronger inference from those arguments to a general prediction of existential danger. Including that challenge does not settle the whole risk question. It limits what that particular argument can support. [S171] [S172]

## The two axes can interact

Control and social purpose are separate questions, but their failure modes can reinforce one another. An institution under pressure to increase throughput may give an agent broader permissions. A workflow that hides responsibility may make it harder to identify who can stop an operation. A service that has become difficult to replace may be harder to suspend when a serious fault appears.

Those are conditional links, not evidence that loss of control has already occurred. They show why organizational design belongs in the safety picture. Permissions, records, recovery paths, and authority to intervene are parts of the deployed system, not decorative additions to the model.

The reverse interaction is possible too. A narrow focus on preventing unauthorized actions can leave authorized harms unexamined. A system might pass a stringent test of obedience while carrying out a policy or contract whose effects remain disputed. The test has answered a real question. It has not answered every question.

I therefore do not place these concerns in a competition for seriousness. The possibility of severe technical failure does not make present distributional and institutional questions trivial. The importance of those present questions does not make future control research unnecessary.

The central distinction survives: retaining control is valuable, and retaining control does not tell us whether the controlled activity improves people's lives. A machine does not need consciousness for either problem to arise. Optimization is enough. Access is enough. Authority is enough. A bad objective pursued extremely well is still a bad outcome. Obedience is not a moral warranty.
