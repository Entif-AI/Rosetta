---
id: entif:pack-manifest-schema-gate
task: T790
status: done
depends: []
awaits: []
specs: [specs/architecture.md]
issues: [790]
pr: 1816
---
# Validate Pack manifests before integrity and path claims

## Scope

Bounded execution slice of #790 using the accepted [ROCK-3111-C Pack filesystem contract](../docs/RFCs/ROCK-3111-C-RRP-Pack-Filesystem-Contract-v0.2.0.md). The current `packs/_schemas/pack-manifest.schema.json` is the executable manifest-shape source. Make the existing Pack validator consume it before Pack ID, declared asset, Profile or graph checks. Keep the `rosetta-pack-id-v1` hash formula and existing three Pack roots unchanged. Allow `$schema` metadata and require the Core compatibility/dependency declarations already required by ROCK-3111-C. Do not introduce a new release state, certification verdict, auto-promotion, or Core kind.

## Proof and downstream

Source code: `tools/pack-conformance/validate-packs.mjs` and existing `validate-packs.spec.mjs`. Tests must reproduce the pre-fix false green from an unknown manifest key, prove missing mandatory declarations fail before Pack-ID comparisons, reject a historical unsupported entrypoint key, and reject a malformed `pack_id` before integrity checks. Existing valid Pack roots and Pack-ID/Profile/cycle checks remain green.

The remaining #790 work includes the composed local/CI release gate, bootstrap workspace checks, machine-readable release report and replayable issue-specific release evidence. Those are independent leaves after this one, under the same canonical owner. #1118 RRP-specific example/vector/changelog closure also remains separate.

## Validation

- [x] Red-before-green: malformed manifest falsely returned `ok: true`; omitted `compatible_core`/`depends_on` reached Pack-ID verification before schema refusal.
- [x] Local manifest schema runs first; malformed keys/fields yield typed errors; valid workspace Packs still pass.
- [x] Focused vectors preserve Pack-ID, Profile descent and dependency-cycle behavior.
- [x] ROCK-3111-C §9.1 now conforms to the accepted executable manifest schema: required `id`, `kind` and `title` are present, and schema entrypoints use the supported array-valued `entrypoints.schema` key instead of stale `primary_schema` / `primary_bundle_schema` keys.
- [x] `pnpm verify`, targeted Pack/RRP tests, authority/semantic/SpecOps admission, Nx sync and diff checks pass on the closeout state. The full local composed admission also passed before the run policy was narrowed.
- [x] Draft review-only PR #1816 opened; first pushed head `53fa57d59e3f7b7ad5496c4146fc1cd0cc210900` verified through GitHub and `git ls-remote`.

## Integration boundary

Human source-owner acceptance and merge remain separate from bounded implementation validation. Completing T790 does not merge PR #1816, close parent #790, certify a Pack release, authorize promotion, or complete the remaining release-gate leaves.

## Run and recovery policy

The maintainer requires `pnpm verify` for normal checks, with targeted regression reruns after changes. Avoid repeating the full merge-admission/distribution suite for every feature. Keep verbose command output in ignored local logs and inspect exit status plus relevant failures. Preserve feature deltas through regular GitHub branch commits/pushes every few minutes of dirty work; verify the remote SHA and reconcile before retrying after a crash. GitHub issues, branch history and PRs are this engineering run's durable channels; do not create a Google Drive mirror. Leave PRs in human review and never merge automatically.

This base checkout inherited an unrelated `FEATURE_LOG.md` from main; preserve its history. No native branch-lease tooling exists in this checkout's documented location. This plan and live Git/PR receipts provide bounded recovery without claiming a lease that was never acquired.

## Handoff

Draft PR https://github.com/Entif-AI/Rosetta/pull/1816 is open and unmerged. The verified public issue receipt is https://github.com/Entif-AI/Rosetta/issues/790#issuecomment-6113083579. Before resuming, re-fetch its head and GitHub admission status, reconcile reviewers' obligations, then apply any bounded revisions in the same isolated branch. The next independent #790 leaf should compose validated manifest shape, Pack integrity/graph checks and workspace bootstrap into a deterministic release report and CI surface; it must preserve the #994 write-admission and #1295 safe-hold rules and avoid claiming that evidence alone grants promotion. #1118 owns the separate RRP-specific example/vector/changelog closure. No automatic merge is authorized.
