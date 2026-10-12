# Genesis Semantic Alignment Companion

**Status:** Proposed companion to Genesis 0.4-draft  
**Primary authority:** [`Rosetta v3.0.0 Core Spine Specification`](../../RFCs/Rosetta%20v3.0.0%20Core%20Spine%20Specification.md)  
**Purpose:** Prevent Genesis and downstream project guidance from creating overlapping concepts under new names or reusing established Rosetta names with incompatible meanings

## 1. Governing rule

> **Adopt before inventing applies to language itself.**

Rosetta v3.0.0 declares itself the single source of truth for meaning and process within EntifAI and includes a normative **Terminology Lock**. Genesis therefore treats v3 terminology as paramount for Rosetta and Entif semantic/protocol meaning, even while the v3 document remains Draft, until an explicit accepted successor supersedes it.

Genesis is allowed to define operating practice. It is not allowed to establish a shadow ontology.

Before naming a new concept, artifact, relationship, identifier, state, protocol, classification, or machine-readable schema, contributors MUST determine whether the idea is already represented by:

1. Rosetta v3 core semantics;
2. an accepted Rosetta extension, StdPack, VocabPack, ROCK specification, source-substrate authority, or compatible addendum;
3. an adopted external standard or vocabulary;
4. composition of existing primitives;
5. ordinary project documentation that does not require a new semantic primitive.

Only the irreducible remainder is a candidate for new terminology.

## 2. What v3 already owns

The following names are examples of Rosetta v3 Terminology-Locked concepts and MUST retain the v3 meaning when used as protocol terms:

- **Tile**
- **CID** / Content ID
- **RID** / Rosetta ID
- **XID** / external identifier or anchor
- **PACKID**
- **Run**
- **Action**
- **ToolCall**
- **Observation**
- **Evaluation**
- **Pasigram**
- **Form**
- **Lexeme**
- **Concept**
- **Frame**
- **Relation / Lattice Edge**
- **Tapestry**
- **Conjecture**
- **Episteme**
- **Matrix**
- **Policy**
- **Receipt**
- **Incident / Incident Envelope**
- **Delta / Delta Capsule**
- **Profile**
- **StdPack**
- **VocabPack**

This list is not a substitute for the v3 glossary. If it is incomplete or stale, the Core Spine wins.

## 3. Core semantic relationships Genesis inherits

### 3.1 Signals are not semantics

Rosetta v3 separates raw external signal from interpretation. An **Observation** is immutable evidence of what the system received. Forms, Lexemes, Concepts, Frames, Conjectures, Evaluations, and Epistemes represent later interpretation or assessment.

Genesis MUST NOT collapse these into one generic `claim` or `knowledge` object when Rosetta semantics are intended.

### 3.2 Uncertainty is first-class

A **Conjecture** represents candidate interpretations and associated uncertainty rather than forcing premature collapse. Genesis research prose may use words such as _hypothesis_ or _candidate explanation_, but a machine representation that fits Conjecture semantics SHOULD use the Rosetta construct rather than minting a parallel `hypothesis` type.

### 3.3 Epistemic assessment already has a home

An **Episteme** is Rosetta's structured epistemic wrapper or compiled truth assessment, grounded in evidence and Evaluations. Genesis MUST NOT create a competing universal `belief`, `truth assessment`, or `confidence record` primitive without first demonstrating a semantic gap.

### 3.4 Operational process already has a spine

Rosetta v3 defines the universal operational trace around **Run -> Action -> ToolCall -> Observation -> Evaluation**, with provenance, Policies, Receipts, and related artifacts.

Genesis may define reliability requirements such as bounded retries, timeouts, idempotency, postcondition checks, recovery, and human checkpoints. It MUST NOT replace the Rosetta execution spine with a second canonical operation envelope or process ontology unless an accepted Rosetta/Entif RFC explicitly establishes that extension and maps it to the core.

### 3.5 Receipts are not a metaphor when protocol meaning is intended

A Rosetta **Receipt** is a signed attestation about an event or artifact.

Therefore:

- a meeting summary is a **meeting record**, not automatically a Receipt;
- a design decision is a **decision record**, not automatically a Receipt;
- a handoff note is a **handoff record**, not automatically a Receipt;
- CI output is **verification evidence** unless it is actually bound into the Rosetta Receipt model;
- an audit trail may contain Receipts, but the words are not interchangeable.

Ordinary prose can still say someone "received" something. Capitalized or protocol-significant use MUST follow v3.

### 3.6 Tapestry is the compiled context construct

Genesis and project documents SHOULD use **Tapestry** when they mean the Rosetta context-bound compiled working set defined by v3.

A generic document bundle, prompt, folder, archive, or meeting packet is not automatically a Tapestry.

### 3.7 Profile is already a Rosetta conformance term

Rosetta v3 uses **Profile** for implementation/conformance subsets and roles.

Genesis therefore avoids the older phrase `Genesis profile` for its modular operating guidance. Use **Genesis companion**, **project adoption record**, **project guide**, or another clearly non-Rosetta phrase unless the object is intentionally a Rosetta Profile.

