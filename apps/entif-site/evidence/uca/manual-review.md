# Manual evaluation record and open gates

Date: 2026-10-11. Reviewer: Codex. Scope: `/projects/`, including global header/footer, all seven systems, native fallback, public links and the illustrative scenario.

## Completed browser review

An actual Chrome tab loaded the built preview. Keyboard and accessibility-tree inspection observed:

1. The first Tab reaches the skip link; activating it moves focus to `main-content`.
2. Rosetta initially exposes one selected tab and one active panel. Down moves selection and focus to Bilqis. The accessibility tree exposes the tab group, named tabs, selected state and corresponding panel.
3. End moves to Guard / TripWire. Tab focuses that panel; Shift+Tab returns to its selected tab. Home returns to Rosetta.

This is agent-operated keyboard/tree evidence, not a screen-reader speech or human usability evaluation. Responsive touch, forced colors, reduced motion, print and text-spacing behavior also passed automated browser checks; physical mobile AT was not exercised.

## Desktop screen reader — NOT_EVALUATED

Use a Mac with Safari and VoiceOver, or record an equivalent desktop reader/browser pairing. Start the built preview and record the source revision, OS, browser and reader versions.

1. Enable VoiceOver through Accessibility settings. Configure Safari keyboard navigation so Tab visits page controls. Load `/projects/` and listen to the page title and language.
2. Activate the skip link and confirm it bypasses global navigation. Use the reader's landmark and heading navigation to verify one main region, one H1 and a coherent seven-stage reading order. The decorative orbit and emblems should not add repeated system names or unexplained symbols; the human-agency explanation must remain readable.
3. Use the VoiceOver rotor menu (`VO+U`, where VO is the configured VoiceOver modifier) to inspect headings and links. Confirm the four project detail destinations and available research links have intelligible names. Opaque unpublished ETR references must remain text, not inaccessible destinations. [Apple's Mac rotor guidance](https://support.apple.com/en-lamr/guide/voiceover/mchlp2719/mac) documents the navigation commands.
4. Reach and interact with the architecture tab group. With reader navigation keys appropriately passed to the control, exercise Up/Down, Home/End, wrapping, Space and Enter. Listen for the system name, tab role and selected state. Confirm automatic activation exposes only the matching panel, followed by its text and any project link.
5. Tab from the selected tab into its panel and through its links; reverse with Shift+Tab. Confirm focus order, announcements and visible focus agree. Resize through the narrow threshold and repeat with Left/Right. The selected system must persist, and the focused tab must remain visible.
6. Read the future scenario and closing without animation. Confirm the hypothetical scene is clearly labelled. Reload with application JavaScript disabled and read all seven system sections in document order; native anchor links must reach their panels.
7. Record exact announcements, failures, screenshots where useful and criterion IDs. Sign/date the result; repair concrete findings and rerun affected automated checks.

## Mobile/touch screen reader — NOT_EVALUATED

Use an iPhone with Safari and VoiceOver on a narrow display. The reviewer must provide a reachable preview of the same built revision; this procedure does not authorize deployment. Record model, OS, browser, reader and orientation.

1. Enable VoiceOver in Accessibility settings. Load `/projects/`; explore by touch and sequential swipes. Verify the title, skip navigation, headings, human-agency text and reading order.
2. Use the rotor to navigate headings and links; tap a tab to focus it, then double-tap to activate it. The reader must identify the system and selected state. Test all seven tabs, including those initially outside the horizontally scrollable rail. The active panel must be discoverable immediately after the control group, and inactive panels must be absent from reader navigation.
3. Follow each available project and research link, then return. Confirm there are no invented or private source destinations. Read the scenario's illustrative label and all seven steps.
4. Rotate to landscape and back while a late system is selected; verify selection, visible focus and reading position. Increase text size and repeat rail/panel reading. Check that touch exploration does not lose controls behind clipped content.
5. Repeat the native fallback with JavaScript disabled if supported by the browser. Record spoken output, touch reachability, content loss, duplicates, timing and unexpected context changes. Sign/date the result and attach the exact revision.

Apple documents [rotor navigation](https://support.apple.com/en-ie/guide/iphone/iph3e2e3a6d/ios) and [touch selection/activation](https://support.apple.com/en-gb/111796). The requested workflow is a test procedure; no device result is asserted here.

## Actual browser zoom — NOT_EVALUATED

Automated effective reflow at 320 CSS px, root text size 200%, spacing overrides and long labels passed. An attempted zoom shortcut in the isolated Chrome review tab did not change its measured CSS viewport; it supplies no browser-zoom proof.

1. Open this built revision in a visible desktop Chrome window. Set the content viewport to 1280 CSS px at 100% and record its dimensions.
2. Use the browser's actual zoom menu to select 200%, then 400%. At 400%, record `window.innerWidth` and the displayed zoom level; the effective viewport should be approximately 320 CSS px. Do not substitute CSS `zoom`, device emulation or a changed screenshot scale.
3. Read every stage, activate every tab and use all links. Confirm no horizontal document scrolling, clipped text, unavailable controls or hidden focus. Internal rail scrolling is permitted; the rail must not enlarge the document.
4. Test text-only enlargement where supported, then restore 100%. Record screenshots, overflow measurements, browser/version, exact zoom and outcome for 1.4.4 and 1.4.10.

## Author signoff — OPEN

Crates must review the visible design, narrative/source publication posture, remaining accessibility evidence and final publication decision on parent #1801. This draft PR and passing machine checks do not supply that approval. No merge, deployment or issue closure has been performed.
