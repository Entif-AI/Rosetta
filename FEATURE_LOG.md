# Akasha early-wave implementation

Branch: `codex/akasha-early-wave`. Base: `origin/main` at `48bbd83`.

## Mission and authority

Implement ready public Rosetta leaves from the Akasha roadmap on one review branch.
The live GitHub issues are the acceptance contracts. The supplied roadmap is
sequencing evidence, not authority to change Core semantics or publish private
operational material. Publication posture: public contracts, synthetic fixtures,
reference transformations and conformance evidence only.

Read the public/private boundary and authority-closure doctrines, Core Spine,
applicable package contracts and live issues before implementation. Protected
authority was resolved separately; no protected mechanisms belong in this log.
No new Core kind, live/private capture, model call, or execution permission is
needed for the initial fixture lane.

## Ordered scope and proof

1. #1693 / #528: repair shared JCS serialization. Red integer-key regression,
   then RFC 8785 ordering, Unicode, numeric and escaping vectors; repeatable
   canonical bytes and existing consumers remain green.
2. #1665: rights-safe synthetic source bytes, immutable manifest, existing
   `source.*` artifact identities, explicit capture/source/recording times and
   unknown metadata. Offline digest and tamper checks before normalization.
3. #1666, after #1665 and #1693: bounded model-free structural normalization
   in ingress-refinery. Hoisted invariants, exact payload references, explicit
   snapshot deltas, supplied relationships, source lineage and loss report.
   Golden bytes, repeated-run equality, reconstruction and malformed-input proof.
4. Evaluate the next ready leaf after these gates. #1688 donor audit must pass
   before donor-derived browser/control implementation. Graph work requires the
   source and normalization gates plus an actual graph-backed acceptance proof.

## Invariants

- Source bytes remain independently available and authoritative as evidence.
- Derived interpretation never replaces source evidence or creates witnesses.
- Source sequence and separate time roles never imply causal relations.
- Public fixtures contain authored synthetic data, no private captured payload.
- Reuse rosetta-canon, source-substrate and ingress-refinery ownership.
- Existing text normalization stays separate from JSON canonicalization.
- No force push; preserve both histories if remote state changes.

## Operating state

Initial authority preflight complete for #1693 and #1665. Clean isolated worktree;
unrelated editorial changes remain in their original checkouts. Dependencies use
the repository's Node 24.14.1 and frozen pnpm lockfile.

The installed workflow skill references feature-lease tooling that is absent
from this repository. No automated lease acquisition/validation is claimed.
Recovery uses this bounded log, ordinary commits, remote-head verification and
retained validation logs. Private session material stays outside the public tree.

## Next safe step

Commit/push this checkpoint. Add failing #1693 vectors and #1665 fixture checks
before implementation. Open one PR after the first issue passes, then push and
append a review delta after each subsequent completed issue.
