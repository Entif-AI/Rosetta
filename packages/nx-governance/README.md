# Entif Nx governance

Maintainer entrypoint for #1699, #1700 and #1701. Rosetta owns meaning; this plugin
owns deterministic repository mechanics. Spec Kit orchestrates source-owned checks.

```sh
pnpm nx g @entif-ai/nx-governance:init --configPath=tools/semantic-governance/governance.config.json
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
