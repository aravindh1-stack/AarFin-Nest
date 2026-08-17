"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusPill, type InstallmentStatus } from "@/components/status-pill";
import { SkeletonBlock } from "@/components/skeleton-block";

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
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 dark:border-slate-800/50 dark:bg-[#121212]/70">
      <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-slate-800/50">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Recent Collections
        </h3>
        <Link
          href="/dashboard/collections"
          className="text-xs font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
        >
          View all →
        </Link>
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
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-t border-slate-200/70 dark:border-slate-800/50">
                  <td colSpan={6} className="px-5 py-3.5">
                    <SkeletonBlock className="h-6 w-full rounded-lg" />
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-500">
                  No payment records found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
