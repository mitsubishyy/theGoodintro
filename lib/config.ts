// Site-wide constants.

export const SITE_URL = "https://thebigintro.com";

export const SITE_NAME = "TheBigIntro";

export const SITE_DESCRIPTION =
  "Relevant, qualified introductions with senior leaders. Every meeting sends a real donation to a charity they choose. Invite only, Australia first.";

// TODO(lachlan): replace with the dedicated TheBigIntro Calendly event link
// before public launch. mailto stub keeps CTAs functional for now.
export const CALENDLY_URL = "mailto:hello@thebigintro.com";

// TODO(lachlan): replace with Isobel's real LinkedIn URL.
export const FOUNDER_LINKEDIN = "https://www.linkedin.com/in/isobel-hardwick/";

// Public registers used for verification links across the site.
export const ACNC_REGISTER_URL = "https://www.acnc.gov.au/charity/charities";
export const ABN_LOOKUP_URL = "https://abr.business.gov.au/";

// Illustrative only. Well-known DGR-endorsed Australian charities shown as
// examples; these are NOT partners. An executive may nominate any
// DGR-endorsed Australian charity. Links go to each charity's own site;
// any charity can be checked on the ACNC register and ABN Lookup.
// The logo is loaded live from the charity's own domain via a logo
// service; `color` is the charity's brand colour, used only for the
// text-chip fallback if a logo does not load. `logo` can be set to an
// explicit URL or a /public path to override the domain lookup.
export const DGR_CHARITY_EXAMPLES = [
  { name: "Beyond Blue", href: "https://www.beyondblue.org.au", domain: "beyondblue.org.au", color: "#0083c9" },
  { name: "The Smith Family", href: "https://www.thesmithfamily.com.au", domain: "thesmithfamily.com.au", color: "#e4002b" },
  { name: "OzHarvest", href: "https://www.ozharvest.org", domain: "ozharvest.org", color: "#e8521e" },
  { name: "Royal Flying Doctor Service", href: "https://www.flyingdoctor.org.au", domain: "flyingdoctor.org.au", color: "#c8102e" },
  { name: "Cancer Council", href: "https://www.cancer.org.au", domain: "cancer.org.au", color: "#00558c" },
  { name: "Australian Red Cross", href: "https://www.redcross.org.au", domain: "redcross.org.au", color: "#cf1020" },
  { name: "The Fred Hollows Foundation", href: "https://www.hollows.org", domain: "hollows.org", color: "#0072ad" },
];
