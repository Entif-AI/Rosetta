# Entif site foundation and UCA showcase

## Mission and authority

- Execute #1657 then #1802–#1807 as one continuous assignment under #1801.
- User authorizes implementation, semantic commits, feature-branch pushes and one draft PR. Merge, deployment, issue closure and publication approval remain outside this assignment.
- Public presentation authorities: the issue contracts and screened prototype, `apps/entif-site/Design.MD`, Genesis interface/accessibility companion, publication boundary and authority-closure doctrine. No protected bridge edge governs website presentation. No Core, Pack, Profile or operational policy changes.
- Retain the existing serif stack. Preserve global chrome, published detail routes and Editorial chapter content; #1603 owns its separate redesign.
- New functional tests follow completed implementation, per the explicit mission override. Accessibility and W3C audits follow functional verification and responsive/performance refinement.

## Ownership and recovery

- Branch: `codex/entif-uca-showcase-01a12a46`; starting main: `65937be5391c2b66f9e2da0096e72f6f109bba52`.
- Clean worktree and live issues/PRs/branches inspected on 2026-10-11. No competing worker or matching remote implementation found.
- This checkout has no feature-acquire/checkpoint command, lease registry or enforceable lease workflow. Do not claim a native lease. The uniquely named branch has one local worktree; verify that ownership and the expected remote SHA before each ordinary push. Stop on divergence or discovered active ownership.
- Durable Git/worktree and this record are the recovery plane. No duplicate Minutes, Drive mirror or Work Stack.
- Reference issue bodies: `/tmp/rosetta-uca/{1657,1801}.md`; recover missing references from the live issues. Read each child when its phase begins.

## Current frontier

Phases A–F and responsive/performance refinement are complete. #1807: 286 browser tests pass (including 15 Projects axe states and every built route); W3C Nu reports no messages on generated Projects HTML. Final integrated verification and all-route mobile/desktop Lighthouse receipts are running. QA bundle and desktop/mobile assistive-technology procedures remain to be preserved. Draft PR: https://github.com/Entif-AI/Rosetta/pull/1808.

## Validation plan

1. Baseline capture and a compiler check at the SCSS migration boundary.
2. Complete validated content, design authority, full-width layout, seven-stage static presentation and tabs enhancement.
3. Add schema and behavior tests with `data-test-id`, then run focused functional checks.
4. Inspect mobile/desktop screenshots, gutters, overflow, enlarged text, short/wide viewports and asset weight; refine the rendered outcome.
5. Run axe on every panel/responsive state, built-HTML/link validation, W3C Nu and final Nx verify/e2e/Lighthouse.
6. Record unavailable real assistive-technology checks as `NOT_EVALUATED` with exact procedures. Hold design/content/accessibility/publication approval for the author.

## Completed outcomes and evidence

- Final full browser run: 286 passed, 0 skipped/failed/flaky, 51.5s; `/tmp/rosetta-uca/e2e-final.{log,json}`. All 14 enhanced tab/viewport states and one static DOM axe evaluation passed; genuine script-disabled navigation is separately tested. Axe cannot run inside a script-disabled browser context: its evaluator audits the matching DOM with only scripts removed and verifies unchanged visible content/static semantics.
- Responsive/performance: inspected actual 320/390/tablet/landscape/1024/1366/1536/wide/short views and doubled text. Fixed missing inline heading spaces and proportional orbit geometry. Projects performance-only Lighthouse: mobile 90, desktop 100; CLS 0 in both.
- Shared migration regression: restored original Editorial top padding and paragraph tracking across the unlayered legacy boundary. Layout/style measurements match the original on six desktop/mobile views; all 17 chapters have matching paragraph/heading styles. Preserve legacy CSS rather than redesign it.
- Initial baseline images were stored in Playwright's disposable output directory and removed by its cleanup. Regenerated baseline from starting commit 65937be5 in a temporary archive using unchanged runtime dependencies; `/tmp/rosetta-uca/baseline-recovered/`. Move QA evidence outside test-results. Record this provenance; do not describe regenerated images as the original capture.
- Final tooling repairs: Stylelint whitespace fixes, exact user-select vendor allowlist (restore prefixes changed by autofix), runtime-token reference checking, harmless quote normalization on two preexisting detail frontmatters, strict optional baseURL forwarding in audit contexts. No suppression of semantic/contrast checks.
- Verified feature-branch remote checkpoint: 411929e5251b53aaec94ea00c6c712fcc688c385. Draft PR #1808 attached to this chat; not merged/deployed.

- Focused resize/focus regression passed (1 test, 2.5s): `/tmp/rosetta-uca/focus-e2e.log`. Earlier five functional tests passed in `/tmp/rosetta-uca/functional-e2e.log`; the complete six will rerun in final acceptance. Preview ownership fixed via public Astro API.

- Functional defect: the horizontal rail scrolled internally but preventScroll left a focused control below the viewport after desktop→mobile reflow. Keep the focused control vertically visible on activation/orientation changes, then adjust only the rail horizontally. The focused keyboard regression test remains unchanged.

