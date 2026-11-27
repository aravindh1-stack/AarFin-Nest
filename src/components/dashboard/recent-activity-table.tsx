"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusPill, type InstallmentStatus } from "@/components/status-pill";
import { SkeletonBlock } from "@/components/skeleton-block";
import { Receipt, ArrowRight, Clock } from "lucide-react";

interface ActivityRow {
  id: string;
  receiptNo: string;
  memberName: string;
  customerCode: string;
  schemeName: string;
  routeCode: string;
  amountFormatted: string;
  status: InstallmentStatus;
  paymentDate?: string;
}

export function RecentActivityTable() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentActivity() {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard/metrics");
        const data = await res.json();
        if (data && Array.isArray(data.recentCollections)) {
          setRows(data.recentCollections);
        }
      } catch (err) {
        console.error("Error fetching recent activity:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentActivity();
  }, []);

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-[#1F2623] dark:bg-[#121614]">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-3.5 sm:px-5 sm:py-4 dark:border-[#1F2623]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold tracking-wide text-slate-900 dark:text-white">
            Recent Collections
          </h3>
          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-[#10B981] border border-emerald-500/20">
            Live Ledger
          </span>
        </div>
        <Link
          href="/dashboard/collections"
          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition"
        >
          <span>View all</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* MOBILE STACKED CARDS (< md) */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-[#1F2623]">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <SkeletonBlock className="h-4 w-3/4 rounded bg-slate-100 dark:bg-[#0E1110]" />
              <SkeletonBlock className="h-4 w-1/2 rounded bg-slate-100 dark:bg-[#0E1110]" />
            </div>
          ))
        ) : rows.length === 0 ? (
          <div className="p-6 text-center">
            <Receipt className="mx-auto h-8 w-8 text-slate-300 dark:text-neutral-600 mb-2" />
            <p className="text-xs font-medium text-slate-500 dark:text-neutral-400">
              No recent collection transactions recorded
            </p>
          </div>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    {row.memberName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono">
                    {row.customerCode} · {row.receiptNo}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                  {row.amountFormatted}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400">
                <span className="truncate max-w-[150px]">{row.schemeName}</span>
                <span className="rounded bg-slate-100 dark:bg-[#0E1110] px-1.5 py-0.5 text-[10px] font-mono text-emerald-600 dark:text-[#10B981]">
                  {row.routeCode}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE (>= md) */}
      <div className="hidden md:block overflow-x-auto [scrollbar-width:none]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-[#1F2623] dark:bg-[#0E1110]/50 dark:text-neutral-400">
              <th className="px-5 py-3">Member & Receipt</th>
              <th className="px-5 py-3">Scheme & Route</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#1F2623]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-3.5">
                    <SkeletonBlock className="h-4 w-32 rounded bg-slate-100 dark:bg-[#0E1110]" />
                  </td>
                  <td className="px-5 py-3.5">
                    <SkeletonBlock className="h-4 w-28 rounded bg-slate-100 dark:bg-[#0E1110]" />
                  </td>
                  <td className="px-5 py-3.5">
                    <SkeletonBlock className="h-4 w-16 ml-auto rounded bg-slate-100 dark:bg-[#0E1110]" />
                  </td>
                  <td className="px-5 py-3.5">
                    <SkeletonBlock className="h-4 w-14 mx-auto rounded bg-slate-100 dark:bg-[#0E1110]" />
                  </td>
                  <td className="px-5 py-3.5">
                    <SkeletonBlock className="h-4 w-20 ml-auto rounded bg-slate-100 dark:bg-[#0E1110]" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center">
                  <Receipt className="mx-auto h-8 w-8 text-slate-300 dark:text-neutral-600 mb-2" />
                  <p className="text-xs font-medium text-slate-500 dark:text-neutral-400">
                    No recent payments recorded in the ledger
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {row.memberName}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
                      {row.customerCode} · {row.receiptNo}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-slate-700 dark:text-neutral-300">
                      {row.schemeName}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-600 dark:text-[#10B981]">
                      {row.routeCode}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900 dark:text-white tabular-nums">
                    {row.amountFormatted}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right text-[11px] text-slate-500 dark:text-neutral-400 tabular-nums">
                    {row.paymentDate
                      ? new Date(row.paymentDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : "Recent"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
