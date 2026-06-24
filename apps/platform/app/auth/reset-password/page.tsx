import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = {
  title: "Set a new password — TheGoodIntro",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  // The recovery link routes through /auth/confirm, which establishes the
  // recovery session before forwarding here. If there is no session, the link
  // was invalid, already used, or expired.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
        <h1 className="mt-1 mb-6 text-xl font-semibold tracking-tight">
          Set a new password
        </h1>

        {user ? (
          <ResetForm />
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              This reset link has expired or was already used. Request a new one
              to continue.
            </p>
            <Link
              href="/login/forgot"
              className="text-sm underline-offset-2 hover:underline"
              style={{ color: "var(--foreground)" }}
            >
              Request a new reset link
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
