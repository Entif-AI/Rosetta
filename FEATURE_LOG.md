---
schema: "entif.feature-log/v1"
issue:
  repository: "Entif-AI/Rosetta"
  number: 1765
  title: "AUTHZ-ADMIT-001 nine-step canonical admission"
  url: "https://github.com/Entif-AI/Rosetta/issues/1765"
branch:
  name: "codex/1765-authz-admission"
  base_ref: "codex/1759-authz-actor"
  base_sha: "8e735d2b7939a89e4b9afe1e0fac0e4fed82194b"
initiator:
  type: "automation"
  principal: "codex"
  run_id: "14427340-a050-4cea-aaab-9789f04948d2"
lease:
  id: "8df05a96-2127-448d-9f76-f16b63ec105a"
  holder: "codex-14427340"
  acquired_at: "2026-10-06T02:43:33.415Z"
  heartbeat_at: "2026-10-06T02:55:37.096Z"
  expires_at: "2026-10-06T03:43:33.419Z"
  released_at: "2026-10-06T02:55:37.096Z"
focus:
  summary: "#1765 implemented and tested; review hold"
  acceptance_refs: "[]"
checkpoint:
  sha: "8e735d2b7939a89e4b9afe1e0fac0e4fed82194b"
  pushed_at: null
state:
  status: "available"
  blocked: false
---

# Feature Worklog

## Objective
NOT_AGENT_FACING: implement #994 nine-step local admission with independent workflow/startup narrowing, current evaluation, durable checkpoint-before-apply, post-write observation, canonical Receipt closure and explicit projection outcome. #1761 consumes this contract before any authority mutation.

## Authority / Decisions
#630 and #1757; public boundary and authority closure preflight completed. Existing upstream implementation is consumed. Integration hold: no merges, issue closure, release, promotion or production deployment.

## Validation Plan
Red/green owner negatives and green path, then package lint/typecheck/test/build, exported runtime, governance and proportional regressions.

## Next Safe Step
Write focused red tests for #1765.

## Handoff
Work Stack 14427340-a050-4cea-aaab-9789f04948d2; task authz-admission-contract; lease 8df05a96-2127-448d-9f76-f16b63ec105a; private journal and verified Drive checkpoints.

## Acceptance / Validation
Seven admission tests and all 79 Guard tests pass; Guard lint/typecheck/test/build and package runtime exports pass. The explicit contract includes independent startup/workflow narrowing, current IAM/Evaluation linkage, grounding, durable checkpoint, second current check, actual readback, canonical Receipt closure and observable projection failure. Lost acknowledgement and closure failure require reconciliation, never blind apply retry.

## Pre-merge Verification
Seven admission tests and all 79 Guard tests pass. Guard lint/typecheck/test/build, actual runtime exports and authority hook pass. Denials measure zero target effects. Post-checkpoint revoke, lost acknowledgement, readback drift, Receipt failure and projection failure are explicit. Hosted CI pending; no production/distributed claim.

PR #1766. Implementation is held for user review. No merges or issue closure. Exact final log archive precedes removal.
