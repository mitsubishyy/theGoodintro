import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStaff } from "@/lib/auth";
import { EnrollTotp } from "./enroll";

export const metadata: Metadata = {
  title: "Security — TheGoodIntro",
  robots: { index: false, follow: false },
};

export default async function SecurityPage() {
  const result = await getStaff();
  if (!result?.user) redirect("/login");
  if (!result.staff) redirect("/login?error=not_staff");

  return (
    <main
      className="mx-auto max-w-xl px-6 py-16"
      style={{ color: "var(--foreground)" }}
    >
      <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>
        Account security
      </p>
      <h1 className="mt-1 mb-2 text-2xl font-semibold tracking-tight">
        Two-factor authentication
      </h1>
      <p className="mb-8 text-sm" style={{ color: "var(--muted-foreground)" }}>
        The admin cockpit handles money, so it requires a second factor. Set up an
        authenticator app (Google Authenticator, 1Password, Authy) below.
      </p>
      <EnrollTotp />
    </main>
  );
}
