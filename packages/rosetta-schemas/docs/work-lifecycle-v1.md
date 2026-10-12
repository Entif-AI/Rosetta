# Public bounded-work lifecycle v1

Authority: #1509; Rosetta v3.0.0 Core Spine; public/private authority bridge IPR-0053. Publication posture: public representation. Private prioritization, decomposition, selection, scheduling, resource allocation, repair routing and learning remain outside this contract.

`work.lifecycle.v1` is an application contract composing references to existing work, Action, Evaluation and Receipt semantics. It is not a new Core kind or workflow runtime. Version 1.0.0 records objectives/commitments, prerequisites, procedure/capabilities, executor, bounded context, acceptance, evidence, dispatch/attempt/result, verification, integration, telemetry, adapter identity, receipts, provenance and continuation.

Procedure and executor have distinct reference identities. Dispatch conveys no tool/write grant. A completion is only a completed execution; accepted verification requires an attributed result, evidence and separate verifier identities. Integration references accepted verification plus an integration outcome. References remain evidence claims: admission does not authenticate receipts, prove real-world independence, or authorize effects.

Receipt references are present when durable canonical receipts exist. An empty `receiptRefs` array explicitly preserves their absence; an evidence document is not relabeled a Rosetta Receipt merely to fill the field. Provenance remains required.

The JSON Schema is generated from the runtime shape. `validateWorkLifecycle` and `parseWorkLifecycleRecord` additionally check relational invariants that ordinary JSON Schema cannot express: self references and conflated procedure/executor/verifier identity. The standard date-time format is restricted to ordinary seconds (00–59); leap seconds are outside v1. Public conformance requires both shape and relational validation.

`appendWorkLifecycleRecord` validates a bounded, single-work prior chain. Exact duplicate delivery is idempotent; a changed record under an existing identity is rejected. Verification resolves to an earlier completed result with matching executor attribution. Integration must reference the latest accepted verification of that result at the point of integration. No timestamps imply causal links or sort the history.

`materializeWorkLifecycle` produces a separate `work.lifecycle-state.v1` inspection view containing the history frontier and independent execution, verification and integration states. A new execution does not inherit prior verification. Later rejection does not erase a recorded integration: the external outcome remains visible alongside the changed verification posture. Canonical history is never mutated by materialization.

Software, human review, garden integration and interoperable adapter conformance vectors are in `../test-vectors/work-lifecycle/`. They are synthetic conformance evidence, not claims that those activities occurred. Run the focused Vitest suite and `node tools/engineering-evidence/schema-sync.mjs` after building the owner. Use `--write` to regenerate published schemas.
