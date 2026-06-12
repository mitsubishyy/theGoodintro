import type { Metadata } from "next";
import { ComingSoon } from "../_components/coming-soon";

export const metadata: Metadata = {
  title: "Team — TheGoodIntro",
  robots: { index: false, follow: false },
};

export default function VendorTeamPage() {
  return (
    <ComingSoon
      icon="user"
      title="Team"
      body="Invite teammates and manage seats here soon. For now, ask us and we will add colleagues for you."
    />
  );
}
