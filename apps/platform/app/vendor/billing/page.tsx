import type { Metadata } from "next";
import { ComingSoon } from "../_components/coming-soon";

export const metadata: Metadata = {
  title: "Billing & credits — TheGoodIntro",
  robots: { index: false, follow: false },
};

export default function VendorBillingPage() {
  return (
    <ComingSoon
      icon="tag"
      title="Billing & credits"
      body="Invoices and credit history will live here. Your live credit balance is always on the dashboard ribbon."
    />
  );
}
