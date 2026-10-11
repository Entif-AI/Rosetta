---
id: entif:envelope-crosswalk
task: T1799
status: in-progress
depends: []
awaits: []
specs: [specs/architecture.md]
issues: [1799, 630, 220]
pr: 1813
---
# Prove envelope family boundaries

Resolve #1799 against the accepted Core v3 Terminology Lock, existing AuthZ Profile (#630/#1746), Agentic Messaging (#220), and source ingress contracts. Keep the current wire IDs, preserve their separate owners, and explicitly distinguish Core shape validation from unimplemented sealed incident access and quorum release. The semantic crosswalk lives in the existing schema owner and Genesis audit. No Core kind or private operational policy is added.

## Validation

- [x] Pre-fix red: transport incident report falsely passes the generic Core Incident payload validator.
- [x] Versioned cross-family ownership/migration crosswalk and observable limitations.
- [x] Core Incident, AuthZ, and Agentic Messaging boundary fixtures, including invalid shapes, rejected constructor inputs and inert transport.
- [x] Schema owner tests and typecheck pass.
- [x] Authority, Core-descent, semantic, SpecOps, affected Nx verification, distribution, release plan and full merge-admission pass. The pinned `specify` 1.1.1.dev0 CLI was restored in ignored worktree dependencies.
- [x] Draft PR #1813 opened on `codex/1799-envelope-crosswalk` and its first pushed head verified against GitHub.
- [ ] Integrated after a separately authorized merge.

## Handoff

PR: https://github.com/Entif-AI/Rosetta/pull/1813. Re-fetch the current PR head, CI conclusion, and issue #1799 before resuming. The contract fixes structural Core Incident identity and rejects its confusion with the legacy data-plane `INCIDENT_ENVELOPE`; encryption, protected ciphertext storage, and cryptographic quorum unsealing are unproven and excluded. Source-level and full Nx governance/affected/distribution proof passed in the isolated feature worktree, using pinned Spec Kit 1.1.1.dev0 only as an ignored local test dependency. The next action is human review and, if warranted, a separate authorized merge. Preserve this plan as in-progress until integration is independently verified.
