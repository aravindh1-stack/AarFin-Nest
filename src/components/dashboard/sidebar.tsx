"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { BrandLogo } from "@/components/brand-logo";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Layers,
  MapPin,
  Scale,
  FileText,
  ShieldAlert,
  Building2,
  CreditCard,
  Settings,
  Sun,
  Moon,
} from "lucide-react";

const navGroups = [
  {
    label: "WORKSPACE",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Collections Hub", href: "/dashboard/collections", icon: Receipt },
      { label: "Customer Directory", href: "/dashboard/customers", icon: Users },
      { label: "Schemes & Batches", href: "/dashboard/schemes", icon: Layers },
      { label: "Routes & Groups", href: "/dashboard/routes", icon: MapPin },
    ],
  },
  {
    label: "CASH & CONTROL",
    items: [
      { label: "EOD Reconciliation", href: "/dashboard/reconciliation", icon: Scale },
      { label: "Reports Studio", href: "/dashboard/reports", icon: FileText },
      { label: "Audit Telemetry", href: "/dashboard/audit", icon: ShieldAlert },
    ],
  },
  {
    label: "ORGANIZATION",
    items: [
      { label: "Branch Tenants", href: "/dashboard/branches", icon: Building2 },
      { label: "SaaS Billing", href: "/dashboard/billing", icon: CreditCard },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/80 bg-white/95 backdrop-blur-xl lg:flex dark:border-[#202425] dark:bg-[#0C0D0E]/95">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200/80 px-5 dark:border-[#202425]">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo className="h-8 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              NexFix
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mt-1">
              Financial OS
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {group.label}
            </p>
            <ul className="mt-2 space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? "bg-teal-500/10 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300 font-bold shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                      }`}
                    >
                      <IconComponent
                        className={`h-4 w-4 shrink-0 transition ${
                          active
                            ? "text-teal-600 dark:text-teal-400"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200/80 p-4 dark:border-[#202425]">
        <button
          type="button"
          onClick={toggleTheme}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-500/40 hover:text-teal-700 dark:border-[#202425] dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-teal-500/40 dark:hover:text-teal-300 cursor-pointer"
        >
          {theme === "light" ? (
            <Moon className="h-3.5 w-3.5" />
          ) : (
            <Sun className="h-3.5 w-3.5" />
          )}
          <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
        </button>
        <div className="flex items-center gap-3 rounded-xl bg-slate-100/80 p-3 dark:bg-white/5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 text-xs font-bold text-white shadow-xs">
            NF
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
              NexFix Admin
            </p>
            <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
              admin@nexfix.io
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
