# Cleanup log — 27 October 2026

| Change | Why | Where it is used now |
| --- | --- | --- |
| Removed Express, PostgreSQL code, seed/health endpoints and server scripts | One contact request does not need a second backend in this repo | Java owns the API; the website is a static Vite build |
| Removed Express/pg/tsx packages and their types; refreshed the lockfile | Fewer dependencies and no separate Node service to maintain | `package.json`, `package-lock.json` |
| Added one native async contact request | Read the Java number directly and safely fall back | `src/api/contact.ts` |
| Combined national number and calling code | Java returns `8123995310` and `+91`; WhatsApp needs `918123995310` | `fetchContact`, then every WhatsApp link |
| Kept a small shared provider; removed unused source flags and cached link objects | All sections use the same number without repeating requests | `src/context/WhatsAppContactContext.tsx` |
| Moved page text, labels, brand, fallback number and image references into constants | Edit website copy without searching components | `src/content.js`; comments name each consumer |
| Removed old promotion.ts and branding.ts copy files | Avoid competing places to edit the same content | Components import `content.js` |
| Kept the approved SVG artwork | Preserve the three sample conversations and their photographs | `heroSlides` points to `src/resources/images/`; text drawn inside artwork stays there |
| Replaced remote QR requests with local generation | QR and buttons stay in sync without relying on a third-party image service | `ContactQr` in `FaqSection.tsx` |
| Removed hidden header CTA, unused markup and stale PropExcel labels | Less dead code and clearer accessible names | Header, FAQ and footer components |
| Replaced resize observers, layout scaling and duplicate carousel fade timers with CSS sizing | Fewer moving parts and no layout measurements on resize | `HeroSection.tsx` |
| Kept swipe and automatic rotation; added pause/resume and keyboard-friendly dots | Users can stop movement; reduced motion is respected | Hero carousel controls |
| Removed the halo and kept a small phone shadow | SVGs sit directly on the page background | Hero phone wrapper |
| Fixed decorative logo alt text, disclaimer heading/label and role icon mapping | Screen readers get useful labels without duplicated image names | Header, DisclaimerSection and role guides |
| Made role-tab colors change immediately | Avoid a low-contrast frame between selected and unselected colors | `HowItWorksSection.tsx` |
| Consolidated TypeScript settings and Windows commands | One check/build path instead of parallel configurations | `tsconfig.json`, npm scripts, `scripts/work.ps1` |
| Removed Vite API proxies | The browser now calls the configured Java endpoint | `vite.config.ts`, `.env.example` |
| Restricted Tailwind discovery to src | Old experiments and docs cannot inflate generated utility CSS | `src/styles/global.css` |
| Added API failure and carousel regression checks | Catch bad numbers, slow responses and broken controls before release | `tests/home.spec.ts` |

## Next configuration step

Set `BASE_API_URL` to the Java host and `CONTACT_API_URL` to its contact path, then allow the frontend origin in Java's
CORS configuration, then rebuild. No live Java endpoint URL was supplied during this
cleanup; tests use intercepted responses. The existing fallback number is preserved.

## Verification

See the latest dated section in `USER_TESTING.md` for checks actually completed and
remaining environment limitations. Generated build files and unrelated work were
not used as implementation source. No messages were sent and nothing was deployed.
