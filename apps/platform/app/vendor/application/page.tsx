import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getVendor } from "@/lib/auth";
import { ApplicationForm } from "./application-form";

export const metadata: Metadata = {
  title: "Your application — theGoodintro",
  robots: { index: false, follow: false },
};

export default async function ApplicationPage() {
  const result = await getVendor();
  if (!result?.user) redirect("/login");
  if (!result.vendorUser) redirect("/vendor");

  return (
    <main className="mx-auto max-w-xl px-6 py-16" style={{ color: "var(--foreground)" }}>
      <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>
        Vetting
      </p>
      <h1 className="mt-1 mb-2 text-2xl font-semibold tracking-tight">A few questions</h1>
      <p className="mb-8 text-sm" style={{ color: "var(--muted-foreground)" }}>
        This goes onto the calendar invite for your vetting call. The more
        specific you are, the better we can match you to the right leaders.
      </p>
      <ApplicationForm />
    </main>
  );
}
