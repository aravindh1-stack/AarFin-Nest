"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, ArrowLeft } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#090B0A] px-4 text-center text-white">
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
        <WifiOff className="h-10 w-10 animate-pulse" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        No Internet Connection
      </h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-400">
        NexFix is running in offline mode. Cached ledger pages and customer receipts remain accessible, but live payment synchronization requires an active network.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry Connection</span>
        </button>

        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1F2623] bg-[#121614] px-4 py-3 text-sm font-medium text-neutral-300 transition hover:bg-white/[0.04]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>

      <p className="mt-10 font-mono text-[11px] text-neutral-600">
        NexFix Standalone Field Engine • Offline Protocol
      </p>
    </div>
  );
}
