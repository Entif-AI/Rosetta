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

# S2 AXI / SpecOps migration

Publication posture: public development-substrate contracts and evidence only.
Owner: one mutable writer in `codex/roadmap-s2-axi-specops`. No delegated work.

## Preflight

- 2026-10-03: fetched origin/main at b02ae4675e6f1d703d565e962356fe81b9d2ebb4.
- PR #1600 merged at 2026-10-03T20:24:32Z by squash. Its tree is identical to S1 tip 064c67015ad0f77ec9e06eb4b38f4f5b2a19fbca (empty git diff).
- Current #1711–#1721 bodies/comments inspected; all open, no comments. #1711 is downstream and excluded.
- Public boundary/authority-closure doctrines and bridge inspected. Public issue contracts govern this tooling migration; no semantic/Core/schema change is intended. Protected routing/optimization policy is excluded.
- Original editorial checkout has an unrelated unresolved merge; preserved via an isolated managed worktree.
- Installed feature-workflow Skill references lease tooling/docs absent from merged main. No invented lease receipt; single-writer Git checkpoints are used.

## Migration intent / validation

Readers: Nx plugin/config, source catalogs, Spec Kit runtime veneers, coordinator issue ledger.
Writers: deterministic sync generators, explicit coordinator mutation, local managed installers.
Forward: pin AXI; prove quota/GitHub/npm; inventory S1; add SpecOps seam; prove plans/drift/context/distribution; integrated admission.
Rollback: retain S1 payloads and Git history through successor proof; revert reviewed commits to restore S1. No ledger/data deletion or release.
Compatibility: existing Spec Kit consumers remain supported during expansion; new SpecOps consumers own local semantic authority.
Proof: red/green focused behavior fixtures, retained identity/baseline/convergence tests, external-consumer upgrade E2E, Nx sync/release/admission/affected/full gates and hosted CI.

## Completion

#1712–#1721 implementation and integrated acceptance are complete at the distribution source checkpoint 47e4c28f7dcd0383c5b5d5592db38473cc590902. Final closeout metadata is being checkpointed; current-head hosted verification precedes issue closure/ready state.

Proof: 16 AXI/SpecOps Node fixtures; 35 Nx behavior, 4 catalog and 15 semantic fixtures; full verification (27 test projects, 19 build projects), frozen install, sync/check, release plan, affected implementation admission and 10-group packed consumer E2E. Hosted admission and site verify passed on the source checkpoint. Run/distribution/convergence/byte evidence is in tools/specops/evidence.

Bounded read-only efficient_reviewer (gpt-5.6-sol/high) found staged-acquisition and dead-lock recovery gaps; red/green repairs and re-review passed. No mutable delegation. Integration also repaired pnpm symlink CLI execution, no-origin context, explicit preservation of legacy prose and source-loader test portability. Prior premature #1720 comment was corrected, not left as false evidence.

## Handoff

Next separate experiment is #1711; migration prerequisites are cleared and it was not executed. Wait for final closeout-head hosted checks, then close completed children/epic and mark PR ready. Human owns merge/release/publication. No ledger or legacy payload deletion. Original editorial merge checkout remains preserved.

## PR #1697 merge resolution, 2026-10-04

Merged `origin/main` at `88dd7aa` into `codex/akasha-early-wave`, retaining
both implementation histories above. Public authority preflight covered the Core
Spine, semantic audit, schema authority map, evaluation Pack, promotion contract,
and public/private bridge. This integration preserves the existing public
contracts and introduces no private estimation, selection, or promotion policy.

Schema exports and routing retain the Salience and Counterfactual Evaluation
Profiles alongside the Promotion Observation Profile. Generated SHACL keeps
`main`'s `derived-projection` classification. Validation uses the existing Profile,
catalog, descent, and affected package checks. Before resolution, the focused
schema/Profile suites failed at the conflict marker in `validatePayload`.

# Deterministic Akasha v2 batch

Publication posture: public conformance, schema and fixture proof only.
Primary owner: #1664. Leaves: #1693, #1665, #1666, #1667, #1669.
Branch: codex/1664-akasha-v0-v2-01a10437
Base: 88dd7aa8eb6501f334b3616c1c16e8b2761ab5a9
Coordination: user-authorized-single-writer-exception.
Authorization: explicit current user launch turn, October 3, 2026.
No force-push, merge, release or automatic issue closure. One mutable writer.
Last acknowledged remote SHA: d6bf19669fa9330514e3c6535ccdafafdc72e66e

## Authority preflight

Fresh main matches the packet baseline. Public boundary/closure/bridge, #528 and current leaf/parent issues govern meaning. Lease tooling/docs remain absent; direct IPR-0067 and current protected workstream references support the user-authorized temporary workflow closure. No protected policy/mechanism is published or changed. No fabricated lease. Core meaning stays unchanged; new trace shapes belong to extensions.

## Acceptance and validation

