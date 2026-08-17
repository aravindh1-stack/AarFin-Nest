"use client";

import { DashboardTopbar } from "@/components/dashboard/topbar";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <DashboardTopbar
        title="Settings & Configuration"
        description="Manage system parameters, FIFO allocation rules, and theme preferences"
      />

      <div className="max-w-3xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 dark:border-slate-800/50 dark:bg-[#121212]/70">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Appearance & Theme Preference
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Customize system appearance — Deep Black theme for low-light command centers.
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-4 dark:border-slate-800/50">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Current Theme: <span className="capitalize">{theme}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Toggle between light background and signature Deep Black mode.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer"
            >
              Toggle {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 dark:border-slate-800/50 dark:bg-[#121212]/70">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            FIFO Allocation Engine Rules
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Configure automatic payment distribution across oldest open installment cycles.
          </p>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 dark:border-slate-800/50">
              <span className="text-slate-700 dark:text-slate-300">
                Auto-Apply Advance Credit to Next Dues Cycle
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Enabled
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-3 dark:border-slate-800/50">
              <span className="text-slate-700 dark:text-slate-300">
                Strict Sequential Cycle Enforcement
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">
                Late Joiner Policy Default Mode
              </span>
              <span className="font-semibold text-teal-600 dark:text-teal-400">
                START_FROM_JOIN_DATE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
