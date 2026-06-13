"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type TokenActionResult = { result?: string; error?: string };

/**
 * The committing call behind the email's one-tap actions (exec-request-email
 * lock 2026-06-12, act-instantly pattern). Fired by the action page on load:
 * the GET renders, the client immediately POSTs this action, and the page
 * reports the done state. A mail scanner prefetching the GET link never
 * triggers the POST, so prefetch cannot accept or decline a request (the
 * fuller token-security scheme stays the deferred email-actions doc).
 *
 * Actor is recorded as the executive; an EA acting from a forwarded email is
 * the deferred EA-flow pass (DEC-9 actor logging is Phase-2 alongside it).
 */
export async function actOnToken(
  token: string,
  action: "accept" | "decline" | "send_to_ea",
): Promise<TokenActionResult> {
  if (!token || !["accept", "decline", "send_to_ea"].includes(action)) {
    return { error: "bad_request" };
  }
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ua = h.get("user-agent") ?? "";

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("act_on_request_token", {
    p_token: token,
    p_actor: "executive",
    p_action: action,
    p_decline_reason: null,
    p_ip: ip,
    p_user_agent: ua,
    p_terms_version: "v1",
  });
  if (error) return { error: error.message };
  return { result: String(data) };
}

/**
 * Optional decline-reason follow-up (chips or "Other" free text). The decline
 * already happened; this never gates it. Stored as admin-side context and
 * never sent to the vendor verbatim (lock anti-list).
 */
export async function saveDeclineReason(token: string, reason: string): Promise<TokenActionResult> {
  if (!token) return { error: "bad_request" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_decline_reason_for_token", {
    p_token: token,
    p_reason: reason,
  });
  if (error) return { error: error.message };
  return { result: "saved" };
}

/** Optional note to the EA after a send-to-EA forward (request.ea_forward_note). */
export async function saveEaNote(token: string, note: string): Promise<TokenActionResult> {
  if (!token) return { error: "bad_request" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_ea_note_for_token", {
    p_token: token,
    p_note: note,
  });
  if (error) return { error: error.message };
  return { result: "saved" };
}
