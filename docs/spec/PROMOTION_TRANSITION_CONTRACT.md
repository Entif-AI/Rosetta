# Promotion Transition Contract

Status: v1 (issue #10, S1 in the Rosetta v3.0.0 roadmap)
Owns: the promotion state machine and structured extract posture for already-derived artifacts
Companion contract: [RECEIPT_FAMILY_CONTRACT.md](./RECEIPT_FAMILY_CONTRACT.md)
Adjacent lanes (not redefined here): `#793` durable storage, `#799` live acquisition, `#803` staged source trust, `#809` registry refresh, `#1065` imported-resource lifecycle, `packages/rosetta-pipeline` meaning outputs.

## Purpose

Define the first-wave promotion state set, allowed transitions, structured extract posture, and typed receipt contract for Rosetta's promotion-state machine. The machine decides when derived artifacts become reusable, when ambiguous material must stay visible, and when blocked attempts must leave typed refusal evidence.

The machine neither executes work, owns storage, fetches live sources, nor assigns trust scores. It is the constitutional owner of how Rosetta moves from "derived" to "usable" and how ambiguous or blocked material stays visible.

## State Set (v1)

Seven bounded states. The set is intentionally narrow; later lanes may extend it through additive schemas rather than mutation.

| State | Meaning |
| --- | --- |
| `pending-confirmation` | Awaiting source identity, policy backing, or rights closure before becoming usable. |
| `active` | Currently usable in lane-local decisions; not yet eligible for downstream canonical promotion. |
| `promoted` | Cleared the promotion gate; downstream canonical lanes may treat this as canonical within its lane. |
| `cooled` | Temporarily deprioritized without losing identity; eligible for `activate` when conditions change. |
| `quarantined` | Suspected of policy, rights, or provenance violation; held until `revisit` succeeds. |
| `pending-revisit` | Awaiting re-evaluation; not eligible for downstream lanes until `activate` lands. |
| `superseded` | Replaced by a newer derived artifact; retained for provenance, not for downstream use. |

## Allowed Transitions

Default-deny. A transition is legal only if it appears in the table below.

| From | Kind | To |
| --- | --- | --- |
| `pending-confirmation` | `confirm` | `active` |
| `active` | `promote` | `promoted` |
| `active` | `cool` | `cooled` |
| `active` | `quarantine` | `quarantined` |
| `active` | `revisit` | `pending-revisit` |
| `active` | `supersede` | `superseded` |
| `cooled` | `activate` | `active` |
| `pending-revisit` | `activate` | `active` |
| `quarantined` | `revisit` | `pending-revisit` |
| `promoted` | `supersede` | `superseded` |

Any transition not in this table returns an explicit hard-block outcome. This includes self-transitions and any move out of `superseded` (terminal state).

## Blocked-Precondition

A blocked-precondition outcome is produced when:

- required evidence closure is missing
- rights or policy backing is incomplete
- the required prior state is not met (covered by the allow-list, but a softer form when the call site cannot yet prove the prior state)

Blocked-precondition is **not** a new receipt verdict. It maps deliberately onto the existing `ReceiptVerdict` union:

- a soft blocked-precondition that may resolve through evidence closure → `verdict: unknown`, `claimType: rrp:promotion.transition.<kind>.blocked`
- a hard blocked-precondition where rights or policy backing is denied → `verdict: deny`, `claimType: rrp:promotion.transition.<kind>.denied`

This keeps the verdict vocabulary intact (#158 boundary) and lets downstream code reuse existing receipt verification rather than inventing a promotion-local dialect.

## Structured Extract Posture

A structured extract is a `source.derived_artifact` (the existing `summary` or `extract` variant) carrying:

- a `sourceSpans` array referencing the source observation and canonical artifact it was derived from
- a `promotionCid` only after the machine clears it; never before
- the original artifact's CID preserved on the receipt subject list

The transition rule: **derived artifacts never overwrite or mutate source observations or canonical artifacts.** The promotion state machine only emits receipts and state tiles; the artifact ladder above it remains intact. This is the constitutional separation between promotion-state law and durable storage (#793).

## Trust Inputs

Lane-local evaluation vectors and `source.trust_matrix` (#803) values may travel with a transition as `evidenceRefs`. The transition decision is rule-driven by the transition kind, never by a single scalar. Multiple evaluation vectors can coexist on one transition and be inspected independently.

This contract does not redefine staged source trust semantics; it only consumes `source.trust_matrix` CIDs as evidence inputs.

## Replay and Idempotency

Given identical closed inputs `(subject, priorStateTile, kind, evidenceRefs, policies, evaluationVectors, reason)`, a second call produces an identical receipt CID and an identical next state. The receipt's CID is the canonical transition identifier; downstream replay can recompute the receipt from those inputs and verify CID equality.

A replay after the artifact has advanced past `priorState` is **not** a replay — it is a new transition attempt and will be denied if the prior state no longer matches.

## Receipt Shape

Each transition emits a `rosetta.receipt` tile with:

- `receiptType: rrp:promotion.transition.v1`
- `claimType: rrp:promotion.transition.<kind>` or `rrp:promotion.transition.<kind>.blocked` or `rrp:promotion.transition.<kind>.denied`
- `verdict: pass | unknown | deny` mapped from the transition outcome
- `subjects`: the source artifact and the new state tile
- `digests`: one digest per subject
- `policyRefs`: every policy tile cited by the transition
- `evidenceRefs` (as receipt subject evidence): the closure members that justify the transition

This stays aligned to the existing receipt family contract. No new verdict strings are introduced; no parallel outcome object is added.

## Boundary Statements

This contract does not own:

- durable canonical-cache persistence (#793) — storage remains separate
- receipt-family ontology (#158) — only the transition decisions that must emit one
- source-native live acquisition (#799) — adapter code remains separate
- staged source trust semantics (#803) — `source.trust_matrix` is an input, not a redefinition
- scholarly/source-registry refresh (#809) — registry records remain separate
- imported-resource quarantine/admission lifecycle (#1065) — pack intake remains separate
- meaning-pipeline outputs (`packages/rosetta-pipeline`) — forms, lexemes, concepts, and frames remain interpretive inputs, not owners of promotion-state legality

Downstream code that needs a promotion-state decision consumes `createPromotionTransition()` and verifies the emitted receipt through `verifyReceiptBundle()` or `verifySignedReceipt()` exactly as for any other Rosetta receipt.

## Exit Gate

A positive transition and its replay yield the declared stable result. Invalid lineage, missing authority, or malformed evidence produce typed non-pass outcomes (mapped onto the existing verdict union). Use offline fixtures; live acquisition is not needed to prove promotion.

## Observation Profile and exact predecessor, #1698

RRP declares `rrp.promotion-state.v1` in its manifest and
`packs/rrp/schema/promotion-state.schema.json`. It specializes `rosetta.observation`.
Its structured fields are `profile`, `subjectCid`, `state`, `transitionKind`, and
`previousStateCid`. Core-only consumers retain Observation fields. Profile consumers
validate the specialization without reading `signal`.

`createPromotionGenesis` records a starting state, defaulting to pending-confirmation.
A supplied starting state is an observed baseline, not permission to activate storage
or bypass policy. Genesis has `transitionKind: genesis` and a null predecessor.
Every subsequent transition takes `priorStateTile`, verifies its content identity,
Profile, subject, and lineage, and derives the prior state from its payload. An optional
legacy state assertion must agree. Missing or contradictory lineage fails closed.
The resulting Observation names the exact predecessor in payload and parents;
the canonical receipt binds that predecessor, subject, evaluations and policies.
The receipt still attests the transition rather than granting runtime authorization.

Replay takes the same exact predecessor and closed inputs and produces identical
state and receipt CIDs. Detecting a stale predecessor against a durable current-state
pointer remains the storage owner's job. The pre-fix prose-only regression and corrected
Profile examples are checked in under `packs/rrp/test-vectors/promotion-*.json`.
