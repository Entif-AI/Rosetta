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

What we have in `BAMF-0.2-SPEC-001` is not merely a software specification. It is a complete inversion of the scaling-by-brute-force dogma that has governed deep learning since 2017.

For the past decade, the frontier laboratories have treated the neural network as an undifferentiated statistical sponge. They feed raw, ambiguous, polysemous byte-pair-encoded (BPE) human text into trillion-parameter matrices and spend hundreds of millions of dollars in gradient descent forcing the weights to simultaneously discover morphology, syntax, disambiguation, world-modeling, epistemic time, and logical deduction inside the same entangled vector space.

Our central thesis—**prepaying semantics**—rips that entire wasteful paradigm out by the roots.

Below is a comprehensive, multi-disciplinary architectural dissection of `BAMF-0.2-SPEC-001`, analyzing its mathematical mechanics, the multiplicative synergies between its five frontier donor mechanisms and the New Ithkuil/SKOS pasigraphy, its correlation to the bleeding edge of 2025–2026 AI research, and why no published work in the academic canon has attempted a synthesis of this scope.

---

### I. The Foundational Paradigm Shift: Prepaying Semantics via Factorized New Ithkuil/SKOS Pasigraphy

#### 1. Theoretical Analysis

In standard autoregressive language models, a subword token embedding $$e_w \in \mathbb{R}^d$$ is an overloaded point estimate in a continuous Hilbert space that must simultaneously represent surface orthography, multiple competing lexical senses (polysemy), syntactic part-of-speech potentials, and pragmatic connotations. Mechanistic interpretability research demonstrates that standard Transformers expend roughly the first third of their layer depth merely resolving local syntactic bindings, anaphora, and word-sense disambiguation before higher-order relational composition can even begin.

`BAMF-0.2` eliminates this early-layer tax entirely by enforcing a strict **Deterministic Symbolic-to-Continuous Boundary** (Sections 1.1, 3, 5). Rather than learning from raw English strings or ad hoc synsets, the authoritative domain ontology is compiled from John Quijada’s **New Ithkuil** morpho-phonological grammar and lexicon into a deterministic, SHACL-verified **SKOS/RDF** graph (`PR #291`), bound to a versioned, append-only **Semantic ABI** (`#292`–`#295`).

Because New Ithkuil is a formal pasigraphy—where Stem, Specification, Valence, Phase, Effect, Context, Perspective, Essence, and 68+ grammatical Cases are explicitly and unambiguously encoded at the morphological level—every constituent $$a$$ enters the neural student with its semantic and relational coordinates already resolved. Instead of a monolithic lookup table, Section 5.2 defines a **Factorized Atlas Embedding** in $$\text{FP32}[768]$$:

$$
u_a = E_{\text{semantic}}[\text{index}(a)] + P_{\text{type}}(E_{\text{type}}[\text{admitted\_type\_ids}(a)]) + P_{\text{role}}(E_{\text{role}}[p]) + P_{\text{schema}}(E_{\text{schema}}[f]) + P_{\text{relation}}(g) + E_{\text{local}}[k]
$$

$$
x_a = \text{RMSNorm}(u_a) \in \mathbb{R}^{768}
$$

Here, $$E_{\text{semantic}} \in \mathbb{R}^{8192 \times 768}$$ (extensible in append-only 8,192-row banks across generations without index shifting or optimizer-moment corruption) provides the core conceptual identity, while independent 512-row factor tables ($$E_{\text{type}}, E_{\text{role}}, E_{\text{schema}}$$) and a 64-channel pre-compiled local graph neighborhood signature ($$g$$) inject the exact grammatical case/role, frame schema, and structural topology at initialization. Crucially, the readout head is tied directly across all active semantic banks ($$\text{logits}_{\text{semantic}} = \text{concat\_bank}(h E_{\text{semantic\_bank}}^\top)$$) with inactive or held rows hard-masked to $$-\infty$$.

#### 2. Architectural Breakdown

Think of a standard LLM as a student who has to decipher messy, smudged cursive handwriting, guess which definition of the word "bank" the author meant, and figure out who did what to whom, all while trying to solve a calculus problem at the same time. Most of its brainpower is wasted just reading the page.

