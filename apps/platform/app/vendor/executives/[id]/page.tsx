import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVendor } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { RequestForm } from "./request-form";

export const metadata: Metadata = {
  title: "Request a meeting — TheGoodIntro",
  robots: { index: false, follow: false },
};

export default async function VendorExecRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getVendor();
  if (!result?.user) redirect("/login");
  if (!result.vendorUser) redirect("/vendor");
  if (!(await getFlag("request_loop"))) redirect("/vendor");

  const supabase = await createClient();
  const { data: exec } = await supabase
    .from("executive")
    .select("id, name, title, company, context_notes, charity:default_charity_id(name)")
    .eq("id", id)
    .maybeSingle();
  if (!exec) notFound();

  const charity = Array.isArray(exec.charity) ? exec.charity[0] : exec.charity;

  return (
    <main className="mx-auto max-w-xl px-6 py-12" style={{ color: "var(--foreground)" }}>
      <Link href="/vendor/executives" className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        ← Executives
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {exec.title}, {exec.company}
      </h1>
      <p className="mt-1 mb-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
        A meeting sends a real gift to {charity?.name ?? "their chosen charity"}.
      </p>
      <RequestForm executiveId={exec.id as string} />
    </main>
  );
}
