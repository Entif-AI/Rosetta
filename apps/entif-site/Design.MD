# Entif AI design system

Version: 1.2.0 · October 11, 2026

## Intent and authority

A quiet, inspectable interface for consequential ideas. Light surfaces, warm brown actions, disciplined typography, and a four-stage provenance journey draw on the supplied design references. The author's current website requirements control; the design transcript is reference material. Retain the existing Entif logo until an approved replacement exists.

The canonical slogan is **So They Claim. WE Keep Receipts.** Preserve capitalization and punctuation. Prefer one line when space allows, but permit wrapping for narrow viewports and enlarged text. Never shrink below the minimum to force a lockup.

This application implements the public presentation surface only. The repository publication-boundary and authority-closure doctrines and Genesis Interface and Accessibility companion were reviewed. No protected bridge edge governs website presentation; no Rosetta semantic or operational contract is redefined. The author explicitly authorized publication of the two supplied manuscripts. Keep independent-review status and scientific limitations visible.

## Palette and surfaces

| Role                  | Token           | Value     |
| --------------------- | --------------- | --------- |
| Primary text          | `--ink`         | `#012664` |
| Secondary text        | `--muted`       | `#536383` |
| Links, actions, focus | `--accent`      | `#613535` |
| Selected panel        | `--accent-soft` | `#f6e9de` |
| Supporting status     | `--teal`        | `#08786b` |
| Decorative boundary   | `--line`        | `#d5dbea` |
| Cards                 | `--surface`     | `#ffffff` |
| Page canvas           | `--canvas`      | `#f6f7fd` |

The header blends the canvas and white surface behind the existing logo; the canvas is cool gray; detail and principles panels use warm cream. Decorative borders do not communicate state alone. Interactive elements have names, focus indicators, and native state. Do not imply verification through green badges unless actual verification evidence exists.

## Typography

The canonical site stack is `'Plantagenet Cherokee', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', Times, serif`. Retain it on the header, footer and page narrative. The earlier sans-serif requirement was erroneous and is superseded by the author's October 11 correction. Legacy Editorial display/navigation exceptions stay local to that experience. Monospace is reserved for code; no downloaded fonts. `rem` honors the browser's default text size. At the default 16px root:

| Role                | Size               | Weight    | Letter spacing |
| ------------------- | ------------------ | --------- | -------------- |
| Metadata / eyebrow  | 0.9125rem (14.6px) | 400 / 600 | normal / 0.1em |
| Body                | 1rem (16px)        | 400       | normal         |
| Lead / card stage   | 1rem (16px)        | 400 / 500 | normal         |
| Third-level heading | 1.375rem (22px)    | 650       | -0.025em       |
| Section heading     | 1.7rem (27.2px)    | 650       | -0.025em       |
| Page heading        | 2.5rem (40px)      | 650       | -0.025em       |

Authored line-height is 1.4 for body and 1.2 for headings. Eyebrows alone use uppercase and expanded tracking. Small screens reduce page and section headings to 32px and 26px; the short homepage slogan has a bounded 20–32px scale. User text-size and spacing overrides take precedence over these authored sizes. Do not enforce a maximum on user zoom.

## Layout and responsive behavior

Use the shared site header, footer, and content-page layout. Center content within a 90rem shell with 2rem desktop gutters and 1rem mobile gutters. Reading width is at most 46rem. Base spacing follows multiples of 0.25rem, usually 0.5, 1, 1.5, 2, 3, and 4rem.

At 85rem, navigation uses its own row; at 70rem the hero stacks. At 48rem, content grids become a single column and provenance cards become a vertical thread. Publication metadata precedes the body on narrow screens, with a table of contents for long reports. Tables may scroll within their own container; the document must not overflow. Test portrait and landscape at 320, 390, 768, 844, 1024, 1366, and 1536px widths, plus reflow and user spacing overrides.

## Stylesheet ownership and cascade

`src/styles/global.scss` is the shared entrypoint. It consumes responsibility-oriented settings, base, layout, components, patterns, pages and utilities modules with Sass `@use`; curated settings/tools entrypoints use `@forward`. Do not use Sass `@import`.

`src/styles/_layers.scss` declares the single shared order:

```scss
@layer reset, tokens, base, layout, components, patterns, pages, utilities;
```

Runtime tokens are CSS custom properties defined in `settings/_tokens.scss`. The only Sass values are compile-time geometry: named thresholds in `settings/_breakpoints.scss`. Navigation changes at 85rem, the homepage hero at 70rem, compact content at 48rem, tagline sizes below 54.375rem and at 45rem, and wide headings above 100rem. `tools` exposes named media queries, visible focus and padded content boundaries; use intrinsic layout and fluid sizing before adding thresholds.

