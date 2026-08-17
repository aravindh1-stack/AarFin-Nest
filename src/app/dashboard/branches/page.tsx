"use client";

import { DashboardTopbar } from "@/components/dashboard/topbar";

const branches = [
  {
    name: "North Region Head Office",
    code: "BR-NORTH-01",
    location: "Chennai, TN",
    status: "ACTIVE",
    members: 1420,
    routes: 12,
  },
  {
    name: "East Route Hub",
    code: "BR-EAST-02",
    location: "Coimbatore, TN",
    status: "ACTIVE",
    members: 890,
    routes: 8,
  },
  {
    name: "Central Zone Division",
    code: "BR-CENTRAL-03",
    location: "Madurai, TN",
    status: "ACTIVE",
    members: 1150,
    routes: 10,
  },
  {
    name: "West Zone Branch",
    code: "BR-WEST-04",
    location: "Salem, TN",
    status: "ACTIVE",
    members: 640,
    routes: 6,
  },
];

export default function BranchesPage() {
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
          <button
            type="button"
            className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer"
          >
            + Provision New Branch Tenant
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {branches.map((b) => (
            <div
              key={b.code}
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
      </div>
    </div>
  );
}
