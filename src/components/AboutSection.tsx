import { common, platformServices, serviceOrder } from "../content.js";
import { useWhatsAppContact } from "../contexts/WhatsAppContactContext.js";

/** Brief feature introduction; fee details live in the FAQ rather than promotional badges. */
export function AboutSection() {
  // Service enquiries follow the API-served number once loaded; fallback until then.
  const { createWhatsAppUrl } = useWhatsAppContact();
  return (
    <section
      className="section-spacing border-y border-line bg-sage"
      id="about"
      aria-labelledby="about-title"
    >
      <div className="page-container">
        <h2 id="about-title" className="sr-only">
          {common.servicesTitle}
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {serviceOrder.map((key) => {
            const service = platformServices[key];
            return (
              <article
                key={key}
                className="flex flex-col rounded-xl border border-line bg-white p-6 sm:p-7"
                aria-labelledby={`service-${key}`}
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h3 id={`service-${key}`} className="text-3xl">
                    {service.name}
                  </h3>
                </div>
                <p className="mb-3 text-lg font-semibold tracking-wide text-olive">
                  {service.audience}
                </p>
                <h4 className="mb-4 text-xl">{service.headline}</h4>
                <p className="mb-6 text-lg leading-relaxed">{service.description}</p>
                {/* Each action opens a service-specific WhatsApp enquiry; it does not post, search, pay or advertise automatically. */}
                <a
                  className="nav-link mt-auto gap-2 self-start px-0 text-forest text-lg"
                  href={createWhatsAppUrl(service.enquiry)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {service.cta}
                  <span className="sr-only">
                    {common.whatsAppNewTab}
                  </span>
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
