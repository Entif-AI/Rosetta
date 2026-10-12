# Genesis v0.4 Reconciliation Ledger

**Status:** Non-normative review companion  
**Date:** 2026-08-29  
**Applies to:** [`Genesis 0.4-draft`](../Genesis.md)  
**Prior synthesis:** [`GENESIS_SOURCE_SYNTHESIS.md`](../GENESIS_SOURCE_SYNTHESIS.md)  
**Primary semantic authority:** [`Rosetta v3.0.0 Core Spine Specification`](../../RFCs/Rosetta%20v3.0.0%20Core%20Spine%20Specification.md)

## 1. Purpose

Genesis 0.4 reconciles three bodies of work:

1. the original Genesis operating doctrine developed during the 2026-08-28/29 design sessions;
2. the broader 0.2 synthesis that incorporated the historical `crates/industry-best-practices/Development Book` corpus;
3. the pre-existing Rosetta/Entif constitutional corpus, with Rosetta v3.0.0 treated as paramount for semantic/protocol nomenclature and structure.

This ledger records the most important changes so that refinement does not become silent deletion or silent semantic drift.

It does not replace the detailed historical source disposition ledger. That document remains useful provenance for what happened to the Development Book material during the 0.2 synthesis.

## 2. Why 0.4 was necessary

The 0.2 synthesis was stronger operationally than 0.1, but it introduced several names and artifact patterns that overlapped existing Rosetta v3 concepts.

That violated a central Entif design principle:

> Before authoring a new standard, name, artifact, state, or representation, first determine whether the concept is already codified.

Rosetta v3 explicitly declares itself the single source of truth for meaning/process within EntifAI and locks its glossary. Therefore Genesis must inherit Rosetta semantics rather than establish parallel vocabulary.

0.4 also repairs useful session decisions that were diluted or lost during later synthesis.

## 3. Authority correction

### 0.2 problem

Genesis 0.2 placed “ratified Rosetta or Entif constitutional specifications” above Genesis.

Because Rosetta v3 currently identifies itself as a Draft intended for Standards Track, the word `ratified` could be misread as an escape hatch allowing later documents to invent alternate semantics while v3 remained formally Draft.

### 0.4 disposition

**Corrected and elevated.**

Genesis 0.4 explicitly declares Rosetta v3.0.0 paramount for Rosetta/Entif semantic meaning, nomenclature, protocol structure, provenance, identity, execution tracing, interoperability, and conformance until explicitly superseded.

Authority is also made **scope-sensitive** rather than flattened into one universal list:

- law/safety/binding obligations govern their domains;
- Rosetta v3 governs Rosetta semantics/protocol meaning;
- adopted external standards retain authority in their own domains;
- PRDs/RFCs govern product/architecture scope without silently redefining v3;
- Genesis governs cross-project operating practice;
- companions elaborate Genesis;
- local conventions/preferences come last.

## 4. Terminology and artifact reconciliation

| 0.2 concept/wording                                                                                               | 0.4 disposition                                                                         | Rationale                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `claim classes`: source, observation, inference, hypothesis, aspiration, decision, result, evaluation, projection | **Retired as canonical taxonomy**                                                       | Overlapped Rosetta Observation, Conjecture, Evaluation, Episteme, provenance, and projection semantics.                                                      |
| `hypothesis` formal class                                                                                         | **Ordinary research term; map to Conjecture when semantics fit**                        | Avoid parallel epistemic primitive.                                                                                                                          |
| custom `evaluation` definition                                                                                    | **Subordinate to v3 Evaluation**                                                        | Established Rosetta name cannot be narrowed/redefined locally.                                                                                               |
| `decision receipt`                                                                                                | **Renamed decision record**                                                             | Rosetta Receipt is a signed attestation.                                                                                                                     |
| handoff as “working receipt”                                                                                      | **Renamed handoff record**                                                              | Same collision.                                                                                                                                              |
| `Execution Spine` roadmap overlay                                                                                 | **Renamed small path to the next proof / proof path**                                   | `Spine` already denotes Rosetta's universal operational structure.                                                                                           |
| `Genesis Profile` / `profile hook`                                                                                | **Replaced with Genesis companion / project adoption record**                           | Rosetta Profile is a conformance/implementation term.                                                                                                        |
| `recoverable-operation contract` YAML                                                                             | **Retired as new canonical schema**                                                     | Reliability requirements should compose the Rosetta Run/Action/ToolCall/Observation/Evaluation spine plus Policy/Receipt/provenance and accepted extensions. |
| `projection` used broadly for cache/index/summary/rendering                                                       | **Prefer concrete derived-view names unless Rosetta projection semantics are intended** | Prevent widening an established interop concept.                                                                                                             |
| generic machine `source` class                                                                                    | **Use source-substrate vocabulary where machine semantics are intended**                | Existing source system/record/manifestation/package/acquisition/identity/rights/lifecycle distinctions already exist.                                        |

