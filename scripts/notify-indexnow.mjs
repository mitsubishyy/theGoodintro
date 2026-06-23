// Submits the site's pages to IndexNow so Bing indexes new content quickly.
// Run after a Vercel deploy: `npm run indexnow`.
//
// IndexNow keys are NOT secret: the matching proof file is hosted publicly at
// https://thegoodintro.com/<KEY>.txt. So the key is committed below and the
// script works out of the box; override with INDEXNOW_KEY if it is ever rotated
// (remember to commit the new public/<key>.txt alongside it).

const HOST = "thegoodintro.com";
const SITE = `https://${HOST}`;
const KEY = process.env.INDEXNOW_KEY || "ceb04359c0708ba22085819b6ae7ef78";

// Keep in sync with the indexable routes in app/sitemap.ts (noindex routes omitted).
const ROUTES = [
  "",
  "/how-it-works",
  "/executives",
  "/vendors",
  "/pricing",
  "/giving",
  "/charities",
  "/faq",
  "/impact",
  "/ledger",
  "/opportunity",
  "/waitlist",
  "/privacy",
  "/terms",
];

const urlList = ROUTES.map((p) => `${SITE}${p}`);

try {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `${SITE}/${KEY}.txt`,
      urlList,
    }),
  });
  console.log(`[indexnow] submitted ${urlList.length} urls, status ${res.status}`);
  process.exit(res.ok ? 0 : 1);
} catch (err) {
  console.error("[indexnow] failed:", err);
  process.exit(1);
}
