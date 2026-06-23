import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { CHARITIES } from "@/lib/charities";

type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
};

// Indexable public routes, tiered by importance. Noindex routes (/apply, /r,
// /mockup/*) are intentionally absent. `lastModified` is deliberately omitted:
// stamping every URL with the build time is a false "changed today" signal that
// search engines learn to distrust.
const PAGES: Entry[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/how-it-works", priority: 0.8, changeFrequency: "monthly" },
  { path: "/executives", priority: 0.8, changeFrequency: "monthly" },
  { path: "/vendors", priority: 0.8, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/giving", priority: 0.8, changeFrequency: "monthly" },
  { path: "/charities", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
  { path: "/impact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/ledger", priority: 0.6, changeFrequency: "weekly" },
  { path: "/opportunity", priority: 0.6, changeFrequency: "monthly" },
  { path: "/waitlist", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = PAGES.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
  const charities: MetadataRoute.Sitemap = CHARITIES.map((c) => ({
    url: `${SITE_URL}/charities/${c.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));
  return [...pages, ...charities];
}
