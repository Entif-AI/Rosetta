# Genesis Research and Interoperability Companion

**Status:** Proposed companion to Genesis 0.4-draft  
**Primary semantic authority:** Rosetta v3.0.0 Core Spine Specification  
**Purpose:** Rosetta CLI/SDK/reference-implementation posture, clone-to-insight, collaboration signals, interoperability experiments, and research-driven roadmap pressure

## 1. Implementation is a research instrument

Rosetta's CLI, SDKs, schemas, validators, fixtures, conformance vectors, and reference workflows are not packaging after the theory. They are part of how the theory is tested.

The desired loop is:

```text
research idea
  -> smallest faithful Rosetta representation
  -> executable artifact or experiment
  -> inspect / validate / exchange
  -> collaborator or independent system contact
  -> friction / failure / translation loss / useful result
  -> specification or implementation correction
  -> small release
  -> repeat
```

This loop does not replace the normative Rosetta meaning pipeline or operational Spine. It describes how research should interact with implementation.

## 2. Optimize for clone-to-insight

A capable external researcher should be able to reach a meaningful Rosetta result quickly from a clean environment.

Clone-to-insight is not merely install success. It means the researcher can:

1. clone/install;
2. run one honest bounded example;
3. inspect emitted Rosetta artifacts;
4. trace provenance and relationships;
5. verify a meaningful property;
6. deliberately alter/tamper with something;
7. observe an intelligible failure;
8. understand enough to formulate a useful question or challenge.

Reduce hidden credentials, irrelevant setup, undocumented assumptions, and unrelated infrastructure on this path.

## 3. Workbench qualities

The researcher workbench SHOULD favor:

- JSON-in/JSON-out where appropriate;
- deterministic commands where possible;
- stable schema identifiers;
- inspectable intermediate artifacts;
- positive fixtures;
- negative/adversarial fixtures;
- explicit provenance;
- explicit uncertainty;
- explicit translation loss;
- machine-readable errors;
- human-repairable error explanations;
- composable commands;
- minimal setup;
- examples whose failure modes are educational.

Do not implement commands solely because they look good in a README. The command surface should emerge from real implemented behavior and current research needs.

## 4. CLI philosophy

The CLI should make invisible protocol structure visible.

High-value command families may include, as the implementation genuinely supports them:

- inspect;
- validate;
- verify;
- lineage/provenance exploration;
- conversion/export/import through accepted mappings;
- fixture execution;
- conformance checks;
- explanation of failures.

Naming must follow Rosetta v3 semantics and existing repository conventions.

A command named `receipt`, `profile`, `conjecture`, `tapestry`, or another Terminology-Locked concept MUST match the canonical meaning rather than borrowing the word for convenience.

## 5. SDK philosophy

The SDK should expose interoperable primitives rather than force adoption of an entire application architecture.

Prefer:

- canonical schemas/contracts;
- deterministic utilities;
- small composable functions;
- adapters at boundaries;
- generated types/clients where useful;
- conformance fixtures shared across languages;
- minimal semantic duplication.

A user should be able to graft Rosetta primitives into an existing research system without first replacing the system's entire stack.

## 6. Canonical implementation lane and Python access

The current repository uses TypeScript, Nx, and pnpm as the canonical implementation lane.

Research collaborators often work in Python notebooks and ML ecosystems. Python access SHOULD be easy, but ease of access MUST NOT create a second independently evolving Rosetta constitution.

Prefer:

- generated bindings;
- thin adapters;
- CLI/subprocess integration where sufficient;
- shared JSON Schemas/conformance vectors;
- notebooks that consume canonical artifacts;
- specialist Python components that exchange Rosetta-defined data rather than redefine it.

If a Python implementation becomes independently conformant, treat that as a deliberate interoperability milestone with its own conformance evidence.

## 7. Reference implementation versus specification

The reference implementation is evidence about the specification, not the source of semantic truth when it diverges from the normative Core Spine.

If code and v3 conflict:

- do not silently redefine the spec by implementation;
- determine whether the code is wrong, the spec needs governed revision, or the implementation is using an accepted extension;
- preserve the discrepancy until it is explicitly resolved.

Tests should help detect such drift.

## 8. Researcher contact as an adversarial environment

Different researchers bring different conceptual systems and failure modes.

Useful contact may come from work in:

- mechanistic interpretability;
- formal reasoning;
- agent evaluation;
- memory;
- model editing;
- representation learning;
- world models;
- alignment;
- uncertainty;
- provenance;
- knowledge graphs;
- multimodal systems;
- distributed systems;
- human-AI collaboration.

Each external system is an opportunity to discover whether Rosetta's abstractions actually travel.

## 9. Collaboration pressure signals

A substantive collaboration may reveal:

- missing primitive;
- ambiguous contract;
- representation mismatch;
- translation loss;
- absent query/tool;
- rights or identity conflict;
- falsification case;
- incompatible evidence model;
- reusable fixture;
- reusable adapter;
- independent conformance opportunity.

