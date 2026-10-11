"use client";

import { useEffect, useState } from "react";

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
            agent: g.collection_agent || g.agent_name || "Field Agent",
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
    <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 dark:border-slate-800/50 dark:bg-[#121212]/70">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Today&apos;s Route Progress
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {routes.length} active routes
        </span>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="py-4 text-center text-xs text-slate-500">Loading routes...</p>
        ) : routes.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            No route groups registered in database.
          </p>
        ) : (
          routes.map((route) => (
            <div key={route.id}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {route.name}{" "}
                  <span className="text-slate-400 dark:text-slate-500">
                    · {route.agent}
                  </span>
                </span>
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  {route.collected}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                <div
                  className={`h-full rounded-full ${
                    route.collected >= 80
                      ? "bg-emerald-500"
                      : route.collected >= 60
                        ? "bg-teal-500"
                        : "bg-amber-500"
                  }`}
                  style={{ width: `${route.collected}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
