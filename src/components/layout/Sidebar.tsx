"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  WalletCards, 
  FileText, 
  ShieldCheck, 
  LogOut, 
  MapPin,
  ChevronDown
} from "lucide-react";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isBatchesOpen, setIsBatchesOpen] = useState(
    pathname.startsWith("/batches") || pathname.startsWith("/groups")
  );

  return (
    <aside 
      className="w-64 border-r flex flex-col justify-between h-screen fixed left-0 top-0 z-40 transition-colors duration-300 font-sans"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--border-color)",
        color: "var(--text-main)"
      }}
    >
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md border border-[#0F766E]/30 bg-slate-900 flex items-center justify-center">
              <Image
                src="/aarga-logo.png"
                alt="Aarga Logo"
                width={40}
                height={40}
                className="object-contain p-1"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-lg tracking-tight">AarFin</h1>
                <span className="text-[10px] font-semibold bg-[#0F766E]/20 text-[#10B981] px-1.5 py-0.5 rounded border border-[#0F766E]/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] opacity-70 font-medium">Command Center SaaS</p>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Menu */}
        <nav className="p-3 space-y-1.5 mt-2">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              pathname === "/dashboard"
                ? "bg-[#0F766E]/15 text-[#10B981] border border-[#0F766E]/30 shadow-sm"
                : "opacity-75 hover:opacity-100 hover:bg-emerald-500/10"
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${pathname === "/dashboard" ? "text-[#10B981]" : "opacity-70"}`} />
            <span>Dashboard</span>
          </Link>

          {/* Scheme Batches Dropdown Group */}
          <div className="space-y-1">
            <button
              onClick={() => setIsBatchesOpen(!isBatchesOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                pathname.startsWith("/batches") || pathname.startsWith("/groups")
                  ? "bg-[#0F766E]/10 text-[#10B981]"
                  : "opacity-75 hover:opacity-100 hover:bg-emerald-500/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-[#10B981]" />
                <span>Scheme Batches</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isBatchesOpen ? "rotate-180" : ""}`} />
            </button>

            {isBatchesOpen && (
              <div className="pl-8 space-y-1 border-l ml-5 my-1" style={{ borderColor: "var(--border-color)" }}>
                <Link
                  href="/batches"
                  className={`block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/batches" ? "text-[#10B981] font-bold" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  • All Batches
                </Link>
                <Link
                  href="/groups"
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    pathname === "/groups" ? "text-[#10B981] font-bold" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#10B981]" />
                    <span>Collection Groups</span>
                  </div>
                  <span className="text-[9px] bg-[#0F766E]/20 text-[#10B981] px-1.5 py-0.2 rounded font-mono">NEW</span>
                </Link>
              </div>
            )}
          </div>

          {/* Customer Directory */}
          <Link
            href="/customers"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              pathname.startsWith("/customers")
                ? "bg-[#0F766E]/15 text-[#10B981] border border-[#0F766E]/30 shadow-sm"
                : "opacity-75 hover:opacity-100 hover:bg-emerald-500/10"
            }`}
          >
            <Users className={`w-4 h-4 ${pathname.startsWith("/customers") ? "text-[#10B981]" : "opacity-70"}`} />
            <span>Customer Directory</span>
          </Link>

          {/* Collections Hub */}
          <Link
            href="/collections"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              pathname.startsWith("/collections")
                ? "bg-[#0F766E]/15 text-[#10B981] border border-[#0F766E]/30 shadow-sm"
                : "opacity-75 hover:opacity-100 hover:bg-emerald-500/10"
            }`}
          >
            <WalletCards className={`w-4 h-4 ${pathname.startsWith("/collections") ? "text-[#10B981]" : "opacity-70"}`} />
            <span>Collections Hub</span>
          </Link>

          {/* Financial Reports */}
          <Link
            href="/reports"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              pathname.startsWith("/reports")
                ? "bg-[#0F766E]/15 text-[#10B981] border border-[#0F766E]/30 shadow-sm"
                : "opacity-75 hover:opacity-100 hover:bg-emerald-500/10"
            }`}
          >
            <FileText className={`w-4 h-4 ${pathname.startsWith("/reports") ? "text-[#10B981]" : "opacity-70"}`} />
            <span>Financial Reports</span>
          </Link>

          {/* Admin Audit Log */}
          <Link
            href="/audit"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              pathname.startsWith("/audit")
                ? "bg-[#0F766E]/15 text-[#10B981] border border-[#0F766E]/30 shadow-sm"
                : "opacity-75 hover:opacity-100 hover:bg-emerald-500/10"
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${pathname.startsWith("/audit") ? "text-[#10B981]" : "opacity-70"}`} />
            <span>Admin Audit Log</span>
          </Link>
        </nav>
      </div>

      {/* Admin Profile & Theme Toggle Footer */}
      <div className="p-4 border-t space-y-3" style={{ borderColor: "var(--border-color)" }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold opacity-70">Theme Mode</span>
          <ThemeToggle />
        </div>

        <div className="rounded-xl p-3 border flex items-center justify-between" style={{ backgroundColor: "var(--bg-main)", borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E]/20 border border-[#0F766E]/40 flex items-center justify-center font-bold text-xs text-[#10B981]">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate">Super Admin</p>
              <p className="text-[10px] opacity-60 truncate">admin@aarfin.com</p>
            </div>
          </div>
          <Link 
            href="/login"
            className="opacity-70 hover:opacity-100 hover:text-rose-500 p-1 rounded-lg transition-colors"
            title="Logout Admin"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
