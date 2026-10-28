import { fallbackWhatsAppNumber } from "../content.js";

/** Public Java settings. An empty endpoint uses the fallback without a network request.
 * Vite exposes only `VITE_` prefixed vars to the browser; we accept both forms for
 * local dev/CI compatibility. No other file may call `fetch` or load remote assets.
 */
const contactApiUrl =
  (import.meta.env.VITE_CONTACT_API_URL?.trim() || import.meta.env.CONTACT_API_URL?.trim() || "");
const baseApiUrl =
  (import.meta.env.VITE_BASE_API_URL?.trim() || import.meta.env.BASE_API_URL?.trim() || "");

/** Read the Java contact; combine its country code and national number for WhatsApp.
 * This is the ONLY `fetch` in the app. All other assets (fonts, icons, images,
 * styles) are bundled locally from `node_modules`/`src` — no CDN, no third-party calls.
 */
export async function fetchContact(signal: AbortSignal): Promise<string> {
  if (!contactApiUrl) return fallbackWhatsAppNumber;
  try {
    // CONTACT_API_URL may be either a full URL or a path resolved against BASE_API_URL.
    const url = baseApiUrl
      ? new URL(contactApiUrl, baseApiUrl)
      : new URL(contactApiUrl);
    // Reject non-http(s) protocols (e.g. javascript:, data:) before fetching — defence
    // against a misconfigured env var being used as an XSS vector.
    if (url.protocol !== "http:" && url.protocol !== "https:") return fallbackWhatsAppNumber;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      credentials: "omit",
      signal,
    });
    if (!response.ok) return fallbackWhatsAppNumber;
    const data: unknown = await response.json();
    if (typeof data !== "object" || data === null ||
        !("whatsappPhoneNumber" in data) || !("countryCode" in data)) {
      return fallbackWhatsAppNumber;
    }
    const { whatsappPhoneNumber, countryCode } = data;
    if (typeof whatsappPhoneNumber !== "string" || !/^\d{4,14}$/.test(whatsappPhoneNumber) ||
        typeof countryCode !== "string" || !/^\+[1-9]\d{0,2}$/.test(countryCode)) {
      return fallbackWhatsAppNumber;
    }
    const number = countryCode.slice(1) + whatsappPhoneNumber;
    return /^[1-9]\d{7,14}$/.test(number) ? number : fallbackWhatsAppNumber;
  } catch {
    // Offline, timeout or invalid JSON: existing links keep working.
    return fallbackWhatsAppNumber;
  }
}
