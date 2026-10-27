# UX review and implementation

## Main findings

The previous hero's long headline dominated the viewport and pushed the action down the page. The property card lacked a recognisable phone frame and presented a sample listing without a clear example label. Navigation did not expose How it works. Dense technical copy described internal systems instead of helping a visitor take the next step. Role cards provided no interaction, while unused process and architecture sections were mounted but hidden. Logo images still contained obsolete branding. The contact link omitted the country code. There were no automated interaction or accessibility tests.

## Changes

- Replaced the brand with plain MiloBroker text and removed both obsolete image files.
- Introduced a restrained green, cream and white palette, consistent type hierarchy, content width, spacing and visible focus states.
- Shortened the hero to a clear value proposition and prominent WhatsApp action with a secondary guide link.
- Built a self-contained WhatsApp-style phone mockup. It uses local Tailwind utilities and an SVG room illustration and sample messages instead of a fragile external photo or QR service. It is labelled as illustrative and contains no fake interactive controls.
- Added a compact sticky header, mobile disclosure menu, skip link, FAQs and useful footer navigation.
- Chose horizontal role tabs: three combined audiences (Tenants & Buyers, Owners & Agents, Builders) remain visible together on desktop and mobile. Home, key and building icons support recognition. Arrow keys, Home/End and roving tab focus support keyboard use.
- Gave each role three concrete steps, a tailored starter message and a WhatsApp action. Added a typed video configuration with captions and a non-interactive coming-soon state.
- Removed unused technical sections from the public component tree and source. Explained the website's marketing-only scope in the README.
- Preserved the original local contact number and added the Indian country code based on the Bengaluru context. Confirm the intended recipient before release.
- Added automated browser and accessibility checks and a practical manual testing guide.

## Tailwind and readability update

The hand-written section/media-query stylesheet was replaced with local Tailwind CSS 4 utilities. The remaining global stylesheet contains theme tokens, rem-based typography, focus/reduced-motion rules and a few shared design primitives; there is no SCSS. Lucide icons ship with the local JavaScript bundle, and the phone room is a local SVG instead of custom CSS shapes. No CDN or remote font is required.

Primary body text and controls are at least 16px at default settings. Footer and supporting copy are 14px, introductions 18–20px, section headings 32–48px and the hero 40–64px. Enlarging the font rather than truncating copy lets the panels reflow naturally on mobile. Each combined guide explicitly covers both constituent roles in its steps.

## Verification scope

Responsive rules cover small phones through wide desktops. Automated tests exercise nine viewport widths and Chromium, Firefox, WebKit and mobile browser profiles. Reduced motion, focus, tab selection and basic accessibility are tested. Full accessibility and universal device compatibility cannot be guaranteed by a stylesheet or automated scanner; real-device, zoom and assistive-technology checks remain part of acceptance testing.

The landing page does not prove that listing, search, promotion or automated messaging services are operational. Copy describes starting an enquiry and asks users to confirm availability and charges. No unavailable demo video is presented as playable.


## Previous USP and service-copy update

The body now leads with “Post. Search. Promote.” Free posting is explicitly assigned to owners and agents, paid search to tenants and buyers, and premium paid advertising to builders. The hero, three service cards, combined guides, FAQs, sample chat and metadata now use the same commercial distinction. Service copy is shared from `platformServices` to reduce drift. Exact prices, campaign results and search guarantees are not claimed.


## Current welcome and PG update

The introduction now leads with “No extra app. Just WhatsApp.” and a short Post/Search/Promote message. Upfront price labels, fee-focused steps and the repeated heading above the feature cards have been removed. Commercial information remains available in the service-charges FAQ without implying free search. PG (paying guest) accommodation is included in posting, search, enquiry messages and FAQ guidance; PG operators use the existing Owners & Agents guide.
