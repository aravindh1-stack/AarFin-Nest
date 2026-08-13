"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabase/client";
import { AuditLog } from "@/lib/types";
import { ShieldCheck, Clock, User, CheckCircle2 } from "lucide-react";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      const res = await supabase.from('admin_audit_logs').select('*');
      if (res && res.data && Array.isArray(res.data)) {
        setLogs(res.data);
      } else {
        setLogs([]);
      }
      setLoading(false);
    };
    fetchAuditLogs();
  }, []);

  const safeLogs = Array.isArray(logs) ? logs : [];

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <Sidebar />
      <Header title="Admin Audit & System Security Logs" subtitle="Immutable Transaction Logs & Admin Activity Tracking via Supabase" />

      <main className="ml-64 p-6 space-y-6">
        <div className="rounded-2xl border glass-panel overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border-color)" }}>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>System Audit Logs (public.admin_audit_logs)</span>
            </h3>
            <span className="text-xs font-mono font-bold opacity-60">{safeLogs.length} Events Recorded</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs opacity-70 font-mono">Querying audit trail from Supabase DB...</div>
          ) : safeLogs.length === 0 ? (
            <div className="p-12 text-center text-xs opacity-60">No audit events currently recorded in database. Actions performed by admins will appear here.</div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
              {safeLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-emerald-500/5 transition-colors text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#0F766E]/20 text-[#10B981] border border-[#0F766E]/30">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{log.action}</p>
                      <p className="opacity-70 font-mono text-[11px]">Entity: {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ""}</p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                      SUCCESS
                    </span>
                    <p className="opacity-60 font-mono text-[10px]">{new Date(log.created_at).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
