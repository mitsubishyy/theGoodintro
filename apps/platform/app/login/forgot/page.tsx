import type { Metadata } from "next";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = {
  title: "Reset your password — TheGoodIntro",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 py-16"
      style={{ background: "var(--portal-page)", color: "var(--foreground)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-8"
        style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
      >
        <p
          className="font-mono text-xs uppercase tracking-[0.18em]"
          style={{ color: "var(--portal-amber-ink)" }}
        >
          TheGoodIntro
        </p>
        <h1 className="mt-1 mb-2 text-xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="mb-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Enter your email and we will send a link to set a new password.
        </p>

        {error === "link_invalid" ? (
          <p className="mb-4 text-sm" style={{ color: "var(--portal-amber-ink)" }}>
            That reset link has expired or was already used. Request a new one
            below.
          </p>
        ) : null}

        <ForgotForm />
      </div>
    </main>
  );
}
