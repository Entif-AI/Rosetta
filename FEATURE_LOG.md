# Deterministic Akasha v2 batch

Publication posture: public conformance, schema and fixture proof only.
Primary owner: #1664. Leaves: #1693, #1665, #1666, #1667, #1669.
Branch: codex/1664-akasha-v0-v2-01a10437
Base: 88dd7aa8eb6501f334b3616c1c16e8b2761ab5a9
Coordination: user-authorized-single-writer-exception.
Authorization: explicit current user launch turn, October 3, 2026.
No force-push, merge, release or automatic issue closure. One mutable writer.
Last acknowledged remote SHA: d6bf19669fa9330514e3c6535ccdafafdc72e66e

## Authority preflight

Fresh main matches the packet baseline. Public boundary/closure/bridge, #528 and current leaf/parent issues govern meaning. Lease tooling/docs remain absent; direct IPR-0067 and current protected workstream references support the user-authorized temporary workflow closure. No protected policy/mechanism is published or changed. No fabricated lease. Core meaning stays unchanged; new trace shapes belong to extensions.

## Acceptance and validation

Accepted: #1693 at 81fee310b6a79aaebbfe4c1e46a90befab95fbaf, draft PR #1725. #1665 accepted locally: 75 captured-derived frames, deterministic re-derivation, secret-pattern/private-scalar scans, separate original/derived manifestations and generated edge fixture. Seven source tests plus lint/typecheck/build pass. Public fixture docs/manifests bind the derivative; private original/receipt remain outside Git. Accepted #1666 locally: schema/refinery tests and lint/typecheck/build pass; 75 captured records/66 client materializations, six generated snapshots, complete typed deltas/dictionary/loss/time roles and replay digests. Generated safe content is padded to the prepaid canonical-state sizes 1000/1200/760/900/200/920; source fixture remains captured-derived and independent. Schema catalog/descent/audit updated; no Core edit. Accepted #1667 locally: pure adapter tests plus schema/package checks pass; real Neo4j 5.26.0 proof covers both fixtures, nine node-family constraints, scoped evidence identities/indexes, literal Cypher, bounded neighborhoods, duplicate-free import, another namespace surviving reset, and identical rebuilt closure digests. Accepted #1669 locally: the literal S0-S5 series passes, captured request recurrence is measured, serialized schema rejects false reset candidates, and direct Neo4j queries match both series with pre/post state neighborhoods. Source/profile/version/digest references and the client-visible epistemic caveat are retained. Current frontier: all five deterministic leaves accepted; final batch postflight passed.


## Handoff

Batch postflight passed: verify:full, affected:verify, governance:admission, governance:spec, SpecOps tests/DAG/next, deterministic fixture regeneration and real Neo4j reset/rebuild/query proof. Final negative regressions also cover CRLF physical source-byte accounting and cross-namespace graph identity rejection. Packed distribution proof used the repository-pinned Spec Kit CLI in a task-local environment. Next safe step: checkpoint #1669 and finish the single draft PR handoff. Stop at this frontier. Task-local Neo4j 5.26.0 / Java 21 is running isolated on loopback fixture ports. #1668 and #1694 remain deferred. #1664 stays open. Every checkpoint compares the remote ref to the acknowledged SHA, pushes without force, and verifies remote readback. The committed log names the previously acknowledged SHA; the exact known checkpoint commit is the readback successor, avoiding recursive self-hashing.

## Checkpoint identities

- #1693: 81fee310b6a79aaebbfe4c1e46a90befab95fbaf
- #1665: a5974f7a73e9d5eb60935cb77c4c54974eab18e4
- #1666: 22c00847b21c34cef7547d256f0d1d312084711c
- #1667: b3d3ec4dcd2a8d6b58ac36243f15dae5eb476e4b
- #1669 and batch postflight: d6bf19669fa9330514e3c6535ccdafafdc72e66e, with remote readback verified by the coordinator.

Receipt: tools/trace-graph/evidence/batch-validation.json. Public runtime proof binds source/normalized/graph/kinematics artifacts. The private original and derivation receipt remain outside Git. The isolated development database may be stopped; all checked-in proof artifacts remain independently inspectable.

## Scoped review follow-up

Review question: https://github.com/Entif-AI/Rosetta/pull/1725#issuecomment-5975928228. User selected only trace.normalization.v1 independent self-validation. #1666 and the public Profile govern serialized admission; producer identity alone is insufficient. Preserve the accepted batch, serialized shape and fixture bytes/digests. Add rehashed negative lifecycle/byte-count/partition tests before parser changes, then run narrow schema/refinery/projection checks and final admission gates. One checkpoint; reply to the existing comment and mark ready only when green. No merge, Graphiti, salience or unrelated work.

Scoped review disposition: independent serialized admission. Sixteen rehashed adversarial cases were accepted before the fix and rejected after it. Narrow schema/refinery/projection tests pass (68/22/9), with lint/typecheck/build. All 13 checked-in fixture/schema/evidence files remain byte-identical; normalized, kinematics and pure graph closure digests are unchanged. Final merge/spec admission and sync:check pass. Next safe step: push this single review checkpoint, verify current-head CI, reply to the existing review question, and mark ready without merge or issue closure.
