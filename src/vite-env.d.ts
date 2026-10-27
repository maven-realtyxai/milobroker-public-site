/// <reference types="vite/client" />

/** Public build-time settings; secrets must stay in the Java backend. */
interface ImportMetaEnv {
  readonly VITE_BASE_API_URL?: string;
  readonly VITE_CONTACT_API_URL?: string;
}
