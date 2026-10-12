# Rosetta v3.0.0 Core Spine Specification (Standards Track, Version 3.0.0)

**Status:** Draft (Intended Status: Standards Track)  
**Replaces:** Rosetta Pasigraphy Protocol v2.1.0 (RFC ENTIF-0001 v2.1.0)  
**Date:** 2026-01-08

## Conventions and Normative Language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in **RFC 2119**[\[1\]](https://drive.google.com/file/d/1CeYTGuwSvNu6aDwNL55KIvX3uU5FlqRq). All sections labeled “Normative” define mandatory protocol requirements; sections labeled “Informative” provide context, rationale, or examples. References to sections of this specification use the “§” symbol or specific Content IDs (CIDs) where applicable.

## Executive Summary *(Normative)*

Rosetta v3.0.0 defines a **minimal, stable, and extensible core spine protocol** for AI systems that integrate large language models, tools, human inputs, and multi-surface applications. Its design prioritizes **interpretability-first** operation: every piece of data and every step of computation is explicitly represented, content-addressed, and semantically typed. This enables consistent meaning preservation across components and full auditability of AI operations. The core spine provides a universal, content-addressed event ledger (the “Pasigraphy” of Rosetta) that other modules and standards attach to via extension packs, rather than by expanding the core itself. By maintaining a minimal invariant core and incorporating external standards through **Standard Packs (StdPacks)** and **Vocabulary Packs (VocabPacks)**, Rosetta v3.0.0 ensures that interpretability and semantic alignment are built-in from the ground up.

**Goals:** Rosetta v3.0.0’s design goals include: (a) a single unified semantic interlingua for knowledge representation (Pasigraphy tiles), (b) a universal operational event trace (run/action/toolcall spine) that is consistent across all executions, (c) rigorous content-addressing of all artifacts for immutability and provenance, (d) explicit representation of ambiguity, uncertainty, and context (interpretation pipeline with conjectures and frames), and (e) seamless interoperability with industry standards (semantic web ontologies, API contracts, event formats, UI accessibility standards) by treating those as attachable packs rather than core assumptions. The **interpretability model** is layered: raw signals are captured but not conflated with interpretations, which are separately represented and traceable; higher-level semantic constructs (concepts, frames, evaluations) are grounded in lower-level evidence. This layered approach ensures that Rosetta “understands” content in a way that is explainable and reproducible by tracing back through each interpretive step.

**Design Posture:** The core protocol is intentionally minimalist and agnostic to domain-specific ontologies or interfaces. It defines only the essential scaffolding (“spine”) needed for any cognitive operation: content-addressed tiles, a standard event sequence, an invariant meaning pipeline, and a governance framework for evolution. All domain specifics, UI considerations, and extended semantics are expected to live in **packs** that plug into this spine. This posture guarantees that improvements or customizations can be made by adding or updating packs (vocabularies, standards mappings, etc.) without altering the core. In practice, this means Rosetta’s core will remain **stable over time**, supporting backward-compatible evolution: new capabilities are introduced as new tile types or pack-defined extensions, leaving existing core semantics unchanged.

In summary, **Rosetta v3.0.0** provides an interpretability-first backbone for AI systems. It **MUST** be deployed as the single source of truth for meaning and process within an EntifAI system. External standards (from OWL2 ontologies to OpenAPI interface specs) are integrated in a controlled manner via packs, ensuring Rosetta’s native semantics remain the stable pivot. This specification is targeted at system architects, researchers, and ontology engineers, and it prescribes normative requirements (MUST/SHOULD/MAY) with rigorous definitions to eliminate ambiguity. All concepts are defined precisely in the glossary, and every normative statement is testable either via schema validation or via logical rules (e.g., SHACL shapes for graph constraints). The following sections detail the design goals and non-goals, define core terminology, describe the data model and meaning pipeline, specify the pack system and its usage for external alignment, outline conformance criteria, illustrate an end-to-end usage example, and finally present the Rosetta 3.0 Document Suite and governance of its evolution.

## Design Goals and Non-Goals *(Informative)*

**Design Goals:** Rosetta v3.0.0 builds on the Rosetta 2.x series with a sharpened focus on **preserving meaning** and **ensuring auditability**. The primary goals are:

