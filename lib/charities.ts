// Charity profile pages (/charities/[slug]) are generated from this file.
// One block per charity: adding a verified block publishes a new page, its
// sitemap entry, and its index card in one edit.
//
// SOURCE OF TRUTH: only charities on the CHARITY_FLOW.md shortlist (the
// table of 15) may appear anywhere on the site. ABNs and entity names come
// from that table.
//
// HONESTY RULES (non-negotiable):
// - Every factual claim must come from the charity's own website or the
//   ACNC/ABN register. Impact figures carry their attribution inline
//   ("by [charity]'s own published figures").
// - If a charity publishes no per-dollar figure, describe the service a
//   gift funds instead. Never invent numbers.
// - Re-verify each figure against the charity's site before every publish.
// - Nothing here may imply partnership or endorsement. The template adds
//   the standard non-affiliation line to every page.

export type CharityProfile = {
  slug: string;
  name: string;
  /** One-line cause, used on the index card and as the profile lede. */
  tagline: string;
  /** The charity's own website. */
  website: string;
  /** Two short paragraphs on what they do, from their own materials. */
  about: [string, string];
  /**
   * What a gift funds: the charity's own published equivalence with inline
   * attribution if one exists, otherwise a description of the service.
   */
  impact: { heading: string; body: string };
  /** Optional extra note rendered after the impact body (e.g. structure). */
  note?: string;
  /** Registered entity name, per CHARITY_FLOW.md / ABN Lookup. */
  entity: string;
  /** ABN per CHARITY_FLOW.md, confirmed on ABN Lookup. */
  abn: string;
  /** DGR status line. */
  dgr: string;
};

export const CHARITIES: CharityProfile[] = [
  {
    slug: "rfds",
    name: "Royal Flying Doctor Service",
    tagline: "Remote emergency medical",
    website: "https://www.flyingdoctor.org.au",
    about: [
      "The Royal Flying Doctor Service provides emergency and primary health care to people living, working and travelling across rural and remote Australia, delivered by air and on the ground.",
      "Its own donor pages describe donations and bequests funding the replacement of aeromedical aircraft and vital medical equipment that keep the service flying.",
    ],
    impact: {
      heading: "What a gift funds",
      body: "The Royal Flying Doctor Service does not publish a simple per-dollar figure, so we will not invent one. A gift directed here supports the aeromedical aircraft and medical equipment that keep the service reaching patients across rural and remote Australia.",
    },
    note: "The RFDS is a federation of sections. By its own description, donations and bequests received by the national body are distributed across the RFDS family nationally.",
    entity: "Royal Flying Doctor Service of Australia",
    abn: "74 438 059 643",
    dgr: "DGR endorsed",
  },
  {
    slug: "headspace",
    name: "headspace",
    tagline: "Youth mental health",
    website: "https://headspace.org.au",
    about: [
      "headspace is Australia's National Youth Mental Health Foundation, providing early intervention mental health services to young people aged 12 to 25.",
      "Its centres across Australia, alongside online and phone services, support young people across four areas: mental health, physical health, alcohol and other drugs, and work and study.",
    ],
    impact: {
      heading: "What a gift funds",
      body: "headspace does not publish a simple per-dollar figure, so we will not invent one. A gift directed here supports early intervention services for young people aged 12 to 25, delivered through headspace centres and their online and phone services.",
    },
    entity: "headspace National Youth Mental Health Foundation Ltd",
    abn: "26 137 533 843",
    dgr: "DGR endorsed",
  },
  {
    slug: "cancer-council-australia",
    name: "Cancer Council Australia",
    tagline: "Every area of every cancer",
    website: "https://www.cancer.org.au",
    about: [
      "Cancer Council Australia describes itself as the only charity in Australia to work across every area of every cancer. It is a federation of eight state and territory Cancer Councils working together nationally.",
      "Its work spans funding cancer research, prevention programs, and support for people affected by cancer, including the free, confidential Cancer Council 13 11 20 information and support service.",
    ],
    impact: {
      heading: "What a gift funds",
      body: "Cancer Council Australia does not publish a simple per-dollar figure, so we will not invent one. A gift directed here supports cancer research, prevention programs and support services for Australians affected by cancer.",
    },
    entity: "The Cancer Council Australia",
    abn: "91 130 793 725",
    dgr: "DGR endorsed",
  },
];

export function getCharity(slug: string): CharityProfile | undefined {
  return CHARITIES.find((c) => c.slug === slug);
}
