# Genesis Documentation and Publication Companion

**Status:** Proposed companion to Genesis 0.4-draft  
**Purpose:** Documentation architecture, executable examples, writing quality, AI-assisted content, publication, and source/correspondence rights  
**Scope note:** This document governs operating practice. It does not create alternate Rosetta semantic classes for claims, Observations, Conjectures, Evaluations, Epistemes, Receipts, or provenance.

## 1. Documentation is part of the product

A technically sophisticated project is not credible merely because its architecture is sophisticated.

A capable external reader should be able to determine quickly:

- what the project is;
- what problem it addresses;
- what exists today;
- what explicitly does not exist;
- why the work may matter;
- how to run the smallest honest example;
- how to inspect artifacts/results;
- how to verify important claims;
- where governing authorities live;
- how to contribute or challenge safely.

Documentation debt is product debt when it prevents correct use, review, reproduction, or collaboration.

## 2. Documentation as a graph

Documentation SHOULD form a navigable graph of authority and use, not a pile of pages.

Readers should be able to move from:

- purpose -> architecture;
- architecture -> contracts;
- contracts -> implementation;
- implementation -> tests/examples;
- behavior -> decisions/provenance;
- current state -> known limits -> roadmap.

Prefer links to authoritative statements over duplicate prose.

One fact should have one declared authority and as many useful contextual projections as needed.

## 3. Documentation classes

Use Diátaxis where it improves clarity:

- **tutorial** — guided learning experience;
- **how-to** — accomplish a concrete task;
- **reference** — precise machinery/contracts;
- **explanation** — concepts/reasons/trade-offs.

Do not force governance documents, RFCs, incident reports, release notes, research papers, handoffs, or decision records into a Diátaxis quadrant when their job is different.

## 4. Researcher/contributor doorway

The root README SHOULD answer, with minimal wandering:

1. What is Rosetta/Entif?
2. What is actually implemented now?
3. What is fixture-backed or modeled?
4. What is not implemented?
5. What is the smallest runnable demo?
6. What artifacts does it emit?
7. How can those artifacts be inspected/validated?
8. How can a user deliberately break an invariant and observe failure?
9. Where are the core specifications?
10. What is the next honest milestone?
11. How can an external researcher attempt interoperability?

A reader should not need to absorb the full canon before reaching first meaningful contact with the system.

## 5. Package/application README contract

Important packages/apps SHOULD answer a shared question set rather than copy boilerplate:

- purpose/audience;
- current behavior;
- public contracts;
- modeled/fixture-backed behavior;
- explicit non-capabilities;
- examples;
- failure/security/rights assumptions;
- validation commands;
- extension points;
- authoritative specifications;
- next honest milestone.

Documentation should make it difficult to confuse planned architecture with executable reality.

## 6. Executable documentation

Commands/examples SHOULD be runnable and checked in CI where practical.

A copied command that no longer works is a product defect.

Prefer examples that:

- exercise real code;
- show meaningful output;
- expose intermediate artifacts where educational;
- demonstrate failure as well as success;
- avoid hidden credentials when possible;
- name any fixture/demo limitations.

Generated reference documentation SHOULD be reproducible and clearly marked.

Generated output MUST NOT silently overwrite hand-authored authority.

## 7. Maturity language

Documentation MUST distinguish implemented reality from aspiration.

Use the Genesis maturity labels as documentation metadata only, not Rosetta protocol types.

Avoid unsupported uses of:

- done;
- complete;
- production-ready;
- secure;
- compliant;
- autonomous;
- verified;
- interoperable.

Name scope/evidence.

“Demo-proven” is not “production-hardened.”

## 8. Rosetta semantic language in documentation

When describing Rosetta artifacts, inherit Rosetta v3 terminology exactly.

Do not use `Receipt` as a synonym for any convenient record. Do not define an alternate `hypothesis` object when Conjecture semantics fit. Do not invent an alternate operational “spine.” Do not use `Profile` for Genesis companion guidance.

See [`SEMANTIC_ALIGNMENT.md`](./SEMANTIC_ALIGNMENT.md).

## 9. Source and evidence discipline

Specific factual, benchmark, compatibility, security, and status claims SHOULD be supportable by inspectable evidence appropriate to the claim.

Preserve:

- source identity/provenance;
- date/version;
- relevant excerpt/location when useful;
- independence or shared origin among sources;
- uncertainty;
- known contradiction;
- status/staleness.

Several sources repeating one origin are not independent confirmation.

A broken link or failed refresh does not silently remain current evidence.

## 10. Public claim lineage

Where practical, material public claims SHOULD be traceable through something like:

```text
source material -> Rosetta/Entif evidence artifacts -> reviewed claim -> page/section -> revision -> publication
```

This shorthand is not a new Rosetta schema. The actual representation should use the canonical source/provenance and publication mechanisms adopted by the project.

The purpose is to make correction possible without guessing which pages inherited a claim.

## 11. Publication pipeline

Externally published material SHOULD pass through a proportionate pipeline:

1. source and rights validation;
2. technical/semantic claim inspection;
3. provenance/citation review;
4. audience/accessibility review;
5. deterministic lint/link validation where useful;
6. adversarial editorial review;
7. authorized publication decision;
8. post-publication correction/revision path.

