# Authority Closure and Requirements Traceability

**Version:** 0.1-draft  
**Status:** Proposed governance doctrine  
**Date:** 2026-09-03  
**Authority class:** Cross-repository engineering-process and agent-orchestration doctrine  
**Scope:** Human contributors, coding agents, automations, Skills, repository tooling, issue/PR generation, implementation planning, review, conformance, and internal Entif/Rosetta engineering workflows

## 1. Purpose

Rosetta's public semantic and interoperability surface and Entif's protected operational machinery may live in different repositories without becoming separate architectural realities.

This doctrine defines the process that keeps them aligned.

The governing requirement is:

> **Resolve authority before implementation. Close the requirements graph before changing behavior.**

A contributor or agent MUST NOT infer that the repository or files immediately visible to it contain the complete set of requirements governing a behavioral change.

This document complements `PUBLIC_COMMONS_AND_PRIVATE_OPERATION_BOUNDARY.md`. That doctrine decides what may be public. This doctrine decides how public and protected requirements remain technically coherent after separation.

## 2. Core invariants

### 2.1 Rosetta owns data-bearing interoperability

Rosetta owns official schemas, structures, semantics, serializations, storage contracts, integration mappings, exchange envelopes, and adapters used to store, integrate, transform, or exchange governed data.

Protected implementation MAY implement, optimize, specialize, or outperform Rosetta-shaped operation. It MAY own decision procedures, orchestration, ranking, routing, thresholds, learning policy, deployment behavior, and other non-interoperability machinery. It MUST NOT become the hidden owner of a data-bearing contract or adapter boundary.

If protected work needs a new field, record, relation, state, persistence shape, integration adapter, or exchange contract, that requirement MUST receive a Rosetta owner before it becomes an official implementation dependency.

Research and demonstration repositories MAY supply prototypes, fixtures, or candidate shapes. Those artifacts have no official semantic authority until Rosetta adopts or maps them.

If protected requirements and Rosetta semantics conflict, the conflict MUST be surfaced explicitly and resolved through the applicable authority process. An implementation MUST NOT conceal the conflict by changing behavior only in protected code.

### 2.2 Protected requirements remain discoverable without being disclosed

A public Rosetta surface MAY declare that protected implementation authority exists by using opaque protected identifiers such as `IPR-0027`.

Public artifacts MUST NOT require access to protected content merely to understand or validate Rosetta semantics.

Public artifacts MUST NOT contain direct links to a protected repository or reproduce protected requirement contents.

### 2.3 Internal engineering resolves both sides

An authorized internal engineering agent or human that can access both public and protected repositories SHOULD resolve both:

1. the relevant public Rosetta authorities; and
2. the relevant protected operational authorities.

The fact that a requirement is private does not make it optional for internal implementation.

### 2.4 Accessibility is not authority

Search results, issue comments, old PRDs, generated summaries, chat archives, implementation code, model output, and other retrieved material MAY provide evidence or history.

They MUST NOT automatically outrank current normative authority.

## 3. Authority closure

**Authority closure** is the state in which a task has identified and reviewed every materially relevant authority node that is required before implementation may proceed.

For an engineering change, closure SHOULD answer:

- Which public Rosetta contracts are affected?
- Which governance documents constrain the change?
- Which protected authority identifiers constrain the implementation?
- Which schemas, Profiles, Packs, fixtures, receipts, or conformance rules are affected?
- Which authority wins if two sources disagree?
- Which requirements are normative, advisory, historical, experimental, or implementation-specific?
- What proof will show that the change still conforms?

A task whose materially relevant authority cannot be resolved SHOULD stop at planning or conflict-report generation rather than inventing missing policy.

## 4. Requirements graph

Entif/Rosetta SHOULD maintain a machine-readable requirements graph that relates public and protected authority without collapsing their disclosure boundaries.

The graph SHOULD support at least these relationship classes:

