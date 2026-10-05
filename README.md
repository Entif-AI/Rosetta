# Rosetta

**Rosetta is Entif AI's open semantic and provenance constitution for meaning that has to survive change.**

Models change. Tools change. Schemas change. Organizations disagree. A source is corrected after a summary has already been reused. A system translates the same event through text, graphs, APIs, memories, plans, and actions. Rosetta exists so those transformations do not quietly erase the distinctions that determine what a result actually means, where it came from, or what authority it carries.

The governing image is the Rosetta Stone, not a universal language. The Stone mattered because materially corresponding content survived across different scripts. It did not make those scripts identical. Rosetta applies the same idea to machine and institutional cognition: **plural representations, explicit correspondence, preserved provenance, and no silent promotion of one representation into another kind of authority.**

If Babel is the problem, the goal is not to abolish the tongues. It is to make Babel interoperable.

This repository is the constitutional monorepo for the Rosetta provenance kernel, the Source Substrate, the Ingress Refinery, the canonical corpus cache, conformance surfaces, and read-only projection adapters.

Think of it like a shipyard, not a showroom. The hull, engine mounts, and navigation rules matter first. Pretty passenger cabins come later.

## The constitutional job

Rosetta's Core is intentionally narrower than the larger Entif cognitive architecture. Its job is to preserve interoperable meaning and the evidence needed to reason about change.

That means keeping distinctions such as these explicit:

- **source is not interpretation;**
- **interpretation is not evaluation;**
- **evaluation is not permission;**
- **a plan is not an effect;**
- **an effect request is not evidence that the world changed;**
- **repetition is not independent corroboration;**
- **confidence is not authority;**
- **a receipt records an event or relationship, not metaphysical truth.**

Rosetta provides stable identity, provenance, uncertainty, ambiguity, rights, lineage, receipts, governed transformation, and extension points. Packs and Profiles can add domain structure or map external standards without forcing every useful concept into Core.

The protocol should let two systems say, in machine-readable form, not only "we agree," but also "we are talking about the same source through different interpretations," "this mapping is lossy," "these claims remain in conflict," or "this derived artifact lost a property the consumer needs."

## Rosetta inside the Unified Cognitive Architecture

Rosetta is the semantic narrow waist beneath a larger set of research programs. It does **not** become their proprietary brain merely because they use Rosetta-shaped information.

- **Bilqis** investigates whether explicit developmental semantics can make relational and compositional structure cheaper to learn.
- **GNOSIS** treats cognition as dependency-aware reusable computation.
- **Akasha / Forget Me Not** governs persistent state, inheritance, correction, revalidation, and rollback.
- **Codito** studies the metacognitive and orchestration connective tissue that composes those capabilities into task-local cognition.
- **OMoC** explores capability selection among deterministic operators, bounded learned functions, specialists, general models, tools, and humans.
- **Commitment, Guard, and Tripwire** separate recommendation, commitment, admission to effect, and independent interruption.
- **Swarm Gnosis** extends rights-aware reuse and correction across independently bounded participants.
- **IndraNet** provides a relational fabric among those participants, called **Jewels** at the UCA layer; its current reference work specializes that fabric for qualified physical context, sensing, simulation, rendering, and actuation.

`Jewel` is a UCA participant-level term, **not a Rosetta Core kind**. Rosetta may represent artifacts exchanged by a Jewel without requiring Core to absorb the architecture that produced them.

That boundary matters. Public Rosetta defines interoperable meaning. Private or project-specific implementations may optimize, specialize, route, learn, or outperform the public contract, but they may not silently redefine it.

## Governing orientation

- [`docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md`](docs/RFCs/Rosetta%20v3.0.0%20Core%20Spine%20Specification.md) is the paramount internal authority for Rosetta/Entif meaning, nomenclature, identity, provenance, execution semantics, interoperability, and conformance until explicitly superseded.
- [`docs/governance/Genesis.md`](docs/governance/Genesis.md) defines the lean cross-project operating doctrine.
- [`docs/governance/genesis/SEMANTIC_ALIGNMENT.md`](docs/governance/genesis/SEMANTIC_ALIGNMENT.md) defines the terminology-inheritance and reconciliation process.
- [`docs/governance/genesis/SEMANTIC_AUDIT.md`](docs/governance/genesis/SEMANTIC_AUDIT.md) records current schema/document mappings and unresolved semantic debt.
- [`docs/governance/PUBLIC_COMMONS_AND_PRIVATE_OPERATION_BOUNDARY.md`](docs/governance/PUBLIC_COMMONS_AND_PRIVATE_OPERATION_BOUNDARY.md) separates the public interoperable contract from implementation-specific operational advantage.
- [`docs/governance/AUTHORITY_CLOSURE_AND_REQUIREMENTS_TRACEABILITY.md`](docs/governance/AUTHORITY_CLOSURE_AND_REQUIREMENTS_TRACEABILITY.md) defines how public and protected requirements remain coherent without collapsing their disclosure boundary.

