import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { common, faqContent, faqs } from "../content.js";
import { useWhatsAppContact } from "../contexts/WhatsAppContactContext.js";

/** Creates the QR locally; a failed render leaves the normal WhatsApp link available. */
function ContactQr({ url }: { url: string }) {
  const [image, setImage] = useState("");
  useEffect(() => {
    let active = true;
    void QRCode.toDataURL(url, { width: 180, margin: 4 }).then((dataUrl) => {
      if (active) setImage(dataUrl);
    }).catch(() => { /* The adjacent text link works even if QR generation fails. */ });
    return () => { active = false; };
  }, [url]);
  if (!image) return null;
  return (
    // Enter/click opens the same enquiry as the text button; scanning never sends automatically.
    <a className="flex shrink-0 flex-col items-center gap-2 text-white" href={url} target="_blank" rel="noopener noreferrer"
      aria-label={faqContent.qrLabel + common.newTab}>
      <img src={image} alt={faqContent.qrAlt} width="180" height="180" className="rounded-lg" />
      <span>{faqContent.scan}</span>
    </a>
  );
}

/** Native FAQ disclosures and a contact panel sharing the same live or fallback destination. */
export function FaqSection() {
  const { whatsappChatUrl, whatsappPhoneNumber } = useWhatsAppContact();
  return (
    <>
      <section className="page-container section-spacing grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16" id="faq" aria-labelledby="faq-title">
        <div className="[&>p:last-child]:text-lg">
          <p className="eyebrow">{faqContent.eyebrow}</p>
          <h2 id="faq-title">{faqContent.heading}</h2>
          <p>{faqContent.introduction}</p>
        </div>
        <div className="border-t border-line [&_details]:border-b [&_details]:border-line [&_summary]:flex [&_summary]:min-h-14 [&_summary]:list-none [&_summary]:items-center [&_summary]:justify-between [&_summary]:gap-5 [&_summary]:py-5 [&_summary]:text-lg [&_summary]:font-semibold [&_summary>span]:text-2xl [&_details[open]_summary>span]:rotate-45 [&_details>p]:pb-5 [&_details>p]:text-base [&_details>p]:leading-relaxed">
          {/* Click, Enter or Space toggles each native disclosure independently. */}
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}<span aria-hidden="true">+</span></summary>
              <p>{answer.replace("{phone}", whatsappPhoneNumber)}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="page-container mt-6 flex flex-col items-start gap-7 rounded-2xl bg-forest p-6 text-white sm:p-10 lg:flex-row lg:items-center lg:justify-between [&_p]:text-white/90" aria-labelledby="contact-title">
        <div>
          <h2 id="contact-title">{faqContent.contactHeading}</h2>
          <p className="pb-4">{faqContent.contactDescription}</p>
          {/* Opens a prefilled enquiry in a new tab; the user decides whether to send it. */}
          <a className="button w-full shrink-0 bg-[#e8efda] text-forest hover:bg-white sm:w-auto" href={whatsappChatUrl} target="_blank" rel="noopener noreferrer">
            <i className="bi bi-whatsapp" aria-hidden="true" />{common.chat}<span className="sr-only">{common.newTab}</span>
          </a>
        </div>
        {/* A changed contact remounts the QR so an old image cannot point to a new destination. */}
        <ContactQr key={whatsappChatUrl} url={whatsappChatUrl} />
      </section>
    </>
  );
}
