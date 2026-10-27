# MiloBroker user testing guide

## Get ready

1. Open the project folder in a terminal. Run `npm ci`, then `npm run dev`.
2. Open http://127.0.0.1:4173 in a browser.
3. For mobile layout checks, use browser device emulation. For a real phone, run `npm run dev -- --host 0.0.0.0` on a trusted local network and open your computer's local IP with port 4173. Stop that server after testing.
4. Do not send test enquiries to the business unless agreed with the account owner. A WhatsApp button only prepares a message; you can close it without sending.

## User acceptance scenarios

| ID  | What to do                                                                          | Expected result                                                                                                                         |
| --- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| U01 | Read the first screen on a laptop and phone.                                        | MiloBroker appears as text; no obsolete logos. The purpose, WhatsApp action and sample-phone disclaimer are understandable.             |
| U02 | Select each header link. On mobile, open Menu first.                                | The matching section appears below the sticky header. The mobile menu closes after selection.                                           |
| U03 | Select Tenants & Buyers, Owners & Agents, and Builders under How it works.            | One role is selected at a time. Its title, three steps, message, action and future-video label change together.                         |
| U04 | On a narrow phone, check all three tabs and select Builders.                | All three icon-and-text tabs fit on screen without swiping. The panel stacks vertically and remains readable.            |
| U05 | Click a role's WhatsApp action.                                                     | WhatsApp/Web opens with the configured business number and the selected role's sample message. You can edit or close it before sending. |
| U06 | Select the main Chat on WhatsApp action and the final Say hello action.            | Each opens a general MiloBroker enquiry to the same business number. Verify the recipient with the account owner before launch.         |
| U07 | Open and close each FAQ.                                                            | Its answer appears under the question; the control works by mouse, touch, Enter and Space.                                              |
| U08 | Reload, press Tab, then Enter on Skip to content. Continue using only the keyboard. | Main content receives focus. Links and controls have visible focus. The hidden mobile menu is skipped.                                  |
| U09 | Focus a role tab. Press Left/Right, Home and End.                                   | Selection and focus move together, wrap at the ends, and reach first/last roles. Tab moves into the selected panel.                     |
| U10 | Open the mobile menu, focus a navigation link, then press Escape.                   | The menu closes and focus returns to Menu.                                                                                              |
| U11 | Check 320, 360, 390, 650, 768, 850, 1024, 1440 and 1920px widths; rotate a phone.   | No page-level horizontal scrolling, overlap or clipped text. All three tabs remain visible together.                             |
| U12 | Set browser zoom to 200%, then 400% on a desktop.                                   | Content reflows, all sections/actions remain reachable and the mobile menu is available when needed.                                    |
| U13 | Enable reduced motion in system accessibility settings.                             | Section jumps do not animate. The site stays fully usable.                                                                              |
| U14 | Read the page with NVDA, VoiceOver or TalkBack.                                     | Landmarks, headings, role selection, steps, FAQ states and new-tab link descriptions make sense. Decorative elements are skipped.       |
| U15 | Check the video panel for every role.                                               | Coming soon is clearly visible. There is no misleading active Play button or empty player.                                              |
| U16 | Temporarily block external images/fonts or use an offline local page.               | The locally rendered phone illustration, typography and page remain intact. WhatsApp itself requires connectivity.                      |
| U17 | Use all footer links.                                                               | Each navigates to the correct section; Back to top reaches Home.                                                                        |

## Typography and local-library checks

- At default font settings, body text and tab labels should be at least 16px, footer text 14px, subheadings 24px and section headings 32px. Browser font preferences and zoom should enlarge them naturally.
- Check that all three tabs show their full labels and icons at 320px and larger widths. Each combined guide should mention both relevant roles.
- Open browser Network tools and reload. CSS, scripts, icons and illustrations should load from the local site; there should be no Tailwind CDN, remote icon font or remote stylesheet request.

## Automated checks

```sh
npm run build
npx playwright install chromium firefox webkit
npm test
npm run test:report
```

