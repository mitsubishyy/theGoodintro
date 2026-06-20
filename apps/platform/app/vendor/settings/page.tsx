import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getVendor } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { VendorProfileCard } from "./_profile-card";

export const metadata: Metadata = {
  title: "Settings — TheGoodIntro",
  robots: { index: false, follow: false },
};

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function VendorSettingsPage() {
  const result = await getVendor();
  if (!result?.vendorUser) redirect("/vendor");

  const vu = result.vendorUser as {
    id: string;
    name: string;
    email: string;
    role: string;
    photo_url: string | null;
  };
  const vendor = one<{ id: string; name: string; status: string }>(result.vendorUser.vendor);
  const photoEnabled = await getFlag("vendor_photo_upload");
  const active = vendor?.status === "approved" || vendor?.status === "active";

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-[680px]">
        <header className="mb-7">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
            TheGoodIntro <span className="opacity-50">/</span> Settings
          </div>
          <h1 className="mt-2 text-[24px] font-semibold tracking-tight" style={{ color: "var(--portal-ink)" }}>
            Settings
          </h1>
          <p className="mt-1 text-[13.5px]" style={{ color: "var(--muted-foreground)" }}>
            Manage your personal profile and review your company details.
          </p>
        </header>

        <div className="flex flex-col gap-5">
          <VendorProfileCard
            vendorUserId={vu.id}
            name={vu.name}
            email={vu.email}
            role={vu.role}
            initialPhotoUrl={vu.photo_url ?? undefined}
            photoEnabled={photoEnabled}
          />

          {/* ── Company (read-only) ── */}
          <section
            className="overflow-hidden rounded-2xl border"
            style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
          >
            <div className="flex items-center gap-2 px-6 pt-5">
              <h2 className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--portal-ink)" }}>
                Company
              </h2>
              {active && (
                <span
                  className="ml-auto inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium"
                  style={{
                    background: "color-mix(in oklab, var(--portal-emerald-sidebar-active) 14%, var(--portal-card))",
                    color: "var(--portal-ink)",
                    border: "1px solid var(--portal-line)",
                  }}
                >
                  Active vendor
                </span>
              )}
            </div>

            <div className="px-6 pb-6 pt-4">
              <div className="flex items-center gap-4">
                <div
                  className="grid size-[52px] shrink-0 place-items-center rounded-xl font-mono text-[15px] font-semibold"
                  style={{
                    background: "var(--portal-amber-soft)",
                    color: "var(--portal-amber-ink)",
                    border: "1px solid color-mix(in oklab, var(--portal-amber-ink) 30%, transparent)",
                  }}
                >
                  {initials(vendor?.name ?? "?")}
                </div>
                <div className="min-w-0">
                  <div className="text-[16px] font-semibold tracking-tight" style={{ color: "var(--portal-ink)" }}>
                    {vendor?.name ?? "—"}
                  </div>
                  <div className="mt-0.5 font-mono text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
                    VENDOR ID · {(vendor?.id ?? "").slice(0, 8).toUpperCase() || "—"}
                  </div>
                </div>
              </div>

              <div className="my-5 h-px" style={{ background: "var(--portal-line)" }} />

              <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <rect x="4" y="11" width="16" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 018 0v3" />
                </svg>
                Company details are managed by TheGoodIntro. Contact your account owner to request a change.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
