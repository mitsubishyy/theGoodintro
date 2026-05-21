import type { Metadata } from "next";
import ExecDashboard from "./ExecDashboard";

export const metadata: Metadata = {
  title: "Executive home · theGoodintro mockup",
  robots: { index: false, follow: false },
};

export default function ExecMockupPage() {
  return <ExecDashboard />;
}
