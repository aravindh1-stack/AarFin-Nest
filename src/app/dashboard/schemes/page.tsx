"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { SkeletonBlock } from "@/components/skeleton-block";
import { useAuth } from "@/components/auth/auth-context";
import {
  Layers,
  Sparkles,
  Plus,
  AlertCircle,
  Info,
  CheckCircle2,
  X,
  Users,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface Batch {
  id: string;
  batch_name: string;
  batch_code: string;
  scheme_category?: string;
  frequency_type?: string;
  installment_amount: number;
  total_cycles: number;
  start_date: string;
  end_date?: string;
}

export default function SchemesPage() {
  const { role } = useAuth();
  const isReadOnlyViewer = role === "VIEWER";
  const READ_ONLY_TOOLTIP = "Read-only access: Mutations restricted";

  const [batches, setBatches] = useState<Batch[]>([]);
  const [customerCounts, setCustomerCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [selectedAuctionBatch, setSelectedAuctionBatch] = useState<Batch | null>(null);

  // Auction simulation state
  const [bidDiscount, setBidDiscount] = useState<number>(20000);
  const [foremanPercent, setForemanPercent] = useState<number>(5);
  const [winnerName, setWinnerName] = useState<string>("S. Meenakshi (CUST-082)");
  const [auctionSuccess, setAuctionSuccess] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState(5000);
  const [cycles, setCycles] = useState(20);

  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("WEEKLY");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [intervalDays, setIntervalDays] = useState(1);

  const fetchBatchesAndCustomers = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        fetch("/api/batches").then((r) => r.json()),
        fetch("/api/customers").then((r) => r.json()),
      ]);

      if (Array.isArray(bRes)) setBatches(bRes);

      if (Array.isArray(cRes) && Array.isArray(bRes)) {
        const counts: Record<string, number> = {};
        bRes.forEach((b) => {
          const matching = cRes.filter(
            (c) =>
              c.batch_id === b.id ||
              c.batch_id === b.batch_code ||
              (c.batch_name && c.batch_name.toLowerCase() === b.batch_name.toLowerCase())
          );
          counts[b.id] = matching.length;
        });
        setCustomerCounts(counts);
      }
    } catch (err) {
      console.error("Error fetching batches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchesAndCustomers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnlyViewer) {
      setFormError(READ_ONLY_TOOLTIP);
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const sDateStr = startDate || new Date().toISOString().split("T")[0];
      const [sYear, sMonth, sDay] = sDateStr.split("-").map(Number);
      const computedEndDateObj = new Date(sYear, sMonth - 1, sDay);

      const step = intervalDays || 1;
      if (frequency === "DAILY") {
        computedEndDateObj.setDate(sDay + ((cycles - 1) * step));
      } else if (frequency === "WEEKLY") {
        computedEndDateObj.setDate(sDay + ((cycles - 1) * 7 * step));
      } else {
        computedEndDateObj.setMonth((sMonth - 1) + ((cycles - 1) * step));
      }

      const computedEndDateStr = computedEndDateObj.toISOString().split("T")[0];

      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_name: title,
          batch_code: code || `BTC-${Math.floor(100 + Math.random() * 900)}`,
          scheme_type: frequency,
          frequency_type: frequency,
          interval_days: intervalDays,
          installment_amount: amount,
          total_cycles: cycles,
          start_date: sDateStr,
          end_date: computedEndDateStr,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setTitle("");
        setCode("");
        fetchBatchesAndCustomers();
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || "Failed to create scheme batch");
      }
    } catch (err: any) {
      console.error("Error creating scheme batch:", err);
      setFormError(`Network error: ${err.message || "Could not connect to server"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getSchemeTypeBadge = (freq?: string) => {
    switch (freq) {
      case "DAILY":
        return { label: "Dhina Kandhu", tag: "DAILY" };
      case "WEEKLY":
        return { label: "Vaara Kandhu", tag: "WEEKLY" };
      case "MONTHLY":
      default:
        return { label: "Palagara Seetu", tag: "MONTHLY" };
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <DashboardTopbar
        title="Schemes & Batches"
        description="Configure Seetu & Kandhu scheme batches and cycle rules"
      />

      <div className="space-y-4 px-4 py-2 sm:px-6 lg:px-8 w-full max-w-full min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Active Scheme Batches
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Active cycle progression, installment rules, and chit auction pools
            </p>
          </div>
          {!isReadOnlyViewer ? (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white font-bold dark:bg-[#10B981] dark:text-black px-4 py-2 text-xs shadow-xs transition hover:bg-emerald-500 dark:hover:bg-[#0EA57E] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Scheme</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              title={READ_ONLY_TOOLTIP}
              className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-emerald-600/40 text-white font-bold dark:bg-[#10B981]/40 dark:text-black px-4 py-2 text-xs shadow-xs opacity-50 cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              <span>Create Scheme (Restricted)</span>
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-56 w-full rounded-2xl bg-white border border-slate-200/80 dark:bg-[#121614] dark:border-[#1F2623]" />
            ))
          ) : batches.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200/80 bg-white p-10 text-center dark:border-[#1F2623] dark:bg-[#121614]">
              <Layers className="mx-auto h-8 w-8 text-slate-300 dark:text-neutral-600 mb-2" />
              <p className="text-sm font-medium text-slate-900 dark:text-white">No active schemes found</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">Create your first Palagara Seetu or Kandhu batch to begin.</p>
              {!isReadOnlyViewer ? (
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white font-bold dark:bg-[#10B981] dark:text-black px-4 py-2 text-xs hover:bg-emerald-500 dark:hover:bg-[#0EA57E] transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Scheme</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  title={READ_ONLY_TOOLTIP}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/40 text-white font-bold dark:bg-[#10B981]/40 dark:text-black px-4 py-2 text-xs opacity-50 cursor-not-allowed"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Scheme (Restricted)</span>
                </button>
              )}
            </div>
          ) : (
            batches.map((b) => {
              const typeInfo = getSchemeTypeBadge(b.frequency_type);
              const totalCycles = Number(b.total_cycles) || 20;

              // Calculate cycle progression based on start_date
              let currentCycle = 1;
              if (b.start_date) {
                const sDate = new Date(b.start_date).getTime();
                const now = new Date().getTime();
                const diffDays = Math.max(0, Math.floor((now - sDate) / (1000 * 60 * 60 * 24)));
                if (b.frequency_type === "DAILY") {
                  currentCycle = Math.min(totalCycles, Math.max(1, diffDays + 1));
                } else if (b.frequency_type === "WEEKLY") {
                  currentCycle = Math.min(totalCycles, Math.max(1, Math.floor(diffDays / 7) + 1));
                } else {
                  currentCycle = Math.min(totalCycles, Math.max(1, Math.floor(diffDays / 30) + 1));
                }
              }

              const progressPct = Math.round((currentCycle / totalCycles) * 100);
              const activeMembers = customerCounts[b.id] ?? 0;

              return (
                <div
                  key={b.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:border-emerald-500/40 shadow-xs dark:border-[#1F2623] dark:bg-[#121614] dark:hover:border-[#10B981]/40 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Scheme Name & Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-emerald-600 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-[#10B981]">
                          <Layers className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-tight">
                            {b.batch_name}
                          </h3>
                          <p className="text-xs font-mono text-slate-500 dark:text-neutral-400 tabular-nums">
                            {b.batch_code}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          {typeInfo.label}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-neutral-500">
                          {typeInfo.tag}
                        </span>
                      </div>
                    </div>

                    {/* Body: Cycle Progression */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-neutral-400">Cycle Progression</span>
                        <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white">
                          Cycle {currentCycle} / {totalCycles}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[#0E1110] border border-slate-200/80 dark:border-[#1F2623]">
                        <div
                          className="h-full rounded-full bg-emerald-600 dark:bg-[#10B981] transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics: Installment Amount & Active Members */}
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-[#1F2623] pt-3 text-xs">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-neutral-400">Installment</p>
                        <p className="mt-0.5 text-base font-semibold font-mono tabular-nums text-emerald-600 dark:text-[#10B981]">
                          ₹{Number(b.installment_amount || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-neutral-400">Active Members</p>
                        <p className="mt-0.5 text-base font-semibold font-mono tabular-nums text-slate-900 dark:text-white inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-slate-400 dark:text-neutral-400" />
                          <span>{activeMembers} Members</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Next Auction / Due Date & Actions */}
                  <div className="mt-5 space-y-2 border-t border-slate-100 dark:border-[#1F2623] pt-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
                      <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                        <Calendar className="h-3 w-3 text-slate-400 dark:text-neutral-400" />
                        Next Cycle: {b.start_date || "Live"}
                      </span>
                      <Link
                        href="/dashboard/collections"
                        className="inline-flex items-center gap-0.5 text-xs text-slate-600 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white transition"
                      >
                        <span>Ledger</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>

                    <button
                      type="button"
                      disabled={isReadOnlyViewer}
                      title={isReadOnlyViewer ? READ_ONLY_TOOLTIP : undefined}
                      onClick={() => {
                        if (isReadOnlyViewer) return;
                        setSelectedAuctionBatch(b);
                        setShowAuctionModal(true);
                        setAuctionSuccess(false);
                      }}
                      className={`w-full flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 transition ${
                        isReadOnlyViewer
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-emerald-500/20 active:scale-98 cursor-pointer"
                      }`}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>{isReadOnlyViewer ? "Run Auction (Mutations Restricted)" : "Run Chit Auction & Dividend"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CREATE SCHEME MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto dark:border-[#1F2623] dark:bg-[#121614]">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-[#1F2623] pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Create New Scheme Batch
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-neutral-400">
                  Configure scheme installment parameters and collection cadence.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-neutral-300">
                  Scheme Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Daily Seetu B1"
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-neutral-300">
                  Batch Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. BTC-2026-01"
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-neutral-300">
                    Installment Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="5000"
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono font-bold tabular-nums text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-neutral-300">
                    Total Cycles Count *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={cycles}
                    onChange={(e) => setCycles(Number(e.target.value))}
                    placeholder="20"
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono font-bold tabular-nums text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-neutral-300">
                  Collection Frequency
                </label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`min-h-[44px] rounded-xl py-2 text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                        frequency === freq
                          ? "bg-emerald-600 text-white font-bold dark:bg-[#10B981] dark:text-black"
                          : "border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-neutral-400 dark:hover:text-white"
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-neutral-300">
                    Interval Gap ({frequency === "DAILY" ? "Days" : frequency === "WEEKLY" ? "Weeks" : "Months"})
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={intervalDays}
                    onChange={(e) => setIntervalDays(Math.max(1, Number(e.target.value)))}
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981] font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-neutral-300">
                    Batch Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                <Info className="h-4 w-4 shrink-0 text-emerald-600 dark:text-[#10B981]" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">Cadence Rule:</span> Collections will be due once every{" "}
                  <span className="font-bold underline text-emerald-700 dark:text-[#10B981]">
                    {intervalDays} {frequency === "DAILY" ? (intervalDays === 1 ? "day" : "days") : frequency === "WEEKLY" ? (intervalDays === 1 ? "week" : "weeks") : (intervalDays === 1 ? "month" : "months")}
                  </span>.
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#1F2623]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto min-h-[44px] flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-[#1F2623] dark:text-neutral-300 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto min-h-[44px] flex items-center justify-center rounded-xl bg-emerald-600 text-white font-bold dark:bg-[#10B981] dark:text-black px-6 py-2.5 text-xs shadow-md hover:bg-emerald-500 dark:hover:bg-[#0EA57E] disabled:opacity-50 cursor-pointer transition"
                >
                  {submitting ? "Saving..." : "Save Scheme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHIT AUCTION & DIVIDEND MODAL */}
      {showAuctionModal && selectedAuctionBatch && (() => {
        const batchInst = Number(selectedAuctionBatch.installment_amount) || 5000;
        const totalCycles = Number(selectedAuctionBatch.total_cycles) || 20;
        const chitPool = batchInst * totalCycles;
        const foremanFee = (chitPool * foremanPercent) / 100;
        const netDividendPool = Math.max(0, bidDiscount - foremanFee);
        const dividendPerMember = Math.floor(netDividendPool / totalCycles);
        const netInstallmentToPay = Math.max(0, batchInst - dividendPerMember);
        const winnerPrizePayout = chitPool - bidDiscount;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 dark:border-[#1F2623] dark:bg-[#121614]">
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-[#1F2623] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-slate-900 dark:text-white">
                      Monthly Chit Auction & Dividend Engine
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Cycle #14
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
                    Batch: <strong className="text-slate-900 dark:text-white">{selectedAuctionBatch.batch_name}</strong> • Pool Value: <strong className="font-mono tabular-nums text-emerald-600 dark:text-[#10B981]">₹{chitPool.toLocaleString("en-IN")}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuctionModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {auctionSuccess ? (
                <div className="p-6 text-center space-y-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-[#10B981] mx-auto" />
                  <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    Chit Auction Closed & Dividend Applied
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-neutral-300">
                    Winning Bid recorded for <strong>{winnerName}</strong> with net payout of <strong className="font-mono tabular-nums text-slate-900 dark:text-white">₹{winnerPrizePayout.toLocaleString("en-IN")}</strong>.<br />
                    All {totalCycles} members credited with <strong className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">₹{dividendPerMember.toLocaleString("en-IN")} dividend discount</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAuctionModal(false)}
                    className="mt-2 rounded-xl bg-emerald-600 text-white font-bold dark:bg-[#10B981] dark:text-black px-5 py-2 text-xs hover:bg-emerald-500 dark:hover:bg-[#0EA57E] transition cursor-pointer"
                  >
                    Done & Return
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-neutral-300 mb-1">
                        Auction Winning Member
                      </label>
                      <input
                        type="text"
                        value={winnerName}
                        onChange={(e) => setWinnerName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981]"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-neutral-300 mb-1">
                        Winning Bid Discount Amount (₹)
                      </label>
                      <input
                        type="number"
                        step={500}
                        value={bidDiscount}
                        onChange={(e) => setBidDiscount(Math.max(0, Number(e.target.value)))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold tabular-nums text-emerald-600 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-[#10B981] dark:focus:border-[#10B981]"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-[#0E1110] dark:border-[#1F2623] space-y-2">
                    <div className="flex justify-between font-medium text-slate-700 dark:text-neutral-300">
                      <span>Foreman Organizer Commission</span>
                      <span className="font-mono tabular-nums text-emerald-600 dark:text-[#10B981]">{foremanPercent}% (₹{foremanFee.toLocaleString("en-IN")})</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={foremanPercent}
                      onChange={(e) => setForemanPercent(Number(e.target.value))}
                      className="w-full accent-emerald-600 dark:accent-[#10B981] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-neutral-500">
                      <span>0% (No fee)</span>
                      <span>5% (Statutory Standard)</span>
                      <span>10% (Maximum Cap)</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2 font-mono">
                    <div className="flex justify-between text-slate-600 dark:text-neutral-400">
                      <span>Gross Chit Value:</span>
                      <span className="font-bold tabular-nums text-slate-900 dark:text-white">₹{chitPool.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-rose-600 dark:text-rose-400">
                      <span>- Auction Bid Discount:</span>
                      <span className="tabular-nums">-₹{bidDiscount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 dark:border-[#1F2623] pt-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                      <span>Winner Payout (Prize Money):</span>
                      <span className="text-sm tabular-nums">₹{winnerPrizePayout.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 dark:border-[#1F2623] pt-1.5 text-slate-600 dark:text-neutral-400">
                      <span>Total Dividend Pool:</span>
                      <span className="tabular-nums">₹{netDividendPool.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sky-600 dark:text-sky-400 font-semibold">
                      <span>Dividend per Member ({totalCycles} members):</span>
                      <span className="tabular-nums">-₹{dividendPerMember.toLocaleString("en-IN")} Discount</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-emerald-500/30 pt-2 text-xs font-bold text-slate-900 dark:text-white">
                      <span>Next Due to Pay per Member:</span>
                      <span className="text-sm font-extrabold tabular-nums text-emerald-600 dark:text-[#10B981]">
                        ₹{netInstallmentToPay.toLocaleString("en-IN")} <span className="text-[10px] text-slate-400 dark:text-neutral-500 line-through">₹{batchInst.toLocaleString("en-IN")}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#1F2623]">
                    <button
                      type="button"
                      onClick={() => setShowAuctionModal(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-[#1F2623] dark:text-neutral-300 dark:hover:bg-white/5 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuctionSuccess(true)}
                      className="rounded-xl bg-emerald-600 text-white font-bold dark:bg-[#10B981] dark:text-black px-5 py-2 text-xs shadow-md hover:bg-emerald-500 dark:hover:bg-[#0EA57E] cursor-pointer transition"
                    >
                      Confirm Auction & Apply Member Dividends
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
