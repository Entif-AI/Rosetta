---
schema: "entif.feature-log/v1"
issue:
  repository: "Entif-AI/Rosetta"
  number: 1759
  title: "AUTHZ-ACTOR-001 authenticated actor evidence"
  url: "https://github.com/Entif-AI/Rosetta/issues/1759"
branch:
  name: "codex/1759-authz-actor"
  base_ref: "codex/1758-authz-state"
  base_sha: "6929793379bda0294168223cbbf0772f6b6f8284"
initiator:
  type: "automation"
  principal: "codex"
  run_id: "14427340-a050-4cea-aaab-9789f04948d2"
lease:
  id: "f1d36d42-b149-4683-860f-3844b8c55f1b"
  holder: "codex-14427340"
  acquired_at: "2026-10-06T02:36:26.917Z"
  heartbeat_at: "2026-10-06T02:36:26.917Z"
  expires_at: "2026-10-06T03:36:26.922Z"
  released_at: null
focus:
  summary: "NOT_AGENT_FACING: bind pinned Ed25519 workload assertions using existing signed Receipt verification. Authentication supplies evidence and never grants authority; prove missing, untrusted, expired, revoked, subject/session mismatch and valid current evidence. Preserve #703/#1077/#96/#1296 owners."
  acceptance_refs: "[]"
checkpoint:
  sha: "6929793379bda0294168223cbbf0772f6b6f8284"
  pushed_at: null
state:
  status: "active"
  blocked: false
---

# Feature Worklog

## Objective
NOT_AGENT_FACING: bind pinned Ed25519 workload assertions using existing signed Receipt verification. Authentication supplies evidence and never grants authority; prove missing, untrusted, expired, revoked, subject/session mismatch and valid current evidence. Preserve #703/#1077/#96/#1296 owners.

## Authority / Decisions
#630 and #1757; public boundary and authority closure preflight completed. Existing upstream implementation is consumed. Integration hold: no merges, issue closure, release, promotion or production deployment.

## Validation Plan
Red/green owner negatives and green path, then package lint/typecheck/test/build, exported runtime, governance and proportional regressions.

## Next Safe Step
Write focused red tests for #1759.

## Handoff
Work Stack 14427340-a050-4cea-aaab-9789f04948d2; task authz-1759-actor; lease f1d36d42-b149-4683-860f-3844b8c55f1b; private journal and verified Drive checkpoints.

## Acceptance / Validation
Six actor tests and all 72 Guard tests pass. Guard and Receipt lint/typecheck/test/build pass; frozen install, Nx sync check and actual package runtime exports pass. Signed historical evidence never grants rights, and live actor/issuer revocation defeats replay. Registry persistence/distributed reconciliation remains with identity-source owners.
