const metrics = [
  {
    label: "Active Schemes",
    value: "248",
    delta: "+12.4%",
    trend: "up" as const,
    icon: "⚛",
    sparkline: [4, 6, 5, 8, 7, 10, 9, 12],
  },
  {
    label: "Collections Today",
    value: "₹18.6L",
    delta: "+8.2%",
    trend: "up" as const,
    icon: "◈",
    sparkline: [3, 5, 4, 6, 8, 7, 9, 11],
  },
  {
    label: "FIFO Allocations",
    value: "1,942",
    delta: "99.8% accuracy",
    trend: "flat" as const,
    icon: "◉",
    sparkline: [8, 8, 9, 9, 8, 10, 9, 10],
  },
  {
    label: "Branch Tenants",
    value: "36",
    delta: "Multi-region",
    trend: "flat" as const,
    icon: "⌘",
    sparkline: [2, 2, 3, 3, 3, 4, 4, 4],
  },
];

function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 100 - ((p - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-8 w-20">
      <polyline
        points={coords}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function MetricCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 transition hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 dark:border-slate-800/50 dark:bg-[#121212]/70 dark:hover:border-teal-500/30"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-base text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300">
              {metric.icon}
            </div>
            <div className="text-teal-500/70 dark:text-teal-400/60">
              <Sparkline points={metric.sparkline} />
            </div>
          </div>

          <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {metric.label}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {metric.value}
          </p>
          <p
            className={`mt-1.5 inline-flex items-center gap-1 text-xs font-semibold ${
              metric.trend === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {metric.trend === "up" && (
              <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3">
                <path d="M6 2 10 8H2Z" />
              </svg>
            )}
            {metric.delta}
          </p>
        </div>
      ))}
    </div>
  );
}
