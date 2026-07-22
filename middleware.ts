import { NextResponse, type NextRequest } from "next/server";

// ============================================================================
// PUBLIC "COMING SOON" WALL  (the sheet over the table)
// ----------------------------------------------------------------------------
// WALL_DEFAULT = true  -> the whole public site is hidden behind /coming-soon.
// WALL_DEFAULT = false -> the real site is public again.
//
// The entire site stays built and untouched underneath either way, so lifting
// the wall is instant: flip the constant below (or set the COMING_SOON env var
// to "true"/"false" in Vercel, which overrides it) and redeploy. Nothing about
// the real pages, content, SEO files, or data changes.
//
// PRIVATE PREVIEW: while the wall is up, visit any page once with
//   ?preview=lift-the-sheet
// to drop a cookie and browse the real site as normal. Change the token via the
// PREVIEW_TOKEN env var to make it private.
// ============================================================================

const WALL_DEFAULT = false;

function wallIsUp(): boolean {
  if (process.env.COMING_SOON === "true") return true;
  if (process.env.COMING_SOON === "false") return false;
  return WALL_DEFAULT;
}

const PREVIEW_TOKEN = process.env.PREVIEW_TOKEN || "lift-the-sheet";
const PREVIEW_COOKIE = "tgi_preview";

export function middleware(req: NextRequest) {
  if (!wallIsUp()) return NextResponse.next();

  const token = req.nextUrl.searchParams.get("preview");
  const hasPass = req.cookies.get(PREVIEW_COOKIE)?.value === PREVIEW_TOKEN;

  // Preview holders see the real site; a fresh ?preview token sets the cookie.
  if (token === PREVIEW_TOKEN || hasPass) {
    const res = NextResponse.next();
    if (token === PREVIEW_TOKEN) {
      res.cookies.set(PREVIEW_COOKIE, PREVIEW_TOKEN, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
    return res;
  }

  // Everyone else: serve the splash for every route, URL unchanged.
  return NextResponse.rewrite(new URL("/coming-soon", req.url));
}

export const config = {
  // Run on all routes except API, Next internals, the splash itself, and any
  // file with an extension (assets, robots.txt, sitemap.xml, llms.txt, fonts).
  matcher: ["/((?!api|_next|coming-soon|.*\\..*).*)"],
};
