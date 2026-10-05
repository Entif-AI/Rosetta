---
id: entif.project.bilqis
slug: bilqis
title: Bilqis
kind: project
status: published
published: 2026-09-12
authors:
  - Entif AI
description: Bilqis is Entif AI's experimental research program for testing whether explicit semantic structure can reduce the cost of relational and compositional learning.
tags:
  - semantic-representation
  - machine-learning
  - compositional-generalization
  - curriculum-learning
  - representation-learning
  - ternary-training
projects:
  - bilqis
related:
  - entif.research.prepaying-semantics
sourceRefs:
  - ETR-2026-05 Prepaying Semantics v0.5.0
  - Official New Ithkuil grammar and lexicon
featured: true
noindex: false
---

## A semantic substrate for developmental learning

Bilqis is an experimental representation and training research program exploring whether a learner can acquire relational and compositional competence more efficiently when important semantic distinctions are made explicit before they must be reconstructed from ordinary language.

The project draws selectively from the unusually rich grammatical architecture of New Ithkuil, treating parts of that architecture as a source of candidate semantic factors rather than as a language that a neural network must simply learn to speak.

The central question is empirical: **can structured semantic representations reduce the data, parameter, compute, or developmental cost required to acquire reusable cognitive operations?**

## Why the name Bilqis?

The name intentionally gives the machine-representation program an identity separate from its linguistic donor.

**Bilqis** is the name used in later Islamic exegetical and literary tradition for the ruler commonly recognized as the Queen of Sheba. The Hebrew Bible does not give the Queen of Sheba a personal name; the New Testament remembers a "Queen of the South"; Ethiopian tradition preserves **Makeda**. These are not one interchangeable textual tradition, and the project does not pretend otherwise. What makes the naming useful is precisely the opposite: multiple lexical and cultural surfaces converge on a recognizable referent while retaining their own provenance.

That is a compact example of the semantic problem Entif keeps returning to. A stable identity can survive multiple representations without requiring the representations themselves to become identical.

The narrative association is apt in another way. The Queen of Sheba is remembered for testing Solomon's wisdom with difficult questions. In the Qur'anic account of the ruler of Sheba, communication, counsel, signs, a transported throne, and an initially misperceived glass surface all make interpretation consequential. The Qur'an itself does **not** name her Bilqis; that name comes through later tradition. The project borrows the mnemonic, not religious authority or scientific evidence.

Bilqis therefore points toward what the research program is actually trying to test: not whether a model can imitate the surface of Ithkuil, but whether cognition develops differently when identity, relation, scope, evidence, composition, and prerequisite structure are made easier to distinguish.

## What Bilqis tests

Bilqis investigates several connected hypotheses:

- **Explicit semantic factors:** whether making distinctions such as configuration, relation, purpose, composition, evidence, scope, and other structured properties directly observable can improve learning efficiency.
- **Compositional reuse:** whether previously acquired semantic primitives lower the marginal cost of learning later concepts that depend on them.
- **Developmental ordering:** whether measurable prerequisite relationships can be used to construct curricula that outperform flat or arbitrarily ordered training.
- **Representation efficiency:** whether two lossless encodings of the same underlying world can differ substantially in how easily a bounded learner can recover useful functions from them.
- **Transfer:** whether semantic structure learned in one representation remains useful when later tasks, surface forms, generators, or domains change.
- **Low-precision interaction:** whether explicitly structured representations interact favorably with ternary or other aggressively quantized neural architectures.

These hypotheses are separable. Evidence for generic factorized representation would not by itself establish that Bilqis is uniquely advantageous, and a negative result for one training architecture would not invalidate the broader representation-learning question.

## Why New Ithkuil?

New Ithkuil was designed to encode semantic distinctions with a degree of explicitness, regularity, and compositional structure unusual among natural languages. That makes it scientifically interesting as a donor system for representation design.

