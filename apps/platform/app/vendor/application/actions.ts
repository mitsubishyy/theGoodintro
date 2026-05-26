"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppState = { error?: string };

export async function submitApplicationAction(
  _prev: AppState,
  fd: FormData,
): Promise<AppState> {
  const answers = {
    who_we_are: String(fd.get("who_we_are") ?? "").trim(),
    why_relevant: String(fd.get("why_relevant") ?? "").trim(),
    goals: String(fd.get("goals") ?? "").trim(),
  };
  if (!answers.who_we_are || !answers.why_relevant) {
    return { error: "Please answer the first two questions." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_application", {
    p_answers: answers,
  });
  if (error) return { error: error.message };

  redirect("/vendor");
}