* *Uniform Content-Addressed Knowledge Ledger:* All knowledge artifacts (inputs, interpretations, outputs, models of evaluation) are stored as immutable **Tiles** identified by cryptographic content hashes (CIDs). This ensures no piece of information is lost or altered without trace, enabling perfect recall and reproducibility[\[2\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ)[\[3\]](file://file-VPvbDFhiafCGdWciNgUMgB#:~:text=,L165).

* *Separation of Signals and Semantics:* The system distinguishes raw external signals from internal semantic interpretations. An input (e.g., user utterance or sensor reading) remains an immutable **Observation** tile; any interpretation or response is recorded as separate derived tiles with explicit provenance links, never overwriting or implicitly modifying the original[\[4\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ). This prevents semantic drift and conflation of truth vs interpretation.

* *Minimal Universal Spine:* The core execution loop of the system is standardized as a **universal spine** of events: every cognitive operation is represented as a **Run** containing a sequence of **Actions**, each possibly invoking **ToolCalls** and generating **Observations**, with subsequent **Evaluations**. This forms a chain of evidence for every decision and outcome[\[5\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ). The core protocol defines this spine generically to cover any context (conversational turn, API call, etc.).

* *Interpretability and Provenance First:* Ambiguity in interpretation is handled explicitly via **Conjecture** distributions and preserved uncertainty measures. The system does not output undifferentiated “answers” without context; instead, it provides traceable reasoning artifacts (scores, supporting evidence, alternative hypotheses) such that a human or another system can follow *why* a conclusion was reached. In practice, this means first-class support for **uncertainty objects** and multi-dimensional evaluation matrices (e.g., Ethos/Pathos/Logos/Quixote, see below) that quantify confidence and perspective[\[6\]\[7\]](https://drive.google.com/file/d/1rtBQWpYxsP3yMLYCK0nBAzfMtbJn6YaV).

* *External Compatibility via Extensions:* Rosetta’s interpretation pipeline and knowledge graph align with widely-used external standards *without* making those standards part of the core. Instead, Rosetta defines extension mechanisms (**StdPacks** for standard formats, **VocabPacks** for reference vocabularies) to import or map to external schemas (OWL classes, BPMN processes, OpenAPI specs, etc.). This goal ensures Rosetta’s internal representations can project onto or ingest from external systems easily, facilitating integration and migration while keeping core semantics stable.

* *Governed Evolution:* The architecture anticipates growth of the ontology and protocol. New concept types or schema changes go through a governed process – represented as special **proposal tiles** (e.g., rosetta.speciation tiles for new ontology branches) – ensuring that any extension or modification of core concepts is deliberate, versioned, and backward-compatible. Core invariants and definitions are locked unless explicitly superseded by a new version of this spec or an approved extension. In effect, Rosetta fosters a **controlled vocabulary growth** model: no silent mutations of meaning occur; instead, there are proposals, translators, and deprecation markers to manage change.

**Non-Goals:** To clarify scope, Rosetta v3.0.0 intentionally does *not* attempt the following:

* *One-Size-Fits-All Ontology:* Rosetta’s core is **not** a universal domain ontology that claims to model all real-world knowledge. It provides a meta-model (tiles, concepts, frames) and some base semantic primitives, but domain-specific ontologies (e.g., medical terminology, legal taxonomy) are expected to be integrated as external packs or anchored vocabularies. Rosetta **MUST NOT** be interpreted as “the one true ontology” for all external data[\[8\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ). Instead, it is a framework to **host** and align different ontologies without merging them arbitrarily.

* *Replacement for External Knowledge Bases:* Rosetta does not replace resources like WordNet, BabelNet, or industry schemas – instead it *bridges to them*. External lexical and knowledge resources remain authoritative in their domains and are incorporated via VocabPacks; Rosetta’s identity system doesn’t subsume them, it references them (with stable anchors and mapping tiles). The protocol explicitly **MUST NOT** silently treat an external identifier as a core concept – it has to be linked as an anchor (see Pack System)[\[9\]](https://drive.google.com/file/d/11NsOu35qLv19EajSiwW9jT13E7ifnJQ3).

* *Truth Oracle or Arbitrator of Truth:* Rosetta is a **meaning-preservation engine, not a truth engine**[\[10\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ). It will capture what was said or inferred, but it does not guarantee that interpretations are factually correct about the world – only that they are faithfully recorded and traceable. Declared “truths” in Rosetta are internal commitments (e.g., assumptions or working hypotheses), which are always tagged with provenance and context. Observations from outside remain just that – observations – unless converted into internal form by a deliberate process. Rosetta’s job is to keep track of meaning and reasons, not to assert that any given content is objectively true.

* *In-place Mutable Knowledge Store:* All updates in Rosetta occur via the creation of new tiles (with new CIDs) rather than in-place mutation. There is no concept of editing a tile’s content after the fact. If something changes or evolves (e.g. a definition is refined), a new tile is created and linked to the old via lineage metadata (like a supersedes reference or translator). The history remains intact. Rosetta is **NOT** a traditional mutable database; it’s an append-only ledger of knowledge. Supersession is achieved by new content-addressed artifacts, never by altering or deleting old ones[\[11\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ).

* *Monolithic or Centralized Implementation:* The specification does not prescribe a single implementation or centralized network. It is designed to work in decentralized or federated environments (p2p swarms) just as well as in a single-node context. For example, knowledge sharing via tile exchange can be done via content-addressing protocols (analogous to IPFS-style DHTs for CIDs). Conformance focuses on data formats and behaviors, not on forcing a specific network topology or storage mechanism. Issues like performance, consensus, or specific persistence strategy are beyond the scope of this spec (they can be addressed in separate infrastructure docs). The core ensures that if multiple nodes exchange Rosetta tiles, they can fully interpret each other’s data consistently (especially thanks to the normative meaning pipeline and shared pack definitions).

* *UI/UX Design or End-User Product Features:* While Rosetta interfaces with UI concerns (especially through the interpretability and accessibility requirements), it does not dictate how user interfaces should be built. It provides structures (e.g., that an agent’s output should carry certain labels or frames indicating context like “this is a friendly response” or “explanation style”), which a UI *could* use to present better. But actual UI rendering, conversational experience design, etc., are outside Rosetta’s core scope. Those belong to higher application layers or companion guidance. Rosetta ensures that any UI can get the needed meta-information (via packs for ARIA roles, design tokens, etc.), but it leaves visual or interactive design decisions to the implementers.

In summary, Rosetta v3.0.0 is focused on being a **reliable substrate** for meaning and process, not an all-encompassing AI or knowledge solution on its own. It draws a hard line between core responsibilities (addressing, provenance, semantic consistency) and everything else (to be done via extensions or external tools). This disciplined separation protects the core from unintended complexity creep and ensures that interpretability and auditability remain front and center.

## Normative Glossary *(“Terminology Lock”)*

*This section defines key terms used throughout the specification. All definitions here are normative and unambiguous. Terms defined in prior Rosetta documents or internal discussions are considered superseded by these definitions unless explicitly noted.* [\[12\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ)

* **Tile** – The atomic unit of information in Rosetta. A **Tile** is a content-addressed, immutable bundle consisting of a **TileEnvelope** (metadata like type, timestamp, provenance links, etc.) plus the tile’s content payload (whose structure is determined by the tile’s kind)[\[13\]](file://file-VPvbDFhiafCGdWciNgUMgB#:~:text=2). Every piece of data (from a raw input to a concept to a result) is encapsulated as a Tile. Tiles are identified by a *Content ID (CID)* and optionally may have higher-level stable references (RIDs). Tiles can reference other tiles (by CID) to form graphs (e.g., linking an interpretation tile to the observation tile it interprets).

* **CID (Content ID)** – The cryptographic content hash that uniquely identifies a tile’s immutable content bytes[\[14\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ). A CID is computed by first canonicalizing the Tile content (e.g., using JSON Canonicalization Scheme or an equivalent deterministic serialization) and then hashing it (using a multihash format, e.g., SHA-256). The CID serves as the globally unique address of that exact content. **Important:** The CID is *not* a semantic identifier; it changes whenever content changes, even for the “same” concept updated. CIDs are primarily used for deduplication, integrity verification, and linking.

* **RID (Rosetta ID, stable handle)** – An optional stable identifier for a Rosetta-native entity that may undergo revisions or have multiple representations. An RID is used to tie together successive versions or variants of a concept, frame, axis, etc., across tiles[\[15\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ). Unlike CIDs, which change on content change, an RID remains constant for an entity or idea. For example, a particular semantic concept (e.g., the concept of “financial transaction”) might have an RID that stays the same even as multiple Rosetta concept tiles refine its definition. **Format:** RIDs are URN-like; e.g., rid:\<namespace\>:\<ulid\> or possibly DID-based (rid:did:xyz\#fragment). The spec does not mandate one format but **RECOMMENDS** using globally unique, opaque identifiers (like a ULID) under a controlled namespace to avoid accidental collisions or semantic assumptions. RIDs MUST NOT be derived directly from content in an uncontrolled way (to avoid re-identifying distinct concepts accidentally)[\[16\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ).

* **XID (External ID)** – A generic term for any identifier originating outside Rosetta but referenced within it. Often called an **Anchor ID** or **Lexical Anchor**, an XID is typically namespaced by its source. For example, wn:03028374-n might be an XID for a WordNet synset, schema:Person for a Schema.org class, or ISO-3166:US for a country code. XIDs are used when Rosetta wants to link a concept or entity to a known external vocabulary or identifier system. The term **Anchor** is used because these IDs anchor Rosetta’s internal concepts to established external referents without making those external systems authoritative for identity. Rosetta v3.0 defines specific patterns for common XIDs:

* **LEXID** – A lexical resource anchor, e.g., WordNet ID, BabelNet ID, etc., used to ground Rosetta lexemes or concepts in known lexicons (see VocabPacks).

* **ANCHORID** – A more general anchor, could be to any external ontology or schema (like an OWL class URI or a Wikipedia QID). These often appear in StdPacks or VocabPacks to denote that a Rosetta concept “maps to” an external concept.

* **PACKID** – An identifier for an external resource pack itself (e.g., a particular version of WordNet as a pack has a PACKID). PACKIDs are content-addressed or version-tagged references to external datasets integrated into Rosetta.

* **TileEnvelope** – The standard wrapper metadata around tile content. The envelope contains fields such as: tile kind (type name or URI, e.g., rosetta.observation or rosetta.frame), a unique random nonce or GUID (to avoid hash collisions and to serve as a stable identifier if needed), timestamps (created, maybe observed time), author or source info (who/what created it, possibly a cryptographic signature or identity), and provenance links (like “derived-from” relationships or parent run IDs). The envelope is included when computing the CID except for certain parts like signatures (so that signatures don’t break content hash of the content portion). The precise schema of TileEnvelope is defined in the Data Model section. All persisted artifacts MUST be encapsulated in a TileEnvelope (even aggregate structures) so that they have a uniform identity approach[\[17\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ).

* **Run** – A tile of kind **rosetta.run** representing a top-level cognitive session or invocation trace. A Run is the container for a sequence of actions and their sub-events, analogous to a complete transaction or session log. For example, one user query answered by the system (which may involve multiple reasoning steps) would be one Run. Each Run has a unique ID and serves as the root of an **episode** or **trace** tree. In the universal spine, every Action ultimately ties back to a Run context[\[18\]](https://drive.google.com/file/d/1CeYTGuwSvNu6aDwNL55KIvX3uU5FlqRq).

* **Action** – **rosetta.action** tile, representing a single reasoning or processing step within a run[\[19\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). Actions can be hierarchical (an Action may spawn sub-actions). Examples: an agent’s reasoning step to decide which tool to call, a step to analyze user intent, etc. Each Action is linked to its parent Run (or a parent Action if it’s a sub-step). Actions often produce either a ToolCall or an internal decision. By structuring actions as explicit tiles, Rosetta allows granular governance and audit of each decision point in a process (who/what decided, based on what).

* **ToolCall** – **rosetta.toolcall** tile, representing an invocation of an external tool or service and its outcome[\[20\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). A ToolCall includes fields for the tool name/ID, the request parameters (or input payload), and the results/response (or a reference to an Observation tile capturing the response). It links to the Action that triggered it. ToolCalls are first-class events in the spine so that every interaction with external systems is recorded (for security, auditing, and reproducibility). For instance, if during a Run the agent calls a weather API, that call becomes a ToolCall tile with the request and the response captured.

* **Observation** – **rosetta.observation** tile, representing an immutable raw signal or piece of data captured by the system[\[21\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). Observations are the “ground truth” records of what was received from outside or from a tool. This can be user input text, a sensor reading, an image, a database query result, etc. Observations are typically linked as outcomes of ToolCalls or as initial inputs of Runs. By rule, Observations MUST never be retroactively changed. If a later correction or different reading is needed, that yields a new Observation tile; the old remains for trace. Observations ensure the system’s knowledge of the external world is fixed in time – interpretations can come and go, but the original evidence is preserved.

* **Evaluation** – **rosetta.evaluation** tile, representing a post-run or post-action assessment containing metrics, scores, or feedback about performance[\[22\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). Evaluations are part of the learning feedback loop. For example, after a run completes, an Evaluation tile may record that the outcome was successful or certain KPIs (latency, cost, user satisfaction score, etc.). Evaluations often include *uncertainty* measures or *confidence scores*. In Rosetta, evaluations themselves are content-addressed tiles (meaning results can be re-calculated and cross-checked later), and they feed into Rosetta’s rubric and learning processes.

* **Pasigram** – **rosetta.pasigram** tile, representing a canonical semantic unit (a language-neutral meaning, concept, or assertion)[\[23\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). A Pasigram can be thought of as an atomic “idea” or proposition that Rosetta understands independent of any particular language. It corresponds to the output of the Lexeme-to-Concept mapping in the meaning pipeline (Layer 2→3). In earlier terms, this is Rosetta’s interlingua element – the building block of meaning that is not tied to phrasing. A Pasigram might represent a concept like *Person*, or a statement like *“User wants to know the weather”*, or a specific semantic relation. Pasigrams are connected by **Frames** and **Relations** to form structured knowledge.

* **Lexeme** – **rosetta.lexeme** tile, representing a language-bound lemma or word sense[\[24\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). A Lexeme is essentially a dictionary entry in a given language, capturing the mapping from surface forms (words, morphemes) to meaning. Rosetta uses Lexeme tiles to bridge between text (or speech) and concepts: each Lexeme is linked to one or more Pasigrams (the conceptual meanings it can denote) and to the Forms (tokens, etc.) that realize it. Lexemes include morphological and language-specific data (e.g., part of speech, root form). They reside in Layer 2 of the meaning pipeline. Lexeme IDs can be anchored to external lexical databases (WordNet synset IDs, etc., as XIDs) via VocabPacks.

* **Form** – **rosetta.form.\*** tile, representing a raw linguistic form at Layer 1[\[25\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). There can be different subtypes of forms: e.g., rosetta.form.token for a text token occurrence, rosetta.form.phoneme for a unit of speech, or rosetta.form.image\_patch for a visual feature. Forms capture the actual observed signals in a normalized way. For text, a Form (token) tile might include the exact substring and pointers to its position in the observation. Forms are derived from Observations (Layer 0\) and then feed into Lexemes. By separating forms from lexemes, Rosetta prevents conflating surface string with meaning (mitigating ambiguity – e.g., the word “bank” yields two lexemes for financial bank vs river bank). Each Form can link to multiple candidate Lexemes via Conjecture (with probabilities), reflecting ambiguity.

* **Concept** – **rosetta.concept** tile, representing a language-neutral concept or entity node in the semantic graph[\[26\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). Concepts are a subtype of Pasigram often used for noun-like or entity-like meanings. They serve as primary nodes in Rosetta’s knowledge lattice or graph. A Concept tile might correspond to an abstract idea (e.g., *Freedom*), a concrete entity (*Paris* city), or a category (*WeatherForecast*). The **identity** of a concept in Rosetta can be anchored to external references (like a Wikidata Q-ID or an OWL class) but Rosetta also maintains its own stable RID for it. Within Rosetta’s internal workings, Concepts are related by Lattice Edges and organized into frames for context.

* **Frame** – **rosetta.frame** tile, representing a structured semantic frame that provides context or roles for concepts[\[27\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). Frames are used to interpret events, actions, or complex contexts. For example, a frame could represent a *question-answering context* or a *transaction event schema* with specific slots/roles (like agent, object, time). Frames help ensure correct interpretation: e.g., distinguishing literal statements from sarcastic ones by applying a “Satire” frame context. Each Frame tile defines certain roles (slots) and may constrain what kinds of concepts fill them. They often align with known schemas (possibly via anchors to things like schema.org actions or BPMN process roles). In the meaning pipeline, frames are part of the highest layer (3) where multiple concepts are assembled into a structured interpretation of a situation or sentence.

* **Relation (Lattice Edge)** – **rosetta.lattice\_edge** tile, representing a typed relationship between two tiles in the knowledge graph[\[28\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). The “Lattice” is Rosetta’s distributed knowledge graph (also called the **Tapestry** for context, see below). Lattice edges connect tiles with semantics such as *“concept A specializes concept B”*, *“tile X was derived-from tile Y”*, *“concept C in frame F plays role R”*, or *“observation O occurs-after observation P”*. Each Lattice Edge tile includes references to the source and target tile CIDs (or RIDs) and a relationship type (from a controlled set of edge families). Edge families include: **semantic** (e.g., subclass-of, instance-of), **temporal/provenance** (e.g., next-in-sequence, derived-from), **causal** (if represented), etc. Lattice edges are content-addressed themselves, enabling the graph to be versioned and shared piecemeal. By indexing edges as first-class tiles, Rosetta ensures relational knowledge can be validated and remains immutable once asserted.

* **Tapestry** – **rosetta.tapestry** tile, representing a compiled working set of tiles assembled under certain context or constraints[\[29\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). A Tapestry can be thought of as the “context graph” that an agent or process uses at runtime. For instance, before an LLM responds, it might assemble a Tapestry of the relevant knowledge (past conversation turns, relevant facts, rules in effect) given a budget of how much it can load (value of information gating). The Tapestry builder (a subsystem defined by the spec) takes queries and constructs this context incrementally (progressive disclosure). The Tapestry tile contains references to all included tiles and metadata about how it was built (e.g., which VOI thresholds were applied, which parts are locked vs expandable). Tapestries allow the system to optimize context and share it – e.g., a lightweight edge device might receive a pre-curated tapestry that fits its memory. They are essentially “context bundles” capturing a slice of the global lattice needed for a specific task.

* **Conjecture** – **rosetta.conjecture** tile, representing a distribution of candidate interpretations linking one layer of meaning to another (hypothesis set)[\[25\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). Conjectures are crucial in the meaning pipeline transitions:

* **Form→Lexeme Conjecture:** Given an observed Form (word token, etc.), a Conjecture tile holds the list of possible Lexemes (word senses) it could map to, with weights or probabilities for each, and references to evidence (like context or lexicon priors)[\[30\]](https://drive.google.com/file/d/11NsOu35qLv19EajSiwW9jT13E7ifnJQ3).

* **Lexeme→Concept Conjecture:** Given a Lexeme in context, a Conjecture lists possible Concepts (or Pasigrams) it might refer to, again with probabilities and evidence (including perhaps vector embeddings, prior knowledge, etc.).

* **Concept/Predicate→Frame Conjecture:** In understanding an event or sentence, a Conjecture might assign roles or pick which Frame applies (e.g., is this sentence a **Greeting** frame or a **Question** frame?). Each Conjecture is essentially a *linking artifact* that captures ambiguity as an explicit object rather than forcing a single choice. The Conjecture tile content includes the set of options (as references to other tiles) and associated scores, plus metadata about the inference method or model that generated it. Conjectures enable **epistemic humility**: the system can carry multiple hypotheses in parallel, and decision-making processes (or user feedback) can later resolve or update these Conjectures. Importantly, Conjectures are replayable if marked so (all needed info to recompute is logged) or explicitly flagged as non-replayable with justification (e.g., if a randomness or external model was involved that can’t be exactly reproduced)[\[30\]](https://drive.google.com/file/d/11NsOu35qLv19EajSiwW9jT13E7ifnJQ3).

* **Episteme** – **rosetta.episteme** tile, representing an “epistemic wrapper” or compiled truth assessment[\[31\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). An Episteme tile aggregates multiple evidence and evaluation matrices to summarize the state of belief about a particular assertion or question. Instead of saying something is simply true or false, an Episteme provides a structured balance sheet of pro and con evidence, degrees of confidence across different dimensions. For example, after gathering evidence and scoring with Pathos/Logos/Ethos axes, an Episteme tile about the claim “User is satisfied” might contain an overall confidence along with pointers to the underlying scores in rosetta.matrix tiles, references to supporting observations, counter-evidence etc. The purpose is to avoid **collapse of nuance**[\[31\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) – the system retains the nuance of uncertainty. Episteme tiles are typically produced at decision or output points where the system must assess truth or confidence (like whether to trust an information source, or whether a rule was violated in an Incident).

* **Matrix (ELPQ Matrix)** – **rosetta.matrix** tile, representing a unified vector of evaluation metrics across multiple axes (commonly Ethos, Logos, Pathos, and Quixote)[\[32\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). The ELPQ matrix is Rosetta’s format for scoring content or actions in a multi-dimensional space:

* *Ethos* (ethical alignment / trustworthiness),

* *Logos* (logical coherence / truthfulness),

* *Pathos* (emotional resonance / appropriateness),

* *Quixote* (whimsical/creative or alignment with non-utilitarian values – “the Quixote factor” introduced in earlier docs). Each Matrix tile holds a vector of values (and possibly sub-scores or error bars) for these axes. It can be attached to content tiles or outcomes as part of an evaluation. The axes themselves are defined in a versioned **Axis Registry** (in Rosetta, special tiles like rosetta.axis\_registry enumerate what axes exist and what they mean)[\[33\]](https://drive.google.com/file/d/11NsOu35qLv19EajSiwW9jT13E7ifnJQ3). If axes evolve or new ones are introduced, translator tiles map old matrices to new ones. The Matrix concept allows standardized evaluation outputs and is crucial for rubric evolution (the system can re-score historical actions by applying updated translators to old matrix tiles without altering the original run records)[\[34\]](https://drive.google.com/file/d/1CeYTGuwSvNu6aDwNL55KIvX3uU5FlqRq).

* **Policy** – **rosetta.policy** tile, representing machine-enforceable rules, configuration, or governance parameters, typically signed by some authority[\[35\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). Policies define what the system or agents are allowed to do, resource quotas, ethical constraints, etc. Examples: a content policy that disallows certain content categories, a cost policy that limits spending of tokens per hour, a user preference policy for style/tone. Policy tiles are signed (the TileEnvelope includes an attestation signature from a trusted key) so that nodes can verify the authenticity of rules. Policies have their own identity and versioning (e.g., a policy might be updated by issuing a new Policy tile with a pointer to supersede the old). In Rosetta’s trust model, policies are often part of genesis knowledge (some come from genesis blocks or initial configuration and are pinned in all nodes). They tie into the conformance profile (e.g., an “Auditor” profile node might enforce extra policies).

* **Receipt** – **rosetta.receipt** tile, representing a **signed attestation** about an event or artifact[\[36\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). Receipts are like notary statements: they confirm that something occurred or that something meets a condition. For instance, when a toolcall is made, the system (or the tool service) might return a signed receipt tile that “Tool X executed request Y at time Z and produced result R (hash reference)”. Receipts may also cover compliance attestations (e.g., “Output O passed all policy checks” signed by a compliance module). The signature and digest fields ensure non-repudiation (cannot be forged)[\[36\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). Receipts are first-class tiles on the spine (in fact, the spec encourages a “receipts-first” instrumentation – meaning design the system to produce receipts for everything important)[\[37\]](https://drive.google.com/file/d/1CeYTGuwSvNu6aDwNL55KIvX3uU5FlqRq). A special case are *quorum receipts* used in incidents (multiple parties sign off to open a sealed incident report, see below).

* **Incident Envelope** – **rosetta.incident** tile, representing a sealed analysis of a failure, safety violation, or other critical event[\[38\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). Incidents are treated specially in Rosetta: they are *sealed payloads* (the content may be encrypted or locked) that require a quorum of trusted parties (multiple receipts) to open[\[38\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). This allows capturing sensitive or dangerous data (like a prompt that triggered a disallowed behavior or a transcript of a misbehavior) in a way that is auditable (it’s stored and logged) but not immediately visible to all (to prevent leakage or misuse). The Incident tile contains a header (with metadata like severity, involved run IDs, etc.) and an encrypted blob that can be decrypted if certain conditions are met (e.g., 3 of 5 security officers provide keys). Incident envelopes ensure that “auditable without disclosure” is possible – the system can prove an incident was captured and account for it, without necessarily exposing the content to those without clearance[\[38\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). They integrate with external incident response systems via CloudEvents or similar (mapping available through StdPacks).

* **Delta** – A change or update represented in Rosetta. This is not a single tile kind but a concept: when the system learns or changes, it creates new tiles, and the **set** of changes can be packaged as a “Delta”. A **Delta Capsule** (tile kind rosetta.delta\_capsule) is defined as the unit of change propagation[\[39\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI). For example, if an ontology is extended with 5 new concept tiles and 10 new edges and a translator, that whole set can be bundled into a Delta Capsule tile to be sent to other peers as one package. Delta capsules include metadata about prerequisites and possible migration steps. They are signed and versioned. This allows safe, governed propagation of updates across a swarm (only peers that meet certain criteria apply the delta, etc.). The concept of delta ensures that even though Rosetta is append-only, we can communicate “what’s new” succinctly.

**Note:** The above terms form a “terminology lock” – any usage of these terms in Rosetta documentation or extensions **MUST** conform to these definitions unless a future version of the spec explicitly redefines them[\[12\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ). Older synonyms or variant terms (e.g., “Pasigraphy object” vs Pasigram, “Knowledge shard” vs Tile) are deprecated in favor of the above unified terminology. This avoids confusion as the project evolves.

## Data Model *(Normative)*

This section formalizes the core data structures of Rosetta: how Tiles are structured, how identifiers work, and how provenance and versioning are encoded. It defines the normative schema for TileEnvelope and base tile kinds. All Rosetta implementations **MUST** adhere to these data formats for interoperability.

### Tile Envelope and Canonicalization

Every tile is encapsulated in a JSON (or equivalent) structure called **TileEnvelope**. At minimum, the envelope contains the following fields (normative schema provided in Appendix or Schema Pack):

* **kind**: A string (or URI) indicating the tile’s type/kind. Examples: "rosetta.observation", "rosetta.concept", "rosetta.tapestry", etc. Core kinds are prefixed with "rosetta." and extension kinds with their pack namespace (e.g., "openapi.operation" if OpenAPI pack defines a tile type for API operation). The kind field governs the expected schema of the content field.

* **cid**: The Content ID of the tile (usually not stored explicitly in content, but computed). However, including it in the envelope can be useful as a self-check. If present, it must match the actual hash of the content. Typically, when serializing for storage or transmission, cid can be omitted (since it can be recomputed). For purposes of canonicalization, the cid field is **NOT** included in the content that is hashed (to avoid circular dependency).

* **rid**: (Optional) The stable Rosetta ID for the underlying entity, if applicable. Present for tiles that represent an evolving entity or concept. For example, all versions of the concept “UserProfile” might carry the same rid:entif:UserProfile RID. This allows linking across versions.

* **prev**: (Optional) Link to previous related tile(s). Used for versioning or supersession. If this tile supersedes or revises a prior tile, prev contains the CID (or RID+version reference) of that tile. There can be multiple (e.g., if merging branches). This field is important for provenance of updates: you can traverse prev links to reconstruct change history.

* **derived\_from**: (Optional) References to tiles from which this tile was derived. This is used for provenance tracking. For example, an Observation might have derived\_from empty (came from external input), but an Interpretation tile might have derived\_from: \[observationCID, somePriorKnowledgeCID\]. Conjecture tiles have derived\_from linking to the lower-layer artifact they interpret. This field typically holds an array of CIDs (or references with context).

* **run**: (Optional) References the Run context CID or RID if this tile is part of a run’s trace. All Action, ToolCall, Observation, Evaluation, etc., tiles that occur in a particular run should carry a run reference pointing to the parent rosetta.run tile’s ID. This provides a quick way to group trace events without only relying on graph traversal.

* **timestamp**: A creation timestamp (in a canonical format, e.g., ISO 8601 UTC). It records when the tile was created. Particularly important for ordering events and for computing time-based aspects in tapestry building. If a tile content has an inherent time (like an observation with a sensor timestamp), that can also go in content; but this envelope timestamp is when the system recorded the tile.

* **nonce**: A random or unique value to ensure that if two tiles have identical content (down to all fields above and content payload), they can still be given distinct hashes if needed. This deals with edge cases in content addressing (to avoid hash collision on purposeful identical content that needs separate existence). The nonce is typically a random 16-byte or a ULID. It’s especially used for receipts or things that might otherwise duplicate. **Rule:** If a tile needs to have the same semantic content as another but be treated distinctly (perhaps by a different author or at a different time), a different nonce ensures a different CID. Nonce is included in hash computation as part of envelope.

* **sig**: (Optional) A digital signature over the tile’s content (or certain parts). Present for tiles that require integrity and authenticity verification (receipts, policies, important communications). The signature is typically produced by the creator’s private key and can be verified by others using the known public key (e.g., a developer key, or a pack’s key). **Canonicalization note:** The signature is not included in the CID hash computation (because signature will always change the bitstream). Instead, the signature signs the CID or a stable representation of the content. Some implementations attach signatures out-of-band; others include it in envelope but ensure it’s excluded from the hashed portion.

* **auth**: (Optional) Authority metadata. For example, an identity of the author (which could be a DID or just a name or an agent ID), a list of witnesses for receipts, or a reference to a policy that authorized creation. This field is free-form structured, depending on context. For a rosetta.receipt, auth might contain the signer’s certificate or key ID. For a tile created by an automated process, auth might just name that process.

* **summary**: (Optional but **RECOMMENDED**) A short summary or “slug” of the content, for quick reference[\[40\]](https://drive.google.com/file/d/1CeYTGuwSvNu6aDwNL55KIvX3uU5FlqRq). This is part of Rosetta’s **inline semantic compression** strategy: every tile, particularly knowledge-heavy ones, includes a concise human-readable (and model-readable) summary (e.g., a one-sentence description or a vector embedding) so that context can be routed without always pulling full content. Summaries allow index and retrieval systems to do quick filtering. The summary is computed at tile creation and stored here. For example, a concept tile for “User login attempt” might have summary “Concept: user authentication event (login attempt)”. Summaries MUST be kept short (a few hundred chars at most) and deterministic or stable for same content (if auto-generated). They are included in the hash (so they themselves become part of the immutable content that was signed off) – this avoids a mismatch scenario where someone could alter the summary later to mislead.

* **content**: The core payload of the tile, structured according to kind. For each tile kind, the spec (or an extension spec) defines the JSON schema of this content. For example:

* For an Observation: content might have { "modality": "text", "data": "\<actual text or base64\>", "media\_type": "text/plain", "origin": "user" }.

* For an Action: content might include fields like action\_type (categorical label or code), parameters (if any), etc., and crucially maybe a pointer if it succeeded/failed or yielded an observation.

* For a Concept: content might have a human-readable name, maybe an anchor to an external concept ID, definitions or properties if not purely inferred, etc.

* For a Frame: content would list role definitions (like role name \-\> constraints or expected type).

* For a ToolCall: content would detail tool\_id, input (some structured request), and either output\_cid linking to an Observation or raw output data (but usually we convert output to an Observation).

* For Conjecture: content would have the distribution, e.g., {"options": \[ { "cid": X, "weight": 0.7}, { "cid": Y, "weight": 0.3} \], "model": "someModel-v1", "nonReplayable": false }.

* For Evaluation: could have metrics, e.g., a dictionary of metric name \-\> value.

* Etc. Each content schema is defined in the tile taxonomy or pack definitions.

The **canonicalization** process for computing CID is: 1\. Remove or exclude non-content fields that are not part of the hash (like cid itself, and any signature field if present, as well as any purely computed ephemeral fields that an implementation might add). 2\. Serialize the remaining structure in a deterministic way (for JSON, the spec mandates e.g. lexicographic ordering of keys via [JCS (JSON Canonicalization Scheme)](https://datatracker.ietf.org/doc/html/rfc8785) or a similar algorithm[\[41\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ)). 3\. Compute a cryptographic hash (SHA-256 is RECOMMENDED) and format it in multihash (prefix indicating hash type, then hash bytes, typically base58 or base64 encoding). 4\. The resulting string (or byte sequence) is the CID. That is stored/used as needed (and should match the cid field if present for consistency).

**Determinism:** All implementations must produce the same CID for the same tile content. This is critical. Therefore, any sources of variation (key order, whitespace, number formatting, etc.) are eliminated by the canonicalization rules. Multi-platform test vectors will be provided in the Schema Pack to verify that independent implementations indeed hash the example tiles to the same CIDs.

**Reserved Tile Kinds:** Rosetta core reserves the namespace rosetta.\* for core kinds defined in this specification (and possibly future minor versions). Extension packs should use their own distinct prefixes or URIs to avoid collision. The Document Suite’s Companion Index (Deliverable B) enumerates official pack namespaces. The core also reserves some numeric or special codes for content types if needed (for instance, short codes for Pathos, Ethos axes indices in matrices, etc., which are defined in Axis Registry).

### Content Identifier Roles and Hygiene

Rosetta distinguishes various identifier roles to ensure clarity of reference (a principle of **Identifier Hygiene**[\[42\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ)). In summary:

* **CIDs**: Identify exact content instances (immutable). Use when linking to a specific immutable piece of data or evidence. They allow verifying that content hasn’t changed (by recomputing the hash). CIDs are ubiquitous in lattice edges and provenance references.

* **RIDs**: Provide stability across content evolution. Use when referring to “the concept of X” or “the entity Y” abstractly. E.g., when writing a translator or a rule that should apply to any version of a certain ontology concept, one would use RID to not be tied to one version’s CID. RIDs are optional but strongly recommended for any knowledge that is expected to be versioned or extended.

* **XIDs (Anchors)**: Use to attach external meaning without making it primary. For example, a Lexeme might have an XID linking to WordNet, or a Concept might have an XID linking to an OWL ontology class. This means “this Rosetta item corresponds to that external item,” but Rosetta does not assume external’s full context. XIDs often come with Pack qualifiers (the pack defines how to interpret that XID).

* **PACKIDs**: Used internally in pack management to identify external resources. It’s part of the pack system (discussed later) but basically a way to name an external dataset or schema version so that the system knows which external references are valid. E.g., pack:wordnet:3.1 could be a PACKID for WordNet v3.1. This can be used inside XIDs (like wn:abc implies PACKID wordnet 3.1 by context or explicit mention).

* **Ephemeral IDs**: Some processes might use ephemeral IDs (like a temporary variable name in a reasoning chain). Those are not persisted as such; if needed, they get encoded into content or summary but not as official IDs.

One key rule: a given field or context should clearly use one type of ID. For instance, when linking an interpretation to an observation, use CID (because you want the exact piece of evidence). When specifying that a certain translator works for a concept across versions, use RID. When referencing an external item, use XID (with context of which pack or standard). This hygiene prevents confusion where, say, someone might treat a CID like a concept identifier (which it isn’t — it’s version-specific only).

### Provenance and Lineage Encoding

Provenance of tiles – how they came to be – is recorded both in the envelope (derived\_from, prev) and in explicit provenance tiles like evidence edges or receipts: \- The **derived\_from** array in a tile’s envelope links to immediate input artifacts. For example, an Evaluation tile might have derived\_from: \[runCID, rubricCID\] meaning it resulted from evaluating that run with that rubric. A Conjecture tile will have one item in derived\_from (the thing it interprets, like an Observation or Form) plus references in its content to the sources of priors (like lexicon used). \- The **prev** field (as noted) links a tile to a prior version or superseded tile. This is used for *lineage* in the sense of version history, distinct from *derivation* in an execution sense. E.g., *Tile B prev→ Tile A* means B is a revision of A. Whereas *Tile B derived\_from→ Tile A* means B was computed from A in a process. \- **Receipts and Attestations:** When an action or external process occurs, a Receipt tile (which itself is a kind of Observation, logically) provides provenance that “X happened as recorded.” For example, after a ToolCall returns, the system might generate a rosetta.receipt that includes digests of the request and response. That receipt’s CID can then be referenced by any Evaluation or audit logs to prove that the toolcall outcome was authentic. \- **Edge-based Provenance:** The Rosetta lattice will include edges like prov:wasDerivedFrom between CIDs. (We can map to W3C PROV-O relations[\[43\]](https://www.w3.org/TR/prov-o/#:~:text=The%20PROV%20Ontology%20%28PROV,based%20applications) – in fact, we align with PROV-O in StdPacks, see Interop section). For normative usage: whenever a tile is created by using content from other tiles, it **MUST** either include those in derived\_from or be connected by a lattice edge of appropriate type (and usually both). For example, if a summary is extracted from a text Observation, there should be an edge Observation CID \--\[summary\_of\]--\> SummaryTile CID. \- **Temporal Order:** Timestamps help but we also include sequence numbering in runs implicitly. Each Action in a Run can have a sequence index or be linked via a “next” edge to enforce an order. The run’s content might maintain an ordered list of the top-level events (though duplicative, it helps quick parse). Or we rely on lattice edges: e.g., each Action tile could have a field index: N or an edge previous\_action \-\> this\_action.

### Revision and Supersession

Rosetta ensures backward compatibility by never deleting old tiles – but marking them superseded or obsolete via new tiles: \- If a Concept’s definition is refined, a new Concept tile is created with prev pointing to the old. Both exist; knowledge referencing the old doesn’t break, but ideally migrators can move to the new. A translator tile (like rosetta.concept\_translator) can be provided to map facts from old concept to new concept if structural changes. \- The DocID scheme (discussed later) also uses a versioning scheme (like ROCK-IDs with version field) for specification documents; analogously, content tiles that correspond to standards or schemas will incorporate version in their RID or content. \- **Deprecated markers:** There might be a special kind of tile or edge that marks something as deprecated or replaced. E.g., rosetta.policy.deprecation tile might list CIDs or RIDs that should no longer be used and what supersedes them. This is likely in governance and not core, but implementers should respect such markers in profiles that require up-to-date knowledge (e.g., a “strict” profile might warn if using deprecated concept). \- **Content negotiation:** Because old tiles remain, an agent might find multiple versions of concept with same RID. In general, the highest version (by embedded version number or by chain length in prev links) should be used, unless operating in a backward-compatibility mode. Conformance tests will likely ensure an implementation can gracefully handle encountering an outdated tile (maybe by auto-fetching the newer one via the prev link and a translator).

In summary, the data model enforces that every piece of information has a place and an ID: ephemeral processing is minimized. If something influences decisions, it should be captured as a tile or edge. This discipline allows the entire state and history to be queryable and analyzable – crucial for interpretability and audit.

## Meaning Pipeline *(Normative)*

Rosetta’s interpretability-first design is embodied in its **Four-Layer Meaning Pipeline**[\[44\]](https://drive.google.com/file/d/11NsOu35qLv19EajSiwW9jT13E7ifnJQ3). This pipeline defines how raw signals transform into semantic understandings and ultimately into actionable knowledge or responses. Each layer has specific tile types and rules. Implementations **MUST** separate these concerns and produce the corresponding artifacts at each stage (explicitly or implicitly). The layers are:

**Layer 0: Signals (Observations)** – Raw input from the world, recorded without interpretation. This includes user utterances, sensor readings, API payloads, any external stimuli. In Rosetta, these are captured as rosetta.observation tiles as described. They are immutable and context-specific (i.e., an observation knows which Run it belongs to and possibly which “lens” or input channel). *Example:* An Observation tile containing the text “Book me a flight tomorrow” from a user at 2026-01-08T10:30Z.

* *No meaning is attached yet* aside from obvious metadata like modality or origin. The system does **no semantic processing in Layer 0** beyond capturing the data faithfully. Think of it as the camera image or microphone waveform or raw text – it’s just recorded.

* Observations may be pre-processed into alternative representations (e.g., an image could yield an optical.slug for compression[\[45\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI), or audio yields a text transcript Observation created by ASR). But even those conversions, when done, result in new Observation tiles (with appropriate provenance linking to the original raw). So the pipeline can branch: one raw observation may yield another observed form via a tool (like ASR or OCR) – but we still consider those results as layer 0 outcomes (they’re still “signal” because they’re not yet semantic interpretation, just format conversion).

**Layer 1: Forms (Signals → Forms)** – Low-level linguistic/structural tokens extracted from signals. This is where syntax or basic feature extraction happens. It includes tokenization of text, detection of sentences, identifying entities as spans (without resolving what they mean), turning audio into phonemes or text tokens (if not done in L0), etc. Output: rosetta.form.\* tiles.

* *Example:* From “Book me a flight tomorrow”, Layer 1 might produce forms like: Token1=”Book”, Token2=”me”, Token3=”a”, Token4=”flight”, Token5=”tomorrow”. Each is a rosetta.form.token with references to char offsets in the original text Observation. Additionally, perhaps an entity form: rosetta.form.datetime for “tomorrow” tagged as a date expression with value \= tomorrow’s date.

* The pipeline at this stage deals with structure, not meaning. It can involve part-of-speech tagging or shallow parsing (though POS tags might blur into semantics slightly, but we consider them still form-level because they attach to surface word usage rather than concept).

* Each Form can include a link to its originating Observation and position. Tools like NLP engines produce these forms, and we encourage capturing their output deterministically. E.g., if a particular tokenizer is used, its output on a given text should always yield the same form sequence (for reproducibility; if the model is nondeterministic, it should log a seed or model version to make it effectively deterministic).

* **Conjecture from L0 to L1:** Usually not needed, as L1 is more deterministic, but sometimes you might have multiple hypotheses of how to segment or hear something. If so, Rosetta could create multiple Form sets and perhaps a Conjecture representing the ambiguity (e.g., ambiguous segmentation of a sentence). However, typically we treat the signal processing as giving one best set of forms. Ambiguities like homophones get resolved in L2 as lexical ambiguity.

**Layer 2: Lexemes (Forms → Lexemes)** – Language-specific lexical interpretations of forms. This is where words or phrases get mapped to their dictionary meanings (senses), still within the context of the language. Output: rosetta.lexeme tiles for each significant lemma or phrase, and **Lexical Conjectures** if needed to capture ambiguity.

* *Example:* For the token “Book”, possible lexemes include *BOOK (noun, a reading book)* or *BOOK (verb, to reserve)*. The pipeline will generate a Conjecture linking the token form to these lexeme options. The context (“Book me a flight”) strongly favors “book (verb)” meaning *reserve*, so the Conjecture might assign 0.95 weight to the verb lexeme and 0.05 to the noun (or any other reading, which likely is negligible here). That Conjecture is a rosetta.conjecture tile citing the token and listing lexeme CIDs.

* Similarly, “flight” might map to lexemes *FLIGHT (noun, journey by air)* vs *FLIGHT (noun, act of fleeing)* vs *FLIGHT (noun, series of steps)* etc. The model (with context “book flight”) will heavily weight the travel meaning. Another Conjecture tile for that.

* The output lexeme tiles for chosen senses (like *book.v1 \= reserve*) are linked to a VocabPack like WordNet or a custom lexicon. Actually, the lexeme tile could contain the word and a reference to an external sense ID (WordNet synset for “book.v.01”) thereby anchoring it. The Conjecture might not be needed if the system picks one with near certainty, but formally, the pipeline concept includes it for transparency of ambiguity resolution.

* Grammar: Some languages require multi-word expressions (e.g., “set up” might be one lexeme meaning “arrange”). The form layer could either produce a combined form or the lexeme layer could detect collocations. Either way, lexeme identification should handle those (with either lexeme representing multi-word or linking to multiple forms).

* **Lexical Resources:** The Lexeme layer is where external lexical resources plug in. A **VocabPack** for a language provides the inventory of lexemes and often their relationships (synonym sets, etc.), as well as morphological analyzers. Rosetta can use that to validate or enrich lexeme tiles. For conformance, an implementation SHOULD use a known lexicon for major languages (e.g., WordNet for English) to anchor lexemes, but it's not mandated which one – if you do, indicate via anchors (XIDs like wn:). For domain-specific jargon not in general lexicon, custom lexemes can be created (with an internal ID or an extension pack).

* This layer finalizes language interpretation but not the conceptual one. It disambiguates word meaning in context but hasn’t tied those meanings to Rosetta’s universal concepts yet. So after Layer 2, we have something like: \[Book (verb meaning reserve), me (pronoun maybe linking to concept of the user), flight (noun meaning airplane trip), tomorrow (a date reference lexeme resolved to actual date perhaps)\].

**Layer 3: Concepts & Frames (Lexemes → Concepts/Frames)** – Language-neutral semantic representation. Lexical meanings are mapped onto Rosetta’s core concepts, relations, and frames, constructing an internal semantic graph (the Pasigraphy). This is where the system “understands” the input in its own representation. Outputs include rosetta.concept tiles, rosetta.frame tiles (if an interpretive frame is applied), rosetta.lattice\_edge tiles linking them (like indicating roles or relationships), and possibly refined Conjectures if there is ambiguity in concept mapping.

* *Example:* The lexeme *book (verb: reserve)* will map to a Rosetta concept perhaps called ReserveAction or something akin to a generic “Booking” concept. If Rosetta’s core ontology or packs have a concept for “booking a ticket”, that concept tile is used. Otherwise, a new ad-hoc concept might be created (but typically common actions are in the core or packs). The phrase “me” refers to the user – likely resolved to a concept representing the user (maybe a specific user identity concept tile if known). “flight” lexeme (journey by air) maps to a concept like AirTravelTrip. “tomorrow” as a date lexeme is interpreted to a concrete date/time concept or literal value concept.

* These concepts may need to be connected: likely a Frame for a *Booking request* is recognized. Perhaps a rosetta.frame tile of type TravelReservationFrame with roles like agent (who is booking), item (what is being booked, here a flight), date (when). The system would connect the concepts to the frame: e.g., an edge: (UserConcept) \--\[fills role=agent\]--\> (Frame), (AirTravelTrip concept) \--\[fills role=item\]--\> (Frame), (Date concept for tomorrow) \--\[fills role=date\]--\> (Frame). The frame itself might be anchored or standard (maybe derived from an ontology or just implicit).

* If multiple frames could apply (maybe the system is deciding if this is a travel booking vs something else), a Frame Conjecture would be present. But context likely clearly indicates it's a booking request, so possibly no ambiguity there.

* The output of layer 3 is effectively a mini knowledge graph representing the meaning of the utterance: something like:

* Concept(User) \--\[requester\]--\> Frame(BookingRequest) \<--\[action\]-- Concept(ReserveAction)  
                                      Frame(BookingRequest) \--\[object\]--\> Concept(FlightTrip, with date=tomorrow)

* (The exact structure can vary by design; some might just produce a logical form or a small JSON, but Rosetta’s way is to instantiate these as actual tiles/nodes and edges.)

* These concepts and frames are now language-neutral. If an agent in another language asked the same, ideally they'd map to the same concepts. Rosetta can thus accumulate language-agnostic knowledge (like it knows the user wants a flight on date X, independent of how it was phrased).

* **Interpretation Rules:** The spec mandates certain rules, e.g., *signals vs semantics invariant*: no direct promotion of an observation to a concept without a proper interpretation step[\[4\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ). That means the pipeline must always go through forms/lexemes to concept, not just label an observation as a concept arbitrarily. In practice, if someone tries to store user text directly as a concept content, that would violate the separation (it would be a concept with basically raw text as definition – not allowed without a lexeme linking process). Observations should remain at layer 0, and only their interpretations become layer 3.

* **Uncertainty at L3:** If there's ambiguity unresolved (like multiple possible target concepts), a Conjecture at concept level holds it. E.g., if an utterance could mean two different things, one might spawn two different frames or concept sets, each in a Conjecture. This is more rare for straightforward commands but common in knowledge tasks (like ambiguous questions). The Conjecture carries forward until something selects one (user clarification or down-stream process).

**Non-collapse of uncertainty rule:** At no point should the system arbitrarily pick one interpretation and discard others without record. Either it should maintain the Conjecture or if it picks one, it should record the rationale (like a high probability or a policy to default) and ideally keep a path to recover alternatives. This ensures the system doesn’t unknowingly commit to a wrong interpretation without trace.

**Epistemic layer (optional formal layer 4)**: Rosetta sometimes is described as having an “Epistemic layer” beyond basic semantic interpretation, to handle truth assessments and knowledge evolution (Episteme and Evaluation). In this spec, we integrate those as part of the workflow rather than a strict pipeline layer, since after conceptualizing something, the system might query knowledge base or evaluate truth. You could consider: \- Layer 4: *Post-interpretation reasoning*, producing Episteme and Evaluation tiles. But those fit in Feedback and Conformance sections. The core pipeline focus is 0-3 as above.

**Evidence and Traceability:** Each jump in the pipeline should link artifacts: \- Observations and Forms: the token forms have pointer to the observation ID and indices. \- Forms to Lexemes: a Conjecture linking to the form, or at least lexemes have reference to which form(s) they came from (maybe store the surface string and pointer). \- Lexemes to Concepts: lexemes or a Conjecture linking to concept. Possibly each concept tile might list the lexeme anchor it was triggered by (especially if concept is newly minted). \- Frames to utterance: frames might have a pointer to the originating run or top-level observation for context. All these links allow someone to start at a concept and go backwards: “Why do I have concept X? Because lexeme Y from observation Z led to it, with these probabilities.”

**Conformance requirements:** \- Systems **MUST** produce tile outputs corresponding to each layer explicitly, or must behave *as if* they do (meaning that for audit, one can retrieve those tiles). A lazy implementation might not store all Conjectures if an ambiguity is near-zero, but it should be capable of generating it upon request. The safest approach is to always generate and store at least ephemeral Conjecture objects during processing, even if not all are saved to persistent store unless needed. \- The transformation algorithms (tokenization, parsing, word sense disambiguation, frame recognition) are not fully mandated (that’s an implementation choice, possibly ML-driven). However, the interface and artifacts produced *are* mandated by spec. For instance, whether you use a statistical model or rules for WSD, you must produce a Conjecture tile for the result anyway. This allows swapping different methods underneath while maintaining a consistent output structure.

**Aligning with Standards:** The pipeline design aligns with linguistic standards: one can see parallels to NLP pipelines. For broader context, we note: \- OWL/RDF alignment: Once at layer 3, the concepts and frames essentially form an RDF graph: concepts \= instances/classes, frames \= n-ary relations, edges \= properties linking them. Indeed, a StdPack could export the frame with RDF triples (which align to an ontology). We might note that one can treat Lexeme as skos:Concept (concept in lexicon) and concept as owl:Class or individual depending. The spec ensures we have the hooks to do this mapping in packs. \- PROV alignment: The pipeline itself can be documented with PROV-O: e.g., form wasDerivedFrom observation, lexeme wasDerivedFrom form, etc., which fits PROV’s data model of derivations and usage. A PROV-O mapping is provided in the standard pack for provenance (so Rosetta can interoperate with external provenance systems if needed).

In conclusion, the Meaning Pipeline normative requirement is that any Rosetta-compliant system MUST separate and explicitly represent the different stages of interpretation. By doing so, it achieves interpretability (you can interrogate the system: “what did I hear? what words did I think those were? what did I think they meant literally? what concept do I believe it refers to?” and get concrete answers with references[\[44\]](https://drive.google.com/file/d/11NsOu35qLv19EajSiwW9jT13E7ifnJQ3)). Additionally, this pipeline approach localizes errors – if a misunderstanding occurs, one can pinpoint if it was a speech recognition error (layer 0→1), a lexical ambiguity (layer 1→2), or a conceptual confusion (layer 2→3). Each layer’s artifacts allow targeted correction or learning.

## Pack System Architecture *(Normative)*

Rosetta’s extensibility and external alignment are handled through a **Pack System**. Packs come in two flavors: \- **Standard Packs (StdPacks):** integration points for external standards, formats, or protocols (OWL ontologies, BPMN processes, OpenAPI specs, CloudEvents, etc.). \- **Vocabulary Packs (VocabPacks):** integration of external vocabularies, taxonomies, or knowledge bases (WordNet, domain ontologies, design token libraries, etc.).

The Pack system allows Rosetta to incorporate external knowledge *without polluting core namespaces or semantics*. Each pack has its own namespace, identifiers, and a defined way it anchors into Rosetta’s core model. This section defines how packs are structured, how identity and anchors work, and guidelines for creating packs.

### Pack Definition and Namespace

A **Pack** is a collection of extension specifications or data that augment Rosetta. It typically includes: \- New tile kinds or sub-kinds (with schemas). \- Standardized anchors (XIDs) and mapping rules to core concepts. \- Translator tiles or rules if needed to convert between external representation and Rosetta’s. \- Conformance tests or shapes (for packs that enforce certain structure, like SHACL shapes if a pack defines constraints). \- A version indicator (packs are versioned and content-addressed themselves ideally).

Each pack is identified by a unique **Pack Namespace**. We use a concise prefix to refer to it. E.g., \- owl: might be used for OWL2-related identifiers (though OWL classes could also be full URIs; pack can define prefix mapping). \- prov: for PROV-O (provenance ontology terms). \- bpmn: for BPMN elements, \- openapi: for OpenAPI constructs, \- aria: for ARIA roles, \- etc. However, since some collisions might occur in short forms, pack authors should choose something distinctive (perhaps using their own domain names or well-known prefixes). The Document Suite’s Companion Index provides a recommended list of prefixes for the standard packs aligned in this spec (Deliverable B).

Within the content of Rosetta tiles, any reference to external concept uses the pack’s namespace and the external ID. This is how “anchors vs identity” is managed: \- Rosetta’s internal concept has an RID (Rosetta identity) that is independent. \- If we want to note that it corresponds to, say, OWL class :Person in some ontology, we attach an XID like owl:Person (assuming the pack defines that prefix to the full IRI of the class in the OWL file). \- The system does not treat owl:Person as a Rosetta concept in itself. Instead, either the pack provides a pseudo concept or a translator that when it sees owl:Person anchor on a concept, can fetch or infer more information if needed (like from the OWL ontology). \- VocabPacks similar: a lexeme might have wn:01234567-n anchor linking to WordNet synset, but Rosetta doesn’t treat the WordNet’s hierarchy as primary—Rosetta can ingest it if needed via edges but it’s done via pack logic.

Each pack can also define **Tile Extensions**: \- For example, an OpenAPI StdPack might define a tile kind openapi.endpoint which is a Rosetta representation of an API endpoint, with fields like path, method, schema, etc. It would then define how a openapi.endpoint maps to Rosetta core concepts (perhaps an endpoint concept plus a frame for request/response). \- A WCAG StdPack might not define new tile kinds but rather provides anchors and maybe evaluation metrics (like for each WCAG guideline an anchor and something in rubric). \- A Design Tokens pack might define tile kinds for design token entities or simply define a format to attach design tokens to Rosetta UI content.

**Anchor vs Identity:** This is a crucial principle: \- **Anchors** (XIDs from packs) supply *background identity or reference* but **do not replace Rosetta’s own identity for core objects**. For instance, if we have an OWL ontology of animal taxonomy, and in Rosetta we have a concept “Canine”, we might anchor it to owl:Dog class. If tomorrow we change which ontology or a new version, we can update anchors, but the Rosetta concept (with RID) remains consistent in Rosetta context (so internal knowledge stays stable and packs just help translation). \- **Identity Governance:** Rosetta’s core identity (RIDs) is governed by Rosetta specs and its community (with reserved ranges, as the DocID scheme section will explain for docs, similarly for concept space maybe). External identity (XIDs) is governed by external authorities. The pack’s job is to mediate – basically disclaim: “anything in this namespace is defined elsewhere (spec reference), and we just use it as needed.” A pack may also provide static mapping tables (like “WordNet synset \-\> Rosetta concept RID” mapping tile if someone wants a one-to-one integration). \- **No Redefinition:** A pack MUST NOT redefine or alter core semantics. E.g., an OWL pack could bring in an OWL version of “Action” class, but it should map to Rosetta’s concept of Action rather than trying to override what Action means. If there’s a conflict, the pack has to adapt (like maybe not use that OWL class or provide a translator). This policy ensures core remains consistent[\[46\]](https://drive.google.com/file/d/1rtBQWpYxsP3yMLYCK0nBAzfMtbJn6YaV).

### Example: OWL2 and RDF Integration (StdPack)

The Semantic Web StdPack encompasses OWL2, RDF(S), SKOS, SHACL, and PROV-O. This pack allows Rosetta to exchange data with semantic web tools and to use ontologies for reasoning guidance.

* **OWL2:** In Rosetta, an OWL class or property from an ontology is an external artifact. The pack might allow importing an ontology: essentially loading all classes as Rosetta concepts anchored to OWL IDs, and loading individuals as concept instances or as data in Rosetta’s lattice. Alternatively, one might not fully import but reference on the fly. The pack provides conventions like: owl:Class anchors to rosetta concepts, rdfs:subClassOf maps to rosetta.lattice\_edge of type is\_a. We cite that OWL2 provides formally defined meaning for ontologies[\[47\]](https://www.w3.org/2012/pdf/REC-owl2-overview-20121211.pdf#:~:text=The%20OWL%202%20Web%20Ontology,It%20describes%20the%20syntaxes). A Rosetta concept anchored to an OWL class can thus be reasoned about using OWL semantics externally, but inside Rosetta, it’s just a concept with maybe an edge to a parent concept per the ontology if we imported that relation.

* **RDF/RDFS:** Rosetta’s internal graph can be viewed as an RDF graph (with CIDs perhaps as node IDs). The pack could define an RDF export of tiles: e.g., each concept tile becomes an RDF node with properties for its relationships. The pack can assign URIs to Rosetta items (maybe based on ROCK DocIDs or concept RIDs). Conversely, Rosetta can ingest an RDF triple by turning it into a concept and edge. The key point: RDF is a *data model* (triples) which Rosetta’s lattice already inherently aligns with (subject-predicate-object). We align design such that Rosetta lattice edges basically implement a superset of RDF: they allow n-ary via frames too, but binary edges correspond well. We know RDF is a standard for data interchange on the Web that allows merging data from different schemas easily[\[48\]](https://www.w3.org/RDF/#:~:text=RDF%20is%20a%20standard%20model,data%20consumers%20to%20be%20changed). Rosetta leverages that by ensuring our model of linking can output to triples that external reasoners can understand.

* **SKOS:** If someone uses a SKOS vocabulary (for e.g., define controlled tags or taxonomy terms), a SKOS concept scheme can be integrated as a VocabPack. But it’s listed with StdPacks because SKOS is both a vocabulary and a standard. Possibly, one could have a pack that imports SKOS concept schemes as Rosetta concept trees. SKOS mainly introduces terms like skos:Concept, skos:broader/narrower. These map straightforwardly to Rosetta concept and lattice edges (broader→ likely an is\_a or similar hierarchical relation). The pack ensures when we output or import SKOS data, we do it consistently (e.g., label fields might map to Rosetta’s concept name).

* **SHACL:** SHACL is a shape language for validating RDF graphs[\[49\]](https://www.w3.org/TR/shacl/#:~:text=This%20document%20defines%20the%20SHACL,user%20interface%20building%2C%20code%20generation). In Rosetta, SHACL can be repurposed to validate our lattice. We treat some SHACL shapes as akin to constraints on tile content and edges (for example, a shape could enforce that “every rosetta.frame of type BookingFrame must have at least one concept filling its ‘item’ role”). The StdPack for SHACL could provide shapes corresponding to Rosetta core invariants and profile constraints. Also, if we export an RDF version of our data, one can directly apply SHACL for validation. Conversely, one might define Rosetta’s own constraint language or simply incorporate SHACL engine. For conformance, the spec RECOMMENDS using SHACL shapes to define profile rules (see Conformance section), aligning with the idea that SHACL is a W3C standard for validating graph structures[\[49\]](https://www.w3.org/TR/shacl/#:~:text=This%20document%20defines%20the%20SHACL,user%20interface%20building%2C%20code%20generation).

* **PROV-O:** PROV-O (Provenance Ontology) defines a set of classes like prov:Entity, prov:Activity, prov:Agent and relations like prov:wasGeneratedBy, prov:used, prov:wasDerivedFrom[\[43\]](https://www.w3.org/TR/prov-o/#:~:text=The%20PROV%20Ontology%20%28PROV,based%20applications). Rosetta’s run/action, observation, etc., can map to these: e.g., rosetta.run \~ prov:Activity (an execution), rosetta.observation \~ prov:Entity (data produced/used), rosetta.action \~ prov:Activity (sub-activity maybe). The pack can allow exporting the full provenance trace in PROV-O format, which can be consumed by external systems. Additionally, if an external PROV trace comes in, Rosetta can incorporate it (but likely Rosetta is the generator of provenance for itself). We aim to align terms: for example, Rosetta’s derived\_from edges align with prov:wasDerivedFrom (both meaning one entity derived from another). We cite PROV-O as providing a formal framework for provenance interchange[\[50\]](https://www.w3.org/TR/prov-o/#:~:text=The%20PROV%20Ontology%20%28PROV,based%20applications). So a PROV-O pack ensures our internal provenance can interop with external systems that speak PROV (like provenance databases or visualization tools). Possibly we include prov:Agent mapping to known sources (like user or tool as agent).

* **BPMN, DMN, SCXML:** These are more dynamic/process standards:

* *BPMN* (Business Process Model and Notation) is a graphical notation for business workflows[\[51\]](https://www.omg.org/bpmn/#:~:text=The%20Business%20Process%20Model%20and,process%20semantics%20for%20technical%20users). A BPMN pack might allow describing parts of Rosetta workflows or knowledge in BPMN form. For instance, a multi-step plan or tool orchestration can be exported to a BPMN diagram. Or conversely, a BPMN model drawn by a user can be imported as a sequence of actions in Rosetta (with each BPMN task as an Action tile type). BPMN’s concept of processes, gateways, events etc., would map to Rosetta Action sequences, conditions, etc. It's likely an informative integration: ensure that what Rosetta does could be documented in BPMN for business stakeholders if needed. If required, a pack might create mapping where each Rosetta action kind (like a conditional step, loop, etc.) corresponds to BPMN elements.

* *DMN* (Decision Model and Notation) is a standard for decision logic (like decision tables). A DMN pack could allow embedding decision tables as Rosetta policy or rubric content. For example, a DMN decision table might be converted to a set of rosetta.policy rules or rosetta.matrix evaluators. Or Rosetta could output its learned decision logic into a DMN table to share with business rules engine. The mapping might not be trivial, but at minimum, Rosetta can anchor to DMN definitions (like if a certain DMN rule ID is triggered, Rosetta can refer to it).

* *SCXML* (State Chart XML) is a state machine notation[\[52\]](https://www.w3.org/TR/scxml/#:~:text=This%20document%20describes%20SCXML%2C%20or,CCXML%20and%20Harel%20State%20Tables). If an agent’s behavior is defined as a state machine, Rosetta’s run/ action structure can implement it. A SCXML pack might allow describing agent flows in SCXML and have Rosetta follow it or verify it. E.g., one could enforce that the sequence of Actions in a Run corresponds to a path in a SCXML state machine (pack does runtime checking or generation). For external integration, if a device uses SCXML to define dialogues, Rosetta can map its events to SCXML transitions. The pack would align SCXML’s notion of states and events with Rosetta’s concept of Action states and Observation events.

The above packs are part of interpretability-first principle: by aligning with these standards, we ensure Rosetta’s workings can be communicated to stakeholders in familiar forms (like BPMN for business processes, DMN for decisions, etc.), and can ingest established knowledge (like OWL ontologies or WAI-ARIA semantics) rather than reinventing.

### Example: OpenAPI, AsyncAPI, CloudEvents, OpenTelemetry Integration (StdPacks)

These packs focus on operational integration (interfaces, events, telemetry):

* **OpenAPI Pack:** OpenAPI spec defines a standard, machine-readable interface for RESTful APIs[\[53\]](https://swagger.io/specification/#:~:text=The%20OpenAPI%20Specification%20defines%20a,understand%20service%20capabilities%20without). In Rosetta, interactions with external APIs and services are captured as ToolCalls. The OpenAPI pack can be used in two ways:

* **API Schema Ingestion:** If we have an OpenAPI spec (YAML/JSON) for a service, the pack can create Rosetta representations of each operation and schema. For example, an openapi.operation tile for each endpoint, with fields: method, path, input schema, output schema. The pack could also generate concept frames for typical requests/responses. This means Rosetta can “understand” API calls in semantic terms. For instance, an OpenAPI operation “POST /flightBookings” can be anchored to a concept like FlightBookingCreateAction. The toolcalls to that API then can be annotated with that concept.

* **Request/Response Logging:** The pack might specify that each ToolCall associated with an OpenAPI-tracked service should produce a summary in OpenAPI terms. Possibly attach the actual request/response data to known schema fields or convert to JSON that can be validated by the OpenAPI schema. Essentially, bridging the JSON content of the call with Rosetta Observations: e.g., an Observation from a REST call can be annotated with the mediaType and a reference to which OpenAPI response schema it corresponds to. Additionally, Rosetta could project logs outwards: to produce an OpenAPI documentation of its own API (if Rosetta exposes a control API, that could be described).

* **AsyncAPI Pack:** AsyncAPI is an analogous specification for event-driven (pub/sub or message) APIs[\[54\]](https://www.asyncapi.com/#:~:text=...%20www.asyncapi.com%20%20Open,industry%20standard%20for%20defining). For Rosetta, if it operates in an event-driven architecture, the events going in/out could be described by AsyncAPI. The pack might define tile types for channels, messages, and allow mapping internal events (like CloudEvents, next bullet) to the AsyncAPI description. If Rosetta publishes events (like “IncidentOccurred” or “UserContextUpdate”), those could be formalized in AsyncAPI so external systems can subscribe. Conversely, if some events come from outside (like Kafka topics) and we have an AsyncAPI spec for them, we can parse messages accordingly into Observations.

* **CloudEvents Pack:** CloudEvents is a CNCF spec for a common event envelope[\[55\]](https://cloudevents.io/#:~:text=CloudEvents%20is%20a%20specification%20for,simplify%20event%20declaration%20and%20delivery). It defines standard metadata for events (ID, source, type, time, etc.) and optional data payload. Rosetta’s Incident Envelopes and other cross-system events could adopt CloudEvents format so that everything is uniform when leaving Rosetta. For instance, an Incident tile could be output as a CloudEvent (with type “com.entif.rosetta.incident” and the sealed payload in data). Similarly, any external events can be ingested if they follow CloudEvents (Rosetta can parse the envelope easily and treat content as Observation). CloudEvents pack ensures the mapping:

* Each Rosetta event type has a CloudEvents type string and schema if needed.

* Possibly define that Rosetta’s run/action structure can be partly represented as a sequence of CloudEvents (for external monitoring). We note CloudEvents aims to simplify event declaration and delivery with common metadata[\[55\]](https://cloudevents.io/#:~:text=CloudEvents%20is%20a%20specification%20for,simplify%20event%20declaration%20and%20delivery), which aligns with our aims for consistent provenance and routing. So adopting it means Rosetta events can travel over standard event buses with minimal fuss.

* **OpenTelemetry Pack:** OpenTelemetry (OTel) provides a framework for telemetry data (traces, metrics, logs)[\[56\]](https://opentelemetry.io/docs/#:~:text=Documentation%20,collecting%2C%20and%20exporting%20telemetry). Rosetta’s emphasis on traceability fits nicely:

* We can map a Rosetta Run/Action/ToolCall sequence to an OpenTelemetry **Trace** with **Spans**. For example, a Run might be a top-level span, actions nested as sub-spans, each span having attributes (like action type, tool name, etc.), events (observations can be logged events on spans), and possibly metrics (like token count, latency attached).

* The OTel pack would define how to generate OTel-compliant traces from a Rosetta execution. If a user is using existing monitoring, they can see Rosetta's operations in their tracing dashboard with all the details.

* Conversely, if an external system logs something via OTel collector, Rosetta might ingest it (though more likely Rosetta is producing data to be consumed by OTel). OTel also covers metrics and logs: Rosetta’s evaluation metrics could be exposed as OTel Metrics. For example, the Pathos/Logos scores might be reported as gauge metrics for analysis. OTel is vendor-neutral and widely used[\[56\]](https://opentelemetry.io/docs/#:~:text=Documentation%20,collecting%2C%20and%20exporting%20telemetry), so by integrating, we ensure an **interpretable telemetry**: outside observers can correlate Rosetta’s internal reasoning events with overall system performance and events.

The architecture for these integration packs typically involves *anchors and translators*: \- **Anchors:** If Rosetta concept \= external concept, anchor with external ID as above (like linking a concept to an OpenAPI operation ID). \- **Translators:** Many packs will include **translator tiles** – special tiles that know how to convert or map one representation to another. For example, a rosetta.axis\_translator tile to map old ELPQ axes to new ones (Rubric evolution)[\[57\]](https://drive.google.com/file/d/11NsOu35qLv19EajSiwW9jT13E7ifnJQ3), or an openapi.translator that given a toolcall’s raw JSON will produce the corresponding structured concept filling. Translators often have code (or pointers to code) and are versioned themselves. They allow inference and compatibility without manual re-writing. \- **Profiles and Conditions:** A pack might specify that certain features are optional. E.g., the CloudEvents pack might only be needed for deployments where external event bus integration is required. So profiles can include/exclude certain packs.

### Example: WCAG, WAI-ARIA, Design Tokens Integration (StdPacks)

These address user interface and accessibility: \- **WCAG Pack:** The Web Content Accessibility Guidelines define success criteria for accessible content[\[58\]](https://www.w3.org/TR/WCAG22/#:~:text=Web%20Content%20Accessibility%20Guidelines%20,usability%20for%20users%20in%20general). Rosetta, being largely backend, might not directly produce UI, but if it generates content or UI markup (say, it could produce a UI view or instruct a UI agent), it should ensure accessibility. The pack can provide: \- A list of WCAG criteria (with identifiers like WCAG2.2:1.4.3, etc.) as referenceable elements. \- Possibly an evaluation framework: e.g., if Rosetta generates HTML, a validation agent can produce an Evaluation tile per WCAG criterion (pass/fail). \- In a design context, if Rosetta is used to layout UI or produce messages, perhaps guidelines can be encoded (like “if output includes an image, ensure alternative text is provided”). This pack is likely mostly anchors (to refer to guidelines) and maybe some policy tiles (like a Rosetta policy could say “MUST meet WCAG AA” referencing those anchors). \- **WAI-ARIA Pack:** ARIA provides roles, states, and properties to make web UI accessible[\[59\]](https://www.w3.org/TR/wai-aria-1.2/#:~:text=Accessibility%20of%20web%20content%20requires,1.1%5D%20to%20improve). If Rosetta is to communicate UI structures to front-end, it should use ARIA roles for widgets. The pack can define Rosetta concept templates for UI elements and assign ARIA roles. For example, Rosetta might have a concept of a “Dashboard” or “Dialog”; ARIA has roles like dialog, button, alert. The pack ensures any UI component concept has an appropriate ARIA role anchor. If Rosetta generates UI XML/HTML, it can include the role attributes accordingly. Also, ARIA states (like aria-expanded for menus) could be integrated: if Rosetta manages UI state, it might output events like “menu opened” with a property that maps to an aria-expanded=true. The main benefit is ensuring that any UI outcome from Rosetta can be made accessible with minimal interpretation by developers – it's already annotated or at least clearly spec’d what roles should be. \- **Design Tokens Pack:** Design tokens are a way to store design decisions (colors, spacing, typography etc.) in a platform-agnostic way[\[60\]](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/#:~:text=San%20Francisco%2C%20CA%20%E2%80%93%20October,decisions%20across%20tools%20and%20platforms). This pack would allow Rosetta’s outputs (which might include styled content or mention of colors, etc.) to refer to tokens rather than hard-coded values. For example, instead of saying “\#ff0000” for a color, Rosetta could say “primaryBrandColor” if that token exists. The pack would: \- Provide a data format for tokens in Rosetta (maybe not as tile per token, but a store that can be referenced by a special tile type like design.token or an anchor schema). \- Allow the Rosetta to ingest a design token specification (perhaps from a JSON or from a design tool) and then apply it. E.g., if an output mentions a component style, a translator might fill actual values from tokens. \- The pack ensures any design decisions can be consistent. If an organization uses a design token spec (and the pack knows its format, e.g., Style Dictionary or the W3C format), Rosetta’s front-end outputs can align. This fosters interpretability for designers: the AI's design choices can be seen in their language (like “using spacing token XL” instead of some px value).

Given the design tokens spec has reached a stable open standard (as of 2025.10, it’s a stable format enabling cross-tool sharing[\[60\]](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/#:~:text=San%20Francisco%2C%20CA%20%E2%80%93%20October,decisions%20across%20tools%20and%20platforms)), Rosetta adopting it means it can plug into the ecosystem of design tools seamlessly – fulfilling the synergy between AI generation and design consistency.

The pack might define tile types for some design token structures (like color palette, typography scale), or likely just treat them as data to link. Possibly the simplest: a design token is an external concept anchor (like token:Color.Primary).

Ensuring minimal visual bloat: Rosetta should not directly embed base64 images etc. Instead, maybe it references a token or a media by ID and the front-end knows how to fetch actual asset. That separation aligns with design token approach of single source of truth for design values.

### Pack Governance and Identity

**Anchors vs Identity Recap:** Anchors (XIDs) from packs are clearly delineated – e.g., prefix and often different data type – so Rosetta core and other packs know how to handle them. The presence of an XID does not cause a reinterpretation of core meaning, it enriches it. E.g., ARIA role anchor on a concept doesn't change the concept’s nature, just clarifies how it’s used in accessibility context.

**Pack Versioning:** Packs themselves can update. A new version of a VocabPack (say WordNet 3.1 to 3.2) might bring new IDs. Rosetta must allow multiple packs loaded or smooth transition. This is often managed via PACKIDs and translator tiles: \- If concept was anchored to an ID in an old version pack, maybe maintain that anchor plus add new if available. \- Or produce translator that can replace anchors when migrating.

**Core vs Extension Fields:** Sometimes packs might want to add data to core tiles. E.g., an Evaluation tile might have a WCAG-related field if it specifically was an accessibility evaluation. Rather than bloating core schema, a common approach is to use the **index.summary or a generic extension field** to carry such info, or better, define a pack-specific tile that references the core tile. For instance, a wcag.report tile that references an Observation or output and lists which criteria passed/failed. That way core schema remains minimal and fixed, and packs handle their information in their own structures.

**Conformance to External Standards:** If a pack claims to implement a standard, it should cite or reference the normative source of that standard and ensure key requirements are met. For example, if we have an AsyncAPI pack, and AsyncAPI spec says how to describe a message, our pack’s output must indeed be convertible to a valid AsyncAPI document. If not, that’s a bug in pack spec. Where possible, we provide citations to primary sources in this spec when describing them to avoid misinterpretation (which we have done, e.g., citing OpenAPI, CloudEvents definitions, etc.). This practice is about interpretability of the spec itself.

**Security Consideration:** By isolating external integration in packs, we can sandbox complexity. For example, if an OWL ontology is loaded, maybe an inconsistency in it shouldn’t break Rosetta core – it might just lead to contradictory anchors but core logic stays same. Or if an OpenAPI spec is malicious (someone gave an API spec that tries to cause injection), the pack can validate it separately. Essentially, packs act like plugins with clear contracts. They can be enabled/disabled per deployment needs. Conformance profiles can require or forbid certain packs (e.g., a lightweight profile might not use any semantic web packs to reduce overhead).

## Conformance and Profiles *(Normative)*

Not all Rosetta deployments are identical – some might be a full-featured reasoning engine, others a lightweight logger or an auditor node. **Profiles** define subsets of the specification that an implementation can adhere to, and the required features for each. Additionally, **conformance** requires passing validation checks (like structural validation with SHACL or JSON Schema) and ensuring inference rules hold (like if you derive data, you produce proper provenance).

### Validation vs Inference

Rosetta distinguishes between: \- **Validation:** checking that created artifacts and processes obey the spec’s structural and semantic rules (no required field missing, invariants upheld, etc.), without adding new information. \- **Inference:** deriving new information that is not explicitly in input using logical rules or translators (like inferring an implicit subclass relation, or mapping an old concept to a new one via translator).

A conformant **Basic Rosetta Node** MUST perform all **validation** relevant to its declared profile. It MAY perform **inference** steps where useful, but not performing optional inferences does not make it non-conformant (except if a profile specifically requires certain inferences as part of its functionality).

**Validation (Shapes):** We use SHACL (Shapes Constraint Language) to formally specify many structural rules[\[49\]](https://www.w3.org/TR/shacl/#:~:text=This%20document%20defines%20the%20SHACL,user%20interface%20building%2C%20code%20generation). For example: \- A **Run** must contain at least one Action. \- An **Action** that has toolcall content should have a corresponding Observation or result. \- Every **Tile** with kind rosetta.frame must have edges linking it to at least one concept (no empty frame). \- If a tile’s kind is not recognized by the core or loaded packs, that’s invalid unless profile says you can ignore unknown (some might allow but normally no). \- Invariants like those in Hard Invariants list: e.g., check that every content field that should be hashed is hashed, or that no tile has duplicate CID content in repository unless it’s identical (maybe not shapes but at app level). \- A separate SHACL shape can enforce that e.g. every Observation is not derived from anything external (maybe signifying raw input vs processed) if needed.

An implementation should run these shape validations on data either in real-time or offline. For critical ones, likely at runtime (especially content addressing checks). Many such shapes for core will be provided in an official **Rosetta SHACL shapes graph** (Companion doc). If an implementation stores data in an RDF-compatible way, these shapes can be directly applied. If not, equivalent logic must be coded.

**Inference (Rules):** Inference is mostly applied via translator or mapping tiles and by external reasoners: \- E.g., if concept A is subclass-of B (as per lattice edges), and B is subclass-of C, one can infer A subclass-of C (transitive). The spec doesn’t require the node to materialize that edge, but it does ensure that if you query or reason, you know the semantics (we might label the edge type as transitive). \- In an **Auditor profile** (which might be read-only but thorough), maybe they will run inference to verify consistency (like double-check user-provided knowledge has no contradictions). \- In a **Full node** profile, the node might do proactive inference to enrich knowledge (like add all implied edges for faster lookup). \- In a **Light node** profile, maybe no inference is done; it just stores and forwards what it’s told. \- **SHACL advanced:** SHACL has a notion of rule-based shapes (SHACL-AF or SPARQL-based rules), which could be used to perform certain inferences if we encode them that way (but that’s optional; SHACL primarily for validation here).

### Profiles Definition

We enumerate some expected profiles (the spec indicates at least Light / Full / Auditor / Forge in v2.1)[\[61\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ). Now define them:

* **Light Profile:** A minimal implementation that *consumes and produces* Rosetta data but might not generate all possible artifacts itself. For example, a light profile might be read-only or limited creation:

* It must correctly interpret (read) any tile per spec.

* It might not itself perform advanced semantic analysis. E.g., it could accept user input and store it as an Observation plus maybe some baseline forms, but it may not do concept resolution – maybe it defers to another service for that.

* Light nodes must at least ensure content addressing and invariants. They might skip optional pieces like storing Conjectures if they always assume one interpretation (though arguably they'd break spec if they don't capture ambiguity at all – but a light node might simply not be designed to handle ambiguous input in the first place).

* Think of a “light node” as similar to an IoT edge device running Rosetta – it logs events in Rosetta format and can transmit them, maybe with minimal analysis.

* Light profile likely does not hold full ontology or pack knowledge. It might have only core pack loaded and minimal extension. Possibly it won’t do OWL reasoning, etc.

* However, it MUST still produce normative structures for whatever it does. So if it doesn’t do Lexemes, fine, but then it’s basically leaving that for someone else – or maybe it just sends observations up.

* **Full Profile:** A full implementation supports the complete pipeline and all core features.

* It performs the meaning pipeline end-to-end (or can, for any given input).

* It supports all core tile types and normative behaviors (like receipts-first, concept speciation proposals if needed, etc.).

* It has loaded the standard packs as needed for its domain (maybe not absolutely every possible pack, but at least those relevant to core and typical usage: e.g., it should have the Prov/OWL packs loaded to ensure it can import ontologies or produce provenance exports, etc., as well as likely OpenAPI/OTel if integrated into a system).

* It actively enforces invariants (no data that violates spec enters its knowledge base).

* It likely does inference when beneficial, but might still not for performance (inference isn’t required beyond what’s needed to satisfy queries).

* It can generate new knowledge (like forging new concept proposals, see Forge profile possibly).

* **Auditor Profile:** A special read-only profile aimed at verifying and analyzing outputs rather than generating.

* An auditor might ingest all tiles from others (like subscribe to events) and then run *all validations and consistency checks* vigorously. It might also recompute things to ensure nothing was tampered. For example, if an agent claims a certain score, an auditor might recalc that evaluation given the evidence.

* It uses SHACL or other shape definitions to flag any spec violations or suspicious patterns.

* Possibly an auditor also ensures policies are followed (like verifying every decision had proper receipts, or every tool call result was within allowed parameters).

* Auditors likely load all packs needed to interpret everything but do not themselves produce new domain content. Except maybe incident creation if they find an issue.

* They can also serve as “archivists” – storing complete ledger and answering regulatory or compliance queries.

* **Forge Profile:** Possibly referring to nodes that can create new schema/ontology elements (the ones that propose speciation/new tiles).

* A forge would be a full node with added capability: it can accept or initiate **governed changes** to the knowledge model. E.g., forging a new concept means it issues a rosetta.speciation tile or new concept with some justification that goes through governance.

* This profile must handle the governance protocol: e.g., waiting for a quorum of receipts to approve a new tile if governance demands, or stamping a genesis key signature for new core extension, etc.

* Essentially, a Forge is an authoritative writer to certain namespaces. For instance, only a Forge-profile node might be allowed to mint new RIDs in the core namespace or sign new pack releases.

* Forge might also refer to heavy compute nodes that do the learning/training loops (like forging improved rubrics, etc.). They generate new rubrics or translator tiles as output of training processes.

* A Forge must do everything a Full node does plus adhere to stricter procedures for publishing updates (like packaging them as delta capsules, signing them, etc.).

One could define other specialized profiles, but these cover main roles. Profiles can also be layered (e.g., an Auditor node might not do interpretation but it must at least parse everything).

**Profile negotiation:** In a network, nodes might declare their profile via a DocID perhaps or a handshake. E.g., one node knows that another is Light so it will send it pre-digested context because it might not derive it itself.

### SHACL Use in Conformance

We have SHACL shapes for static structure. Additionally, SHACL can be used to express certain *logical* constraints by using its advanced features or writing custom checks: \- For example, we could have a shape that says: “If a tile is rosetta.observation and has media\_type text/html, then it MUST have an accompanying rosetta.observation of media\_type text/plain that is its text alternative.” This could enforce that every HTML content has a plain text alternative for accessibility – a cross-content rule influenced by WCAG (just as an example). This merges domain with core, but an implementer might do such if needed. \- A shape could ensure no cycles in certain relations (like no concept is its own subclass). \- SHACL can also classify data: an interesting use is making sure any extension pack content doesn’t conflict, using SHACL’s closed shapes to limit what extra properties can appear.

We use SHACL in this spec (deliverable B might include shapes in adjacency list or references) to precisely pin down what "normative" means for data structure.

### Governance and Compliance

This spec is intended to be an **authoritative standard** for Rosetta 3.0. Adherence means: \- If you claim to implement Rosetta 3.0 Core Spine, your system must produce data that passes all normative criteria (maybe validated by tests). \- Breaking any MUST or MUST NOT is non-conformant. Should’s are recommendations, so not following them is not non-conformance per se, but likely means suboptimal or possibly not future-proof. \- The Document Suite includes a **Self-Consistency Checklist** (from older references) which can be updated for 3.0. It enumerates the invariants and checks (like content addressing, etc.) that must always hold. That is a good quick reference for implementers to test themselves.

**Profiles and Standard Compliance:** A node may be certified as e.g. “Rosetta 3.0 Full Profile Compliant” or “Rosetta 3.0 Light Profile (subset) Compliant” etc. Possibly we assign each profile an ID (maybe a DocID for profile spec in Companion docs).

**Examples**: \- A voice assistant built on Rosetta might run a Full profile node on the cloud (doing all reasoning), and have a Light profile on device (capturing audio, sending transcripts). \- An enterprise archive might run an Auditor profile that collects all outputs from the Full node and ensures compliance with data policies (like verifying that sensitive info was handled according to rules). \- A research environment might have multiple Forge nodes working in a testnet to extend the ontology, but those changes only propagate to the main environment when endorsed (like merging code branches).

**SHACL for Profiles:** We might even encode certain profile differences in shapes. E.g., a shape that for Light profile says some class of node shouldn’t appear (like Light profile maybe doesn’t do Conjectures, then a shape can trigger a warning if a Light node did output one – indicating it’s doing more than it claims, or perhaps it’s fine but in general). However, it's easier just to document rather than enforce via shapes.

**Summary of Conformance:** \- Conformant implementations MUST implement content addressing, layering (or at least not conflating layers), pack separation, invariants (no core redefinition, no silent knowledge mutation). \- They SHOULD produce all relevant artifact types to allow auditing (some leeway if profile says otherwise). \- Data exchange between any two conformant implementations should be possible because of the canonical formats and stable identifiers. If two full nodes exchange tiles, they should interpret them identically (assuming they have the same packs; if a tile from an unknown pack arrives, a node should either obtain that pack’s spec or gracefully ignore that tile as extension data). \- If an implementation extends beyond core (like adds new base tile kinds in rosetta. *namespace or changes semantics), it is not Rosetta 3.0 compliant anymore. It should instead propose those changes through the governance process (like a spec extension or future version plan). \- We also consider safety: an implementation that doesn’t implement incidents or receipts at all, while it might handle content, would violate the spirit and some MUSTs (like “Receipts-first instrumentation” is a core invariant[\[37\]](https://drive.google.com/file/d/1CeYTGuwSvNu6aDwNL55KIvX3uU5FlqRq) – at least one profile must handle receipts; a Light node might rely on another to do receipts but the chain must exist). \- Implementation MUST be able to output needed information for trust: e.g., if a user asks "why did it do X?" a Full node should have stored the reasoning chain to answer that (via the tile graph). So from conformance view, if one deliberately discards reasoning traces, that’s non-conformant (because you lost auditability). Possibly a Light node might not* generate\* them, but then the heavy node it sends to should.

## Projections and Interoperability Strategy *(Normative/Informative mix)*

(*This section describes how Rosetta interacts with external systems by projecting its internal state onto external representations and ingesting external data via packs.* It is partly informative but contains normative guidelines for preserving meaning across boundaries.)

Rosetta’s internal knowledge is rich and structured, but it often needs to communicate with or ingest from outside formats. The **interop strategy** is: *Use packs to translate, rather than altering the core; maintain traceability through any format conversion.* Key external integration points: \- **Semantic Web (RDF/OWL)** – Interoperability with knowledge graphs, ontologies. \- **Process/Workflow Standards (BPMN, DMN, SCXML)** – Interoperability with business logic representations. \- **API and Event Standards (OpenAPI, AsyncAPI, CloudEvents)** – Communication with microservices, event buses. \- **Observability (OpenTelemetry)** – Integration with monitoring and debugging systems. \- **Accessibility/UI (WCAG, ARIA, Design Tokens)** – Ensuring output content is accessible and consistent with design systems.

### External Mapping via Packs

For each external standard, Rosetta defines either a direct mapping or a mediator pack: \- **OWL/RDF**: A given Rosetta concept or relation can be exported as an OWL class or property assertion. We ensure that if someone queries an OWL/RDF store of Rosetta knowledge, it will reflect what Rosetta knows. Conversely, if given an OWL file, the pack can create the corresponding Rosetta structure (concepts and edges). The normative guidance is that any semantics in the OWL that cannot be represented in Rosetta’s lattice *should be documented as not supported*. For example, OWL cardinality constraints or logical restrictions might not have a direct Rosetta analog (Rosetta doesn’t inherently have class axioms logic). In such cases, the OWL pack may ignore them or turn them into Policy or SHACL constraints if possible. We want to cite that OWL ontologies allow formal knowledge capture[\[47\]](https://www.w3.org/2012/pdf/REC-owl2-overview-20121211.pdf#:~:text=The%20OWL%202%20Web%20Ontology,It%20describes%20the%20syntaxes) and Rosetta can leverage that by aligning core identities to them, but Rosetta does not become an OWL reasoner (unless one plugs in one). \- **PROV-O**: For provenance, Rosetta essentially implements a subset of PROV-DM (the data model) natively. The mapping is relatively straightforward as discussed. Normatively, if an external system requests a Rosetta provenance trace in PROV-O format, a Rosetta node should be able to provide it (Full node likely yes). The PROV pack should define exactly how each element maps, e.g.: \- Run \= prov:Activity (with sub-activities for actions, toolcalls as further sub-activities or as wasGeneratedBy relationships), \- Observations \= prov:Entity (an entity generated by a toolcall or by a user agent activity), \- An agent (like user) might be prov:Agent, in Rosetta either external or if represented as a concept with a certain tag, the pack might attach that context. \- Actually signing receipts correlates to PROV’s notion of wasAssociatedWith (an agent signing an activity). The normative requirement: a conformant Rosetta implementation *should* (if pack enabled) produce correct PROV-O output for its traces. That allows usage of external provenance tools. E.g., if there's a question of explaining “what happened?”, one could run a PROV query over the output. \- **BPMN**: A sequence of Rosetta actions can be abstracted to a BPMN diagram (flowchart). It won’t capture every nuance (LLM reasoning steps might not map cleanly to BPMN tasks), but major steps (like call API, get user confirmation, branch on result) do. The recommended strategy: model high-level actions as BPMN tasks, use sub-processes for hierarchical actions, use gateways for branch actions. A Rosetta planning agent could even consume a BPMN workflow and execute it (taking tasks as suggested actions to perform and doing them). Normatively, if a BPMN is used as input, the pack should ensure that the semantics of the BPMN are preserved. For instance, if BPMN says task A then B in sequence, Rosetta must treat that as an ordering (e.g., enforce via scheduling policy or just use it as blueprint). Possibly an automated conversion: a BPMN XML can be converted into a set of Rosetta expected actions (like a plan blueprint concept) and the runtime will attempt to follow that, logging actual vs expected. If Rosetta outputs BPMN, it should reflect actual trace flows (which might be discovered by an algorithm mining the traces and summarizing as BPMN). \- **DMN**: A Rosetta rule set (like part of a policy or a rubric translator) can correspond to a DMN decision table. Interop can go both ways: \- Ingest DMN: The pack reads a DMN table and creates either a Rosetta Policy tile or an Evaluator (like something that given certain inputs yields a decision). \- Export DMN: If Rosetta’s policies are in a structured form (like a series of conditions leading to outcomes), we can represent them in DMN for business review. However, DMN tends to be tabular and simpler than arbitrary code, so not all complex logic will fit. A normative guideline: if using DMN integration, ensure that decisions which are meant to be transparent to business are done in a way that can be represented in DMN. If Rosetta uses an ML model for something, obviously that cannot be meaningfully turned into DMN logic. But simpler gating logic (like user is premium \-\> do X else Y) can. The pack might ensure Rosetta’s internal concept names map to DMN input/output names, etc. \- **SCXML**: If an external orchestrator uses SCXML for dialogues or stateful flows, Rosetta should speak the same language for events. E.g., SCXML is often used in voice assistant dialog managers. A Rosetta agent could either replace such manager or integrate with it by exchanging events: the SCXML pack would route Rosetta Observations to SCXML events and vice versa. Possibly a Rosetta Action could carry an SCXML state transition meaning. Normatively, if a SCXML is controlling logic, Rosetta should not violate it – so if integrated, the SCXML specification becomes a form of policy or blueprint that Rosetta respects. This means if SCXML says these are possible transitions, Rosetta’s logic should be constrained accordingly (the pack or a mediator ensures that). Could be achieved by Rosetta calling out to an SCXML interpreter via ToolCall, or by having a built-in SCXML machine in an Action. \- **OpenAPI & AsyncAPI**: Interop partly covered above. Normatively: \- Rosetta must handle API payloads according to their schemas (that means if an API expects a JSON of a certain shape, Rosetta’s output must conform – so likely Rosetta uses JSON Schema validation on any output before sending, or uses typed objects). \- When Rosetta receives data from an API, it should validate and convert it. E.g., if an API returns a list of flights and we have an OpenAPI spec for it, ideally the ToolCall result Observation is annotated as matching that schema (the pack can do this by storing the schema version or adding an anchor like openapi:FlighListResponse). \- If Rosetta is providing an API (for example, Rosetta might expose a reasoning service via API), it should provide an OpenAPI spec for itself. Possibly an introspection to generate spec or a static one. This improves interpretability for integrators as they know what endpoints and models to expect. \- **CloudEvents**: Normatively, if the system is integrated with a cloud event bus, all events leaving should be in CloudEvents format. E.g., when an Incident is raised, the node puts it onto the event bus as a CloudEvent with standardized fields (like severity in an extension field maybe). And it listens on the bus for events relevant to it (like a “cancel operation” event could come as a CloudEvent, which Rosetta would parse to an Observation). CloudEvents specification ensures different services can share events easily[\[62\]](https://www.cncf.io/announcements/2024/01/25/cloud-native-computing-foundation-announces-the-graduation-of-cloudevents/#:~:text=Cloud%20Native%20Computing%20Foundation%20Announces,across%20services%2C%20platforms%2C%20and%20systems), so Rosetta adopting it reduces friction. The pack basically means one could configure a mapping: any Observation of type X going out will be serialized as CloudEvent type Y with attributes Z. This mapping is declarative and likely part of configuration than dynamic in code – meaning the pack doc might list known events and their CloudEvent type URIs. \- **OpenTelemetry**: Normatively, a Full node should produce OpenTelemetry traces for at least major operations (for devops monitoring). So, if something goes wrong in Rosetta pipeline, you can see it in your trace logs. The OTel pack would either directly integrate with an OTel SDK to emit spans, or produce a log that can be converted to OTel by a sidecar. Possibly, Rosetta’s own internal logging tile (like rosetta.receipt can double as an OTel span event). But likely easier: instrument the code such that it calls OTel on certain boundaries. That’s implementation detail beyond spec though. We could say: a conformant implementation SHOULD allow enabling OpenTelemetry export of traces, metrics, and logs. That’s not a must for all, but recommended for production usage for debugging/tracing (particularly because Rosetta internal flow is complex, OTel helps measure performance and find bottlenecks).

### Maintaining Interpretability Across Boundaries

Whenever Rosetta data is exported, the link back to internal reasoning must be preserved to the extent possible: \- If we output an answer to user, we may use plain natural language. But in background, Rosetta can keep a reference to which concept that answer corresponds to, or which evidence supported it (that’s in the trace). For a user, what matters is the understandable answer; for an auditor later, they need to tie that answer to the reasoning. So even if the final output is text, we ensure the underlying structures are saved. \- If Rosetta yields a decision to a business system (like "approve loan"), it might do so by writing to a database or sending an event. That event should include a correlation ID linking to the Rosetta Run or Decision. E.g., CloudEvents or any message can have an Rosetta-Run-ID field or something, so that later if someone asks "Why was this loan approved?" one can go use that ID to fetch the trace from Rosetta’s store. \- When ingesting external data, maintain source attribution. E.g., if a user gave an input file, keep a reference (maybe store a hash of file and original file name in Observation metadata). \- Another key: *no semantic loss in conversion.* If Rosetta concept has more nuance than the external format can carry, either reduce scope (maybe external doesn’t need all nuance) or include it in metadata. For example, if Rosetta knows an event's uncertainty, but CloudEvents has no field for uncertainty, we might drop it in the event (since CloudEvents is for factual events). That nuance is not transmitted (maybe that’s fine; the event either happened or not). But if it’s important, one could put an extension in event payload with uncertainty info as part of data. \- Conversely, if an external format has detail that Rosetta core doesn’t model, store it as a raw payload or in extension fields. E.g., an OpenAPI response might have some fields we don’t use now – we shouldn’t drop them in Observation (unless too heavy), perhaps keep the whole JSON in Observation and only pick what we know as separate fields. Rosetta can thus round-trip external info without losing it: even if it doesn’t understand field X, it stored it, so future analysis or updated packs could parse it from the raw later.

### External Knowledge and Spec Evolution

The projection strategy is also how Rosetta can evolve: If a new standard arises (say some new AI audit standard or a new ontology), we create a pack for it rather than altering core. This decouples core from external churn. Example: If W3C releases WCAG 3.0 in future, we just update the WCAG pack or add a new pack for 3.0, core stays same (maybe new anchors). If a better process modeling comes than BPMN, that’s new pack.

Thus, interoperability is future-proofed by design: core defines stable fundamental semantics (addressing, layering, etc.), and all domain or interface specifics come via packs that can iterate separately.

One more thing: The spec requires normative alignment in concept where relevant: \- e.g., If something essentially is a **RDF triple** concept, we use RDF terms to describe it for clarity (like subject/predicate/object or subclass-of relationship, etc.). We did that in design. \- if a concept is essentially a **business process**, we use BPMN where possible to illustrate (like mention sequence flows). \- For implementing coordinate, the developers of Rosetta can rely on those standards tools (like using an existing SHACL validator rather than writing new code for shapes). \- For knowledge representation, they might choose to internally use an RDF store for the lattice (which would automatically give them SPARQL query and OWL reasoning support if wanted). That’s an implementer’s decision but possible because our model is compatible. Many may implement in a graph database or even relational DB depending on perf needs. The spec just ensures conceptually it’s a graph of content-addressed nodes and edges.

In conclusion, the Projections and Interop Strategy mandates: 1\. **Explicit mapping definitions** for each supported external representation (ensuring nothing is vaguely or inconsistently translated). 2\. **Lossless (or controlled loss) conversion**, with references to original context maintained. 3\. **Use of standards for what they are best at**: e.g., use SHACL for validation (not invent new validation language), use OpenAPI for API interface (not a custom format). 4\. **Option to not use if not needed**: It’s possible a Rosetta deployment doesn’t care about BPMN or ARIA (maybe it’s fully backend no UI). That’s fine – packs are optional. But if you do that domain, best practice is to use the pack. 5\. **Citations and alignment**: As we have peppered, each mapping should cite the relevant official specification to ensure correct implementation. E.g., if writing code to generate CloudEvents, follow CNCF CloudEvents spec paragraphs for mandatory fields[\[55\]](https://cloudevents.io/#:~:text=CloudEvents%20is%20a%20specification%20for,simplify%20event%20declaration%20and%20delivery).

This bridging role of Rosetta – between the AI’s internal reasoning and all the external ecosystem – is one of its main values. It ensures an **interpretable AI** not only to itself but in the context of existing human and software workflows.

## Minimal End-to-End Example *(Informative)*

To illustrate the above concepts in action, we present a minimal end-to-end example: a user asks a question, Rosetta processes it through all stages, and produces an answer along with an external projection. We’ll trace the creation of key tiles and show how they relate, from signal to final projection.

**Scenario:** A user interacts with a conversational AI assistant (built on Rosetta) via a web interface. The user types: *"What is the capital of France?"*. The assistant will interpret the question, possibly call a knowledge tool, and answer. We will walk through this, highlighting how each part of Rosetta’s spec comes into play.

1. **Observation (Layer 0):** The user’s query arrives as a text input. The system creates a rosetta.run tile to represent this Q\&A session (Run CID run123 for reference). It then creates a rosetta.observation tile for the user message:

2. Observation content: { "modality": "text", "data": "What is the capital of France?", "origin": "user" }.

3. Envelope might include: kind: rosetta.observation, cid: obs1CID, run: run123, timestamp: T0.

4. This is an immutable record of exactly what the user asked.

5. **Forms (Layer 1):** The assistant tokenizes the question:

6. Tokens: "What", "is", "the", "capital", "of", "France", "?".

7. It creates rosetta.form.token tiles for each word (punctuation “?” might be a token or a property of sentence break).

8. Each token tile has content with at least the substring and position. For brevity:

   * Token1 (cid: tok1) content: "What", pos 0-4.

   * Token2 (cid: tok2) content: "is", pos 5-7.

   * ... etc.

   * Token6 (cid: tok6) content: "France", pos maybe 19-25.

9. All tokens have a reference to Observation obs1CID (so derived\_from: obs1CID perhaps or an edge linking them to obs).

10. The system also identifies sentence end at "?" – maybe creates a form for sentence (or just note in last token).

11. These form tiles are attached to run as well (via run field or link).

12. No ambiguity at form layer; it's straightforward splitting.

13. **Lexemes (Layer 2):** Now the system analyzes each token in context to find lexemes (i.e., word senses):

14. "What" \-\> lexeme for "what (pronoun, question word)". Likely one lexeme (or it could consider if it's asking for object vs description, but in English "what" is pretty straightforward here). It creates a rosetta.lexeme tile for "what" (question pronoun). Could anchor to some lexicon (like an entry in Princeton WordNet for "what" as an interrogative pronoun).

15. "is" \-\> lexeme for "be (verb, present 3rd person)". A lexeme tile for the verb "to be". Anchor to lexicon if available.

16. "the" \-\> lexeme for "the (definite article)". Possibly we have lexeme but articles might be treated as stopwords with no concept on their own. Let's assume we do create one or skip storing it if not needed conceptually (the pipeline could drop articles at lexeme stage if they carry no separate concept, up to implementer).

17. "capital" \-\> this is interesting: could be noun meaning "city serving as seat of government" or could mean "wealth or assets" in other context. Here, context suggests the 'city' meaning. The assistant creates a lexeme Conjecture:

    * Conjecture tile: links token "capital" (tok4) to two lexeme options:

    * lexeme A: "capital (city)" – weight say 0.9,

    * lexeme B: "capital (assets)" – weight 0.1.

    * It decides likely lexeme A is correct. It still records the Conjecture for transparency.

    * It creates lexeme tile for meaning "capital city" (if not existing yet in knowledge base).

18. "of" \-\> lexeme for "of (preposition)". Likely straightforward meaning (denoting belonging).

19. "France" \-\> a proper noun. The lexeme likely corresponds directly to a proper noun meaning (the country France). Possibly anchored to a lexicon or knowledge base entry (like lexeme might have XID wn:France or something, though WordNet has country entries).

    * "France" lexeme tile created, perhaps with anchor to an external knowledge base (like a Wikipedia or GeoNames ID).

    * Note: as a proper noun, the lexeme essentially is tied to a real entity concept (which will come in layer 3).

20. The "?" token likely not a lexeme (it’s punctuation).

21. Now we have lexeme tiles:

    * Lexeme(what) L1, Lexeme(is) L2, Lexeme(capital-city) L3, Lexeme(of) L4, Lexeme(France) L5.

22. Each lexeme tile points back to the token (maybe via content or separate edge: e.g., a lexical edge "lexeme-of" linking token to lexeme).

23. For "capital", the Conjecture tile captures ambiguity; the system might choose the top one to proceed.

24. So far, so good, we have essentially a syntactic/semantic breakdown but not assembled meaning.

25. **Concepts & Frame (Layer 3):** The assistant now constructs the semantic representation of the question:

26. It recognizes this is a question asking for a *place (capital)* of a *country (France)*. So likely the frame is a **Question frame** or specifically a kind of *FactoidQuestion* frame with roles: topic and maybe requested\_info\_type.

27. The lexemes "capital (city)" and "France" are key: one likely becomes a concept of type City (but specifically we’re looking for the city that is capital-of France).

28. Possibly Rosetta already has a concept for "capital-of relationship" or "CapitalCity" concept.

29. Let’s break it down:

    * The system identifies that "capital of France" indicates an unknown city which is the capital of the known country France. So it might create a blank node concept representing "the capital city of France".

    * Or more formally: a relation concept: *CapitalOf(?, France)* where ? is what we seek.

    * It could represent it as a Frame: e.g., a QuestionFrame with a slot target\_concept \= \[some concept for capital city\], and context \= concept(France).

    * Another approach: treat "capital of France" as one composite concept node that has an internal relation (like a partially applied relation "CapitalCityOf(FRANCE)").

    * For clarity, let's do it as a small graph:

    * Create a Concept for "France (the country)". Possibly Rosetta already has one in knowledge base (if not, it may create it now or fetch from VocabPack if connected to e.g. a world knowledge base).

      * Concept(France) C1: anchored maybe with an external ID (like wiki:France or some geocode). It's a concept of type Country (there might be an edge from C1 to concept "Country").

    * Create a Concept for "Capital city of France" as a *query placeholder*. This might not be a permanent concept, but a context concept:

      * Perhaps an *Interpretation Frame* could be "CapitalQueryFrame" where one role is Country (filled by Concept(France)), and the result role is City (to be found).

      * But frames usually represent assertions or events. We could do: Frame F1 of type CapitalRelation, with roles: nation\=C1 (France), capital\= X (unknown). It's not fully filled because we don't have X yet.

      * Mark that this frame is the *query target*.

    * Also represent the question intention: likely as a separate concept or frame: a Question concept Q1 that has property asks-for linking to the CapitalRelation frame F1. Q1 might also have a type indicating it's asking for a location.

    * Another concept: maybe the concept of "capital city" as a class. If Rosetta has concept "CapitalCity" (subclass of City), it might use that. In knowledge base, "Paris isCapitalOf France" etc. But if not, we can just use the relation frame.

    * So possible representation:

    * **Concept(France)** (C1) with anchor (like dbpedia:France or internal known concept).

    * **Concept(CapitalCity)** (C2) representing the idea of a capital city (maybe anchored to concept of capital city if known).

    * **Frame F1: CapitalOf** – a relational frame linking a Country and its CapitalCity.

      * Role1 country \= C1 (France)

      * Role2 capital \= an unbound placeholder or a question variable of type City.

    * **Concept(Q?)** – to represent the actual question. Could be an instance of a generic Question concept that points to what it's asking:

      * Perhaps Qconcept has a link asks\_about \-\> Frame F1 (meaning the question is asking about the capital-of relation specifically the capital role).

      * Qconcept might also store that it expects an answer of type City (maybe deduced from context).

      * If we had a lexeme for "What" question word, that gets interpreted as "unknown thing we need to find" with type \= capital city. This could directly attach to the frame F1 as the unknown for capital.

      * In effect, "What" triggered the notion that there's an unknown variable in the query.

    * It's a bit complex logically, but the main point: Rosetta now has an internal representation like:

      * There's a known concept of France (with its details possibly known via external data).

      * There's a query that asks for the capital city of that concept.

      * Possibly the system already *knows* that concept: e.g., if Rosetta had a knowledge tile stating "Paris isCapitalOf France" from prior knowledge. If so, it might directly retrieve that.

      * If not, it will call a tool.

30. For clarity in example, assume Rosetta doesn’t already know Paris. So it will have to use a tool (like a knowledge base lookup or a web search).

31. The frame F1 is essentially the meaning of the user’s request: find X such that CapitalOf(X, France).

32. This gets recorded:

    * A rosetta.frame tile for F1 (CapitalRelationFrame) with content specifying roles and linking to C1 (France) and an unfilled placeholder (maybe represented by some special concept like Unknown).

    * Possibly a rosetta.concept tile for the question unknown, but often it's not enumerated as a tile – could just be an empty slot in frame.

    * A rosetta.frame or concept tile for the question itself, if needed, but we can consider the frame with unknown as the question representation.

33. Provenance links: these concept/frame tiles are derived from the lexemes: e.g., lexeme "France" gave concept France, lexeme "capital" triggered frame type, lexeme "What" signaled the unknown request.

34. **Plan/Action (Spine events):** Now to answer, the assistant might decide to call an external knowledge service (like a wiki API or its internal knowledge base query).

35. It formulates an Action: e.g., an Action of type ToolQuery intending to retrieve capital-of info.

36. This Action is a rosetta.action tile under the Run. Suppose Action A1, content: action\_type: queryKnowledge, target: "capital of France".

37. The assistant chooses a specific tool: maybe a "Geography Knowledge Base" tool (for example).

38. Create a rosetta.toolcall tile for calling that tool:

    * ToolCall content might include tool name "GeoDB", endpoint "get\_capital", parameters {"country": "France"}.

    * Link this toolcall to Action A1 (via envelope or edge).

39. This triggers the actual external call. Let’s say the tool returns {"country": "France", "capital": "Paris"}.

40. The assistant captures the response as a new rosetta.observation tile (obs2) representing tool output:

    * Observation obs2 content: maybe the raw JSON or structured data, {"capital": "Paris"}, origin "tool:GeoDB".

    * Envelope: derived\_from: \[ToolCallID\], timestamp T1, etc.

41. Also, it may parse that into a concept:

    * "Paris" likely came as a string, but the system knows that's a city name. It creates a Concept (if not already): Concept(Paris) C3, with anchor perhaps to known entity (and likely a concept type City).

    * And then likely creates a lattice edge linking Paris as capital of France:

    * e.g., an edge tile E1: (C3) \--\[capital\_of\]--\> (C1).

    * Or uses the frame F1 from earlier: now fill its capital role with concept C3 (Paris). So the frame F1 that had unknown now gets resolved \= actual concept C3.

    * Possibly the frame tile F1 can be updated by creating a new frame tile F1b that is identical but with capital filled, prev F1 (unknown). Or simpler, they might consider the frame now answered and record an Evaluation. But likely they will explicitly assert "Paris is capital of France" as knowledge:

    * That can be done either as frame or as just edge concept relation. Could be both.

    * In sum, the assistant now has a concept for Paris and knows it is capital-of France.

42. The toolcall returns quickly. The system attaches a Receipt:

    * A rosetta.receipt tile maybe sign the fact that "GeoDB query executed with result hash X".

    * It's optional detail, but for audit presumably a receipt from the tool or just an internal receipt.

43. The Action A1 completes successfully, possibly producing an Evaluation or at least marking success.

44. **Compose Answer:** The assistant now has the answer content (Paris). It needs to respond in natural language to user.

45. It might have a template or an NLG step. For brevity, it can just answer "Paris." or "The capital of France is Paris."

46. It creates another Action for composing output (maybe Action A2, type \= formulateAnswer).

47. Possibly an internal reasoning: It might consider context or phrasing, but here straightforward.

48. The answer "Paris" (or full sentence) is then generated as a final Observation:

    * Observation obs3 content: "Paris." origin "assistant" (this is the answer text to user).

    * That observation is presumably sent to user via UI.

49. **Attestation & Finish:** The assistant might create a Receipt for its answer (some systems sign their answers or include references).

50. Maybe not needed here. But it could attach references: e.g., a special tile listing that the fact "Paris is capital of France" came from GeoDB (like evidence citation).

51. If we had integration with PROV or others, we could send that too. But let's keep it simple.

52. The Run now ends. We have in the run’s trace:

    * Observation(user question),

    * Forms,

    * Lexemes, Conjectures,

    * Frame (question semantics),

    * Action (tool query), ToolCall, Observation(tool result),

    * Concept (Paris) and relation (Paris capital-of France),

    * Action (answer formulation), Observation(answer),

    * Possibly an Evaluation (e.g., did we answer? yes, no errors).

53. The final answer is delivered to user: "Paris."

**Traceability and Output:** \- If later asked “How did the system get that answer?”, one can inspect: \- The tool call tile shows we asked GeoDB. \- The observation from GeoDB includes Paris. \- The concept Paris is now stored possibly for future. If user asks another question about Paris, we already have concept rather than having to query again (if we decide to store it). \- If integrated with PROV: we could produce a PROV trace where: \- prov:Activity (the run) used entity (question obs), then had sub-activity (GeoDB query) which used France and produced Paris info, etc. \- If integrated with OpenTelemetry: each action could be a span (with e.g., query took X ms, etc.). \- If integrated with CloudEvents: the question and answer might be logged as events in some monitoring stream. Or the knowledge retrieved could be an event.

**Mermaid Diagram of Example (informative):** We could visually depict:

graph LR;  
  subgraph Run\[Run: Q\&A Session\]  
    userObs\["Obs: 'What is the capital of France?'"\]:::obs  
    A1\["Action: Query Knowledge"\]:::action  
    toolcall\["ToolCall: GeoDB(capital, France)"\]:::tool  
    obsTool\["Obs: '{capital: Paris}'"\]:::obs  
    A2\["Action: Formulate Answer"\]:::action  
    answerObs\["Obs: 'Paris.'"\]:::obs  
  end  
  userObs \--\> A1;  
  A1 \--\> toolcall;  
  toolcall \--\> obsTool;  
  obsTool \--\> A2;  
  A2 \--\> answerObs;  
  subgraph Semantics\[Meaning Layer\]  
    France\["Concept: France (Country)"\]:::concept  
    Paris\["Concept: Paris (City)"\]:::concept  
    capitalRel\["Frame: CapitalOf"\]:::frame  
    capitalRel \-.-\> France;  
    capitalRel \-.-\> Paris;  
  end  
  userObs \--\> France;  %% from lexeme France  
  obsTool \--\> Paris;   %% from tool result  
  France \-- "country" \--\> capitalRel;  
  Paris \-- "capital" \--\> capitalRel;

*(Legend: Obs \= Observation, Action, ToolCall, Concept, Frame.)*

This shows the flow and the semantic attachments. The dotted lines from frame to concepts indicate frame roles.

**External Projections:** \- The assistant might cite a source. If it needed, it could add "According to GeoDB, Paris is the capital." If implementing a policy to always cite sources, it would include that from the tool metadata. \- If an OpenAPI pack was used, the call to GeoDB would have been described by an OpenAPI spec. That might not be user-facing, but ensures the tool call format was correct. \- If outputting to a UI with accessibility, the answer is just text "Paris." (no images or complicated UI needed, so ARIA not relevant here). \- If logging metrics: it might record that it answered in 1 step, using one external call (which could be a metric for solution complexity). \- If storing to knowledge base: perhaps now it stores the triple (Paris capital-of France) as a known fact tile for future. That might involve a translator mapping that relation to an internal ontology or to a DB. If using an RDF store, it might insert triple (France, hasCapital, Paris) with appropriate URIs.

**Minimal example summary:** This scenario demonstrated how Rosetta: \- Preserved the original question (interpretability: we always know what was asked). \- Broke it down through forms and lexemes (interpretability: we know how it understood each word). \- Represented the meaning as an internal graph (interpretability: we can inspect what it thought the question meant: find capital city of France). \- Ensured it did not assume an answer without evidence (it used an external tool). \- Attached provenance (we know the answer came from GeoDB). \- Provided the answer clearly to the user. \- All along, created a trail such that any step can be reviewed or re-played. For instance, the Conjecture for "capital" – if by some odd chance it thought capital might mean "money" (and we saw a low weight), we can see it considered that and mostly ruled it out. If it had mistaken that, we’d see the Conjecture had wrong weighting. \- This pipeline output could be validated: check content of each tile against schema, check that the lattice relation "Paris is capital of France" is inserted properly, etc. \- If we feed this to an auditor node, the auditor might verify the tool used is an allowed one, that a receipt was present, that the final answer indeed used the result etc. It might also log the Q\&A pair for analytics.

**Complex Variation:** In case the user asked something open-ended or the pipeline branched, the trace would show Conjectures with multiple branches. But the procedure remains: create explicit objects for possibilities, then either ask another question or pick one with justification.

This minimal example though domain-simple, exhibits Rosetta’s core features: \- **Content-addressed memory:** Every tile (question, answer, concepts) has CIDs. If another user later asks the same, the system might reuse the concept or realize it's known, etc. If we store Paris concept, next time no external call needed; or if we do call, we can verify consistency. \- **Layered interpretation:** We saw raw text \-\> structural forms \-\> lexical senses \-\> concepts/relations \-\> actionable query. \- **Extensibility via pack:** (In this example, the knowledge of world might be an extension; we effectively used a “GeoDB tool.” If integrated, that knowledge could be a VocabPack or a local DB. But showing tool usage keeps core minimal as intended). \- **Auditability:** At each step, there's an artifact. There is no hidden state (like a black-box model might have hidden layers, but Rosetta’s approach externalizes reasoning steps as tiles). \- **Minimal core usage:** We didn't need to modify core to handle this domain. It used generic constructs (question as frame, concepts for places). The specific knowledge that Paris is capital is external or added but doesn’t require new core tile type.

Thus, the example reinforces how Rosetta achieves interpretability-first AI operation: we can literally reconstruct the reasoning path and data sources for a single answer, which is crucial for trust and debugging.

## Document Suite Map and Policy *(Normative)*

Rosetta v3.0.0 is documented not only by this Core Spine Specification, but by a suite of companion documents that detail specific aspects, extension packs, and guidelines. This section enumerates all documents in the Rosetta 3.0 specification suite, their stable identifiers (DocIDs), scope, and relationships. It also outlines the governance policy for maintaining these documents (i.e., how they can be updated and versioned).

**Normative Document Identifiers (DocIDs):** Every official document in the Rosetta 3.0 suite is assigned a permanent identifier of the form **ROCK-** *(Rosetta Core Knowledge document). These DocIDs are version-neutral (they refer to the document concept), with separate fields inside the documents indicating version. The scheme is designed to be* *scalable* *and* *parsable*\*: \- Format: ROCK-\<NNNN\> (four digits) for primary specifications, and sub-documents may use suffixes or higher number ranges. \- The prefix "ROCK" stands for the Rosetta documentation series (informally “Rosetta Ontology & Core Knowledge” series). All Rosetta 3.x standard documents will carry this prefix followed by a unique number. \- Example: The Core Spine Specification (this document) might be ROCK-3001 (the number chosen to indicate first doc of 3.0 series). \- Versioning: The document itself will indicate version (like 3.0.0). The DocID stays the same across revisions of the same document (if the doc is updated in a minor release, it might become version 3.1.0 but still ROCK-3001 if scope unchanged). If a major overhaul or split happens, possibly a new DocID would be assigned for a fundamentally new document.

**Reserved Ranges:** \- ROCK-3000 to ROCK-3099 might be reserved for core and immediate companion specs of the 3.0 release. \- ROCK-3100+ could be allocated to extension pack specifications or future addenda. \- Some ranges can be left for experimental or informative notes that are not standard-track (maybe a different prefix or explicit label but typically we stick to stable docs in this list). \- If Rosetta 4.0 comes in future, it may start with 4000 series, etc., to avoid confusion.

**DocID Mapping to File/IRI:** \- Each DocID corresponds to a canonical URI (for web access) and a recommended file naming. For instance, ROCK-3001 may be accessible at a URL like https://spec.rosetta.org/ROCK-3001 (which might redirect to a human-readable page or PDF/MD). \- Files distributed (PDF/Markdown) should include the DocID in filename: e.g., ROCK-3001\_Rosetta3\_CoreSpineSpec\_v3.0.0.pdf. \- The idea is if someone has just the DocID, they can find the latest official text easily. \- Within the documents, references use DocID plus maybe section if needed (though for web maybe linking by fragment).

**Document Registry:** Below is the **Companion Document Index Table** listing all documents in the Rosetta 3.0 suite:

| DocID | Title | Scope & Description | Dependencies | Type | Aligned Standards |
| :---- | :---- | :---- | :---- | :---- | :---- |
| ROCK-3001 | *Rosetta 3.0 Core Spine Specification* | **Core protocol specification** for Rosetta v3.0.0. Defines the minimal Pasigraphy spine (tile model, invariants, meaning pipeline, core events, etc.) and overall architecture. *(This document.)* | – (Base of all) | Standards Track (Normative) | RFC 2119 (normative language)[\[1\]](https://drive.google.com/file/d/1CeYTGuwSvNu6aDwNL55KIvX3uU5FlqRq); content addressing (Multihash)[\[14\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ); JSON Schema (for tile schemas) |
| ROCK-3002 | *Rosetta 3.0 Data Model & Semantics Reference* | Detailed schema definitions for all core tile types and the four-layer meaning pipeline. Includes JSON Schemas, SHACL shapes, and formal definitions of core semantic relations (lattice edge types). Also provides an ASCII art or UML diagram of the object model and examples. | 3001 (Core Spec) | Standards Track (Normative) | JSON Schema[\[63\]](file://file-GyLVwP6H1ScxAK6GfUyePk#:~:text=2,rescoring%20windows%2C%20translators); SHACL Shapes[\[49\]](https://www.w3.org/TR/shacl/#:~:text=This%20document%20defines%20the%20SHACL,user%20interface%20building%2C%20code%20generation); RDF Concepts[\[48\]](https://www.w3.org/RDF/#:~:text=RDF%20is%20a%20standard%20model,data%20consumers%20to%20be%20changed) (for graph model) |
| ROCK-3003 | *Rosetta 3.0 Standard Packs Specification* | Specification of **StdPacks** for external standards integration. Defines how Rosetta interfaces with OWL2/RDF(S), SKOS, SHACL, PROV-O, BPMN, DMN, SCXML, OpenAPI, AsyncAPI, CloudEvents, OpenTelemetry, WCAG, WAI-ARIA, and Design Tokens. Each sub-section describes mappings and any new tile types or anchors. | 3001 (Core Spec), relevant external standard references | Standards Track (Normative) | W3C OWL2[\[47\]](https://www.w3.org/2012/pdf/REC-owl2-overview-20121211.pdf#:~:text=The%20OWL%202%20Web%20Ontology,It%20describes%20the%20syntaxes), RDF[\[48\]](https://www.w3.org/RDF/#:~:text=RDF%20is%20a%20standard%20model,data%20consumers%20to%20be%20changed), SKOS[\[64\]](https://www.w3.org/RDF/#:~:text=The%20RDF%201,of%20data%20among%20descriptive%20communities), SHACL[\[49\]](https://www.w3.org/TR/shacl/#:~:text=This%20document%20defines%20the%20SHACL,user%20interface%20building%2C%20code%20generation), PROV-O[\[50\]](https://www.w3.org/TR/prov-o/#:~:text=The%20PROV%20Ontology%20%28PROV,based%20applications); OMG BPMN[\[51\]](https://www.omg.org/bpmn/#:~:text=The%20Business%20Process%20Model%20and,process%20semantics%20for%20technical%20users), DMN; W3C SCXML[\[52\]](https://www.w3.org/TR/scxml/#:~:text=This%20document%20describes%20SCXML%2C%20or,CCXML%20and%20Harel%20State%20Tables); OpenAPI 3.1[\[53\]](https://swagger.io/specification/#:~:text=The%20OpenAPI%20Specification%20defines%20a,understand%20service%20capabilities%20without), AsyncAPI[\[54\]](https://www.asyncapi.com/#:~:text=...%20www.asyncapi.com%20%20Open,industry%20standard%20for%20defining), CNCF CloudEvents[\[55\]](https://cloudevents.io/#:~:text=CloudEvents%20is%20a%20specification%20for,simplify%20event%20declaration%20and%20delivery), CNCF OpenTelemetry[\[56\]](https://opentelemetry.io/docs/#:~:text=Documentation%20,collecting%2C%20and%20exporting%20telemetry); W3C WCAG 2.2[\[58\]](https://www.w3.org/TR/WCAG22/#:~:text=Web%20Content%20Accessibility%20Guidelines%20,usability%20for%20users%20in%20general), WAI-ARIA 1.2[\[59\]](https://www.w3.org/TR/wai-aria-1.2/#:~:text=Accessibility%20of%20web%20content%20requires,1.1%5D%20to%20improve); W3C Design Tokens 2025.10[\[60\]](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/#:~:text=San%20Francisco%2C%20CA%20%E2%80%93%20October,decisions%20across%20tools%20and%20platforms). |
| ROCK-3004 | *Rosetta 3.0 Vocabulary Packs and Lexicon Guide* | Specification of **VocabPacks** for integrating external vocabularies/ontologies (e.g., WordNet, BabelNet, domain ontologies). Defines how lexical anchors (LEXID) and concept anchors (ANCHORID) work, namespace conventions for packs, and a registry of known VocabPacks. Includes examples of integrating a domain ontology as a pack. | 3001 (Core Spec) | Standards Track (Normative) | WordNet (Princeton) and other lexicons; SKOS (for taxonomy mapping)[\[64\]](https://www.w3.org/RDF/#:~:text=The%20RDF%201,of%20data%20among%20descriptive%20communities); possibly W3C Ontolex standards for lexicons. |
| ROCK-3005 | *Rosetta 3.0 Conformance & Compliance Profiles* | Defines the official **profiles** (Light, Full, Auditor, Forge) and the specific requirements of each. Includes SHACL-based test cases for validation and a “Self-Consistency Checklist” for implementers. Also covers governance process for spec changes (patch vs minor version criteria). | 3001 (Core Spec) | Standards Track (Normative) | SHACL (for profile validation shapes)[\[49\]](https://www.w3.org/TR/shacl/#:~:text=This%20document%20defines%20the%20SHACL,user%20interface%20building%2C%20code%20generation); RFC 2119 (terms for requirements levels)[\[1\]](https://drive.google.com/file/d/1CeYTGuwSvNu6aDwNL55KIvX3uU5FlqRq). |
| ROCK-3006 | *Rosetta 3.0 Implementation Guide (Informative)* | Guidance and best practices for implementing Rosetta. Includes design patterns, performance considerations, storage options (e.g., using RDF triple store vs document DB), example code snippets, and common pitfalls. Not normative. | 3001, 3002 (for reference) | Informative Note | – (references various tech, e.g., using OpenTelemetry SDK, but no new standard) |
| ROCK-3007 | *Rosetta 3.0 Use Case Compendium (Informative)* | Collection of detailed end-to-end examples and use case scenarios (e.g., conversational assistant, data pipeline auditing, multi-agent system, etc.). Demonstrates how to apply the spec in context. Each scenario enumerates relevant tiles sequence, with diagrams. | 3001 (Core Spec) | Informative Note | – (uses scenario-specific standards as needed in examples) |
| ROCK-3010 | *Rosetta 3.0 Schema Pack (Machine-Readable)* | **Artifact bundle**: a downloadable package containing machine-readable schemas: JSON Schemas for all tiles, SHACL shapes, and perhaps a TTL (Turtle) file representing core ontology (for concept types and edge types). Serves as the programmatic reference. (Versioned file, not prose). | 3002 (Data Model Spec) | Artifact (Normative) | JSON Schema, SHACL, RDF (for ontology graph) |
| ROCK-3099 | *Rosetta 3.x Patch Ledger and Change Log* | Living document (appendix-like) tracking all approved changes, patches, extensions in the 3.x series. Includes table of Patch ID, description, linked DocID or tile (if patch is encoded as tile), and status (draft/approved). Essentially the governance ledger for spec evolution. | 3001 (Core Spec) and others for context | Informative (process) | – (internal process, possibly referencing RFC 7282 for rough consensus, etc.) |

*(DocIDs above 3010 left for future expansion, e.g., additional pack specs or domain-specific Rosetta profiles might get 3011, 3012, etc. The numbering is not necessarily contiguous if some slots are reserved.)*

A few clarifications on columns: \- **Dependencies:** e.g., Doc 3003 (StdPacks Spec) depends on Core Spec (because it builds on core concepts) and of course on knowledge of external standards but those aren't “Rosetta docs” dependencies, rather references. \- **Artifact Types:** We label them as normative specs, informative notes, or artifact bundle. Normative means compliance requires following it; informative means it's explanatory. \- **Aligned Standards:** lists the key external standards the doc aligns with or references. For normative pack specs, these are the actual standards we map to (with citations provided as shown).

This table itself is normative in that the DocIDs and titles must be treated as fixed references. For example, if future documents cite "ROCK-3003", it unambiguously refers to the Standard Packs Specification as per above.

### Adjacency List of Document Dependencies

*(This provides a machine-readable listing of each document and which other documents it directly depends on, aiding tooling or analysis.)*

The following adjacency list is authoritative for direct Rosetta-suite dependencies. External references and the Patch Ledger's references to other documents for context are not additional prerequisite edges.

```json
{
  "ROCK-3001": [],
  "ROCK-3002": [
    "ROCK-3001"
  ],
  "ROCK-3003": [
    "ROCK-3001"
  ],
  "ROCK-3004": [
    "ROCK-3001"
  ],
  "ROCK-3005": [
    "ROCK-3001"
  ],
  "ROCK-3006": [
    "ROCK-3001",
    "ROCK-3002"
  ],
  "ROCK-3007": [
    "ROCK-3001"
  ],
  "ROCK-3010": [
    "ROCK-3002"
  ],
  "ROCK-3099": [
    "ROCK-3001"
  ]
}
```

The explanatory graph uses **A --> B to mean A depends on B** and contains exactly the adjacency-list edges:

```mermaid
graph TD
  ROCK-3002 --> ROCK-3001;
  ROCK-3003 --> ROCK-3001;
  ROCK-3004 --> ROCK-3001;
  ROCK-3005 --> ROCK-3001;
  ROCK-3006 --> ROCK-3001;
  ROCK-3006 --> ROCK-3002;
  ROCK-3007 --> ROCK-3001;
  ROCK-3010 --> ROCK-3002;
  ROCK-3099 --> ROCK-3001;
```

Editorial correction for #676: the previous graph reversed most arrows and added guide dependencies absent from the authoritative list. This rendering follows that list; it does not introduce normative dependencies.

We can explain: The Core Spec is foundational; Data Model, Packs, Profiles all extend it. Implementation Guide and Use Case compendium depend conceptually on core (and data model for details). The Schema Pack depends on Data Model definitions. Patch Ledger depends on core (and essentially tracks changes across all, but placed under core as root of version tree).

### Governance of Documents

* **Stability:** DocIDs are stable once assigned. Document titles and scopes as listed are considered authoritative. Any *substantive change* to a normative document (other than patch-level errata) results in a new version number but not a new DocID unless the change is so fundamental that it warrants a new document. (E.g., if we split one spec into two, we might retire an old DocID and assign new ones.)

* **Versioning:** This suite is version 3.0.0. Minor updates (3.1.0, etc.) will update the content and version fields inside documents but keep same DocID. A major version (4.0) would likely come with new DocID series.

* **Reserved DocIDs:** Some numbers may be reserved for anticipated future docs (like 3008, 3009 perhaps reserved for any pack extension like maybe a "Security & Privacy Spec" if needed, or we just left a gap).

* **Approval:** Changes to normative docs require consensus via the project’s governance (e.g., a Rosetta Change Proposal process). That process may itself be documented (perhaps partly in ROCK-3005 or 3099). Only after approval will an updated version be released under the same DocID with incremented version number.

* **Patch Ledger (ROCK-3099):** All accepted modifications or extensions (especially those implemented via extension tiles or minor spec updates) will be logged there for transparency[\[65\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ). This is informative but important for implementers to track what’s changed in 3.x line.

The **Document Suite Map** provided ensures that implementers and users know where to find information: \- If one needs exact schema details, go to Data Model spec (3002). \- If integrating a standard, see Standard Packs spec (3003) or VocabPacks spec (3004). \- For compliance and setup, see Profiles spec (3005). \- And this core spec (3001) is the starting point binding all together.

Finally, the governance policy is: the Core Spine Spec (this document) holds authority on overall design. Companion specs, while normative in their scope, do not override core; they elaborate it. If any discrepancy arises between documents, the project’s governance will issue clarifications (likely by patch notes in ROCK-3099 and updating docs accordingly). In principle, though, we aimed to cross-reference to avoid conflict (e.g., pack spec refers back to core definitions for basic terms).

With this, the Rosetta 3.0 specification is comprehensively defined. All components of the architecture are covered either here or in the companion documents. Implementers MUST follow the Core and any relevant companion normative specs for full compliance. The interpretability-first ethos should guide any extensions: if something is unclear or not covered, prefer to represent it explicitly (even if informatively) rather than handling it opaquely. The Document Suite will evolve under the rules above, but these DocIDs and mappings are the foundation for a stable, governed growth of the Rosetta standard.

---

[\[1\]](https://drive.google.com/file/d/1CeYTGuwSvNu6aDwNL55KIvX3uU5FlqRq) [\[18\]](https://drive.google.com/file/d/1CeYTGuwSvNu6aDwNL55KIvX3uU5FlqRq) [\[34\]](https://drive.google.com/file/d/1CeYTGuwSvNu6aDwNL55KIvX3uU5FlqRq) [\[37\]](https://drive.google.com/file/d/1CeYTGuwSvNu6aDwNL55KIvX3uU5FlqRq) [\[40\]](https://drive.google.com/file/d/1CeYTGuwSvNu6aDwNL55KIvX3uU5FlqRq) RFC ENTIF-0001 v2.1.0\_ Rosetta 2.1 Unified Protocol and Architecture Specification.docx

[https://drive.google.com/file/d/1CeYTGuwSvNu6aDwNL55KIvX3uU5FlqRq](https://drive.google.com/file/d/1CeYTGuwSvNu6aDwNL55KIvX3uU5FlqRq)

[\[2\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ) [\[4\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ) [\[5\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ) [\[8\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ) [\[10\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ) [\[11\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ) [\[12\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ) [\[14\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ) [\[15\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ) [\[16\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ) [\[17\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ) [\[41\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ) [\[42\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ) [\[61\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ) [\[65\]](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ) RFC ENTIF-0001\_ Rosetta Pasigraphy Protocol (Rosetta 2.1.0).pdf

[https://drive.google.com/file/d/1IsbgkurbF\_SjWZQBjGg3rVUr3llOYhuQ](https://drive.google.com/file/d/1IsbgkurbF_SjWZQBjGg3rVUr3llOYhuQ)

[\[3\]](file://file-VPvbDFhiafCGdWciNgUMgB#:~:text=,L165) [\[13\]](file://file-VPvbDFhiafCGdWciNgUMgB#:~:text=2) ENTIF-0001-Rosetta-2.0.0.md

[file://file-VPvbDFhiafCGdWciNgUMgB](file://file-VPvbDFhiafCGdWciNgUMgB)

[\[6\]](https://drive.google.com/file/d/1rtBQWpYxsP3yMLYCK0nBAzfMtbJn6YaV) [\[7\]](https://drive.google.com/file/d/1rtBQWpYxsP3yMLYCK0nBAzfMtbJn6YaV) [\[46\]](https://drive.google.com/file/d/1rtBQWpYxsP3yMLYCK0nBAzfMtbJn6YaV) TASK \- Unify Rosetta v2.0.2 RFC Updates.md

[https://drive.google.com/file/d/1rtBQWpYxsP3yMLYCK0nBAzfMtbJn6YaV](https://drive.google.com/file/d/1rtBQWpYxsP3yMLYCK0nBAzfMtbJn6YaV)

[\[9\]](https://drive.google.com/file/d/11NsOu35qLv19EajSiwW9jT13E7ifnJQ3) [\[30\]](https://drive.google.com/file/d/11NsOu35qLv19EajSiwW9jT13E7ifnJQ3) [\[33\]](https://drive.google.com/file/d/11NsOu35qLv19EajSiwW9jT13E7ifnJQ3) [\[44\]](https://drive.google.com/file/d/11NsOu35qLv19EajSiwW9jT13E7ifnJQ3) [\[57\]](https://drive.google.com/file/d/11NsOu35qLv19EajSiwW9jT13E7ifnJQ3) Rosetta 2.1.0 Patch Notes \- Chat GPT \- RFC Draft Version Decision.md

[https://drive.google.com/file/d/11NsOu35qLv19EajSiwW9jT13E7ifnJQ3](https://drive.google.com/file/d/11NsOu35qLv19EajSiwW9jT13E7ifnJQ3)

[\[19\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[20\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[21\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[22\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[23\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[24\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[25\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[26\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[27\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[28\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[29\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[31\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[32\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[35\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[36\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[38\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[39\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) [\[45\]](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI) Rosetta Pasigraphy Protocol and Cognitive Tiles Specification

[https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI](https://docs.google.com/spreadsheets/d/1PVwpYCAi3hsVBQ6byNeh4nEWtbN1aeF6TyMQxKVjBgI)

[\[43\]](https://www.w3.org/TR/prov-o/#:~:text=The%20PROV%20Ontology%20%28PROV,based%20applications) [\[50\]](https://www.w3.org/TR/prov-o/#:~:text=The%20PROV%20Ontology%20%28PROV,based%20applications) PROV-O: The PROV Ontology

[https://www.w3.org/TR/prov-o/](https://www.w3.org/TR/prov-o/)

[\[47\]](https://www.w3.org/2012/pdf/REC-owl2-overview-20121211.pdf#:~:text=The%20OWL%202%20Web%20Ontology,It%20describes%20the%20syntaxes) OWL 2 Web Ontology Language Document Overview (Second Edition)

[https://www.w3.org/2012/pdf/REC-owl2-overview-20121211.pdf](https://www.w3.org/2012/pdf/REC-owl2-overview-20121211.pdf)

[\[48\]](https://www.w3.org/RDF/#:~:text=RDF%20is%20a%20standard%20model,data%20consumers%20to%20be%20changed) [\[64\]](https://www.w3.org/RDF/#:~:text=The%20RDF%201,of%20data%20among%20descriptive%20communities) RDF \- Semantic Web Standards

[https://www.w3.org/RDF/](https://www.w3.org/RDF/)

[\[49\]](https://www.w3.org/TR/shacl/#:~:text=This%20document%20defines%20the%20SHACL,user%20interface%20building%2C%20code%20generation) Shapes Constraint Language (SHACL)

[https://www.w3.org/TR/shacl/](https://www.w3.org/TR/shacl/)

[\[51\]](https://www.omg.org/bpmn/#:~:text=The%20Business%20Process%20Model%20and,process%20semantics%20for%20technical%20users) Business Process Model & Notation™ (BPMN™) | Object Management Group

[https://www.omg.org/bpmn/](https://www.omg.org/bpmn/)

[\[52\]](https://www.w3.org/TR/scxml/#:~:text=This%20document%20describes%20SCXML%2C%20or,CCXML%20and%20Harel%20State%20Tables) State Chart XML (SCXML): State Machine Notation for Control Abstraction

[https://www.w3.org/TR/scxml/](https://www.w3.org/TR/scxml/)

[\[53\]](https://swagger.io/specification/#:~:text=The%20OpenAPI%20Specification%20defines%20a,understand%20service%20capabilities%20without) OpenAPI Specification \- Version 3.1.0 \- Swagger

[https://swagger.io/specification/](https://swagger.io/specification/)

[\[54\]](https://www.asyncapi.com/#:~:text=...%20www.asyncapi.com%20%20Open,industry%20standard%20for%20defining) AsyncAPI Initiative for event-driven APIs | AsyncAPI Initiative for ...

[https://www.asyncapi.com/](https://www.asyncapi.com/)

[\[55\]](https://cloudevents.io/#:~:text=CloudEvents%20is%20a%20specification%20for,simplify%20event%20declaration%20and%20delivery) CloudEvents |

[https://cloudevents.io/](https://cloudevents.io/)

[\[56\]](https://opentelemetry.io/docs/#:~:text=Documentation%20,collecting%2C%20and%20exporting%20telemetry) Documentation \- OpenTelemetry

[https://opentelemetry.io/docs/](https://opentelemetry.io/docs/)

[\[58\]](https://www.w3.org/TR/WCAG22/#:~:text=Web%20Content%20Accessibility%20Guidelines%20,usability%20for%20users%20in%20general) Web Content Accessibility Guidelines (WCAG) 2.2

[https://www.w3.org/TR/WCAG22/](https://www.w3.org/TR/WCAG22/)

[\[59\]](https://www.w3.org/TR/wai-aria-1.2/#:~:text=Accessibility%20of%20web%20content%20requires,1.1%5D%20to%20improve) Accessible Rich Internet Applications (WAI-ARIA) 1.2

[https://www.w3.org/TR/wai-aria-1.2/](https://www.w3.org/TR/wai-aria-1.2/)

[\[60\]](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/#:~:text=San%20Francisco%2C%20CA%20%E2%80%93%20October,decisions%20across%20tools%20and%20platforms) Design Tokens specification reaches first stable version | Design Tokens Community Group

[https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/](https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/)

[\[62\]](https://www.cncf.io/announcements/2024/01/25/cloud-native-computing-foundation-announces-the-graduation-of-cloudevents/#:~:text=Cloud%20Native%20Computing%20Foundation%20Announces,across%20services%2C%20platforms%2C%20and%20systems) Cloud Native Computing Foundation Announces the Graduation of ...

[https://www.cncf.io/announcements/2024/01/25/cloud-native-computing-foundation-announces-the-graduation-of-cloudevents/](https://www.cncf.io/announcements/2024/01/25/cloud-native-computing-foundation-announces-the-graduation-of-cloudevents/)

[\[63\]](file://file-GyLVwP6H1ScxAK6GfUyePk#:~:text=2,rescoring%20windows%2C%20translators) Chat GPT \- Rosetta 2.0 Spec Creation.md

[file://file-GyLVwP6H1ScxAK6GfUyePk](file://file-GyLVwP6H1ScxAK6GfUyePk)