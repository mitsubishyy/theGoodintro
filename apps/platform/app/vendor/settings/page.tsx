import type { Metadata } from "next";
import { ComingSoon } from "../_components/coming-soon";

export const metadata: Metadata = {
  title: "Settings — TheGoodIntro",
  robots: { index: false, follow: false },
};

export default function VendorSettingsPage() {
  return (
    <ComingSoon
      icon="cog"
      title="Settings"
      body="Company profile, notifications, and security settings are on their way."
    />
  );
}
