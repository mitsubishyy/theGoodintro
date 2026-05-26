"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type TokenActionState = { result?: string; error?: string };

// The committing POST for the exec confirm page. Records consent + advances the
// request via the token-keyed RPC (the executive is not logged in).
export async function actOnTokenAction(
  _prev: TokenActionState,
  fd: FormData,
): Promise<TokenActionState> {
  const token = String(fd.get("token") ?? "");
  const actor = String(fd.get("actor") ?? "executive");
  const action = String(fd.get("action") ?? "");
  const declineReason = String(fd.get("decline_reason") ?? "").trim();

  if (!token || !action) return { error: "Something went wrong. Please try again." };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ua = h.get("user-agent") ?? "";

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("act_on_request_token", {
    p_token: token,
    p_actor: actor,
    p_action: action,
    p_decline_reason: declineReason || null,
    p_ip: ip,
    p_user_agent: ua,
    p_terms_version: "v1",
  });
  if (error) return { error: error.message };
  return { result: String(data) };
}
