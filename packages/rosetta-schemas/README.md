# rosetta-schemas

Catalog entries distinguish core descent from operational ownership and exposure.
See [schema authority and descent](docs/schema-authority-map.md#core-descent).
New supported kinds need an explicit classification in `src/lib/core-descent.ts`;
catalog presence alone grants neither core status nor runtime authority.

## Purpose

Provides lightweight payload validation and conformance bundle emission for current tile kinds.

## Semantic authority

[`../../docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md`](../../docs/RFCs/Rosetta%20v3.0.0%20Core%20Spine%20Specification.md) remains the semantic authority for Rosetta core terms. This package is an implementation registry and bootstrap validator, not a replacement Terminology Lock.

Schema registry presence establishes implementation ownership/visibility only. Non-core `rosetta.*` IDs require an explicit disposition in [`../../docs/governance/genesis/SEMANTIC_AUDIT.md`](../../docs/governance/genesis/SEMANTIC_AUDIT.md), and Entif/source/Guard/adapter/skill schemas remain application or accepted-extension contracts according to their owning authorities.

## Working Today

- validates required fields for supported tile kinds
- emits SHACL-like Turtle text describing those required fields
- emits conformance bundles summarizing conforming versus violating tiles
- exposes the internal Agentic Messaging schema registry and mailroom validation mapping
- exports a package-local schema catalog for maintainer and inspection workflows

## Schema Catalog

- Machine-readable source: `src/lib/schema-catalog.ts`
- Human authority map: `docs/schema-authority-map.md`
- Main exports:
  - `ROSETTA_SCHEMA_CATALOG`
  - `listSchemaCatalogEntries()`
  - `getSchemaCatalogEntry(schemaId)`
  - `validateSchemaCatalogCoverage()`
- Each catalog entry records `schemaId`, family, authority tier, exposure status, owner package, validator or entrypoint, tests, docs, source issues and PRs, RFC/PRD anchors, consumer packages, boundary kind, and known gaps.

Authority tiers keep ownership visible:

- `core-spine`
- `governance-admission`
- `source-ingest`
- `memory-context-cache`
- `projection-product-ops`

Exposure statuses prevent schema existence from masquerading as runtime support:

- `package-internal`
- `downstream-contract`
- `fixture-only`
- `reserved-interface`
- `api-visible`
- `cli-visible`
- `demo-visible`
- `deprecated`

When adding a schema family, add or update a catalog entry in the same change. Non-reserved entries must cite at least one test and doc reference, and the test suite checks that every supported tile-kind validator plus every registered Agentic Messaging profile appears in the catalog.

## Agentic Messaging Registry

- Implementation registry: `packages/rosetta-schemas/src/lib/rosetta-schemas.ts`
- Envelope schema: `entif.agentic-messaging.envelope.v1`
- Message-family schema IDs:
  - `TASK_RECEIPT`
  - `INCIDENT_ENVELOPE`
  - `WORK_UNIT_UPDATE`
  - `ARTIFACT_PUBLISH`
  - `HEALTH_REPORT`
  - `ACTION_REQUEST`
  - `ACTION_DECISION`
  - `APPROVAL_REQUEST`
  - `APPROVAL_RESPONSE`
- `TASK_RECEIPT` and `INCIDENT_ENVELOPE` are internal transport-family labels. A payload has canonical Rosetta **Receipt** or **Incident** semantics only when the owning contract explicitly maps and validates it against those v3 artifacts.
- `domain_ref` is treated as a nested component owned by issue `#711`; the registry consumes that shape rather than redefining it.
- The mailroom mapping is deterministic: `msg_type -> schema_id -> validation result -> quarantine reason`.
- First-wave mailroom size policy:
  - `AGENTIC_MESSAGE_SIZE_POLICY.defaultMaxMessageBytes` is `1_048_576` bytes.
  - `evaluateAgenticMessageSizePolicy()` runs at `size-enforce`, before schema and plane enforcement.
  - Oversized messages quarantine with `MESSAGE_SIZE_EXCEEDED` and `MESSAGE_SIZE_LIMIT_EXCEEDED` evidence.
  - `ARTIFACT_PUBLISH` stays reference-only; inline artifact body fields quarantine as a size/payload-shape violation.
- Migration posture:
  - additive changes stay minor-compatible
  - breaking changes require a new schema ID / major lane
  - readers should tolerate the current and previous major during rollout
- Scope boundary:
  - this registry covers internal Agentic Messaging only
  - issue `#1047` remains the external peer-agent interop lane
  - issues `#706`, `#1029`, `#718`, and `#946` are downstream consumers of this registry surface

## SkillCard Schema

- Schema kind: `skill.card`
- Validator: `validateSkillCard()`
- First-wave Tier 0 budget: `SKILL_CARD_MAX_BYTES` is `2_048` bytes.
- Required broker-facing fields: `skill_id`, `name`, `one_line`, `triggers`, `io`, `risk_class`, `tool_scopes`, `version`, `provenance`, and manifest-backed `subject`.
- `subject.pack_id` must point at a pack manifest CID (`cidv1-sha256-<64 hex>`), with `doc_id` and `version`; `export_ref` and `profile_ref` may identify the broker-visible surface.
- Tier 0 may carry bounded risk, provenance, certification, trigger, and tool-family hints. It must not carry approval handles, capability selectors, IAM decision refs, Guard tokens, runtime grants, or wildcard tool scopes.
- Runtime materialization, broker ranking, certification flow, lineage/rollback, and Guard authorization remain owned by downstream skill-library issues.

## Adapter Capability Manifest

- Schema kind: `adapter.capability_manifest`
- Schema version: `adapter-capability-manifest-v1`
- Validator: `validateAdapterCapabilityManifest()`
- Required fields include capability identity/version, verb and operation family, privilege tier, effect class, posture flags, idempotency, replay-safety, Guard requirements, request/response schema refs, fixture refs, and host-hint treatment.
- First-wave privilege tiers: `read-only`, `write-local`, `write-external`, `operator-sensitive`, and `admin`.
- First-wave effect classes: `pure-transform`, `source-read`, `local-write`, `external-write`, and `payment`.
- Side-effecting, destructive, sandbox-unsafe, payment-sensitive, local-write, external-write, or payment capabilities must declare Guard decision and receipt requirements plus at least one policy ref.
- Imported host/runtime hints are recorded as `advisory-only`, `normalized`, or `rejected-inconsistent`; host annotations do not become Rosetta policy authority unless explicitly normalized.
- Startup exposure profiles, runtime modes, paid execution lifecycle, and bridge transport behavior remain downstream consumer issues.

## Plane Enforcement

- Issue `#706` adds the anti-spoofing admission contract on top of the `#220` registry surface.
- Data-plane families remain non-executable:
  - executor disposition is `data-plane-no-side-effects`
  - imperative-looking text does not promote a data-plane payload into privileged execution
  - hidden capability selectors, `iam.decision` refs, approval handles, or equivalent control bindings are quarantined as spoof attempts
- Control-plane admission reuses the `domain_ref` comparison from `#711` rather than inventing a second domain-boundary rule.
- Decision semantics stay delegated:
  - `#630` owns the shared `iam.decision` artifact contract
  - `#1029` owns the Guard decision request/validation handshake
  - this package only decides whether a message is structurally eligible for data-plane routing, control-plane review, or quarantine

## Semantic governance

Before adding a schema family:

1. search the v3 Terminology Lock and accepted extensions;
2. classify the schema as core reuse, accepted extension, application contract, projection/derived view, external reference, or provisional semantic extension;
3. update `schema-catalog.ts`, the authority map, tests, and [`SEMANTIC_AUDIT.md`](../../docs/governance/genesis/SEMANTIC_AUDIT.md) in the same change;
4. run `pnpm run governance:semantic` and the package tests.

Do not place a schema in the `rosetta.*` namespace merely because the package owns its validator.

## Evaluation Profiles

`salience.evaluation.v1` is a Pack-defined Profile over existing `rosetta.evaluation`; it does not add a Core kind. It keeps Impact, Exigency, and Novelty distinct, attaches scope, time, evidence, receipt, provenance, and supersession references, and permits inline scalar/ordinal values or references to richer schema-declared values (including intervals, vectors, distributions, and categories). Profile validation rejects truth, execution, activation, and authorization fields. Its shared evaluation scope, valid time, receipt references, and provenance apply to each assessment while dimension-specific evidence/provenance references supplement them. See `packs/schema-pack-evaluation-profiles/`.

`counterfactual.evaluation.v1` composes historical decision/StrategyEpisode,
experiment, replay/run/tape, budget, comparator/verifier, observation and receipt
references. It preserves the declared historical input frontier and distinguishes
comparison disposition from Core verdicts. Quality, exception and each resource
measurement remain separately referenceable; empty measurement arrays mean absent
measurements, never zero cost or proved equivalence. Comparable dispositions need
replay, comparator, verifier and quality evidence. Unknown/non-replayable history
remains expressible. Sandbox mode requires a sandbox reference; performed live
effects and production-activation fields fail conformance. Actual isolation,
evidence resolution/authentication and historical frontier completeness remain
runtime/authority responsibilities. See the public Pack conformance notes.

## Fixture Status

- executable
- lightweight by design

## Not Yet

- full SHACL execution
- RDF graph materialization
- standards-grade ontology validation

## Roadmap

- replace or augment the current required-field validator with real SHACL/RDF tooling when the MVP needs it
