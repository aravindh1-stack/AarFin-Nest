"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";

const navLinks = [
  { label: "Solutions", href: "/solutions" },
  { label: "Pricing", href: "/pricing" },
  { label: "Documentation", href: "/documentation" },
  { label: "Enterprise", href: "/enterprise" },
];

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-slate-800/50 dark:bg-[#000000]/90">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/nexfix-logo.png"
            alt="NexFix Logo"
            className="h-8 w-auto object-contain"
          />
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              NexFix
            </span>
            <span className="hidden rounded-full border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300 sm:inline">
              v2.4 SaaS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors ${
                    active
                      ? "text-teal-700 dark:text-teal-300"
                      : "text-slate-600 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-[21px] left-0 h-0.5 w-full bg-teal-600 dark:bg-teal-400" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 text-slate-700 transition hover:border-teal-500/40 hover:text-teal-700 dark:border-slate-800/50 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-teal-500/40 dark:hover:text-teal-300 cursor-pointer"
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>

          <Link
            href="/login"
            className="hidden rounded-xl border border-slate-300 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 transition hover:border-teal-500/50 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-500/50 dark:hover:text-teal-300 sm:inline-flex"
          >
            Sign In
          </Link>

          <Link
            href="/login"
            className="hidden rounded-xl bg-teal-700 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-teal-700/25 transition hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 sm:inline-flex"
          >
            Start Free Trial
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 text-slate-700 transition md:hidden dark:border-slate-800/60 dark:bg-slate-900/60 dark:text-slate-300 cursor-pointer"
          >
            {mobileMenuOpen ? (
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94Z" />
              </svg>
            ) : (
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
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200/80 bg-white/95 px-4 pb-6 pt-3 shadow-xl backdrop-blur-2xl md:hidden dark:border-slate-800/60 dark:bg-[#000000]/95 animate-in slide-in-from-top-2 duration-200">
          <ul className="space-y-1.5 pb-4">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      active
                        ? "bg-teal-500/10 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-2.5 border-t border-slate-200/70 pt-4 dark:border-slate-800/50">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-white/5"
            >
              Sign In to Workspace
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex w-full items-center justify-center rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-700/25 transition hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              Start Free Trial →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
