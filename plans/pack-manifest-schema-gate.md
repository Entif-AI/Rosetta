---
id: entif:pack-manifest-schema-gate
task: T790
status: in-progress
depends: []
awaits: []
specs: [specs/architecture.md]
issues: [790]
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
- [x] `pnpm verify`, targeted Pack/RRP tests, authority/semantic/SpecOps admission, Nx sync and diff checks passed. The full local composed admission also passed before the run policy was narrowed.
- [ ] Review-only PR opened with exact current head and issue receipt.
- [ ] Integrated only by separately authorized human action; parent #790 stays open for remaining release-gate work.

## Run and recovery policy

The maintainer requires `pnpm verify` for normal checks, with targeted regression reruns after changes. Avoid repeating the full merge-admission/distribution suite for every feature. Keep verbose command output in ignored local logs and inspect exit status plus relevant failures. Preserve feature deltas through regular GitHub branch commits/pushes every few minutes of dirty work; verify the remote SHA and reconcile before retrying after a crash. GitHub issues, branch history and PRs are this engineering run's durable channels; do not create a Google Drive mirror. Leave PRs in human review and never merge automatically.

This base checkout inherited an unrelated `FEATURE_LOG.md` from main; preserve its history. No native branch-lease tooling exists in this checkout's documented location. This plan and live Git/PR receipts provide bounded recovery without claiming a lease that was never acquired.
