const features = [
  {
    title: "Atomic FIFO Ledger",
    description:
      "Automatic payment allocation across pending installments with deterministic ordering and zero manual reconciliation.",
    icon: "⚛",
    span: "md:col-span-2",
  },
  {
    title: "Multi-Scheme Engine",
    description:
      "Unified engine for Chit-Funds, Weekly Loans, and Daily Collections with configurable rules per tenant.",
    icon: "◈",
    span: "md:col-span-1",
  },
  {
    title: "Route & Group Partitioning",
    description:
      "Geographical agent routes and collection groups with branch-level isolation and role-based access.",
    icon: "◎",
    span: "md:col-span-1",
  },
  {
    title: "Live Telemetry & Audit Logs",
    description:
      "Real-time tracking, immutable audit trails, and automated receipt generation for every transaction.",
    icon: "◉",
    span: "md:col-span-2",
  },
];

export function FeatureBentoGrid() {
  return (
    <section
      id="solutions"
      className="border-t border-slate-200/70 px-4 py-20 sm:px-6 lg:px-8 dark:border-slate-800/50"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-400">
            Core Platform
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Enterprise-grade infrastructure for micro-finance at scale
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-500/30 hover:shadow-xl hover:shadow-teal-500/10 dark:border-slate-800/50 dark:bg-[#121212]/70 dark:hover:border-teal-500/30 ${feature.span}`}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal-500/10 blur-2xl transition group-hover:bg-teal-500/20" />

              <div className="relative">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-lg text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