- `implements`
- `constrains`
- `consumes`
- `supersedes`
- `derived_from`
- `validated_by`
- `represented_by`
- `produces`
- `blocks`
- `requires_review_of`

Graph nodes MAY include:

- public schemas and artifact families;
- public issues, RFCs, Profiles, Packs, and governance documents;
- protected `IPR-####` authorities;
- packages and runtime surfaces;
- tests, fixtures, receipts, and conformance bundles;
- Skills and automation workflows;
- implementation decisions and accepted exceptions.

## 5. Public/private authority bridge

The public repository maintains `docs/governance/PUBLIC_PRIVATE_AUTHORITY_BRIDGE.yaml`.

That file is a disclosure-safe projection of the requirements graph. It MAY identify:

- a public contract or artifact family;
- a public issue or authority;
- opaque `IPR-####` protected authority identifiers;
- the type of relationship;
- the implementation actions that require protected-authority review;
- public validation/conformance references.

It MUST NOT contain:

- direct protected-repository URLs;
- protected issue titles when the title itself discloses protected content;
- private algorithms, thresholds, weights, heuristics, or implementation details;
- private infrastructure paths or credentials.

The protected repository SHOULD maintain the inverse mapping with full internal detail.

## 6. Required engineering preflight

Before materially changing behavior, an internal contributor or agent SHOULD perform this sequence:

1. **Identify change surface**
   - packages, schemas, APIs, Profiles, Packs, runtime behaviors, Skills, automations, or governance surfaces affected.
2. **Resolve public authority**
   - Core Spine, accepted governance, schema authority, public Profiles/Packs/contracts, conformance fixtures.
3. **Resolve protected authority**
   - query the public/private authority bridge;
   - for every relevant `IPR-####`, resolve the protected requirement through the internal authority map and requirements spine.
4. **Classify source roles**
   - normative, advisory, historical, experimental, evidence-only, or implementation-specific.
5. **Detect conflicts**
   - do not silently choose among conflicting authorities.
6. **Declare implementation intent**
   - state which authorities the proposed change implements and which it must not redefine.
7. **Define validation**
   - identify tests, fixtures, receipts, conformance checks, or review evidence required after implementation.

The preflight SHOULD be recorded in a task, branch note, PR body, machine-readable receipt, or equivalent durable artifact for nontrivial work.

## 7. Postflight and conformance

Before a behavioral change is considered complete, the contributor or agent SHOULD verify:

- each declared public contract still has the same interoperable meaning unless a deliberate public change was approved;
- protected implementation requirements were satisfied or explicitly superseded;
- affected schemas and fixtures pass;
- disclosure posture remains valid;
- new protected mechanisms were not accidentally introduced into public artifacts;
- new public semantics were not left undocumented only in private implementation;
- the requirements graph is updated when authority relationships changed.

Where practical, the result SHOULD produce an authority-closure receipt containing:

- task/change identifier;
- public authority identifiers;
- protected authority identifiers;
- affected implementation surfaces;
- validation references;
- closure status;
- unresolved conflicts, if any.

## 8. Agent access modes

### 8.1 Public-only agents

A public-only agent MAY use public Rosetta authorities and the disclosure-safe authority bridge.

If a protected authority is indicated, it MUST NOT fabricate its contents.

It MAY continue work that is fully determined by the public contract. It SHOULD flag implementation-policy questions that require protected authority rather than guessing.

### 8.2 Authorized internal engineering agents

While the project is operated by a small trusted human-directed team, internal engineering agents MAY be granted access to both public and protected repositories.

They SHOULD use that access to shorten authority resolution, not to widen disclosure.

They MUST still respect publication posture when writing back to public repositories, external correspondence, public issues, PRs, or other externally visible surfaces.

### 8.3 External-publication and outreach agents

External-publication agents MUST operate from the public projection unless a narrower explicit authorization permits disclosure of protected material.

Protected access, when available for internal relevance detection, MUST NOT be treated as permission to disclose.

## 9. Skills and automation requirements

