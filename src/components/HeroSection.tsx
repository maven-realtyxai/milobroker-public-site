import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { brandName, common, hero, heroSlides } from "../content.js";
import { useWhatsAppContact } from "../contexts/WhatsAppContactContext.js";

/** Welcome and SVG carousel. CSS sizes the phone; only slide selection and drag state use JavaScript. */
export function HeroSection() {
  const { whatsappChatUrl } = useWhatsAppContact();
  const [activeSlide, setActiveSlide] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const drag = useRef<{ x: number; pointerId: number } | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Pause while reading, dragging or using keyboard controls; never auto-rotate with reduced motion.
  useEffect(() => {
    if (!playing || hovered || dragging || reducedMotion) return;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % heroSlides.length), 4200);
    return () => window.clearInterval(timer);
  }, [playing, hovered, dragging, reducedMotion]);

  function selectSlide(index: number) {
    setActiveSlide((index + heroSlides.length) % heroSlides.length);
    setPlaying(false);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    const distance = event.clientX - drag.current.x;
    drag.current = null;
    setDragging(false);
    setDragOffset(0);
    if (Math.abs(distance) > 44) selectSlide(activeSlide + (distance < 0 ? 1 : -1));
  }

  function cancelDrag() {
    drag.current = null;
    setDragging(false);
    setDragOffset(0);
  }

  return (
    <section className="page-container grid min-h-[calc(100svh-5rem)] content-center items-center gap-8 py-6 md:grid-cols-2 lg:gap-10 lg:py-8" id="home" aria-labelledby="hero-title">
      <div className="text-center md:text-left">
        <p className="eyebrow">{hero.eyebrow}</p>
        <h1 id="hero-title" className="text-[clamp(2.5rem,4.2vw,3.75rem)]">
          {hero.heading}<br /><em className="font-serif font-normal text-olive">{hero.accent}</em>
        </h1>
        <p className="mt-4 text-2xl font-semibold tracking-tight text-forest sm:text-3xl">{hero.promise}</p>
        <p className="mx-auto mt-3 max-w-[70ch] text-lg leading-relaxed md:mx-0">
          {hero.introduction}<br /><i>{brandName}</i> {hero.description}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:justify-start">
          {/* Opens a reviewable enquiry in a new tab; no message is sent here. */}
          <a className="button text-lg" href={whatsappChatUrl} target="_blank" rel="noopener noreferrer">
            <i className="bi bi-whatsapp" aria-hidden="true" />{common.chat}<span className="sr-only">{common.newTab}</span>
          </a>
          {/* Native section link respects the shared reduced-motion scroll setting. */}
          <a className="nav-link gap-3 text-lg" href="#how-it-works">{hero.guideLink}</a>
        </div>
      </div>
      <figure className="mx-auto grid w-full max-w-lg justify-items-center" role="region" aria-roledescription="carousel" aria-label={hero.carouselLabel}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        {/* Match the SVG aspect ratio to viewport height without resize observers or transform scaling. */}
        <div className="w-full max-w-[min(25rem,calc((100svh-12rem)*0.48))] rounded-[12.6%/6.1%] bg-transparent shadow-[0_4px_12px_rgba(32,61,50,0.12)]" aria-label={hero.previewLabel}>
          {/* Drag/swipe changes slides after 44px; vertical page scrolling stays available.
              Cancelled gestures return to the current slide. Dots provide keyboard access. */}
          <div className="touch-pan-y select-none overflow-hidden" onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0) return;
            drag.current = { x: event.clientX, pointerId: event.pointerId };
            setDragging(true);
            setPlaying(false);
            event.currentTarget.setPointerCapture(event.pointerId);
          }} onPointerMove={(event) => {
            if (drag.current?.pointerId !== event.pointerId) return;
            const limit = event.currentTarget.clientWidth * 0.45;
            setDragOffset(Math.max(-limit, Math.min(limit, event.clientX - drag.current.x)));
          }} onPointerUp={endDrag} onPointerCancel={cancelDrag} onLostPointerCapture={cancelDrag}>
            <div className={dragging ? "flex" : "flex transition-transform duration-500 ease-out motion-reduce:transition-none"}
              style={{ transform: `translateX(calc(-${activeSlide * 100}% + ${dragOffset}px))` }}>
              {heroSlides.map((slide, index) => (
                <div key={slide.label} className="w-full shrink-0" role="group" aria-roledescription="slide" aria-label={slide.label} aria-hidden={index !== activeSlide}>
                  <img src={slide.image} alt={slide.imageAlt} width="390" height="812" className="h-auto w-full select-none object-contain" draggable={false} decoding="async" />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Native buttons select a slide and pause rotation; Enter/Space work without custom keys. */}
        <div className="mt-3 flex items-center justify-center" role="group" aria-label={hero.controlsLabel}>
          {heroSlides.map((slide, index) => (
            <button key={slide.label} type="button" className="grid size-11 place-items-center rounded-full" aria-label={hero.showSlide.replace("{role}", slide.label)}
              aria-current={index === activeSlide ? "true" : undefined} onFocus={() => setPlaying(false)} onClick={() => selectSlide(index)}>
              <span className={index === activeSlide ? "h-1.5 w-6 rounded-full bg-forest" : "size-1.5 rounded-full bg-muted"} />
            </button>
          ))}
        </div>
        <figcaption className="mt-1 text-sm text-muted" aria-live="off">
          {heroSlides[activeSlide].label}; {hero.caption}
        </figcaption>
      </figure>
    </section>
  );
}
