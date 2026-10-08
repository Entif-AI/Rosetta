# Akasha remote compute and live-source integration

Work contract: #1744, then the independent executable slice of #1685. One writer
on `codex/1744-akasha-remote-compute`, based on `c7dd87ea`. No merge or issue closure.

## Authority and validation

Public write classification: public development/interoperability wrapper and
source adapter. Host mappings, credentials, local paths and raw evidence remain
outside Git. Core Spine, publication boundary, authority closure, TRACE-SRC,
TRACE-NORM and existing projection contracts preserve their meaning. IPR-0207
was reviewed as historical context; no private storage policy is implemented.
The roadmap is advisory; current source/tests determine executable maturity.

AXI disposition: WRAP_EXISTING_INTERFACE. OpenSSH transports a narrow job catalog;
existing proof runners retain graph/source/temporal authority and validation.

No lease tooling or feature-workflow directory exists at this base. The working
constitution requires one writer. Use isolated checkouts, ordinary append-only
pushes, remote-SHA fencing and remote readback; stop on divergence. This is not
a claimed distributed lease.

Validation before implementation: red/green contract and process tests; existing
Akasha conformance; actual strict noninteractive SSH, forwarded RESP health,
Ultra runtime/revision identity, all four proof runners, model-off degradation,
transport/provider/version/container/collision negatives, source digest parity,
evidence readback and authority/diff review.

## Observed baseline

- Strict noninteractive SSH succeeds; both hosts have main `c7dd87ea`.
- Apple M3 Ultra, arm64, macOS 26.2, 28 CPUs, 96 GiB.
- Owned operational FalkorDB 6.0.1 and semantic FalkorDB 4.20.7 use loopback.
- Graphiti's existing disposable Python environment and LM Studio are available.
- Unrelated preexisting LAN-bound services are preserved; no whole-host
  loopback-only claim is made.
- Laptop dependency build passes. Historical accepted receipts remain unchanged.

## Focus and continuation

Implement and test the compute wrapper. Push a verified checkpoint before setting
up its revision-matched remote checkout. After remote acceptance passes, inspect
the real TRACE-LIVE producer prerequisites and implement the ready adapter slice.

## Compute wrapper checkpoint

BIOS reloaded at user request to 0.4.1. Active substrate: LOCAL_DURABLE_WORKTREE;
no worker Minutes, Drive writes, timer checkpoints or redundant bundles.
Compute contracts/process/transport/evidence tests: 26 passed. Includes real
local RESP protocol validation, tunnel death, timeout/cancellation, unavailable
remote host, version/ownership/bind/collision/provider refusal and evidence
integrity. Nx sync/check, governance authority and diff checks pass.
Next: provision the revision-matched Ultra checkout, then doctor and all proofs.