Before introducing a durable term, schema, artifact family, state, relationship, or identifier, search those authorities and adopted external standards first. Repetition in code or prose does not grant semantic authority.

## Public commons, not mandatory implementation

Rosetta's public surface should be open enough for independent implementers to construct, interpret, validate, exchange, and challenge Rosetta-shaped artifacts without needing Entif's private machinery.

That normally includes semantic and data models, provenance and uncertainty structures, schemas and serializations, compatibility and migration rules, conformance profiles and fixtures, interoperability mappings, lifecycle/failure semantics, and the public governance constraints necessary for ecosystem trust.

It does **not** require publication of every scoring formula, routing algorithm, model-selection strategy, optimization heuristic, private dataset, deployment topology, or adaptive-learning method used by one operator.

> **Open the language. Protect the cognition.**

## What Exists Today

This bootstrap is intentionally headless and receipts-first:

- Rosetta tiles are canonicalized, hashed, and given stable content IDs.
- RRP receipts can be created, signed, bundled, and verified.
- Source systems, records, manifestations, packages, corrections, and trust matrices are modeled as first-class artifacts.
- The refinery turns fixture-backed source artifacts plus raw text into a canonical artifact and linked provenance receipts.
- The canonical cache clusters artifacts across byte, manifestation, record-family, and conceptual lanes without auto-merging the broader matches.
- OB1, Prism, and Mission Control are projected as read-only sidecar, shadow, and operator-shell views.

## What Does Not Exist Yet

This is not yet a production ingestion platform:

- No live source adapters are fetching from DataCite, Crossref, Zenodo, or other upstream systems yet.
- No durable database-backed cache exists yet.
- No evidence-derived trust scoring engine exists yet; the trust matrix is currently a formal model plus bootstrap fixture values.
- No full SHACL or RDF execution engine is running yet; conformance is currently a lightweight required-field validator plus emitted SHACL-like shapes.
- No real OB1 or Prism runtime integration exists yet beyond projection contracts.

The honest label is: a working provenance-kernel prototype with source-aware bootstrap fixtures.

## Workspace Commands

```bash
pnpm install --no-frozen-lockfile
pnpm run sync
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
pnpm run verify
pnpm run governance:semantic
pnpm run governance:semantic:test
pnpm run demo
pnpm run api
```

## Starting A New Agent Session

New Codex or agent sessions should start here:

1. Read this `README.md`.
2. Read `docs/handoffs/CURRENT_HANDOFF.md`.
3. Check branch state with `git status --short --branch`.
4. If continuing merged work, sync `main` with `git fetch origin` and `git pull --ff-only origin main`.
5. Read the active GitHub issue/PR named in the handoff.
6. Run the narrowest validation that matches the changed surface.

Every stable branch should update `docs/handoffs/CURRENT_HANDOFF.md` before its final push. If documentation changed, also run `pnpm run docs:intake` so the intake ledger stays current.

## Handoff And Branch Protocol

- Work on focused `codex/` feature branches.
- Compartmentalize unrelated work into separate branches and separate PRs. Do not bundle independent fixes, planning docs, feature work, and cleanup unless one change is required to validate the other.
- Treat each stable branch as a handoff boundary.
- Commit only coherent, validated slices.
- Follow Conventional Commits for every commit. Use scopes when they clarify ownership, for example `docs(handoff): ...`, `test(doc-intake): ...`, or `feat(source-substrate): ...`.
- Shape commit history for future semantic versioning and changelog automation. `nx release` is not configured yet, but commit types should remain compatible with that path.
- Use red/green TDD for code changes: add or update failing tests first, implement the smallest change that makes them pass, and keep those tests in the normal validation path.
- Do not add or refine functionality without tests covering the behavior and important failure/resilience cases.
- Keep `docs/handoffs/CURRENT_HANDOFF.md` current enough that a new account or machine can resume without rereading the whole docs corpus.
- Record published GitHub issue URLs and state changes in `docs/intake/github-issue-ledger.json`.
- Use local issue drafts under `docs/intake/issue-drafts/` as the review gate before creating remote GitHub issues.
- Do not perform large-scale Rosetta-native semantic corpus ingest until the Ingress Refinery and canonical corpus cache are ready.
- Do perform docs-intelligence extraction for planning now: read the repo's source documents for intent, requirements, architecture, technology choices, priorities, contradictions, and GitHub issue candidates. This planning lane is not blocked by runtime ingestion readiness and must not be routed through Rosetta-native tile/tapestry conversion unless a specific issue asks for that product behavior.
- Prefer targeted validation during development; use `pnpm run verify` when a branch changes shared contracts or before claiming a broad green state.
- Before adding a durable semantic term or schema family, run `pnpm run governance:semantic` and update the governing crosswalk in the same change.

