import type { Metadata } from "next";
import { MfaForm } from "./mfa-form";
import { safeNextPath } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Two-factor — TheGoodIntro",
  robots: { index: false, follow: false },
};

export default async function MfaPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 py-16"
      style={{ background: "var(--portal-page)", color: "var(--foreground)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-8"
        style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
      >
        <h1 className="mb-2 text-xl font-semibold tracking-tight">
          Two-factor verification
        </h1>
        <p className="mb-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Enter the code from your authenticator app.
        </p>
        <MfaForm next={safeNextPath(next)} />
      </div>
    </main>
  );
}
