// Site-wide constants.

export const SITE_URL = "https://thegoodintro.com";

export const SITE_NAME = "TheGoodIntro";

export const SITE_DESCRIPTION =
  "Relevant, qualified introductions with senior leaders. Every meeting sends a real donation to a charity they choose. Invite only, Australia first.";

// TODO: wire the Apply CTAs to the real booking link before public launch.
// Currently the Apply buttons render with no destination on purpose.
export const CALENDLY_URL = "mailto:issy@thegoodintros.com";

// TODO(lachlan): replace with Isobel's real LinkedIn URL.
export const FOUNDER_LINKEDIN = "https://www.linkedin.com/in/isobel-hardwick/";

// Company LinkedIn page. Used in the footer and as an Organization `sameAs`
// signal so search engines tie the site to the verified company profile.
export const COMPANY_LINKEDIN = "https://www.linkedin.com/company/thegoodintro";

// Registered ABN (also shown publicly in the footer). Used as a structured-data
// identifier on the Organization so the entity is unambiguous to search engines.
export const COMPANY_ABN = "59 398 447 638";

// Public registers used for verification links across the site.
export const ACNC_REGISTER_URL = "https://www.acnc.gov.au/charity/charities";
export const ABN_LOOKUP_URL = "https://abr.business.gov.au/";

// Illustrative only. The charities shown as examples are drawn EXCLUSIVELY
// from the CHARITY_FLOW.md shortlist (the table of 15); these are NOT
// partners. Executives choose from the curated shortlist and may nominate
// any other DGR-endorsed Australian charity (verified and added before
// their first meeting).
// Links go to each charity's own site; any charity can be checked on the
// ACNC register and ABN Lookup. The logo is loaded live from the charity's
// own domain via a logo service, falling back to a text chip. `logo` can be
// set to an explicit URL or a /public path to override the domain lookup.
export const DGR_CHARITY_EXAMPLES = [
  { name: "Leukaemia Foundation", href: "https://www.leukaemia.org.au", domain: "leukaemia.org.au" },
  { name: "Royal Flying Doctor Service", href: "https://www.flyingdoctor.org.au", domain: "flyingdoctor.org.au" },
  { name: "R U OK?", href: "https://www.ruok.org.au", domain: "ruok.org.au" },
  { name: "headspace", href: "https://headspace.org.au", domain: "headspace.org.au" },
  { name: "Starlight Children's Foundation", href: "https://www.starlight.org.au", domain: "starlight.org.au" },
  { name: "Ronald McDonald House Charities", href: "https://www.rmhc.org.au", domain: "rmhc.org.au" },
  { name: "St Vincent de Paul Society", href: "https://www.vinnies.org.au", domain: "vinnies.org.au" },
  { name: "Children's Ground", href: "https://childrensground.org.au", domain: "childrensground.org.au" },
  { name: "WWF-Australia", href: "https://wwf.org.au", domain: "wwf.org.au" },
  { name: "RSPCA Australia", href: "https://www.rspca.org.au", domain: "rspca.org.au" },
  { name: "Guide Dogs Australia", href: "https://guidedogsaustralia.com", domain: "guidedogsaustralia.com" },
  { name: "Save the Children Australia", href: "https://www.savethechildren.org.au", domain: "savethechildren.org.au" },
  { name: "World Vision Australia", href: "https://www.worldvision.com.au", domain: "worldvision.com.au" },
  { name: "Cerebral Palsy Alliance", href: "https://cerebralpalsy.org.au", domain: "cerebralpalsy.org.au" },
  { name: "Cancer Council Australia", href: "https://www.cancer.org.au", domain: "cancer.org.au" },
];
