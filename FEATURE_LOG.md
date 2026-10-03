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

#1665 complete for review: nine authored synthetic events and four full object
snapshots retain exact source bytes separately from capture/episode metadata.
The manifest pins 5,779 bytes and SHA-256
`60e556bb5144659a6f2453e67a68a7d52193d6da41c3f18c010dc672e41c86f1`.
Five existing source artifact kinds are linked by deterministic CIDs. Unknown
client/parser/model metadata remains explicit. Source/capture/observed/recorded
time roles remain separate; envelopes use the declared fixture recorded time.
Byte corruption, metadata drift and artifact-identity drift fail verification.
Owner suite: 7 tests pass; source-substrate build passes. No normalization,
semantic interpretation or live capture occurs in this source implementation.

#1693 complete for review: integer keys now serialize directly in UTF-16 lexical
order; RFC sorting/escaping/numeric vectors and invalid-Unicode rejection pass.
Red integer-order regression captured before repair. Focused suite: 16 tests;
owner typecheck passes. Existing core/CID/source/refinery/cache consumer cases
passed after building their workspace dependencies. Corrected integer-key bytes
change their historical hashes; invalid Unicode now fails before hashing.

Initial authority preflight complete for #1693 and #1665. Clean isolated worktree;
unrelated editorial changes remain in their original checkouts. Dependencies use
the repository's Node 24.14.1 and frozen pnpm lockfile.

The installed workflow skill references feature-lease tooling that is absent
from this repository. No automated lease acquisition/validation is claimed.
Recovery uses this bounded log, ordinary commits, remote-head verification and
retained validation logs. Private session material stays outside the public tree.

Additional public frontier: #1694 salience Profile is independent and underway
after #1670/#1558/#1567/#807 and its protected boundary were resolved. Preserve
existing Core Evaluation verdict semantics; public assessments never grant truth
or execution authority. #1695 is the next independent Profile candidate.

Known baseline limitation: the workspace bootstrap test references
`docs/governance/DONOR_FIT_MAP.md` and `docs/backlog/BOOTSTRAP_EXECUTION_TRACK.md`,
both absent at base `48bbd83`. Its failure predates this change. Initial direct
consumer tests also needed workspace dependency builds before package exports
could resolve; the targeted build completed successfully.

Donor boundary: the located extension declares 2.0.9, not the required verified
CoS 2.1.22 source snapshot. #1688 and dependent donor work are not claimed complete.

## Current recovery state

Fetched origin/main on 2026-10-03; no new commits beyond base 48bbd83.
#1666 normalization now preserves duplicate occurrence order, isolates scope
transitions, keeps malformed snapshots opaque, checks blob bytes on reconstruction,
and bounds source/line/record sizes. Golden canonical digest pinned in owner tests.
Owner tests: 26 passed; owner build passed (dependencies cached where valid).
Committed/pushed in f501701; PR review comment posted.
#1694 ready for review: 55 focused schema/Profile tests, package build, Pack
conformance and authority checks pass. Nested fields, finite values, time formats,
Core verdicts and explicit Novelty baselines are checked. Nine public vectors
include preserved low leaves/aggregate, prior/reassessment, and interoperable
outputs. Rich values reference their declared schema. Cross-field level membership,
ordered intervals and self-supersession checks are documented separately from
portable JSON Schema structural validation. #1695 implemented: public Counterfactual Evaluation Profile, schema, catalog/
descent/router integration and nine synthetic conformance vectors.

## Next safe step

#1694 pushed in ba497ec with review comment. #1695 pushed in 51a1571 with review comment; focused suite 62 passed, package
build, Pack conformance and authority checks pass. #1667 pushed in 212484a with
review comment. #1669 pushed in 83fe5b7 and review comment posted. Remaining early gates: #1668
requires a pinned Graphiti/provider fixture path; #1688 still requires exact
CoS 2.1.22 source before donor-derived headless extraction. Graph proof follows verified
normalization; Neo4j development image is available, no production graph claim.

Semantic-governance limitation confirmed on 2026-10-03: four historical PRD/RFC
paths referenced by the check are absent at base 48bbd83. The full failure log is
retained locally; authority-closure and Pack checks pass. No authority replacements
were synthesized. #1695 red tests confirmed missing implementation, then stub
behavior failure; implementation now passes final focused tests/build.

#1667 committed/pushed in 212484a: fixture-only native HTTP
Neo4j projection, scoped stable node/edge identities, source/normalizer provenance,
explicit source relations and derived snapshot lifecycle. Real database tests passed
import/reimport/rebuild, full identity/property closure equality, bounded neighborhood
and foreign-edge rollback. Graph contains 37 nodes; exact counts/version/queries in
tools/trace-graph/golden-proof.json. Owner build and affected normalization tests
passed after typing the existing normalization receipt payload explicitly.

#1669 ready for review: deterministic client-visible morphology report with exact
byte accounting, snapshot/window counts, scoped object motion and repeated canonical
signatures. One shrink candidate: snapshot 2 -> 3, occurrences 4 -> 1 and unique IDs
3 -> 1. Tool-shaped value disappears then returns; context survives three transitions.
Real bounded Cypher proves pre/post neighborhoods. Affected slice: 22 tests passed,
including real Neo4j; owner build passes. Golden report digest pinned in tests.
Canonical view/source-tile verification now lives in ingress-refinery and is reused
by graph and analytics; a red source-payload-drift test caught the missing guard.
No model-internal or causal claim is made by the report.

Remaining gate audit, 2026-10-03: graphiti_core is absent from the host Python,
no configured model credential variable is present in this process, and the local
Ollama service reports zero installed models. #1668 is not implemented or passed;
it needs upstream pinning plus a bounded extraction/provider compatibility proof.
The deterministic source/normalization/graph/kinematics lane remains model-free.
The exact CoS 2.1.22 source gate remains unproven (located donor declares 2.0.9).
No browser/live/voice/control proving or parent-program completion is claimed.

#1669 pushed in 83fe5b7 with review comment. Final Profile review caught a reversed
nanosecond-precision interval accepted after JavaScript millisecond rounding. Red
regression captured; comparison now preserves full fraction precision. Both v1
Profiles explicitly exclude leap-second instants, consistently in schema and TS,
without changing preserved source trace timestamps. Red regressions now pass; 62 focused Profile/schema tests, both owner builds,
Pack conformance and ingress-refinery owner suite (27 tests) pass.

## Branch-stable handoff

Review checkpoints are pushed for #1693, #1665, #1666, #1694, #1695, #1667 and #1669.
No issue or parent program was closed. Latest main fetch/merge reports already up
to date at base 48bbd83. PR #1697 carries the cumulative implementation and per-issue
review comments. Hosted verify passed for the final implementation commit ed015c9:
https://github.com/Entif-AI/Rosetta/actions/runs/37099031213/job/111134742700.
This recovery-log checkpoint changes no implementation bytes. Source/normalization/graph/kinematics proof remains
model-free; the owned ephemeral development database was removed after proof, without
source loss. Its image and reproducible setup remain available.
Next safe implementation: pin #1668 Graphiti and establish a bounded provider/model
fixture path, or resolve the exact donor-source gate for #1688. Existing baseline
historical-document failures remain separate from focused acceptance evidence.