## 5. Reintroduced decisions from the earlier session

### 5.1 Fail closed; degrade honestly

**Restored as a top-level axiom.**

The later synthesis contained many instances of deny-by-default and safe-hold behavior but lost the compact governing principle.

0.4 restores it explicitly:

- unknown does not become allowed;
- unavailable verification remains unverified;
- degraded/stale/pending/indeterminate state remains visible;
- top-level green does not conceal partial failure.

### 5.2 Comments preserve intent; tests preserve behavior

**Restored and expanded in the engineering/assurance companions.**

The rule preserves two different forms of knowledge:

- tests protect behavior/invariants;
- comments preserve rationale, historical constraints, external quirks, and dangerous simplifications.

Regression-sensitive code should retain concise contextual tripwires where they prevent recurrence.

### 5.3 Strong composition bias

**Restored with a concrete tripwire.**

Behavioral composition remains the default. Taxonomy does not justify inheritance. Nominal inheritance is allowed where a host language/framework genuinely requires/rewards subtype identity.

A hierarchy deeper than two meaningful inheritance levels should require explicit design justification.

### 5.4 Repository/tooling duplication discipline

**Restored in technology-neutral form.**

Do not introduce duplicate formatters, package managers, linters, schema dialects, state libraries, or architectural conventions when the repository already has an adequate authority.

### 5.5 Interaction affordance clarity

**Restored and compartmentalized in `INTERFACE_AND_ACCESSIBILITY.md`.**

Interactive elements should be obvious without hover or experimentation. Controls, links, filters, status, taxonomy, metadata, and decoration should not collapse into one visual grammar.

Light/dark themes must preserve semantic hierarchy and accessibility.

### 5.6 Performance hierarchy

**Preserved.**

Security/rights first; accessibility/standards second; reliability/performance third; usability/cognitive clarity fourth; aesthetics/novelty/convenience fifth.

Lower priorities do not silently spend higher ones.

### 5.7 Reference implementation as research instrument

**Preserved and expanded.**

CLI/SDK/schema/fixtures/conformance behavior are treated as a laboratory for the specification.

Clone-to-insight, deliberate tampering, inspectable intermediate artifacts, deterministic paths, and foreign-system interop remain first-class goals.

### 5.8 Collaboration pressure signals

**Preserved.**

External collaborator friction can increase roadmap priority, especially when multiple independent parties surface the same missing seam or a small change unlocks a real experiment.

Popularity does not override semantic authority.

### 5.9 Demo Green versus Rung Green

**Preserved as project maturity language, explicitly not Rosetta protocol classes.**

Demo Green is bounded reproducible proof. Rung Green means all declared gates for a maturity rung have passed.

### 5.10 Small frequent releases

**Preserved.**

Small, evidence-bearing releases are preferred because they improve review depth, feedback speed, regression isolation, rollback, and attribution of results.

## 6. Structural decomposition from 0.2

Genesis 0.2 had become both a constitution and an operating handbook. 0.4 keeps the constitutional kernel leaner and moves detail into cohesive companions.

| Companion                                | Material moved/refined from 0.2 and earlier drafts                                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `SEMANTIC_ALIGNMENT.md`                  | terminology lock, external-standard inheritance, naming collision resolution, artifact admission                                 |
| `SECURITY_RIGHTS_AND_AGENTIC_CONTROL.md` | security defaults, privacy, rights-before-retrieval, supply chain, agent bounds, identity integrity, safe hold                   |
| `ENGINEERING_AND_ARCHITECTURE.md`        | composition, mutation, deterministic core, dependencies, comments, legacy, migrations, deployable boundaries                     |
| `INTERFACE_AND_ACCESSIBILITY.md`         | WCAG, semantic controls, affordances, responsive typography, sticky UI, theme tokens, design systems, front-end performance      |
| `ASSURANCE_AND_OPERATIONS.md`            | testing, coverage law, mutation/fuzz/fault injection, reliability, retry, backpressure, observability, metrics, release evidence |
| `DELIVERY_AND_COLLABORATION.md`          | proof-oriented roadmap, change lifecycle, branches, PR/review, meetings, estimation, sustainable teams, handoffs                 |
| `DOCUMENTATION_AND_PUBLICATION.md`       | docs graph, Diátaxis, executable examples, writing standards, AI-assisted content, publication rights/corrections                |
| `RESEARCH_AND_INTEROPERABILITY.md`       | CLI/SDK workbench, Python access, collaboration signals, interop experiment pattern, earned universality                         |

