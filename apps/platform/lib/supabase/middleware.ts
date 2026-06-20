import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

// /exec is intentionally NOT public: the dashboard reads RLS-protected data, so
// it needs a session. In the demo, the redirect below routes it through
// /demo/enter (auto-sign-in); in real prod it goes to /login until magic-link
// exec/EA auth is built (EXECUTIVE_PORTAL_BRIEF). The /exec/email and /exec/rsvp
// design references stay reachable without data (handled as static pages).
const PUBLIC_PATHS = ["/", "/login", "/signup", "/auth", "/api/webhooks", "/e", "/demo"];

/**
 * Refreshes the auth session on every request and gates access: anyone not
 * signed in is sent to /login. Staff-vs-vendor authorisation is enforced per
 * page (requireStaff), not here.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );

  if (!isPublic) {
    // Demo open-access: skip the login form and put the visitor in the right
    // synthetic account for the portal they're viewing. The three portals are
    // different accounts (admin for /admin + /exec, vendor for /vendor), and one
    // browser session is one account — so we re-enter the correct account
    // whenever it doesn't match the path, letting a visitor move freely between
    // portals instead of hitting an account that isn't set up for the section.
    if (process.env.NEXT_PUBLIC_DEMO_OPEN_ACCESS === "1") {
      // API routes do their own authz (staff, or the owning vendor) and a 307
      // here would drop the request body — so never force a demo account-switch
      // on them. Page navigations still get routed to the right synthetic account.
      const isApi = path.startsWith("/api/");
      const role = path.startsWith("/vendor") ? "vendor" : "admin";
      const requiredEmail = (
        role === "vendor" ? process.env.DEMO_VENDOR_EMAIL : process.env.DEMO_ADMIN_EMAIL
      )?.toLowerCase();
      const wrongAccount = !!user && !!requiredEmail && user.email?.toLowerCase() !== requiredEmail;
      if (!isApi && (!user || wrongAccount)) {
        const url = request.nextUrl.clone();
        url.pathname = "/demo/enter";
        url.search = "";
        url.searchParams.set("role", role);
        url.searchParams.set("next", path);
        return NextResponse.redirect(url);
      }
    } else if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
  }

  return response;
}
