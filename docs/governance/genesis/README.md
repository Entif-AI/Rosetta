# Genesis Companion Index

**Status:** Proposed companion structure  
**Applies to:** [`Genesis 0.4-draft`](../Genesis.md)  
**Authority:** Subordinate to applicable law, Rosetta v3 semantic/protocol authorities, accepted project RFCs/PRDs within their scope, and the lean Genesis doctrine itself

## Purpose

The Genesis companion collection holds detailed operating practice that would otherwise make [`Genesis.md`](../Genesis.md) too large to remain useful as a constitutional guide.

The collection is intentionally modular. Each companion has one cohesive job and MUST inherit, rather than redefine, the semantic and protocol vocabulary of the [Rosetta v3.0.0 Core Spine Specification](../../RFCs/Rosetta%20v3.0.0%20Core%20Spine%20Specification.md).

These documents are **not** Rosetta StdPacks, VocabPacks, ROCK packs, or Rosetta conformance Profiles. They are human- and agent-readable operating companions. If a future Rosetta authority chooses to encode any companion as a protocol Pack, Profile, Tile family, or other Rosetta-native artifact, that must happen through Rosetta's governed extension process.

## Authority and composition rules

1. **Rosetta v3 owns Rosetta meaning.** The Terminology Lock in the Core Spine controls Rosetta names and semantics even while v3 remains Draft, until explicitly superseded.
2. **External standards own their adopted domain semantics.** Genesis companions reference and compose maintained standards rather than privately reauthoring them.
3. **Genesis owns cross-project operating defaults.** Companions elaborate those defaults without creating a second semantic constitution.
4. **Project authorities may narrow implementation.** Current PRDs, accepted RFCs, ADRs, threat models, release gates, and local contracts govern their declared scope so long as they do not silently weaken or rename higher authorities.
5. **One fact, one authority.** Companions should link to the authoritative rule rather than cloning it into several near-identical paragraphs.
6. **No speculative artifact proliferation.** A useful checklist or documentation template does not automatically become a Rosetta Tile kind or canonical machine schema.

## Companion map

| Companion                                                                            | Primary job                                                                                                  | Does not own                                |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| [`SEMANTIC_ALIGNMENT.md`](./SEMANTIC_ALIGNMENT.md)                                   | Rosetta terminology inheritance, collision prevention, external-standard alignment, and extension discipline | New Rosetta semantics                       |
| [`SEMANTIC_AUDIT.md`](./SEMANTIC_AUDIT.md)                                           | Living crosswalk for active docs, implementation schemas, retired aliases, and semantic debt                 | Protocol conformance or automatic authority |
| [`SESSION_DECISION_COVERAGE.md`](./SESSION_DECISION_COVERAGE.md)                     | Traceability map from the 2026-08-28/29 design session into the lean kernel and companions                   | Normative operating law                     |
| [`SECURITY_RIGHTS_AND_AGENTIC_CONTROL.md`](./SECURITY_RIGHTS_AND_AGENTIC_CONTROL.md) | Security, privacy, rights, supply chain, agent authority, safe failure                                       | Alternate Policy/Receipt/Incident semantics |
| [`ENGINEERING_AND_ARCHITECTURE.md`](./ENGINEERING_AND_ARCHITECTURE.md)               | Architecture, composition, state, dependencies, comments, migrations, replaceability                         | Rosetta protocol architecture               |
| [`INTERFACE_AND_ACCESSIBILITY.md`](./INTERFACE_AND_ACCESSIBILITY.md)                 | Accessibility, interaction clarity, responsive behavior, design systems, front-end performance               | Rosetta UI protocol semantics               |
| [`ASSURANCE_AND_OPERATIONS.md`](./ASSURANCE_AND_OPERATIONS.md)                       | Testing, adversarial assurance, reliability, observability, metrics, release evidence                        | New Rosetta conformance vocabulary          |
| [`DELIVERY_AND_COLLABORATION.md`](./DELIVERY_AND_COLLABORATION.md)                   | Roadmapping, change flow, PRs, review, estimation, meetings, teams, handoffs                                 | The Rosetta execution Spine                 |
| [`DOCUMENTATION_AND_PUBLICATION.md`](./DOCUMENTATION_AND_PUBLICATION.md)             | Documentation architecture, executable examples, writing, AI-assisted content, publication                   | Rosetta semantic truth claims               |
| [`RESEARCH_AND_INTEROPERABILITY.md`](./RESEARCH_AND_INTEROPERABILITY.md)             | CLI/SDK workbench, clone-to-insight, collaborator pressure, experiments, interoperability                    | Core conformance definitions                |
| [`V0_4_RECONCILIATION.md`](./V0_4_RECONCILIATION.md)                                 | Reconciliation of Genesis 0.1/0.2 with Rosetta v3 and restored session decisions                             | Normative operating law                     |
| [`../GENESIS_SOURCE_SYNTHESIS.md`](../GENESIS_SOURCE_SYNTHESIS.md)                   | Historical Development Book source provenance and 0.2 disposition                                            | Normative operating law                     |

## Semantic governance checks

Run from the repository root:

```bash
pnpm run governance:semantic
pnpm run governance:semantic:test
```

The checker enforces a deliberately narrow set of high-confidence rules: required authority links, known retired aliases on active surfaces, alignment notes on selected pre-v3/application documents, and explicit disposition of non-core `rosetta.*` schema IDs.

It is not an ontology reasoner and does not prove the corpus is perfectly consistent. Human review remains responsible for nuanced mappings, source authority, and genuine semantic gaps.

## Companion admission test

Before adding a new companion, ask:

- Is the guidance durable across more than one project?
- Is it too detailed for the lean Genesis kernel?
- Is it not already adequately governed by a maintained external standard or existing Rosetta/Entif authority?
- Can it remain cohesive rather than becoming an attic of unrelated advice?
- Will readers know exactly which higher authority it inherits?

If the answer is no, prefer an existing companion, a project-local ADR/runbook/README, an RFC/PRD, or an external reference.

## Change discipline

A companion change SHOULD identify whether it:

- clarifies an existing Genesis invariant;
- adds a reusable operating default;
- incorporates a better maintained external authority;
- reconciles terminology with Rosetta v3;
- records a durable lesson from a real failure or experiment;
- removes guidance whose ownership cost no longer earns its keep.

When a companion begins accumulating protocol semantics, stop and route that work through Rosetta governance instead.
