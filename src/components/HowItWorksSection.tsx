import { Building2, House, KeyRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Journey } from "../content.js";
import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { common, guide, journeys } from "../content.js";
import { useWhatsAppContact } from "../contexts/WhatsAppContactContext.js";

/** Static imports bundle only these SVG icons locally; icons supplement the visible tab names. */
const journeyIcons: Record<Journey["icon"], LucideIcon> = {
  home: House,
  key: KeyRound,
  building: Building2,
};

/** Accessible role tabs pairing practical steps with editable WhatsApp messages and optional videos. */
export function HowItWorksSection() {
  // Role CTAs follow the API-served number once loaded; fallback until then.
  const { createWhatsAppUrl } = useWhatsAppContact();
  // The first guide is the default. content.js requires at least one guide.
  const [selected, setSelected] = useState(0);
  // DOM references support keyboard focus without querying IDs or causing extra renders.
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const journey = journeys[selected];
  /**
   * Handles automatic tab activation and roving keyboard focus.
   * Arrow keys wrap; Home/End jump to the first/last role. Other keys retain native behavior.
   * @param event - Key event from the currently focused role button.
   * @param index - Current button position in the ordered journeys array.
   * @returns Nothing; supported keys update selection and focus, preventing page scrolling.
   */
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % journeys.length;
    else if (event.key === "ArrowLeft")
      next = (index + journeys.length - 1) % journeys.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = journeys.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }
  return (
    <section
      className="page-container section-spacing"
      id="how-it-works"
      aria-labelledby="how-title"
    >
      <div className="mb-6 text-center [&>p:last-child]:text-lg">
        <p className="eyebrow">{guide.eyebrow}</p>
        <h2 id="how-title">{guide.heading}</h2>
        <p>{guide.introduction}</p>
      </div>
      <div
        className="mb-6 grid grid-cols-2 gap-1 rounded-xl border border-line bg-sage p-1 sm:gap-2 sm:p-2"
        role="tablist"
        aria-label={guide.tabLabel}
      >
        {/* All three audience tabs remain visible on phones; subtitles appear from md upward.
            Stable ARIA IDs and roving focus keep only the selected tab in the Tab sequence. */}
        {journeys.map((item, index) => {
          const Icon = journeyIcons[item.icon];
          return (
            <button
              className="flex min-h-24 min-w-0 flex-col items-center justify-center gap-2 rounded-lg px-2 py-4 text-center text-base font-semibold text-forest transition-none hover:bg-line aria-selected:bg-forest aria-selected:text-white sm:flex-row sm:justify-start sm:gap-3 sm:px-4 sm:text-left lg:px-5"
              key={item.id}
              // React calls this on attachment/detachment; null clears the corresponding DOM reference.
              ref={(element) => {
                tabs.current[index] = element;
              }}
              role="tab"
              id={`tab-${item.id}`}
              aria-controls={`panel-${item.id}`}
              aria-selected={selected === index}
              tabIndex={selected === index ? 0 : -1}
              // Immediate colors avoid low contrast mid-animation. Click/tap updates all role content.
              onClick={() => setSelected(index)}
              // Forward the originating index so keyboard navigation wraps from the correct tab.
              onKeyDown={(event) => navigate(event, index)}
            >
              {/* Decorative SVG: the full text label remains the accessible tab name. */}
              <Icon
                className="size-6 shrink-0"
                aria-hidden="true"
                focusable="false"
              />
              <span>
                {item.label}
                <span className="mt-1 hidden text-sm font-normal md:block">
                  {item.intent}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {/* Keep panel shells for aria-controls; unmount inactive contents to stop video playback on role changes. */}
      {journeys.map((item, index) => (
        <div
          key={item.id}
          id={`panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${item.id}`}
          hidden={selected !== index}
          tabIndex={0}
        >
          {selected === index && (
            <div className="grid gap-10 rounded-2xl border border-line bg-white p-5 sm:p-6 lg:grid-cols-2 lg:gap-12 lg:p-6">
              <div className="[&>h3]:mt-3 [&>h3]:mb-4 [&>h3]:max-w-[28ch]">
                <span className="text-sm font-semibold tracking-widest text-olive">
                  {guide.forRole.replace("{role}", journey.label.toUpperCase())}
                </span>
                <h3>{journey.title}</h3>
                <p className="text-base leading-relaxed">
                  {journey.description}
                </p>
                <ol className="mt-8 space-y-6">
                  {/* Ordered content drives the visible steps; decorative numbers do not duplicate list semantics. */}
                  {journey.steps.map((step, stepIndex) => (
                    <li key={step.title} className="flex gap-4">
                      <span
                        className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-sage text-sm font-semibold text-olive"
                        aria-hidden="true"
                      >
                        0{stepIndex + 1}
                      </span>
                      <div>
                        <h4 className="mb-2">{step.title}</h4>
                        <p>{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex min-w-0 flex-col gap-6">
                <div className="rounded-xl border border-line bg-sage p-5 sm:p-6 [&_blockquote]:rounded-xl [&_blockquote]:rounded-bl-none [&_blockquote]:border [&_blockquote]:border-line [&_blockquote]:bg-white [&_blockquote]:p-5 [&_blockquote]:text-base [&_blockquote]:leading-relaxed [&_.button]:w-full">
                  <p className="eyebrow">{guide.messageLabel}</p>
                  <blockquote>{journey.example}</blockquote>
                  <p className="my-5 text-sm leading-relaxed">
                    {guide.messageHelp}
                  </p>
                  {/* Click opens this role’s exact example in WhatsApp. Encoding is centralized; nothing is sent here. */}
                  <a
                    className="button"
                    href={createWhatsAppUrl(journey.example)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {journey.cta}
                    <span className="sr-only">
                      {common.whatsAppNewTab}
                    </span>
                  </a>
                </div>
                {/* Configured videos use native play/pause, captions and fullscreen controls, with no autoplay.
                    Without video metadata, the coming-soon panel is deliberately non-interactive. */}
                {journey.video ? (
                  <div className="[&_h4]:mb-4 [&_video]:w-full [&_video]:rounded-xl">
                    <h4>{guide.videoTitle.replace("{role}", journey.label)}</h4>
                    <video
                      key={journey.id}
                      controls
                      preload="metadata"
                      poster={journey.video.poster}
                    >
                      <source src={journey.video.src} type="video/mp4" />
                      <track
                        kind="captions"
                        src={journey.video.captions}
                        srcLang="en"
                        label={guide.captions}
                        default
                      />
                      {guide.videoFallback}
                    </video>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-line bg-cream p-5 [&_strong]:text-base [&_p]:mt-2 [&_p]:text-sm [&_p]:leading-relaxed">
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-full bg-sage text-2xl text-olive"
                      aria-hidden="true"
                    >
                      ▷
                    </span>
                    <div>
                      <strong>{guide.comingTitle}</strong>
                      <p>
                        {guide.comingDescription.replace("{role}", journey.label.toLowerCase())}
                        <br />
                        {guide.comingHelp}
                      </p>
                    </div>
                    <span className="rounded border border-line px-2 py-1 text-xs font-semibold tracking-wider text-olive">
                      {guide.comingBadge}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
