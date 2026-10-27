// Edit page copy here. Comments name the components that use each section.

/** Product name used by navigation, page text, image descriptions and enquiry messages. */
export const brandName = "MiloBroker";

/** Used by all contact links if the Java API is unavailable. Confirm ownership before publishing. */
export const fallbackWhatsAppNumber = "918123995310";

/** Build a reviewable WhatsApp link; this never sends a message. Encode plain text once. */
export function createWhatsAppUrl(message: string, phoneNumber = fallbackWhatsAppNumber): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

/** Used by Vite for the browser title and search description in index.html. */
export const metadata = {
  title: `${brandName} | No extra app. Just WhatsApp.`,
  description: `No extra app. Just WhatsApp. Post a property or PG room, search for your next place, or promote a project with ${brandName}.`,
};

/** Used by SiteHeader and SiteFooter. Native section links never reload the page. */
export const navigation = {
  homeLabel: `${brandName} home`,
  mainLabel: "Main navigation",
  footerLabel: "Footer navigation",
  menu: "Menu",
  closeMenu: "Close menu",
  links: [
    { href: "#home", label: "Home" },
    { href: "#about", label: `Why ${brandName}` },
    { href: "#how-it-works", label: "How it works" },
    { href: "#faq", label: "FAQs" },
  ],
  footerLinks: [
    { href: "#about", label: "About" },
    { href: "#how-it-works", label: "How it works" },
    { href: "#faq", label: "FAQs" },
    { href: "#home", label: "Back to top ↑" },
  ],
};

/** Shared labels used by links and the keyboard skip action in App. */
export const common = {
  skip: "Skip to content",
  chat: "Chat on WhatsApp",
  newTab: " (opens in a new tab)",
  whatsAppNewTab: " on WhatsApp (opens in a new tab)",
  servicesTitle: "Post & Search",
};

/** Used by HeroSection; image paths point to the three approved, illustrative SVGs. */
export const hero = {
  eyebrow: "PROPERTY SEARCH, MADE CONVERSATIONAL",
  heading: "No extra app.",
  accent: "Just WhatsApp.",
  promise: "Post · Search",
  introduction: "Find a home, share a room, post a property, or introduce a new project with a simple WhatsApp message.",
  description: "brings tenants, buyers, owners, agents, PG operators together in one place. Just tell us what you need or what you want to share, along with the area, budget, or property details. No extra app to learn—start with a simple hello.",
  guideLink: "See how it works",
  carouselLabel: `${brandName} audience conversations`,
  previewLabel: `Illustrative WhatsApp conversation with ${brandName}`,
  caption: "Illustrative chat",
  controlsLabel: "Choose a sample conversation",
  showSlide: "Show {role} conversation",
  pause: "Pause slideshow",
  play: "Play slideshow",
};

/** Used by the header. Keep the adjacent product name as accessible text. */
export const brandIcon = new URL("./resources/images/milobroker-icon.svg", import.meta.url).pathname;

/** @type {[{label: string, image: string, imageAlt: string}, ...{label: string, image: string, imageAlt: string}[]]} */
export const heroSlides = [
  {
    label: "Owners & Agents",
    image: new URL("./resources/images/milobroker-post.svg", import.meta.url).pathname,
    imageAlt: `Sample ${brandName} chat: an owner posts a semi-furnished 2 BHK near Indiranagar metro for Rs.42,000 per month, with two photos and a confirmation.`,
  },
  {
    label: "Tenants & Buyers",
    image: new URL("./resources/images/milobroker-search.svg", import.meta.url).pathname,
    imageAlt: `Sample ${brandName} chat: a tenant searches for a 2 BHK in Indiranagar and receives an illustrative property card with a Contact owner row.`,
  },
  // {
  //   label: "Builders",
  //   image: new URL("./resources/images/milobroker-promote.svg", import.meta.url).pathname,
  //   imageAlt: `Sample ${brandName} chat: ABC Builders shares 13-floor towers near the international airport, two photos, and receives an ad-saved confirmation.`,
  // },
];

