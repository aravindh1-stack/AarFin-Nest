"use client";

import Link from "next/link";
import { useMobileNav } from "@/components/dashboard/dashboard-shell";

export function DashboardTopbar({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const { toggleMobileDrawer } = useMobileNav();

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200/70 bg-slate-50/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8 dark:border-slate-800/50 dark:bg-[#000000]/90">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={toggleMobileDrawer}
          aria-label="Open mobile menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 transition hover:bg-slate-100 hover:text-teal-700 lg:hidden dark:border-slate-800/60 dark:bg-[#121212] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-teal-300 cursor-pointer"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Mobile Logo on topbar */}
        <Link href="/" className="shrink-0 lg:hidden flex items-center">
          <img
            src="/nexfix-logo.png"
            alt="NexFix Logo"
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* Title and Description */}
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="hidden sm:block truncate text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative hidden md:block">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 3.55 9.7l3.13 3.12a.75.75 0 1 0 1.06-1.06l-3.12-3.13A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="w-48 lg:w-64 rounded-xl border border-slate-200/80 bg-white py-1.5 pl-9 pr-3 text-xs sm:text-sm text-slate-700 outline-none ring-teal-500/30 transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 dark:border-slate-800/50 dark:bg-[#121212] dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 transition hover:border-teal-500/40 hover:text-teal-700 dark:border-slate-800/50 dark:bg-[#121212] dark:text-slate-300 dark:hover:border-teal-500/40 dark:hover:text-teal-300 cursor-pointer"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M10 2a6 6 0 0 0-6 6v2.6c0 .5-.2 1-.5 1.4L2.4 13.6c-.6.7-.1 1.9.9 1.9h13.4c1 0 1.5-1.2.9-1.9l-1.1-1.6a2.4 2.4 0 0 1-.5-1.4V8a6 6 0 0 0-6-6Z" />
            <path d="M8.2 17a1.8 1.8 0 0 0 3.6 0z" />
          </svg>
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#000000]" />
        </button>
      </div>
    </div>
  );
}
