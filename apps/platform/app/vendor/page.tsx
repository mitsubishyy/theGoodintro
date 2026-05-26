import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getVendor } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Your account — theGoodintro",
  robots: { index: false, follow: false },
};

// Status-driven next step. Vetting + payment surfaces arrive in Pillar 3b.
const STEP: Record<string, { title: string; body: string }> = {
  signed_up: {
    title: "Next: a short vetting call",
    body: "Book a quick call so we can get to know you. Once approved, payment unlocks and you can start requesting meetings.",
  },
  call_booked: {
    title: "Call booked",
    body: "Thanks — your application is on record. We will confirm your approval on the call.",
  },
  approved: {
    title: "You are approved",
    body: "Payment is unlocked. Buy meeting credits to open the executive list.",
  },
  paid: {
    title: "Payment received",
    body: "Your credits are on the way. The executive list will open shortly.",
  },
  active: {
    title: "You are live",
    body: "Browse the executive list and start requesting meetings.",
  },
  dormant: {
    title: "Access paused",
    body: "Your access window has ended. Buy credits to reopen the executive list.",
  },
  churned: {
    title: "Account closed",
    body: "Get in touch if you would like to come back.",
  },
};

export default async function VendorHome() {
  const result = await getVendor();
  if (!result?.user) redirect("/login");

  // Signed in but no org yet (e.g. just confirmed email). Finish at /signup.
  if (!result.vendorUser) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center" style={{ background: "var(--portal-page)", color: "var(--foreground)" }}>
        <div className="max-w-md">
          <h1 className="text-xl font-semibold">Finish setting up</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Your account is not linked to an organisation yet.{" "}
            <Link href="/signup" className="underline-offset-2 hover:underline" style={{ color: "var(--foreground)" }}>Complete sign-up</Link>.
          </p>
        </div>
      </main>
    );
  }

  const vendor = Array.isArray(result.vendorUser.vendor)
    ? result.vendorUser.vendor[0]
    : result.vendorUser.vendor;
  const step = STEP[vendor?.status as string] ?? STEP.signed_up;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16" style={{ color: "var(--foreground)" }}>
      <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>
        {vendor?.name}
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Welcome to theGoodintro</h1>

      <div className="mt-8 rounded-2xl border p-6" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
        <div className="flex items-center gap-3">
          <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
            {vendor?.status}
          </span>
        </div>
        <h2 className="mt-3 text-lg font-semibold">{step.title}</h2>
        <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>{step.body}</p>
        {vendor?.status === "signed_up" ? (
          <Link href="/vendor/application" className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}>
            Start your application
          </Link>
        ) : null}
      </div>

      <p className="mt-6 text-xs" style={{ color: "var(--muted-foreground)" }}>
        Vetting, payment, and the executive list are being rolled out. You are
        signed in as {result.vendorUser.email} ({result.vendorUser.role}).
      </p>
    </main>
  );
}
