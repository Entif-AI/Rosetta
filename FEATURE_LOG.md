# Deterministic Akasha v2 batch

Publication posture: public conformance, schema and fixture proof only.
Primary owner: #1664. Leaves: #1693, #1665, #1666, #1667, #1669.
Branch: codex/1664-akasha-v0-v2-01a10437
Base: 88dd7aa8eb6501f334b3616c1c16e8b2761ab5a9
Coordination: user-authorized-single-writer-exception.
Authorization: explicit current user launch turn, October 3, 2026.
No force-push, merge, release or automatic issue closure. One mutable writer.
Last acknowledged remote SHA: a5974f7a73e9d5eb60935cb77c4c54974eab18e4

## Authority preflight

Fresh main matches the packet baseline. Public boundary/closure/bridge, #528 and current leaf/parent issues govern meaning. Lease tooling/docs remain absent; direct IPR-0067 and current protected workstream references support the user-authorized temporary workflow closure. No protected policy/mechanism is published or changed. No fabricated lease. Core meaning stays unchanged; new trace shapes belong to extensions.

## Acceptance and validation

Accepted: #1693 at 81fee310b6a79aaebbfe4c1e46a90befab95fbaf, draft PR #1725. #1665 accepted locally: 75 captured-derived frames, deterministic re-derivation, secret-pattern/private-scalar scans, separate original/derived manifestations and generated edge fixture. Seven source tests plus lint/typecheck/build pass. Public fixture docs/manifests bind the derivative; private original/receipt remain outside Git. Accepted #1666 locally: schema/refinery tests and lint/typecheck/build pass; 75 captured records/66 client materializations, six generated snapshots, complete typed deltas/dictionary/loss/time roles and replay digests. Generated safe content is padded to the prepaid canonical-state sizes 1000/1200/760/900/200/920; source fixture remains captured-derived and independent. Schema catalog/descent/audit updated; no Core edit. Current leaf: #1666 checkpoint.


## Handoff

Next safe step: checkpoint #1666, then #1667 pure graph plan and real Neo4j acceptance. Task-local Neo4j 5.26.0 / Java 21 is running isolated on loopback fixture ports. #1668 and #1694 remain deferred. #1664 stays open. Every checkpoint compares the remote ref to the acknowledged SHA, pushes without force, and verifies remote readback. The committed log names the previously acknowledged SHA; the exact known checkpoint commit is the readback successor, avoiding recursive self-hashing.
