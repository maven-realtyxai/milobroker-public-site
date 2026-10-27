# Phone mockup images

`milobroker-search.svg` embeds `milobroker-icon.svg` in the profile circle
and `house-interior.jpg` in the sample property card using SVG `<image>` elements.
The data URLs let the mockup display inside an HTML `<img>` without external
image requests. If either source image changes, refresh its embedded data URL.

The search reply card includes a WhatsApp-style "Contact owner" row with a divider
and external-link icon. It is display-only, with no navigation or keyboard focus,
because the property and conversation are illustrative.

`milobroker-promote.svg` shows ABC Builders describing 13-floor towers, open space,
proximity to the international airport, and available 2 and 3 BHK units. It embeds
`highrise-project-poster.png` and `house-interior.jpg` as two sample attachments,
followed by a sample acknowledgement that the ad was saved. These are static
illustrations: the mockup does not upload images, save ads or publish anything.

`milobroker-post.svg` shows an owner offering an east-facing, semi-furnished 2 BHK
house with a modular kitchen near Indiranagar metro station for Rs.42,000/- per
month. It embeds `house-interior.jpg` and `modular-kitchen.jpg` as two illustrative
attachments, followed by MiloBroker's sample confirmation that the property was
posted. No upload or property posting actually occurs.

Kitchen photo source: [Unsplash image](https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=800&q=85&fm=jpg).
Downloaded at 800 pixels wide for illustrative use.

Interior photo source: [Unsplash image](https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85&fm=jpg).
Downloaded at 800 × 600 for illustrative use; it does not represent a live listing.

To use the complete mockup in React:

```tsx
import phoneMockup from "../resources/images/milobroker-search.svg";

<img
  src={phoneMockup}
  alt="Illustrative WhatsApp conversation with MiloBroker showing a sample home"
  width={390}
  height={812}
  className="h-auto w-full max-w-[390px]"
/>
```
