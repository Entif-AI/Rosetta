# Deterministic Akasha v2 batch

Publication posture: public conformance, schema and fixture proof only.
Primary owner: #1664. Leaves: #1693, #1665, #1666, #1667, #1669.
Branch: codex/1664-akasha-v0-v2-01a10437
Base: 88dd7aa8eb6501f334b3616c1c16e8b2761ab5a9
Coordination: user-authorized-single-writer-exception.
Authorization: explicit current user launch turn, October 3, 2026.
No force-push, merge, release or automatic issue closure. One mutable writer.
Last acknowledged remote SHA: 0bf8ed98c323aac8313f884218325c101d4be4c6

## Authority preflight

Fresh main matches the packet baseline. Public boundary/closure/bridge, #528 and current leaf/parent issues govern meaning. Lease tooling/docs remain absent; direct IPR-0067 and current protected workstream references support the user-authorized temporary workflow closure. No protected policy/mechanism is published or changed. No fabricated lease. Core meaning stays unchanged; new trace shapes belong to extensions.

## Acceptance and validation

Current leaf: #1693 accepted locally; checkpoint pending. 17 canonicalizer, 16 Core, 18 refinery tests passed; semantic/authority and affected lint/typecheck/test/build passed. No golden CID changes. Red failure is tools/trace-graph/jcs-red-evidence.txt. Fresh worktree dependencies needed frozen install and dependency builds before fanout tests. Prepay package passes all 25 manifest checks. Combined 19 plans validated; SpecOps 16 fixtures, next/DAG and authority gate passed. Draft external doc locators moved from `specs` to body authority references because sync requires catalog-owned desired-state specs. Each leaf requires focused red/green proof and applicable gates; graph completion requires real Neo4j proof.

## Handoff

Next safe step: checkpoint JCS, create the one draft PR, bind its identity, then proceed to #1665 captured structural fixture. #1668 and #1694 remain deferred. #1664 stays open. Every checkpoint compares the remote ref to the acknowledged SHA, pushes without force, and verifies remote readback. The committed log names the previously acknowledged SHA; the exact known checkpoint commit is the readback successor, avoiding recursive self-hashing.
