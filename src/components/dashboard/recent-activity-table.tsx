"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusPill, type InstallmentStatus } from "@/components/status-pill";
import { SkeletonBlock } from "@/components/skeleton-block";
import { Receipt, Plus, ArrowRight, Clock } from "lucide-react";

interface ActivityRow {
  id: string;
  member: string;
  scheme: string;
  route: string;
  amount: string;
  status: InstallmentStatus;
  time: string;
}

export function RecentActivityTable() {
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentActivity() {
      setLoading(true);
      try {
        const [payRes, custRes] = await Promise.all([
          fetch("/api/payments").then((r) => r.json()),
          fetch("/api/customers").then((r) => r.json()),
        ]);

        const customerMap = new Map<string, any>();
        if (Array.isArray(custRes)) {
          custRes.forEach((c) => customerMap.set(c.id, c));
        }

        if (Array.isArray(payRes) && payRes.length > 0) {
          const formatted: ActivityRow[] = payRes.slice(-5).reverse().map((p: any) => {
            const cust = customerMap.get(p.customer_id) || {};
            return {
              id: p.id || Math.random().toString(),
              member: cust.full_name || p.member_name || "Customer",
              scheme: cust.batch_name || p.scheme || "Micro-Finance Scheme",
              route: cust.group_name || p.route || "Default Route",
              amount: `₹${Number(p.amount || 0).toLocaleString("en-IN")}`,
              status: (p.status as InstallmentStatus) || "PAID",
              time: p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-IN") : "Recent",
            };
          });
          setRows(formatted);
        } else if (Array.isArray(custRes) && custRes.length > 0) {
          const formatted: ActivityRow[] = custRes.slice(0, 5).map((c: any) => ({
            id: c.id,
            member: c.full_name || "Member",
            scheme: c.batch_name || "Micro-Finance",
            route: c.group_name || "Main Route",
            amount: `₹${Number(c.monthly_installment || c.installment_amount || 5000).toLocaleString("en-IN")}`,
            status: "PAID" as InstallmentStatus,
            time: "Active Member",
          }));
          setRows(formatted);
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
        <h3 className="text-sm font-semibold tracking-wide text-slate-900 dark:text-white">
          Recent Collections
        </h3>
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
            <p className="text-xs font-medium text-slate-900 dark:text-white">No collections logged</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-neutral-400">
              Live field collections will appear here automatically.
            </p>
          </div>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="p-4 space-y-2 transition hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                    {row.member}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-[#8E9B94] truncate">
                    {row.scheme} · {row.route}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold font-mono text-xs tabular-nums text-slate-900 dark:text-white">
                    {row.amount}
                  </p>
                  <div className="mt-0.5">
                    <StatusPill status={row.status} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-neutral-500">
                <Clock className="h-2.5 w-2.5" />
                <span>{row.time}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE (>= md) */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-[#0E1110] dark:text-neutral-400 border-b border-slate-200/80 dark:border-[#1F2623]">
            <tr>
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Scheme</th>
              <th className="px-5 py-3 font-medium">Route</th>
              <th className="px-5 py-3 font-medium text-right">Amount</th>
              <th className="px-5 py-3 font-medium text-center">Status</th>
              <th className="px-5 py-3 font-medium text-right">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#1F2623]">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-5 py-3.5">
                    <SkeletonBlock className="h-6 w-full rounded-lg bg-slate-100 dark:bg-[#0E1110]" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <div className="mx-auto flex flex-col items-center justify-center max-w-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-neutral-400 mb-3">
                      <Receipt className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">No recent collections logged</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400 text-center">
                      Payments recorded in the field will automatically appear in this live atomic ledger.
                    </p>
                    <Link
                      href="/dashboard/collections"
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Record First Collection</span>
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-neutral-200">
                    {row.member}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-neutral-400">
                    {row.scheme}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-neutral-400">
                    {row.route}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-right tabular-nums font-mono text-slate-900 dark:text-white">
                    {row.amount}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-neutral-400 text-right tabular-nums">
                    {row.time}
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