Entif/Rosetta-specific Skills and automations SHOULD include an authority preflight appropriate to their write surface.

A project-specific Skill that can create or materially modify any of the following SHOULD resolve applicable governance before acting:

- Rosetta schemas, Packs, Profiles, RFCs, or issues;
- implementation code whose behavior is constrained by protected authority;
- external research outreach or correspondence;
- public GitHub issues, PRs, comments, or releases;
- private requirement artifacts;
- cross-repository mappings;
- conformance or validation rules.

Project-specific skill-creation tooling SHOULD reject or repair a proposed Skill that bypasses required governance preflight, disclosure classification, authority closure, or postflight validation.

## 10. Repository agent guidance

Repository-root agent instructions SHOULD point directly to this doctrine and the public/private boundary doctrine.

Internal/private repository agent instructions SHOULD additionally point to the canonical protected requirements spine and inverse authority map.

The intent is progressive disclosure:

- a coding agent sees the mandatory entrypoint immediately;
- detailed governance loads only when relevant;
- protected requirements load only when the task crosses a protected authority edge.

## 11. Pre-commit and CI enforcement

Automated governance checks SHOULD be deterministic, inexpensive, and based on failure modes that can be detected reliably.

The initial rule set SHOULD prefer mechanical invariants such as:

- required governance files exist;
- public artifacts do not contain direct protected-repository links;
- protected authority references use the canonical `IPR-####` identifier format;
- the public authority bridge contains no protected implementation details;
- required project agent guidance points to the current governance doctrine.

New checks SHOULD be added primarily when:

1. a real mistake occurs;
2. the failure mode can be recognized deterministically with acceptable false-positive risk;
3. a regression fixture can describe the mistake; and
4. the rule's remediation can be explained clearly.

A new rule SHOULD include:

- stable rule identifier;
- problem statement;
- detection boundary;
- expected remediation;
- positive and negative fixtures where practical;
- documentation update;
- version/history note if it changes existing repository expectations.

Automated checks SHOULD NOT pretend to determine patentability, strategic value, semantic correctness, or disclosure safety from arbitrary prose when those judgments require human or higher-level review.

## 12. Requirements-graph evolution

The requirements graph SHOULD grow through ordinary project work.

When a new protected requirement is created:

1. assign an `IPR-####` identifier;
2. record its public-contract relationships privately;
3. add a disclosure-safe public bridge edge if the public implementation surface needs to know protected authority exists;
4. link implementation surfaces and validation artifacts privately;
5. update the graph when the protected requirement is superseded, split, published, deprecated, or withdrawn.

When a new public contract is created:

1. identify whether protected implementation authority already exists;
2. add bridge edges where appropriate;
3. ensure the public contract is independently meaningful and conformable;
4. ensure private implementation does not become the hidden semantic definition.

## 13. Conflict policy

When authorities disagree, agents MUST NOT silently reconcile them.

The agent SHOULD emit a conflict record containing:

- the conflicting authorities;
- the affected public contract or implementation surface;
- the incompatible requirements;
- whether execution can safely continue on an unaffected subset;
- the decision required from the controlling authority.

A historical source MAY explain why a conflict exists. It does not resolve the conflict merely by being older, newer, longer, or more detailed.

## 14. Relationship to the Public Commons / Private Operation boundary

The two doctrines answer different questions:

- `PUBLIC_COMMONS_AND_PRIVATE_OPERATION_BOUNDARY.md`: **May this material be public, private, split, or screened before publication?**
- this document: **After separation, how do contributors and agents find the complete governing requirements without semantic or implementation drift?**

Both MUST be applied to material changes that cross the public/private boundary.

## 15. Constitutional summary

> **Public Rosetta defines interoperable meaning. Protected Entif authority may define internal operational behavior. Internal engineering closes over both before implementation. Private behavior may optimize the public contract, but may not secretly redefine it. Requirements relationships are recorded as a graph, public projections expose only opaque protected identifiers, and deterministic governance checks grow from real failure modes.**
