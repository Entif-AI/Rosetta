# AuthZ v0.1 conformance

This public, deterministic harness implements the [#1749](https://github.com/Entif-AI/Rosetta/issues/1749) adversarial matrix under [#630](https://github.com/Entif-AI/Rosetta/issues/630). It consumes the exported Authority Envelope schema/Profile, Guard evaluator and legacy migration adapter from #1746–#1748.

All three paths are **fixture-backed**. The harness exercises real package exports and isolated filesystem effects. It does not establish production MCP, worker/A2A or write-admission conformance. Those consumers retain their own authorities and integration tests.

## Run

Use the repository's Node version and pnpm:

```sh
pnpm exec nx run authz-conformance:test
pnpm exec nx run authz-conformance:report
```

Nx builds the consumed packages before testing. The second command writes `dist/authz/conformance-v1.json` and prints a bounded summary. Exit zero means every selected case/path passed; a non-pass full report exits nonzero. Reports include the inspected Git head and input fixture SHA-256. Run from a committed checkout when binding evidence to a Git head.

For a bounded subset, import `runAuthzConformance` from `tools/authz/conformance.mjs` and pass case IDs. Unknown IDs return `unsupported`. `summarizeConformance` keeps `fail`, `unknown` and `unsupported` distinct; unrecognized consumer results count as `unknown` and cannot produce a pass.

## Consumers and ownership

| Path | Executable fixture | Production owners |
| --- | --- | --- |
| `guard-axi` | Current Guard evaluation and IAM compatibility projection before provider invocation; cached capability discovery stays broader than authority | #1674, #1514 |
| `worker-a2a` | Historical `iam.delegation` CID resolved into the current source graph; migration adapter verifies the attenuated projection before worker dispatch | #1684, #1047 |
| `write-admission` | #994-shaped propose → normalize → authorize → ground → checkpoint → apply → observe → receipt → project sequence | #994 |

The write fixture persists the checkpoint and provider effect in a new temporary directory using exclusive file creation, `fsync` and exact-byte readback. Checkpoint creation precedes apply, and authority/request binding is checked again before mutation. This proves the bounded local fixture; it does not test production crash recovery or a storage backend. Temporary files are removed after their hashes and readback Observations enter the report.

Safe-hold (#1295) and identity-sensitive gates (#1296) remain independent resolver inputs to the existing evaluator. The harness represents their current states; it does not implement those owners' services. Failures identify the consumer owner and must be routed there or to the schema/evaluator/migration owner, preserving #630 semantics.

## Mandatory matrix

Each case runs through all three paths: **15 cases × 3 paths = 45 combinations**. Cases with transitions contain multiple attempts.

| Fixture case | Required behavior |
| --- | --- |
| `prompt-self-grant` | Preserve intent; missing externally resolved authority denies |
| `delegation-amplification` | Broader child target, effect or delegation ceiling denies |
| `expiry` | A previously allowed operation denies after expiry |
| `revocation-broader-invalidity` | Parent revocation and child invalidity each override prior validity |
| `target-drift` | Authority for one target cannot authorize another |
| `policy-frontier-drift` | Policy and authority-source frontier changes reject stale projections |
| `safe-hold` | A later independent hold blocks ordinary execution |
| `identity-sensitive-gate` | The independent gate is required and can permit execution once satisfied |
| `provider-scope-escape` | The same broader provider supports A and B; only in-envelope A reaches an effect |
| `cached-discovery` | Cached visible tools cannot bypass current handler-time authority |
| `empty-intersection` | Disjoint ceilings deny rather than union rights |
| `imported-self-authorization` | Imported/model assertions do not create authority |
| `integrity-without-validity` | A freshly verified signed projection still denies on current source revocation |
| `receipt-decision-replay` | Prior success Receipt and decision each fail as authority for a new request |
| `standing-delegation` | Three distinct bounded actions execute without an approval artifact |

## Evidence and verification

The report preserves current authority/source/lineage, actor evidence, target and requested effect, policy/context/frontiers, independent gate state, exposed capability manifests, Core intent Observations and Actions, current Evaluations, compatibility decisions, worker delegation disposition, checkpoint, ToolCall, effect Observation and Receipt.

Each attempt includes its actual artifact set. A reader can load that set and the Receipt into `InMemoryTileStore`, then run `verifyReceiptBundle(buildReceiptBundle(receipt), store)` independently. The tests do this for every combination and verify every Tile's integrity. Signed attestation stays alongside the projection; the signed payload is unchanged and matches the projection evaluated by the consumer. Signature/digest verification attests bytes, never authority.

Every deny compares before/after filesystem hashes and provider-call, worker-dispatch, mutation-write and projection counters. Passing requires no downstream effect. Every allow requires an observed provider effect and verifiable Receipt closure. Standing delegation is proven by three successful, distinct Actions, their current allow decisions and closed execution evidence with no `iam.approval_handoff`; a hardcoded approval count is not used as proof.

Capability manifests deliberately expose both `write` and `delete`. Provider scopes also cover another target and additional effects, while delegated authority remains narrower. Relevant task context and visible capabilities are evidence/mechanical ceilings, never grants. The credential is entirely synthetic; no privileged service or secret is required.

**Agent Interface Gate:** `WRAP_EXISTING_INTERFACE`. This fixture wraps the exported Guard/migration boundary and produces bounded JSON summaries with a complete file report. It introduces no authority store, Core kind, new universal AuthZ AXI or competing production runtime. The Authority Envelope remains a governed projection in the existing `TileEnvelope`; decisions and Receipts remain evidence.
