import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  COMPANY_LINKEDIN,
  FOUNDER_LINKEDIN,
  COMPANY_ABN,
} from "@/lib/config";

// Contact address. Plural domain is intentional (the business Workspace).
const CONTACT_EMAIL = "issy@thegoodintros.com";

/**
 * Organization structured data, rendered once in the root layout so it is
 * present on every page. Kept deliberately minimal and factual: no claims
 * we cannot stand behind (no aggregate ratings, no fake addresses).
 */
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    image: `${SITE_URL}/brand/logo.png`,
    description: SITE_DESCRIPTION,
    email: CONTACT_EMAIL,
    areaServed: { "@type": "Country", name: "Australia" },
    founder: { "@type": "Person", name: "Isobel Hardwick" },
    // ABN is already shown publicly in the footer; declaring it here makes the
    // entity unambiguous to search engines.
    identifier: {
      "@type": "PropertyValue",
      propertyID: "ABN",
      value: COMPANY_ABN,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: CONTACT_EMAIL,
      areaServed: "AU",
      availableLanguage: "English",
    },
    // Verified profiles that represent the same entity.
    sameAs: [COMPANY_LINKEDIN, FOUNDER_LINKEDIN],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * WebSite structured data, rendered once in the root layout. Establishes the
 * site entity (name, language, publisher) for search engines. No SearchAction
 * because the site has no on-site search endpoint to honour one.
 */
export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "en-AU",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * CollectionPage + ItemList structured data for a listing page (e.g. the
 * charities index). Declares the page as a collection and lists its members in
 * order, tied back to the site's WebSite entity.
 */
export function CollectionPageJsonLd({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description: string;
  path: string;
  items: { name: string; path: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}${path}#collection`,
    url: `${SITE_URL}${path}`,
    name,
    description,
    inLanguage: "en-AU",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: it.name,
        url: `${SITE_URL}${it.path}`,
      })),
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export type Crumb = { name: string; path: string };

/**
 * BreadcrumbList structured data for nested routes (e.g. a charity detail page
 * under /charities). Pass the trail from the site root; the helper builds the
 * absolute URLs and ordered positions.
 */
export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export type FaqEntry = { q: string; a: string };

/**
 * FAQPage structured data. Drive this from the SAME array the page renders
 * its visible <Faq> items from, so the schema can never drift from, or invent,
 * the on-page copy.
 */
export function FaqJsonLd({ items }: { items: FaqEntry[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
