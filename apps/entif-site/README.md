# Entif AI site

Static public site for Entif AI, compiled with Astro and deployed from the Rosetta monorepo.

## Design constraints

- Static HTML by default; React is reserved for interactive islands.
- Public content is authored in `apps/entif-site/content/**/*.md` and validated at build time.
- Homepage narrative copy lives in `apps/entif-site/content/pages/home.md`; research and project entries remain in their dedicated content subdirectories.
- The Projects showcase narrative lives in `content/pages/projects.md`; its schema fixes the seven-system identity/order and resolves links only from published metadata. Its explorer enhances complete static sections with keyboard-accessible tabs.
- `status: published` is required before a content entry receives a public route or homepage publication.
- Stable content IDs, topics, project references, and explicit relations are machine-readable frontmatter for routed research/project entries.
- Related-content links are generated deterministically from explicit relations, shared projects, and shared topics.
- Common index/informational page anatomy is owned by `src/layouts/ContentPageLayout.astro`; individual pages compose content into that shared shell rather than copy its heading, spacing, and responsive structure.
- The current Entif logo lives at `public/brand/entif-logo.webp` and is derived from the project-provided source artwork.
- Shared styling uses modular SCSS and runtime CSS custom properties, retaining the serif system-font stack. No UI framework or external font request is required.

Cross-project design priorities come from [`../../docs/governance/Genesis.md`](../../docs/governance/Genesis.md) and [`../../docs/governance/genesis/INTERFACE_AND_ACCESSIBILITY.md`](../../docs/governance/genesis/INTERFACE_AND_ACCESSIBILITY.md). Site-specific tokens, typography, breakpoints, interaction rules, and publication guidance are documented in [Design.MD](Design.MD).

## Quality gates

From the repository root:

```sh
pnpm exec nx run entif-site:format:check
pnpm exec nx run entif-site:lint
pnpm exec nx run entif-site:stylelint
pnpm exec nx run entif-site:typecheck
pnpm exec nx run entif-site:test
pnpm exec nx run entif-site:build
pnpm exec nx run entif-site:e2e
```

`verify` runs every non-browser gate. The feature suite uses Playwright plus axe and checks publication behavior, native disclosure, keyboard access, responsive typography and overflow, text enlargement and spacing, and all configured WCAG 2.2 AA axe findings on every generated page. `entif-site:html` validates generated HTML and local links; `entif-site:lighthouse` measures the homepage, Projects, two research reports and Editorial opening/references on mobile and desktop. Optional `LIGHTHOUSE_ROUTES=projects` and `LIGHTHOUSE_CATEGORIES=performance` restrict a diagnostic run; the default still audits every route/category. [UCA evaluation evidence](evidence/uca/README.md) records observed results and the remaining manual release gates.

`src/styles/global.scss` composes responsibility-based modules through `@use`/`@forward`. `_layers.scss` owns the single shared cascade order; `settings/_tokens.scss` owns runtime tokens and `settings/_breakpoints.scss` owns named thresholds. Stylelint checks token references against that canonical source. `FullWidthPageLayout.astro` composes the document/chrome in BaseLayout; `.stage-shell` and `.reading-measure` provide shared interior boundaries. [Legacy Editorial CSS](src/styles/editorial/README.md) remains isolated, with explicit compatibility rules preserving its former spacing/tracking across the migration.

Playwright uses `tools/preview.mjs`, the foreground Astro preview API. Restart a manual preview after rebuilding to refresh its static-file cache; stop it before `entif-site:e2e` so Playwright retains exclusive server ownership.

Project-owned UI tests locate rendered elements through stable `data-test-id` attributes. Test IDs describe semantic responsibility rather than localized copy, CSS, DOM position, or visual treatment. Accessibility semantics remain user-facing contracts and are tested independently; test hooks do not replace them. The cross-project rule is defined in [`../../docs/governance/genesis/ASSURANCE_AND_OPERATIONS.md`](../../docs/governance/genesis/ASSURANCE_AND_OPERATIONS.md).

## Deployment

The intended production target is the custom-domain root. Set `ENTIF_SITE_URL` to the authoritative origin, such as `https://entif.ai/`; Set `ENTIF_SITE_BASE` to `/` for the custom domain or `/rosetta` for repository-subpath hosting. Both variables are included in the Nx build cache key. Repository-subpath URLs are staging/fallback behavior, not the canonical production route model.

## Editing and localization

Shared interface strings live in `content/ui/en.md`; page and demo narratives live in `content/pages/`. All rendered text is compiled at build time. Research frontmatter includes report ID, version, independent-review status, and evidence cutoff. `status: published` controls website availability and does not imply peer review. Add articles as `kind: essay` or `kind: update` in `content/articles/`, with the same publication schema and stable routeTag.

## Nx and Pages

Workflow path filters avoid runs for unrelated source changes. Triggered runs use `nx show projects --affected` and skip site work if `entif-site` is absent. Lockfile changes use Nx dependency-based `auto` detection. Build results are cached with Node version and deployment environment in their inputs, and CI persists `.nx/cache`. Manual Pages dispatch intentionally rebuilds or restores the site artifact. The publishing destination remains GitHub Pages.
