import type { Metadata } from "next";
import ExecDashboard from "./ExecDashboard";

export const metadata: Metadata = {
  title: "Executive home · TheGoodIntro mockup",
  robots: { index: false, follow: false },
};

export default function ExecMockupPage() {
  return <ExecDashboard />;
}
