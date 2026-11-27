"use client";

import { useEffect, useState } from "react";
import { SkeletonBlock } from "@/components/skeleton-block";
import { Layers, Users, Receipt, MapPin } from "lucide-react";

interface MetricsData {
  activeSchemes: number;
  registeredMembers: number;
  operatingRoutes: number;
  realizedCollectionsFormatted: string;
}

export function MetricCards() {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      try {
        const res = await fetch("/api/dashboard/metrics");
        const data = await res.json();
        if (data && data.metrics) {
          setMetricsData(data.metrics);
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
          <SkeletonBlock
            key={i}
            className="h-32 w-full rounded-2xl bg-white border border-slate-200/80 dark:bg-[#121614] dark:border-[#1F2623]"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Active Schemes & Batches",
      value: String(metricsData?.activeSchemes ?? 0),
      status: "Live Ledger Sync",
      icon: Layers,
    },
    {
      label: "Registered Members",
      value: String(metricsData?.registeredMembers ?? 0),
      status: "Active Portfolio",
      icon: Users,
    },
    {
      label: "Realized Collections",
      value: metricsData?.realizedCollectionsFormatted ?? "₹0",
      status: "Atomic FIFO Ledger",
      icon: Receipt,
    },
    {
      label: "Operating Route Beats",
      value: String(metricsData?.operatingRoutes ?? 0),
      status: "Regional Allocation",
      icon: MapPin,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 w-full">
      {cards.map((metric) => {
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

            <div className="mt-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                {metric.status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
