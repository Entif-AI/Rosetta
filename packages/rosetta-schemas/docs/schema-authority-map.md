# rosetta-schemas Schema Authority Map

`packages/rosetta-schemas/src/lib/schema-catalog.ts` is the package-local machine-readable catalog for schema families, validators, boundary contracts, consumers, tests, docs, and known gaps.

Legacy IAM/Guard entries carry versioned `compatibilityMapping` metadata from
`AUTHZ_COMPATIBILITY_MAPPINGS`. The [#1748 migration contract](../../rosetta-guard/docs/authz-compatibility-v1.md)
distinguishes native projections, compatibility decisions, historical-only inputs,
unsupported mappings and insufficient evidence. Catalog presence and compatibility
markers do not authorize execution or supply an authority root.

Its `authorityTier` field describes package ownership and admission lanes. It does not supersede the Rosetta v3 Terminology Lock or grant Rosetta core status.

## Core descent

`coreDescent` is independent of `authorityTier` and `exposureStatus`. The explicit
identity map in `src/lib/core-descent.ts` follows the existing semantic audit:

- `core-primitive`: one of the seven implemented v3 concepts listed in the audit.
- `core-tile-profile`: a named Pack-defined specialization of an existing Core kind, including the Salience and Counterfactual Evaluation Profiles and the Promotion Observation Profile.
- `pack-defined-schema`: an explicitly present Source Substrate starter shape.
- `governed-extension`: a namespaced contract governed outside Core, including
  source-substrate extensions and the [Authority Envelope Profile](authority-envelope-v1.md).
- `implementation-local`: application metadata, transport contracts or provisional
  local validation artifacts; no claim of v3 core status.
- `derived-projection`: an implementation's derived digest or conformance summary.
- `external-contract-ref`: a boundary whose semantics stay with its existing owner.

`descentAuthority` names the source for the classification. `relatedCoreKinds`
records semantic relationships for review, **not** an inheritance/substitutability
claim. In particular a source evaluation receipt does not automatically validate
as an RRP receipt, and a domain trust matrix is not interchangeable with the
canonical matrix merely because it has axes. An empty list makes no specific
primitive mapping claim; it does not mean authority is missing.

New supported tile kinds require an explicit identity registration; prefixes and
ownership tiers cannot supply a default. Registered Agentic Messaging profiles
remain application contracts regardless of labels such as `TASK_RECEIPT`.
Coverage validation rejects missing/mismatched descent, authority or related-kind
metadata, duplicate identities and missing source issues. The API/CLI catalog
automatically exposes this metadata without changing runtime support or grants.

`skill.card` now belongs to `governance-admission`, consistent with its broker
metadata boundary. This fixes misleading ownership metadata without changing its
payload, validator, authority restrictions or downstream exposure.

## Semantic Dispositions

Every schema family should resolve to one of the dispositions defined in [`../../../docs/governance/genesis/SEMANTIC_AUDIT.md`](../../../docs/governance/genesis/SEMANTIC_AUDIT.md):

- core reuse;
- accepted extension;
- application contract;
- projection or derived view;
- external reference;
- historical precursor;
- provisional semantic extension;
- retired alias.

Current non-core `rosetta.*` IDs remain explicitly listed as semantic debt in the audit until an accepted authority resolves their namespace and relationship to v3.

## Authority Tiers

- `core-spine`: Rosetta run/action/tool/observation/evaluation/receipt and conformance mechanics.
- `governance-admission`: Guard, domain, IAM reference, mailroom, and execution-admission boundaries.
- `source-ingest`: source-substrate and ingress-refinery artifacts.
- `memory-context-cache`: context, intake, digest, composition, and failure-learning artifacts.
- `projection-product-ops`: projection, tapestry, translation, and operator-facing artifacts.

## Exposure Statuses

- `package-internal`: maintained inside `rosetta-schemas` and not yet promised as an app surface.
- `downstream-contract`: consumed by Guard, mailroom, API, CLI, or other package boundaries.
- `fixture-only`: executable over bootstrap fixtures, not live upstream acquisition.
- `reserved-interface`: named to keep ownership clear, but not implemented or operational here.
- `api-visible`, `cli-visible`, and `demo-visible`: reserved for inspection surfaces once app layers expose the catalog.
- `deprecated`: retained for historical compatibility only.

## Boundary Rules

- `domain_ref` is consumed as a nested component and compared structurally here; broader domain-policy ownership stays with its source issue.
- `iam.decision` references are cataloged as a reserved external contract, not redefined.
- Guard request/validation and mailroom runtime custody are downstream consumer boundaries.
- Agentic Messaging execution admission only classifies structural eligibility for routing, review, or quarantine. It does not execute privileged actions.
- Agentic Messaging size policy is the first mailroom validation stage. It defines one 1 MiB first-wave ceiling and requires artifact references or future chunking instead of oversized inline payloads.
- `skill.card` is the broker-facing Tier 0 skill metadata contract. It stays bounded, manifest-backed, and data-plane only; full playbooks, broker ranking, certification, runtime materialization, lineage, and Guard authorization remain downstream.
- `adapter.capability_manifest` is the shared capability privilege/effect vocabulary. It describes posture and Guard-linked requirements for downstream runtime, MCP, startup exposure, payment, and bridge lanes without granting authority by itself.

## Maintenance Rule

When adding a schema family or validator, update `schema-catalog.ts` with source issue, tests, docs, RFC/PRD anchors, consumers, exposure status, and known gaps. The catalog tests intentionally fail when supported tile kinds or registered Agentic Messaging profiles are invisible.

Also update `SEMANTIC_AUDIT.md` when the schema adds a new family, uses the `rosetta.*` namespace outside the v3 core list, or changes the mapping between an application contract and a canonical Rosetta artifact.

The #1179 audit classifies generated SHACL as `derived-projection` and ingress jobs
as `lifecycle-state`. Source packages compose membership related to Frame semantics;
source receipt records and trust axes reference Core meaning without claiming
structural equivalence. The named RRP promotion Profile is `core-tile-profile` of
Observation. `CORE_DESCENT_AUDIT.json` contains the generated risk/remediation record.

## Trace derived Profile

`work.lifecycle.v1` (#1509) is an application-level bounded-work contract; `work.lifecycle-state.v1` is its separate derived current-state view. See [work-lifecycle-v1.md](work-lifecycle-v1.md). Neither introduces a Core kind or grants operational authority.

`engineering.lifecycle-source.v1` (#1726) owns bounded source/reference admission for the engineering specialization of #1509. See [engineering-lifecycle-v1.md](engineering-lifecycle-v1.md). Normalization and graph projection retain their existing owners.

`engineering.run-completion.v1` (#1727) owns public source-linked terminal evidence, explicit unknown telemetry and additive correction history. See [engineering-completion-v1.md](engineering-completion-v1.md).

`trace.normalization.v1` is the public source-ingest derived Profile owned by #1666. See [trace-normalization-v1.md](trace-normalization-v1.md). It has explicit derived-projection descent and adds no Core kind.

`trace.projection.v1` owns provider-neutral graph exchange/identity/provenance for #1667 and the #1734/#1735 successor. See [trace-projection-v1.md](trace-projection-v1.md). FalkorDB is the active fixture-backed V0 adapter; Neo4j remains historical/reference tooling. Both have explicit derived-projection descent. #1738 reconciles the forward path without changing Profile identity or semantics.

`trace-kin-v1` owns public observable metric/result semantics for #1669, independently re-proven on FalkorDB by #1736. See [trace-kinematics-v1.md](trace-kinematics-v1.md). It has derived-projection descent and does not authorize hidden-memory interpretations or protected scoring.

`trace.graphiti-selection.v1` and `trace.graphiti-projection.v1` retain the #1668 admission/support/rights boundary. #1737 proves the unchanged first-party Graphiti/Falkor successor as experimental derived interpretation. The accepted V0 compatibility split uses operational FalkorDB 6.0.1 and semantic FalkorDB 4.20.7; neither database nor donor becomes semantic authority. G15/#361/#1222 promotion and SSPL public-service review remain separate.
