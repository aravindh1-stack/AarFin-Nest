import { FeatureBentoGrid } from "@/components/feature-bento-grid";
import { HeroSection } from "@/components/hero-section";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/marketing/site-footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#000000] dark:text-slate-100">
      <Navbar />
      <HeroSection />
      <FeatureBentoGrid />
      <SiteFooter />
    </main>
  );
}
