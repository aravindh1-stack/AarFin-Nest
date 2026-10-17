"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { useTheme } from "@/components/theme-provider";
import { BrandLogo } from "@/components/brand-logo";

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

const mainNavTabs = [
  { label: "Collections", href: "/dashboard/collections", icon: "◈" },
  { label: "Customers", href: "/dashboard/customers", icon: "👤" },
  { label: "Overview", href: "/dashboard", icon: "◫" },
  { label: "Schemes", href: "/dashboard/schemes", icon: "⚛" },
];

const allNavGroups = [
  {
    label: "WORKSPACE",
    items: [
      { label: "Overview", href: "/dashboard", icon: "◫" },
      { label: "Collections Hub", href: "/dashboard/collections", icon: "◈" },
      { label: "Customer Directory", href: "/dashboard/customers", icon: "👤" },
      { label: "Schemes & Batches", href: "/dashboard/schemes", icon: "⚛" },
      { label: "Routes & Groups", href: "/dashboard/routes", icon: "◎" },
    ],
  },
  {
    label: "INSIGHTS & REPORTS",
    items: [
      { label: "Financial Reports", href: "/dashboard/reports", icon: "▤" },
      { label: "Audit Logs", href: "/dashboard/audit", icon: "◉" },
    ],
  },
  {
    label: "ORGANIZATION",
    items: [
      { label: "Branch Tenants", href: "/dashboard/branches", icon: "⌘" },
      { label: "Settings", href: "/dashboard/settings", icon: "⚙" },
    ],
  },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

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

  return (
    <MobileNavContext.Provider
      value={{
        isMobileDrawerOpen,
        openMobileDrawer: () => setIsMobileDrawerOpen(true),
        closeMobileDrawer: () => setIsMobileDrawerOpen(false),
        toggleMobileDrawer: () => setIsMobileDrawerOpen((prev) => !prev),
      }}
    >
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0C0D0E] dark:text-slate-100">
        {/* Desktop Sidebar (hidden on mobile, visible lg:flex) */}
        <DashboardSidebar />

        {/* Mobile Slide-Over Navigation Drawer */}
        <div
          aria-hidden="true"
          onClick={() => setIsMobileDrawerOpen(false)}
          className={`fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
            isMobileDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-slate-200/80 bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden dark:border-[#202425] dark:bg-[#0a0a0a] ${
            isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Mobile Drawer Header with Logo */}
          <div className="flex h-16 items-center justify-between border-b border-slate-200/70 px-4 dark:border-[#202425]">
            <Link
              href="/"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="flex items-center gap-3"
            >
              <BrandLogo className="h-8 w-auto object-contain" />
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  NexFix
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  AarFin Nest
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(false)}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94Z" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
            {allNavGroups.map((group) => (
              <div key={group.label}>
                <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {group.label}
                </p>
                <ul className="mt-2 space-y-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileDrawerOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                            active
                              ? "bg-teal-500/10 font-bold text-teal-700 dark:bg-teal-400/10 dark:text-teal-300"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${
                              active
                                ? "bg-teal-600 text-white shadow-sm"
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

          {/* Mobile Drawer Footer with Theme Toggle & Profile */}
          <div className="border-t border-slate-200/70 p-4 dark:border-[#202425]">
            <button
              type="button"
              onClick={toggleTheme}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-teal-500/40 hover:text-teal-700 dark:border-[#202425] dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-teal-500/40 dark:hover:text-teal-300 cursor-pointer"
            >
              {theme === "light" ? "🌙 Switch to Dark Mode" : "☀️ Switch to Light Mode"}
            </button>

            <div className="flex items-center justify-between rounded-xl bg-slate-100/80 p-3 dark:bg-white/5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-700 text-xs font-bold text-white">
                  SK
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                    Sundar Kumar
                  </p>
                  <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                    Branch Admin
                  </p>
                </div>
              </div>
              <Link
                href="/login"
                className="text-[11px] font-semibold text-rose-600 hover:underline dark:text-rose-400"
              >
                Logout
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content Area: padded for desktop sidebar and padded bottom for mobile bottom nav */}
        <div className="pb-24 lg:pb-8 lg:pl-64">{children}</div>

        {/* Mobile Bottom Navigation Bar (Thumb Friendly) */}
        <nav
          aria-label="Mobile Bottom Navigation"
          className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200/80 bg-white/95 px-2 backdrop-blur-xl lg:hidden dark:border-[#202425] dark:bg-[#0C0D0E]/95"
        >
          {mainNavTabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-center transition ${
                  active
                    ? "font-bold text-teal-700 dark:text-teal-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm transition ${
                    active
                      ? "bg-teal-500/15 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300"
                      : ""
                  }`}
                >
                  {tab.icon}
                </span>
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </Link>
            );
          })}

          {/* More / Menu Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 text-center transition ${
              isMobileDrawerOpen
                ? "font-bold text-teal-700 dark:text-teal-400"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg text-sm">
              ☰
            </span>
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </nav>
      </div>
    </MobileNavContext.Provider>
  );
}
