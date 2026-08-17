import Link from "next/link";
import { DashboardPreview } from "@/components/dashboard-preview";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl dark:bg-teal-500/15" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />
      </div>

      <div className="mx-auto max-w-5xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-teal-800 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300">
          <span aria-hidden="true">✦</span>
          The Next-Gen Operating System for Chit-Funds &amp; Loans
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
          Scale Your{" "}
          <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
            Micro-Finance Operations
          </span>{" "}
          with{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            Absolute Precision
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
          Automate Palagara Seetu, Vaara Kandhu, and Dhina Kandhu collections
          with atomic FIFO allocation, real-time telemetry, and multi-tenant
          branch management.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-700/30 transition hover:bg-teal-600 sm:w-auto dark:bg-teal-600 dark:hover:bg-teal-500"
          >
            Deploy Free Workspace
            <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-teal-500/40 hover:text-teal-700 sm:w-auto dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-teal-500/40 dark:hover:text-teal-300"
          >
            Explore Live Sandbox
          </Link>
        </div>
      </div>

      <DashboardPreview />
    </section>
  );
}
