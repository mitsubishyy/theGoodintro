import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    // Noindex routes (/apply, /r, /mockup/*) are intentionally left crawlable
    // so engines can see their `noindex` meta tag. Only the API has nothing to
    // index.
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
