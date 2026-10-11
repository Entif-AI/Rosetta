# Projects UCA evaluation

Evaluated on 2026-10-11 for #1657 and #1801–#1807. Implementation and automated assurance are complete. Desktop/mobile assistive technology, actual browser zoom and the author's design/content/accessibility/publication approval remain open gates on #1801. This bundle does not certify complete WCAG conformance or production readiness.

## Observed results

| Check                                       | Result                                                                                                                                                                                   | Receipt                                                                                                                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nx integrated verification                  | Format, ESLint, Stylelint, Astro check, unit, build and HTML/link checks passed; 58 checked files with no diagnostics; 44 unit tests; 252 generated routes; 253 validated HTML documents | [Machine summary](machine-results.json)                                                                                                                           |
| Complete Playwright suite                   | 286 passed; no failures, skips or flaky results; Chromium; 51.5 seconds                                                                                                                  | [Machine summary](machine-results.json), [Projects tests](../../tests/features/projects.spec.ts)                                                                  |
| Projects axe states                         | Seven panels at 1366px and 390px plus one static DOM snapshot: zero violations under the configured WCAG A/AA and best-practice tags                                                     | [15 state receipts](axe-states.json)                                                                                                                              |
| Gradient contrast                           | Axe leaves `color-contrast` incomplete in every Projects state. Separate CSS palette calculations pass 4.5:1 for each recorded text pair; focus/selection colors also clear 3:1          | [Calculations](contrast-ratios.json), [Computed CSS sample](computed-palette.json)                                                                                |
| Generated markup                            | W3C Nu: HTTP 200, no messages, English; generated HTML and enhanced DOM submitted separately                                                                                             | [Actual Nu responses and input digests](w3c-nu.json)                                                                                                              |
| Lighthouse                                  | Projects: 100 performance/accessibility/best-practices/SEO on mobile and desktop; all six configured routes audited in both modes                                                        | [12 extracted reports](lighthouse.json)                                                                                                                           |
| Responsive geometry                         | All requested viewports, wide/short screens and doubled text inspected; no document-wide overflow; at 320px hero inset is 20px on both sides                                             | [Measurements](geometry.json), [Screenshots](#screenshots)                                                                                                        |
| Shared-page regression                      | Six homepage/Editorial opening/references images at 1440px and 390px have zero changed pixels; inspected layout styles and all 17 chapter paragraph/heading styles match                 | [Pixel comparison](shared-pixel-comparison.json), [Layout comparison](shared-layout-comparison.json), [Chapter style comparison](editorial-style-comparison.json) |
| Native Chrome keyboard / accessibility tree | Skip link reaches main; Down selects Bilqis; End selects Guard / TripWire; Tab enters the active panel; Shift+Tab returns; Home restores Rosetta                                         | [Manual review record and remaining procedures](manual-review.md)                                                                                                 |

The earlier performance-only diagnostic scored Projects 90 mobile / 100 desktop with zero CLS. The final full-category run scored 100 in both modes. These are observed local lab results, with analytics enabled in Lighthouse, and do not predict production scores. Automated screenshots/geometry abort the external analytics request to keep their rendering deterministic.

## Reproduce

Run from the repository root with the committed lockfile and Node version:

```sh
pnpm install --frozen-lockfile
NX_DAEMON=false pnpm exec nx run entif-site:verify
PLAYWRIGHT_JSON_OUTPUT_FILE=/tmp/entif-uca-e2e.json NX_DAEMON=false pnpm exec nx run entif-site:e2e -- --workers=4 --reporter=list,json
LIGHTHOUSE_OUTPUT=/tmp/entif-uca-lighthouse NX_DAEMON=false pnpm exec nx run entif-site:lighthouse
curl --fail --silent --show-error -H 'Content-Type: text/html; charset=utf-8' --data-binary @apps/entif-site/dist/projects/index.html 'https://validator.w3.org/nu/?out=json'
shasum -a 256 apps/entif-site/dist/projects/index.html
```

No manually owned preview may occupy port 4322 when running Playwright. For inspection after building, run `node tools/preview.mjs` from `apps/entif-site`; restart it after each new build because Astro's preview caches static files.

The genuine script-disabled browser test checks all seven readable sections and native fragment navigation. Axe requires JavaScript: its separate audit captures that browser's DOM, removes application script elements, and runs axe in an auditing context with identical visible content, static roles and all seven visible panels. It does not claim that axe ran with JavaScript disabled.

## Evidence provenance

[Source manifest](source-manifest.json) identifies the tested source bytes, generated HTML, package versions and the last committed implementation checkpoint. QA code was present in the worktree during verification and committed with this bundle. These extracted receipts retain the original local report SHA-256 digests; full raw browser/Lighthouse reports can be regenerated by the commands above. Host paths, browser profiles, cookies and external request details are excluded from the committed extracts.

The initial screenshot directory was cleared by Playwright's output cleanup. The comparison baseline was therefore **regenerated from starting commit `65937be5391c2b66f9e2da0096e72f6f109bba52`**, using a temporary Git archive with unchanged Astro/runtime dependencies. It is not the initial capture. Both baseline and current shared screenshots are retained, together with their exact byte digests and pixel counts. Projects intentionally changed and is not part of the zero-difference assertion.

## Screenshots

- [Complete Projects page, 390px](screenshots/projects-390.png)
- [Hero, 1366px](screenshots/hero-1366.png) and [320px with doubled text](screenshots/hero-320-text200.png)
- [Architecture, desktop](screenshots/architecture-1366.png) and [mobile](screenshots/architecture-390.png)
- [Future scenario, desktop](screenshots/scenario-1366.png) and [320px with doubled text](screenshots/scenario-320-text200.png)
- Shared homepage/Editorial before-and-after images: [baseline](screenshots/baseline/) and [current](screenshots/current/); exact matching pairs appear in [the comparison receipt](shared-pixel-comparison.json).

## Release gates

[The per-criterion matrix](wcag-2.2-aa.md) covers all 55 WCAG 2.2 Level A/AA criteria. `PASS` means the described bounded test or inspected absence passed; `NOT_EVALUATED` remains open. There are no observed unresolved automated violations. Real desktop/mobile reader output and actual browser zoom were not established. Follow [the exact manual procedures](manual-review.md), record reviewer/device/browser/reader versions and observations, then route findings to the owning implementation child. Author approval on #1801 remains required before merge/publication.

Standards: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WCAG-EM](https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/) and [W3C Nu HTML Checker](https://validator.w3.org/nu/).
