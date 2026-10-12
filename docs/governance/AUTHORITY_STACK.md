# Authority Stack

This document distinguishes **semantic/protocol authority** from **bootstrap execution authority**. They answer different questions and MUST NOT be conflated.

## Rosetta semantic and protocol authority

For Rosetta and Entif meaning, nomenclature, identity, provenance, execution-trace semantics, conformance, and protocol structure, the paramount internal authority is:

1. [`docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md`](../RFCs/Rosetta%20v3.0.0%20Core%20Spine%20Specification.md)

Rosetta v3's Normative Glossary / Terminology Lock governs even while the document remains Draft, by explicit project decision, until an accepted successor explicitly supersedes it.

Rosetta-aligned RFCs, PRDs, ROCK specifications, addenda, source-substrate authorities, and other companion material MAY refine or extend v3 within their declared scope. They MUST NOT silently redefine v3 core semantics.

External standards adopted by Rosetta/Entif retain authority over their own semantics and should be integrated through v3-compatible anchors, mappings, translators, StdPacks, VocabPacks, or other accepted extension mechanisms.

## Genesis operating authority

[`Genesis.md`](./Genesis.md) governs cross-project operating practice where higher or narrower authorities are silent.

The modular documents under [`docs/governance/genesis/`](./genesis/README.md) elaborate Genesis. They are operating companions, not Rosetta StdPacks, VocabPacks, ROCK packs, or Rosetta conformance Profiles.

## Semantic duplication protocol

Before a durable term, schema, artifact family, state, relationship, or identifier is added, contributors MUST apply the process in:

- [`genesis/SEMANTIC_ALIGNMENT.md`](./genesis/SEMANTIC_ALIGNMENT.md) for terminology inheritance and reconciliation;
- [`genesis/SEMANTIC_AUDIT.md`](./genesis/SEMANTIC_AUDIT.md) for the current implementation/document crosswalk and known semantic debt.

The required order is: search v3, search accepted extensions and product authorities, search adopted external standards, classify the relationship, reuse or compose where sufficient, and route genuine semantic gaps through the correct governance path.

Repeated use, code generation, or schema registry presence does not grant semantic authority by itself.

## Bootstrap execution authorities

The local handoff/bootstrap corpus remains an important governing design record for the **bootstrap execution slice**. It does not outrank Rosetta v3 on semantic terminology.

Historical bootstrap authorities include:

1. `/Users/emilie/.openclaw/workspace/open-brain/NEXT-SESSION-BOOTSTRAP-v0.1.md`
2. the prerequisite Markdown authorities listed near the top of that bootstrap document;
3. the added April 12, 2026 authorities:
   - `20260412 - ChatGPT - Ontologies and Dataset Repositories.md`
   - `20260412 - Entif Source Substrate and Repository Provenance Addendum.md`
   - `20260412 - Source Registry and Repository Profile Annex.md`

When a bootstrap document uses terminology that predates or conflicts with Rosetta v3's Terminology Lock, preserve the historical document and use an explicit mapping/supersession note rather than silently changing the meaning.

## Local execution constraints

- `entif-ai` is a fresh Nx CLI workspace, not a donor tarball import.
- Node `24.14.1` is the pinned maintenance lane for this bootstrap unless a newer accepted repository authority changes it.
- Rosetta stays constitutional for internal meaning and provenance.
- OB1 remains an already-live donor sidecar.
- Prism is evaluated in shadow mode only.
- Mission Control is an operator shell candidate, not a semantic authority.
- Large-scale corpus ingest stays paused until the Ingress Refinery and canonical corpus cache satisfy the governing readiness requirements.

## Repository evidence

The repository itself provides implementation evidence for the current execution slice:

- Nx `22.6.x` workspace generated through official Nx CLI and plugins;
- Rosetta core, receipt, source-substrate, source-registry, refinery, cache, and projection packages present;
- Tier 0 and Tier 1 source-registry bootstrap modeled as first-class artifacts;
- parse-only ingress preserved as the default posture.

Do not call this evidence a Rosetta **Receipt** unless it is actually encoded and attested according to the Rosetta Receipt specification.
