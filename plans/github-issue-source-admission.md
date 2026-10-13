---
id: entif:github-issue-source-admission
task: T1810
status: done
depends: []
awaits: []
specs:
  - specs/architecture.md
issues: [1810, 799, 506]
pr: 1811
---
# Admit a bounded native GitHub issue snapshot

Execute the bounded #1810 implementation contract through the existing Source
Substrate and ingress-refinery ownership boundary. Preserve native repository and
issue identity, manifestation/version lineage, caller-supplied rights evidence,
parse-only posture, explicit incomplete coverage, and the separate canonical JSON
source representation without introducing a new Rosetta semantic contract.

This motion covers the fixture/local source-admission implementation only. Live
provider acquisition, provider-authenticated authorization, threaded completeness,
durable raw-source custody, graph/query integration, and Mission Control transport
remain separate integration work under their existing owners.

## Implements

- `specs/architecture.md`: Rosetta owns source identity, provenance and receipts;
  the issue remains the durable implementation contract and this plan is bounded
  motion beneath the existing Source Substrate authorities.

## Validation

- [x] Focused GitHub issue-acquisition tests pass on the exact candidate.
- [x] The full `ingress-refinery` and `source-substrate` test targets pass.
- [x] `pnpm run verify` passes.
- [x] `pnpm exec nx sync:check` passes.
- [x] `node packages/nx-governance/specops/check.mjs --base origin/main` passes.
- [x] `git diff --check` passes.
- [x] The implementation remains fixture/local-only and does not claim live source
  acquisition, provider authority, complete thread custody, or downstream integration.

## External authorities

- `docs/governance/20260412 - Entif Source Substrate and Repository Provenance Addendum.md`
- `docs/RFCs/Rosetta v3.0.0 Core Spine Specification.md`

## Integration boundary

Completion of this motion means the bounded #1810 implementation and its tests are
verified. It does not complete the parent #799 live-source corridor or authorize
deployment, merge, issue closure, or downstream GraphView/Mission Control use.
