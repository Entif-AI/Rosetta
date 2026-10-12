# Authority-Closure Governance Check Rules

This file documents how deterministic authority-boundary checks are added to `check-authority-closure.mjs`.

## Design rule

Add a checker rule only when the failure mode is:

1. concrete;
2. mechanically recognizable with acceptable false-positive risk;
3. important enough to block or warn on before merge; and
4. paired with clear remediation.

Do not turn this checker into a prose classifier for patentability, strategic value, semantic correctness, or disclosure safety.

## Current rules

### `authority-required-file`

Required authority-closure governance files must exist.

### `authority-required-snippet`

Critical entrypoint files must continue to direct agents toward the current authority-closure workflow.

### `authority-no-direct-private-repo-reference`

Public active surfaces must not contain direct protected-repository paths or URLs. Use opaque `IPR-####` authority identifiers instead.

### `authority-canonical-ipr-id`

Protected authority references use the canonical `IPR-####` format.

### `authority-bridge-no-private-location`

The public bridge must not encode protected repository locations through private/protected URL or repository keys.

## Adding a rule

When a real failure mode is discovered:

1. Record the incident or concrete example that motivates the rule.
2. Give the rule a stable identifier prefixed with `authority-`.
3. Define the exact detection boundary. Prefer syntax and file-structure checks over subjective inference.
4. Define the remediation text a contributor should see.
5. Add positive and negative fixtures or unit tests where practical.
6. Update this file with the new rule and rationale.
7. Run `pnpm run governance:authority` and the relevant governance tests.
8. If the rule changes contributor expectations materially, update `AUTHORITY_CLOSURE_AND_REQUIREMENTS_TRACEABILITY.md` or `AGENTS.md` as applicable.

## Rule-lifecycle policy

Rules may be:

- strengthened when a previously missed concrete failure is found;
- narrowed when false positives reveal an overly broad detection boundary;
- retired when repository architecture makes the failure impossible by construction; or
- promoted from warning/reporting to blocking only after confidence is high.

A rule should not silently change meaning. Material changes should be visible in commit history and, where useful, a regression fixture.

## Pre-commit posture

The pre-commit path should remain fast. Heavy semantic, integration, or corpus-wide validation belongs in CI or explicit verification commands unless the failure is both high-risk and cheap to detect locally.
