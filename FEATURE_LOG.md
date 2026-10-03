# ETR-2026-07 editorial series — #1603

## User-review correction: experience incomplete

The user rejected this result as ordinary articles rather than the requested immersive
editorial experience. Migration, routing, citations, and the shared layout are foundations
only. The earlier completion/review-ready assessment was wrong. Chapter-specific visual
storytelling, composition, and meaningful interactive treatments remain unfinished.

Do not run further broad browser suites, W3C/WCAG audits, or performance measurements
until the actual experience is implemented across all issues. Results below are historical
foundation checks, not completion evidence. Do not repeat them during implementation.
Add only necessary novel-logic tests under the user's original constraints.

Next: develop concrete chapter treatments from the already retrieved sources, implement
a representative immersive chapter, then carry the approach through the other chapters.
Preserve authored prose and qualifications. Keep the goal open; no review-ready claim.

Branch: `codex/1603_ETR-2026-07`. Children: #1604–#1620.

## Contract and authority

Implement the public website experience specified by these issues in `apps/entif-site`.
User instructions narrow tests to necessary novel logic, using semantic data-test-id
selectors; defer W3C/WCAG/performance validation until all implementation is complete.
Experience CSS stays in its own directory. Public website design/README and repository
publication-boundary/authority-closure rules apply. No protected bridge edge applies
to website presentation. No protocol semantics change.

Repository has no `docs/workflows/agentic-development`, lease tool, or existing feature
log on this branch or current main. No lease is claimed. Remote feature branch was
absent at start. Current main merged without discarding the prior branch commit.

## Design and invariants

- Extend existing publication metadata with explicit series ID/order; derive navigation
  and paths from validated entries. Preserve unrelated publication routes/rendering.
- Dedicated full-width editorial shell retains shared header/footer and comfortable
  prose measure. Numbered sticky desktop navigation; previous/next mobile links.
- Build-time citation transformation consumes one CSV registry. Source IDs remain
  stable; unknown IDs stop the build. Native links work without JavaScript; progressively
  enhanced popovers support pointer, keyboard, touch, Escape and outside dismissal.
- All chapter prose retained. All 12 retained additions already occur verbatim in their
  section files: include once. No canonical manuscript, package crawl, or packaged graphics.
- Use authored prose/section breaks for typographic editorial beats; no invented data.
- Static content remains complete in reduced motion and print. No SPA or new runtime.
- Budget: series-specific client JS <= 8 KiB gzip; no new media or web fonts.

## Work and proof

Source acquisition: 16 sections, 12 additions, one registry retrieved by exact issue URLs.
Source snapshots currently in local `/tmp/etr-1603`; migrate selected content with
hashes and addition-inclusion evidence into website-owned content.

Implementation: all 17 routes, dedicated shell/styles, shared citation transformation,
native no-JS reference links, enhanced popovers, reference appendix, and index routing.
Migration provenance is in `content/editorial/accelerating-the-dystopia/migration.json`.
All 95 registry rows retain every field. Formatting only normalizes whitespace and
equivalent emphasis delimiters (chapter 5); no prose changes.

Checkpoint proof (2026-09-17):
- Four novel unit tests: red on missing implementation, then green.
- Two citation browser tests: red on absent enhancement, then green; caught and fixed
  focus-transfer dismissal before reference-link navigation.
- Site build/typecheck/lint/format and 21 unit tests passed.
- Full browser suite: 214 passed, including all generated page axe audits.
- HTML/local-link/fragment gate: passed across 194 generated pages after fixing the
  validator's repeated JSDOM allocation (cache fragment IDs, close DOM windows).
- All 17 series pages at 320/390/768/1024/1366/1536px: no horizontal overflow.
- Enlarged text with WCAG spacing exposed 1–4px overflow in two-digit mobile navigation;
  changed its minimum inline target to 44 CSS px. Final recheck pending.
- Print hides chapter navigation and retains source links; reduced motion has no animations.
- Lighthouse opening/references, mobile/desktop: 100 in all four categories.
- Series-specific inline client module: 1,870 bytes, 818 bytes gzip (8 KiB budget).

Source files were retrieved by exact URLs only; no source folders were enumerated.
The inherited unrelated planner-skill commit remains on its original branch; an ordinary
revert excludes that diff from this feature branch without rewriting history.

The former validation/PR closeout step is superseded by the correction above.
Lease tooling remains unavailable.

## Chapter 1 experience checkpoint

Five authored narrative scenes added: original optimizer schematic; separate economic
measures; native customer-service objective switch; native productivity-bargain switch;
personal time ledger. Prose is unchanged; explicit scene comments set placement.
CSS is split into scene primitives and a chapter-only stylesheet. Direct browser visual
inspection and the role-consolidation interaction were checked. One new loader-path
boundary test ran red/green. No broad browser, a11y, HTML or performance suites run.
Next: differentiated treatments for chapters 2–16 and reference exploration.

## Accessibility closeout checkpoint

User-authorized branch-wide WCAG validation superseded the earlier instruction in this
log to defer broad accessibility/browser checks. The final implementation pass found a
route-layout regression on the short `/articles/<slug>/` aliases for editorial-series
chapters: those URLs rendered through the generic `PublishedEntry` layout instead of the
series layout, dropping chapter-specific visual CSS. Axe exposed the mismatch as WCAG
2.2 SC 2.5.8 target-size failures in chapters 02 and 04. Short series routes now render
through the same `EditorialSeriesLayout` as canonical series URLs; non-series essays keep
their existing `PublishedEntry` path. A browser regression test verifies the short routes
retain the editorial treatment. Playwright is also configured not to reuse an unrelated
preview server on its fixed test port after a stale preview from another worktree produced
false local failures.

Validation (2026-09-18):
- `entif-site:verify`: pass; 21 unit tests pass; generated HTML, duplicate IDs, local links,
  assets, and fragments pass across 217 HTML pages.
- Playwright: 237/237 pass, including all generated-page axe WCAG 2.0/2.1/2.2 A/AA plus
  best-practice audits, reflow, 200% text plus WCAG spacing, keyboard/native disclosure,
  reduced motion, touch behavior, and the short-route editorial regression.
- `test-results/.last-run.json`: `passed`, no failed tests.
- Lighthouse configured page/device runs: accessibility, best practices, and SEO all 100;
  report performance 99–100, homepage desktop 100, homepage mobile 91 in this lab run.
- `git diff --check`: pass.

PR #1621's pre-fix Entif site CI failure was reproduced locally and matched the two
short-route SC 2.5.8 failures above. No merge or PR closeout performed.
