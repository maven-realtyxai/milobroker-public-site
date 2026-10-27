import { brandName, footer, navigation } from "../content.js";
import { DisclaimerSection } from "./DisclaimerSection";

/** Section links, the platform notice and the current legal ownership line. */
export function SiteFooter() {
  return (
    <footer className="page-container pt-6">
      <div className="flex flex-col gap-6 pb-6 lg:flex-row lg:items-center lg:justify-between [&_p]:mt-3 [&_p]:text-base [&_nav]:flex [&_nav]:flex-wrap [&_nav]:gap-x-4 [&_nav_a]:inline-flex [&_nav_a]:min-h-11 [&_nav_a]:items-center [&_nav_a]:text-base [&_nav_a:hover]:underline">
        <div>
          {/* Brand and section anchors scroll within this page without a reload. */}
          <a className="brand" href="#home" aria-label={navigation.homeLabel}>{brandName}<span>.</span></a>
          <p>{footer.tagline}</p>
        </div>
        <nav aria-label={navigation.footerLabel}>
          {navigation.footerLinks.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
        </nav>
      </div>
      <DisclaimerSection />
      <div className="flex flex-col gap-3 border-t border-line py-6 text-sm lg:flex-row lg:justify-between [&_p]:text-sm">
        <p>{footer.copyright.replace("{year}", String(new Date().getFullYear()))}</p>
      </div>
    </footer>
  );
}
