"use client";

import { useEffect, useState } from "react";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { SkeletonBlock } from "@/components/skeleton-block";

interface BranchItem {
  id: string;
  name: string;
  code: string;
  location: string;
  status: string;
  members: number;
  routes: number;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBranches() {
      setLoading(true);
      try {
        const [gRes, cRes] = await Promise.all([
          fetch("/api/groups").then((r) => r.json()),
          fetch("/api/customers").then((r) => r.json()),
        ]);

        const groupsList = Array.isArray(gRes) ? gRes : [];
        const customersList = Array.isArray(cRes) ? cRes : [];

        if (groupsList.length > 0) {
          const derived: BranchItem[] = groupsList.map((g: any, idx: number) => {
            const memberCount = customersList.filter(
              (c: any) => c.group_id === g.id || c.group_name === g.group_name
            ).length;

            return {
              id: g.id || String(idx),
              name: g.group_name || `Regional Division ${idx + 1}`,
              code: g.group_code || `BR-REG-${idx + 1}`,
              location: g.route_name || "Head Office Region",
              status: "ACTIVE",
              members: memberCount,
              routes: 1,
            };
          });
          setBranches(derived);
        } else {
          setBranches([]);
        }
      } catch (err) {
        console.error("Error loading branches:", err);
        setBranches([]);
      } finally {
        setLoading(false);
      }
    }

    loadBranches();
  }, []);

  return (
    <div>
      <DashboardTopbar
        title="Branch Tenants"
        description="Multi-region branch tenant management and regional telemetry"
      />

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Regional Branch Tenants
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-tenant branch isolation & regional group access
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : branches.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-12 text-center text-xs text-slate-500 dark:border-slate-800/50 dark:bg-[#121212]/70">
            No branch tenants registered in database.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {branches.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 transition hover:border-teal-500/30 dark:border-slate-800/50 dark:bg-[#121212]/70"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-600 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300">
                    ⌘
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {b.status}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                  {b.name}
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {b.code} · {b.location}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200/70 pt-3 text-xs dark:border-slate-800/50">
                  <div>
                    <p className="text-[10px] text-slate-400">Enrolled Members</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {b.members.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Active Routes</p>
                    <p className="font-bold text-teal-600 dark:text-teal-400">
                      {b.routes} Routes
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
