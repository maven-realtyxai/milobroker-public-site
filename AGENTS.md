# Agent guide — MiloBroker

## Scope and working approach

This file applies to the repository rooted here. Follow the user's current request and preserve unrelated working-tree changes. Inspect `git status` and the relevant source before editing; previous work may be uncommitted. Keep changes focused and avoid unrelated dependency upgrades or rewrites. Read nested agent instructions if any are added later.

## Product and architecture

MiloBroker is a React 18 + TypeScript SPA built with Vite and locally compiled Tailwind CSS 4. It is a marketing site with native section links and WhatsApp click-to-chat URLs, not a live property marketplace. There is no router, listing database, payment service or automated WhatsApp messaging in this repository. The Java backend lives outside this repository. One optional browser fetch reads its public contact endpoint; all links use the fallback number when the endpoint is not configured or fails.

Use **MiloBroker** for the product name. The legal owner in the footer is **Maven RealtyxAI (OPC) Pvt Ltd.** Branding uses the shared text name and a decorative local house icon in the header; obsolete raster logos were removed. Keep sample properties and the phone conversation explicitly illustrative. The confirmed USP is Post. Search. Promote.: property posting is free for owners and agents, property search is paid for tenants and buyers, and builders pay for premium advertising. Keep the opening welcoming: emphasize “No extra app. Just WhatsApp.” and Post/Search/Promote, with no pricing badges, subscription sections or fee-focused guides. Explain the existing commercial model in the service-charges FAQ instead of implying all services are free. Include PG (paying guest) accommodation in posting and search; PG operators use the Owners & Agents guide. Avoid repeating a heading above the three feature cards. Do not invent exact prices, free search, guaranteed leads, unlimited posting, live inventory, verified listings or integrations.

The root is the active application. `propSearch_SPA/` contains ignored legacy artifacts; do not treat it as source. Do not edit generated `dist/`, `node_modules/`, browser reports or build caches to implement a feature.

## Source map

- `src/main.tsx`: React root, locally bundled Bootstrap Icons font stylesheet and global styles, under StrictMode.
- `src/App.tsx`: page composition and keyboard skip link.
- `src/components/SiteHeader.tsx`: sticky header, mobile menu, section navigation and general enquiry.
- `src/components/HeroSection.tsx`: hero actions and the SVG carousel with swipe, pause/resume and reduced motion.
- `src/components/AboutSection.tsx`: Post/Search/Promote service cards and service-specific WhatsApp enquiries.
- `src/components/HowItWorksSection.tsx`: role selection, keyboard tabs, steps, tailored enquiry and optional video.
- `src/components/FaqSection.tsx`: native details/summary disclosures and final enquiry action.
- `src/components/SiteFooter.tsx`: text brand, section links and legal owner.
- `src/content.ts`: all editable page copy, branding, fallback contact, WhatsApp URL helper, typed role guides, metadata and SVG references. Checked with TypeScript.
- `src/context/WhatsAppContactContext.tsx`: shares the contact number across the page; cancels slow/unmounted requests.
- `src/service/contact.ts`: native async call to `CONTACT_API_URL` (optionally resolved against `BASE_API_URL`); combines the Java national number and country code and validates the result.
- `src/styles/global.css`: Tailwind import, theme tokens, base typography/accessibility and five shared primitives; responsive feature layout is in TSX utilities.
- `tests/home.spec.ts`, `playwright.config.ts`: interaction, layout, minimum typography, local assets and axe accessibility checks.
- `docs/USER_TESTING.md`: manual scenarios and dated validation results.
- `docs/UX_REVIEW.md`: design rationale and product limitations.
- `scripts/capture-preview.mjs`: repeatable screenshot capture from a running local server.

## Development commands

Use Node.js 22+ with npm from the repository root:

```sh
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

Dev and preview use `http://127.0.0.1:4173` with a strict port. Run only one of them at a time. Browser tests require the port to be free: they start their own server with an intercepted contact API URL. `scripts/work.ps1` supports setup/dev/check/build/preview on Windows. `npm run build` includes TypeScript checks. Install dependencies only when needed; preserve `package-lock.json` consistency.

## TypeScript and documentation conventions

