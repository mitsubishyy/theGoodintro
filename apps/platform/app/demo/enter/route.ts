import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Demo open-access auto-sign-in. ONLY active when DEMO_OPEN_ACCESS=1 (set on the
 * staging/demo deploy, never in real production). Signs the visitor in as a
 * synthetic account for the requested role so they can view the portals without
 * a login screen. Real auth/RLS still applies — this just skips the form.
 */
export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role") === "vendor" ? "vendor" : "admin";
  const nextParam = req.nextUrl.searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : role === "vendor" ? "/vendor" : "/admin";

  if (process.env.NEXT_PUBLIC_DEMO_OPEN_ACCESS !== "1") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const res = NextResponse.redirect(new URL(next, req.url));
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(list: CookieToSet[]) {
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const email = role === "vendor" ? process.env.DEMO_VENDOR_EMAIL : process.env.DEMO_ADMIN_EMAIL;
    const password = process.env.DEMO_PASSWORD;
    if (email && password) {
      await supabase.auth.signInWithPassword({ email, password });
    }
  }
  return res;
}
