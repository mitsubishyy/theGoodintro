import type { Metadata } from "next";
import Link from "next/link";
import { getFlag } from "@/lib/flags";
import { SignUpForm } from "./signup-form";

export const metadata: Metadata = {
  title: "Create your account — theGoodintro",
  robots: { index: false, follow: false },
};

export default async function SignUpPage() {
  const open = await getFlag("vendor_signup");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16" style={{ background: "var(--portal-page)", color: "var(--foreground)" }}>
      <div className="w-full max-w-sm rounded-2xl border p-8" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
        <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>
          theGoodintro
        </p>
        <h1 className="mt-1 mb-6 text-xl font-semibold tracking-tight">Create your account</h1>

        {open ? (
          <SignUpForm />
        ) : (
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Sign-up is invite-only right now. Please get in touch to request access.
          </p>
        )}

        <p className="mt-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
          Already have an account?{" "}
          <Link href="/login" className="underline-offset-2 hover:underline" style={{ color: "var(--foreground)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
