---
description: Run configured Nx merge-admission
---
Read .specify/entif-governance.json to locate the project-local governance configuration.
If convergence is configured, first preserve the current upstream assessment through
the convergence command. Missing or stale evidence is a blocker, never a reason to
disable the configured gate. A previously captured artifact may be reused only while
its declared source digests still match.
Read projectName from that configuration. Run `pnpm exec nx run <projectName>:merge-admission`.
Failure blocks the next lifecycle stage. Preserve the named upstream report and reason.
Do not redefine semantic verdicts, bypass a failing check, create a branch, merge or publish.
