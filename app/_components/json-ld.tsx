import { SITE_URL, SITE_NAME } from "@/lib/config";

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
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.png`,
    email: CONTACT_EMAIL,
    founder: { "@type": "Person", name: "Isobel Hardwick" },
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
