---
{
  'id': 'entif.essay.etr-2026-07.11',
  'slug': '11-the-past-inside-the-model',
  'title': 'The Past Inside the Model',
  'description': 'Section 11 of Accelerating the Dystopia: Why Artificial Intelligence Cannot Save a System We Refuse to Fix. The Past Inside the Model.',
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
      'https://drive.google.com/file/d/1vugs792D-x5bucxKdj7b64J9Ddta2M1J/view?usp=drivesdk',
    ],
  'series': { 'id': 'accelerating-the-dystopia', 'order': 11 },
}
---

People sometimes talk about AI bias as if the problem were a list of naughty stereotypes somebody forgot to delete.

That framing is far too small.

A model trained on the record of human civilization learns the record of human civilization. We do not get to pour the whole archive of ourselves into a machine and then act surprised when the archive comes back with our fingerprints all over it.

That includes brilliance, love, science, art, humor, cooperation, invention, and moral progress.

It also includes slavery, colonialism, segregation, exclusion, occupational stratification, misogyny, poverty, religious persecution, ableism, conquest, pseudoscience, propaganda, discriminatory policing, unequal access to education, unequal documentation, and the simple fact that powerful groups produce more text about themselves than marginalized people often do.

Bias is therefore not only in what people said.

It is in what got recorded, what never got recorded, who had the authority to name the categories, and which parts of human experience were rendered legible to the institutions doing the recording.

Who got named.

Who got measured.

Who appeared in the benchmark.

Who had the camera pointed at them.

Which language received millions of pages of high-quality text.

Which occupation was associated with which gender.

Which names occurred frequently enough to receive rich representations.

Which dialects were treated as standard.

Which people appeared mainly in records created by institutions that controlled them.

Caliskan, Bryson, and Narayanan demonstrated that distributional representations learned from ordinary web language reproduce human-like historical associations. [S157] Buolamwini and Gebru's Gender Shades audit showed large intersectional accuracy disparities in commercial gender-classification systems, with particularly high errors for darker-skinned women and skewed benchmark representation. [S156] NIST's bias framework accordingly treats AI bias as socio-technical, dividing it into systemic, statistical/computational, and human categories rather than pretending bias begins with an explicitly hateful programmer. [S158]

This distinction matters politically and morally because intention is an unreliable gatekeeper for harm. Intent is a terrible checksum for harm.

A mortgage model does not need racism in its source code to reproduce disparities if the proxies and historical outcomes in its data encode segregated opportunity.

A hiring model does not need misogyny in a rule if the historical examples of "successful" employees came from a workforce shaped by unequal access.

A language model does not need a slur filter failure to treat a minority name differently if the name is rarer, appears in narrower contexts, or is represented by a less efficient tokenization pattern.

Wolfe and Caliskan found minority names were less frequent in studied corpora and connected lower frequency with less favorable associations in contextual representations. [S159]

Tokenization makes the issue more technical.

For the text input of a language model, tokenization supplies encoded units; contextual representations are then learned and computed from them. Tokenization is an input interface, not a complete account of understanding. The tokenizer gets a say before the model gets a thought. The segmentation procedure decides which character sequences become common atomic units, which are split repeatedly, and how long a string becomes in model input. Those choices affect context length, optimization, frequency, and the pathways through which representations are learned.

Recent work on African languages reports a persistent "token tax": languages requiring more tokens for comparable content tend to show lower model accuracy across evaluated systems. [S160] Other research shows subword tokenization remains sensitive to small perturbations such as typos and formatting [S161], and that common tokenization methods can create sampling biases that do not automatically disappear merely by adding more training. [S162]

This is where my Rosetta research question enters.

I am interested in whether ambiguity in a shared surface form can create representational leakage between senses that humans regard as semantically distinct. The word "bank" can refer to a financial institution or the side of a river. Humans treat those as different concepts. A tokenizer may share surface units across both contexts, while a Transformer develops contextual representations downstream. Shared surface form therefore does not prove shared meaning. It gives me a mechanism worth testing.

My hypothesis is that some of the distinctions humans care about may be cheaper to preserve if they are made explicit before information begins moving through a stack of learned representations. The adjective semantic does not exempt the hypothesis from experiment. The only responsible way to find out is to test it causally.

Construct controlled corpora containing ambiguous surface forms with distinct senses.

Separate direct stereotype exposure from possible indirect cross-sense contamination.

Compare baseline models to systems receiving explicit sense or concept information.

Use random IDs and corrupted semantic labels as controls.

Measure leakage, bias, uncertainty, and wrong-sense generation.

Ask whether improving semantic separation helps.

Also ask whether it makes the model more confidently wrong when the concept layer is wrong.

That last control is philosophically important.

Interpretability and explicit semantics are not magic. Naming a thing is not the same as fixing it.

A wrong ontology can be worse than no ontology if the system trusts it.

