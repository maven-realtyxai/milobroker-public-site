import { useRef, useState } from "react";
import { brandIcon, brandName, navigation } from "../content.js";

/** Sticky section links; the mobile menu closes after navigation or Escape. */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/95 backdrop-blur-lg">
      <div className="page-container flex min-h-20 flex-wrap items-center justify-between gap-x-6 lg:flex-nowrap">
        {/* Native anchor returns to the hero and closes the mobile menu. */}
        <a className="brand flex items-center" href="#home" aria-label={navigation.homeLabel} onClick={() => setOpen(false)}>
          <img src={brandIcon} width="30" height="30" alt="" />
          <span className="px-2">{brandName}</span>
        </a>
        {/* Click, Enter or Space toggles the mobile navigation. */}
        <button ref={menuButton} type="button" className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 py-2 text-base lg:hidden"
          aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen(!open)}>
          {open ? navigation.closeMenu : navigation.menu}
          <span className="ml-2" aria-hidden="true">{open ? "×" : "☰"}</span>
        </button>
        <nav id="primary-nav" aria-label={navigation.mainLabel}
          className={`${open ? "flex" : "hidden"} w-full flex-col gap-1 border-t border-line py-4 lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-3 lg:border-0 lg:py-0`}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              menuButton.current?.focus();
            }
          }}>
          {/* Each link scrolls to its section; Escape above returns focus to the menu button. */}
          {navigation.links.map((link) => (
            <a key={link.href} className="nav-link" href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
        </nav>
      </div>
    </header>
  );
}