Accepted: #1693 at 81fee310b6a79aaebbfe4c1e46a90befab95fbaf, draft PR #1725. #1665 accepted locally: 75 captured-derived frames, deterministic re-derivation, secret-pattern/private-scalar scans, separate original/derived manifestations and generated edge fixture. Seven source tests plus lint/typecheck/build pass. Public fixture docs/manifests bind the derivative; private original/receipt remain outside Git. Accepted #1666 locally: schema/refinery tests and lint/typecheck/build pass; 75 captured records/66 client materializations, six generated snapshots, complete typed deltas/dictionary/loss/time roles and replay digests. Generated safe content is padded to the prepaid canonical-state sizes 1000/1200/760/900/200/920; source fixture remains captured-derived and independent. Schema catalog/descent/audit updated; no Core edit. Accepted #1667 locally: pure adapter tests plus schema/package checks pass; real Neo4j 5.26.0 proof covers both fixtures, nine node-family constraints, scoped evidence identities/indexes, literal Cypher, bounded neighborhoods, duplicate-free import, another namespace surviving reset, and identical rebuilt closure digests. Accepted #1669 locally: the literal S0-S5 series passes, captured request recurrence is measured, serialized schema rejects false reset candidates, and direct Neo4j queries match both series with pre/post state neighborhoods. Source/profile/version/digest references and the client-visible epistemic caveat are retained. Current frontier: all five deterministic leaves accepted; final batch postflight passed.


## Handoff

Batch postflight passed: verify:full, affected:verify, governance:admission, governance:spec, SpecOps tests/DAG/next, deterministic fixture regeneration and real Neo4j reset/rebuild/query proof. Final negative regressions also cover CRLF physical source-byte accounting and cross-namespace graph identity rejection. Packed distribution proof used the repository-pinned Spec Kit CLI in a task-local environment. Next safe step: checkpoint #1669 and finish the single draft PR handoff. Stop at this frontier. Task-local Neo4j 5.26.0 / Java 21 is running isolated on loopback fixture ports. #1668 and #1694 remain deferred. #1664 stays open. Every checkpoint compares the remote ref to the acknowledged SHA, pushes without force, and verifies remote readback. The committed log names the previously acknowledged SHA; the exact known checkpoint commit is the readback successor, avoiding recursive self-hashing.

## Checkpoint identities

- #1693: 81fee310b6a79aaebbfe4c1e46a90befab95fbaf
- #1665: a5974f7a73e9d5eb60935cb77c4c54974eab18e4
- #1666: 22c00847b21c34cef7547d256f0d1d312084711c
- #1667: b3d3ec4dcd2a8d6b58ac36243f15dae5eb476e4b
- #1669 and batch postflight: d6bf19669fa9330514e3c6535ccdafafdc72e66e, with remote readback verified by the coordinator.

Receipt: tools/trace-graph/evidence/batch-validation.json. Public runtime proof binds source/normalized/graph/kinematics artifacts. The private original and derivation receipt remain outside Git. The isolated development database may be stopped; all checked-in proof artifacts remain independently inspectable.

## Scoped review follow-up

Review question: https://github.com/Entif-AI/Rosetta/pull/1725#issuecomment-5975928228. User selected only trace.normalization.v1 independent self-validation. #1666 and the public Profile govern serialized admission; producer identity alone is insufficient. Preserve the accepted batch, serialized shape and fixture bytes/digests. Add rehashed negative lifecycle/byte-count/partition tests before parser changes, then run narrow schema/refinery/projection checks and final admission gates. One checkpoint; reply to the existing comment and mark ready only when green. No merge, Graphiti, salience or unrelated work.

Scoped review disposition: independent serialized admission. Sixteen rehashed adversarial cases were accepted before the fix and rejected after it. Narrow schema/refinery/projection tests pass (68/22/9), with lint/typecheck/build. All 13 checked-in fixture/schema/evidence files remain byte-identical; normalized, kinematics and pure graph closure digests are unchanged. Final merge/spec admission and sync:check pass. Next safe step: push this single review checkpoint, verify current-head CI, reply to the existing review question, and mark ready without merge or issue closure.

## PR #1697 current-main integration

During validation, main advanced to `c9e01d2` through #1725. Both trace APIs,
source fixtures, validators, catalog registrations, and test suites are retained.
The shared JCS serializer preserves existing omitted-field and sparse-array
behavior. Both histories contribute conformance vectors. Generated catalogs and
Core-descent audit are rebuilt from their combined source authorities.

Evaluation Profile metadata now follows the catalog's Core-descent rules while
keeping logical Profile IDs distinct from JSON Schema URIs. Catalog and Pack
regressions reject mismatched Profile declarations and schema authorities. The
root validator dependency uses the existing package pin, Ajv 8.17.1.

Validation passed with Node 24.14.1 and pnpm 10.33.2: `pnpm run verify`
(24 lint projects, 16 typecheck projects, 24 test projects, and 16 build projects),
frozen install, `nx sync:check`, authority closure, the 54-entry Core-descent
audit, and conformance for all four Packs. Conflict-blocked schema tests and the
new catalog/Pack regressions failed before their fixes and pass afterward. The
endpoint-dependent Neo4j integration test was skipped. Main's trace fixtures and
checked-in Neo4j evidence remain byte-identical to `c9e01d2`.
