"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";

const navGroups = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/dashboard", icon: "◫" },
      { label: "Collections Hub", href: "/collections", icon: "◈" },
      { label: "Schemes & Batches", href: "/batches", icon: "⚛" },
      { label: "Routes & Groups", href: "/groups", icon: "◎" },
      { label: "Customers", href: "/customers", icon: "👤" },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Reports", href: "/reports", icon: "▤" },
      { label: "Audit Logs", href: "/audit", icon: "◉" },
    ],
  },
];

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/70 bg-white/80 backdrop-blur-xl lg:flex dark:border-slate-800/50 dark:bg-[#000000]/90">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200/70 px-5 dark:border-slate-800/50">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 shadow-lg shadow-teal-500/20">
            <span className="text-sm font-bold text-white">N</span>
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            NexFix
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
              {group.label}
            </p>
            <ul className="mt-2 space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-teal-500/10 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-md text-sm ${
                          active
                            ? "bg-teal-600 text-white"
                            : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200/70 p-4 dark:border-slate-800/50">
        <button
          type="button"
          onClick={toggleTheme}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200/80 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-500/40 hover:text-teal-700 dark:border-slate-800/50 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-teal-500/40 dark:hover:text-teal-300 cursor-pointer"
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
          {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
        <div className="flex items-center gap-3 rounded-xl bg-slate-100/80 p-3 dark:bg-white/5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-700 text-xs font-bold text-white">
            SK
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
              Sundar Kumar
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              Branch Admin
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
