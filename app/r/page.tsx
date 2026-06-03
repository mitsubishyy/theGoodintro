import type { Metadata } from "next";
import { verify } from "../../lib/rsvp";
import RsvpClient from "./rsvp-client";

// One-click response landing page. Reached from the Accept / Decline links in
// a cold-outreach email: /r?a=yes&t=<token> (or a=no). The actual write to the
// Sheet is fired by RsvpClient on mount, not here — see app/api/rsvp/route.ts
// for why (email link scanners).

export const metadata: Metadata = {
  title: "Thank you · TheGoodIntro",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RsvpPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; t?: string; c?: string }>;
}) {
  const { a, t, c } = await searchParams;
  const action = a === "no" ? "no" : "yes";
  const payload = t ? verify(t) : null;
  const firstName = payload?.n?.trim().split(" ")[0] || "";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-6 py-20">
      {payload && t ? (
        <RsvpClient
          token={t}
          action={action}
          firstName={firstName}
          campaign={c || ""}
        />
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">
            This link doesn&apos;t look right
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">
            It may have been copied incompletely or it has expired. If you meant
            to reply, just hit reply on the email and let me know, that works
            perfectly too.
          </p>
        </div>
      )}
    </main>
  );
}
