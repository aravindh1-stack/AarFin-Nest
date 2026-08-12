"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { initialBatches, initialInstallments, initialPayments } from "@/lib/store";
import { 
  TrendingUp, 
  Wallet, 
  AlertCircle, 
  Layers, 
  ArrowUpRight, 
  DollarSign, 
  CheckCircle2,
  ChevronRight,
  Zap,
  Plus
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [batches] = useState(initialBatches);
  const [installments] = useState(initialInstallments);
  const [payments] = useState(initialPayments);

  const todayTarget = 25000;
  const todayCollected = payments.reduce((acc, p) => acc + p.amount_paid, 0);
  const pendingDues = installments
    .filter((i) => i.status === "PENDING" || i.status === "PARTIAL")
    .reduce((acc, i) => acc + i.balance_amount, 0);

  const activeBatchesCount = batches.length;
  const collectionRate = Math.round((todayCollected / todayTarget) * 100);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <Sidebar />
      <Header title="Admin Dashboard" subtitle="Bento Financial Overview & Daily Collection Targets" />

      <main className="ml-64 p-6 space-y-6">
        {/* Quick Trigger Header Banner */}
        <div 
          className="border rounded-2xl p-5 flex items-center justify-between shadow-sm transition-colors duration-300"
          style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}
        >
          <div>
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Live Command Status</span>
            </div>
            <h2 className="text-xl font-bold">Welcome Back, Admin</h2>
            <p className="text-xs opacity-75 mt-0.5">
              Daily collections active across 3 routes. 12 pending cycles scheduled today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/collections"
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20"
            >
              <DollarSign className="w-4 h-4" />
              <span>Quick Record FIFO Payment</span>
            </Link>
            <Link
              href="/batches"
              className="border px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 font-semibold transition-all"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}
            >
              <Plus className="w-4 h-4 text-emerald-500" />
              <span>New Scheme Batch</span>
            </Link>
          </div>
        </div>

        {/* Bento Grid Top Layer - Key KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: Today Target */}
          <div className="p-5 rounded-2xl border glass-panel relative overflow-hidden transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium opacity-70">Today Collection Target</p>
                <h3 className="text-2xl font-bold mt-1">₹{todayTarget.toLocaleString("en-IN")}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <TargetIcon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs opacity-75">
              <span className="text-emerald-500 font-semibold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14%
              </span>
              <span>vs yesterday target</span>
            </div>
          </div>

          {/* Card 2: Today Collected */}
          <div className="p-5 rounded-2xl border glass-panel relative overflow-hidden transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium opacity-70">Today Collected</p>
                <h3 className="text-2xl font-bold text-emerald-500 mt-1">₹{todayCollected.toLocaleString("en-IN")}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs opacity-75">
              <span className="text-emerald-500 font-semibold">{collectionRate}%</span>
              <span>of daily target completed</span>
            </div>
          </div>

          {/* Card 3: Pending Dues */}
          <div className="p-5 rounded-2xl border glass-panel relative overflow-hidden transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium opacity-70">Pending Dues & Overdues</p>
                <h3 className="text-2xl font-bold text-rose-500 mt-1">₹{pendingDues.toLocaleString("en-IN")}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-rose-500 font-medium">
              <span>2 High risk accounts flagged</span>
            </div>
          </div>

          {/* Card 4: Active Batches */}
          <div className="p-5 rounded-2xl border glass-panel relative overflow-hidden transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium opacity-70">Active Schemes & Batches</p>
                <h3 className="text-2xl font-bold text-blue-500 mt-1">{activeBatchesCount} Batches</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs opacity-75">
              <span className="text-blue-500 font-semibold">82 Active Members</span>
            </div>
          </div>
        </div>

        {/* Bento Grid Middle Layer - Active Batches & Quick Collections Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Batches Table Card (Span 2) */}
          <div className="lg:col-span-2 p-5 rounded-2xl border glass-panel">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold">Active Scheme Batches</h3>
                <p className="text-xs opacity-75">Palagara Seetu, Vaara Kandhu & Dhina Kandhu Overview</p>
              </div>
              <Link href="/batches" className="text-xs text-emerald-500 font-semibold flex items-center gap-1 hover:underline">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="uppercase tracking-wider text-[10px] border-b" style={{ borderColor: "var(--border-color)" }}>
                  <tr>
                    <th className="py-3 px-4">Batch Name</th>
                    <th className="py-3 px-4">Scheme Type</th>
                    <th className="py-3 px-4">Cycle Amount</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                  {batches.map((batch) => {
                    const percentage = Math.round(((batch.total_collected || 0) / (batch.target_amount || 1)) * 100);
                    return (
                      <tr key={batch.id} className="hover:bg-emerald-500/5 transition-colors">
                        <td className="py-3 px-4 font-semibold">{batch.batch_name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                            {batch.scheme_type.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          ₹{batch.installment_amount.toLocaleString("en-IN")} / {batch.frequency_type.toLowerCase()}
                        </td>
                        <td className="py-3 px-4 w-40">
                          <div className="flex items-center gap-2">
                            <div className="w-full h-2 rounded-full overflow-hidden border" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="text-[10px] font-medium opacity-75">{percentage}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                            {batch.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Today Collection Activity Feed */}
          <div className="p-5 rounded-2xl border glass-panel flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold">Live Payment Log</h3>
                <span className="text-[10px] font-medium bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/30">
                  REALTIME
                </span>
              </div>

              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p.id} className="rounded-xl p-3 border flex items-center justify-between" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{p.customer_name}</p>
                        <p className="text-[10px] opacity-70">{p.receipt_no} • {p.payment_method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-500">+₹{p.amount_paid.toLocaleString("en-IN")}</p>
                      <p className="text-[10px] opacity-50">Just Now</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t" style={{ borderColor: "var(--border-color)" }}>
              <Link
                href="/collections"
                className="w-full py-2 border hover:bg-emerald-500/10 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}
              >
                <span>Open FIFO Payment Recording Engine</span>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TargetIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
