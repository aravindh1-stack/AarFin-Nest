"use client";

import { useEffect, useState } from "react";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { SkeletonBlock } from "@/components/skeleton-block";

interface Batch {
  id: string;
  batch_name: string;
  batch_code: string;
  scheme_category?: string;
  installment_amount: number;
  total_cycles: number;
  start_date: string;
}

export default function SchemesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState(5000);
  const [cycles, setCycles] = useState(20);

  const [frequency, setFrequency] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("WEEKLY");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);

  const [intervalDays, setIntervalDays] = useState(1);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/batches");
      const data = await res.json();
      if (Array.isArray(data)) setBatches(data);
    } catch (err) {
      console.error("Error fetching batches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
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
        fetchBatches();
      }
    } catch (err) {
      console.error("Error creating scheme batch:", err);
    }
  };

  return (
    <div>
      <DashboardTopbar
        title="Schemes & Batches"
        description="Configure Seetu & Kandhu scheme batches and cycle rules"
      />

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Active Scheme Batches
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active scheme rules, total cycles, and installment parameters
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer"
          >
            + Create New Scheme
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-44 w-full rounded-2xl" />
            ))
          ) : (
            batches.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 transition hover:border-teal-500/30 dark:border-slate-800/50 dark:bg-[#121212]/70"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-600 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300">
                    ⚛
                  </div>
                  <div className="flex gap-1.5">
                    <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">
                      {(b as any).frequency_type || "WEEKLY"}
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      ACTIVE
                    </span>
                  </div>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                  {b.batch_name}
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {b.batch_code}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200/70 pt-3 text-xs dark:border-slate-800/50">
                  <div>
                    <p className="text-[10px] text-slate-400">Installment</p>
                    <p className="font-bold text-teal-600 dark:text-teal-400">
                      ₹{Number(b.installment_amount || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Total Cycles</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {b.total_cycles || 20} Cycles
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-800/50 dark:bg-[#121212]">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create New Scheme Batch
            </h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  Scheme Name
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Palagara Seetu A2"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-[#000000] dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  Batch Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. PS-2026-01"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-[#000000] dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">
                    Installment Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="5000"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-[#000000] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">
                    Total Cycles Count
                  </label>
                  <input
                    type="number"
                    required
                    value={cycles}
                    onChange={(e) => setCycles(Number(e.target.value))}
                    placeholder="20"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-[#000000] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  Collection Frequency Type
                </label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {(["DAILY", "WEEKLY", "MONTHLY"] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                        frequency === freq
                          ? "bg-teal-700 text-white shadow dark:bg-teal-600"
                          : "border border-slate-200 text-slate-600 hover:border-teal-500/40 dark:border-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">
                    Interval Gap ({frequency === "DAILY" ? "Days" : frequency === "WEEKLY" ? "Weeks" : "Months"})
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={intervalDays}
                    onChange={(e) => setIntervalDays(Math.max(1, Number(e.target.value)))}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-[#000000] dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">
                    Batch Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-[#000000] dark:text-white"
                  />
                </div>
              </div>

              {/* Dynamic Live Cadence Summary Helper Banner */}
              <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 text-xs leading-relaxed text-teal-800 dark:text-teal-300">
                💡 <span className="font-semibold">Cadence Rule:</span> For this batch customers, the collection payment will become active once every{" "}
                <span className="font-extrabold underline text-teal-700 dark:text-teal-200">
                  {intervalDays} {frequency === "DAILY" ? (intervalDays === 1 ? "day" : "days") : frequency === "WEEKLY" ? (intervalDays === 1 ? "week" : "weeks") : (intervalDays === 1 ? "month" : "months")}
                </span>.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 dark:border-slate-800 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-700 px-4 py-2 text-white font-semibold hover:bg-teal-600 dark:bg-teal-600"
                >
                  Save Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
