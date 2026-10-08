# Local canonical write admission (#994 / #1765)

This implementation narrows #994 to one local authority-write contract. It composes existing primitives; #994 retains wider bootstrap mapping and adoption. Owners inject the current resolver, independent workflow/startup policy, actual target adapter and grounding resolver. These raw operating mechanics are NOT_AGENT_FACING.

| Step | Required input and artifact | Stop condition |
| --- | --- | --- |
| Propose | Bounded typed write intent | No canonical intent |
| Normalize | Core Run and Action with typed intent, subject, operation, effect and target | Invalid shape, integrity or run/action binding |
| Authorize | Current #1758 / #1747 Evaluation, separate workflow.policy_decision and #1748 IAM evidence projection | Current deny, workflow/startup deny, absent or mismatched IAM linkage |
| Ground | Observation binding proposal and resolved current source frontier | Missing provenance, policy or frontier |
| Checkpoint | Durable Observation binding proposal, revision, frontier, Evaluation and grounding; fsync and exact readback | Persistence/readback failure |
| Apply | Second current check after checkpoint, matching checkpoint frontier, then actual target mutation | Revoke/deny or revision change before apply |
| Observe | Actual target readback Observation binding proposal and a successful match | Drift, incomplete result or ambiguous effect |
| Receipt | Canonical lifecycle Receipt binds Run, Action, authority/workflow/IAM evidence, checkpoint, readback and check; persist/read back before success | Closure persistence failure: owner must reconcile before retry |
| Project | Queue reference and observable queue outcome after canonical closure | Queue failure remains observable; no invented target rollback |

An allow is evidence within this sequence. It cannot jump grounding or checkpoint, substitute a historical snapshot, or create authority. The compatibility IAM decision links the fresh Evaluation and carries the same action, subject and target. Workflow policy narrows independently of the execution authority. A request or model cannot provide the owning adapter or policy objects.

`pass` requires matched target readback and durable Receipt closure. `deny` means current authorization or narrowing refused before apply. `block` covers unresolved grounding/checkpoint and a changed checkpoint frontier. `fail` covers malformed input or pre-apply operational failure. `partial` with effect `unknown` covers attempted apply without established readback; reconciliation is required. A Receipt persistence exception prevents a success acknowledgement even when target readback succeeded. Evidence/audit writes are distinct from the governed target effect.

The reference journal is local. Its hash-addressed files use exclusive creation, fsync and exact byte readback. The second current check makes an acknowledged causally prior revoke visible before effect; it does not promise distributed atomicity between external provider execution and authority mutation. Projection workers and wider store rollout remain deferred to their owners.
