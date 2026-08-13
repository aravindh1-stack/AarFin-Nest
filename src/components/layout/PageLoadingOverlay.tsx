"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { TrendingUp, ShieldCheck, DollarSign } from "lucide-react";

export default function PageLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Whenever route or params change, show smooth full-screen blur loader briefly
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-md transition-all duration-300">
      <div className="relative flex flex-col items-center space-y-4 p-8 rounded-3xl border border-[#0F766E]/40 bg-slate-900/90 shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Pulsing Finance Icon & Logo Glow */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-emerald-500 flex items-center justify-center shadow-lg shadow-[#0F766E]/40 animate-pulse">
          <div className="absolute -inset-1 rounded-2xl bg-[#0F766E]/40 blur-sm animate-ping opacity-75"></div>
          <Image
            src="/aarga-logo.png"
            alt="AarFin Logo"
            width={42}
            height={42}
            className="object-contain relative z-10 p-0.5"
            priority
          />
        </div>

        {/* Animated Telemetry Indicator */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span className="text-sm font-extrabold tracking-tight text-white font-sans">
            AarFin <span className="text-emerald-400 font-mono text-xs">Telemetry Loading...</span>
          </span>
        </div>

        {/* Financial Spinner */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
          <span className="text-[11px] font-mono text-slate-300 font-medium">Securing Telemetry Ledger</span>
        </div>
      </div>
    </div>
  );
}
