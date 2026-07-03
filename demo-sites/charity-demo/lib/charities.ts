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
//   ACNC/ABN register.
// - Never publish a per-dollar figure unless the charity publishes one we can
//   attribute; describe the service a gift funds instead. Never invent numbers.
//   (Keep this reasoning OUT of the customer-facing copy: state what a gift
//   funds plainly, do not narrate what we chose not to write.)
// - Re-verify each figure against the charity's site before every publish.
// - Nothing here may imply partnership or endorsement. The template adds
//   the standard non-affiliation line to every page.

/**
 * A photo slot on a charity profile. Leave `images` unset on a charity to
 * show on-brand placeholders (the page renders two landscape + one portrait
 * frame). To add a real photo, drop the file under /public and add an entry
 * here with its `src` + `alt`, one slot at a time.
 */
export type CharityImage = {
  orientation: "landscape" | "portrait";
  /** Path under /public, e.g. /charities/photos/rfds/clinic.webp */
  src: string;
  /** Describe the photo (required once a src is set). */
  alt: string;
};

export type CharityProfile = {
  slug: string;
  name: string;
  /** One-line cause, used on the index card and as the profile lede. */
  tagline: string;
  /** The charity's own website. */
  website: string;
  /** Logo path under /public (filenames do not always match the slug). */
  logo: string;
  /** The charity's official donation page, verified from their own site. */
  donateUrl: string;
  /** Two short paragraphs on what they do, from their own materials. */
  about: [string, string];
  /**
   * What a gift funds. Two paragraphs: (1) the concrete service a gift funds,
   * (2) what they are doing to make change. Plain and confident, no figure
   * unless the charity publishes one we can attribute.
   */
  impact: { heading: string; body: string[] };
  /** Optional extra note rendered after the impact body (e.g. structure). */
  note?: string;
  /** Registered entity name, per CHARITY_FLOW.md / ABN Lookup. */
  entity: string;
  /** ABN per CHARITY_FLOW.md, confirmed on ABN Lookup. */
  abn: string;
  /** DGR status line. */
  dgr: string;
  /** Optional real photos. When unset, the page shows placeholder frames. */
  images?: CharityImage[];
};

