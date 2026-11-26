"use client";

import { useState, useMemo } from "react";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import {
  ShieldCheck,
  AlertCircle,
  Lock,
  Printer,
  Banknote,
  Coins,
  CheckCircle2,
} from "lucide-react";

interface RouteReconciliation {
  id: string;
  routeName: string;
  agentName: string;
  totalCollected: number;
  cashAmount: number;
  upiAmount: number;
  receiptCount: number;
  status: "PENDING_VERIFICATION" | "RECONCILED" | "FLAGGED";
}

const mockRoutes: RouteReconciliation[] = [
  {
    id: "route-01",
    routeName: "Route 01 — Commercial Division Beat",
    agentName: "Officer Sundaram",
    totalCollected: 52000,
    cashAmount: 44500,
    upiAmount: 7500,
    receiptCount: 84,
    status: "PENDING_VERIFICATION",
  },
  {
    id: "route-02",
    routeName: "Route 02 — Industrial Corridor Beat",
    agentName: "Officer Vignesh",
    totalCollected: 38000,
    cashAmount: 32000,
    upiAmount: 6000,
    receiptCount: 62,
    status: "RECONCILED",
  },
  {
    id: "route-03",
    routeName: "Route 03 — Metropolitan Center Beat",
    agentName: "Officer Murugan",
    totalCollected: 64500,
    cashAmount: 58000,
    upiAmount: 6500,
    receiptCount: 110,
    status: "PENDING_VERIFICATION",
  },
];

