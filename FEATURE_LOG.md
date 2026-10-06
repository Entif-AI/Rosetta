---
schema: "entif.feature-log/v1"
issue:
  repository: "Entif-AI/Rosetta"
  number: 1761
  title: "AUTHZ-MUTATE-001 governed authority mutation"
  url: "https://github.com/Entif-AI/Rosetta/issues/1761"
branch:
  name: "codex/1761-authz-mutate"
  base_ref: "codex/1765-authz-admission"
  base_sha: "6fec46150fc0c38a9b04c88c6fa0cbbff026a7a4"
initiator:
  type: "automation"
  principal: "codex"
  run_id: "14427340-a050-4cea-aaab-9789f04948d2"
lease:
  id: "5fcb7f40-e8f5-40ec-9f4f-ab549854656b"
  holder: "codex-14427340"
  acquired_at: "2026-10-06T02:55:52.353Z"
  heartbeat_at: "2026-10-06T02:55:52.353Z"
  expires_at: "2026-10-06T03:55:52.354Z"
  released_at: null
focus:
  summary: "NOT_AGENT_FACING: configure a pinned independent operator root source, then admit policy/root establishment, bounded delegation, invalidity and supersession through #1765 before append. Prove non-amplification, deterministic identity conflicts/replay, lost-ack reconciliation, history retention and independent roots."
  acceptance_refs: "[]"
checkpoint:
  sha: "6fec46150fc0c38a9b04c88c6fa0cbbff026a7a4"
  pushed_at: null
state:
  status: "active"
  blocked: false
---

# Feature Worklog

## Objective
NOT_AGENT_FACING: configure a pinned independent operator root source, then admit policy/root establishment, bounded delegation, invalidity and supersession through #1765 before append. Prove non-amplification, deterministic identity conflicts/replay, lost-ack reconciliation, history retention and independent roots.

## Authority / Decisions
#630 and #1757; public boundary and authority closure preflight completed. Existing upstream implementation is consumed. Integration hold: no merges, issue closure, release, promotion or production deployment.

## Validation Plan
Red/green owner negatives and green path, then package lint/typecheck/test/build, exported runtime, governance and proportional regressions.

## Next Safe Step
Write focused red tests for #1761.

## Handoff
Work Stack 14427340-a050-4cea-aaab-9789f04948d2; task authz-1761-mutate; lease 5fcb7f40-e8f5-40ec-9f4f-ab549854656b; private journal and verified Drive checkpoints.

## Acceptance / Validation
Nine mutation tests and all 88 Guard tests pass; Guard lint/typecheck/test/build and runtime exports pass. Non-amplification and checkpoint refusal preserve target revision. Real transport/Receipt-storage loss reconciles closure without another append. Expiry/supersession and revocation retain history; independent roots survive. Existing local-write effect vocabulary is used.
