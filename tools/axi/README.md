# Local AXI interchange

AXI is the preferred question for high-volume model-facing interchange: adopt an
existing compact adapter when fidelity, safety and observability remain intact.
Rosetta owns semantics/identity/provenance; TOON is a transport projection. GitHub
owns durable work identity, Nx executes deterministic checks, and SpecOps owns the
reviewed desired-state/temporal-plan methodology. Generated outputs grant no authority.

## Reproducible setup

`node tools/axi/setup.mjs axi` checks out the exact upstream commit recorded in
`../../packages/nx-governance/specops/upstreams.json` into ignored `.axi/upstreams/axi`. It refuses revision mismatch
and local edits. Re-run safely; preserve local edits rather than resetting them.
The upstream `.agents/skills/axi/SKILL.md` and `principles.yaml` are on-demand design
references, never an eager installed Skill. The same command takes `quota-axi`,
`gh-axi`, `npm-axi`, or `specops` for exact source inspection; this does not enable
hooks, install every adapter, authenticate, or call an external service.

Rosetta interfaces use compact TOON or equivalent bounded text by default; typed
JSON stays internal. List identity/summary/state, truncate long content with its
original size and an explicit `--full` escape, return definitive zero states,
reject unknown options, use deterministic exits/structured errors and no machine
prompts. Mutations need replay-aware identity and delivery evidence. Retain exact
source locators and digests whenever a projection informs a governed decision.

## Capability dispositions

| Surface | Disposition / owner |
| --- | --- |
| Local quota | Prove quota-axi in #1713; observation only, no routing policy |
| Local GitHub | Prove gh-axi in #1714; raw/native fallback when fidelity is insufficient |
| Chat GitHub connector | Retain account-integrated control-plane surface |
| npm registry research | Prove npm-axi in #1715; pnpm manifest/lock owns dependencies |
| Specs/plans | SpecOps migration #1716–#1721; retain generic Nx governance |
| Isolated/headless Playwright | playwright-axi candidate under #1021/#724 |
| Existing authenticated Chromium | chrome-devtools-axi candidate plus necessary provider residuals under #1681 |
| Native Workspace/MCP | Retain native document/sheet semantics; evaluate owning capability |
| Slack/database/deployment/macOS | Demand-driven owning issues; no speculative adapter installed |

No ambient hook/polling loop is enabled. Quota capture is event-triggered before a
substantial run, after completion/failure, or at cheap durable checkpoints. Badger
#1711 remains downstream of the proven AXI + SpecOps substrate.

## Nx design marker

Deterministic Nx tasks may invoke AXI when reproducible and scoped. AXI alone never
makes work cacheable. Credentialed/mutating operations stay coordinator-owned and
uncached. Semantic edges belong outside the execution graph unless they impose a
real execution order. Catalogs, reports and transport remain projections.

## Quota evidence (#1713)

Frozen pnpm install provides quota-axi 0.1.56 at its recorded registry/source pin.
`node tools/axi/quota.mjs before|after|checkpoint|failure|installed-mid-run` performs
one bounded Codex read with no credential refresh, prompts or inference. Full donor
evidence stays in ignored `.axi/evidence` with mode 0600. The projection keeps opaque
seat/source/time/windows/reset/conflict/version fields, drops identifying account
fields and donor selection advice, and treats unavailable readings as unknown.
Provider observations are not immutable contracts. This run's first reading is
`installed-mid-run`; no pre-run value or overall quota delta is invented.

## GitHub transport (#1714)

`pnpm exec gh-axi` is pinned at 0.1.35 (published source differs from inspected
HEAD; both are recorded). Use `search issues ... --repo ...`, `issue view ...
--full`, `pr view ... --comments --reviews`, `run list/view`, repo/release/label
reads and `api ... --full` where proven fidelity fits. Keep Chat's native connector.
The installed release's check summary lacks newer state fidelity: use native
`gh pr view --json statusCheckRollup` for exact admission decisions. Project scopes
are not expanded without an owning need. Durable issue identity and pending-before-
send ledger remain in the generic Nx coordinator; transport never owns identity.

The live benchmark found selected native JSON smaller for all four compared reads;
prefer that path when it already contains the required information. AXI detail
adds progressive disclosure and hints; no Codex quota savings is inferred. A PATCH
to the known quota checkpoint comment ID was replayed twice and its same ID/body
verified against native truth. Unknown create acknowledgements still require the
existing coordinator ledger/recovery; never blindly repeat a comment/issue create.

## Registry research (#1715)

Pinned `pnpm exec npm-axi search/view/versions` is a read-only research adapter.
`view --full` escalates README content when supplied by the registry. It exposes
latest-version detail and dependency counts; use native `pnpm view <name>@<version>
version dependencies peerDependencies --json` for exact dependency/peer mappings.
Search zero/error states were proved live. Research never installs/upgrades a
workspace dependency: manifests/lock and Nx remain the owning mechanics. Evidence
compares 1,289 bytes to a 216,173-byte raw quota-axi packument; optimally selected
native JSON is a different baseline. No token or quota claim follows from bytes.
