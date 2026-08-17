import { StatusPill, type InstallmentStatus } from "@/components/status-pill";

const rows: {
  member: string;
  scheme: string;
  route: string;
  amount: string;
  status: InstallmentStatus;
  time: string;
}[] = [
  {
    member: "Arun Kumar",
    scheme: "Palagara Seetu",
    route: "North Zone A",
    amount: "₹5,000",
    status: "PAID",
    time: "2 min ago",
  },
  {
    member: "Meena Devi",
    scheme: "Vaara Kandhu",
    route: "East Route 4",
    amount: "₹1,200",
    status: "PARTIAL",
    time: "14 min ago",
  },
  {
    member: "Ravi Shankar",
    scheme: "Dhina Kandhu",
    route: "Central Hub",
    amount: "₹800",
    status: "PAID",
    time: "22 min ago",
  },
  {
    member: "Lakshmi Priya",
    scheme: "Palagara Seetu",
    route: "West Zone B",
    amount: "₹5,000",
    status: "PENDING",
    time: "1 hr ago",
  },
  {
    member: "Suresh Babu",
    scheme: "Vaara Kandhu",
    route: "North Zone A",
    amount: "₹1,200",
    status: "UPCOMING",
    time: "Scheduled tomorrow",
  },
];

export function RecentActivityTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 dark:border-slate-800/50 dark:bg-[#121212]/70">
      <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-slate-800/50">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Recent Collections
        </h3>
        <a
          href="/dashboard/collections"
          className="text-xs font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
        >
          View all →
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-xs text-slate-500 dark:bg-white/[0.02] dark:text-slate-400">
            <tr>
              <th className="px-5 py-3 font-semibold">Member</th>
              <th className="px-5 py-3 font-semibold">Scheme</th>
              <th className="px-5 py-3 font-semibold">Route</th>
              <th className="px-5 py-3 font-semibold">Amount</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">When</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.member + row.scheme}
                className="border-t border-slate-200/70 transition hover:bg-slate-50/80 dark:border-slate-800/50 dark:hover:bg-white/[0.02]"
              >
                <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                  {row.member}
                </td>
                <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                  {row.scheme}
                </td>
                <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                  {row.route}
                </td>
                <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                  {row.amount}
                </td>
                <td className="px-5 py-3.5">
                  <StatusPill status={row.status} />
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                  {row.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
