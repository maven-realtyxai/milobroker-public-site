/// <reference types="vite/client" />

/** Public build-time settings; secrets must stay in the Java backend.
 * `VITE_` prefix is required for Vite to expose vars to the browser.
 * Non-prefixed aliases are accepted for CI/dev compat (see src/services/contact.ts).
 */
interface ImportMetaEnv {
  readonly VITE_BASE_API_URL?: string;
  readonly VITE_CONTACT_API_URL?: string;
  readonly BASE_API_URL?: string;
  readonly CONTACT_API_URL?: string;
}