export const CHARITIES: CharityProfile[] = [
  {
    slug: "leukaemia-foundation",
    name: "Leukaemia Foundation",
    tagline: "Blood cancer support and research",
    website: "https://www.leukaemia.org.au",
    logo: "/charities/leukaemia-foundation.png",
    donateUrl: "https://www.leukaemia.org.au/make-a-difference/give/donate/",
    about: [
      "The Leukaemia Foundation is a national charity supporting Australians facing leukaemia, lymphoma, myeloma and other blood cancers, along with their families.",
      "It offers wraparound support services, including emotional support, accommodation for patients who travel for treatment and practical assistance, while funding blood cancer research and campaigning for change.",
    ],
    impact: {
      heading: "What a gift funds",
      body: [
        "A gift directed here supports its blood cancer research grants and its wraparound support services, including free or subsidised accommodation near treatment for patients who travel, practical assistance, and emotional support from its blood cancer support coordinators.",
        "The Foundation also campaigns for equitable access to treatment and care for every Australian with blood cancer, wherever they live, and funds research aimed at improving survival. Its stated goal is a future where no one loses their life to blood cancer.",
      ],
    },
    entity: "The Leukaemia Foundation of Australia Limited",
    abn: "57 057 493 017",
    dgr: "DGR endorsed",
  },
  {
    slug: "rfds",
    name: "Royal Flying Doctor Service",
    tagline: "Remote emergency medical",
    website: "https://www.flyingdoctor.org.au",
    logo: "/charities/royal-flying-doctor-service.png",
    donateUrl: "https://www.flyingdoctor.org.au/donate/",
    about: [
      "The Royal Flying Doctor Service provides emergency and primary health care to people living, working and travelling across rural and remote Australia, delivered by air and on the ground.",
      "Donations and bequests help fund the replacement of aeromedical aircraft and the vital medical equipment that keeps the service flying.",
    ],
    impact: {
      heading: "What a gift funds",
      body: [
        "A gift directed here supports the aeromedical aircraft, medical equipment and onboard supplies that let its crews reach and treat patients far from a hospital, along with the primary and preventative health clinics it runs in remote communities.",
        "The RFDS combines emergency aeromedical retrieval with everyday primary care, dental and mental health services for people who live, work and travel beyond the reach of city hospitals. Its work helps ensure that distance from a hospital is less of a barrier to timely care.",
      ],
    },
    note: "The RFDS is a federation of sections. Donations and bequests received by the national body are distributed across the RFDS family nationally.",
    entity: "Royal Flying Doctor Service of Australia",
    abn: "74 438 059 643",
    dgr: "DGR endorsed",
  },
  {
    slug: "ruok",
    name: "R U OK?",
    tagline: "Suicide prevention through connection",
    website: "https://www.ruok.org.au",
    logo: "/charities/r-u-ok.png",
    donateUrl: "https://join.ruok.org.au/donate",
    about: [
      "R U OK? is an Australian suicide prevention charity and registered health promotion charity. It encourages people to stay connected and have conversations that can support someone through a difficult time.",
      "It aims to inspire and empower everyone to meaningfully connect with the people around them and start a conversation with anyone who may be struggling with life.",
    ],
    impact: {
      heading: "What a gift funds",
      body: [
        "A gift directed here supports the campaigns, free resources and education programs that help Australians notice when someone is struggling and start a conversation, including materials made for workplaces, schools and communities.",
        "R U OK? is a public health initiative focused on prevention through everyday connection, encouraging people to ask the question, listen, and stay in touch rather than wait for a crisis. Its national day each year anchors a message it carries the rest of the year, that a conversation could change a life.",
      ],
    },
    entity: "RUOK? Limited",
    abn: "25 138 676 829",
    dgr: "DGR endorsed",
  },
  {
    slug: "headspace",
    name: "headspace",
    tagline: "Youth mental health",
    website: "https://headspace.org.au",
    logo: "/charities/headspace.png",
    donateUrl: "https://headspace.org.au/donate",
    about: [
      "headspace is Australia's National Youth Mental Health Foundation, providing early intervention mental health services to young people aged 12 to 25.",
      "Its centres across Australia, alongside online and phone services, support young people across four areas: mental health, physical health, alcohol and other drugs, and work and study.",
    ],
    impact: {
      heading: "What a gift funds",
      body: [
        "A gift directed here supports early intervention services for young people aged 12 to 25, spanning mental health, physical and sexual health, alcohol and other drugs, and work and study support, delivered through its centres and its online and phone service, eheadspace.",
        "headspace works to reach young people early, before difficulties become entrenched, and to make help easier to find and less stigmatised. It also supports families and friends, and contributes to research and training that lift the quality of youth mental health care across Australia.",
      ],
    },
    entity: "headspace National Youth Mental Health Foundation Ltd",
    abn: "26 137 533 843",
    dgr: "DGR endorsed",
  },
  {
    slug: "starlight",
    name: "Starlight Children's Foundation",
    tagline: "Joy for seriously ill children",
    website: "https://www.starlight.org.au",
    logo: "/charities/starlight-children-s-foundation.png",
    donateUrl: "https://www.starlight.org.au/donate/",
    about: [
      "Starlight Children's Foundation works to brighten the lives of seriously ill and hospitalised children and young people across Australia.",
      "It uses play, social connection and creativity, through programs such as Starlight Express Rooms, Livewire and wish-granting, to support children through treatment and hospital stays.",
    ],
    impact: {
      heading: "What a gift funds",
      body: [
        "A gift directed here supports programs such as Starlight Express Rooms in major children's hospitals, the Captain Starlight visitor program, the Livewire online community for teens, and wishes granted to children living with a serious illness.",
        "Starlight uses positive distraction and play as a complement to medical treatment, helping seriously ill children and young people cope with pain, fear and isolation. Its programs are designed to give children moments of normal childhood and joy through what can be a long and difficult time.",
      ],
    },
    entity: "Starlight Children's Foundation Australia",
    abn: "80 931 522 157",
    dgr: "DGR endorsed",
  },
  {
    slug: "ronald-mcdonald-house",
    name: "Ronald McDonald House Charities",
    tagline: "Families near children in hospital",
    website: "https://www.rmhc.org.au",
    logo: "/charities/ronald-mcdonald-house-charities.png",
    donateUrl: "https://ronaldmcdonaldhouse.org.au/donate/",
    about: [
      "Ronald McDonald House Charities provides accommodation and support to families with a seriously ill or injured child who is receiving specialist medical care away from home.",
      "It runs houses, family rooms, family retreats and other programs across Australia so families can stay close to their child, and to each other, during treatment.",
    ],
    impact: {
      heading: "What a gift funds",
      body: [
        "A gift directed here supports its Houses and Family Rooms near hospitals, which give families a place to sleep, eat and rest close to their seriously ill or injured child, along with family retreats and learning programs.",
        "The charity keeps families together and close to the care their child needs, easing the financial and emotional strain of treatment away from home. Staying nearby means parents can be present for ward rounds, treatment and recovery rather than travelling long distances each day.",
      ],
    },
    entity: "Ronald McDonald House Charities Trust",
    abn: "26 037 589 412",
    dgr: "DGR endorsed",
  },
  {
    slug: "st-vincent-de-paul",
    name: "St Vincent de Paul Society",
    tagline: "Help for people in need",
    website: "https://www.vinnies.org.au",
    logo: "/charities/st-vincent-de-paul-society.png",
    donateUrl: "https://donate.vinnies.org.au/",
    about: [
      "The St Vincent de Paul Society, known as Vinnies, is a lay Catholic organisation that provides assistance to people experiencing hardship across Australia.",
      "It runs more than 200 services nationally, including emergency accommodation, food and meals through its soup vans and food hubs, and longer-term support such as casework, healthcare and employment assistance.",
    ],
    impact: {
      heading: "What a gift funds",
      body: [
        "A gift directed to the national body supports services for people in need, including emergency accommodation, food and meals through soup vans and food hubs, financial and material assistance, and longer-term casework, healthcare and employment support.",
        "Vinnies combines immediate relief with support that helps people move beyond crisis, delivered largely through volunteer members who visit and assist people in their own communities. It also advocates on the causes of poverty and disadvantage in Australia.",
      ],
    },
    note: "Vinnies operates through state and territory councils. A gift directed here goes to the National Council of Australia.",
    entity: "National Council of Australia Incorporated",
    abn: "50 748 098 845",
    dgr: "DGR endorsed",
  },
  {
    slug: "childrens-ground",
    name: "Children's Ground",
    tagline: "First Nations-led change",
    website: "https://childrensground.org.au",
    logo: "/charities/children-s-ground.png",
    donateUrl: "https://childrensground.org.au/donate",
    about: [
      "Children's Ground is a First Nations-led organisation working with Aboriginal communities to deliver a long-term approach to learning, health, wellbeing and employment.",
      "Its approach is designed, delivered and evaluated by the communities it serves, working across a generation to create lasting change.",
    ],
    impact: {
      heading: "What a gift funds",
      body: [
        "A gift directed here supports its First Nations-led programs across early years learning, education, health and wellbeing, cultural and creative development, and economic participation, delivered with and by the communities it serves.",
        "Children's Ground works to a long-term commitment, designed, delivered and evaluated by First Nations people, with the aim of lasting change across a generation rather than short-term intervention. Its approach is built on the knowledge, languages and aspirations of the communities themselves.",
      ],
    },
    entity: "Children's Ground Limited",
    abn: "74 154 403 086",
    dgr: "DGR endorsed",
  },
  {
    slug: "wwf-australia",
    name: "WWF-Australia",
    tagline: "Wildlife and nature conservation",
    website: "https://wwf.org.au",
    logo: "/charities/wwf-australia.png",
    donateUrl: "https://www.wwf.org.au/donate",
    about: [
      "WWF-Australia is the local arm of the global conservation organisation, working to protect Australia's threatened species and the habitats they depend on.",
      "It works to protect wildlife and restore nature, drawing on First Peoples' knowledge and partnering with communities across Australia and the Asia-Pacific.",
    ],
    impact: {
      heading: "What a gift funds",
      body: [
        "A gift directed here supports its work to protect threatened species such as koalas, restore habitats damaged by land clearing and bushfire, and reduce the pressures driving wildlife decline across Australia and the wider Asia-Pacific.",
        "WWF-Australia works to regenerate nature this decade, partnering with First Peoples, scientists, communities and business to protect wildlife and the places they depend on. It combines on-ground conservation with advocacy for stronger protection of Australia's natural environment.",
      ],
    },
    entity: "World Wide Fund for Nature Australia",
    abn: "57 001 594 074",
    dgr: "DGR endorsed",
  },
  {
    slug: "rspca-australia",
    name: "RSPCA Australia",
    tagline: "Animal welfare",
    website: "https://www.rspca.org.au",
    logo: "/charities/rspca-australia.png",
    donateUrl: "https://www.rspca.org.au/support-us/donate/",
    about: [
      "RSPCA Australia is the national body of the RSPCA federation, working to prevent cruelty to animals and to improve animal welfare across the country.",
      "The national office focuses on animal welfare policy, science and education, while the member Societies in each state and territory deliver frontline animal care.",
    ],
    impact: {
      heading: "What a gift funds",
      body: [
        "A gift directed to the national body supports the animal welfare policy, science and education work behind the RSPCA name, including research into farm animal welfare and national standards, advocacy, and public education campaigns.",
        "The national office sets the direction and evidence base for animal welfare in Australia, while the member Societies in each state and territory run the shelters, inspectorate and frontline animal care. Together they work to prevent cruelty and improve the treatment of animals.",
      ],
    },
    note: "The RSPCA is a federation. A gift directed here goes to the national body, RSPCA Australia.",
    entity: "RSPCA Australia",
    abn: "99 668 654 249",
    dgr: "DGR endorsed",
  },
  {
    slug: "guide-dogs-australia",
    name: "Guide Dogs Australia",
    tagline: "Blindness and low vision services",
    website: "https://guidedogs.com.au",
    logo: "/charities/guide-dogs-australia.png",
    donateUrl: "https://guidedogs.com.au/donate-to-guide-dogs/",
    about: [
      "Guide Dogs Australia is the national federation of Guide Dogs organisations, providing services to people who are blind or have low vision.",
      "Its services reach beyond guide dogs to include orientation and mobility training, occupational therapy and other support that helps people move through the world with confidence.",
    ],
    impact: {
      heading: "What a gift funds",
      body: [
        "A gift directed here supports the breeding, raising and training of guide dogs, and the broader services for people who are blind or have low vision, including orientation and mobility training, occupational therapy and assistive technology.",
        "Guide Dogs helps people with low vision or blindness move safely and live independently, with services extending well beyond the dogs themselves. Raising and training a guide dog can take up to two years, and its services rely largely on donations and community support.",
      ],
    },
    entity: "Royal Guide Dogs Australia",
    abn: "99 008 427 423",
    dgr: "DGR endorsed",
  },
  {
    slug: "save-the-children",
    name: "Save the Children Australia",
    tagline: "Protection for vulnerable children",
    website: "https://www.savethechildren.org.au",
    logo: "/charities/save-the-children-australia.png",
    donateUrl: "https://www.savethechildren.org.au/donate/make-a-donation",
    about: [
      "Save the Children Australia is part of the global Save the Children movement, working to protect children and give them access to education, health care and safety.",
      "It works in Australia and overseas across child protection, education, health and emergency response for children affected by poverty, conflict and disaster.",
    ],
    impact: {
      heading: "What a gift funds",
      body: [
        "A gift directed here supports its programs in Australia and overseas, spanning child protection, early childhood and education, child and maternal health, and emergency response for children affected by disaster and conflict.",
        "Save the Children works to ensure children survive, learn and are protected, reaching children in some of the hardest places through both long-term development and rapid humanitarian response. It also campaigns for the rights of children and for changes that improve their lives.",
      ],
    },
    entity: "Save the Children Australia",
    abn: "99 008 610 035",
    dgr: "DGR endorsed",
  },
  {
    slug: "world-vision-australia",
    name: "World Vision Australia",
    tagline: "Ending poverty for children",
    website: "https://www.worldvision.com.au",
    logo: "/charities/world-vision-australia.png",
    donateUrl: "https://www.worldvision.com.au/donate",
    about: [
      "World Vision Australia is part of the global World Vision movement, working with children, families and communities to overcome poverty and injustice.",
      "Its work spans long-term community development, emergency relief and advocacy, alongside its well-known child sponsorship program.",
    ],
    impact: {
      heading: "What a gift funds",
      body: [
        "A gift directed here supports long-term community development in areas such as clean water, food security, health and education, alongside emergency relief in crises and its well-known child sponsorship program.",
        "World Vision works alongside communities to tackle the root causes of poverty so that progress lasts beyond any single project. It also responds to humanitarian emergencies and advocates on issues such as child protection and ending exploitation.",
      ],
    },
    entity: "World Vision Australia",
    abn: "28 004 778 081",
    dgr: "DGR endorsed",
  },
  {
    slug: "cerebral-palsy-alliance",
    name: "Cerebral Palsy Alliance",
    tagline: "Disability services and research",
    website: "https://cerebralpalsy.org.au",
    logo: "/charities/cerebral-palsy-alliance.png",
    donateUrl: "https://donate.cerebralpalsy.org.au/",
    about: [
      "Cerebral Palsy Alliance provides services, research and advocacy for people living with cerebral palsy and other disabilities, and their families.",
      "Its support spans early intervention, therapy, equipment, accommodation and employment, alongside research and technology aimed at prevention and cure.",
    ],
    impact: {
      heading: "What a gift funds",
      body: [
        "A gift directed here supports its services for people with cerebral palsy and similar disabilities, including early intervention for children, therapy, equipment and assistive technology, accommodation and employment support, and it funds research toward prevention and cure.",
        "The Alliance pairs frontline disability services with a globally recognised research effort, including work on the early detection and prevention of cerebral palsy. Its research is shared internationally, aiming to improve outcomes for people with cerebral palsy beyond Australia alone.",
      ],
    },
    entity: "Cerebral Palsy Alliance",
    abn: "45 000 062 288",
    dgr: "DGR endorsed",
  },
  {
    slug: "cancer-council-australia",
    name: "Cancer Council Australia",
    tagline: "Every area of every cancer",
    website: "https://www.cancer.org.au",
    logo: "/charities/cancer-council.png",
    donateUrl: "https://www.cancer.org.au/get-involved/donate-to-cancer-council",
    about: [
      "Cancer Council Australia is the only charity in Australia working across every area of every cancer. It is a federation of eight state and territory Cancer Councils working together nationally.",
      "Its work spans funding cancer research, prevention programs, and support for people affected by cancer, including the free, confidential Cancer Council 13 11 20 information and support service.",
    ],
    impact: {
      heading: "What a gift funds",
      body: [
        "A gift directed here supports cancer research grants, prevention and early-detection programs such as those covering tobacco, sun protection and screening, and support services including the free, confidential 13 11 20 information and support line.",
        "Cancer Council is the only charity working across every area of every cancer, from research and prevention through to support and advocacy. As a federation of the state and territory Cancer Councils, it brings a national voice to cancer control and evidence-based public health policy.",
      ],
    },
    entity: "The Cancer Council Australia",
    abn: "91 130 793 725",
    dgr: "DGR endorsed",
  },
];

export function getCharity(slug: string): CharityProfile | undefined {
  return CHARITIES.find((c) => c.slug === slug);
}
