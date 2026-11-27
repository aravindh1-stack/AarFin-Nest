"use client";

import { useEffect, useState } from "react";
import { SkeletonBlock } from "@/components/skeleton-block";
import { Layers, Users, Receipt, MapPin, Activity } from "lucide-react";

export function MetricCards() {
  const [batchesCount, setBatchesCount] = useState<number | string>("...");
  const [customersCount, setCustomersCount] = useState<number | string>("...");
  const [groupsCount, setGroupsCount] = useState<number | string>("...");
  const [totalCollections, setTotalCollections] = useState<string>("₹0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      try {
        const [bRes, cRes, gRes, pRes] = await Promise.all([
          fetch("/api/batches").then((r) => r.json()),
          fetch("/api/customers").then((r) => r.json()),
          fetch("/api/groups").then((r) => r.json()),
          fetch("/api/payments").then((r) => r.json()),
        ]);

        if (Array.isArray(bRes)) setBatchesCount(bRes.length);
        if (Array.isArray(cRes)) setCustomersCount(cRes.length);
        if (Array.isArray(gRes)) setGroupsCount(gRes.length);

        if (Array.isArray(pRes)) {
          const totalSum = pRes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
          setTotalCollections(`₹${totalSum.toLocaleString("en-IN")}`);
        }
      } catch (err) {
        console.error("Error fetching live metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-32 w-full rounded-2xl bg-white border border-slate-200/80 dark:bg-[#121614] dark:border-[#1F2623]" />
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: "Active Schemes & Batches",
      value: String(batchesCount),
      status: "Live Ledger Sync",
      icon: Layers,
    },
    {
      label: "Registered Members",
      value: String(customersCount),
      status: "Active Portfolio",
      icon: Users,
    },
    {
      label: "Realized Collections",
      value: totalCollections,
      status: "Atomic FIFO Ledger",
      icon: Receipt,
    },
    {
      label: "Operating Route Beats",
      value: String(groupsCount),
      status: "Regional Allocation",
      icon: MapPin,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full">
      {metrics.map((metric) => {
        const IconComp = metric.icon;
        return (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:border-emerald-500/40 hover:shadow-md dark:border-[#1F2623] dark:bg-[#121614] dark:hover:border-[#10B981]/30 dark:hover:shadow-lg dark:hover:shadow-black/40 min-w-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                {metric.label}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-emerald-600 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-[#10B981]">
                <IconComp className="h-4 w-4" />
              </div>
            </div>

            <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {metric.value}
            </p>

            <div className="mt-3 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <Activity className="h-3 w-3" />
                {metric.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
