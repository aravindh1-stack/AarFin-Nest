"use client";

import { useEffect, useState } from "react";
import { SkeletonBlock } from "@/components/skeleton-block";

function Sparkline({ points }: { points: number[] }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 100 - ((p - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-8 w-20">
      <polyline
        points={coords}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: "Active Schemes & Batches",
      value: String(batchesCount),
      delta: "Live DB Sync",
      trend: "up" as const,
      icon: "⚛",
      sparkline: [4, 6, 5, 8, 7, 10, 9, 12],
    },
    {
      label: "Registered Customers",
      value: String(customersCount),
      delta: "Active Members",
      trend: "up" as const,
      icon: "👥",
      sparkline: [3, 5, 4, 6, 8, 7, 9, 11],
    },
    {
      label: "Total Collections",
      value: totalCollections,
      delta: "Atomic FIFO Ledger",
      trend: "up" as const,
      icon: "◈",
      sparkline: [8, 8, 9, 9, 8, 10, 9, 10],
    },
    {
      label: "Route Groups",
      value: String(groupsCount),
      delta: "Geographical Isolation",
      trend: "flat" as const,
      icon: "◎",
      sparkline: [2, 2, 3, 3, 3, 4, 4, 4],
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 transition hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 dark:border-slate-800/50 dark:bg-[#121212]/70 dark:hover:border-teal-500/30"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-base text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300">
              {metric.icon}
            </div>
            <div className="text-teal-500/70 dark:text-teal-400/60">
              <Sparkline points={metric.sparkline} />
            </div>
          </div>

          <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {metric.label}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {metric.value}
          </p>
          <p
            className={`mt-1.5 inline-flex items-center gap-1 text-xs font-semibold ${
              metric.trend === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {metric.trend === "up" && (
              <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3">
                <path d="M6 2 10 8H2Z" />
              </svg>
            )}
            {metric.delta}
          </p>
        </div>
      ))}
    </div>
  );
}