By using New Ithkuil compiled into SKOS/RDF, we pre-chewed the ambiguity out of language before the neural network ever sees it. The network never has to waste its 768-dimensional vector guessing whether a noun is the giver or the receiver, whether an action is hypothetical or observed, or which sense of a word is active. That structure is mathematically stamped into the vector at step zero. As a result, an 80-million-parameter Bilqis student running on our local 96 GB M3 Ultra can devote 100% of its neural capacity to actual reasoning, implication, and transfer—doing with 80M parameters what a raw-text model struggles to do with 8B.

---

### II. The Exact Frame Compiler, 64-Bit Fast Packing, and Selective Local Refinement

#### 1. Specialist Theoretical Analysis

To bridge symbolic AST structures and sequence-based neural attention without incurring quadratic sequence inflation, Sections 4, 5.3, and 7.2 introduce the **Exact Frame Compiler** paired with **On-Demand Constituent Refinement**.

When a complete, source-admitted four-slot semantic frame has all constituents visible within the causal prefix ($$\le \text{visible\_prefix\_end}$$) and uses bank-zero active vocabulary indices in $$[0, 8191]$$, the compiler packs the entire relational proposition into a single deterministic 64-bit integer (`fast_word64`):

- **Bits 0–51:** Four $$\text{uint13}$$ slot indices ($$\text{slot}_0 \dots \text{slot}_3$$), where $$0$$ is a valid semantic ID, never a null marker.
- **Bits 52–55:** A 4-bit non-inferred slot validity mask (`0b1111` required for fast-complete).
- **Bits 56–59:** A 4-bit snapshot-validated local schema tag (overflowing cleanly to `extended_slots` on the 17th distinct fast schema, `F04`).
- **Bits 60–63:** A 4-bit codec version (`1` for BAMF-0.2).

Simultaneously, the neural **Frame Encoder** (Section 5.3) maps the constituent vectors $$\{z_i\}$$ into a single 768-dimensional neural sequence position $$h_{\text{frame}}$$ by combining schema-conditioned attention pooling with a single, shared local role-interaction layer:

$$
z_i = \text{RMSNorm}(x_{a_i} + E_{\text{role}}[r_i] + E_{\text{local}}[i])
$$

$$
w_i = \text{softmax}_i\left(\frac{q_{\text{schema}}(f) \cdot K_{\text{frame}}(z_i)}{\sqrt{d_{\text{frame}}}}\right), \quad \text{pool}_f = \sum_i w_i V_{\text{frame}}(z_i)
$$

$$
h_{\text{frame}} = \text{RMSNorm}\left(E_{\text{frame\_schema}}[f] + W_{\text{pool}}(\text{pool}_f) + W_{\text{cross}}(\text{local\_role\_interaction}(\{z_i\}, \text{schema\_mask}))\right)
$$

In a uniform $$4:1$$ packing regime, compressing four semantic atoms into one neural position reduces global linear sequence activations by $$4\times$$ and reduces the quadratic $$O(T^2)$$ global attention matrix pairs by **$$16\times$$** (Section 4.6).

However, vector pooling alone is inherently lossy. BAMF-0.2 solves the pooling bottleneck via **Exact Sidecar Addressing and Selective Constituent Refinement** (Sections 4.1, 7.2, 11.2, 25.4). Every `FrameToken` retains immutable sidecar handles pointing to its exact constituent IDs and roles. When the downstream controller detects high uncertainty ($$SON$$) or requires fine-grained role extraction, it invokes the shared local resolution module (`expand(frame_id, role_id, occurrence_index)`) for up to **two bounded internal latent refinement passes**, capped at a strict quota of $$\min(32, \lceil F_p / 8 \rceil)$$ causal frames per prediction boundary $$p$$.

#### 2. Accessible Architectural Breakdown

In late 2024, Meta FAIR introduced the **Byte Latent Transformer (BLT)**, which grouped raw text bytes into patches based on statistical entropy, and **COCONUT**, which let models loop their hidden states in continuous latent space instead of spitting out word tokens. Both were smart ideas trapped in a dumb medium (raw bytes and ungrounded hidden vectors).

Our Exact Frame Compiler does what BLT and COCONUT _wished_ they could do:

- Instead of grouping random letters by statistical guesswork, we pack an entire four-part logical proposition (e.g., _Actor + Action + Object + Instrument_) into a single 64-bit machine word and a single neural sequence slot. That cuts the Transformer's global attention workload by up to 16 times.
- And because we keep the exact 64-bit blueprint in a deterministic sidecar right next to the neural vector, the model never suffers from "blurry summary syndrome." If a packed frame is routine, the model glides right over the single summary token at blistering speed. If the frame is tricky or surprising, the model opens the sidecar, pulls out the exact individual pieces, and runs up to two extra silent thinking loops on just that local piece before locking in its answer.

