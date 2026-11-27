"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { BrandLogo } from "@/components/brand-logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        document.cookie = "aarfin_session=authenticated; path=/; max-age=86400";
        if (data.user) {
          const role = (data.user.role || "").toUpperCase();
          const target = role.includes("FIELD") ? "/dashboard/collections" : "/dashboard";
          router.push(target);
        } else {
          router.push("/dashboard");
        }
      } else {
        setErrorMessage(data.message || "Incorrect email or password");
        setLoading(false);
      }
    } catch {
      setErrorMessage("Network error while connecting to authentication service");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex items-center gap-3 lg:hidden">
        <BrandLogo className="h-10 w-auto object-contain" />
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
            NexFix
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-[#10B981] mt-1">
            Financial OS
          </span>
        </div>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-[#8E9B94]">
        Sign in to your corporate branch workspace.
      </p>

      {errorMessage && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Google OAuth Button */}
      <div className="mt-6">
        <a
          href="/api/auth/google"
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-500/50 hover:bg-slate-50 dark:border-[#1F2623] dark:bg-[#121614] dark:text-[#ECEDEE] dark:hover:border-emerald-500/50 dark:hover:bg-[#151a18] cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.4H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.3 21.3 7.3 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.4 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.6.4-2.4V6.5H1.4A11.9 11.9 0 0 0 0 12c0 1.9.5 3.8 1.4 5.5l4-3.1Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.8c1.7 0 3.3.6 4.5 1.7l3.4-3.4C17.9 1.2 15.1 0 12 0 7.3 0 3.3 2.7 1.4 6.5l4 3.1c.9-2.8 3.5-4.9 6.6-4.9Z"
            />
          </svg>
          <span>Continue with Google</span>
        </a>
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-[#1F2623]" />
        <span className="text-xs uppercase tracking-wider text-slate-400 dark:text-[#8E9B94]">
          or credentials
        </span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-[#1F2623]" />
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-[#ECEDEE]"
          >
            Work email or ID
          </label>
          <input
            id="email"
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="aravindh@aarga.org"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-emerald-500/30 transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 dark:border-[#1F2623] dark:bg-[#121614] dark:text-[#ECEDEE] dark:placeholder:text-[#8E9B94]"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700 dark:text-[#ECEDEE]"
            >
              Password
            </label>
            <Link
              href="#"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-[#10B981] dark:hover:text-emerald-400"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 outline-none ring-emerald-500/30 transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 dark:border-[#1F2623] dark:bg-[#121614] dark:text-[#ECEDEE] dark:placeholder:text-[#8E9B94]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-[#8E9B94] dark:hover:text-[#10B981]"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-[#8E9B94]">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-[#1F2623] dark:bg-[#121614]"
          />
          Keep me signed in
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 dark:bg-[#10B981] dark:hover:bg-[#0ea57e] dark:text-[#090B0A] font-bold cursor-pointer"
        >
          {loading ? "Verifying..." : "Sign In with Credentials"}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-slate-500 dark:text-[#8E9B94]">
        Secured by NexFix Multi-Tenant Access Engine
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-[#090B0A] dark:text-[#ECEDEE]">
      <AuthBrandPanel />

      <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <Suspense fallback={<div className="text-xs text-[#8E9B94]">Loading sign-in form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