### 3.8 Packs are protocol extension mechanisms

StdPacks and VocabPacks are Rosetta extension mechanisms. ROCK packs have their own established role in the repository.

Genesis companion documents are deliberately **not** called Packs. Their modular architecture is analogous, but the name would imply protocol semantics they do not possess.

## 4. Rectifications from Genesis 0.2

The 0.2 synthesis introduced several useful ideas using names that overlap or collide with existing Rosetta concepts. Genesis 0.4 resolves them as follows.

| 0.2 wording                                                                                                                 | 0.4 treatment                                                                                                                                       | Reason                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `claim classes` containing source, observation, inference, hypothesis, aspiration, decision, result, evaluation, projection | Removed as a canonical machine taxonomy                                                                                                             | It duplicated or blurred v3 Observation, Conjecture, Evaluation, Episteme, provenance, and projection semantics. Human prose may still distinguish these ideas naturally. |
| `hypothesis` as a formal class                                                                                              | Ordinary research-language term; map to **Conjecture** when Conjecture semantics fit                                                                | Avoid parallel epistemic primitive.                                                                                                                                       |
| `evaluation` redefined as a judgment under an explicit rubric                                                               | Inherit **Evaluation** from v3                                                                                                                      | Same name must not have a narrower incompatible definition.                                                                                                               |
| `decision receipt`                                                                                                          | **decision record**                                                                                                                                 | Receipt is Terminology-Locked. A decision record may later be attested by a Receipt.                                                                                      |
| `handoffs are working receipts`                                                                                             | **handoff records**                                                                                                                                 | Same collision.                                                                                                                                                           |
| `Execution Spine` for roadmap sequencing                                                                                    | **current path to the next proof** / **proof path** in ordinary planning prose                                                                      | `Spine` already names Rosetta's canonical execution structure.                                                                                                            |
| `Genesis Profile` / `profile hook`                                                                                          | **Genesis companion** / project adoption record                                                                                                     | `Profile` already carries Rosetta conformance meaning.                                                                                                                    |
| `recoverable-operation contract` as a new canonical YAML artifact                                                           | Reliability requirements mapped onto existing Rosetta execution, Policy, Receipt, provenance, and project contracts                                 | Avoid second operation protocol.                                                                                                                                          |
| `projection` used as a universal synonym for cache/index/summary/rendering                                                  | Prefer **derived view**, **cache**, **index**, **summary**, or the concrete artifact name unless Rosetta projection semantics are actually intended | Prevent semantic widening of an existing Rosetta interoperability term.                                                                                                   |
| generic `source` machine class                                                                                              | Use concrete source-substrate terms where machine representation is intended                                                                        | Existing Entif source-substrate work separates source system, record, manifestation, package, acquisition, identity, rights, lifecycle, and evaluation concerns.          |

## 5. Lower-case prose versus protocol names

Capitalization is not the only signal of meaning, but it is useful discipline.

- **Observation** means the Rosetta artifact when protocol semantics are intended.
- _observation_ may mean an ordinary human observation in prose.
- **Receipt** means the Rosetta attestation artifact when protocol semantics are intended.
- _receipt_ should be avoided as a metaphor inside technical Rosetta documents when `record`, `evidence`, or `attestation` is clearer.
- **Profile** means a Rosetta conformance/implementation Profile when used as a Rosetta term.
- _user profile_ or _performance profile_ may remain ordinary English when context is unambiguous.

When ambiguity would survive capitalization, add a qualifier or link to the governing definition.

## 5.1 Five rules for every reconciliation pass

Before Genesis coins, defines, or canonizes any term concerning meaning, epistemics, provenance, process, identity, artifacts, execution, conformance, or interoperability, it MUST first resolve whether Rosetta v3, an accepted internal extension, or an adopted external authority already defines the concept.

Every reconciliation pass MUST:

1. **Preserve Rosetta v3 primacy.** Treat v3 as paramount for Rosetta/Entif semantic and protocol meaning until an accepted successor explicitly supersedes the affected rule.
2. **Build a semantic crosswalk before editing.** Classify every candidate term as exact reuse, specialization, composition, translation/projection, ordinary operating language, retired alias, or genuine semantic gap.
3. **Remove aliases instead of multiplying them.** Ordinary English may remain natural, but canonical and machine-readable meaning MUST NOT fork merely because a later document prefers a synonym.
4. **Compose before minting schemas.** Do not create a new canonical artifact type when existing Tiles, relationships, Policies, Receipts, provenance, accepted extensions, or external-standard mappings can faithfully perform the job.
5. **Namespace genuinely separate concepts.** Application, operational, documentation, and product concepts that are not Rosetta core MUST declare their owning authority and relationship to the constitutional model.

A reconciliation record SHOULD state, for each material source rule or term:

- source authority and locator;
- prior wording;
- canonical target term or disposition;
- relationship type;
- compatibility and migration consequence;
- whether implementation, schema, documentation, tests, and examples are affected;
- unresolved uncertainty or dissent.

