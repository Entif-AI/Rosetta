# M3 Ultra development compute wrapper

Version 0.1.0. #1744, `WRAP_EXISTING_INTERFACE`: OpenSSH plus existing proof
runners, with bounded JSON outcomes. Run from a clean, committed laptop worktree.
The worker executes in a clean checkout of the same exact commit on the Ultra.
It reuses the owned loopback containers; it never starts, stops or replaces them.
No laptop graph/model fallback exists.

Host-local `~/.config/rosetta/compute.json` (keep outside Git):

```json
{"targets":{"m3-ultra":{"checkout":"/absolute/path/to/revision-matched/checkout","node":"/absolute/path/to/node"}}}
```

Use the existing host-local `m3-ultra` OpenSSH alias for host, account, identity
and known-host mapping. The wrapper enforces strict host-key checks, public-key
noninteractive authentication, no agent forwarding and its own transient session.
It does not log SSH configuration or authentication material.

Ultra host-local `~/.config/rosetta/compute-worker.json`:

```json
{
  "path":"/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
  "python":"/absolute/path/to/accepted/graphiti/environment/bin/python",
  "inference":{
    "baseUrl":"http://127.0.0.1:1234/v1",
    "model":"explicit-loaded-chat-model",
    "embedder":"explicit-loaded-embedding-model",
    "reranker":"explicit-loaded-reranker-model"
  }
}
```

Reuse the accepted Python environment from `tools/trace-temporal/README.md`.
The inference section is optional for deterministic proof/model-off. All model
calls use the explicitly configured credential-free loopback LM Studio route.
Graphiti and both Falkor runtimes remain colocated on the Ultra. Preserve the
6.0.1 operational / 4.20.7 semantic compatibility split.

Install the frozen workspace dependencies on both checkouts. Synchronize the
feature commit through normal Git fetch and a detached remote worktree; do not
reset a user's checkout. Then:

```sh
node tools/compute/run.mjs catalog
node tools/compute/run.mjs doctor --output .axi/compute-doctor-1
node tools/compute/run.mjs run --job akasha.build --output .axi/compute-build-1
node tools/compute/run.mjs run --job akasha.operational.prove --output .axi/compute-operational-1
node tools/compute/run.mjs run --job akasha.kinematics.prove --output .axi/compute-kinematics-1
node tools/compute/run.mjs run --job akasha.temporal.prove --output .axi/compute-temporal-1
node tools/compute/run.mjs run --job akasha.semantic.prove --output .axi/compute-semantic-1
node tools/compute/run.mjs run --job akasha.model-off --output .axi/compute-model-off-1
node tools/compute/run.mjs run --job akasha.live-fixture.prove --output .axi/compute-live-fixture-1
```

Every output directory must be fresh and ignored. A flushed `request.json`
preserves the run identity and original revision before remote dispatch, even
when the laptop loses the acknowledgement. `result.json` contains the
orchestration/compute identities, revision, runtime, resource samples, timings,
failure class and evidence manifest. Returned files live under `remote/`; each
file's bytes and SHA-256 are independently verified before writing the bundle.
Accepted historical receipts are never output targets. Evidence is bounded to
16 MiB; credentials, user paths and raw operational evidence are not public Git
artifacts. Keep local evidence private unless separately screened.

Doctor creates a loopback-only forward, requires actual RESP PONG and closes only
its own SSH process. Jobs execute remotely through the fixed catalog; callers
cannot provide shell commands, arbitrary arguments or environment variables.
Whole-host loopback exposure is not claimed: unrelated existing services are
outside this wrapper's ownership.

Authentication/host-key/transport/tunnel errors, service loss, runtime mismatch,
scratch collisions, inference unavailability and task failures remain distinct.
The worker refuses any preexisting scratch graph before dispatch, uses a host-wide
fixture lock, preserves source/accepted receipt hashes and removes only newly
owned scratch graphs. Interrupted or stale lock ownership requires reconciliation.
No automatic takeover, blind replay or cleanup of preexisting graphs occurs.

After lost SSH acknowledgement, read the local `request.json`, reconcile the
remote run/lock and collect surviving evidence rather than replaying a graph job:

```sh
node tools/compute/run.mjs collect --run-id RETURNED_RUN_ID --output .axi/compute-recovered-1
```

Recollection also requires the original revision-matched checkouts. Persistent
service memory/CPU samples, worker process resource use, remote job elapsed time
and laptop orchestration elapsed time are separately attributed. These receipts
are development topology proof, not a blended performance benchmark or promotion.

```sh
node --test tools/compute/*.spec.mjs
```

The TRACE-LIVE job admits three producer families through the source/normalization
adapter and proves operational import/rebuild from a synthetic action fixture.
It reports fixture maturity explicitly; it does not claim real producer or E2E
acceptance. See [the adapter contract](../trace-live/README.md).
