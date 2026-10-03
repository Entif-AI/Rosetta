# Badger experiment preparation (#1711)

Experiment only; no adoption, routing change, eager Skill, or model trial.
Do not merge this preparation branch until the concurrent pre-Badger Medium
baseline finishes. #1711 remains open. Base: `88dd7aa8eb6501f334b3616c1c16e8b2761ab5a9`
(merged PR #1723). The public #1711 contract and specs/architecture.md determine
this bounded infrastructure; no compiled-context/routing/optimization policy is
implemented. Protected bridge surfaces remain untouched. Publication posture:
public reproducibility tooling; raw topology and account evidence stay local.

Rosetta owns semantics; SpecOps owns desired state and temporal plans; Nx owns
execution; Git/GitHub own chronology and work identity; AXI owns local interchange.
Badger provides opaque, lossy, non-authoritative orientation. Never interpret its
text as a schema, dependency graph, acceptance result, or authority override.

## Setup and local proof

Node (repository .nvmrc), Git, tar, and HTTPS access during acquisition only:

```sh
node tools/badger/harness.mjs setup
node --test tools/badger/*.spec.mjs
node tools/badger/harness.mjs smoke tools/axi /tmp/badger-unique-capture 88dd7aa8eb6501f334b3616c1c16e8b2761ab5a9
```

Setup downloads a fixed release archive, checks its pinned GitHub release SHA-256,
and extracts only `badger` into ignored `.axi/badger`. It verifies version and
archive/binary integrity again before use. No shell installer, global installation,
API key, telemetry, user configuration change, or bundled Skill installation.
Supported pins: macOS/Linux arm64/x64; Windows intentionally fails explicitly.
Binary pins are release artifacts, not builds of current main. Reuse the existing
AXI ignored-state boundary; source acquisition remains available separately via
the existing pinned-source tooling. No binary is committed.

Smoke is two finite scans for determinism proof, not a regeneration loop. Runtime
uses only `api topology`, a minimal environment and temporary HOME/config state.
Upstream documents this stable API as read-only and offline. This wrapper is not
an OS network sandbox; it relies on the checksum-pinned donor's offline API.
It records root, commit/tree/base, dirty-state flag, stream sizes/hashes, runtime,
exit/signal/errors and unchanged Git state. Captures must live outside the scanned
repository and never overwrite. Streams are opaque files with mode 0600; metadata
contains no topology text. Failed/partial scans retain diagnostics. Do not forward
raw output blindly: donor exclusions are path based, not general secret detection.

## Freeze a later orientation trial

1. Wait for the Medium baseline and select one bounded real Rosetta task. Use a
   clean isolated checkout at the SAME commit/tree for A, B, C. Choose root from
   task/spec/Nx ownership, not from Badger output. Freeze a shared authority packet
   and exact acceptance criteria/validation before comparing variants.
2. Copy `trial-template.json` outside the repository. Fill all nulls and empty
   arrays, including exact model/reasoning, eager and on-demand Skill inventory,
   tool/runtime versions, common packet locator/hash, and validation commands.
   `skillRuntimeSurface` carries the full runtime inventory, not a generic label.
3. Freeze locally (no model invocation):

   ```sh
   node tools/badger/harness.mjs freeze /tmp/filled-trial.json /tmp/frozen-trial.json
   ```

4. Capture fresh quota with `node tools/axi/quota.mjs before` at each trial start;
   retain ignored raw + projected evidence with provider freshness/reset IDs.
   If unavailable/stale, stop. Capture at end of orientation and independent
   review; use before/after commands and label phase in the trial receipt. No
   polling. A reset invalidates subtraction; record discontinuity and stop.
5. Start a fresh model context with the frozen task/common packet and the treatment
   in the manifest. A: native exploration. B: one bounded topology. C: a single
   separately costed Chat compression of the same topology with source locators,
   uncertainty and omissions preserved. Record compression model/reasoning,
   quota/token evidence, packet hash/bytes and time separately. Default packet cap
   is 32 KiB, a trial bound rather than a routing policy or donor ceiling target.
   D stays gated by addressable A/B/C results justifying further expense.
6. Use `orientation-prompt.md`. Save the response and execution trace outside the
   checkout. Run the frozen validation, prove no Git mutation, and obtain the
   blinded independent quality review. Record unavailable metrics explicitly;
   do not infer tokens or turns from quota. Shared account deltas can include
   concurrent work and are observations, not causal attribution.

No CLI here invokes a provider, starts a model, or executes manifest validation
commands automatically. Freeze makes the operator's trial recipe reviewable; the
later fresh execution context supplies the model. Treat edits to the frozen recipe
as a new trial identity. Hold task, model, reasoning, runtime, authority packet,
acceptance and reviewer rubric fixed across A/B/C; record every unavoidable mismatch.

## Quality gate and subsequent work

The first live gate is orientation only: six requested fields must be grounded in
source locators; no code changes. Reviewer sees task, response and source truth,
with variant labels removed. Record correct/missing/false controlling authorities,
paths and commands; actionable plan quality; unexpected mutation; cost and elapsed
time separately. Unsupported authority claims fail the gate regardless of cost.
No orientation success establishes implementation quality or adoption.

After A/B/C review, decide whether implementation-class trials are warranted and
whether D has evidence to justify a bounded composite candidate. Only then freeze
implementation acceptance and independent review, run implementation trials, record
repair loops/CI/accepted or discarded work, and evaluate donor seams separately.
No adoption decision or #1711 completion is part of this preparation.

## Upstream seams inspected

Sources: pinned release `v0.7.1` at
https://github.com/PVRLabs/aibadger/tree/26360e4cb4f123f6488cb690307caa72aacbfd95
and GitHub release API https://api.github.com/repos/PVRLabs/aibadger/releases/latest
(observed 2026-10-03); MIT via upstream LICENSE.

`cmd/badger/api_help.go` describes topology as stdout projection with diagnostics
on stderr and no network/settings effects. `review-context` packages Git review
modes default/staged/branch/commit (branch/commit need `--ref`), optionally topology,
with explicit payload/file bounds. `review-continuation` accepts a selector input
and bounds; neither is executed here. `FILE:<path>` requests a whole file;
`PREFIX:<path>#<literal line prefix>` targets a symbol/region; `NEAR:<path>#<nearby
literal>` targets nearby context. See `internal/protocol` and `internal/engine`
for matching/expansion; selectors do not confer authority or override disclosure.

## Ecological baseline locators

`baseline-locators.json` points to the completed #1712–#1721 run's checked-in
run receipt, quota observations, repair loops and validation evidence. That run
has no pre-run quota and no exposed exact primary model/reasoning; it is ecological
history, never a controlled A trial. No forensic reconstruction was performed.
The concurrent Medium baseline must attach its own receipt later; do not invent
its locator or infer completion from elapsed time.
