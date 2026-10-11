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

## Next safe step

Checkpoint the red test and cold-build dependency wiring, then replace only the two note stubs with fixture data serialized from existing Core/receipt/store primitives and make the test green.
