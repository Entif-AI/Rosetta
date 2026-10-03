# Entif Nx governance

Maintainer entrypoint for #1699, #1700 and #1701. Rosetta owns meaning; this plugin
owns deterministic repository mechanics. Spec Kit orchestrates source-owned checks.

```sh
pnpm nx g @entif-ai/nx-governance:init --configPath=tools/semantic-governance/governance.config.json --pluginPath=./packages/nx-governance/src/index.ts
pnpm nx sync
pnpm nx sync:check
pnpm nx run rosetta-governance:spec-admission
pnpm nx run rosetta-governance:merge-admission
```

Define project-local authorities and commands using `src/config.schema.json`.
`init` preserves local configuration and rejects incompatible branch policy or active
git feature-creation hooks. It requires an existing Nx workspace, does not install
services, and registers one plugin and one global sync generator. `spec-surface`
creates an unresolved admission declaration; filling it does not grant semantic authority.

The inferred task graph executes independent `evidence-*` collectors before admission.
A successful collector means its result was recorded, including upstream failure.
Admission fails unless every required upstream result passes and source digests match.
JSON reports are deterministic; raw command logs are separate execution evidence.
Each collector owns its output files. Spec admission checks planning/semantic sources;
merge admission adds affected implementation verification. Git-relative affected selection
is coordinator-owned and uncached. Pure validators are cacheable and need no credentials
or Nx Cloud. No semantic Pack relationship becomes an execution dependency.

`nx sync` materializes authority references and digests, not another semantic constitution.
The machine schema documents options. `src/governance.spec.ts` supplies portable examples.
Rosetta's configured commands reuse the public authority, semantic, DocID, descent and
Pack validators. Profile admission rejects the frozen #1698 pre-fix shape and accepts
the corrected Observation Profile; receipt tests verify the actual predecessor closure.

Spec Kit components live under `spec-kit/`. Install the preset, extension and workflow
with the upstream CLI. Hooks are mandatory agent instructions; CI's Nx admission is
the deterministic enforcement boundary. Workflow stages are individually resumable
with `specify workflow resume <run-id>`. Branch ownership remains external, one writer
uses the current authorized branch, and the git branch-creation extension is excluded.

## Tooling compatibility and upgrades

The installed Nx lane is 22.6.5; Spec Kit components were validated and installed with
upstream commit `de0cbd762e2d0b30f90d3ffcbe2ee9d7167f4eda`, 1.1.1.dev0, as of 2026-10-03.
`spec-kit/compatibility.json` records the bounded supported assumptions. The plugin ships
`config-v1` migration metadata. Use `nx migrate <version>`, install, review generated
`migrations.json`, then `nx migrate --run-migrations` and all normal gates.

Nx 22.6.5 does not expose `--agentic`. When upgrading to a version whose CLI advertises
`nx migrate --agentic=codex`, that assisted output remains proposed code requiring the
same verification. Do not pass unsupported flags to the pinned lane.

The plugin's explicit `@nx/js:tsc` build was verified with `--batch --skip-nx-cache`.
Other current TypeScript targets use inferred `tsc --build`, and apps use other executors;
they are not forced into unsupported batch execution. No speedup claim is made for
the single eligible plugin project. Full `pnpm verify:full` remains the escape hatch.