Bilqis does not assume that Ithkuil's linguistic categories are automatically optimal for machine learning.

Instead, the project asks which distinctions can be transformed into useful computational primitives, which should be decomposed or normalized, which should remain surface-language phenomena, and which should not be adopted at all.

Grammar therefore precedes lexicon in the research program. The first objective is to identify reusable semantic machinery and dependency structure before attempting broad lexical coverage.

## The semantic reconstruction hypothesis

Two representations can preserve the same information while imposing very different learning problems.

An unrestricted optimal decision rule can recover equivalent information from any lossless invertible encoding. Real neural learners, however, operate under finite parameters, finite data, finite optimization budgets, architectural biases, and limited developmental histories.

Bilqis tests whether some representations effectively **prepay part of the cost of semantic reconstruction** by exposing factors that would otherwise need to be inferred indirectly and repeatedly.

The project calls this possible difference the **semantic reconstruction tax**.

It is not assumed to exist as a literal hidden component inside a model. It is measured through controlled contrasts: how much training resource is required to reach matched competence under different representations?

## From system effect to attribution

The initial Bilqis research program deliberately begins with an integrated systems experiment rather than requiring every component to prove itself independently first.

The experimental system combines:

- a small ternary-forward neural learner;
- Bilqis semantic representations and semantic-aligned initialization in the integrated treatment;
- deterministic synthetic worlds and independent truth-oracle paths;
- prerequisite-aware developmental curricula;
- an adaptive but truth-bounded developmental teacher;
- retention and transfer probes;
- sealed evaluation families;
- reproducible checkpoints and execution lineage.

If the integrated system produces a meaningful effect, subsequent experiments progressively remove, scramble, replace, or isolate its components.

Controls include token renaming, nonseparable factor mixing, matched-example replay, compute matching, generic typed representations, curriculum interventions, generator-family holdouts, initialization controls, precision comparisons, and scale changes.

The goal is not merely to obtain a positive result. It is to discover **why** a result occurs and which parts survive hostile controls.

## A deliberately falsifiable program

Bilqis is designed so that interesting hypotheses can fail independently.

A generic structured representation may equal or outperform Bilqis. Developmental ordering may provide no measurable benefit. Ternary training may contribute nothing. Explicit factors may help only on narrow synthetic tasks. Effects may disappear under compute matching, transfer, scale, or unfamiliar generators.

Those outcomes remain scientifically useful.

Conversely, a result becomes progressively more interesting if an advantage survives controls that preserve information while destroying convenient factor alignment, survives matched resource budgets, transfers to new compositions or representations, and persists beyond the original finite-world task family.

The project therefore treats negative controls and result gradients as part of the research object rather than as post hoc qualifications.

## Current state

The current Stage 2 package includes a revised scientific manuscript, preregistered experiment designs, deterministic world and oracle specifications, a reference training implementation, developmental-teacher machinery, checkpoint and recovery controls, reproducibility requirements, and an initial set of engineering validation tests.

The reference implementation is intentionally small. It is designed to make the first mechanistic experiments cheap, inspectable, repeatable, and difficult to explain away through hidden complexity.

No confirmatory Bilqis learning advantage is claimed by the current publication package. Finite-world engineering tests and tiny smoke runs exercise the machinery; the main integrated trial, independent replication, and later-language transfer remain to be reported as completed.

The next scientific milestone is empirical: execute the integrated trial, preserve the complete result lineage, and allow the observed result to determine which attribution experiments deserve to run next.

## Research publication

The current research paper, **_Prepaying Semantics is Cheaper: Bilqis as a Developmental Substrate for Representation-Efficient Relational and Compositional Learning_**, develops the scientific rationale, falsification program, first systems experiment, and training architecture in detail.

Its purpose is not to report that Bilqis works.

It is to make the proposition precise enough that reality can answer.

[Inspect Bilqis on GitHub](https://github.com/Entif-AI/Bilqis).
