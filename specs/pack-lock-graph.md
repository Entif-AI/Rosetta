---
id: rosetta:pack-lock-graph-v1
kind: behavior
status: in-development
owner: Rosetta Pack/schema maintainers
principles: [specs/principles.md]
authorities:
  - docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md
---
# Pack dependency closure and content-addressed lock graph (proposed v1)

**Semantic owner:** [#1559](https://github.com/Entif-AI/Rosetta/issues/1559). **Executable child:** [#1790](https://github.com/Entif-AI/Rosetta/issues/1790). This draft is a **specification review packet**, not accepted Core/Pack authority or evidence that a resolver already exists. It defines an independently reproducible first slice; implementation begins only after the source owner accepts the consequential rules below.

The controlling Core authority is pinned in the approved SpecOps authority header. The narrower Pack filesystem requirements are sourced from [`ROCK-3111-C`](../docs/RFCs/ROCK-3111-C-RRP-Pack-Filesystem-Contract-v0.2.0.md), sections 4 and 8. That reference governs Pack identity and validation within its domain; the header's approved-source allowlist does not alter its authority.

## Intended outcome

Given a bounded, immutable **catalog snapshot** of Pack versions, a request for root Packs/Profiles, and an explicit Rosetta Core version, determine and describe every relevant compatible closure within the declared enumeration bound, or return a typed reason why closure is unavailable. An exact, content-addressed lock identifies one immutable solution, its constraints, and the input context. Pack installation, activation, entitlement, preference ranking, and execution authority are outside this contract.

The existing `rosetta-pack-id-v1` identity algorithm in `tools/pack-conformance/validate-packs.mjs` remains unchanged. Existing `pack.json` entrypoint/export, `compatible_core`, `depends_on`, Pack ID, DocID, self-reference, and cycle requirements remain governed by ROCK-3111-C and their established validator. A valid manifest is necessary evidence of package integrity. It cannot, alone, prove multi-version closure.

## Named first-wave Profile and identities

Proposed namespaced public schema/Profile family: `pack.resolution-request.v1`, `pack.resolution-result.v1`, and `pack.lock-graph.v1`. These are composed, governed Pack-facing records and **not** `rosetta.*` Core Tile kinds. If an implementation wraps them in a Rosetta Tile, its Core kind and lineage must remain independently valid.

**Request** carries `profile` and `version`, a stable request/subject ID, required root Pack DocIDs and version constraints, optional named Profile requirements, the exact Core version/constraint, declared allowed catalog-snapshot ID, resolver profile/version, known exclusions/revocations, optional dependency posture, and relevant platform/runtime constraints when they affect semantics. Required roots are explicit. All ordering-independent sets are canonicalized before identification. An empty or ambiguous catalog selection is invalid request evidence, not permission to query an undeclared live registry.

**Catalog snapshot** has immutable ID/content digest, completeness posture and evidence, Pack-version entries keyed by `(doc_id, exact version, pack_id)`, each entry's manifest identity and `compatible_core`, `depends_on`, declared Profile IDs, and withdrawal/revocation status with provenance. A snapshot must declare whether it is complete **for the requested DocID/constraint perimeter**. A missing entry from an incomplete catalog never proves unsatisfiability. Multiple versions of the same DocID belong in a separate synthetic or versioned catalog, since the existing repository-local Pack graph correctly rejects duplicate DocIDs among installed roots.

**Result** carries `profile`, exact request/catalog/Core/resolver IDs, outcome disposition, reason/evidence codes and conflicting constraints, a bounded complete-or-incomplete enumeration indicator, zero or more independently valid solution references, any declared selection rule, validation/receipt references, and supersession/re-resolution links. Unknown and missing evidence remain explicit. A result may report valid solutions without choosing a privileged solution.

**Lock graph** describes **one** verified exact solution: root requests, all resolved nodes with DocID/version/`pack_id` and Profile identity when applicable, selected dependency edges with source and version constraint, allowed catalog snapshot digest, Core version, resolver Profile/version, and the canonicalization algorithm. Its ID is a SHA-256 digest of deterministically serialized input under a separately versioned `pack-lock-graph-v1` domain. Use the repository's RFC 8785-compatible shared canonical JSON library for lock bytes and `rosetta-cid` conventions for content identification. Retain the existing `rosetta-pack-id-v1` per-Pack ID unchanged, including its historical canonicalizer. Changing a constraint, selected edge, version, Pack CID, catalog snapshot or resolver profile changes the lock identity. A lock verifier consumes the recorded snapshot and checks every selected edge and digest; it never silently resolves again against today's registry.

## Deterministic closure contract (proposal)

The first reference resolver consumes only the supplied snapshot. It must choose a declared and versioned constraint language. Proposed initial supported subset: exact SemVer `X.Y.Z`/`=X.Y.Z`, caret `^X.Y.Z` (including the SemVer 0.x compatibility rules), and two-sided inclusive/exclusive comparator ranges `>=X.Y.Z <A.B.C`. Use the established SemVer range meanings and an explicit direct dependency if the implementation adopts the `semver` package. Pre-release admission, disjunctions, wildcards, unbounded comparators, and syntaxes outside this subset return a **typed `UNSUPPORTED_CONSTRAINT` refusal** and must not be interpreted as a permissive wildcard. This refusal is a validation failure, separately recorded from the seven resolution dispositions below.

For each required root, resolve a version satisfying its declared constraint and Core interval. Traverse every required `depends_on` edge, unify all constraints on the same Pack DocID, and preserve exact edge provenance. An optional dependency may be omitted if its absence leaves all required semantics and declared constraints satisfied; the omission and rationale must be recorded. Never drop a required edge to obtain a solution. Reject self-reference and cycles using the existing Pack graph authority; report those failures as invalid input/graph rather than quietly cutting a cycle.

Search deterministically by canonical DocID and version/CID order. Enumerate alternative valid closures up to a declared bound. A solution is unique only when the input catalog's relevant perimeter and enumeration are demonstrably complete. When the bound is reached without proof of unique closure, report plurality or `UNKNOWN` as evidence permits; never claim uniqueness. A baseline resolver may choose one of several valid locks only when the caller explicitly supplies a named, versioned deterministic tie-break rule and the result retains the other alternatives or a declared truncated-alternatives state. An undeclared preference must not be invented.

### Resolution dispositions

| Disposition | Required evidence | Forbidden promotion |
| --- | --- | --- |
| `RESOLVED_UNIQUE` | Exactly one complete solution under the entire admitted snapshot/constraint perimeter | A partial search or incomplete catalog cannot claim unique closure |
| `RESOLVED_MULTIPLE_VALID` | At least two distinct valid exact solutions, with count/enumeration completeness declared | Do not silently choose a preferred answer |
| `UNSATISFIABLE` | Exhaustive incompatibility proof with complete relevant catalog and non-revocation conflict reasons | Missing data is not unsatisfiable |
| `INCOMPLETE_CATALOG` | Required source/variant absent or completeness cannot be established for its requested perimeter | Cannot assume registry absence equals permanent absence |
| `REVOKED_DEPENDENCY` | A required closure is prevented by verified withdrawal/revocation of relevant Pack revisions | Merely old or missing status does not prove revocation |
| `CORE_INCOMPATIBLE` | Required Pack candidates have verified Core-version windows disjoint from requested Core | Does not redefine Pack or Core compatibility ranges |
| `UNKNOWN` | Insufficient, contradictory, unsupported-to-decide, or bounded-truncated evidence, with exact reasons | No invented lock or hidden tie-break |

When several distinct failure classes fit the same input, retain all proven reasons and choose `UNKNOWN` unless the selected specialized disposition is *fully established independently* of the other unresolved branch. The classifier must never turn catalog uncertainty into an apparently complete unsatisfiable or unique result. Validation refusal for malformed manifests, bad Pack identities, unsupported version syntax, and dependency cycles is recorded before claiming a resolution disposition.

## Conformance vectors required before implementation admission

| # | Scenario | Required observable proof |
| --- | --- | --- |
| 1 | Unique Pack closure | One exact solution; lock reproduces byte for byte from identical snapshot/request/profile |
| 2 | Two compatible Pack versions | `RESOLVED_MULTIPLE_VALID`; both exact solutions retained; explicit tie-break has a version |
| 3 | Conflicting transitive required ranges | `UNSATISFIABLE` only with verified catalog completeness |
| 4 | Required dependency revoked | `REVOKED_DEPENDENCY` with revocation evidence; never select withdrawn CID |
| 5 | Pack windows have no common requested Core version | `CORE_INCOMPATIBLE` with window refs |
| 6 | Optional dependency missing | Required closure still resolves; omission evidenced; required edge still enforced |
| 7 | Same request under two catalog snapshots | Different result/lock allowed; old lock remains verifiable against its original snapshot |
| 8 | Same human version with different content CID | Old lock rejects substituted Pack identity |
| 9 | Self or transitive cycle | Existing `validatePackGraph` rejects it; resolver does not silently prune |
| 10 | Missing required catalog segment | `INCOMPLETE_CATALOG`; never `UNSATISFIABLE` or invented selection |
| 11 | Unsupported version constraint | Exact typed refusal, no fallback wildcard |
| 12 | Tampered node, edge, constraint or snapshot digest | Lock verification fails and canonical lock ID changes |

Test the reference resolver and lock verifier with literal expected values through exported public APIs, including malformed and adversarial inputs. Include direct schema parsing/validation fixtures and independent replay of the same bytes. Preserve distinctions between specified, fixture-backed, demo-proven and production-observed maturity. Public fixture suites must be independently runnable without private ranking or operator code.

## Ownership and implementation boundary

- **Core**: existing Tile/CID/provenance meaning and accepted canonical JSON behavior; no new `rosetta.*` kind.
- **Pack conformance**: existing manifest, declared paths, `rosetta-pack-id-v1`, self/cycle checks. Reuse rather than fork.
- **`rosetta-schemas`**: versioned request/result/lock schema and validators, schema catalog/Core descent, positive and negative vectors once the source-owner accepts this spec.
- **Pack resolver implementation**: deterministic reference resolution and lock verification over an explicit immutable catalog; the owning package/CLI should be selected from actual current exports before code is added.
- **Governance**: lock-graph proof may inform a separate effect-admission/installation decision under #994; lock resolution itself grants neither install, activation, write, nor user permission.
- **#790**: generic Pack release gate remains independently owned; implementing a v1 resolver must not absorb its work.

## Decision points for source-owner review

1. Confirm proposed `pack.*.v1` names, Core-descent class, and exact owner package before public schema lock.
2. Accept or narrow the proposed SemVer subset and whether comparison syntax beyond existing `^0.1.0` is justified for the first executable slice.
3. Confirm the plurality/unknown decision for bounded enumeration and partial catalogs, including the explicit tie-break posture.
4. Confirm whether a lock graph should hash the full request and catalog digest by value or stable immutable references with independent verification proofs. In either case changed source/constraint identities must invalidate a substituted lock.

These decisions remain open while `status: in-development`. This document is **not** evidence of implemented resolver behavior, conformance or accepted normative policy. After accepted spec review, the executable #1790 leaf receives its own implementation PR and tests. The completed spec PR, when accepted, names the exact baseline for implementation.
