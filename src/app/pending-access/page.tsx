"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ShieldAlert, ArrowLeft, LogOut, Mail, RefreshCw } from "lucide-react";

interface PendingUserData {
  email?: string;
  name?: string;
  picture?: string;
  attemptedAt?: string;
}

export default function PendingAccessPage() {
  const [pendingUser, setPendingUser] = useState<PendingUserData | null>(null);

  useEffect(() => {
    // Read pending cookie if present
    const cookies = document.cookie.split(";");
    const pendingCookie = cookies.find((c) => c.trim().startsWith("nexfix_pending="));
    if (pendingCookie) {
      try {
        const val = decodeURIComponent(pendingCookie.split("=")[1]);
        const data = JSON.parse(val);
        setPendingUser(data);
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#090B0A] text-[#ECEDEE] px-4 py-12 antialiased selection:bg-emerald-500/20">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-8 w-auto object-contain" />
            <div className="flex flex-col text-left">
              <span className="text-xl font-black tracking-tight text-white leading-none">
                NexFix
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#10B981] mt-1">
                Financial OS
              </span>
            </div>
          </div>
        </div>

        {/* Security / Access Card */}
        <div className="rounded-2xl border border-[#1F2623] bg-[#121614] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          {/* Status Badge */}
          <div className="mb-5 flex items-center justify-between border-b border-[#1F2623] pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Access Gate Verification
              </span>
            </div>
            <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-300">
              PENDING APPROVAL
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Account Not Authorized
              </h1>
              <p className="mt-1 text-xs leading-relaxed text-[#8E9B94]">
                Your Google account is authenticated, but this email address is not enrolled in the organization allowlist for this tenant.
              </p>
            </div>
          </div>

          {/* Account Details Box */}
          <div className="mt-6 rounded-xl border border-[#1F2623] bg-[#0E1110] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E9B94]">
              Authenticated Identity
            </p>
            <div className="mt-2 flex items-center gap-3">
              {pendingUser?.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pendingUser.picture}
                  alt={pendingUser.name || "User"}
                  className="h-9 w-9 rounded-full border border-[#1F2623]"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-[#10B981] border border-emerald-500/30">
                  <Mail className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">
                  {pendingUser?.name || "Google User"}
                </p>
                <p className="truncate text-xs text-[#8E9B94] font-mono">
                  {pendingUser?.email || "Unknown email"}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-5 space-y-2 text-xs text-[#8E9B94] leading-relaxed">
            <p>
              To access branch ledgers, chit schemes, or collection routes:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-1 text-[11px] text-slate-300">
              <li>Contact your Head Office administrator to add your email to the tenant roster.</li>
              <li>Ensure the admin assigns your designated role (e.g. <span className="text-emerald-400 font-mono">FIELD_OFFICER</span>, <span className="text-emerald-400 font-mono">CASHIER</span>, or <span className="text-emerald-400 font-mono">BRANCH_MANAGER</span>).</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-7 flex flex-col gap-2.5">
            <button
              onClick={() => window.location.reload()}
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1F2623] bg-white/5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10 hover:border-emerald-500/40 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#10B981]" />
              <span>Check Access Again</span>
            </button>

            <a
              href="/api/auth/logout"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/15 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out & Switch Account</span>
            </a>

            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 pt-2 text-[11px] font-semibold text-[#8E9B94] transition hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Return to Login</span>
            </Link>
          </div>
        </div>

        {/* Security Footer Note */}
        <p className="mt-6 text-center text-[11px] text-slate-600">
          NexFix Financial OS · Strict Zero-Trust Organization Boundary
        </p>
      </div>
    </main>
  );
}
