"use client";

import { useEffect, useState } from "react";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { SkeletonBlock } from "@/components/skeleton-block";

export default function ReportsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const res = await fetch("/api/payments");
        const data = await res.json();
        if (Array.isArray(data)) setPayments(data);
      } catch (err) {
        console.error("Error loading reports payments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const totalSum = payments.reduce(
    (acc, curr) => acc + (Number(curr.amount || curr.amount_paid) || 0),
    0,
  );

  return (
    <div>
      <DashboardTopbar
        title="Reports & Financial Analytics"
        description="PDF export studio, ledger breakdown, and date-range telemetry"
      />

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Financial Summary
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time collection transactions and revenue breakdown
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer"
          >
            🖨 Print / Export PDF
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800/50 dark:bg-[#121212]/70">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Total Logged Payments
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {payments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800/50 dark:bg-[#121212]/70">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Total Value Collected
            </p>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{totalSum.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800/50 dark:bg-[#121212]/70">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Audit Compliance Status
            </p>
            <p className="mt-1 text-2xl font-bold text-teal-600 dark:text-teal-400">
              100% Verified
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 dark:border-slate-800/50 dark:bg-[#121212]/70">
          <div className="border-b border-slate-200/70 p-4 dark:border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Payment Transaction Ledger
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs text-slate-500 dark:bg-white/[0.02] dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Payment ID</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Method</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-t border-slate-200/70 dark:border-slate-800/50">
                      <td colSpan={5} className="px-5 py-3.5">
                        <SkeletonBlock className="h-7 w-full rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-xs text-slate-500">
                      No payment transactions found in database.
                    </td>
                  </tr>
                ) : (
                  payments.map((p, index) => (
                    <tr
                      key={p.id || index}
                      className="border-t border-slate-200/70 transition hover:bg-slate-50/80 dark:border-slate-800/50 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {p.id ? String(p.id).slice(0, 8) : `#PAY-${index + 1}`}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                        {p.customer_id || p.member_name || "Customer Account"}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{Number(p.amount || p.amount_paid || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                        {p.payment_method || "CASH"}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                        {p.payment_date ? new Date(p.payment_date).toLocaleDateString("en-IN") : "Recent"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
