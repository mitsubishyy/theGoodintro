"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { stripContactInfo } from "@/lib/content-guard";

export type RequestState = { error?: string };

export async function submitRequestAction(
  _prev: RequestState,
  fd: FormData,
): Promise<RequestState> {
  if (!(await getFlag("request_loop")))
    return { error: "Requests are not open yet." };

  const executiveId = String(fd.get("executive_id") ?? "");
  const q1 = stripContactInfo(String(fd.get("q1") ?? "")).slice(0, 300);
  const q2 = stripContactInfo(String(fd.get("q2") ?? "")).slice(0, 300);
  if (!executiveId || !q1 || !q2)
    return { error: "Please answer both questions." };

  const attName = String(fd.get("att_name") ?? "").trim();
  const attendee = attName
    ? {
        name: attName,
        title: String(fd.get("att_title") ?? "").trim(),
        email: String(fd.get("att_email") ?? "").trim(),
      }
    : null;

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_request", {
    p_executive_id: executiveId,
    p_q1: q1,
    p_q2: q2,
    p_attendee: attendee,
  });
  if (error) return { error: error.message };

  redirect("/vendor?requested=1");
}
