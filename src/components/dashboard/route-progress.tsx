"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";

interface RouteItem {
  id: string;
  name: string;
  collected: number;
  agent: string;
}

export function RouteProgress() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoutes() {
      setLoading(true);
      try {
        const gRes = await fetch("/api/groups").then((r) => r.json());
        if (Array.isArray(gRes) && gRes.length > 0) {
          const items: RouteItem[] = gRes.map((g: any, index: number) => ({
            id: g.id || String(index),
            name: g.group_name || `Route ${index + 1}`,
            collected: Number(g.collection_percentage) || 0,
            agent: g.collection_agent && g.collection_agent.trim() !== "" ? g.collection_agent : "Unassigned",
          }));
          setRoutes(items);
        } else {
          setRoutes([]);
        }
      } catch (err) {
        console.error("Error fetching route progress:", err);
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRoutes();
  }, []);

  return (
    <div className="w-full max-w-full min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-[#1F2623] dark:bg-[#121614]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-slate-900 dark:text-white">
          Today&apos;s Route Progress
        </h3>
        <span className="text-xs text-slate-500 dark:text-neutral-400 tabular-nums font-mono">
          {routes.length} active routes
        </span>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="py-4 text-center text-xs text-slate-500 dark:text-neutral-400">Loading route telemetry...</p>
        ) : routes.length === 0 ? (
          <div className="mx-auto flex flex-col items-center justify-center py-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-neutral-400 mb-3">
              <MapPin className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium text-slate-900 dark:text-white">No active collection routes</p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-neutral-400 max-w-xs">
              Configure beats and group allocations to track daily field recovery progress.
            </p>
            <Link
              href="/dashboard/routes"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition"
            >
              <Plus className="h-3 w-3" />
              <span>Configure Routes</span>
            </Link>
          </div>
        ) : (
          routes.map((route) => (
            <div key={route.id} className="space-y-1.5 min-w-0">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-neutral-200 truncate pr-2">
                  {route.name}{" "}
                  <span className="text-slate-400 dark:text-neutral-500">
                    · {route.agent}
                  </span>
                </span>
                <span className="font-semibold tabular-nums font-mono text-emerald-600 dark:text-[#10B981] shrink-0">
                  {route.collected}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[#0E1110] border border-slate-200/80 dark:border-[#1F2623]">
                <div
                  className="h-full rounded-full bg-emerald-600 dark:bg-[#10B981] transition-all duration-500"
                  style={{ width: `${Math.min(route.collected, 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
