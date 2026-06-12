import type { Metadata } from "next";
import { ComingSoon } from "../_components/coming-soon";

export const metadata: Metadata = {
  title: "Giving — TheGoodIntro",
  robots: { index: false, follow: false },
};

export default function VendorGivingPage() {
  return (
    <ComingSoon
      icon="heart"
      title="Giving"
      body="Your full gift history, charity by charity, will live here. The Your impact widget on the dashboard shows the most recent gifts."
    />
  );
}
