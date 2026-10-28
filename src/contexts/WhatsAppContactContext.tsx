import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { fallbackWhatsAppNumber, generalEnquiryMessage, createWhatsAppUrl } from "../content";
import { fetchContact } from "../services/contact.js";

const ContactContext = createContext(fallbackWhatsAppNumber);

/** Fetch once per page mount. All sections share the same number, including the FAQ and QR. */
export function WhatsAppContactProvider({ children }: { children: ReactNode }) {
  const [phoneNumber, setPhoneNumber] = useState(fallbackWhatsAppNumber);
  useEffect(() => {
    const controller = new AbortController();
    // Stop a slow API after five seconds; navigation also cancels the request.
    // This is non-blocking: links render immediately with the fallback number and
    // update only if the fetch returns quickly, so a slow/failed API never delays paint.
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    void fetchContact(controller.signal).then((number) => {
      if (!controller.signal.aborted) setPhoneNumber(number);
      window.clearTimeout(timeout);
    });
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);
  return <ContactContext.Provider value={phoneNumber}>{children}</ContactContext.Provider>;
}

/** Used by feature cards, role guides, the hero and the final contact section. */
export function useWhatsAppContact() {
  const whatsappPhoneNumber = useContext(ContactContext);
  return {
    whatsappPhoneNumber,
    whatsappChatUrl: createWhatsAppUrl(generalEnquiryMessage, whatsappPhoneNumber),
    createWhatsAppUrl: (message: string) => createWhatsAppUrl(message, whatsappPhoneNumber),
  };
}
