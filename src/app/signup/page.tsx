"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-[#000000] dark:text-slate-100">
      <AuthBrandPanel />

      <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 shadow-lg shadow-teal-500/20">
              <span className="text-sm font-bold text-white">N</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              NexFix
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Deploy your workspace
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Free for your first branch, no card required.
          </p>

          <form className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="first-name"
                  className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  First name
                </label>
                <input
                  id="first-name"
                  type="text"
                  placeholder="Arun"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-teal-500/30 transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 dark:border-slate-800 dark:bg-[#121212] dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
              <div>
                <label
                  htmlFor="last-name"
                  className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Last name
                </label>
                <input
                  id="last-name"
                  type="text"
                  placeholder="Kumar"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-teal-500/30 transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 dark:border-slate-800 dark:bg-[#121212] dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="org"
                className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Organization name
              </label>
              <input
                id="org"
                type="text"
                placeholder="Sri Lakshmi Chit Funds"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-teal-500/30 transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 dark:border-slate-800 dark:bg-[#121212] dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Work email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@branch.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-teal-500/30 transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 dark:border-slate-800 dark:bg-[#121212] dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 outline-none ring-teal-500/30 transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 dark:border-slate-800 dark:bg-[#121212] dark:text-white dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-300"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-700/25 transition hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              Create Workspace
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-500">
            By creating a workspace you agree to NexFix&apos;s Terms of
            Service and Privacy Policy.
          </p>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have a workspace?{" "}
            <Link
              href="/signin"
              className="font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
