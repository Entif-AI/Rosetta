# Rosetta Receipt Pack (RRP)

RRP is a draft SchemaPack for representing and checking Rosetta receipts and receipt-related promotion states. Its manifest is [pack.json](pack.json), and its public contract is [ROCK-3111-C](../../docs/RFCs/ROCK-3111-C-RRP-Pack-Filesystem-Contract-v0.2.0.md).

## Contents and prerequisites

The pack targets Rosetta Core 3.x. It exports [receipt schema](schema/receipt.schema.json), [receipt SHACL](shacl/receipt.shacl.ttl), [receipt vocabulary](vocab/rrp.ttl), and [promotion-state schema](schema/promotion-state.schema.json). Its [bootstrap walkthrough](examples/bootstrap-receipt-bundle.md) explains receipt and bundle closure at a conceptual level. The manifest declares test vectors under `test-vectors/`; see [test coverage](tests/README.md).

## Check and use

From the repository root, install the locked workspace dependencies and run `pnpm run packs:conformance`. The dedicated RRP receipt-vector suite is exposed through `pnpm exec nx run packs-rrp:test`. A successful generic conformance run verifies the manifest, Pack content ID, declared paths, dependency graph, and applicable schema shapes. It does not prove every example, SHACL constraint, signature, or release obligation.

## Conformance and limitations

This is a **draft**, not a released or certified Pack. The [acceptance contract](acceptance.md) records required positive and negative evidence. The RRP-specific tests remain distinct from generic Pack release readiness. See [CHANGELOG](CHANGELOG.md) for the current draft version.
