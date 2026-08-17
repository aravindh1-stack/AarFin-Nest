const stats = [
  { label: "Active Schemes", value: "248", delta: "+12.4%" },
  { label: "Collections Today", value: "₹18.6L", delta: "+8.2%" },
  { label: "FIFO Allocations", value: "1,942", delta: "99.8% accuracy" },
  { label: "Branch Tenants", value: "36", delta: "Multi-region" },
];

const tableRows = [
  {
    member: "Arun Kumar",
    scheme: "Palagara Seetu",
    route: "North Zone A",
    status: "Allocated",
  },
  {
    member: "Meena Devi",
    scheme: "Vaara Kandhu",
    route: "East Route 4",
    status: "Pending",
  },
  {
    member: "Ravi Shankar",
    scheme: "Dhina Kandhu",
    route: "Central Hub",
    status: "Allocated",
  },
];

export function DashboardPreview() {
  return (
    <div className="relative mx-auto mt-12 max-w-5xl px-4 sm:px-0">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-teal-500/20 via-emerald-500/10 to-cyan-500/20 blur-2xl dark:from-teal-500/30 dark:via-emerald-500/15 dark:to-cyan-500/20" />

      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/50 dark:bg-[#121212]/90 dark:shadow-black/40">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            NexFix Command Center — Live Telemetry
          </p>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            LIVE
          </span>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3 transition hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:border-teal-500/30"
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-teal-700 dark:text-teal-400">
                {stat.delta}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200/70 p-4 dark:border-slate-800/50">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent FIFO Allocations
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Updated 2s ago
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200/70 dark:border-slate-800/50">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-semibold">Member</th>
                  <th className="px-3 py-2 font-semibold">Scheme</th>
                  <th className="px-3 py-2 font-semibold">Route</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr
                    key={row.member}
                    className="border-t border-slate-200/70 dark:border-slate-800/50"
                  >
                    <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                      {row.member}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                      {row.scheme}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                      {row.route}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          row.status === "Allocated"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
