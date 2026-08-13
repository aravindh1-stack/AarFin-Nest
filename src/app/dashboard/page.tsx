"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabase/client";
import { 
  TrendingUp, 
  Users, 
  Layers, 
  WalletCards, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Plus
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [batchesCount, setBatchesCount] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    const { data: bData } = await supabase.from('batches').select('*');
    const { data: cData } = await supabase.from('customers').select('*');

    if (bData && Array.isArray(bData)) setBatchesCount(bData.length);
    if (cData && Array.isArray(cData)) setCustomersCount(cData.length);

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <Sidebar />
      <Header title="Financial Command Center Dashboard" subtitle="Live Supabase Telemetry & Real-Time Portfolio Performance" />

      <main className="ml-64 p-6 space-y-6">
        {/* Bento Grid Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border glass-panel flex flex-col justify-between" style={{ borderColor: "var(--border-color)" }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold opacity-70">Active Scheme Batches</p>
                <h3 className="text-2xl font-black mt-1">{loading ? "..." : batchesCount}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0F766E]/20 text-[#10B981] border border-[#0F766E]/30">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] opacity-60 mt-3 font-mono">Synced from public.batches</p>
          </div>

          <div className="p-5 rounded-2xl border glass-panel flex flex-col justify-between" style={{ borderColor: "var(--border-color)" }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold opacity-70">Registered Customers</p>
                <h3 className="text-2xl font-black mt-1">{loading ? "..." : customersCount}</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] opacity-60 mt-3 font-mono">Synced from public.customers</p>
          </div>

          <div className="p-5 rounded-2xl border glass-panel flex flex-col justify-between" style={{ borderColor: "var(--border-color)" }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold opacity-70">Today's Total Collections</p>
                <h3 className="text-2xl font-black text-emerald-500 mt-1">₹0</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] opacity-60 mt-3 font-mono">Atomic FIFO Payments</p>
          </div>

          <div className="p-5 rounded-2xl border glass-panel flex flex-col justify-between" style={{ borderColor: "var(--border-color)" }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold opacity-70">Active Route Groups</p>
                <h3 className="text-2xl font-black text-amber-500 mt-1">0</h3>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <WalletCards className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[11px] opacity-60 mt-3 font-mono">Geographical Routes</p>
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="p-6 rounded-2xl border glass-panel space-y-4" style={{ borderColor: "var(--border-color)" }}>
          <h3 className="text-base font-bold">Quick Command Center Actions</h3>
          <div className="grid grid-cols-3 gap-4">
            <Link href="/batches" className="p-4 rounded-xl border hover:border-[#0F766E] transition-all flex items-center justify-between" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5 text-[#10B981]" />
                <div>
                  <p className="font-bold text-xs">Create Scheme Batch</p>
                  <p className="text-[10px] opacity-60">Add Seetu or Kandhu Schemes</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 opacity-50" />
            </Link>

            <Link href="/customers" className="p-4 rounded-xl border hover:border-[#0F766E] transition-all flex items-center justify-between" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-bold text-xs">Enroll Customer</p>
                  <p className="text-[10px] opacity-60">Register member profiles & routes</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 opacity-50" />
            </Link>

            <Link href="/collections" className="p-4 rounded-xl border hover:border-[#0F766E] transition-all flex items-center justify-between" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-bold text-xs">Field Collections</p>
                  <p className="text-[10px] opacity-60">Execute atomic FIFO payments</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 opacity-50" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
