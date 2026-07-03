import type { Metadata } from "next";
import { SITE_URL } from "./config";

// Builds a Metadata object with title, description, canonical URL, and
// matching OpenGraph + Twitter overrides. Without this helper, page-level
// `title` + `description` overrides do not propagate to og:title / og:description
// / twitter:title — so social shares would fall back to the layout defaults.
export function pageMetadata({
  title,
  description,
  path = "/",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "TheGoodIntro",
      locale: "en_AU",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
