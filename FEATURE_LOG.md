# T1118 RRP receipt vector execution

Branch: `codex/1118-rrp-receipt-vectors`
Base: `origin/main` at `2a8f98fccec7c413e0786e923853c383f61861e8`
Issue: #1118

## Authority and scope

Public conformance-only implementation. #1118 explicitly owns the RRP exemplar and directs the declared receipt pass/tamper vectors to become executable. #158 owns canonical receipt semantics; #790 owns generic Pack release-gate composition. No protected bridge edge for #1118/#158 was found, so this change stays entirely inside public fixture/conformance semantics.

The branch may change only the RRP vectors, their Pack-target test wiring/documentation, the content-derived RRP `pack_id`, this plan/log, and any minimal private test helper required to invoke existing exported primitives. It must not add Core kinds, schemas, public ontology, SHACL claims, generic Pack gate semantics, release/promotion authority, or full #1118 closure.

## Continuity

The repository currently has no native feature lease/acquire/checkpoint tooling. Isolation is provided by a dedicated git worktree and unique remote branch. Before each push, fetch and verify the remote branch SHA rather than claiming a lease.

## Validation

Red proof first, then focused Pack/RRP/receipt tests, `pnpm verify`, and `git diff --check`. Record exact command results here before PR creation.

Red proof: `pnpm exec nx test packs-rrp --skip-nx-cache` first built the Core/store/schema/receipt dependency chain from this cold worktree, then ran 8 Pack tests. Existing tests passed 7/7; the new RRP vector execution test failed because the checked-in note stub has no `signedReceipt`. This proves the declared vector path is currently hollow without depending on a missing build artifact.

Green focused proof: the two declared vectors now serialize actual existing Core Tile / signed `rosetta.receipt` evidence. The positive vector passes Tile integrity, Ed25519 signature verification and receipt-bundle closure. The tamper vector changes the signed receipt payload while preserving its CID/signature and omits the subject closure Tile; existing verifiers return exactly `Tile canonical representation drifted from payload.`, `Tile CID no longer matches canonical payload.`, and `Missing closure member: cidv1-sha256-939e5dd363c7391c50121935e2d3441f2cd36f0959fb0014787fe9dfa400032f`.

Final test placement avoids draft #1824's generic validator-spec file: RRP receipt execution lives in `tools/pack-conformance/rrp-receipt-vectors.spec.mjs`, while the existing `packs-rrp:test` target runs both the generic Pack suite and the RRP-specific evidence suite. This also avoids Vitest's repo include silently skipping a spec under `packs/`.

Focused commands: `pnpm exec nx test packs-rrp --skip-nx-cache` passed 9/9 across two files after cold-building six dependency targets; `pnpm exec nx run packs-rrp:conformance --skip-nx-cache` passed all four Pack roots; `pnpm exec nx test rosetta-receipts --skip-nx-cache` passed 40/40. RRP Pack ID recomputed through the existing algorithm to `cidv1-sha256-0a9eab0fc5de79b2a03c8fabae24a1009eb3c2930feddfd9a31326b1648f1c89`. `git diff --check` passed.

## Next safe step

Checkpoint the focused green implementation, then run `pnpm verify` and final diff/status checks before opening the draft PR.
