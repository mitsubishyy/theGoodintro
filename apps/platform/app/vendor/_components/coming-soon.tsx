import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon, type IconName } from "@thegoodintro/ui";
import { getVendor } from "@/lib/auth";

/**
 * Friendly placeholder for vendor sidebar routes that are in the locked IA but
 * not yet ported (Requests, Meetings, Giving, Get started, Team, Billing &
 * credits, Settings). Exists so a demo never lands on a 404; each screen is
 * replaced by its real port. Distinct from the locked pre-payment lockout
 * page, which is about vendor status, not build progress.
 */
export async function ComingSoon({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: IconName;
}) {
  const result = await getVendor();
  if (!result?.user) redirect("/login");
  if (!result.vendorUser) redirect("/vendor");

  return (
    <main className="flex-1 min-w-0 px-8 py-6 grid place-items-center min-h-[60vh]">
      <div className="max-w-md text-center">
        <span
          className="mx-auto size-16 rounded-full grid place-items-center"
          style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
        >
          <Icon name={icon} size={24} />
        </span>
        <p
          className="mt-5 text-[11px] font-mono uppercase tracking-[0.18em]"
          style={{ color: "var(--muted-foreground)" }}
        >
          Coming soon
        </p>
        <h2 className="mt-2 text-[20px] font-semibold tracking-tight" style={{ color: "var(--portal-ink)" }}>
          {title}
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          {body}
        </p>
        <Link
          href="/vendor"
          className="mt-6 inline-flex items-center gap-2 h-10 px-4 rounded-lg border text-[13px] font-semibold hover:bg-[var(--portal-card-hover)]"
          style={{ borderColor: "var(--portal-line)", color: "var(--portal-ink)" }}
        >
          <Icon name="chevron-left" size={16} />
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