The suite checks branding, role content, keyboard navigation, mobile navigation, FAQ interaction, intercepted WhatsApp links, viewport overflow, reduced motion, skip-link focus, page errors, minimum font sizes, locally bundled assets and WCAG A/AA rules supported by axe. Five browser/device projects run the same scenarios. The WhatsApp test intercepts the destination and does not contact or message the business.

The accessibility scanner is a useful check, not a certification. Manual screen-reader, zoom, real-device and live-recipient checks above are still required. Browser emulation is not a substitute for testing on physical iOS/Android devices.

## Report an issue

Record the scenario ID, browser/device, screen width or zoom level, steps, expected result and actual result. Add a screenshot if useful. Distinguish website problems from WhatsApp account, network or backend availability problems.

## Before publishing

- Confirm the WhatsApp account and business ownership.
- Review copy, available services, fee explanations and copyright information with the business owner.
- Run the production build and automated suite; complete the manual checks relevant to your supported devices.
- Keep example properties labelled. Replace sample content with real information only when it is ready and authorised.
- When videos are added, verify captions, playback and the matching written instructions.

## Historical validation — initial redesign, 5 October 2026 (before Tailwind migration)

- `npm run build`: passed (TypeScript checks and Vite production build).
- All 10 scenarios passed on desktop Chromium, mobile Chromium, desktop WebKit and mobile WebKit: 40 passing scenario/project combinations across the initial run and targeted reruns.
- WebKit initially exposed a skip-link focus difference. Explicit keyboard focus on the skip link fixed it; the affected desktop/mobile WebKit checks and Chromium regression checks passed.
- The nine-width mobile WebKit layout test needed more than the default 30-second test budget. Its timeout is now 90 seconds and it passed in about 57 seconds, without suppressing assertions.
- No axe WCAG A/AA violations were found in any of the five role panels or the expanded FAQ state in the four working browser profiles.
- Desktop (1440px), tablet (768px), phone (390px) and small-phone (320px) full-page previews were captured and visually inspected. Screenshots are in `docs/previews/`.
- Firefox's 10 checks could not execute: Windows rejected its executable with an incorrect side-by-side configuration (`browserType.launch: spawn UNKNOWN`). The Firefox project remains enabled for CI and other machines; it is not counted as passed.
- Physical-device testing, manual screen-reader/zoom acceptance and confirmation of the live WhatsApp business account remain owner checks. No WhatsApp messages were sent.

To run the four locally verified projects without the unavailable Firefox runtime:

```sh
npm test -- --project=chromium --project=webkit --project=mobile-chrome --project=mobile-safari --workers=2
```

To refresh the saved previews, start the dev server and run `node scripts/capture-preview.mjs`.


## Current validation — Tailwind migration, 5 October 2026

- Production build and TypeScript checks passed with local Tailwind CSS 4 and Lucide React.
- All 44 checks passed in one run: 11 scenarios across desktop Chromium, desktop WebKit, mobile Chromium and mobile WebKit.
- Tests verify exactly three combined tabs, decorative local SVG icons, role-specific content/links, keyboard controls, nine-width reflow, minimum type sizes and no external styling/font/icon requests.
- All three tabs fit together at the tested mobile, tablet and desktop widths; screenshots were refreshed and visually reviewed.
- Accessibility scans passed for the three combined panels and expanded FAQ state.
- Firefox was not rerun because of the previously recorded Windows runtime limitation. Its project remains configured; no new Firefox compatibility claim is made.


## Welcome and PG-content acceptance checks

- The first screen should emphasize “No extra app. Just WhatsApp.” with Post/Search/Promote as a supporting message. There should be no subscription section or free/paid badges in the hero, feature cards or role guides.
- The three feature cards should appear without the previous duplicate headline and eyebrow.
- Posting copy and the Owners & Agents guide should include PG operators, room-sharing options, facilities, meals, rent and deposit. Search guidance should include PG rooms.
- PG posting enquiries should be prefilled with “property or PG room”; inspect without sending.
- The service-charges FAQ should be collapsed initially and explain the existing free/paid distinctions when opened. Removing promotional fee labels must not imply the services are all free.