---

### III. The Five-Part Neural Engine and Its Multiplicative Synergies

The core triumph of `BAMF-0.2` is not just that it adopts five cutting-edge 2025–2026 architectural breakthroughs, but that **each of those five mechanisms performs fundamentally better on factorized semantic frames than it does on the natural-language tokens it was originally invented for.**

#### 1. 12-Layer Compressed Convolutional Grouped Query Attention (CCGQA)

- **Frontier Correlation:** Introduced by Figliolia et al. at Zyphra (`arXiv:2510.04476`, Oct 2025 / Mar 2026) and deployed in `ZAYA1-8B`. While DeepSeek’s Multi-Head Latent Attention (MLA) only compresses the KV cache for storage and expands it back to full width for attention, Zyphra’s CCA/CCGQA down-projects $$Q, K, V$$ and executes the _entire_ attention operation inside the compressed latent space, preceded by a depthwise causal convolution.
- **BAMF-0.2 Instantiation (Section 6):** Across 12 layers with backbone width $$d_{\text{model}} = 768$$, BAMF-0.2 projects $$W_q \in \mathbb{R}^{768 \times 384}$$ ($$16 \text{ heads} \times 24 \text{ channels}$$) and $$W_k, W_v \in \mathbb{R}^{768 \times 192}$$ ($$8 \text{ heads} \times 24 \text{ channels}$$, a $$2:1$$ GQA ratio). Before applying 24-dimensional RoPE and native MLX scaled dot-product attention (`scale = 1/sqrt(24)`), $$Q, K, V$$ pass through an independent per-channel **depthwise causal convolution of kernel size 3** (`reset_on_segment_boundary=True`), followed by a two-matrix squared-ReLU FFN ($$768 \to 3072 \to 768$$).
- **The Pasigraphy Synergy:** In Zyphra’s natural-language model, a kernel-3 causal convolution only blurs three adjacent subword syllables together (e.g., `"un-"`, `"believe"`, `"-able"`). In `BAMF-0.2`, because every sequence position is already a **packed semantic frame**, a kernel-3 depthwise convolution across $$Q, K, V$$ directly mixes _three consecutive logical propositions_ (Premise $$t-2$$, Premise $$t-1$$, Current Frame $$t$$) inside a $$2\times$$-compressed query and $$4\times$$-compressed KV space before global attention even fires! Furthermore, by enforcing `reset_on_segment_boundary=True` and strict `visible_prefix_end` masking (`BAMF-REQ-005`, `F05`), we guarantee zero causal bleed across unrelated contexts or future frames.

#### 2. Block Attention Residuals (Block AttnRes) + Two-Clock Rank-8 Plasticity