An agent may draft or critique. Publication authority remains with the configured human/governance mechanism.

## 12. AI-generated content

The objective is excellent content, not content that conceals whether a generative system helped produce it.

AI-generated text is a draft contribution and is held to the same standards for:

- truth;
- provenance;
- originality;
- precision;
- audience fit;
- accessibility;
- attribution;
- review.

Do not optimize for detector evasion.

Optimize for:

- correctness;
- usefulness;
- clarity;
- semantic fidelity;
- originality;
- engagement;
- fitness for purpose.

## 13. Writing quality hierarchy

For technical/research content, optimize in this order:

1. truth and provenance;
2. semantic fidelity;
3. audience comprehension;
4. editorial clarity;
5. project voice;
6. stylistic flourish.

Simplification MUST NOT falsify technical meaning.

Conciseness removes waste, not necessary context.

## 14. Style authorities

Prefer a maintained style authority appropriate to the artifact rather than inventing a complete private writing system.

Useful sources include:

- Google Developer Documentation Style Guide for developer-facing technical docs;
- Microsoft Writing Style Guide for product/help/interface copy;
- ASD-STE100 selectively for safety-critical/high-consequence procedural material;
- Orwell's six rules as an editing heuristic, not a compliance standard;
- Vale as a configurable prose-linting engine, not a writing philosophy.

Do not blindly stack multiple complete style guides.

Choose one primary authority per artifact/profile and document necessary deviations.

## 15. Vale and deterministic prose linting

Vale can enforce selected high-value rules such as:

- canonical product/technical terminology;
- acronym expansion;
- prohibited ambiguous terms;
- capitalization/naming conventions;
- high-confidence wordiness patterns;
- citation/link policy;
- domain-specific terminology.

Avoid creating a huge private rulebook with high false-positive cost.

A linter should improve the artifact, not flatten every genre into the same synthetic voice.

## 16. Editorial defects

Technical/research writing SHOULD avoid:

- unsupported grandeur;
- ornamental repetition;
- vague attribution;
- conclusion-before-evidence rhetoric;
- abstraction where concrete language exists;
- mechanical transition phrases;
- false symmetry;
- excessive throat-clearing;
- fabricated quotations;
- fabricated links/versions/product names;
- fabricated consensus;
- simplification that changes meaning.

A strong voice is compatible with rigor.

## 17. Correspondence rights

Private correspondence, email, reviewer comments, meeting notes, draft manuscripts, and collaborator materials have rights/context distinct from public sources.

Access does not imply publication permission.

A collaboration record MAY preserve:

- collaborator/project identity;
- topic;
- relevant Rosetta area;
- rights/disclosure posture;
- request/pressure signal;
- status;
- next action.

It MUST NOT automatically publish private content or treat access as consent.

## 18. Research outreach

Personalized outreach can produce valuable research collaboration, but the project SHOULD preserve the distinction between:

- public paper/source evidence;
- a researcher's private response;
- permission to cite;
- permission to publish;
- permission to share source material;
- an inference the project draws from the exchange.

Positive collaborator reaction is evidence of interest/relevance. It is not proof Rosetta's thesis is correct.

## 19. Citation quality

Prefer primary/normative sources for standards, specifications, technical claims, and project history when available.

Secondary sources are useful for interpretation, surveys, and community context, but SHOULD NOT silently replace primary authority.

When sources disagree:

- preserve disagreement;
- identify which source has authority for which claim;
- separate factual conflict from interpretive difference;
- avoid averaging incompatible assertions into synthetic certainty.

## 20. Documentation changes with behavior

Documentation explaining behavior SHOULD normally change in the same reviewable change as the behavior.

Separate only when the separation is intentional and does not create a period where the authoritative docs materially misstate reality.

## 21. Generated documentation and projections

Generated summaries, API references, indexes, inventories, or doc-intelligence outputs are derived views unless an authority explicitly declares otherwise.

Do not let generated material silently become a source of truth because it is easier to search.

Preserve the source and generation method/version.

## 22. Documentation intake versus runtime Rosetta ingestion

Planning-time documentation intelligence is not automatically Rosetta-native semantic ingestion.

Requirements extraction, contradiction mining, issue drafting, taxonomy discovery, and roadmap analysis may occur as a planning/intelligence workflow while the runtime ingestion substrate remains incomplete.

Do not use protocol-native maturity language for a planning process merely because both consume documents.

## 23. Publication corrections

Public content SHOULD have a visible correction/revision path.

Corrections should preserve enough lineage to understand:

- what changed;
- why;
- which source/evidence changed;
- whether the earlier version was wrong, stale, ambiguous, or merely incomplete;
- downstream pages/claims affected.

Do not erase embarrassing prior claims when preserving them is consistent with rights and safety. Correct them explicitly.

## 24. Documentation review test

Before publishing an important page, ask:

1. Is every material claim supportable?
2. Does the Rosetta terminology match v3?
3. Is current implementation distinguished from aspiration?
4. Can a new reader reproduce the claimed path?
5. Are access/publication rights respected?
6. Can the page be corrected later without guessing its source lineage?
7. Did editorial polish introduce semantic distortion?
8. Is the prose useful to its actual audience rather than optimized for impressive density?