## Repository Guide

- `docs/ARCHITECTURE.md`
  Brief layer map, current execution model, and explicit "real vs fixture-backed vs not yet" status.
- `docs/governance/Genesis.md`
  Lean cross-project operating doctrine.
- `docs/governance/genesis/README.md`
  Companion index for semantic alignment, engineering, security, assurance, delivery, interface, publication, and research practice.
- `docs/governance/genesis/SEMANTIC_AUDIT.md`
  Current semantic/schema crosswalk and duplication-debt ledger.
- `docs/governance/AUTHORITY_STACK.md`
  Scoped semantic, operating, and bootstrap execution authority.
- `docs/governance/REPO_SHAPE_AND_CONSTRAINTS.md`
  Monorepo structure and boundaries.
- `docs/governance/DONOR_FIT_MAP.md`
  What was seeded from donor patterns and what was not.
- `docs/governance/SERVICE_INVENTORY.md`
  Current services, packages, and roles.
- `docs/governance/UPSTREAM_AND_BACKUP_PLAN.md`
  Upstream authority posture and backup expectations.
- `docs/backlog/BOOTSTRAP_EXECUTION_TRACK.md`
  Current bootstrap delivery sequence and proof path.
- `docs/packs/PACK_SUITE_INDEX.md`
  Pack inventory.
- `docs/handoffs/2026-04-13-bootstrap-handoff.md`
  Historical bootstrap handoff record.
- `docs/handoffs/CURRENT_HANDOFF.md`
  Active handoff record for future Codex and agent sessions.
- `docs/intake/README.md`
  Documentation intake workflow, local issue drafts, and GitHub issue ledger policy.
- `docs/intake/DOCS_INTELLIGENCE_WORKFLOW.md`
  Requirements-mining workflow for turning repository docs into extracted knowledge, roadmap maps, GitHub issues, and project-board coordination.

## Package Map

- `packages/rosetta-canon`
  Deterministic JSON and text normalization helpers.
- `packages/rosetta-cid`
  Content hashing and CID string helpers.
- `packages/rosetta-core`
  Tile envelope construction and integrity verification.
- `packages/rosetta-schemas`
  Lightweight payload validation and conformance bundle emission.
- `packages/rosetta-receipts`
  Receipt creation, signing, bundle construction, and verification.
- `packages/rosetta-guard`
  Minimal parse-only policy evaluator.
- `packages/rosetta-tapestry`
  Receipt-bundle tapestry compilation.
- `packages/rosetta-store`
  In-memory tile store with rights checks.
- `packages/source-substrate`
  Source-system, record, manifestation, package, correction, and trust-matrix models.
- `packages/source-registry`
  Bootstrap registry/profile fixtures for Tier 0 and Tier 1 sources.
- `packages/ingress-refinery`
  Fixture-backed parse-only refinement from source artifacts plus raw text into canonical artifacts and receipts.
- `packages/canonical-cache`
  In-memory clustering and lifecycle event retention.
- `packages/projection-adapters`
  Read-only OB1, Prism, and Mission Control projection contracts.

Each package now has its own `README.md` describing purpose, current functionality, roadmap, and known limits.

## Current Apps

- `apps/rosetta-cli`
  Emits a bootstrap snapshot and verification report.
- `apps/rosetta-api`
  Serves `/health`, `/registry`, and `/demo` for the current bootstrap slice.
- `apps/rosetta-operator`
  Placeholder operator-shell surface, not the constitutional center.

## Commit Protocol

- Local commits follow Conventional Commits.
- Commit-message enforcement is wired through Husky and commitlint.
- `nx release` is not configured yet, but the commit history is being shaped so changelog/release automation can land cleanly later.