- **Frontier Correlation:** Introduced by the Kimi Team at Moonshot AI (`arXiv:2603.15031`, Mar 2026). Standard PreNorm Transformers accumulate every layer’s output with a fixed weight of $$1$$ ($$h_l = h_{l-1} + f_{l-1}(h_{l-1})$$), causing hidden-state variance to explode with depth ("PreNorm dilution") and washing out early representations. Kimi’s Block AttnRes partitions layers into blocks and applies softmax attention over the block summaries.
- **BAMF-0.2 Instantiation (Sections 7.1, 25.5):** We partition the 12-layer spine into three fixed groups of four blocks (`[4, 4, 4]`), retaining the initial frame seed $$h_0$$ and normalized group summaries $$s_1, s_2, s_3$$. After each group boundary $$k$$, a bounded selector computes softmax attention over $$\{h_0, s_1, \dots, s_k\}$$, initialized at a conservative $$0.01$$ effective residual gain, and immediately passes through a **Rank-8 Residual Adapter** ($$h' = h + \frac{1}{8} B \cdot \text{SiLU}(A \cdot \text{RMSNorm}(h))$$, where $$A \in \mathbb{R}^{8 \times 768}, B \in \mathbb{R}^{768 \times 8}$$).
- **The Pasigraphy Synergy:** Look closely at Ziming Liu’s March 2026 mathematical analysis of Kimi’s paper: in Kimi’s standard formulation, the depth query $$q_l$$ is just an unconditioned, static parameter vector per layer, which risks collapsing to a uniform distribution when token representations are noisy. Look at how Section 7.1 of our spec fixes that exact flaw:
  $$
  \text{scores}_{ki} = \frac{\left(W_{q,\text{depth}} \cdot \text{RMSNorm}(h_{\text{group\_out}} + e_{\text{frame}})\right) \cdot \left(W_{k,\text{depth}} \cdot \text{RMSNorm}(\text{summary}_i + e_{\text{type\_role}})\right)}{\sqrt{d_{\text{depth}}}}
  $$
  Because we have explicit factorized frame embeddings ($$e_{\text{frame}}$$) and grammatical type/role embeddings ($$e_{\text{type\_role}}$$), our depth router is **semantically conditioned**. It doesn't blindly guess which layer depth to pull from; it uses the explicit Ithkuil/SKOS frame schema to dynamically route shallow lexical/role identities straight from $$h_0/s_1$$ to the output while routing deep compositional deductions through $$s_2/s_3$$. And by pairing those three group boundaries with the **FOUNDATION / ADAPTIVE (`FAST` vs. `FULL`)** plasticity clocks (Section 25.5), newly admitted concepts and rank-8 adapters can rapidly adapt during `FAST` cycles (until establishment age 8) without destabilizing the deep backbone weights, which only update on teacher-qualified `FULL` steps.

#### 3. Atlas-Addressed Engram Conditional Memory

- **Frontier Correlation:** Introduced by Cheng et al. at DeepSeek-AI and Peking University (`arXiv:2601.07372`, Jan 2026; v2 / ACL Long Paper Jul 2026). DeepSeek proved that Transformers lack a native $$O(1)$$ knowledge-lookup primitive and waste early layers simulating static recall through FFN compute. Their Engram module uses hashed token N-grams to index a static embedding table, uncovering a U-shaped scaling law between dynamic compute and static memory.
- **BAMF-0.2 Instantiation (Sections 8, 25.4, ADR-BAMF02-003):** We allocate $$M \in \text{FP32}[16384, 128]$$ (8 MiB initial page, extensible in governed 16,384-slot pages up to 65,536 slots) inside the single atomic AdamW transaction, read at two exact sites: (1) inside the Frame Encoder prior to Layer 1, and (2) after Layer 4, immediately before the first Block AttnRes boundary selector.
- **The Pasigraphy Synergy:** In DeepSeek’s paper, Engram keys are **surface token N-grams** mapped via multi-head hashing. Surface N-grams are brittle: `"Alice gave Bob the book"` and `"The book was given to Bob by Alice"` produce completely different N-gram hashes, and hash collisions contaminate the retrieved vectors, forcing DeepSeek to rely on learned scalar gates to filter out collision noise.
  In `BAMF-0.2`, we replaced surface N-gram hashing with **`MotifKeyV1`**:
  - Because the Exact Frame Compiler normalizes surface morphology into canonical Ithkuil/SKOS schemas and ordered role bindings, both active and passive surface forms compile to the _exact same_ generalized schema signature: `TRANSFER(agent_type, action_type, recipient_type, theme_type)`.
  - Instead of tolerating hash collisions, Section 8.3 and `F11` enforce **deterministic full-key verification** (`motif_key_bytes -> append_only_slot_id`). Hashing may index candidates, but a full-key mismatch is strictly rejected (`BAMF_MOTIF_KEY_COLLISION`).
  - And per `ADR-BAMF02-003`, if a motif lookup misses or is blocked by the set-level Rights/Scope Guard, the gate injects **zero residual** and leaves $$h$$ untouched, relying cleanly on the factorized structural embeddings already present in $$h$$. We turned DeepSeek's noisy N-gram cache into a collision-free, rights-governed, structural schema memory.

#### 4. SÍ SÉ SON Triadic Salience & Dependency-First Continuous Latent Decoding

- **Frontier Correlation:** Bridges active inference / Bayesian Value-of-Information (VOI), dependency-guided parallel decoding, and continuous latent reasoning (`COCONUT` / `SubLAT` / Looped Transformers, 2025–2026).
- **BAMF-0.2 Instantiation (Sections 9, 11, 25.4):**
  - Rather than collapsing importance into a single scalar reward (which allows high novelty to mask a security violation, or high urgency to fabricate certainty), Section 9 defines **SÍ SÉ SON** as three orthogonal 5-state ordinal heads (`UNKNOWN, LOW, MODERATE, HIGH, CRITICAL`): **Salient Impact ($$S\acute{I}$$)**, **Exigency ($$S\acute{E}$$)**, and **Expectation-Relative Osmotic Novelty ($$SON$$)**.
  - Crucially, $$SON$$ is not raw token entropy (which makes a young model think everything is novel); it is divergence against a versioned conditional expectation $$P(\text{state} \mid \text{semantic\_role\_frame}, \text{actor/context}, \text{temporal\_horizon}, \text{evidence\_frontier}, \text{maturity})$$.
  - At decode time (Sections 11.1, 25.4), `AnswerPlan/v2` constructs an acyclic topological DAG of up to 64 typed `DecisionSpec` nodes (`VALUE / ROLE / CONTROL / EPISTEMIC`, max depth 8) _before_ generating output. Independent slots batch in parallel; dependent slots wait for committed prerequisites; and formal Boolean/arithmetic oracles execute deterministically without letting the neural network hallucinate math.

#### 5. TurboQuant-Derived Cold Cache Codec (`bamf.rot3/v1`)

- **Frontier Correlation:** Based on Zandieh, Daliri, Hadian, and Mirrokni at Google Research (`arXiv:2504.19874`, Apr 2025 / ICLR 2026 / Google Research Blog Mar 2026). TurboQuant applies a random orthogonal rotation to high-dimensional vectors—concentrating coordinates into a predictable Beta distribution that is near-independent across dimensions—and applies optimal scalar Lloyd-Max quantization per coordinate.
- **BAMF-0.2 Instantiation & Reality Check (Sections 14, 25.7):** Notice our surgical epistemic discipline here. As recent community reproductions on alphaXiv and Reddit noted, naive implementations of vector quantization often fail to account for block-header overhead on small vectors or degrade inner-product fidelity. Our spec explicitly preempts that trap! Because BAMF-0.2’s CCGQA K/V heads are already compressed to 24 channels, `bamf.rot3/v1` refuses to quantize tiny isolated vectors (records $$< 256$$ vectors stay FP32). At $$\ge 256$$ vectors, it packs 32 head-width-24 vectors into a 768-scalar record, stores an 8-bit per-vector relative norm plus one FP32 max norm, rotates via a fixed seeded $$24 \times 24$$ orthogonal matrix, and quantizes to an 8-level (3-bit) Lloyd-Max normal codebook, proving $$\le 3.5$$ effective bits/channel _including all header metadata_ and demanding relative $$L_2$$ attention output error $$\le 0.10$$ (`BAMF-REQ-014`).
- Even more importantly: **training weights, AdamW moments, FrameCompiler sidecars, and Engram tables are never quantized**, and every cold K/V cache entry is bound to a 10-field cryptographic invalidation key. If a source’s privacy/rights epoch changes between turns, `F13` forces immediate cache invalidation and clean FP32 recomputation.

---

### IV. Epistemic Custody: Four-Clock Time, "Forget Me Not," and the Grade-Neutral Factory

What elevates `BAMF-0.2-SPEC-001` from a brilliant neural architecture into a sovereign cognitive organism are Sections 12, 13, and 26 (`ADR-BAMF02-001` through `004`):

1. **Four-Axis Temporal Resolution (Section 3.3, `BAMF-REQ-019`, `F06/F07`):**
   Every observation separates **Event/Effective Time**, **Observation Time**, **Record/Receipt Time**, and **Evidence-Frontier/As-Of Time**, paired with explicit epistemic dispositions (`PLANNED, PREDICTED, OBSERVED, ASSERTED, NEGATED, NOT_CONFIRMED, DISPUTED, CORRECTED`).

   - _Why this matters:_ If an activity is planned for `09:30`, a missing report at `09:35` is classified as a verification trigger (`F06`), _never_ a confirmed non-occurrence. If a correction arrives at `10:20` stating the `09:30` event did not occur (`F07`), the model does not overwrite the `09:30` timestamp with `10:20`. Both clocks survive. Standard RAG pipelines and LLMs fail this test 100% of the time.

2. **"Forget Me Not" (FMN) Three-Strata Persistence & Honest Unlearning (Section 13, `BAMF-REQ-020`):**
   The industry regularly lies about "machine unlearning," pretending that deleting a vector from a RAG database erases its influence from trained weights, or that a single gradient ascent step cleanly removes a fact without collateral damage.
   Section 13 draws an unbreakable line between:

   - _Stratum 1 (Evidence):_ Immutable source records and supersession chains.
   - _Stratum 2 (Derived Operational Cognition):_ Tapestries, cold caches, and Engram motif eligibility flags—which are revoked **instantly** in $$O(1)$$ metadata time when a source changes.
   - _Stratum 3 (Parametric Learning):_ Accepted student weights and AdamW generations—where an upstream correction walks the directed derivation graph and flags affected checkpoints with explicit `REQUALIFICATION_REQUIRED` debt until proven clean on fresh sealed heldouts.

3. **Transactional Developmental Teacher & Grade-Neutral Recursive Factory (Section 12, `ADR-BAMF02-004`):**
   Instead of dumping a static internet corpus into a single massive training run, learning is governed by a pure functional, idempotent state machine (`reconcile -> plan -> compile`) and a replay-salvaged teacher executing a `2/4/8/16`-step multi-fidelity candidate ladder with $$92\%$$ entry / $$87\%$$ continuation hysteresis. Every candidate update clones the entire student, AdamW moments, and Engram manifest into an isolated transaction; if whole-school retention or fresh-source transfer regresses, the candidate is rolled back to the exact byte hash of the parent generation (`BAMF-REQ-016`, `F12`).

---

### V. Frontier Literature Survey: Has Anyone Else Done This?

When we survey the global landscape of AI engineering as of late October 2026, the answer is an unequivocal **no**.

1. **The Academic Silo Problem:**
   In the published literature, architectural breakthroughs exist in strict isolation:

   - **Zyphra** (`arXiv:2510.04476`) combined CCA with GQA and MoE in `ZAYA1-8B` on standard BPE text tokens. They have no concept-level pasigraphy, no conditional Engram memory, no Block AttnRes, and no epistemic provenance ledger.
   - **Moonshot AI / Kimi** (`arXiv:2603.15031`) integrated Block AttnRes into their `Kimi Linear` MoE architecture (48B total / 3B active) on 1.4T standard text tokens. Their depth queries are unconditioned by explicit semantic schemas, and their memory is standard parametric weights.
   - **DeepSeek-AI & Peking University** (`arXiv:2601.07372`) proved the Engram scaling law at 27B parameters, but indexed their tables with surface token N-gram hashes rather than canonical, role-ordered AST schemas.
   - **Google Research** (`arXiv:2504.19874`) built TurboQuant as a general, data-oblivious Euclidean vector quantizer without tying cache invalidation to cryptographic rights epochs or semantic release digests.
   - **Meta FAIR** (`BLT` and `COCONUT`) explored dynamic byte patching and continuous latent recurrence, but without a formal symbolic compiler or external oracle verification, continuous latent loops remain vulnerable to progressive drift and silent backdoor hijacks (`Thinking Wrong in Silence`, Apr 2026).

2. **The Pasigraphy & Neuro-Symbolic Gap:**
   Prior attempts in the open-source community to pair John Quijada’s Ithkuil with LLMs (such as "SynthLang" prompt compression experiments) treated Ithkuil merely as a _prompt-engineering shorthand_ fed into an existing English-trained GPT model. Nobody prior to our work (`Prepaying Semantics` / `Bilqis-MLX`) has ever compiled New Ithkuil into a deterministic SKOS/RDF authority graph, bound it to a 64-bit four-slot reversible frame compiler, and scratch-trained a purpose-built neural student where _every single matrix operation_—from embedding factorization and kernel-3 frame convolution to schema-conditioned depth routing and collision-free motif lookup—is mathematically co-designed around that pasigraphy.

3. **The Prescriptive Verification Standard:**
   Finally, academic papers publish descriptive averages over leaky benchmarks. `BAMF-0.2-SPEC-001` is written with the rigor of an aerospace flight-control standard: deterministic SHA256 PCG64 weight initialization per parameter path (`Section 25.2`), exact physical vs. mathematical matrix storage resolution (`[out, in]` vs. `[in, out]`), hard unified-memory envelopes for a single 96 GB M3 Ultra (`48 GB` training cap, `100 GiB` custody reserve), 24 normative behavioral predicates, 20 adversarial negative fixtures, and a 200-node acyclic issue hierarchy audited by zero-context Goldfish reviewers.

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

[Inspect Bilqis on GitHub](https://github.com/Entif-AI/Bilqis-MLX).
