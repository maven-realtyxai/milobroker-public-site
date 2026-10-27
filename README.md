# MiloBroker

React 18 + TypeScript marketing site, built with Vite and Tailwind CSS 4.
The frontend makes one optional async request to your Java backend for the WhatsApp
contact. There is no Express server, database driver, seed script or Node API here.

## Run

Use Node.js 22 or newer with npm:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. To check a production build:

```sh
npm run build
npm run preview
```

Stop dev before preview; both use the same strict port. `npm run check` checks the
app, content.ts, Vite config and browser tests using one `tsconfig.json`.
Windows users can also run `scripts/work.ps1 dev` (or setup/check/build/preview).

## Change text in one place

Edit [src/content.ts](src/content.ts). It contains exported constants for:

- Product name, fallback WhatsApp number and enquiry messages.
- Page title/description, navigation, headings, paragraphs and button labels.
- Feature cards, audience guides, FAQs, disclaimer and legal ownership.
- Carousel image references, accessible descriptions and optional guide videos.

Each section has a short comment naming where it is used. JavaScript content is
still type-checked through JSDoc and `checkJs`; the React components remain TypeScript.
`{phone}`, `{role}` and `{year}` are placeholders filled by the relevant component.
Keep guide/slide arrays non-empty and role IDs unique.

The three SVG conversations are approved static illustrations. Their drawn words
and embedded photographs remain inside the SVG artwork under `src/resources/images/`;
changing page copy does not redraw those illustrations. See the image README there.
No listing, upload, ad-save or property-posting operation occurs in the mockups.

## Connect Java

Create `.env.local` (see `.env` for the keys) and set the public endpoint.
`src/service/contact.ts` reads `CONTACT_API_URL` and an optional `BASE_API_URL`
(which may be a full URL or a path resolved against the base):

```dotenv
BASE_API_URL=https://your-java-host.example
CONTACT_API_URL=/api/contact
```

The checked-in `.env` currently ships `VITE_BASE_SERVICE_URL` and
`VITE_CONTACT_API_URL` placeholders — align them with the names above when you
configure the endpoint. Vite only exposes `VITE_` variables to the browser, so
restart dev after editing env files; rebuild before deployment when the endpoint
changes.

Expected JSON (including quotes around all keys):

```json
{
  "whatsappPhoneNumber": "8123995310",
  "country": "IN",
  "countryCode": "+91"
}
```

The phone field is the **national number**, without its country code. The frontend
combines `countryCode` and `whatsappPhoneNumber` into `918123995310`. `country` is
informational; the explicit calling code controls the destination. Keep both number
fields as strings. Responses with missing, malformed or overlong numbers are ignored.

`src/service/contact.ts` uses native `fetch`, without Axios or a proxy. The small shared
provider in `src/context/WhatsAppContactContext.tsx` loads it on page mount and gives
all buttons, role links, the FAQ and QR code the same number. Requests time out after
five seconds and are cancelled on unmount. Refresh the page to read a new number.
React StrictMode may start/cancel an extra request in development.

An empty URL makes no API request. A slow/offline API, HTTP error or invalid JSON
keeps `fallbackWhatsAppNumber` from `src/content.ts`. The fallback is available immediately.
Confirm the business recipient before publishing. The QR is generated locally with
[qrcode](https://github.com/soldair/node-qrcode), so there is no external QR image service.

For another origin, Java must allow this website's origin through CORS. The request
is public and sends no cookies or authorization header. Use HTTPS for the production
API when the site is HTTPS. Never put database credentials or private keys in `VITE_*`
variables: these are public build-time settings. Old Express `DATABASE_URL`,
`PORT` and `WHATSAPP_SEED_NUMBER` settings are no longer used.

## Deploy

Run `npm ci` and `npm run build`, then serve **dist/** from a static web host or your
Java server. `npm run preview` is a local build check, not the production server.
This site uses native section anchors and needs no router fallback rules. Configure
Java/CORS and the public API URL separately; there is no `npm run server` step.

## Verify

Stop an existing dev/preview process first. Tests start their own Vite server with a
stubbed Java URL so the API tests cannot accidentally run in fallback-only mode.
No test calls a real Java endpoint or sends WhatsApp messages.

```sh
npx playwright install chromium firefox webkit
npm test
```

For a quick pass: `npm test -- --project=chromium --workers=2`.
The complete suite also covers Firefox, WebKit and mobile Chromium/WebKit profiles.
On Windows, installed Edge can be used for Chromium projects with
`$env:PLAYWRIGHT_CHANNEL='msedge'`; clear that variable to return to bundled Chromium.
Use `npm run test:report` for the last report.

Start `npm run dev`, then run `node scripts/capture-preview.mjs` to refresh desktop,
phone and tablet screenshots. The capture script also respects `PLAYWRIGHT_CHANNEL`.
See [docs/USER_TESTING.md](docs/USER_TESTING.md) for manual checks and actual results.

## Where to look

| File | What it owns |
| --- | --- |
| `src/content.ts` | Editable page copy, brand, fallback contact, WhatsApp URL helper, metadata and image references |
| `src/service/contact.ts` | One Java request and response validation |
| `src/context/WhatsAppContactContext.tsx` | One shared contact value and request cleanup |
| `src/components/` | Layout and interactions; copy comes from `src/content.ts` |
| `src/styles/global.css` | Theme, focus/reduced-motion rules and shared styles |
| `vite.config.ts` | React/Tailwind, local ports and page metadata |
| `tsconfig.json` | Strict checks for the whole frontend |
| `docs/CLEANUP_LOG.md` | Plain-language changes and where they are used |

Optional videos need MP4 `src`, English WebVTT `captions` and optional `poster` on a
journey in `content.js`. Files can live in `public/videos/`. Until configured, written
steps remain visible alongside a non-interactive coming-soon panel.
