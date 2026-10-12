# Rosetta CLI research workbench

`rosetta-cli` is the smallest executable workbench for inspecting and challenging the current Rosetta provenance-kernel prototype.

It is designed to let a researcher clone the repository, run one bounded proof, inspect the resulting Rosetta artifacts, and deliberately break two integrity assumptions without reading the entire specification suite first.

## Authority and scope

- Rosetta semantic and protocol meaning is governed by the [v3 Core Spine](../../docs/RFCs/Rosetta%20v3.0.0%20Core%20Spine%20Specification.md), not by CLI behavior.
- Workbench and clone-to-insight practice follow [Research and Interoperability](../../docs/governance/genesis/RESEARCH_AND_INTEROPERABILITY.md).
- Names and boundaries follow [Semantic Alignment](../../docs/governance/genesis/SEMANTIC_ALIGNMENT.md).

This reference implementation is not a semantic authority. Inspection does not promote provisional or catalog-only entries into Core support or execution permission.

## Researcher path

From the repository root, the existing aggregate demonstration remains available:

```bash
pnpm install --frozen-lockfile
pnpm run sync
pnpm run demo
```

The inspection, positive verification and tamper-negative steps below complete a fixture-backed clone-to-proof path without introducing live ingestion or storage guarantees.

## Status

The workbench is **fixture-backed**. It exercises real Rosetta code over controlled bootstrap inputs.

It currently proves:

- deterministic guarded `builtin.echo` process stages;
- canonical receipt creation and Ed25519 signature verification;
- receipt-bundle closure verification;
- explicit `pass`, `block`, `deny`, and `fail` gate outcomes;
- detection of a signature-to-CID binding mismatch;
- detection of a missing receipt-bundle closure member;
- read-only OB1, Prism, and Mission Control projection contracts in the aggregate demo.

It does **not** prove production ingestion, durable database persistence, unrestricted execution, complete SHACL/RDF conformance, live OB1/Prism integration, or universal semantic interoperability.

## Build

```bash
pnpm install --no-frozen-lockfile
pnpm exec nx build rosetta-cli
```

The executable is emitted to `apps/rosetta-cli/dist/main.js`.

## Five-minute proof

Verify the current guarded bootstrap and receipt chain:

```bash
node apps/rosetta-cli/dist/main.js verify
```

Inspect the pass report as JSON:

```bash
node apps/rosetta-cli/dist/main.js inspect bootstrap-gate --scenario=pass
```

Inspect controlled non-pass outcomes through the same report shape:

```bash
node apps/rosetta-cli/dist/main.js inspect bootstrap-gate --scenario=block
node apps/rosetta-cli/dist/main.js inspect bootstrap-gate --scenario=deny
node apps/rosetta-cli/dist/main.js inspect bootstrap-gate --scenario=fail
```

Run the negative proof:

```bash
node apps/rosetta-cli/dist/main.js tamper
```

The tamper command clones fixture artifacts in memory, changes the signed CID binding, adds one nonexistent closure CID, and passes only when both defects are detected. It does not alter repository files or durable state.

## Commands

| Command                  | Output | Purpose                                                                     |
| ------------------------ | ------ | --------------------------------------------------------------------------- |
| no arguments             | JSON   | Preserve the original aggregate bootstrap output.                           |
| `demo`                   | JSON   | Emit the aggregate source, receipt, schema, cache, and projection snapshot. |
| `inspect bootstrap-gate` | JSON   | Emit the shared read-only guarded-bootstrap report.                         |
| `verify`                 | text   | Verify the pass gate, signed receipt, and receipt-bundle closure.           |
| `verify --json`          | JSON   | Emit the same verification result for scripts or notebooks.                 |
| `tamper`                 | text   | Run the bounded tamper-negative proof.                                      |
| `tamper --json`          | JSON   | Emit machine-readable tamper-detection evidence.                            |
| `help`                   | text   | Show command help and exit-code semantics.                                  |

The inspection command accepts either spelling:

```bash
--scenario=deny
--scenario deny
```

Accepted scenarios are `pass`, `block`, `deny`, and `fail`.

## Exit codes

- `0`: the requested proof passed, or all expected tampering was detected.
- `1`: verification failed, or an expected tamper detector did not fire.
- `2`: invalid command-line usage.

The tamper command returning `0` means the deliberately corrupted artifacts were rejected as expected. Its embedded verification results remain `ok: false` so the negative evidence is not mistaken for a valid artifact.

## JSON-first use

The aggregate demo, inspection report, and optional JSON verification modes are intended for piping into other research tools:

```bash
node apps/rosetta-cli/dist/main.js verify --json > /tmp/rosetta-verification.json
node apps/rosetta-cli/dist/main.js tamper --json > /tmp/rosetta-tamper-proof.json
```

The current TypeScript implementation is canonical. Future Python access should consume these stable schemas and command outputs through thin bindings or adapters rather than creating an independent semantic implementation.

## API parity

The matching HTTP inspection surface is documented in [`../rosetta-api/README.md`](../rosetta-api/README.md):

```text
GET /inspect/bootstrap-gate?scenario=pass
```

Both surfaces use the same shared `buildBootstrapGateInspectionReport(...)` contract.

## Verification during development

```bash
pnpm exec nx run ingress-refinery:lint
pnpm exec nx run ingress-refinery:typecheck
pnpm exec nx run ingress-refinery:test
pnpm exec nx run ingress-refinery:build

pnpm exec nx run rosetta-cli:lint
pnpm exec nx run rosetta-cli:typecheck
pnpm exec nx run rosetta-cli:test
pnpm exec nx run rosetta-cli:build
pnpm run governance:semantic
```

The focused CI workflow also validates `rosetta-api`, because issue #1200 requires API and CLI shape parity for the guarded-bootstrap report.

## Governing work

- [#1200: guarded-bootstrap inspect/report API and CLI parity](https://github.com/entif-ai/rosetta/issues/1200)
- [#1116: named demo slices](https://github.com/entif-ai/rosetta/issues/1116)
- [#158: canonical receipt family contract](https://github.com/entif-ai/rosetta/issues/158)
- [#1295: emergency halt and safe-hold](https://github.com/entif-ai/rosetta/issues/1295)
