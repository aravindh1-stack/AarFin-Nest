"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@aarfin.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      document.cookie = "aarfin_session=authenticated; path=/; max-age=86400";
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0F766E]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        {/* Brand Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl border shadow-lg mb-4" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md border border-[#0F766E]/30 bg-slate-900 flex items-center justify-center">
              <Image
                src="/aarga-logo.png"
                alt="Aarga Logo"
                width={48}
                height={48}
                className="object-contain p-1"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AarFin</h1>
          <p className="opacity-70 text-sm mt-1">Financial Command Center SaaS Portal</p>
        </div>

        {/* Glassmorphism Login Container */}
        <div className="border rounded-2xl p-8 shadow-xl space-y-6" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Auth Cookie Session</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold mb-2 opacity-80">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 opacity-50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                  placeholder="admin@aarfin.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 opacity-80">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 opacity-50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0F766E] to-[#10B981] text-slate-950 font-bold py-3 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0F766E]/20 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  <span>Enter Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t text-center" style={{ borderColor: "var(--border-color)" }}>
            <p className="text-[11px] opacity-60">
              Authorized Seetu & Kandhu Admin Access Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
