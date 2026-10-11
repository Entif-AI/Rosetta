---
id: entif:rrp-receipt-vectors
task: T1118
status: in-progress
depends: []
awaits: []
specs: []
issues: [1118, 790, 158]
---
# Execute RRP receipt pass/tamper vectors

Make the two receipt vectors already declared by `packs/rrp/pack.json` executable through the existing Pack test target. Reuse the canonical Core/store/receipt signing and closure APIs. Do not introduce a Core kind, schema, receipt verdict, Pack-gate dialect, SHACL claim, or generic root/changelog/migration closure.

Source-owner authority: #1118 owner comments dated 2026-06-06, 2026-06-12, and 2026-07-11 explicitly require the declared positive and tamper-negative RRP receipt vectors to be exercised rather than merely listed. #158 remains canonical receipt-family authority; #790 remains generic Pack-gate authority.

## Validation

- [x] Pre-fix proof shows the declared receipt vector files are not executable receipt evidence.
- [x] Positive vector constructs, signs, verifies, closes, and verifies through existing exported receipt/Core/store primitives.
- [x] Tamper vector fails for the declared existing verifier reason without a custom receipt dialect.
- [x] `pnpm exec nx test packs-rrp` passes from the branch worktree.
- [x] `pnpm exec nx run packs-rrp:conformance` passes with recomputed RRP `pack_id`.
- [x] `pnpm exec nx test rosetta-receipts` passes.
- [ ] `pnpm verify` passes.
- [x] `git diff --check` passes.
