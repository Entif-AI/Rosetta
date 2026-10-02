# Genesis Semantic Duplication Audit

**Status:** Living non-normative audit companion  
**Date:** 2026-08-29  
**Applies to:** [`Genesis 0.4-draft`](../Genesis.md) and the active Rosetta/Entif documentation and implementation surfaces  
**Primary semantic authority:** [`Rosetta v3.0.0 Core Spine Specification`](../../RFCs/Rosetta%20v3.0.0%20Core%20Spine%20Specification.md)

## 1. Purpose

This audit records where the repository reuses Rosetta v3 semantics, where it defines narrower Entif application contracts, where it relies on adopted external authorities, and where names still require explicit mapping or governance.

It exists to prevent two symmetrical failures:

1. one meaning accumulating several near-synonymous names; and
2. one established name accumulating several incompatible meanings.

This file is not a protocol specification. It is a review map and an input to deterministic semantic-governance checks.

## 2. Audit dispositions

Every durable term, schema family, or artifact pattern SHOULD resolve to one of these dispositions:

| Disposition                        | Meaning                                                                                                                                                           |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **core reuse**                     | Uses a Rosetta v3 Terminology-Locked concept without changing its meaning.                                                                                        |
| **accepted extension**             | Adds a narrower capability through an accepted RFC, PRD, addendum, ROCK specification, source-substrate authority, Pack, translator, or other governed mechanism. |
| **application contract**           | Entif/project-local structure that does not claim Rosetta core meaning or conformance.                                                                            |
| **projection or derived view**     | Rebuildable/read-oriented representation derived from canonical artifacts.                                                                                        |
| **external reference**             | Semantics remain governed by an adopted external standard, ontology, vocabulary, or service contract.                                                             |
| **historical precursor**           | Earlier research or design material preserved for provenance but superseded where it conflicts with current authority.                                            |
| **provisional semantic extension** | Useful proposed concept that still requires explicit Rosetta governance and mapping before it may be treated as canonical.                                        |
| **retired alias**                  | Name removed because an existing concept already owns the meaning or because the name collides with a stronger authority.                                         |

## 3. Current implementation-schema crosswalk

The current lightweight schema registry contains both Rosetta core terms and Entif/application schemas. Registry presence does not itself grant semantic authority.

### 3.1 Rosetta v3 core reuse

The following implemented schema IDs reuse v3 concepts and MUST preserve the v3 definitions:

- `rosetta.run`
- `rosetta.action`
- `rosetta.toolcall`
- `rosetta.observation`
- `rosetta.evaluation`
- `rosetta.receipt`
- `rosetta.tapestry`

A validator may currently enforce only a bootstrap subset of fields. That implementation limitation does not narrow the normative concept.

### 3.2 Accepted source-substrate extensions

The `source.*` family is governed by the accepted source-substrate, source-registry, ingress-refinery, and product authorities. It is not Rosetta v3 core and MUST remain explicitly mapped to Rosetta identity, provenance, Observation, Receipt, lineage, rights, and lifecycle semantics.

Current examples include:

- `source.system_profile`
- `source.registry_entry`
- `source.record`
- `source.manifestation`
- `source.package`
- `source.episode`
- `source.ingress_job`
- `source.canonical_artifact`
- `source.derived_artifact`
- source Receipt-family extensions such as fetch, normalization, evaluation, and identity-resolution receipts

The word `profile` in `source.system_profile` is a qualified source-domain noun. It MUST NOT be presented as a Rosetta conformance **Profile**.

### 3.2.1 Pack-defined evaluation Profiles

`salience.evaluation.v1` is an accepted Pack-defined Profile that composes the existing `rosetta.evaluation` primitive. It represents separate Impact, Exigency, and Novelty assessments with declared scope, valid time, evidence, uncertainty, receipts, provenance, and attributable supersession. It is not a Core kind and does not establish truth, authorization, activation, execution, scoring, weighting, gating, selection, or private operational policy.

### 3.3 Entif and project application contracts

The following families are application contracts unless a later accepted authority explicitly elevates them:

- `entif.*`, including `entif.intake_envelope`, digest, postmortem, Agentic Messaging, domain-reference, and execution-admission schemas;
- `guard.*`, including `guard.decision_token`;
- `adapter.*`, including `adapter.capability_manifest`;
- `skill.*`, including `skill.card`.

These contracts may compose Rosetta artifacts, Policies, Receipts, provenance, and execution traces. They MUST NOT be described as Rosetta core merely because they live in a package named `rosetta-schemas`.