Shared modules own reusable site responsibilities; page-local SCSS belongs in the `pages` layer and must not redefine the global palette. Utilities own reduced-motion, forced-color and print behavior. Stylelint checks CSS/SCSS through `entif-site:stylelint`, included in `entif-site:verify`; Prettier owns formatting and checks `.scss` files. Contextual descendant rules are deliberate; duplicate selectors/declarations, empty blocks, invalid properties and needless lint disables remain checked.

`src/styles/editorial/` is explicitly legacy, route-local CSS outside the shared module system and Stylelint migration. Preserve its functioning chapter/citation experience. Issue #1603 owns its separate redesign; new work consumes this foundation rather than extending the legacy scene system.

## Provenance interaction

Native `details` / `summary` provides keyboard, touch, and no-JavaScript disclosure. Cards retain a fixed height when opened; the receipt scrolls within the card and supports keyboard focus. The front uses a familiar stage icon, name, and information symbol; the expanded face presents a claim, explanation, and lineage context. JavaScript closes the previous card when another opens. The example is fictional and labeled as illustrative; a receipt does not certify truth.

A lightweight CSS corner peel appears on pointer hover. Touch devices receive at most one 1.2-second corner cue, ten seconds after load, only if no card was used and the target is fully visible in an active document. No loop or idle retry. Navigation/refresh establishes a new visit. Reduced-motion users receive no peel or animation. Native disclosure is the functional behavior, not a dependency on the animation.

## Content and publication

All displayed copy is authored in Markdown with frontmatter under `content/`. `content/ui/en.md` owns shared interface strings; `content/pages/` owns page narrative and demonstration copy; `content/research/`, `content/articles/`, and `content/projects/` own publications. Astro validates and compiles these at build time. Dates and counts are formatted data. Preserve stable content IDs and route tags. Add a locale and locale-aware route policy as a deliberate future migration rather than duplicating strings in components.

Existing `/tags/{tag}/{year}/{month}/{day}/{slug}/` routes remain stable. Research and Articles are separate indexes; `/archive/` and `/tags/{tag}/` expose year, month, and day indexes. The legacy Team and Projects entry points remain available. Research details support authors, report ID, version, review status, evidence cutoff, manuscript download, headings, figures, references, and related work. Published means available on the website, not peer-reviewed.

Publication diagrams retain their authors' scientific visual encoding; readable captions and adjacent prose supply context. Do not restyle a scientific figure in a way that changes its meaning.

## Accessibility and assurance

WCAG 2.2 AA is the target and required acceptance standard. Use native controls, meaningful landmarks, one primary heading, visible keyboard focus, descriptive links, and text alternatives. Navigation and social controls have at least 44px targets. Do not restrict orientation or zoom. All meaningful information must remain usable without animation or JavaScript. Verify every generated page with axe, HTML validation, internal-link checks, keyboard disclosure and skip-link checks, and responsive reflow. Automated tests cannot establish complete WCAG conformance; document the bounds of manual and assistive-technology review accurately.

Primary standards: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html).

## Performance and builds

Static HTML and CSS first. Homepage JavaScript is progressive enhancement; no React hydration, web fonts or image hero. BaseLayout owns the existing Google Analytics script; new presentations add no third-party runtime. SVG research figures are lazy-loaded with intrinsic dimensions. Record mobile and desktop Lighthouse results for the homepage and both long reports; aim for 100 in each category and investigate regressions.

Nx build caching includes source, dependency inputs, Node version, `ENTIF_SITE_URL`, and `ENTIF_SITE_BASE`. Deployment uses GitHub Pages as before. Workflow path filters and Nx affected-project checks prevent unrelated source changes from rebuilding the website. Dependency-affect analysis uses Nx's `auto` lockfile policy. See [Nx affected](https://nx.dev/docs/features/ci-features/affected) and [inputs](https://nx.dev/docs/reference/inputs).

## Header and reading controls

The logo is 3.5rem square, with descriptive alternative text. The header has a 4rem minimum height and 0.25rem block padding. The brand tagline uses h2 above 870px (54.375rem), h3 below that threshold, and body size at or below 45rem. Social icons are 2rem with 0.75rem gaps and do not change background on hover.

The home heading uses 2rem and weight 500 on desktop. Metadata and contents remain sticky beside long articles on desktop. A chevron-only, named Scroll to top button appears beyond the first viewport; reduced motion disables smooth scrolling. The footer uses body text and aligns its navigation beneath the identity, with copyright in a separate right column on desktop.
