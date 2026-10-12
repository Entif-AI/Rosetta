# Genesis Interface and Accessibility Companion

**Status:** Proposed companion to Genesis 0.4-draft  
**Purpose:** Accessibility, interaction clarity, responsive behavior, design-system use, and performance-aware interface defaults  
**Scope note:** This document governs operating practice for user-facing interfaces. It does not redefine Rosetta protocol semantics or Rosetta's UI-related StdPack mechanisms.

## 1. Priority order

For interface work, use the Genesis priority ladder:

1. security, privacy, rights, and trustworthy control;
2. accessibility, standards, and lawful interoperability;
3. reliability, performance, and resource efficiency;
4. usability and cognitive clarity;
5. aesthetics, novelty, and convenience.

A lower tier MUST NOT silently spend a higher one.

Examples:

- animation does not justify inaccessible motion;
- visual flourish does not justify a performance regression outside budget;
- minimalism does not justify hiding interactive affordances;
- brand expression does not justify semantic invalidity;
- convenience does not justify weakening authentication or privacy.

## 2. Accessibility baseline

For web experiences, WCAG 2.2 Level AA is the minimum general baseline unless a stronger applicable authority requires more.

WCAG 3 remains developing guidance until its status changes and a project explicitly adopts it at an appropriate maturity level. Do not claim WCAG 3 conformance while the standard does not support such a stable claim.

Accessibility is an architecture input. It begins with information structure, content, control semantics, focus behavior, and user journeys rather than an audit after visual design is complete.

## 3. Native semantics first

Prefer native semantic HTML and platform controls before custom widgets.

Custom widgets must justify the semantic and interaction cost they introduce.

Interfaces SHOULD preserve:

- complete keyboard operation;
- visible, predictable focus;
- logical DOM, reading, and focus order;
- meaningful headings and landmarks;
- useful labels and instructions;
- accessible names for controls;
- clear error identification and recovery;
- alternatives for non-text content;
- appropriate live-region/status behavior where needed;
- platform-standard interactions unless a better accessible pattern is demonstrated.

ARIA supplements native semantics. It should not be used to cosmetically bless an otherwise inappropriate element choice.

## 4. Interaction affordance must be obvious

A user should not have to hover, tap experimentally, read private documentation, or infer from fashion whether something is interactive.

Interactive controls, navigation, links, filters, status indicators, taxonomy labels, metadata, and decorative elements SHOULD have distinct visual and semantic grammar.

Do not rely on color alone.

Avoid the condition in which every concept becomes the same rounded rectangle. Buttons, badges, tags, filters, metadata pills, cards, status chips, and links should not become visually interchangeable merely because one component style was convenient.

The goal is extremely low cognitive tax: a first-time user should be able to predict what can be activated and what will happen without prior training.

## 5. State is communicated redundantly enough to understand

Critical state SHOULD be available:

- visually;
- semantically/programmatically;
- through text or iconography where needed;
- without relying on one sensory channel.

Users should be able to distinguish, as applicable:

- selected;
- current;
- expanded/collapsed;
- loading;
- stale;
- disabled;
- unavailable;
- denied;
- pending;
- failed;
- partially complete;
- destructive.

Do not hide partial failure behind a generally green surface.

## 6. Focus, sticky UI, and navigation

Sticky or collapsing headers can improve navigation, but the interaction must remain stable and accessible.

When using sticky/collapsing chrome:

- preserve sufficiently large targets;
- avoid cumulative layout shift;
- keep focus visible;
- ensure in-page anchors are not hidden under the header;
- use `scroll-margin` or an equivalent strategy where needed;
- respect reduced-motion preferences;
- do not make navigation disappear merely to maximize visual cleanliness;
- test unusual viewport heights, including landscape mobile and high-density displays.

A smaller scrolled state may be useful, but it should be a state change users can understand rather than a surprise transformation.

## 7. Responsive typography and layout

Responsive behavior should respond to available geometry, not merely a short list of device names.

Use fluid scales such as `clamp()` where appropriate, with explicit minimum and maximum bounds. Test:

- narrow portrait screens;
- mobile landscape;
- extra-wide high-density screens;
- zoomed layouts;
- text-only zoom;
- large default font preferences;
- short viewport heights;
- long localized strings.

Large display headings MUST NOT consume most of the useful viewport simply because the width is large.

Maintain a coherent ratio between headings, body text, metadata, navigation, and controls across responsive states.

## 8. Touch and motor accessibility

Targets SHOULD be large enough and separated enough for practical touch and motor variance.

Avoid interactions that require:

- precise pointer motion;
- hover-only discovery;
- rapid repeated gestures;
- drag-and-drop without an accessible alternative;
- short time windows without extension/control.

Destructive actions should be sufficiently distinct from adjacent routine actions.

## 9. Motion

Motion should communicate structure or change, not demand attention for its own sake.

