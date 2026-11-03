import { fallbackWhatsAppNumber } from "../content.js";

/** Public Java settings. An empty endpoint uses the fallback without a network request.
 * Vite exposes only `VITE_` prefixed vars to the browser; we accept both forms for
 * local dev/CI compatibility. No other file may call `fetch` or load remote assets.
 */
const contactApiUrl =
  (import.meta.env.VITE_CONTACT_API_URL?.trim() || import.meta.env.CONTACT_API_URL?.trim() || "");
const baseApiUrl =
  (import.meta.env.VITE_BASE_API_URL?.trim() || import.meta.env.BASE_API_URL?.trim() || "");

/** Country selector sent as `countryIso2` on every contact request; it is appended
 * at request time so the configured endpoint stays a plain path. Defaults to "DF".
 */
const defaultCountryIso2 =
  (import.meta.env.VITE_COUNTRY_ISO2?.trim() || import.meta.env.COUNTRY_ISO2?.trim() || "DF");

/** Read the Java contact; use its WhatsApp number (E.164 with `+` or plain digits).
 * This is the ONLY `fetch` in the app. All other assets (fonts, icons, images,
 * styles) are bundled locally from `node_modules`/`src` — no CDN, no third-party calls.
 * @param signal Aborts the request on unmount or after the caller times out.
 * @param countryIso2 Overrides the configured country selector for this request.
 * @returns The full WhatsApp number, or the fallback when the API is unusable.
 */
export async function fetchContact(signal: AbortSignal, countryIso2: string = defaultCountryIso2): Promise<string> {
  if (!contactApiUrl) return fallbackWhatsAppNumber;
  try {
    // CONTACT_API_URL may be either a full URL or a path resolved against BASE_API_URL.
    const url = baseApiUrl
      ? new URL(contactApiUrl, baseApiUrl)
      : new URL(contactApiUrl);
    // The country selector is appended dynamically at request time, so the
    // configured endpoint stays a plain path and callers can override it.
    url.searchParams.set("countryIso2", countryIso2.trim() || defaultCountryIso2);
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
    // The number may arrive as E.164 ("+15556780198") or plain digits; it already
    // carries its own country prefix. countryCode is required by the envelope but
    // informational — it is never built into the link.
    if (typeof whatsappPhoneNumber !== "string" || typeof countryCode !== "string") {
      return fallbackWhatsAppNumber;
    }
    const digits = whatsappPhoneNumber.replace(/\D/g, "");
    return /^[1-9]\d{7,14}$/.test(digits) ? digits : fallbackWhatsAppNumber;
  } catch {
    // Offline, timeout or invalid JSON: existing links keep working.
    return fallbackWhatsAppNumber;
  }
}
