# State authority, custody and recovery v1

**Status: proposed, fixture-only.** Source issue #1879. Schema owner: rosetta-schemas. Semantic acceptance is outstanding. These are governed metadata extensions, not new Core kinds.

## Declarations

A `state.custody.v1` record declares a state family, immutable revision, authority claim, custodian and custody reference, assigned writers, exact artifact identity where durable, source/dependency closure, governing policy and rights references, and retention policy. The record commits these metadata to a digest; that digest is not a Core CID, signature, authority decision, or assertion of truth. Authority claims and writer assignments require independent resolution under the governing owner. A successor retains its predecessor reference; a new declaration does not alter the earlier one.

The four closed classification variants are mutually exclusive:

| Class     | Meaning                                                                                                              | Recovery                                                           |
| --------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| NATIVE    | Declared source authority, governed by its referenced source owner                                                   | Restore/reacquire from independently held reconstructive evidence  |
| DERIVED   | Rebuildable projection of a declared source/dependency closure, materialized-view reference and exact recipe version | Rebuild from permitted closure and compare exact artifact readback |
| OPERATOR  | Non-rebuildable operator/control state with explicit purpose and reason; not source truth or current rights          | Restore from independently held reconstructive payload             |
| EPHEMERAL | Runtime state that makes no durable artifact claim                                                                   | Reinitialize; no durable restore claim                             |

These classifications do not establish the asserted authority. In particular, derived storage has no separate native-source authority field and cannot declare one through mixed variants. The declaration does not replace a source record, materialized view, graph view, Policy, Receipt, or existing source/rights lifecycle.

## Recovery evidence

A separate `state.recovery.v1` record references the exact declaration, recovery Action, owner, acting principal and writer assignment, current policy, tenant, rights and retention decision references and authority frontier. It records availability/retention evidence for the affected state and each declared dependency. Availability here is the authoritative permission/availability basis for recovery, not a claim that the damaged primary copy is still readable. The evidence distinguishes deletion, access loss, retention expiry, rights revocation, temporary unavailability and unknown closure. Those causes remain attributable even when the outward disposition is restricted or unavailable.

A successful rebuild needs complete declared closure, a permitted state and every dependency available, rebuild evidence and exact artifact readback. A successful restore instead needs an independently held reconstructive payload (separate custody and artifact references), verification Receipt references, an Evaluation binding that payload to the reconstructed material, and exact readback of the declared revision. A receipt or hash alone is not a payload. Event and snapshot bytes may differ from the reconstructed output. The readback must match the original artifact identity and digest; recovery of a different revision requires a new declaration. Partial, unknown, unavailable and restricted outcomes carry evidence, not a recovered payload. A restricted dependency cannot be represented as a generic unknown or successful recovery. Unknown, partial or unavailable closure never proves completeness.

The structural and cross-record checks do not resolve a referenced artifact or prove a signature, independence, authorization, currentness, or actual physical readback. The recovery owner must independently verify the exact reconstructive bytes, their provenance and signature, the bound Evaluation and observed readback, and current rights and retention under the applicable authority before acting. Recovery cannot restore material whose possession is prohibited. Rebuild is not revalidation. Consumers must separately re-admit `materialized.view.v1`, `impact.revalidation.v1`, `graph.view.v1` and `compiled.context.v1` under their owning contracts, including fresh rights for each source. A recovery observation is not a grant, source assertion, or permission to expose protected metadata.

## Conformance

The JSON schemas specify bounded structural forms; the TypeScript parsers also verify metadata identity and cross-record constraints. Tests cover all four variants, exact identity, forbidden competing authority, incomplete closure, independently held payload versus receipt-only recovery, distinct availability causes, assignment/tenant/dependency substitution, receipt aliases, and actual materialized-view admission after recovery and revocation. These are synthetic conformance fixtures. No storage vendor, deployment topology, authorization protocol, recovery scheduling algorithm or retention policy is normative.