### 3.4 Provisional or local `rosetta.*` schemas outside the v3 core list

The following implemented IDs use the `rosetta.*` namespace but are not defined as core terms by the v3 Terminology Lock. Until an accepted authority resolves them, treat them as local/provisional extension or validation artifacts rather than core:

- `rosetta.composition_provenance`
- `rosetta.translation_evidence`
- `rosetta.conformance_bundle`
- `rosetta.shacl_shapes`

Required follow-up for each:

1. identify the nearest v3 primitives and accepted addenda;
2. classify it as specialization, composition, projection, validation result, or genuine semantic gap;
3. place it under the correct namespace/authority;
4. define conformance and migration implications before broader exposure.

### 3.5 Agentic Messaging labels that overlap Rosetta terms

`TASK_RECEIPT` and `INCIDENT_ENVELOPE` are currently internal Agentic Messaging family labels. The label alone does not prove that the payload is a canonical Rosetta **Receipt** or **Incident**.

Any public or cross-package claim that these messages carry Rosetta semantics MUST define and test the mapping to the corresponding canonical artifacts. Otherwise they remain transport/application messages.

## 4. Active-document alignment

| Document                                                                                      | Disposition                        | Alignment action                                                                                                                                     |
| --------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Rosetta v3.0.0 Core Spine Specification.md`                                                  | core authority                     | Terminology Lock controls Rosetta/Entif semantic and protocol meaning until explicitly superseded.                                                   |
| `20260412 - Rosetta - Ontological Mixture of Concepts (OMOC) - Swarm Gnosis Protocol Spec.md` | accepted companion/extension draft | Already states that it extends v3 without redefining core semantics.                                                                                 |
| `20260324 - Entif AI - Specification - Agentic Memory and Graph Design Doctrine.md`           | Entif architecture authority       | Entif envelopes/contracts are application or extension designs and must map to the v3 operational Spine rather than replace it.                      |
| `20260426 - Entif - PRD - Context CLI and Memory Services.md`                                 | product authority                  | Source envelopes and assimilation packets are Entif application contracts; compiled Rosetta context should use **Tapestry** semantics when they fit. |
| `20260426 - Entif and Rosetta PRD.md`                                                         | product authority                  | Preserve the constitutional split: Rosetta owns meaning/provenance; Entif owns governed orchestration, memory, and product behavior.                 |
| `20251024 - RFC - Rosetta - Cognitive Tiles and Swarm Gnosis.md`                              | historical precursor               | Preserve as research lineage; v3 definitions supersede conflicting Tile/CID/Receipt/process terminology.                                             |
| `20251024 - PRD - Rosetta - Cognitive Tapestries via Semantic Latticing.md`                   | historical precursor               | Preserve as research lineage; v3 **Tapestry** and related definitions control current meaning.                                                       |
| `ontological_mixture_of_concepts_research_spec.md`                                            | working precursor                  | OMOC is the current project name; OMC/older schema language remains historical unless explicitly mapped forward.                                     |
| `rosetta_governance_addendum_personhood_provenance_and_cognitive_twin_risk.md`                | draft extension proposal           | Proposed policy/Receipt/Profile families remain provisional until accepted through Rosetta governance.                                               |
| `README.md` and current package/app READMEs                                                   | active orientation surfaces        | Must link to v3/Genesis, avoid Receipt metaphors and roadmap use of `Spine`, and describe implementation maturity honestly.                          |

## 5. Retired aliases from Genesis development

The following aliases are retired from active operating guidance:

| Retired wording                                               | Use instead                                                                             |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `Execution Spine` for roadmap sequencing                      | `current path to the next proof` or ordinary `proof path` language                      |
| `decision receipt`                                            | `decision record`; a Rosetta Receipt may attest it                                      |
| `handoff receipt` / `working receipt` / `baton-pass receipt`  | `handoff record`                                                                        |
| `Genesis Profile` / `profile hook`                            | `Genesis companion`, `project adoption record`, or a project-local guide                |
| `claim classes` as a universal Genesis taxonomy               | Rosetta v3 epistemic/provenance constructs plus ordinary research prose                 |
| `recoverable-operation contract` as a new canonical schema    | reliability requirements composed with the v3 operational Spine and accepted extensions |
| broad `projection` as a synonym for every cache/index/summary | use the concrete derived-view name unless Rosetta projection semantics are intended     |

## 6. Current semantic debt

### Machine-readable audit checkpoint (2026-09-07, #1179/#1180)

The schema catalog now records `coreDescent`, `descentAuthority` and
`relatedCoreKinds` independently of operational ownership. The identity map is
explicit for every supported tile kind; no namespace default grants core status.
This is classification evidence, not formal conformance or a schema migration.

| Surface | Recorded posture | Remaining risk and owner |
| --- | --- | --- |
| Seven core-reuse IDs in Section 3.1 | Core primitives | Required-field validators remain a bootstrap subset; #680/#1205 must preserve coverage limits. |
| Source shapes actually present in the starter schema | Pack-defined schemas | Receipt/evaluation/matrix relationships are semantic references, not proof of structural substitutability; #158/#790. |
| Source package, episode, correction, identity-resolution receipt, ingress job and registry entry | Governed extensions | Missing starter-schema exports remain explicit; #680/#790 must bind exact exported shapes and compatible-core posture. |
| `skill.card`, adapter capability and Guard contracts | Implementation-local application contracts | The card's operational tier changes to governance-admission; none become execution grants. |
| `rosetta.translation_evidence`, `rosetta.composition_provenance` | Implementation-local, with related observation/receipt references | Namespace and migration decisions remain open; no silent rename or core promotion. |
| `rosetta.conformance_bundle`, `rosetta.shacl_shapes` | Derived summary and local validation output respectively | Neither generated text nor summary counts establishes full conformance; #1205. |
| Agentic Messaging profiles/envelope | Implementation-local application contracts | Labels do not establish canonical Receipt/Incident equivalence; explicit mappings remain downstream. |
| IAM, Guard-request and mailroom refs | External contract references | Reserved interfaces remain unsupported here and retain their owning contracts. |

No genuine Core gap is established by this audit. Existing primitives and governed
extensions provide relationships to review; unresolved mapping or packaging is
not evidence that a new Core primitive is needed. A future gap requires an
explicit authority decision, rather than a fallback classification for unknown IDs.

Preflight: Core Spine, this audit, source-substrate schema/vocabulary/manifest,
schema authority map and public/protected authority maps reviewed. This change
exposes existing public classification boundaries and does not alter protected
selection, scoring, policy or runtime behavior. No authority-map edge changes.

The first audit leaves these explicit follow-ups:

1. decide the governed disposition of non-core `rosetta.*` schema IDs listed in Section 3.4;
2. define the exact relation between RRP Receipt families and the v3 **Receipt** model;
3. audit qualified uses of `Profile` so source, policy, performance, and Rosetta conformance Profiles cannot be confused;
4. map internal Agentic Messaging labels to Rosetta artifacts where canonical semantics are claimed;
5. preserve explicit OMC -> OMOC naming lineage;
6. annotate additional historical RFCs/PRDs when future implementation work depends on their pre-v3 terminology;
7. avoid silently modernizing historical source documents merely to satisfy current vocabulary.

## 7. Duplication-mitigation workflow

Before a new durable term or schema is accepted:

1. search the v3 Terminology Lock and normative neighbors;
2. search current RFCs, PRDs, governance documents, ROCK work, source-substrate authorities, and schema catalogs;
3. search adopted external standards and vocabularies;
4. classify the relationship as exact reuse, specialization, composition, translation/projection, ordinary language, or genuine gap;
5. remove aliases when an existing concept is sufficient;
6. avoid a new canonical schema when existing Tiles/relations can compose the function;
7. namespace genuinely separate application concepts outside Rosetta core;
8. route genuine Rosetta gaps through governed extension/speciation/supersession;
9. record migration, compatibility, and conformance consequences;
10. add or update deterministic semantic-governance checks only after the mapping is explicit.

## 8. Audit evidence and automation

The repository command `pnpm run governance:semantic` checks high-signal active surfaces for known retired aliases, required authority language, historical alignment notes, and undocumented non-core `rosetta.*` schema IDs.

The checker is intentionally narrow. It is not an ontology reasoner and MUST NOT be mistaken for proof that all documentation is semantically consistent.

Automation should fail on high-confidence collisions and leave nuanced interpretation to review. A noisy linter that everyone ignores is another form of semantic failure.

## 9. Review rule

A proposed term is not accepted because it sounds precise, appears in generated code, or has already been repeated across several documents.

Acceptance requires a clear authority, a recorded relationship to existing semantics, and a reason the new name improves rather than fragments shared understanding.

> **One fact, one authority; one meaning, one canonical name; every extension, an explicit lineage.**
