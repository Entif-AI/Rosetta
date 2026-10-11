# Legacy Editorial styles

These route-local CSS files preserve the existing ETR-2026-07 chapter experience.
They remain outside the shared SCSS design system and its Stylelint scope. Do not
extract their scenes or chapter overrides into shared components. Issue #1603
owns their separate creative redesign, which should consume the shared SCSS
foundation documented in `apps/entif-site/Design.MD`.

Their existing font exceptions, chapter navigation and citation treatment remain
local to Editorial. The shared header/footer inherit the canonical site serif.
