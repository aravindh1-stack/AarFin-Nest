"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { BrandLogo } from "@/components/brand-logo";
import {
  ShieldAlert,
  MailCheck,
  CheckCircle2,
  X,
  Send,
  KeyRound,
  RotateCcw,
  Sparkles,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const errorParam = searchParams.get("error");
  const emailParam = searchParams.get("email") || "";
  const nameParam = searchParams.get("name") || "";
  const messageParam = searchParams.get("message");
  const verifiedParam = searchParams.get("verified");
  const resetParam = searchParams.get("reset");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState("");
  const [forgotErrorMessage, setForgotErrorMessage] = useState("");

  // Resend verification state
  const [resendingVerification, setResendingVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }

    if (errorParam === "PENDING_APPROVAL") {
      setErrorMessage("");
    } else if (errorParam === "UNVERIFIED_EMAIL") {
      setUnverifiedEmail(emailParam);
    } else if (messageParam) {
      setErrorMessage(decodeURIComponent(messageParam));
    }
  }, [errorParam, emailParam, messageParam]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setUnverifiedEmail(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.user) {
          const role = (data.user.role || "").toUpperCase();
          const target = role.includes("FIELD") ? "/dashboard/collections" : "/dashboard";
          router.push(target);
        } else {
          router.push("/dashboard");
        }
      } else if (data.errorCode === "UNVERIFIED_EMAIL") {
        setUnverifiedEmail(data.email || email);
        setErrorMessage("");
        setLoading(false);
      } else {
        setErrorMessage(data.message || "Incorrect email or password");
        setLoading(false);
      }
    } catch {
      setErrorMessage("Network error while connecting to authentication service");
      setLoading(false);
    }
  };

  const handleResendVerification = async (targetEmail: string) => {
    if (!targetEmail) {
      setResendStatus("Please enter your email address first.");
      return;
    }

    setResendingVerification(true);
    setResendStatus(null);

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResendStatus(data.message || "Verification link dispatched! Please check your inbox or spam folder.");
      } else {
        setResendStatus(data.message || "Failed to resend verification link.");
      }
    } catch {
      setResendStatus("Network error sending verification link.");
    } finally {
      setResendingVerification(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotErrorMessage("");
    setForgotSuccessMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setForgotSuccessMessage(
          data.message || "Password reset instructions have been dispatched to your email."
        );
      } else {
        setForgotErrorMessage(data.message || "Unable to send password reset email.");
      }
    } catch {
      setForgotErrorMessage("Network error sending password reset link.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Mobile Brand Header */}
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

      {/* 1. Verified Email Success Banner */}
      {verifiedParam === "true" && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-[#10B981]">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Email Verified Successfully!</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600 dark:text-[#8E9B94]">
            Your email is now activated. Sign in below with your credentials to access your dashboard.
          </p>
        </div>
      )}

      {/* 2. Password Reset Success Banner */}
      {resetParam === "success" && (
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-[#10B981]">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Password Reset Completed</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600 dark:text-[#8E9B94]">
            Your password was updated successfully. Enter your new credentials to sign in.
          </p>
        </div>
      )}

      {/* 3. Account Not Authorized / Enrolled (Google allowlist gate) */}
      {errorParam === "PENDING_APPROVAL" && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-[#141512] p-4 text-xs shadow-lg dark:border-amber-500/40">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-amber-300">Account Not Authorized / Enrolled</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#8E9B94]">
                Google account <span className="font-mono text-white">{emailParam || "provided"}</span> is authenticated, but not enrolled in the organization allowlist for this tenant.
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Contact your Head Office administrator to approve your email and assign your role.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <a
                  href="/api/auth/google"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#1F2623] bg-[#121614] px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/5 hover:border-emerald-500/40"
                >
                  <RotateCcw className="h-3 w-3 text-[#10B981]" />
                  <span>Switch Account</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Unverified Email Banner with Resend Button */}
      {(errorParam === "UNVERIFIED_EMAIL" || unverifiedEmail) && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-[#141512] p-4 text-xs shadow-lg dark:border-amber-500/40">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <MailCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-amber-300">Email Not Verified</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#8E9B94]">
                Your account is registered but requires email confirmation before accessing ledgers.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => handleResendVerification(unverifiedEmail || emailParam || email)}
                  disabled={resendingVerification}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-500 dark:bg-[#10B981] dark:text-[#090B0A] dark:hover:bg-[#0ea57e] cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-3 w-3" />
                  <span>{resendingVerification ? "Sending Link..." : "Resend Verification Link"}</span>
                </button>
              </div>
              {resendStatus && (
                <p className="mt-2 text-[10px] text-emerald-400 font-semibold">{resendStatus}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Generic Error Message */}
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
          or email credentials
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
            <button
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setIsForgotModalOpen(true);
              }}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-[#10B981] dark:hover:text-emerald-400 cursor-pointer"
            >
              Forgot password?
            </button>
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
          className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 dark:bg-[#10B981] dark:hover:bg-[#0ea57e] dark:text-[#090B0A] font-bold cursor-pointer disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Sign In with Credentials"}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-slate-500 dark:text-[#8E9B94]">
        Secured by NexFix Multi-Tenant Access Engine
      </p>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#1F2623] dark:bg-[#121614] sm:p-7">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1F2623]">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#10B981]">
                  <KeyRound className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Reset Password via Email
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotSuccessMessage("");
                  setForgotErrorMessage("");
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {forgotSuccessMessage ? (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600 dark:text-[#10B981] mb-2" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Reset Link Dispatched
                </p>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-[#8E9B94]">
                  {forgotSuccessMessage}
                </p>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="mt-4 w-full rounded-xl border border-[#1F2623] bg-white/5 py-2 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="mt-4 space-y-4">
                <p className="text-xs text-slate-600 dark:text-[#8E9B94] leading-relaxed">
                  Enter your work email address. We will send you a secure, time-limited link to set a new password.
                </p>

                {forgotErrorMessage && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
                    {forgotErrorMessage}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-[#ECEDEE]">
                    Account Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@branch.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none ring-emerald-500/30 transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-[#ECEDEE] dark:placeholder:text-[#8E9B94]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-[#1F2623] dark:text-[#8E9B94] dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 dark:bg-[#10B981] dark:text-[#090B0A] dark:hover:bg-[#0ea57e] disabled:opacity-50 cursor-pointer"
                  >
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
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
