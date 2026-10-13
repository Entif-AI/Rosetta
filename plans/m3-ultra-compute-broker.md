---
id: entif:m3-ultra-compute-broker
task: T1744
status: done
depends: []
awaits: []
specs: [specs/architecture.md]
issues: [1744]
pr: 1795
---
# Prove the bounded M3 Ultra development compute broker

## Scope and authority

Deliver the executable leaf owned by #1744 without broadening Rosetta Core or the
existing external-executor contract. The repository wrapper may dispatch only
named development jobs to the designated host through host-local configuration.
Credentials, target mappings and model/database secrets stay outside repository
artifacts. Returned evidence remains development proof rather than promotion or
semantic acceptance.

## Validation

- [x] The wrapper admits only cataloged jobs and rejects caller-supplied shell commands, arbitrary arguments and environment passthrough.
- [x] Noninteractive public-key transport, strict host identity, exact clean revision matching, loopback service identity and scratch ownership fail closed.
- [x] Request identity is durably written before remote dispatch and lost acknowledgement is reconciled through bounded evidence collection rather than blind replay.
- [x] Timeouts, cancellation, output limits and cleanup terminate only owned process groups and scratch state; no laptop heavyweight fallback is introduced.
- [x] Returned evidence bytes and SHA-256 values are independently verified before the local bundle is accepted.
- [x] Focused compute/TRACE-LIVE tests, repository governance, Nx sync/check and full `pnpm verify` pass on the refreshed PR branch.
- [x] PR #1795 retains #1744 as an open broader consumer/qualification issue rather than treating this bounded broker slice as whole-program completion.

## Handoff

This bounded motion is complete and frozen. #1744 remains open for additional
Kev/SemIf and other consumers already named by the issue. Any future compute
placement policy, new transport profile, credential mechanism or promotion claim
requires its own authority and successor motion.