- Focused Playwright initially could not start: Astro 7 auto-detects agent execution and daemonizes preview, causing `Process from config.webServer exited early`. Use the public Astro preview API in tools/preview.mjs as a foreground test server; keep server ownership/reuse strict. No browser test result is claimed from that failed attempt.

- Delayed verification: 22 focused unit tests passed; integrated Astro typecheck has 0 errors/warnings/hints; build renders 252 routes. Logs: `/tmp/rosetta-uca/{unit-focused,functional-typecheck,functional-build}.log`.
- Semantic implementation commits: 248b5bc feat(site): progressively enhance the seven-system explorer; ca29036 feat(site): render the complete static UCA showcase; 85be08a feat(site): compose a reusable full-width page layout; 5c4ff77 docs(site): lock the serif full-width showcase design contract; 1f84b17 feat(site): validate the public UCA narrative and source links; e9e3b79 refactor(site): establish modular SCSS cascade foundation

- #1806: automatic-activation tabs reuse SSR sections; roving focus, coherent ARIA/visibility, pointer/touch, orientation-specific wrapping arrows/Home/End/Enter/Space, responsive selection retention and init rollback implemented. Sass emits the matchMedia query from the shared map. Rosetta is default; explicit panel fragments reveal their targets. No runtime framework or Zod is shipped to the browser.
- First integrated typecheck caught an optional noindex forwarding mismatch; resolved with the existing false default. No behavior was loosened.

- #1805: native Astro seven-stage narrative, decorative human-agency orbit, five failure modes, seven fully expanded system sections/anchors, six metadata-resolved essay responses and seven future steps. Four published project links remain; old card grid removed. Scoped SCSS uses the accepted palette and shared content boundaries. Source-only system headlines added to retain the prototype’s panel copy.

- #1804: thin FullWidthPageLayout forwards metadata/head/default slots into BaseLayout; shared padded stage/reading boundaries use canonical tokens. Editorial now composes it mechanically with all article structure, chapter styles and citation behavior retained. Projects will adopt it in #1805. Regression proof is deferred.

- #1803: Design.MD 1.2.0 specifies inherited serif, page-scoped palette, generic full-width composition, 80rem padded stage boundaries/46rem reading measure, responsive rail, no-JS/print/motion/forced-color behavior and approval limits. Computed-style comparison is deferred to the planned visual pass.

- Foundation checkpoint: `e9e3b79ba8cecefd9bc29ed5b1ce9c1e52a29d95`, remote SHA readback matched.
- #1802: seven-stage narrative now lives in projects.md; schema enforces required keys, unique ordered systems/stakes/responses/scenario steps, safe fragments and published project identities. Intro/agency/supporting fields preserve the prototype’s substantive copy omitted from its proposed minimal shape. Link resolution uses published/non-noindex metadata and never invents missing essay/project publications.

- #1657: Dart Sass, shared modules, central runtime layer order, deduplicated responsive rules, named thresholds, Stylelint/Nx wiring, SCSS formatting and legacy Editorial boundary implemented. Design authority corrected to the accepted serif stack.
- Baseline: eight views at 1440/390px for home, Projects and Editorial opening/references; `apps/entif-site/test-results/uca/baseline/`.
- Original build and post-migration compiler build both passed (252 routes); logs in `/tmp/rosetta-uca/`. Functional, visual-regression, Stylelint and accessibility acceptance are deferred, not claimed.
- Setup failure: running dependency installation alongside the original build temporarily removed Astro executable links. Serialized install completion before rerunning the successful build; no implementation defect.

## Next exact step

Finish active `entif-site:verify` and `entif-site:lighthouse` runs. Preserve public-safe compact reports, screenshot/comparison evidence and WCAG 2.2 A/AA matrix in apps/entif-site/evidence/uca, with precise unavailable desktop/mobile AT procedures. Run an actual Chrome keyboard/zoom review, repeat W3C Nu against final built bytes, then commit/push with an exact expected-remote fence and update the one draft PR. Use only focused checks when findings require repairs.

Recovery map: authoritative mission is the first 463 lines of the attachment; issue bodies cached in /tmp/rosetta-uca (all children now read). Source: projects.md, lib/showcase.ts, components/projects, scripts/uca-explorer.ts and pages/_projects.scss. Tests: tests/unit/{showcase,uca-explorer,style-tokens}.test.ts and tests/features/projects.spec.ts. Preview uses the foreground public Astro API (node tools/preview.mjs); stop manually owned port 4322 before Playwright and restart preview after builds to refresh its static-file cache. Baseline source archive and images: /tmp/rosetta-uca/original and baseline-recovered; current geometry/screens: /tmp/rosetta-uca/visual. Full e2e JSON contains 15 axe attachments. Native leases absent; no private Docs/Drive input was copied. No Minutes/Work Stack, merge/deploy/closeout authority, or manual AT result.

Memory used only for historical branch-fencing guidance, reverified here: MEMORY.md:421-421 (rollout 01a10437-9627-7102-bc4c-d65f1c00a3c9). Include exactly one memory citation block at the end of the eventual final answer.
