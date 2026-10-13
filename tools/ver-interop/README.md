# VER / Rosetta: first executable trace interoperability witness

**Status:** provider-free, fixture-backed interoperability evidence; not a VER Pack release.
**Owner:** Rosetta #1466, child of #1461.
**Authority:** Rosetta v3.0.0 Core Spine for Tile/Receipt/Tapestry semantics. The VER authors remain the scientific authority for VER. Nothing here implements or defines their independent VER Core.

This directory preserves the _byte-identical_ October 5, 2026, Rosetta-authored
`VER-ROSETTA-INTEROP-TRACE-0001` fixture and its original standalone
verifier, transport schema, and interpretation legend. See `SOURCE_SHA256SUMS`.
The fixture's recorded `sourceCommit` is the original construction baseline
`555503eead2f532bb133e3eaffd8f4dbacdf2a7a`. Do not rewrite that
historical provenance when a later Rosetta runtime verifies it.

## Independent checks, from the repository root

Build the public Rosetta dependencies, then execute the native witness:

```sh
NX_DAEMON=false pnpm exec nx run ver-interop:test
node tools/ver-interop/native-verify.mjs
shasum -a 256 -c tools/ver-interop/SOURCE_SHA256SUMS
```

The native script uses the _actual_ Rosetta constructors, payload validators,
Ed25519 Receipt verifier, bundle builder/closure verifier, and Tapestry
compiler. It checks seven independently reported surfaces:

1. transport schema and pinned source provenance;
2. all 15 native Tile bodies/CIDs and public payload schemas;
3. referenced parents, phase/action/measurement/evaluation relationships;
4. the narrowly bounded Receipt claim (not a VER diagnosis);
5. the detached signature and exact evidence digests;
6. native Receipt-bundle reconstruction and closure;
7. native Tapestry reconstruction.

The tests deliberately inject wrong measurements, dangling parents, switched
roles, absent post-correction effects, forged VER conclusions, altered
signatures and digests, damaged closure, and source-commit drift. One negative
re-signs an _overclaiming_ Receipt with a fresh valid test key to demonstrate
that **signature integrity does not grant scientific authority**.

For consumers without a Rosetta checkout, the original standalone Python
verifier is included:

```sh
cd tools/ver-interop
python3 verify-interop-trace.py interop-trace-0001.json --schema interop-trace-0001.schema.json
```

The Python script makes `jsonschema` and `cryptography` optional. If either
is missing, it explicitly prints `SKIP` for the corresponding verification.
Use the Rosetta-native witness for fail-closed, complete local verification.

## Suggested external test

The VER authors proposed this interface in #1461:

`Rosetta-native trace → independent VER adapter → independent VER Core → auditable VER result`

Provide `interop-trace-0001.json`, its schema and legend without a
Rosetta-authored expected VER diagnosis. Invite VER to report each unsupported
mapping, provenance loss, ambiguous evidence relation, scientific state,
counter-hypothesis, and nondiscriminating observation. Data insufficiency or a
local-corrective explanation is an acceptable scientific outcome.

The original trace is **constructed fixture data** for a sensor-calibration
story. Native reconstruction does not establish that any sensor, external
service, or physical calibration ran. Its timestamp is constructor metadata,
not evidence of real event timing. Even a valid Receipt attests only its
bounded statement, not VER explanatory insufficiency or transition authority.
The current trace also does not by itself satisfy the wider source-registry
conformance obligations (repository profiles, external identifiers, rights,
source drift, and corrections).

The v4-era integration issue and October 5 scientific crosswalk distinguish
historical VER v4 from the later public v5 architecture. This exchange freezes
**no `ver.*` schema**, modifies **no `rosetta.*` Core kind**, imports no
unpublished VER Core algorithms or benchmarks, and claims no author
endorsement, partnership, scientific validation, Pack certification,
promotion, or release readiness. #1466 scientific review and #790 generic
Pack-gate coverage remain separate downstream obligations.