Map a signal to existing work before creating new architecture.

Repeated independent signals increase priority.

A small change that unlocks a real external experiment has unusually high leverage.

Popularity does not transfer semantic authority. External pressure informs the roadmap; it does not bypass Rosetta v3.

## 10. Collaboration record

Maintain a lightweight research collaboration record when useful. Suggested fields:

- collaborator/project;
- rights/disclosure posture;
- relevant Rosetta area;
- observed pressure signal;
- linked existing issue/experiment;
- smallest executable response;
- current status;
- next contact/decision.

This is project documentation, not a Rosetta Receipt, Profile, or protocol artifact unless separately represented through canonical Rosetta semantics.

## 11. Interoperability experiment

A useful experiment asks whether meaning survives contact with a foreign representation.

Record:

- foreign system/version;
- research question;
- semantics that must survive;
- proposed mapping;
- expected/known loss;
- fixtures;
- acceptance criteria;
- falsification criteria;
- observed result;
- translation loss;
- unresolved mismatch;
- follow-up issue/decision.

This is an experiment-record template, not a new Rosetta Tile schema.

If the experiment is represented natively in Rosetta, use v3 artifacts and accepted extensions.

## 12. Earned universality

Rosetta cannot establish a lingua franca by successfully representing only Rosetta's own concepts.

The stronger evidence comes from foreign systems that differ in:

- ontology;
- granularity;
- uncertainty model;
- causal assumptions;
- identity model;
- provenance model;
- temporal semantics;
- operational constraints;
- domain vocabulary.

Translation loss is evidence, not embarrassment.

Rosetta SHOULD preserve unresolved incompatibility rather than flatten it into a falsely universal term.

Claims of universality remain hypotheses until diverse independent systems exchange the relevant meaning with bounded, inspectable loss.

## 13. Pressure-test through attempted falsification

Do not design interoperability experiments only to showcase success.

Useful negative questions include:

- Which source distinctions cannot survive the mapping?
- Where do two systems use one word for different concepts?
- Where do they use different words for the same concept?
- Which uncertainties are flattened?
- Which identity semantics cannot be reconciled?
- Which provenance edges become unverifiable?
- Which rights constraints cannot be preserved?
- Which transformation is irreversible?
- Can the receiving system detect the loss?

A failure that identifies a real semantic boundary may be more valuable than a superficial successful demo.

## 14. Demo Green versus Rung Green

Frequent bounded demos are desirable.

**Demo Green** means a bounded path works and can be independently reproduced under stated conditions.

**Rung Green** means every declared capability/assurance/documentation/conformance gate for the maturity rung has passed.

A demo should be easy to run without exaggerating what it proves.

## 15. Small frequent releases

Prefer small evidence-bearing releases such as:

- new deterministic inspection capability;
- new conformance vector;
- new negative fixture;
- new accepted mapping;
- improved error explanation;
- small adapter used by a collaborator;
- specification clarification surfaced by an experiment.

A release does not need to be grand to be scientifically valuable.

Small releases improve:

- review depth;
- regression isolation;
- collaborator feedback speed;
- attribution of outcomes;
- rollback;
- learning frequency.

## 16. Roadmap pressure from experiments

The large backlog is a reservoir of researched possible moves.

Experiments and collaborators help reveal which move matters now.

Prioritize especially when:

- multiple independent researchers hit the same missing seam;
- a small implementation change unlocks a real external test;
- the next Rosetta maturity claim is blocked;
- a semantic mismatch threatens interoperability;
- a safety/provenance flaw is exposed;
- a current concept is shown to be redundant with a better existing standard.

Do not automatically prioritize a feature merely because a prestigious collaborator requests it.

## 17. External research source handling

Research papers, repos, correspondence, datasets, and artifacts have different rights/provenance properties.

Preserve:

- source identity;
- version/date;
- publication/access rights;
- whether an observation came from public material or private correspondence;
- whether the collaborator authorized citation/publication;
- whether multiple sources are independent.

An enthusiastic reply is evidence of interest. It is not experimental confirmation of Rosetta's claims.

## 18. Research outputs should be inspectable

When possible, publish or preserve:

- fixtures;
- commands;
- expected outputs;
- environment/version;
- loss/mismatch notes;
- conformance results;
- negative results;
- linked specification sections;
- issue/PR that changed as a result.

The result should permit another capable person to disagree with evidence rather than with a summary.

## 19. Research stop conditions

Experiments should have stopping conditions.

Stop, narrow, or pivot when:

- the question is already answered sufficiently for the next decision;
- additional precision will not change action;
- cost exceeds expected information gain;
- the experiment is testing too many assumptions simultaneously;
- upstream terminology/authority is unresolved;
- rights or security constraints make the experiment unsafe;
- a smaller experiment can answer the same question.

## 20. Research maxim

> **Rosetta should evolve through contact, not declaration.**

The protocol earns confidence when its semantics survive independent implementation, foreign ontologies, real collaboration, deliberate tampering, and useful failure.
