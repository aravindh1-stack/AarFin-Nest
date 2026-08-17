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
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_name: title,
          batch_code: code || `BTC-${Math.floor(100 + Math.random() * 900)}`,
          installment_amount: amount,
          total_cycles: cycles,
          start_date: new Date().toISOString().split("T")[0],
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
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    ACTIVE
                  </span>
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
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-[#000000] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">
                    Cycles
                  </label>
                  <input
                    type="number"
                    value={cycles}
                    onChange={(e) => setCycles(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-[#000000] dark:text-white"
                  />
                </div>
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
