# Entif development bundle

This versioned payload carries the preset, governance extension and serialized roadmap
workflow. It distributes mechanics; consuming projects retain local authority.

Use the [package quickstart](../README.md). The pinned upstream bundle CLI currently
ignores local component `source` payloads; `install.py` supplies the local-source adapter and
delegates primitive installation, pin checks, ownership, rollback and refresh to Spec Kit.
The adapter requires the exact verified version in `compatibility.json`. Initialize
the desired Spec Kit integration first; Codex, Claude and generic layouts are proved, and the bundle is integration
agnostic. No Git feature-creation extension is installed.

The adapter also records `.specify/managed-veneers.json` after upstream generation.
It supplements the upstream IntegrationManifest and component registries with per-file
owner, component/source refs and digests, exact CLI Git pin (verified from PEP 610),
resolved component versions, compatibility ranges and selected capability routes.
Composed outputs record both Core template and preset inputs; these are derived evidence.
`install.py --check` checks installed identities and local modifications without writing.
`install.py --refresh` first rejects edited/deleted files, symlinks, unmanaged collisions
and independently changed installed identities. Regeneration is deterministic; no timestamp
is used as content identity. Keep customization in canonical presets/extensions/config.

For one eager parent, use upstream generic flat commands rather than native child Skills:

```sh
specify init --here --integration generic --integration-options '--commands-dir .specify/runtime-commands' --ignore-agent-tools --non-interactive
python node_modules/@entif-ai/nx-governance/spec-kit/install.py --meta-skill
python node_modules/@entif-ai/nx-governance/spec-kit/install.py --route baseline
```

The sole `.agents/skills/entif-development/SKILL.md` parent selects a route; generated
commands remain outside native Skill discovery. This is an Entif routing convention,
not a claim of native lazy child discovery or proof of model compliance. Codex/Claude
native integrations remain available when their full command/Skill surface is wanted.
The executable fixture proves all three layouts, selected-file output and exact refresh.

Updates require a reviewable package/payload/pin change and explicit refresh. A legacy
bundle with no file baseline or a changed CLI pin fails closed: stage a fresh exact-pinned
installation, compare every managed file and registry identity, preserve local edits in
canonical sources, and adopt a baseline only after those bytes/identities are reconciled.
Do not copy a clean manifest over different files or use `specify init --force` as a
managed upgrade. This adapter guards its own install/refresh path; upstream commands
invoked separately retain their upstream behavior.
