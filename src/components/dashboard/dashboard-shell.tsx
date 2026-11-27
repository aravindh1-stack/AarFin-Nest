"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { useTheme } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/components/auth/auth-context";
import { BrandLogo } from "@/components/brand-logo";
import { isRouteAllowed } from "@/lib/auth/rbac";
import {
  Receipt,
  Layers,
  MapPin,
  Users,
  LayoutDashboard,
  Scale,
  FileText,
  ShieldAlert,
  Building2,
  CreditCard,
  Settings,
  MoreHorizontal,
  X,
  Moon,
  Sun,
  LogOut,
  UserCheck,
} from "lucide-react";

interface MobileNavContextType {
  isMobileDrawerOpen: boolean;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  toggleMobileDrawer: () => void;
}

const MobileNavContext = createContext<MobileNavContextType>({
  isMobileDrawerOpen: false,
  openMobileDrawer: () => {},
  closeMobileDrawer: () => {},
  toggleMobileDrawer: () => {},
});

export function useMobileNav() {
  return useContext(MobileNavContext);
}

// Exactly 4 high-frequency views for the mobile bottom navigation bar (< 768px)
const candidateBottomTabs = [
  { label: "Collections", href: "/dashboard/collections", icon: Receipt },
  { label: "Schemes", href: "/dashboard/schemes", icon: Layers },
  { label: "Routes", href: "/dashboard/routes", icon: MapPin },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
];

// All grouped links for the mobile slide-out drawer
const allDrawerNavGroups = [
  {
    label: "MAIN NAVIGATION",
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
    label: "ADMINISTRATION",
    items: [
      { label: "Team & Staff", href: "/dashboard/team", icon: UserCheck },
      { label: "Branch Tenants", href: "/dashboard/branches", icon: Building2 },
      { label: "SaaS Billing", href: "/dashboard/billing", icon: CreditCard },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

function DashboardShellContent({ children }: { children: React.ReactNode }) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, role, logout } = useAuth();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileDrawerOpen]);

  // Filter bottom tabs based on role permissions
  const visibleBottomTabs = candidateBottomTabs.filter((tab) => isRouteAllowed(role, tab.href));

  // Filter drawer nav groups based on role permissions
  const filteredDrawerNavGroups = allDrawerNavGroups
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
    <MobileNavContext.Provider
      value={{
        isMobileDrawerOpen,
        openMobileDrawer: () => setIsMobileDrawerOpen(true),
        closeMobileDrawer: () => setIsMobileDrawerOpen(false),
        toggleMobileDrawer: () => setIsMobileDrawerOpen((prev) => !prev),
      }}
    >
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F8FAFC] text-slate-900 dark:bg-[#090B0A] dark:text-[#ECEDEE] antialiased">
        {/* Desktop Fixed Left Sidebar (hidden on mobile, visible md:flex) */}
        <DashboardSidebar />

        {/* Mobile Slide-Over Administrative Drawer */}
        <div
          aria-hidden="true"
          onClick={() => setIsMobileDrawerOpen(false)}
          className={`fixed inset-0 z-50 bg-black/75 backdrop-blur-sm transition-opacity duration-200 md:hidden ${
            isMobileDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Drawer"
          className={`fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col border-l border-slate-200/80 bg-white shadow-2xl transition-transform duration-200 ease-out md:hidden dark:border-[#1F2623] dark:bg-[#0E1110] ${
            isMobileDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-4 dark:border-[#1F2623] shrink-0">
            <Link
              href="/dashboard"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="flex items-center gap-3"
            >
              <BrandLogo className="h-7 w-auto object-contain" />
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  NexFix
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-[#10B981] mt-1">
                  Menu & Settings
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(false)}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Links */}
          <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {filteredDrawerNavGroups.map((group) => (
              <div key={group.label}>
                <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#8E9B94]">
                  {group.label}
                </p>
                <ul className="mt-2 space-y-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    const IconComp = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileDrawerOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                            active
                              ? "bg-emerald-500/10 font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-[#10B981]"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-[#8E9B94] dark:hover:bg-white/5 dark:hover:text-white"
                          }`}
                        >
                          <IconComp className={`h-4 w-4 shrink-0 ${active ? "text-emerald-600 dark:text-[#10B981]" : "text-slate-400 dark:text-[#8E9B94]"}`} />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Drawer Footer with Theme Toggle & Profile */}
          <div className="border-t border-slate-200/80 p-4 dark:border-[#1F2623] space-y-3 shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-500/40 hover:text-emerald-700 dark:border-[#1F2623] dark:bg-[#121614] dark:text-[#ECEDEE] dark:hover:border-emerald-500/40 cursor-pointer"
            >
              {theme === "light" ? (
                <>
                  <Moon className="h-3.5 w-3.5 text-slate-600 dark:text-[#8E9B94]" />
                  <span>Switch to Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>Switch to Light Mode</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between rounded-xl bg-slate-100/80 p-3 dark:bg-[#121614] border border-slate-200/60 dark:border-[#1F2623]">
              <div className="flex items-center gap-3 min-w-0">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name || "User"}
                    className="h-8 w-8 rounded-xl border border-[#1F2623] object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600/15 text-xs font-bold text-emerald-700 dark:text-[#10B981] border border-emerald-500/30">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                    {user?.name || "Aravindh Murugesan"}
                  </p>
                  <p className="truncate text-[10px] text-slate-500 dark:text-[#8E9B94]">
                    {role}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:underline dark:text-rose-400 cursor-pointer"
              >
                <LogOut className="h-3 w-3" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area: Padded left on desktop for fixed sidebar; padded bottom on mobile for bottom bar */}
        <div className="w-full max-w-full min-w-0 pb-24 md:pb-8 md:pl-64 overflow-x-hidden">
          {children}
        </div>

        {/* Mobile / Field View Bottom Navigation Bar (< 768px): High-Frequency Tabs + More Drawer Toggle */}
        <nav
          aria-label="Mobile Bottom Navigation"
          className="fixed bottom-0 left-0 right-0 z-40 flex h-16 w-full items-center justify-around border-t border-slate-200/80 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] px-1 dark:border-[#1F2623] dark:bg-[#0E1110]/95 backdrop-blur-xl md:hidden shadow-lg"
        >
          {visibleBottomTabs.map((tab) => {
            const active = pathname === tab.href;
            const IconComp = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-1 min-h-[48px] min-w-[56px] px-2 py-1 transition cursor-pointer ${
                  active
                    ? "font-bold text-emerald-600 dark:text-[#10B981]"
                    : "text-slate-500 hover:text-slate-800 dark:text-[#8E9B94] dark:hover:text-white"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition ${
                    active
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-[#10B981]"
                      : ""
                  }`}
                >
                  <IconComp className="h-4 w-4" />
                </span>
                <span className="text-[10px] tracking-tight leading-none">{tab.label}</span>
              </Link>
            );
          })}

          {/* More Administrative Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            aria-label="Open more menu"
            className={`flex flex-col items-center justify-center gap-1 min-h-[48px] min-w-[56px] px-2 py-1 transition cursor-pointer ${
              isMobileDrawerOpen
                ? "font-bold text-emerald-600 dark:text-[#10B981]"
                : "text-slate-500 hover:text-slate-800 dark:text-[#8E9B94] dark:hover:text-white"
            }`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg">
              <MoreHorizontal className="h-4 w-4" />
            </span>
            <span className="text-[10px] tracking-tight leading-none">More</span>
          </button>
        </nav>
      </div>
    </MobileNavContext.Provider>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShellContent>{children}</DashboardShellContent>
    </AuthProvider>
  );
}
