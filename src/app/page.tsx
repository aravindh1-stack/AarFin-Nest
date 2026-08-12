"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  DollarSign, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Lock
} from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans transition-colors duration-300" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      {/* Top Announcement Bar */}
      <div className="border-b py-2 px-4 text-center text-xs font-medium flex items-center justify-center gap-2" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
        <span className="inline-flex items-center gap-1 font-bold text-[#0F766E]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production-Ready v2.4</span>
        </span>
        <span className="opacity-40">•</span>
        <span className="opacity-80">Atomic FIFO Allocation Engine for Tamil Nadu Seetu & Kandhu Operations</span>
      </div>

      {/* Main Navigation */}
      <header className="border-b px-6 md:px-12 py-3.5 flex items-center justify-between sticky top-0 backdrop-blur-md z-40" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--card-bg)" }}>
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-[#0F766E]/30 bg-slate-900 flex items-center justify-center shadow-sm">
            <Image
              src="/aarga-logo.png"
              alt="Aarga Logo"
              width={36}
              height={36}
              className="object-contain p-0.5"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight">AarFin</h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border text-[#0F766E] border-[#0F766E]/30 bg-[#0F766E]/10">
                ENTERPRISE
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-semibold rounded-xl border transition-all hover:border-[#0F766E]"
            style={{ borderColor: "var(--border-color)", backgroundColor: "var(--card-bg)", color: "var(--text-main)" }}
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#0F766E] text-white hover:bg-[#0d645e] transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Sign Up Free</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Vercel-Style Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold bg-[#0F766E]/10 text-[#0F766E] border-[#0F766E]/30">
          <span>✦ Production-Ready Command Center</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Financial Telemetry & Command Portal for <span className="text-[#0F766E]">Micro-Finance Operations</span>
        </h1>

        <p className="text-base md:text-lg max-w-2xl mx-auto opacity-75 leading-relaxed font-normal">
          Designed for Palagara Seetu (Chit Funds), Vaara Kandhu (Weekly Loans), and Dhina Kandhu (Daily Collections). Powered by Next.js Server Actions & Supabase PostgreSQL RPC.
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-[#0F766E] text-white font-bold text-sm shadow-md hover:bg-[#0d645e] transition-all flex items-center gap-2"
          >
            <span>Enter Admin Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl border font-bold text-sm transition-all hover:border-[#0F766E]"
            style={{ borderColor: "var(--border-color)", backgroundColor: "var(--card-bg)" }}
          >
            Sign In to Portal
          </Link>
        </div>
      </section>

      {/* Bento Grid Feature Showcase */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight">Enterprise Infrastructure Highlights</h2>
          <p className="text-xs opacity-70 mt-1">Engineered for high-density ledgers and non-blocking daily collection tracks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border glass-panel transition-all hover:border-[#0F766E]/50">
            <div className="p-3 w-fit rounded-xl bg-[#0F766E]/10 text-[#0F766E] mb-4">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">Ascending FIFO Engine</h3>
            <p className="text-xs opacity-75 leading-relaxed">
              PostgreSQL RPC logic (`record_payment_with_fifo`) automatically sweeps incoming collections across pending installments in ascending cycle order.
            </p>
          </div>

          <div className="p-6 rounded-2xl border glass-panel transition-all hover:border-[#0F766E]/50">
            <div className="p-3 w-fit rounded-xl bg-[#0F766E]/10 text-[#0F766E] mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">Multi-Scheme Management</h3>
            <p className="text-xs opacity-75 leading-relaxed">
              Seamlessly handle Palagara Seetu, Vaara Kandhu (Weekly), and Dhina Kandhu (Daily) batches with automated end-date cycle calculations.
            </p>
          </div>

          <div className="p-6 rounded-2xl border glass-panel transition-all hover:border-[#0F766E]/50">
            <div className="p-3 w-fit rounded-xl bg-[#0F766E]/10 text-[#0F766E] mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold mb-2">Audit Log & Compliance</h3>
            <p className="text-xs opacity-75 leading-relaxed">
              Full admin action logging, receipt generator (REC-YYYYMMDD-XXXX), and printable collection sheets formatted for administrative review.
            </p>
          </div>
        </div>
      </section>

      {/* Clean Vercel-Style Footer */}
      <footer className="border-t py-8 text-center text-xs opacity-60 mt-12 flex items-center justify-center gap-2" style={{ borderColor: "var(--border-color)" }}>
        <Image src="/aarga-logo.png" alt="Aarga Logo" width={18} height={18} className="object-contain" />
        <p>© 2026 AarFin SaaS Command Center. Powered by Next.js & Supabase.</p>
      </footer>
    </div>
  );
}