## 7. What remains intentionally outside Genesis

0.4 does not attempt to absorb:

- Rosetta tile schemas;
- Rosetta conformance Profile definitions;
- StdPack/VocabPack contents;
- ROCK protocol schemas;
- source-substrate canonical schemas;
- OMOC protocol semantics;
- memory-plane schemas;
- product-specific service/API definitions;
- detailed threat models;
- project-local framework/language rules;
- every practice from the historical Development Book.

Those belong to their existing authorities or future narrowly scoped work.

## 8. Standards-first rule clarified

The sequence for a new durable rule is now:

1. search Rosetta v3 and accepted internal authorities;
2. search adopted external standards/vocabularies;
3. exact-reuse if possible;
4. specialize if necessary;
5. compose existing primitives if sufficient;
6. map/translate external semantics if appropriate;
7. treat ordinary operating guidance as documentation when no machine primitive is needed;
8. only then propose a genuinely new semantic concept through the correct Rosetta governance path.

This sequence applies to names, not only software components.

## 9. Known remaining work

This 0.4 pass is a structural and semantic reconciliation, not a claim that every older repository document has been rewritten.

Follow-up work should:

- review other active governance/backlog docs for use of the now-retired Genesis aliases;
- add links from package/app READMEs to the lean Genesis and relevant companions where useful;
- validate the companion collection against the current Rosetta schemas/reference implementation;
- identify any older RFC/PRD whose terminology predates v3 and mark the exact supersession/mapping relationship rather than silently modernizing historical text;
- build deterministic terminology linting only after the canonical mapping is stable enough to avoid false authority.

## 10. Governing finding

The 0.2 synthesis was directionally strong. Its failure was not bad engineering advice; it was insufficient deference to an older, higher semantic constitution already present in the repository.

0.4 keeps the useful operating doctrine while enforcing the principle Rosetta itself exists to protect:

> **Meaning should evolve through explicit lineage and governed translation, not through near-synonyms accumulating in adjacent documents.**

## 11. Reconciliation protocol now codified

Genesis and `SEMANTIC_ALIGNMENT.md` now bind every future reconciliation to five rules:

1. v3 remains paramount for Rosetta/Entif semantic and protocol meaning until explicitly superseded;
2. every candidate term receives a crosswalk classification before prose or schemas are changed;
3. aliases are removed where an existing concept is sufficient;
4. existing Rosetta primitives are composed before a new canonical artifact schema is proposed;
5. genuinely separate application/operating concepts are explicitly namespaced and mapped.

The exact current document/schema crosswalk is in [`SEMANTIC_AUDIT.md`](./SEMANTIC_AUDIT.md). Durable decisions from the originating session are mapped in [`SESSION_DECISION_COVERAGE.md`](./SESSION_DECISION_COVERAGE.md).

## 12. Action-item status

| Action                                                                                       | Status in this pass                                                                                                         |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Audit active governance, RFC/PRD, README, and schema surfaces for high-confidence collisions | Completed for the first selected set; findings are recorded in `SEMANTIC_AUDIT.md`.                                         |
| Codify the five reconciliation rules and “Before Genesis coins...” gate                      | Completed in the Genesis kernel and semantic companion.                                                                     |
| Restore omitted session decisions without duplicating their normative homes                  | Completed and traced in `SESSION_DECISION_COVERAGE.md`; one universal master score is now explicitly rejected.              |
| Add deterministic terminology checks                                                         | Completed as a narrow checker with unit tests and repository scripts.                                                       |
| Map pre-v3 historical documents rather than silently rewriting them                          | Alignment notes added to selected high-impact RFCs/PRDs.                                                                    |
| Clarify active README and schema-registry authority                                          | Completed for the root README, Entif site, CLI, schema README, and schema authority map.                                    |
| Govern every non-core `rosetta.*` schema ID                                                  | Outstanding semantic decisions remain explicit in `SEMANTIC_AUDIT.md`; the checker prevents new undocumented IDs.           |
| Prove full corpus consistency                                                                | Not claimed. The repository contains historical and exploratory material that requires progressive, evidence-based mapping. |

## 13. Remaining semantic debt

The next semantic-governance work should resolve, through normal Rosetta authority rather than Genesis invention:

- the canonical disposition of `rosetta.composition_provenance`, `rosetta.translation_evidence`, `rosetta.conformance_bundle`, and `rosetta.shacl_shapes`;
- the exact mapping between RRP Receipt families and the v3 Receipt model;
- qualified uses of Profile across source, policy, performance, and conformance domains;
- Agentic Messaging labels that borrow Receipt or Incident words;
- further historical documents only when active implementation or publication depends on them.

This debt is now visible and bounded. It is not silently treated as solved.
