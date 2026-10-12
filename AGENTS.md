# Rosetta Repository Agent Instructions

These instructions apply to all agentic and automated work in this repository.

## Mandatory authority preflight

Before materially changing Rosetta semantics, schemas, Packs, Profiles, governance, runtime behavior, automation behavior, Skills, or implementation code:

1. Read `docs/governance/PUBLIC_COMMONS_AND_PRIVATE_OPERATION_BOUNDARY.md`.
2. Read `docs/governance/AUTHORITY_CLOSURE_AND_REQUIREMENTS_TRACEABILITY.md`.
3. Resolve the affected public Rosetta authority, including Core Spine, schema authority, Profiles, Packs, fixtures, and governance as applicable.
4. Check `docs/governance/PUBLIC_PRIVATE_AUTHORITY_BRIDGE.yaml` for protected `IPR-####` authorities related to the affected public surface.
5. If you are an authorized internal engineering agent with access to the protected requirements repository, resolve every relevant protected identifier through its canonical private authority map and requirements spine before changing behavior.
6. If you do not have protected access, do not invent protected requirements. Continue only where the public contract fully determines the work; otherwise produce a requirement/conflict note for an authorized maintainer.
7. Define how the change will be validated before implementing it.

## Non-negotiable boundary

Public Rosetta defines interoperable meaning.

Protected implementation may optimize, specialize, or outperform the public contract. It must not silently redefine the public contract.

## Publication safety

Accessibility is not permission to disclose.

When writing to public GitHub surfaces, releases, external correspondence, research outreach, or other externally visible channels:

- use only material whose publication posture permits disclosure;
- never copy protected mechanism details into this repository;
- refer to protected authority only through opaque `IPR-####` identifiers where a public bridge edge is necessary;
- never place a direct protected-repository URL in a public artifact.

## Requirements graph maintenance

When work creates, supersedes, splits, or discovers an authority relationship:

- update the public bridge if a disclosure-safe edge is useful;
- update the private inverse map when operating internally;
- keep public and private requirements mutually traceable without collapsing their disclosure boundary.

## Governance checks

Run:

```bash
pnpm run governance:authority
```

before commit when governance, schemas, Skills, public/private mappings, or agent instructions are affected.

The pre-commit hook runs deterministic authority-boundary checks. New checks should be added only for concrete, mechanically recognizable failure modes with clear remediation.