- Use locally installed Tailwind, Lucide React for role tabs, and Bootstrap Icons for phone status symbols; never add CDN scripts/styles, remote icon fonts or SCSS. Keep complete utility classes literal so Tailwind detects them. Keep custom CSS limited to shared theme/base styles and reusable primitives.
- Preserve the forest/cream/sage palette and readable rem-based type scale: body/controls 16px, lead 18–20px, subheadings 24–32px, section headings 32–48px, hero 40–64px and footer/helper text 14px at default settings. Avoid shrinking text to force a layout to fit.
- Keep strict typing; do not suppress errors with `any`, `@ts-ignore` or weakened compiler options.
- Follow the existing function-component style, double quotes, semicolons and two-space indentation.
- Use TSDoc/JSDoc `/** ... */` for exported components, functions, shared types and configuration values. Describe purpose, constraints and side effects; add `@param`/`@returns` when they clarify a function contract.
- Document every interactive feature at its implementation: click/tap result, keyboard behavior, state updates, navigation destination and external effects. Native links and disclosures need comments too, even without `onClick` handlers.
- Use JSX comments around rendered features and regular TypeScript comments within code or JSX attributes. Comments should explain intent and maintenance constraints rather than repeat syntax. Update comments when behavior changes.
- Keep editable UI copy, fallback contact and WhatsApp URL helper in `src/content.ts`; keep request logic in `src/service/contact.ts`. Avoid duplicating phone numbers, encoding logic or role content across components.

## Interaction and accessibility contracts

- Preserve `#home`, `#about`, `#how-it-works`, `#faq` and `#main`, or update all links and tests together.
- Keep one h1, useful landmarks, visible focus, the focusable main target and explicit `tabIndex={0}` on the skip link (needed by tested WebKit keyboard behavior).
- Header mobile links close the disclosure. Escape from a navigation child closes it and returns focus to the menu button. Keep `aria-expanded` and the visible state synchronized.
- Keep the three combined audiences: Tenants & Buyers (`seekers`, home icon), Owners & Agents (`listers`, key icon), and Builders (`builder`, building icon). Icons supplement visible labels and are hidden from assistive technology.
- Role IDs must be unique and stable. The role array must remain non-empty; the first item is the default. The selected role controls steps, message, CTA and media together.
- Preserve tab/tabpanel relationships, one tab in the Tab sequence, ArrowLeft/ArrowRight wrapping, Home/End navigation and selection/focus synchronization. Inactive panel content unmounts to stop video playback.
- FAQs use native details/summary controls. Preserve keyboard operation and avoid adding redundant state or fake buttons.
- WhatsApp URLs prefill text only. Encode plain text once through `createWhatsAppUrl`; keep safe new-tab attributes and accessible new-tab descriptions. Do not send messages as part of tests.
- The phone mockup is static. Its composer, menu symbols and sample reply are not active controls.
- Keep horizontal page overflow out of phone/tablet layouts. All three tabs must fit side by side on phones; use stacked icons/labels and hide only secondary subtitles at small widths. Preserve reduced-motion behavior and test affected breakpoints.

## Videos

For a role, provide `video.src` (MP4), required English `video.captions` (WebVTT) and optional `video.poster`. Files may live under `public/videos/`, referenced with `/videos/...` URLs. Use native controls, no autoplay, and keep written steps available. Without metadata, retain a clearly labelled, non-interactive coming-soon state. Update the role's tests when adding a real video. See README for an example.

## Verification

For comments/documentation-only changes, run `npm run check` and inspect the diff; do not add tests that only assert comments. For behavior or styling changes, run `npm run build` and the relevant existing browser tests. Add meaningful coverage when introducing new interactions.

```sh
npx playwright install chromium firefox webkit
npm test
npm test -- --project=chromium --workers=2
npm run test:ui
npm run test:report
```

The suite covers desktop Chromium, Firefox, WebKit and mobile Chromium/WebKit profiles. Layout coverage includes 320, 360, 390, 650, 768, 850, 1024, 1440 and 1920px. External WhatsApp navigation is intercepted; tests must not message the business. Keep assertions intact when investigating failures. Do not run simultaneous test commands sharing the same report/output directories.

On the Windows machine used for the October 2026 redesign, Firefox could not launch because of an incorrect side-by-side runtime configuration. Treat that as an environment limitation, not a pass. Keep Firefox enabled in CI and retry when the environment supports it. To run the other four projects locally:

```sh
npm test -- --project=chromium --project=webkit --project=mobile-chrome --project=mobile-safari --workers=2
```

For visual changes, inspect desktop and phone screenshots. Start the dev server, then run `node scripts/capture-preview.mjs` to refresh `docs/previews/`. Manual zoom, screen-reader and physical-device checks remain necessary; automated results do not establish universal responsiveness or full accessibility compliance.

## Handoff

Summarize what changed, why, checks actually run and unresolved limitations. Link relevant source or guides. Keep README and user testing instructions consistent with behavior. Do not claim a browser, live account, video or backend is verified unless it was actually checked. The business WhatsApp recipient must be confirmed before publishing; do not silently substitute a different number.
