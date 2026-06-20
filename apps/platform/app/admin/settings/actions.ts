"use server";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { assertFlag } from "@/lib/flags";
import { logAudit } from "@/lib/audit";
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

/**
 * Toggle a feature flag from the admin Settings panel. Staff-only (write RLS on
 * feature_flag is private.is_staff(), 0003) and audit-logged. Stamps updated_by
 * so "who flipped what" is on the row as well as in the append-only log.
 * CHANGE_SAFETY.md: flags are the supported on/off switch for every flag-gated
 * behaviour, so go-live stays a deliberate, recorded staff action.
 */
export async function setFeatureFlagAction(fd: FormData): Promise<void> {
  const { staff, supabase } = await requireStaff();
  const key = String(fd.get("key") ?? "").trim();
  const enabled = String(fd.get("enabled") ?? "") === "true";
  if (!key) return;

  const { data, error } = await supabase
    .from("feature_flag")
    .update({ enabled, updated_by: staff.id })
    .eq("key", key)
    .select("id")
    .maybeSingle();
  if (error || !data) return;

  await logAudit(supabase, staff.id, {
    action: "feature_flag.toggled",
    targetType: "feature_flag",
    targetId: data.id,
    metadata: { key, enabled },
  });
  revalidatePath("/admin/settings");
}
