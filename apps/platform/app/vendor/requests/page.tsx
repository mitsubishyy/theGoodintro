import type { Metadata } from "next";
import { ComingSoon } from "../_components/coming-soon";

export const metadata: Metadata = {
  title: "Requests — TheGoodIntro",
  robots: { index: false, follow: false },
};

export default function VendorRequestsPage() {
  return (
    <ComingSoon
      icon="inbox"
      title="Requests"
      body="Every request your team has sent, with its status, will live here. Until this view lands, the Pending widget on your dashboard shows what is in flight."
    />
  );
}
