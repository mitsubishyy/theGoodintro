// Submits the site's pages to IndexNow so Bing indexes new content quickly.
// Run after a Vercel deploy: `npm run indexnow`.
//
// Requires an IndexNow key:
//   1. Set INDEXNOW_KEY in the environment.
//   2. Host the key file at https://thegoodintro.vercel.app/<INDEXNOW_KEY>.txt
//      containing exactly the key (place it in public/).
// Without the key this is a safe no-op so it never breaks a deploy.

const HOST = "thegoodintro.vercel.app";
const SITE = `https://${HOST}`;
const KEY = process.env.INDEXNOW_KEY;

const ROUTES = [
  "",
  "/how-it-works",
  "/vendors",
  "/pricing",
  "/giving",
  "/impact",
  "/faq",
  "/opportunity",
  "/apply",
  "/privacy",
  "/terms",
];

if (!KEY) {
  console.log(
    "[indexnow] INDEXNOW_KEY not set. Skipping (no-op). " +
      "Set it and add public/<key>.txt before relying on this.",
  );
  process.exit(0);
}

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
