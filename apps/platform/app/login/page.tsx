import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { SignInLinkForm } from "./sign-in-link-form";
import { safeNextPath } from "@/lib/safe-redirect";
import { getFlagAuthoritative } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Sign in — TheGoodIntro",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; reset?: string }>;
}) {
  const { next, error, reset } = await searchParams;
  // Authoritative read: the visitor here is anonymous, and feature_flag is not
  // readable by anon under RLS, so a session-scoped read would always be OFF.
  const execEaLogin = await getFlagAuthoritative("exec_ea_login");

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
          TheGoodIntro
        </p>
        <h1 className="mt-1 mb-6 text-xl font-semibold tracking-tight">
          Sign in to the platform
        </h1>

        {error === "not_staff" ? (
          <p className="mb-4 text-sm" style={{ color: "var(--portal-amber-ink)" }}>
            That account does not have admin access.
          </p>
        ) : null}

        {error === "not_authorized" ? (
          <p className="mb-4 text-sm" style={{ color: "var(--portal-amber-ink)" }}>
            That account does not have access to this area.
          </p>
        ) : null}

        {error === "link_invalid" ? (
          <p className="mb-4 text-sm" style={{ color: "var(--portal-amber-ink)" }}>
            That sign-in link did not work. Links work once and go stale quickly.
            Request a fresh one below.
          </p>
        ) : null}

        {reset === "done" ? (
          <p className="mb-4 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Your password has been updated. Sign in with your new password.
          </p>
        ) : null}

        <LoginForm next={safeNextPath(next)} />

        {execEaLogin ? (
          <>
            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1" style={{ background: "var(--portal-line)" }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
                Or
              </span>
              <span className="h-px flex-1" style={{ background: "var(--portal-line)" }} />
            </div>
            <SignInLinkForm />
          </>
        ) : null}
      </div>
    </main>
  );
}
