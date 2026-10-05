---
schema: "entif.feature-log/v1"
issue:
  repository: "Entif-AI/Rosetta"
  number: 1749
  title: "Agent-native AuthZ conformance"
  url: "https://github.com/Entif-AI/Rosetta/issues/1749"
branch:
  name: "codex/1749-authz-conformance"
  base_ref: "codex/1748-authz-migration"
  base_sha: "6ba724eb7b6b46607dc5017a368ccc3815e367cc"
initiator:
  type: "automation"
  principal: "codex"
  run_id: "5bd7ac99-e188-4b52-a7a8-b5f19f45ba94"
lease:
  id: "9823531b-ede0-4b40-997f-fca0b6ab3825"
  holder: "codex"
  acquired_at: "2026-10-05T17:12:25.326Z"
  heartbeat_at: "2026-10-05T17:14:43.394Z"
  expires_at: "2026-10-05T17:44:43.395Z"
  released_at: null
focus:
  summary: "Conformance red proof: 15 invariants across three bounded consumer paths"
  acceptance_refs: "[]"
checkpoint:
  sha: "0e425c9f16aa30731f4183875969a7388c40c801"
  pushed_at: null
state:
  status: "active"
  blocked: false
---

# Feature Worklog

## Objective
Prove all 15 #1749 invariants across Guard/AXI-style, worker/A2A and durable write-admission fixture paths, consuming #1746/#1747/#1748 without changing their semantics.

## Acceptance Coverage
Red proof specifies 45 case/path combinations, current-state denial, provider/mutation/dispatch absence, real filesystem checkpoint-before-apply, receipt closure, optional approval, unsupported/unknown reporting.

## Decisions
WRAP_EXISTING_INTERFACE at Guard; no universal AuthZ AXI. Reuse exported Core, schema, Guard, migration, receipt and store APIs. tools/authz owns the bounded conformance fixture adapter; #994/#1674/#1684/#1047/#1295/#1296 remain production owners. The in-memory store alone is not durable-write proof; add fsync/readback in isolated temporary files. No private policy or real privileged credential.

## Validation
Expected red: missing conformance.mjs, Node test log 2026-10-05T17-13-43-387Z-23003.log. Predecessor #1748 local/hosted admission verified at dcdf23e; finalized remote head 6ba724e, lease released and archived.

## Next Safe Step
Implement versioned fixture matrix and tools/authz/conformance.mjs with real owner APIs and denied-effect state snapshots; then narrow tests and Nx-backed report.

## Handoff Notes
Work Stack 5bd7ac99-e188-4b52-a7a8-b5f19f45ba94 / AUTHZ-1749-CONFORMANCE executing. CP0011 private exact-byte readback verified. Private journal cursor 3. Lease remotely acquired at 0e425c9. No merge, promotion, release or issue closure authorized.