Respect `prefers-reduced-motion` or equivalent platform settings.

Avoid motion that:

- creates vestibular discomfort;
- obscures focus;
- delays access to content;
- turns state changes into lengthy animations;
- becomes required to understand the interface.

## 10. Themes and semantic tokens

Light and dark themes SHOULD be derived from semantic design tokens rather than independently hand-tuned component values.

Theme mappings MUST preserve:

- contrast;
- focus visibility;
- hierarchy;
- interaction affordance;
- status meaning;
- disabled-state legibility;
- charts/visualization distinguishability.

Prefer semantic tokens such as surface, text, border, focus, critical, warning, success, action, and muted roles over component-specific hard-coded colors.

An explicit user override SHOULD take precedence over system preference and SHOULD persist when practical.

## 11. Design-system posture

Do not create a private design system merely because several components share CSS.

Review mature systems to understand what they solve well and where their assumptions differ from the project. Prefer one coherent compositional foundation plus documented deltas rather than a collage of unrelated patterns.

Candidate systems may include W3C/WAI patterns, Material, Apple HIG, Fluent, Vercel interface guidance, Carbon, Spectrum, GOV.UK, and other maintained sources appropriate to the product.

Popularity does not prove fitness. Evaluate each system by:

- accessibility;
- semantic quality;
- interaction clarity;
- adaptability;
- performance;
- maintenance;
- platform fit;
- design-token architecture;
- ability to leave.

A design system is not a substitute for product-specific accessibility testing or user judgment.

### 11.1 Shared layout contracts

When several views implement the same durable page or component anatomy, that anatomy SHOULD have one shared implementation rather than several copies that merely look alike today.

Shared layout primitives SHOULD centralize the invariants that are expected to move together, such as:

- semantic landmarks and heading structure;
- page-shell geometry and reading widths;
- gutters and spacing rhythm;
- responsive stacking and breakpoint behavior;
- repeated page-header, metadata, aside, or related-content structure;
- accessibility behavior shared by the pattern;
- stable test hooks for the shared contract.

Individual views SHOULD supply content and deliberate variation through composition, slots, props, or equivalent narrow seams instead of copying the surrounding structure and changing it locally.

Do not abstract incidental resemblance. Two views that happen to contain similar markup do not justify a universal component if their responsibilities are different or are likely to diverge. Prefer the smallest shared primitive that represents a real design or interaction concept.

Do not solve drift with a configurable mega-component whose option surface becomes harder to understand than the duplication it replaced. If callers routinely disable or override the abstraction's invariants, the boundary is probably wrong.

A repeated local change to equivalent page structure is a signal to inspect whether the shared contract is missing. Layout drift is not merely cosmetic: over time it creates accessibility, responsive, testing, maintenance, and cognitive inconsistencies that become expensive precisely because no single edit can repair them all.

## 12. Performance-aware interfaces

Front-end code and media must earn their cost.

Prefer:

- static/server-generated output when interactivity does not require client execution;
- progressive enhancement;
- small hydration islands or equivalent bounded interactivity where useful;
- lazy loading for non-critical features;
- responsive images sized for actual density/use;
- modern media formats with appropriate compatibility;
- explicit caching/invalidation semantics;
- minimized third-party scripts;
- performance budgets on critical journeys.

Measure representative mobile devices/networks and unusual viewports, not only a powerful developer desktop.

Lighthouse and Core Web Vitals are instruments. A perfect score does not excuse a confusing or inaccessible workflow, and one small score deduction does not automatically justify higher-risk redesign.

## 13. Accessibility assurance

Use automated accessibility tooling where it has high signal, but do not confuse automation with complete conformance.

Testing SHOULD include, proportionate to the product:

- keyboard-only use;
- focus order/visibility;
- screen-reader workflows;
- zoom/reflow;
- responsive orientation;
- contrast and non-color state cues;
- reduced motion;
- form errors and recovery;
- dynamic content announcements;
- target size and spacing;
- representative mobile/touch flows.

Automated findings should be understandable enough to repair. False positives that create large maintenance burden should be tuned rather than normalized as noise.

## 14. Content is part of the interface

Interface copy should state:

- what an action does;
- whether it changes state;
- why an action is unavailable;
- what failed;
- what the user can do next;
- when information is stale or unverified;
- irreversible consequences before commitment.

Do not use cleverness to hide uncertainty or risk.

## 15. Interface change review

Before accepting a material UI change, ask:

1. Is the interaction semantically correct?
2. Can a keyboard user complete it?
3. Is focus predictable and visible?
4. Is the affordance obvious without hover?
5. Does it work under zoom, reflow, mobile landscape, and unusual viewport geometry?
6. Is state communicated without color alone?
7. Does it respect reduced motion?
8. Does it preserve security/privacy boundaries?
9. Does it stay within performance budgets?
10. Does it make the user's job clearer rather than merely making the screenshot prettier?
