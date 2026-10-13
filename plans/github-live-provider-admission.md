---
id: entif:github-live-provider-admission
task: T1819
status: blocked
depends: [github-issue-source-admission]
awaits:
  - source-owner-native-github-provider-contract
specs: [specs/architecture.md]
issues: [799, 1810]
pr: 1819
---
# Admit native live GitHub provider acquisition

## Scope and authority

PR #1819 implements a bounded authenticated GitHub REST acquisition adapter on top
of the completed offline GitHub issue source-admission motion. The implementation
keeps raw provider responses separate from derived snapshots, preserves native
provider identity, bounds pagination and response size, and fails closed on
repository-grant, redirect, rate-limit and provider-state mismatches.

The current public issue authority does not yet accept this live provider surface.
#1810 explicitly scoped its delivered slice to fixture/offline acquisition and
excluded provider API calls and native pull-request/review admission. #799 remains
the parent coordination issue and does not itself define the missing executable
provider contract. The code therefore cannot become accepted desired state merely
because tests or CI pass.

## Validation

- [x] The repaired T1810 base is composed into this branch and remains the owner of offline GitHub issue admission.
- [x] The adapter uses fixed-origin GitHub REST GETs, explicit host-authorized repository grants, bounded pagination and byte/time limits.
- [x] Native issue, pull-request, review, comment and timeline identities remain distinct and provider state is reread before snapshot acceptance.
- [x] Raw HTTP entity bytes/digests remain separate from JCS snapshot, lossy publication text and derived source-substrate records.
- [x] Denial, redirects, rate limits, provider mismatch and incomplete/truncated collections fail closed or remain explicitly incomplete.
- [x] Focused live/offline acquisition tests and repository verification pass on the composed branch.
- [ ] A source-owner issue or explicit amendment accepts the native live GitHub provider contract, including the new public `github-pull-request` source-family surface.

## Handoff

This motion is blocked on source-owner authority, not implementation mechanics.
Keep PR #1819 Draft until an accepted public contract owns the live provider and
native pull-request/review semantics. After that authority exists, amend or replace
this frozen blocked checkpoint with the successor motion required by SpecOps,
re-run exact-head admission, and only then consider the PR Ready for review.