Primary tooling references: [Nx sync generators](https://nx.dev/docs/kb/create-sync-generator),
[Nx CLI](https://nx.dev/docs/reference/nx-commands),
[Spec Kit extension hooks](https://github.com/github/spec-kit/blob/main/docs/reference/extensions.md),
[Spec Kit workflows](https://github.com/github/spec-kit/blob/main/docs/reference/workflows.md).

## Specification catalog

The same global sync generator calls the explicitly configured source-owned catalog
producer. Output paths are declared and validated before writing. Rosetta joins the
existing DocID suite, schema catalog/Core descent, and checked-in Pack manifests;
`tools/spec-catalog/catalog.schema.json` versions the projection contract. JSON records
retain source digests, availability, declared exports/assets, Profiles, issue references,
compatibility and semantic dependencies. No source issue or supersession is guessed.

`docs/governance/ROSETTA_SPEC_CATALOG.json` is the generated inspection surface;
`ROSETTA_PACK_MAP.csv` supplies generated operator columns. Human planning annotations
join by identity in a separate overlay and are never read or overwritten. Direct Sheet
transport and Neo4j are outside this slice. Tests use the same sources as examples.

Pack discovery uses explicit `packs/*/pack.json` manifests. Inferred per-Pack shell targets
would duplicate the existing cross-Pack graph validator without providing independent
execution; retain its existing RRP target and run catalog/Pack validators as shared tasks.
Declared Pack semantic dependencies create no Nx dependencies. `spec-catalog:check/test`
and admission evidence have explicit source inputs and cacheable pure execution.

## Install and upgrade

The single npm package carries the Nx plugin and the versioned Spec Kit payloads.
Use a local-packed artifact until an authorized release publishes it. Nx-only consumers
can install just the plugin and configure only their own checks; Spec Kit is optional.

```sh
pnpm add -D /path/to/entif-ai-nx-governance-0.1.0.tgz
# Author governance/governance.config.json with your own sources/checks first.
pnpm exec nx g @entif-ai/nx-governance:init
specify init --here --integration codex --ignore-agent-tools --non-interactive
# Use the Python environment containing the verified Spec Kit revision.
python node_modules/@entif-ai/nx-governance/spec-kit/install.py
pnpm exec nx sync
pnpm exec nx sync:check
pnpm exec nx run <local-project>:merge-admission
```

Choose another supported Spec Kit integration at init if desired. The bundle itself
pins no integration. To upgrade, install the new compatible package, run its standard
Nx migrations, then run `install.py --refresh` and sync/admission. The installer preserves
independently owned components and priority overrides through upstream managers; pin
conflicts stop installation. The current upstream CLI does not resolve bundle-local
payload sources; the small adapter supplies that source selection only. Its API lane
is pinned to Spec Kit 1.1.1.dev0 at the recorded commit; broader range declarations in
component manifests are assumptions requiring conformance before an adapter upgrade.
Install the pinned CLI in a Python environment with
`pip install git+https://github.com/github/spec-kit.git@de0cbd762e2d0b30f90d3ffcbe2ee9d7167f4eda`.

For a generated working constitution, set `projectionPath` to
`.specify/memory/constitution.json`; sync writes the paired Markdown read by Spec Kit.
Run sync after Spec Kit init, which can materialize its placeholder constitution.
Rosetta does this explicitly; a consuming project's handwritten constitution remains
local authority unless it explicitly configures that output as a derived projection.

| Component | Owner | Compatibility / migration |
| --- | --- | --- |
| Plugin mechanics and config schema | Nx / local config | Nx >=22.6.5 <23; config 0 -> 1 migration |
| Preset / hooks / workflow / bundle | Spec Kit | Tested 1.1.1.dev0 pinned commit; local payload adapter |
| Meaning and admission checks | Rosetta / consuming source authority | Core 3.0.0; RRP promotion Profile v1 where used |
| Catalog / working constitution / reports | Derived projections | Regenerate; never grant authority |

`dev-bundle:e2e` installs the packed artifact in a temporary unrelated workspace,
checks Codex/bundle idempotency, runs a prototype-format upgrade through `nx migrate`,
and rejects incompatible branch configuration. It is coordinator-owned and uncached
because dependency installation and the external Python runtime are part of the proof.
Use `SPECIFY_BIN` / `SPECIFY_PYTHON` to select that runtime. CI installs the exact pin.

Nx Release owns version intent: one fixed `entif-development-platform` group contains
this single package and its pinned payloads. Committed `.nx/version-plans` files cover
contract changes; pure docs/tests are ignored by plan checks. `nx release plan:check
--base=origin/main` enforces intent. `nx release version --dry-run` previews version and
lockfile changes; changelog and publish use normal Nx Release commands after review.
Future releases must update payload pins/compatibility and rerun conformance when those
payloads change. Publication, tagging and credentialed release tasks stay coordinator
owned. This run builds local npm/ZIP artifacts; it does not publish or tag a release.

Primary release reference: [Nx Version Plans](https://nx.dev/docs/guides/nx-release/file-based-versioning-version-plans).

Rosetta registers the local source entrypoint explicitly while developing the plugin, so stale compiled plugin output cannot control project discovery. Packed consumers register the npm entrypoint. Rebuild the local plugin before exercising compiled generators after editing their configuration schema.
