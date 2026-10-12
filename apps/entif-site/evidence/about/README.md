# About and doctrine review evidence

The author's reference guides the wide illustrated About page and D01–D14/D16 children. The current header is preserved. This bundle records implementation and local verification; it does not establish production publication or complete WCAG conformance.

## Content and artwork

[Content custody](content-sources.json) records source versions, snapshots and hashes. All fourteen full-text documents match the native source bodies after whitespace and smart-typography normalization; list counts and nesting match too. D01 retains its three native dates. D16 retains all 52 criteria and the First Draft / Astra Pass 1 source label. Titles and draft status are presented by the shared shell.

D05 is an explicitly labeled public overview of an internal counsel-facing brief. It does not publish the full brief. D15's research agenda is excluded following the author's later instruction and existing publication atlas. Opaque evidence references remain text; private link destinations and protected mechanisms are not published. Source fidelity does not independently validate the documents' historical claims or imply adoption, legal recognition or operational assurance.

[Artwork and exact prompts](artwork.json) records seventeen separate built-in imagegen generations: About, fifteen distinct thematic heroes and the globe closing. The supplied image was the aesthetic/portrait reference. All outputs were visually inspected and encoded as local responsive WebP assets, preserving their content and dimensions. The conceptual founder portrait is labeled; the quotation comes from existing authored About copy.

## Executable checks

[Check results](qa.json) identifies the final commands, scope and limits. The browser suite covers every generated route with axe, plus the new library journeys, all fifteen distinct loaded heroes, title/contents/neighbor navigation, source dates, 52 criteria, candidate/overview states, script-disabled biography and navigation, enlarged spaced text, forced colors and print. Real physical assistive technology remains separate from these checks.

[Header invariance](header-invariance.json) compares exact native HTML, dimensions and decoded RGBA pixels at 1440 and 390 pixels. Both match the pre-change capture with zero changed pixels. The header component and its styles were not edited.

[W3C Nu responses](w3c-nu.json) contain the actual generated-HTML input digests and HTTP results for About plus all fifteen children: HTTP 200, English, zero messages. [Lighthouse results](lighthouse.json) cover About, D01, D11 and D16 in mobile and desktop simulations. Accessibility, best practices and SEO score 100 throughout; performance ranges from 98 to 100. These are local lab observations, not field performance or a WCAG certification.

The full format gate exposed an existing ambiguity between mathematical identifiers and Markdown emphasis in the Prepaying Semantics manuscript. A single local Prettier-ignore comment protects that paragraph. Its normalized rendered text and paragraph/emphasis structure were checked unchanged.

## Visual review

- [About desktop](screenshots/about-1440.webp) and [phone](screenshots/about-390.webp).
- [Principles](screenshots/about-principles-1440.webp), [founder](screenshots/about-founder-1440.webp), [doctrine library](screenshots/about-library-1440.webp) and [closing](screenshots/about-closing-1440.webp).
- [D07 full reading page](screenshots/epistemic-integrity-1440.webp) and [phone](screenshots/epistemic-integrity-390.webp).
- [D11 desktop hero](screenshots/delegated-authority-hero-1440.webp) and [phone hero](screenshots/delegated-authority-hero-390.webp).
- [D16 desktop hero](screenshots/governance-criteria-hero-1440.webp), [phone hero](screenshots/governance-criteria-hero-390.webp) and [criteria reading](screenshots/governance-criteria-reading-1440.webp).

Screenshots are compressed review views. The four original header PNGs remain lossless for exact comparison. Generated artwork originals remain in the tool-managed cache; final site assets are tracked under `src/assets/about/`.

## Remaining human evaluation

| Evaluation                                 | State         | Repeatable procedure                                                                                                                                                                                                |
| ------------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Physical desktop assistive technology      | NOT_EVALUATED | Use VoiceOver/Safari and NVDA/Firefox or Chrome. Check landmarks, single page heading, hierarchy, meaningful links, native biography state, library reading order, contents navigation and reading all 52 criteria. |
| Physical phone assistive technology        | NOT_EVALUATED | Use VoiceOver/iOS and TalkBack/Android. Navigate About and D11/D16, activate reading and return links, open the biography and verify reading order and touch target access.                                         |
| Actual user browser zoom                   | NOT_EVALUATED | Set native browser zoom to 200% and 400% on About and D11/D16. Confirm reflow, keyboard access and complete text without horizontal scrolling. Automated enlarged-text checks do not substitute for this.           |
| Author design/content/publication approval | OPEN          | Review the reference match, individual artwork, candidate text, D05 overview and D15 exclusion. Approve the concrete draft before production publication.                                                           |

No new deployment or institutional adoption is claimed.
