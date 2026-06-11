import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { CHARITIES } from "@/lib/charities";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/how-it-works",
    "/executives",
    "/vendors",
    "/pricing",
    "/giving",
    "/ledger",
    "/charities",
    ...CHARITIES.map((c) => `/charities/${c.slug}`),
    "/faq",
    "/compare",
    "/impact",
    "/opportunity",
    "/waitlist",
    "/privacy",
    "/terms",
  ];
  const now = new Date();
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
