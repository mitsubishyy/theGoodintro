import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVendor } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { LockedRequestForm } from "./locked-request-form";

export const metadata: Metadata = {
  title: "Request a meeting — TheGoodIntro",
  robots: { index: false, follow: false },
};

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

/**
 * Vendor Request Form route — the locked T5 qualification gate
 * (UI_KIT_DESIGN_LOG "Vendor Request Form" LOCKED 2026-06-06), entered from
 * the Executive Detail Drawer's primary CTA. Lives behind vendor_shell; when
 * the flag is off the pre-port form at /vendor/executives/[id] stays the
 * request surface and this route redirects back to it.
 */
export default async function VendorRequestFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getVendor();
  if (!result?.user) redirect("/login");
  if (!result.vendorUser) redirect("/vendor");

  const vendor = one<{ name: string; status: string }>(result.vendorUser.vendor);
  if (vendor?.status !== "active") redirect("/vendor");
  if (!(await getFlag("request_loop"))) redirect("/vendor");
  if (!(await getFlag("vendor_shell"))) redirect(`/vendor/executives/${id}`);

  const supabase = await createClient();
  const { data: exec } = await supabase
    .from("executive")
    .select("id, name, title, company, photo_url")
    .eq("id", id)
    .maybeSingle();
  if (!exec) notFound();

  return (
    <LockedRequestForm
      exec={{
        id: exec.id as string,
        name: (exec.name as string) ?? "",
        title: (exec.title as string) ?? "",
        company: (exec.company as string) ?? "",
        photoUrl: (exec.photo_url as string | null) ?? null,
      }}
      // Q3 "Me" subtitle; vendor_user has no title column yet, so the locked
      // "Name · Title · Company" line degrades to "Name · Company".
      meLine={[(result.vendorUser.name as string) ?? "You", vendor.name].join(" · ")}
    />
  );
}
