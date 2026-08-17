import { Navbar } from "@/components/navbar";
import { PageHeader } from "@/components/marketing/page-header";
import { SiteFooter } from "@/components/marketing/site-footer";

const schemes = [
  {
    tag: "Chit-Funds",
    title: "Palagara Seetu",
    description:
      "Full lifecycle management for group chit schemes — auction cycles, bid discounts, dividend distribution, and default tracking, all reconciled automatically per group.",
    points: [
      "Auction & bid-based payout engine",
      "Automated dividend recalculation",
      "Group default and surety tracking",
    ],
  },
  {
    tag: "Weekly Loans",
    title: "Vaara Kandhu",
    description:
      "Weekly disbursal and recovery scheduling built for field agents, with configurable grace periods and route-optimized collection lists.",
    points: [
      "Configurable weekly repayment grids",
      "Agent-wise route collection sheets",
      "Grace period & penalty rule engine",
    ],
  },
  {
    tag: "Daily Collections",
    title: "Dhina Kandhu",
    description:
      "High-frequency daily micro-repayment tracking with atomic FIFO allocation, so every rupee lands against the oldest open installment first.",
    points: [
      "Atomic FIFO payment allocation",
      "Daily doorstep collection app sync",
      "Real-time arrears aging buckets",
    ],
  },
];

const capabilities = [
  {
    icon: "⚛",
    title: "Atomic FIFO Ledger",
    description:
      "Every payment is allocated against the oldest pending installment first, with deterministic ordering and zero manual reconciliation across schemes.",
  },
  {
    icon: "◈",
    title: "Multi-Scheme Engine",
    description:
      "One unified rules engine drives Chit-Funds, Weekly Loans, and Daily Collections, with per-tenant configuration for interest, penalties, and cycles.",
  },
  {
    icon: "◎",
    title: "Route & Group Partitioning",
    description:
      "Geographic collection routes and member groups with branch-level data isolation and granular role-based access for agents, supervisors, and admins.",
  },
  {
    icon: "◉",
    title: "Live Telemetry & Audit Logs",
    description:
      "Every ledger mutation is captured in an immutable audit trail, with real-time dashboards and automated digital receipts for every transaction.",
  },
  {
    icon: "⌘",
    title: "Branch & Tenant Isolation",
    description:
      "Multi-branch, multi-tenant architecture keeps each region's books, staff, and members cleanly partitioned while rolling up to head-office reporting.",
  },
  {
    icon: "◇",
    title: "Reconciliation Console",
    description:
      "Daily agent cash-up, bank deposit matching, and variance flags — closed out in minutes instead of end-of-day spreadsheet chases.",
  },
];

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#000000] dark:text-slate-100">
      <Navbar />

      <PageHeader
        eyebrow="Solutions"
        title="One ledger for every scheme you run"
        description="Chit-funds, weekly loans, and daily collections operate on wildly different cadences. NexFix unifies them under a single atomic ledger, so your books never drift apart."
      />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-3">
            {schemes.map((scheme) => (
              <article
                key={scheme.title}
                className="flex flex-col rounded-2xl border border-slate-200/80 bg-white/70 p-7 shadow-sm dark:border-slate-800/50 dark:bg-[#121212]/70"
              >
                <span className="inline-flex w-fit items-center rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300">
                  {scheme.tag}
                </span>
                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                  {scheme.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {scheme.description}
                </p>
                <ul className="mt-5 space-y-2.5 border-t border-slate-200/70 pt-5 dark:border-slate-800/50">
                  {scheme.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/70 bg-white/40 px-4 py-20 sm:px-6 lg:px-8 dark:border-slate-800/50 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
              Platform Capabilities
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
              Built for operations, not just bookkeeping
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((cap) => (
              <div
                key={cap.title}
                className="group rounded-2xl border border-slate-200/80 bg-white/70 p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/10 dark:border-slate-800/50 dark:bg-[#121212]/70 dark:hover:border-teal-500/30"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-lg text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300">
                  {cap.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {cap.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {cap.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
