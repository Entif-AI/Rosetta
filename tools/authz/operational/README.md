# Operational AuthZ v0.2 reference proof

#1762 exercises the exported #1758 state/resolver, #1759 Ed25519 workload
bridge, #1761 governed mutator, #1747 evaluator, #1760 credential mediator,
#994/#1765 write admission and the existing #1771 loopback API handler. It
imports no #1749 fixture adapter and constructs no caller-supplied current
authority graph. Every target authority mutation uses governed admission.

An independently installed, bounded operator configuration establishes source
authority. Its pinned signature authenticates the exact configuration witness;
the signature, actor identity, Observation and Receipt create no rights.
The workload and operator use runtime-generated signing keys. The reference
provider credential and transport capability remain in host closures.

```sh
NX_DAEMON=false pnpm exec nx run authz-operational:test --skip-nx-cache
node tools/authz/operational/proof.mjs --out dist/authz/operational-v02
```

The first command builds consumed packages and the actual API, then runs the
complete scenario and missing/corrupt readback negatives. The second retains
the generated proof, authority history, actual provider files, authenticated
public source witnesses and durable admission evidence. Its output directory
must be new or empty; a retry must use a new directory or inspect existing
evidence, rather than overwrite target state. Run it from a committed checkout
to bind the evidence to a source SHA. `verifyOperationalProof(directory)`
checks retained bytes, signatures, actor binding, current authority, independent
root survival, provider digest/count, schema/integrity, Receipt and parent
closure. This verifies retained execution evidence at its recorded time; it
does not reinstall that state as live authority.

The scenario grants a standing root and attenuated child with required actor
evidence. A broader credential supports A, A2 and B. Real HTTP A and A2 each
append a durable provider record, using the same authority revision with zero
intervening authority mutations and no approval-handoff artifacts. B is
refused; amplified delegation leaves the authority revision unchanged. A
governed revoke advances revision 4 to 5. A later request requires revision 5
and fails while the credential remains mechanically valid. The old envelope,
allow Evaluation, successful Receipt, cached discovery and mutation Receipt
each fail as candidate authority. Replaying the original grant reconciles its
historical acknowledgement without restoring the child. An independent root
still resolves and allows A.

Every HTTP attempt measures the actual provider file count and SHA-256 before
and after; a probe Observation links that measurement to its execution Receipt.
Denials must preserve both values. Successful effects require measured provider
readback, a persisted pre-apply checkpoint and closed canonical lifecycle
Receipt. Verification rejects a removed readback and a payload changed under
an old CID. An exact-material scan checks exported responses and retained
files for the generated secrets, alongside forbidden secret-bearing fields.
Private runtime keys and credential bytes are never written to the proof.

The first integrated closure check exposed a missing provenance parent on
mutation refusal. The same bounded issue existed in provider-metadata refusal.
Both owners now persist the initial Evaluation before deriving the refusal;
red/green owner tests preserve this requirement. These repairs preserve the
existing denial and no-effect behavior.

AXI: `WRAP_EXISTING_INTERFACE`. The actual interface is the existing bounded
API, selected because #1674 retains its donor-first #1688 dependency. No second
MCP server, universal AuthZ AXI, Core kind or role-based rights ontology is
introduced. Raw state and mutation remain `NOT_AGENT_FACING`.

Maturity is **integration-backed local reference**. This demonstrates one host's
revision fencing and controlled signed workload/provider sources. Production
identity, ingress, credential lifecycle, distributed transactions and the MCP
donor path remain with their existing owners. Safe-hold and identity-sensitive
conditions remain independent evaluator gates; this reference operation does
not trigger an identity-sensitive overlay. No merge, issue closure, release,
promotion or production deployment is authorized by these results.
