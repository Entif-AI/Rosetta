# Minimum receipt-family contract

Status: draft companion contract, version 0.1.0. Owner: #158. Scope: the
fixture-backed S0 seam consumed by #10; not completion of all receipt emitters,
retention, runtime sinks, or conformance Profiles.

Authority: [Core Spine](../RFCs/Rosetta%20v3.0.0%20Core%20Spine%20Specification.md),
the existing [RRP payload](../../packs/rrp/schema/receipt.schema.json), and
[source substrate](../../packages/source-substrate/README.md). Core meaning wins
over this companion. This document defines the bounded `rrp:lifecycle.v1`
receipt convention; it adds no Core kind or mandatory field to existing receipts.

## Lifecycle crosswalk

| Lifecycle term | Representation | Boundary |
| --- | --- | --- |
| session | `rosetta.run` | One invocation/trace root; multi-run application sessions are an external grouping. |
| task | Run-scoped intent, represented by an action or action grouping | A role, not a new first-wave tile. An application task identifier is not a CID. |
| step | `rosetta.action` | References its run; external execution is represented separately by `rosetta.toolcall`. |
| artifact | Existing observation or source artifact | Preserve raw observations, canonical artifacts, derived summaries/extracts, packages and episodes as distinct kinds. |
| check | `rosetta.evaluation`, or a source-layer `source.evaluation_receipt` | An assessment with explicit evidence, not a rewrite of an observation. The executable seam below uses the core evaluation. |
| outcome | Verdict-bearing assessment plus the subject's resulting state | A role, not a free-floating outcome object. Receipt claims attest the bounded result. |
| receipt | `rosetta.receipt` | Subject/evidence/policy/digest attestation; optional signature and closure bundle remain separate. |

`source.trust_matrix` is an input to assessment. It is neither a receipt stage
nor permission to promote. Source fetch/normalization/transformation receipts
remain evidence of their particular transformations, not duplicates of the
final lifecycle attestation. Later summaries, trajectories, memory, persona,
procedures and compiled context consume this ladder; they do not add peer stages.

## Verdicts and refusal

| Outcome | Receipt verdict | Meaning of this bounded claim |
| --- | --- | --- |
| pass | `pass` | The named check succeeded for the exact subjects. |
| fail | `fail` | The named check was performed and failed. |
| partial | `partial` | Only the stated portion completed; describe what remains. |
| deny | `deny` | Policy explicitly refused the attempted operation. |
| blocked-precondition | `unknown` | A required prerequisite was unavailable; the requested completion is not established. |
| unknown | `unknown` | The assessment cannot determine the result for the stated reason. |

Every claim uses `rrp:lifecycle.<outcome>` and a nonempty statement explaining
the bounded result. `blocked-precondition` is a reason-qualified outcome, never
a sixth receipt verdict. An explicit policy refusal uses `deny`, not an
ambiguous missing-prerequisite result. A blocked operation can have a receipt
without a tool call: do not fabricate execution evidence. Its artifact subject
is the candidate/input, not a fabricated output. Missing prerequisite identifiers
belong in the check summary/statement; do not fabricate resolvable policy tiles.

These claims do not aggregate multiple checks into universal success. A caller
must describe partial work and unresolved conditions honestly. The helper checks
structure and agreement, not the factual truth of prose or execution authority.

## Executable minimum seam

`createLifecycleReceipt` in `@entif-ai/rosetta-receipts` accepts an existing run,
action step, nonempty artifact subjects, core evaluation, explicit policy-evidence
array, outcome and statement. It rejects corrupted tiles, invalid supported
payloads, wrong run lineage, contradictory check verdicts and checks whose parents
do not bind the step and every artifact subject. Source-layer evaluation receipts
may be artifact evidence assessed by that core evaluation; the helper does not
silently reinterpret their lane-specific payloads.

The output uses existing RRP fields:

- `receiptType`: `rrp:lifecycle.v1`.
- `subjects`: exact run, step and artifact CIDs with session/step/artifact roles.
- `claims`: one reason-qualified claim referencing the check CID.
- `policyRefs`: exact supplied policy/decision evidence CIDs, possibly empty when
  unavailable or inapplicable. Presence is not proof of authority or validity.
- `digests`: SHA-256 of each distinct supplied tile's canonical body.

The direct bundle contains the receipt and all subject, check and policy CIDs.
Missing any required member fails the existing closure check. That check proves
local membership only; it does not recursively traverse source ancestry, authorize
disclosure, validate a caller-altered bundle, or verify policy validity. Consumers
must apply their rights and admission gates before retrieval or mutation.

Identical ordered inputs produce identical canonical receipt bytes and CID.
Changing a subject, check, policy, outcome or statement produces a different
receipt. The helper does not execute side effects, persist state or allocate a
new random identity; replay is construction of the same evidence object.

Supersession creates new subject/check/receipt artifacts while retaining the old
ones. Use the owning source or revision contract for explicit supersession
relationships. A changed receipt does not revoke its predecessor, nor does a
signature certify current rights, objective truth or profile conformance.

## Validation and ownership

The receipt package's executable fixtures cover all six outcome cases, loss of
each closure member, deterministic replay, contradictory verdicts, unrelated
checks, wrong run lineage, corrupted evidence and empty inputs. They are synthetic
and require no provider or model. Existing signing and termination tests remain.

#10 owns promotion transition law and refusal policy; #921 owns instrumentation
and sinks; #1056 owns privacy/retention; #240 and #1205 own conformance reporting.
#42's existing structural validation is retained. This seam neither completes
those issues nor certifies Light/Full/Auditor/Forge coverage.

Run `pnpm demo` and inspect `lifecycleDemo`: six synthetic outcomes expose their
canonical check, receipt, closure bundle, replay comparison and deliberately
missing-evidence result. A negative fixture is expected to fail closure; this
does not turn the entire demo into a failed operation. No provider is contacted.

Preflight: public governance, Core Spine, RRP, source substrate and the public
bridge were reviewed. The protected inverse-map review identified no operational
edge controlling this method-neutral receipt convention. No protected mechanism
or authority-map change is introduced. Validate with receipt fixtures,
`pnpm run governance:authority`, and `pnpm run verify` against `origin/main`.
