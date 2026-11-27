"use client";

import Link from "next/link";
import { useMobileNav } from "@/components/dashboard/dashboard-shell";
import { BrandLogo } from "@/components/brand-logo";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { Search, Menu } from "lucide-react";

export function DashboardTopbar({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const { toggleMobileDrawer } = useMobileNav();

  return (
    <>
      <CommandPalette />
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8 dark:border-[#1F2623] dark:bg-[#0E1110]/95">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Menu Button (< md) */}
          <button
            type="button"
            onClick={toggleMobileDrawer}
            aria-label="Open mobile menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 transition hover:bg-slate-100 hover:text-emerald-700 md:hidden dark:border-[#1F2623] dark:bg-[#121614] dark:text-[#ECEDEE] dark:hover:bg-white/5 cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile Logo on topbar (< md) */}
          <Link href="/" className="shrink-0 md:hidden flex items-center">
            <BrandLogo className="h-7 w-auto object-contain" />
          </Link>

          {/* Title and Description */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg dark:text-white leading-none">
                {title}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE
              </span>
            </div>
            {description && (
              <p className="hidden sm:block truncate text-xs text-slate-500 dark:text-[#8E9B94] mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Global Shortcut Search Trigger (⌘K) */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
            }}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs text-slate-400 hover:border-emerald-500/40 hover:text-slate-600 dark:border-[#1F2623] dark:bg-[#121614] dark:text-[#8E9B94] dark:hover:text-white cursor-pointer shadow-xs transition"
          >
            <Search className="h-3.5 w-3.5 text-slate-400 dark:text-[#8E9B94]" />
            <span className="hidden sm:inline text-xs">Search ledger or actions...</span>
            <span className="sm:hidden text-xs">Search...</span>
            <kbd className="font-mono text-[10px] bg-slate-100 dark:bg-[#0E1110] px-1.5 py-0.5 rounded text-slate-500 dark:text-[#8E9B94] border border-slate-200 dark:border-[#1F2623]">⌘K</kbd>
          </button>
        </div>
      </header>
    </>
  );
}