The current repository crosswalk and known semantic debt live in [`SEMANTIC_AUDIT.md`](./SEMANTIC_AUDIT.md). Session-level decision coverage lives in [`SESSION_DECISION_COVERAGE.md`](./SESSION_DECISION_COVERAGE.md).

## 6. New-term admission procedure

Before adding a durable Entif/Rosetta term:

### Step 1: search the core

Search the v3 Terminology Lock and surrounding normative sections for the concept and its semantic neighbors.

### Step 2: search accepted addenda and current product authorities

Inspect relevant files under `docs/RFCs`, `docs/PRDs`, `docs/governance`, and protocol-pack specifications. Do not assume absence from the glossary means absence from the architecture.

### Step 3: search adopted external standards

If a maintained standard already owns the concept, prefer a Rosetta anchor, StdPack/VocabPack, translator, adapter, or reference rather than local reinvention.

### Step 4: classify the relationship

The proposed idea should be one of:

- **exact reuse** — use the existing name and semantics;
- **specialization** — declare the parent concept and narrower constraints;
- **composition** — model the idea as a pattern of existing primitives;
- **projection / translation** — preserve the source semantics and map them;
- **ordinary operating language** — no new machine primitive is necessary;
- **genuine semantic gap** — existing mechanisms cannot faithfully represent the concept.

### Step 5: route genuine semantic gaps through Rosetta governance

A genuine Rosetta semantic gap belongs in the governed evolution path described by v3: extension, translator, proposal/speciation, future core revision, or another accepted Rosetta mechanism.

Genesis documentation MUST NOT backdoor a new core primitive by bolding a noun and using it repeatedly.

## 7. External vocabulary discipline

Rosetta v3 explicitly rejects becoming the one true ontology. External knowledge bases, standards, vocabularies, and ontologies retain their identities and are bridged through anchors, XIDs, Packs, mappings, and translators.

When Genesis companions cite WCAG, PROV-O, OWL, RDF, SKOS, SHACL, OpenAPI, AsyncAPI, CloudEvents, OpenTelemetry, Design Tokens, DORA, Diátaxis, NIST, OWASP, SLSA, or other maintained authorities:

- cite the normative source where applicable;
- identify the version or status used when material;
- do not copy an external term into an Entif namespace merely to make it look native;
- do not claim conformance from partial inspiration;
- distinguish normative adoption from informative influence;
- preserve the ability to update mappings without mutating Rosetta core identity.

## 8. Artifact-schema discipline

A Markdown checklist, PR template, experiment record, or operational worksheet is not automatically a Rosetta artifact schema.

Before defining a canonical JSON/YAML shape, ask:

1. Does v3 already provide the necessary Tile kinds and relationships?
2. Does an Entif/Rosetta RFC or PRD already define the envelope?
3. Is this merely a documentation template for humans and agents?
4. Would a structured projection of existing Rosetta artifacts be enough?
5. Is the proposed schema actually an external-standard concern?

Canonical machine schemas require the appropriate semantic authority and conformance story. Genesis companions may provide **illustrative templates** but MUST label them as non-protocol examples unless another authority adopts them.

## 9. Source-substrate alignment

The Entif/Rosetta product corpus already distinguishes source concerns such as source system, source record, manifestation, package, acquisition, identity, rights, lifecycle, corrections, and evaluation. Genesis SHOULD use those concrete terms, or link to their governing source-substrate authority, rather than treating `source` as a monolithic data object.

This is especially important for documentation ingestion and research collaboration. Access to a document is not ownership of publication rights; a manifestation is not necessarily the source record; a correction does not erase the prior Observation; and source identity resolution is evidence-producing work rather than string matching.

## 10. Status words and conformance words

Genesis capability-status labels such as `modeled`, `fixture-backed`, `demo-proven`, or `production-observed` describe project maturity in documentation. They do not alter Rosetta conformance semantics.

Use **conformant** only with a named profile, suite, version, or external standard scope. Use **verified** only with named verification evidence. Use **interoperability-proven** only when independent systems or implementations have actually exchanged the stated semantics with recorded loss/constraints.

## 11. Review checklist

Before approving a new Genesis or project term, ask:

- Is this already a Rosetta v3 term?
- Is it already defined in a current RFC, PRD, ROCK artifact, source-substrate authority, or Pack?
- Is it an external-standard term that should remain externally anchored?
- Are we using an established name with a different meaning?
- Are we inventing an alias for something Rosetta already represents?
- Can the idea be composed from existing primitives?
- Are we accidentally turning a prose template into a protocol schema?
- If the concept is genuinely new, has it entered the correct Rosetta governance path?

If any answer is uncertain, preserve the uncertainty and resolve the terminology before implementation proliferates it.

## 12. Core maxim

> **One meaning should not acquire two names merely because two documents were written at different times. One name should not acquire two meanings merely because a later author liked the word.**

Rosetta exists in large part to make those forms of semantic drift inspectable and preventable. Genesis must obey the same law.
