import type { Metadata } from "next";
import { ComingSoon } from "../_components/coming-soon";

export const metadata: Metadata = {
  title: "Get started — TheGoodIntro",
  robots: { index: false, follow: false },
};

export default function VendorGetStartedPage() {
  return (
    <ComingSoon
      icon="check"
      title="Get started"
      body="Your onboarding checklist is on its way. We will walk you through it on the vetting call in the meantime."
    />
  );
}
