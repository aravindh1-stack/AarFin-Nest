import type { Metadata } from "next";
import { NexFixMobileView } from "@/components/mobile/nexfix-mobile-view";

export const metadata: Metadata = {
  title: "Field Agent Mobile View | NexFix Collections",
  description: "Dedicated mobile view for field collection agents on route.",
};

export default function DashboardMobilePage() {
  return <NexFixMobileView />;
}
