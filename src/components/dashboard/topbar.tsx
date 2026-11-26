"use client";

import { useState } from "react";
import Link from "next/link";
import { useMobileNav } from "@/components/dashboard/dashboard-shell";
import { BrandLogo } from "@/components/brand-logo";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { Building2, Search, Bell, ChevronDown, Menu } from "lucide-react";

export function DashboardTopbar({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const { toggleMobileDrawer } = useMobileNav();
  const [selectedBranch, setSelectedBranch] = useState("Primary Division 01 (HQ)");
  const [showBranchMenu, setShowBranchMenu] = useState(false);

  const branches = [
    { name: "Primary Division 01 (HQ)", code: "DIV-01", routes: 8 },
    { name: "Regional Division 02", code: "DIV-02", routes: 5 },
    { name: "Commercial Hub 03", code: "DIV-03", routes: 4 },
  ];

  return (
    <>
      <CommandPalette />
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8 dark:border-[#202425] dark:bg-[#0C0D0E]/95">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={toggleMobileDrawer}
            aria-label="Open mobile menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 transition hover:bg-slate-100 hover:text-teal-700 lg:hidden dark:border-[#202425] dark:bg-[#151718] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-teal-300 cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile Logo on topbar */}
          <Link href="/" className="shrink-0 lg:hidden flex items-center">
            <BrandLogo className="h-8 w-auto object-contain" />
          </Link>

          {/* Title and Description */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-xl dark:text-white">
                {title}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-400/10 dark:text-teal-300 border border-teal-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                GROWTH TIER
              </span>
            </div>
            {description && (
              <p className="hidden sm:block truncate text-xs text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Branch Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBranchMenu(!showBranchMenu)}
              className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:border-teal-500/40 hover:bg-slate-50 dark:border-[#202425] dark:bg-[#151718] dark:text-slate-200 dark:hover:bg-white/5 cursor-pointer"
            >
              <Building2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate">{selectedBranch}</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showBranchMenu && (
              <div 
                className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-[#151718] z-50 animate-in fade-in"
                onMouseLeave={() => setShowBranchMenu(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Operating Division
                </div>
                {branches.map((b) => (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => {
                      setSelectedBranch(b.name);
                      setShowBranchMenu(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition cursor-pointer ${
                      selectedBranch === b.name
                        ? "bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{b.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{b.code}</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{b.routes} routes</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Command Bar Trigger */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
            }}
            className="hidden md:flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs text-slate-400 hover:border-teal-500/40 hover:text-slate-600 dark:border-[#202425] dark:bg-[#151718] dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer shadow-xs"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search ledger or actions...</span>
            <kbd className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">⌘K</kbd>
          </button>

          {/* Notifications button */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 transition hover:border-teal-500/40 hover:text-teal-700 dark:border-[#202425] dark:bg-[#151718] dark:text-slate-300 dark:hover:border-teal-500/40 dark:hover:text-teal-300 cursor-pointer shadow-xs"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0C0D0E]" />
          </button>
        </div>
      </div>
    </>
  );
}