export default function EODReconciliationPage() {
  const [selectedRouteId, setSelectedRouteId] = useState<string>("route-01");
  const [denominations, setDenominations] = useState<{ [key: number]: number }>({
    500: 80,
    200: 20,
    100: 5,
    50: 0,
    20: 0,
    10: 0,
  });
  const [cashierNotes, setCashierNotes] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  const activeRoute = useMemo(() => {
    return mockRoutes.find((r) => r.id === selectedRouteId) || mockRoutes[0];
  }, [selectedRouteId]);

  // Calculate counted physical cash
  const countedPhysicalCash = useMemo(() => {
    return Object.entries(denominations).reduce((acc, [denom, count]) => {
      return acc + Number(denom) * (Number(count) || 0);
    }, 0);
  }, [denominations]);

  // Expected cash from digital ledger receipts
  const expectedCash = activeRoute.cashAmount;
  const variance = countedPhysicalCash - expectedCash;

  const handleDenomChange = (denom: number, countStr: string) => {
    const val = parseInt(countStr, 10);
    setDenominations((prev) => ({
      ...prev,
      [denom]: isNaN(val) ? 0 : Math.max(0, val),
    }));
  };

  return (
    <div className="min-h-screen">
      <DashboardTopbar
        title="End-of-Day (EOD) Cash Reconciliation"
        description="Verify physical cash handover from field collection officers against system-logged digital receipts"
      />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-[#202425] dark:bg-[#121518]">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Fiscal Stamp</div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">2026-11-26</div>
            <div className="text-xs text-teal-600 dark:text-teal-400 mt-1 font-semibold">Session #EOD-DIV01-094</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-[#202425] dark:bg-[#121518]">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Expected Cash</div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              ₹{expectedCash.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-slate-500 mt-1">{activeRoute.receiptCount} digital receipts today</div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-[#202425] dark:bg-[#121518]">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Counted Physical Cash</div>
            <div className={`text-xl font-bold font-mono mt-1 ${
              variance === 0 
                ? "text-emerald-600 dark:text-emerald-400" 
                : variance > 0 
                ? "text-amber-500" 
                : "text-rose-600 dark:text-rose-400"
            }`}>
              ₹{countedPhysicalCash.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-slate-500 mt-1">Via currency denomination matrix</div>
          </div>

          <div className={`rounded-2xl border p-5 shadow-xs ${
            variance === 0
              ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10"
              : variance > 0
              ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10"
              : "border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10"
          }`}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reconciliation Variance</div>
            <div className={`text-xl font-bold font-mono mt-1 ${
              variance === 0
                ? "text-emerald-600 dark:text-emerald-400"
                : variance > 0
                ? "text-amber-500"
                : "text-rose-600 dark:text-rose-400"
            }`}>
              {variance === 0 ? "₹0.00 (EXACT MATCH)" : variance > 0 ? `+₹${variance.toLocaleString("en-IN")} (EXCESS)` : `-₹${Math.abs(variance).toLocaleString("en-IN")} (SHORTAGE)`}
            </div>
            <div className="text-xs font-semibold mt-1">
              {variance === 0 ? "Ready for cashier sign-off" : "Variance alert triggered"}
            </div>
          </div>
        </div>

        {/* Route Selector Tab Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/80 p-2 rounded-2xl dark:bg-[#151718] border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto">
            {mockRoutes.map((route) => {
              const isSelected = route.id === selectedRouteId;
              return (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer shrink-0 ${
                    isSelected
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${
                    route.status === "RECONCILED" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                  }`}></span>
                  <span>{route.routeName}</span>
                  <span className="text-[10px] font-mono text-slate-400">({route.agentName})</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">
            Selected Route: <strong className="text-slate-900 dark:text-white">{activeRoute.routeName}</strong>
          </div>
        </div>

        {/* Main Work Area: Denominations Counter & Receipts Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Denominations Counter (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-[#202425] dark:bg-[#121518] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Physical Currency Counter</h3>
                  <p className="text-xs text-slate-500">Enter note counts received in physical cash drawer</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-teal-500/10 text-teal-700 px-2.5 py-1 rounded-lg dark:text-teal-300">
                INR Denomination Desk
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {[500, 200, 100, 50, 20, 10].map((denom) => {
                const count = denominations[denom] || 0;
                const subtotal = denom * count;
                return (
                  <div key={denom} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3 w-28">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">₹{denom}</span>
                      <span className="text-xs text-slate-400">note</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">×</span>
                      <input
                        type="number"
                        min="0"
                        value={count === 0 ? "" : count}
                        placeholder="0"
                        onChange={(e) => handleDenomChange(denom, e.target.value)}
                        className="w-24 text-center rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-sm font-bold text-slate-900 outline-none focus:border-teal-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="w-32 text-right font-mono font-bold text-sm text-slate-900 dark:text-white">
                      = ₹{subtotal.toLocaleString("en-IN")}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Counted Handover:</span>
              <span className="font-mono text-lg font-bold text-teal-600 dark:text-teal-400">
                ₹{countedPhysicalCash.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Payment Mode Split & Sign-off Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-[#202425] dark:bg-[#121518] space-y-4">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Ledger Breakdown</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Physical Cash</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    ₹{activeRoute.cashAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-500"></span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">UPI / QR Transfer</span>
                  </div>
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    ₹{activeRoute.upiAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-teal-500/10 border border-teal-500/20">
                  <span className="text-xs font-bold text-teal-800 dark:text-teal-300">Total Route Collection</span>
                  <span className="font-mono font-bold text-sm text-teal-700 dark:text-teal-300">
                    ₹{activeRoute.totalCollected.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Cashier / Supervisor Audit Remarks
                </label>
                <textarea
                  rows={2}
                  value={cashierNotes}
                  onChange={(e) => setCashierNotes(e.target.value)}
                  placeholder="All receipts verified. Physical cash verified into vault..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setIsLocked(true)}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition shadow-xs cursor-pointer ${
                    isLocked
                      ? "bg-slate-300 text-slate-500 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                      : "bg-teal-600 text-white hover:bg-teal-500 dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-slate-950"
                  }`}
                >
                  {isLocked ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Route Day Ledger Locked & Signed</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <span>Lock Ledger & Issue Bank Deposit Slip</span>
                    </>
                  )}
                </button>

                {isLocked && (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Bank Deposit Voucher</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
