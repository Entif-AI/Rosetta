# Source Substrate Pack acceptance

## Required positive cases

- The manifest follows the accepted schema; its content ID, exports, declared paths, and DocID dependency on RRP resolve.
- Its JSON Schema parses; the declared SHACL and vocabulary remain available for relevant consumers.
- Existing source-system, source-record, manifestation, trust, registry, and cache tests continue to pass.
- Any future release claim includes executable example, SHACL, traceability, and change-history evidence where applicable.

## Must fail

- Missing or cyclic DocID dependencies, missing exports, or a stale Pack content ID.
- Collapsing source-system identity into a single hosted manifestation, or treating registry tier as a truth verdict.
- A change presented as release-ready without executed Pack-specific acceptance evidence.

## Blockers

Structural conformance errors and failed existing tests block merge. The generic ROCK release gate and unresolved Pack-specific semantic checks block release; [tests/README.md](tests/README.md) is a test coverage pointer, not a passing test receipt.
