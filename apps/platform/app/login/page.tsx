import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in — theGoodintro",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 py-16"
      style={{ background: "var(--portal-page)", color: "var(--foreground)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-8"
        style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
      >
        <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>
          theGoodintro
        </p>
        <h1 className="mt-1 mb-6 text-xl font-semibold tracking-tight">
          Sign in to the platform
        </h1>

        {error === "not_staff" ? (
          <p className="mb-4 text-sm" style={{ color: "var(--portal-amber-ink)" }}>
            That account does not have admin access.
          </p>
        ) : null}

        <LoginForm next={next && next.startsWith("/") ? next : "/"} />
      </div>
    </main>
  );
}
