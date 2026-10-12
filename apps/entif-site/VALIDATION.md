# Website redesign validation

Validated September 7, 2026 against the production static build.

## Results

- Nx `entif-site:verify`: formatting, lint, type checking, 17 unit tests, production build, and output validation passed.
- Playwright: 46 tests passed. Every generated HTML page was checked with axe WCAG 2.0/2.1/2.2 A/AA rules plus best-practice rules, with zero violations.
- Nu HTML Checker 26.9.7 (d73d94b): no HTML errors across the generated site.
- Local output validator: all 32 HTML pages passed markup, duplicate-ID, local-link, asset, and fragment checks.
- Portrait and landscape reflow: 320×568, 390×844, 768×1024, 844×390, 1024×768, 1366×768, and 1536×1024 passed.
- 200% text size combined with WCAG text-spacing overrides at 320px passed.
- Keyboard skip link, native card disclosure, focus preservation, no-JavaScript disclosure, reduced motion, touch target sizes, and one-time touch cue passed.
- Desktop and mobile homepage and research layouts were visually inspected.
- GitHub Pages `/rosetta/` configuration: prefixed links, canonical URLs, report figures, and generated manuscript links passed. Root configuration was restored afterward.
- Nx affected checks: a change to `packages/rosetta-core/src/index.ts` excludes the site; homepage and deployment workflow changes include it. Repeated identical builds restore output from cache.
- Repository authority-closure governance check passed.

## Lighthouse

Local static-server measurements with Lighthouse 13.4.1. Scores are lab results; hosting, network, browser, and run-to-run conditions may change them. The server used for these measurements does not compress responses or configure production cache headers.

| Page                          | Device  | Performance | Accessibility | Best practices | SEO |
| ----------------------------- | ------- | ----------- | ------------- | -------------- | --- |
| Homepage                      | Mobile  | 100         | 100           | 100            | 100 |
| Homepage                      | Desktop | 100         | 100           | 100            | 100 |
| The Cost of Learning Too Late | Mobile  | 99          | 100           | 100            | 100 |
| The Cost of Learning Too Late | Desktop | 99          | 100           | 100            | 100 |
| After the Inflection          | Mobile  | 100         | 100           | 100            | 100 |
| After the Inflection          | Desktop | 100         | 100           | 100            | 100 |

The longer report's mobile first contentful paint was approximately 1.5s and largest contentful paint approximately 1.7s in the recorded run. Its full manuscript is present in the HTML; figures are lazy-loaded.

## Scope of assurance

These results establish the checks performed, not a third-party WCAG certification or an exhaustive assistive-technology audit. Native semantics, contrast, keyboard behavior, reflow, and motion were tested. A screen-reader user study was not performed. Production Lighthouse results should be rechecked after the approved pull request is merged and deployed.

The reports retain their scientific limitations and independent-review-pending labels. Website publication is distinct from peer review.