/** Used by HowItWorksSection around the role guides below. */
export const guide = {
  eyebrow: "HOW IT WORKS",
  heading: "Your goal. Your next step.",
  introduction: "Choose your role to see how posting, search or promotion works.",
  tabLabel: "Choose your property journey",
  forRole: "FOR {role}",
  messageLabel: "YOUR FIRST MESSAGE",
  messageHelp: "Make it yours. You can edit this message in WhatsApp before sending.",
  videoTitle: "{role}: video walkthrough",
  captions: "English",
  videoFallback: "Your browser does not support video. Follow the steps on this page instead.",
  comingTitle: "A little guidance, on screen",
  comingDescription: "Video guide for {role} coming soon.",
  comingHelp: "For now, follow the steps alongside.",
  comingBadge: "COMING SOON",
};

/** Used by FaqSection for the introduction and final contact panel. */
export const faqContent = {
  eyebrow: "A FEW HELPFUL ANSWERS",
  heading: "A little help to get started.",
  introduction: "A few things you might like to know before you say hello.",
  contactHeading: "Open a live chat instantly.",
  contactDescription: "Use the WhatsApp click-to-chat link on mobile or scan the QR code from desktop to continue in WhatsApp.",
  qrLabel: `Open ${brandName} WhatsApp chat`,
  qrAlt: `${brandName} WhatsApp chat QR code`,
  scan: "Scan to chat",
};

/** Used by SiteFooter and DisclaimerSection. The year is supplied by the component. */
export const footer = {
  tagline: "Post, Search. All through WhatsApp.",
  copyright: `All rights reserved. © {year} ${brandName} owned by Maven RealtyxAI (OPC) Pvt Ltd.`,
  disclaimerTitle: "Disclaimer",
  disclaimer: `${brandName} is a platform that helps users begin property-related 
      conversations and discover advertised properties, rooms, PG accommodation.
       ${brandName} is not the owner, seller, buyer, tenant, agent, broker of any property, and is not a party 
       to transactions discussed between users. Property details, availability, prices, offers, images and claims are 
       provided by the people or businesses that share them. 
       Users should verify all information, permissions, documents and terms 
       independently before making a decision or entering into an agreement. 
       ${brandName} does not guarantee listings, outcomes, offers or services, 
       and cannot mediate or resolve disputes between users and property advertisers.`,
};

/** Used by the header, hero and contact section. */
export const generalEnquiryMessage = `Hi ${brandName}, I’d like help posting a property or PG room, finding a place, or promoting a project.`;

/** Welcoming service copy shared by feature cards and role enquiries.
 * Pricing is explained in the FAQ; do not add fee badges or imply every service is free.
 */
export const platformServices = {
  post: {
    name: "Post",
    audience: "Owners, agents & PG operators",
    headline: "Make room for new possibilities.",
    description:
      "Have a home, room or PG accommodation to share? Introduce your space with photos and a few details, right on WhatsApp.",
    cta: "Post your space",
    enquiry:
      `Hi ${brandName}, I’d like to post a property or PG room. Please guide me through the details you need.`,
  },
  search: {
    name: "Search",
    audience: "Tenants & Buyers",
    headline: "Find a place that feels like you.",
    description:
      "A home to rent, a place to buy or a PG room for your next chapter. Tell us your preferred area, budget and what makes a place feel right.",
    cta: "Start your search",
    enquiry:
      `Hi ${brandName}, I’m looking for a home or PG room. I’d like to share my preferences and learn how to get started.`,
  },
  // promote: {
  //   name: "Promote",
  //   audience: "Builders",
  //   headline: "Give your next project the spotlight.",
  //   description:
  //     `Every project has a story. Share yours and explore ways to introduce it to prospective buyers through ${brandName}.`,
  //   cta: "Introduce your project",
  //   enquiry:
  //     `Hi ${brandName}, I’d like to promote a property project. Can we discuss the available options and next steps?`,
  // },
};

/** Marketing order follows the platform promise: Post. Search. Promote. */
export const serviceOrder = ["post", "search"] as const;

/** One audience guide shown by the accessible role tabs. */
export interface Journey {
  id: string;
  service: keyof typeof platformServices;
  label: string;
  icon: "home" | "key" | "building";
  intent: string;
  title: string;
  description: string;
  steps: Array<{ title: string; body: string }>;
  example: string;
  cta: string;
  video?: { src: string; captions: string; poster?: string };
}

