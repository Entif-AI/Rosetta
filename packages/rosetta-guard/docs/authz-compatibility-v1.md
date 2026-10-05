# Agent-native authority compatibility v1

This additive migration implements [#1748](https://github.com/Entif-AI/Rosetta/issues/1748)
under [#630](https://github.com/Entif-AI/Rosetta/issues/630), consuming the shared
[#1746 Profile](../../rosetta-schemas/docs/authority-envelope-v1.md) and
[#1747 evaluator](effective-authority-v1.md). Historical artifacts and existing
Guard APIs retain their meaning. No artifact is rewritten or silently promoted.

## Machine-readable dispositions

`AUTHZ_COMPATIBILITY_MAPPINGS` and each existing catalog entry's
`compatibilityMapping` expose mapping version **1.0.0**. The historical payloads
are unversioned; their existing Core TileEnvelope wrapper version is **0.1.0**.
The Authority Envelope Profile version is **1.0.0**, independently of the
AuthZ program's v0.1 maturity label.

| Source kind | Destination / version | Posture and requirement |
| --- | --- | --- |
| `iam.principal` | Profile `actorEvidenceRefs` / 1.0.0 | Actor evidence only; legacy payload has no owned executable validator here. Identity and role cannot supply rights. |
| `iam.delegation` | `authz.authority_envelope.v1` / 1.0.0 | Bounded projection only when the current authoritative resolver explicitly resolves this historical CID as a delegation source. |
| `iam.cache_domain` | Profile `scope.target.domainRef` / 1.0.0 | Boundary/context evidence; #711 owns comparison. Unspecified historical fields cannot be guessed into scope. |
| `iam.decision` | `iam.decision` / 0.1.0 | Fresh authority evaluation plus legacy binding, policy, expiry and revocation checks; decision evidence only. |
| `iam.approval_handoff` | `iam.approval_handoff` / 0.1.0 | Explicit mutation/escalation workflow evidence. Existing `buildApprovalHandoff` remains available. |
| `guard.decision_token` | `iam.decision` / 0.1.0 | Legacy/local predecessor. Structural validity does not provide current authority. |
| `workflow.policy_decision` | `workflow.policy_decision` / 0.1.0 | Restrictive policy evidence. Denial narrows; allowance grants nothing. |

`inspectAuthzArtifact` distinguishes `native`, `compatibility-projected`,
`legacy-only`, `unsupported` and `insufficient-evidence`, with mapping version,
authority role and reason codes. Inspection checks integrity where a Core wrapper
is present. It interprets history; it does **not** authorize execution. A native
projection can be structurally valid and currently expired or revoked.

`iam.principal`, `iam.delegation` and `iam.cache_domain` have catalog identities but
no package-owned legacy payload schemas. They remain historically interpretable
without inventing payload validators or inferring grants. The delegation adapter
returns the already resolved native envelope, with attenuation/validity checked
by the shared evaluator, rather than fabricating missing fields.

## Existing consumer path

`projectAuthorityDecisionForIam` always calls `evaluateEffectiveAuthority` on
fresh owner-supplied input. It then checks the legacy decision, if supplied, using
`validateIamDecision`, and projects the result through `issueIamDecision` into the
existing consumer shape. Request time and validation time must equal the current
evaluation time. Operation/resource and legacy action/principal/request binding
must agree. Expiry is clipped to current authority, legacy expiry and requested
expiry. Unknown legacy constraints and malformed revocation evidence fail closed.

The additive `compatibility.authzMapping` marker records:

- mapping version and `authorityRole: decision-evidence`;
- current evaluation and Authority Envelope references;
- original legacy decision CID, or `null` for a new compatibility decision.

The new decision has provenance parents for the evaluation and historical decision.
The historical input remains unchanged. Fresh denial produces a denying decision;
unsupported or insufficient evidence produces a typed posture without a usable
allow decision. A prior decision or Receipt cannot replace the evaluator's input.

The existing Guard API remains a historical minimal rule evaluator; live requests
without a deny rule can allow. Its behavior is preserved for compatible callers.
Consequential agent-native execution must use current authority evaluation at the
handler/admission boundary, even if an old API previously allowed the request.

## Consumer guidance

| Owner | Integration obligation |
| --- | --- |
| #1512 / #1513 | Carry evaluation, compatibility decision and execution evidence with distinct roles. Decision provenance is not a grant. |
| #994 | Resolve current authority and independent gates immediately before write admission; deny before durable mutation. |
| #1077 | Preserve domain/policy constraints; unknown constraints require explicit owner translation or fail closed. |
| #1674 | Tool discovery/exposure may remain cached. The handler must resolve current authority on each call. |
| #1684 / #1047 | Resolve parent/child delegation sources and lineage; validate attenuation and current validity before worker/A2A effects. |

`currentAuthority` is an internal resolver/evaluator input, not agent-supplied
permission. Consumers own authenticated source resolution, operation/effect
classification, actor evidence, policy-version mapping and independent gate
freshness. This adapter does not authenticate those inputs, widen provider grants,
or implement downstream owner state machines. OAuth/JWT/VC meanings remain with
their external owners; mapping requires explicit translation.

Approval handoff remains an explicit authority-mutation path. Valid standing
delegation can support repeated bounded actions without a new human approval per
action. No destructive contraction or removal of legacy APIs occurs in this phase.

## Reproducible proof

`fixtures/authz-compatibility-v1.json` versions the ten mandatory migration states
against the shared evaluator fixture. `authority-compatibility.spec.ts` runs those
states, exercises the actual `validateIamDecision` consumer and proves historical
immutability, bounded delegation, restrictive workflow evidence, optional approval,
and rejection of unknown constraints. Run:

```sh
pnpm exec nx run rosetta-guard:test
```

Agent Interface Gate: **WRAP_EXISTING_INTERFACE** through Guard's existing decision
consumer. There is no new authority store, Core kind or universal AuthZ AXI.