A mislabeled concept can become a high-bandwidth error channel.

A human taxonomy can encode the same prejudice or mistaken assumptions as the training data it was meant to correct.

That is the point of Rosetta in this essay. It is not a magic cure for bias. It is an attempt to preserve observations, distinguish interpretations, represent uncertainty, keep candidate meanings separate, and then test whether those distinctions actually change behavior.

The larger AI concern is not dependent on the outcome of that experiment.

If we discover that even simple lexical distinctions can interact in ways our conceptual categories did not predict, then what about the vastly larger internal representational geometry of frontier models?

Humans name a tiny fraction of the features a model uses.

The model does not owe us categories that match our dictionary.

That brings the question of representation into view.

## When the label is the problem

One of the clearest examples of this distinction comes from health care. Obermeyer and colleagues examined an algorithm used to identify patients for additional care. It predicted health spending as a proxy for health need. In the studied setting, unequal spending meant that equally scored Black patients were, on average, sicker than white patients. The problem was not solved by noting that the program predicted its chosen label well. The label itself failed to represent the intended need equally. [S204]

That example deserves more attention than a generic instruction to remove bias from the data. Spending is an observable event. Need is a harder concept. Replacing one with the other makes the problem easier to calculate while changing what success means. The spreadsheet got cleaner. The question changed. Better prediction of spending can then improve the wrong answer to the original question.

The lesson is not that cost information has no legitimate use. It is that a variable appropriate for one purpose can be an inadequate substitute for another. Forecasting a budget and identifying people who need care are related tasks, not identical tasks. A system can be accurate at the first and inequitable at the second without a numerical malfunction.

This is why I resist treating social harm as a residue left over after the engineering is complete. The decision about what to predict is part of the engineering. So is the decision about whose outcomes are recorded, when the record ends, and what counts as success. A model learns inside those choices.

A similar issue arises whenever an institution uses its own history as the definition of merit. Suppose a firm trains a hypothetical hiring model to predict which employees its managers previously promoted. The model may learn the pattern faithfully. But past promotion is not identical to ability, contribution, or future potential. It includes the opportunities people were given, the work their supervisors noticed, and the criteria the firm rewarded. Calling the target success does not make these distinctions disappear.

Removing names from the input would not necessarily remove the problem. Other variables can carry information about the same history. Nor would replacing the model with a human automatically fix it. The point is to inspect the relationship between the measured outcome and the purpose that justified measuring it.

NIST's account is useful precisely because it locates bias across the system rather than only in a model's parameters. Its categories include systemic, human, and statistical or computational sources. That wider frame makes room for both a defective measurement and a well-measured but poorly chosen target. [S158]

## The archive has an author, even when no one signed it

A training collection is not a transparent window onto everything that happened. An archive is built, not discovered. It is a record assembled through decisions about access, language, format, and relevance. Its absences can matter as much as its entries.

Consider a hypothetical archive of customer disputes. It includes all completed forms but excludes people who abandoned the form, could not understand it, or never learned that an appeal existed. A model trained to explain common disputes will encounter a selected population. If it later helps redesign the process around those cases, the excluded people may remain absent from the next archive as well.

This is a selection problem before it is a language problem. Better semantic representation can help distinguish what an entry means. It cannot, by itself, recover the experiences that never entered the system. That is one reason my Rosetta work must remain a branch of this argument rather than its promised solution.

The same limit applies to polished descriptions. A model may become very good at expressing a complaint in the institution's accepted vocabulary. That can be genuinely useful to the person complaining. Yet a system that only recognizes needs when they appear in its preferred categories still imposes the cost of translation on the person whose life does not fit them.

There is a practical difference between helping someone translate and treating the translation as the whole truth. The first opens a channel. The second can erase what the channel cannot carry. A faithful record needs some way to preserve the original account, the interpretation applied to it, and the uncertainty introduced by that interpretation.

That principle is familiar in careful research. It becomes harder to maintain when a workflow rewards a single clean label. An ambiguous account takes more time to review. A confident category is easier to route. Ambiguity is expensive; dropdowns are cheap. If the latter receives the operational reward, uncertainty can vanish without anyone resolving it.

## What explicit senses would actually test

The Rosetta proposal asks a narrower question than whether a machine understands humanity. It asks whether making selected distinctions explicit can improve behavior under controlled conditions.

Take bank again. In a sentence about depositing a check, a contextual model can already infer the financial sense. In a sentence about erosion, it can infer the river sense. Sharing an input token does not mean the later hidden representations are identical. Any useful experiment must respect that. Otherwise it merely demonstrates a weakness of an oversimplified story about tokenization, not a weakness of the model.

The interesting test is what happens when we control exposure. We can create a small world in which two senses share a surface form but differ in their properties. We can expose the model to a property in one sense and ask whether it transfers that property to the other without justification. We can then compare ordinary text against explicit sense identifiers while keeping the rest of the training conditions as comparable as possible.

