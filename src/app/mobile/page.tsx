import type { Metadata } from "next";
import { NexFixMobileView } from "@/components/mobile/nexfix-mobile-view";

export const metadata: Metadata = {
  title: "NexFix Mobile | Field Agent Collections & Dues",
  description:
    "Ultra-clean mobile-first view for NexFix AarFin Nest field collection agents. Real-time collections tally, pending dues sparklines, and fast FIFO payments.",
};

export default function MobilePage() {
  return <NexFixMobileView />;
}