/** Three combined audiences; keep their stable IDs and keyboard order when editing copy. */
export const journeys: [Journey, ...Journey[]] = [
  {
    id: "listers",
    service: "post",
    label: "Owners & Agents",
    icon: "key",
    intent: "Share homes & PG rooms",
    title: "Tell the story of your space.",
    description:
      "Owners, agents and PG operators can introduce their properties and available rooms. A few useful details help someone picture their next place.",
    steps: [
      {
        title: "Introduce your property",
        body: "Tell us whether you’re an owner, agent or PG operator. Share the location, property or room type, and expected rent or sale price.",
      },
      {
        title: "Share the details that matter",
        body: "Add recent photos, furnishing and availability. For PG rooms, include sharing options, meals, facilities, monthly rent and deposit. Make sure you have permission to list the space.",
      },
      {
        title: "Bring your listing together",
        body: "Send your details on WhatsApp and follow the guidance to complete your listing. Keep room availability and property information up to date.",
      },
    ],
    example: platformServices.post.enquiry,
    cta: platformServices.post.cta,
  },
   {
    id: "seekers",
    service: "search",
    label: "Tenants & Buyers",
    icon: "home",
    intent: "Find a home or PG room",
    title: "A home search shaped around you.",
    description:
      "From a first PG room to a home of your own, start with what matters to you. Share a few preferences and take the next step through WhatsApp.",
    steps: [
      {
        title: "Tell us what home looks like",
        body: "Tell us whether you’re looking to rent, buy or move into a PG. Add your preferred area, budget and move-in timeline.",
      },
      {
        title: "Add the little things that matter",
        body: "Mention furnishing, your commute and must-haves. For a PG, include room-sharing preferences, meals and any facilities you need.",
      },
      {
        title: "Explore your next move",
        body: "Discuss property options against your brief. Confirm availability, pricing and viewing arrangements with the property contact before deciding.",
      },
    ],
    example: platformServices.search.enquiry,
    cta: platformServices.search.cta,
  },
  // {
  //   id: "builder",
  //   service: "promote",
  //   label: "Builders",
  //   icon: "building",
  //   intent: "Introduce your project",
  //   title: "Make your project part of the conversation.",
  //   description:
  //     `Introduce the vision behind your development. Share your project and explore how ${brandName} can help you tell its story.`,
  //   steps: [
  //     {
  //       title: "Introduce your project",
  //       body: "Share the project name, location, property types, current inventory and expected completion date.",
  //     },
  //     {
  //       title: "Discuss your promotion goals",
  //       body: "Tell us what makes your project stand out and who you’d like to reach. Explore the available promotion options together.",
  //     },
  //     {
  //       title: "Confirm your campaign details",
  //       body: "Have your brochure, visuals and project information ready. Discuss the scope and next steps before moving ahead.",
  //     },
  //   ],
  //   example: platformServices.promote.enquiry,
  //   cta: platformServices.promote.cta,
  // },
];

/** Question and answer pairs used by FaqSection; {phone} is replaced with the current API number. */
export const faqs = [
  [
    "Do I need to download another app?",
    "No extra property app is needed to start. Use the WhatsApp app on your phone, or WhatsApp Web on your computer. The buttons on this page open WhatsApp with a message you can review before sending.",
  ],
  [
    "Are there any service charges?",
    "Owners and agents can post properties for free. Property search is a paid service for tenants and buyers. Builders pay a premium to advertise their projects. Ask about search fees and advertising rates on WhatsApp before you proceed.",
  ],
  [
    "Can I post a property or PG room?",
    "Yes. Owners, agents and PG operators can post properties and available rooms. For PG (paying guest) accommodation, share photos, room-sharing options, facilities, meal availability, monthly rent and deposit. Make sure you have permission to list the space.",
  ],
  // [
  //   "How can builders promote a project?",
  //   "Share your project details and the audience you’d like to reach. We’ll guide the conversation around available promotion options and what to prepare next.",
  // ],
  [
    "What if WhatsApp does not open?",
    `On a phone, check that WhatsApp is installed. On a computer, sign in to WhatsApp Web. You can also save +{phone} and start a conversation from WhatsApp.`,
  ],
  ];