The controls determine what an improvement would mean. This is where the favorite explanation gets frisked at the door. A system given extra identifiers has extra representational capacity and extra information. It may improve for those reasons alone. Frequency-matched arbitrary identifiers help test the capacity explanation. A simpler lemma-and-part-of-speech condition helps separate basic linguistic disambiguation from a richer semantic intervention. An oracle condition with correct senses establishes an upper bound that a real compiler may never reach. A predicted-sense condition tests the less comfortable world in which the labels can be wrong.

These are different questions. If arbitrary separation performs as well as meaningful labels, the result would support separation or capacity, not the special value of the ontology. If gold labels help but predicted labels fail, the bottleneck may be reliable disambiguation. If corrupt labels make the system more confidently wrong, the semantic layer has introduced a new failure channel. A result can be useful while defeating the preferred explanation.

I am not reporting that result here. I am stating the hypothesis and the experiment I think would discriminate among the plausible explanations.

The distinction matters because a convincing vocabulary can otherwise become its own evidence. Nouns can impersonate mechanisms. Terms such as concept, meaning, sense, and ontology sound explanatory. They can also hide disagreement over what has actually been implemented. A token tagged with a human-readable name is not proof that the model has acquired the corresponding human concept. A cluster in a visualization is not proof that the cluster controls the decision of interest.

A causal test asks what changes when the proposed mechanism changes and relevant alternatives are held steady. A descriptive test asks what can be detected in the representation. Both can be valuable. Neither should silently inherit the authority of the other.

## A confident error is still an error

An explicit ontology must decide where one category ends and another begins. Some boundaries are stable enough for the task. Others are disputed, context-sensitive, or simply not yet known. A useful semantic system needs a way to retain those differences instead of forcing all of them into one kind of certainty.

Imagine a document that uses the word safe. It might mean physically unlikely to cause injury, legally permitted, financially low-risk, or unlikely to trigger an automated refusal. Treating these as interchangeable could make a system say something absurd with impeccable grammatical confidence. A product can be permitted but physically risky. A financial position can be low-risk in one sense and expose a household to a loss it cannot bear in another. A tool's approval is not a general certificate of harmlessness.

An explicit representation could help by keeping these senses apart. It could also hurt by assigning the wrong sense too early and then allowing downstream systems to treat that assignment as settled. The point is not to eliminate interpretation. It is to keep interpretation revisable and attached to the evidence that supports it.

This has an institutional analogue. A complaint can become a conduct issue, a conduct issue can become a risk flag, and a risk flag can become a reason for exclusion. Each step may look like ordinary record management. Bureaucracy is very good at making transformations look like filing. Yet the original uncertainty can be lost as the description travels. Adding machine speed makes the chain faster; it does not make the successive labels equivalent.

A semantic record that preserves the distinction between reported, inferred, disputed, and verified would make that chain easier to inspect. It would not decide whether the institution is using the chain fairly. Representation can expose a decision without legitimizing it.

That is the strongest claim I am prepared to make for this branch. Better distinctions may reduce avoidable confusion and make some failures testable. They do not remove conflicting interests, supply missing testimony, or choose a just objective. Even a flawlessly disambiguated instruction can direct the system toward an outcome I consider cruel.

The practical value is still substantial. When a system cannot tell a source's allegation from an established finding, or a past permission from a current one, its power exceeds its ability to preserve the conditions under which that power was granted. Keeping those states distinct is not decorative metadata. It is part of keeping action connected to meaning.

## Language cost is not language worth

The tokenization findings add another caution. A language that requires more tokens for comparable content can consume more of a fixed context or inference budget. That is an engineering burden, not a judgment about the language or its speakers. The AfricaNLP study reports an association between higher token fertility and lower accuracy across its evaluated models and languages; the association alone does not isolate tokenization from differences in data, training, and linguistic resources. [S160]

This distinction is easy to lose in deployment. A system may look efficient on the language that dominates its testing and become more expensive or less reliable elsewhere. A global average can hide that difference. A user then bears an extra cost for communicating naturally, even though the limitation belongs to the tool.

The appropriate comparison follows the task and the population. How much information fits in the available context? Does the system preserve the same distinctions? Does it become less certain when evidence is thin? Can a person challenge the output in the language in which they understand the underlying problem? These questions are more informative than treating one aggregate benchmark as a certificate of universal competence.

The past enters the model through language, records, objectives, labels, and the terms of evaluation. A surface-level cleanup cannot reach all those channels. The stain is not only on the surface. A technical intervention can address one channel without claiming to address them all. That is not a reason to abandon the intervention. It is a reason to keep its actual contribution visible.

The deeper question remains: once information is represented in forms we did not explicitly name, how do we determine what the machine is carrying from one task, person, or institution to another?
