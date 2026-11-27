"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/components/auth/auth-context";
import { BrandLogo } from "@/components/brand-logo";
import { isRouteAllowed } from "@/lib/auth/rbac";
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
  LogOut,
} from "lucide-react";

const allNavGroups = [
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

function getRoleBadge(role: string) {
  switch (role) {
    case "ADMIN":
      return "Super Admin · Owner";
    case "BRANCH_MANAGER":
      return "Branch Manager";
    case "CASHIER":
      return "Head Cashier";
    case "FIELD_OFFICER":
      return "Field Collection Officer";
    default:
      return role;
  }
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, role, logout } = useAuth();

  // Filter navigation items by role permissions
  const filteredNavGroups = allNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isRouteAllowed(role, item.href)),
    }))
    .filter((group) => group.items.length > 0);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AM";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/80 bg-white md:flex dark:border-[#1F2623] dark:bg-[#0E1110]">
      {/* Brand Header: Exactly h-16 to align seamlessly with DashboardTopbar */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200/80 px-5 dark:border-[#1F2623] shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3">
          <BrandLogo className="h-7 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              NexFix
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-[#10B981] mt-1">
              Financial OS
            </span>
          </div>
        </Link>
      </div>

      {/* Structured Navigation Categories (Scrollbar hidden while scrolling functions) */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {filteredNavGroups.map((group) => (
          <div key={group.label}>
            <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#8E9B94]">
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
                          ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-[#10B981] font-bold"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#8E9B94] dark:hover:bg-white/5 dark:hover:text-white"
                      }`}
                    >
                      <IconComponent
                        className={`h-4 w-4 shrink-0 transition ${
                          active
                            ? "text-emerald-600 dark:text-[#10B981]"
                            : "text-slate-400 dark:text-[#8E9B94]"
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

      {/* Footer Profile & Theme Toggle */}
      <div className="border-t border-slate-200/80 p-4 dark:border-[#1F2623] space-y-3 shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-500/40 hover:text-emerald-700 dark:border-[#1F2623] dark:bg-[#121614] dark:text-[#ECEDEE] dark:hover:border-emerald-500/40 cursor-pointer"
        >
          {theme === "light" ? (
            <Moon className="h-3.5 w-3.5 text-slate-600 dark:text-[#8E9B94]" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-amber-400" />
          )}
          <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
        </button>

        <div className="flex items-center justify-between rounded-xl bg-slate-100/80 p-3 dark:bg-[#121614] border border-slate-200/60 dark:border-[#1F2623]">
          <div className="flex items-center gap-3 min-w-0">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name || "User"}
                className="h-9 w-9 rounded-xl border border-[#1F2623] object-cover shrink-0"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600/15 text-xs font-bold text-emerald-700 dark:text-[#10B981] border border-emerald-500/30">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                {user?.name || "Aravindh Murugesan"}
              </p>
              <p className="truncate text-[10px] text-slate-500 dark:text-[#8E9B94]">
                {getRoleBadge(role)}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 cursor-pointer shrink-0 ml-1"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
