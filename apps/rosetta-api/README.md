# Rosetta API

`rosetta-api` exposes read-only bootstrap inspection endpoints for the current Rosetta prototype.

## Status

The API is **fixture-backed**. It exposes deterministic or bounded proof artifacts from the repository's current bootstrap implementation. It is not a production ingestion service, mutation API, recorder, redrive service, durable cache, or execution authority.

## Start the service

```bash
pnpm run api
```

The default Nx Node target starts the service from the current workspace build.

## Routes

- `GET /health`: service health.
- `GET /registry`: fixture-backed bootstrap source registry.
- `GET /demo`: aggregate bootstrap provenance demo snapshot.
- `GET /inspect/bootstrap-gate`: read-only guarded-bootstrap proof report.
- `GET /schemas`: schema catalog inspection endpoint backed by `@entif-ai/rosetta-schemas`.

### Guarded-bootstrap scenarios

The inspection route accepts one deterministic scenario:

```text
/inspect/bootstrap-gate?scenario=pass
/inspect/bootstrap-gate?scenario=block
/inspect/bootstrap-gate?scenario=deny
/inspect/bootstrap-gate?scenario=fail
```

Each response uses the same `buildBootstrapGateSnapshot(...)` report family as the CLI and includes:

- ordered gate steps;
- top-level `status` and `verdict`;
- Guard effect and reason;
- available artifact CID joins;
- receipt-bundle verification;
- closure-artifact presence;
- explicit `fixture-backed` readiness language.

`pass` proves the bounded `builtin.echo` path. `block`, `deny`, and `fail` are controlled negative fixtures. None of the scenarios grants authority or performs durable writes.

Example:

```bash
curl 'http://localhost:3000/inspect/bootstrap-gate?scenario=deny'
```

## Inspection boundaries

`/schemas` is not a runtime validation, mutation, or message-handling endpoint. It preserves catalog `exposureStatus` values so reserved, fixture-only, and downstream-only schemas remain visibly non-operational.

`/inspect/bootstrap-gate` is likewise inspection-only. It does not execute arbitrary tools, mutate the recorder, write to the canonical cache, refresh catalogs, redrive work, or enqueue side effects. During a future safe-hold, bounded inspection may remain available only under the governing halt policy.

## Verification

```bash
pnpm exec nx run rosetta-api:lint
pnpm exec nx run rosetta-api:typecheck
pnpm exec nx run rosetta-api:test
pnpm exec nx run rosetta-api:build
```

See [`../rosetta-cli/README.md`](../rosetta-cli/README.md) for the command-line verification and tamper-negative workbench.
