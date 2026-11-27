"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ArrowLeft, CheckCircle2, Lock, KeyRound } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Reset token is missing from the link. Please request a new password reset.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login?reset=success");
        }, 2000);
      } else {
        setErrorMessage(data.message || "Failed to reset password. Link may have expired.");
      }
    } catch {
      setErrorMessage("Network error connecting to reset service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-[#1F2623] dark:bg-[#121614] sm:p-8">
      {/* Brand Header */}
      <div className="mb-6 flex items-center gap-3">
        <BrandLogo className="h-8 w-auto object-contain" />
        <div className="flex flex-col">
          <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
            NexFix
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-[#10B981] mt-1">
            Financial OS
          </span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-[#10B981] border border-emerald-500/20 mb-3">
          <KeyRound className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Create new password
        </h1>
        <p className="mt-1 text-xs text-slate-600 dark:text-[#8E9B94]">
          Set a secure corporate password for your account.
        </p>
      </div>

      {success ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600 dark:text-[#10B981] mb-2" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Password Updated!</h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-[#8E9B94]">
            Your password was changed successfully. Redirecting you to sign in...
          </p>
          <Link
            href="/login?reset=success"
            className="mt-4 inline-block text-xs font-semibold text-emerald-600 dark:text-[#10B981] underline"
          >
            Click here if not redirected
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-[#ECEDEE]">
              New password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-11 text-sm text-slate-900 outline-none ring-emerald-500/30 transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-[#ECEDEE] dark:placeholder:text-[#8E9B94]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-[#8E9B94] dark:hover:text-[#10B981]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-[#ECEDEE]">
              Confirm new password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-emerald-500/30 transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-[#ECEDEE] dark:placeholder:text-[#8E9B94]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 dark:bg-[#10B981] dark:hover:bg-[#0ea57e] dark:text-[#090B0A] font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? "Updating Password..." : "Update Password"}
          </button>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-[#8E9B94] dark:hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900 dark:bg-[#090B0A] dark:text-[#ECEDEE] antialiased">
      <Suspense fallback={<div className="text-xs text-[#8E9B94]">Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
