import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { ExecutiveForm } from "../executive-form";
import { createExecutiveAction } from "../actions";

export const metadata: Metadata = {
  title: "New executive — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

export default async function NewExecutivePage() {
  if (!(await getFlag("exec_onboarding"))) {
    return (
      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        Executive onboarding is not enabled (turn on the <code>exec_onboarding</code> flag).
      </p>
    );
  }

  const supabase = await createClient();
  const { data: charities } = await supabase
    .from("charity")
    .select("id,name")
    .is("deleted_at", null)
    .order("name");
  const photoUploadEnabled = await getFlag("photo_upload");

  return (
    <div className="max-w-2xl px-8 py-6">
      <Link href="/admin/executives" className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        ← Executives
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold tracking-tight">New executive</h1>
      <ExecutiveForm
        action={createExecutiveAction}
        charities={charities ?? []}
        submitLabel="Create executive"
        photoUploadEnabled={photoUploadEnabled}
      />
    </div>
  );
}
