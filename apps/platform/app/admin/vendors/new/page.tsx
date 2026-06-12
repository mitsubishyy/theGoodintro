import type { Metadata } from "next";
import { Icon, PortalPage } from "@thegoodintro/ui";

/**
 * Placeholder for the manual "Add a vendor" form. The locked Vendors list
 * points here from "+ New vendor" and the empty state's "+ Add a vendor
 * manually", but the form itself has no locked design yet (vendors normally
 * arrive through the public sign-up + vetting call). Exists so neither CTA
 * lands on a 404; replaced by the real T5 port once the screen is designed
 * and locked.
 */

export const metadata: Metadata = {
  title: "New vendor — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

export default function NewVendorPage() {
  return (
    <PortalPage
      title="New vendor"
      breadcrumb={[
        { label: "Home", href: "/admin" },
        { label: "Vendors", href: "/admin/vendors" },
        { label: "New" },
      ]}
    >
      <div className="grid place-items-center min-h-[50vh]">
        <div className="max-w-md text-center">
          <span
            className="mx-auto size-16 rounded-full grid place-items-center"
            style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
          >
            <Icon name="box" size={24} />
          </span>
          <p
            className="mt-5 text-[11px] font-mono uppercase tracking-[0.18em]"
            style={{ color: "var(--muted-foreground)" }}
          >
            Coming soon
          </p>
          <h2 className="mt-2 text-[18px] font-semibold" style={{ color: "var(--portal-ink)" }}>
            Add a vendor manually
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Vendors normally arrive through the public sign-up and the vetting
            call, so this form is not designed yet. Until it lands, a manual
            add starts from the sign-up flow on staging.
          </p>
        </div>
      </div>
    </PortalPage>
  );
}
