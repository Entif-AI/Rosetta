# Local AXI interchange

AXI is the preferred question for high-volume model-facing interchange: adopt an
existing compact adapter when fidelity, safety and observability remain intact.
Rosetta owns semantics/identity/provenance; TOON is a transport projection. GitHub
owns durable work identity, Nx executes deterministic checks, and SpecOps owns the
reviewed desired-state/temporal-plan methodology. Generated outputs grant no authority.

## Reproducible setup

`node tools/axi/setup.mjs axi` checks out the exact upstream commit recorded in
`upstreams.json` into ignored `.axi/upstreams/axi`. It refuses revision mismatch
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
