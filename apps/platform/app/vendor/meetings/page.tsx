import type { Metadata } from "next";
import { ComingSoon } from "../_components/coming-soon";

export const metadata: Metadata = {
  title: "Meetings — TheGoodIntro",
  robots: { index: false, follow: false },
};

export default function VendorMeetingsPage() {
  return (
    <ComingSoon
      icon="calendar"
      title="Meetings"
      body="Upcoming and past meetings will live here. Your dashboard's Upcoming meetings widget covers this for now."
    />
  );
}
