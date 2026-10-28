import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";
import { metadata } from "./src/content.js";

/** Escape editable copy before placing it in the HTML title and description. */
function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/** Favicon href — inlined as data URI to avoid file:// resolution in the Vite config context. */
const brandIcon = `data:image/svg+xml,${encodeURIComponent(readFileSync(new URL("./src/resources/images/milobroker-icon.svg", import.meta.url), "utf8").trim())}`;

/** Static frontend only. The browser calls Java directly; no Node server or API proxy. */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "page-content",
      transformIndexHtml: (html) => html
        .replace("%PAGE_TITLE%", escapeHtml(metadata.title))
        .replace("%PAGE_DESCRIPTION%", escapeHtml(metadata.description))
        .replace("%BRAND_ICON%", escapeHtml(brandIcon)),
    },
  ],
  server: { host: "127.0.0.1", port: 4173, strictPort: true },
  preview: { host: "127.0.0.1", port: 4173, strictPort: true },
});
