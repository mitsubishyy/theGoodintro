"use server";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { assertFlag } from "@/lib/flags";
import { buildAuthorizeUrl, getXeroConfig, STATE_COOKIE } from "@/lib/integrations/xero";

/**
 * Start the Xero OAuth connect flow (XERO_INTEGRATION_CONTRACT.md §2). Staff
 * only, gated by integrations_xero. Sets a short-lived CSRF state cookie, then
 * redirects to Xero's consent screen. The callback re-checks the state.
 */
export async function startXeroConnectAction() {
  await requireStaff();
  await assertFlag("integrations_xero");

  const config = getXeroConfig();
  if (!config) redirect("/admin/settings?xero=not_configured");

  const state = crypto.randomBytes(16).toString("hex");
  const jar = await cookies();
  jar.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // survives the top-level redirect back from Xero
    path: "/",
    maxAge: 600, // 10 minutes; the round-trip is seconds
  });

  redirect(buildAuthorizeUrl(config, state));
}
