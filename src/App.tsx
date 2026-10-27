import { common } from "./content.js";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { FaqSection } from "./components/FaqSection";
import { WhatsAppContactProvider } from "./contexts/WhatsAppContactContext.js";

/** Composes the single-page journey; section IDs are shared with header/footer links. */
export default function App() {
  return (
    <WhatsAppContactProvider>
      {/* Activation skips navigation and focuses main. Explicit tabIndex supports WebKit keyboard focus. */}
      <a
        // fixed anchors to the viewport; z-50 sits above the header. The negative
        // Y translation hides the link above the screen until focus moves it back.
        className="fixed top-3 left-4 z-50 -translate-y-40 rounded-lg border-2 border-forest bg-white px-5 py-3 focus:translate-y-0"
        href="#main"
        tabIndex={0}
      >
        {common.skip}
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <HeroSection />
        <AboutSection />
        <HowItWorksSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </WhatsAppContactProvider>
  );
}
