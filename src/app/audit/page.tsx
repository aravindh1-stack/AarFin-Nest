"use client";

import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { AuditLog } from "@/lib/types";
import { ShieldCheck, Clock } from "lucide-react";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/audit");
        const data = await res.json();
        if (Array.isArray(data)) setLogs(data);
        else setLogs([]);
      } catch (err) {
        console.error("Backend fetch error in audit page:", err);
      }
      setLoading(false);
    };
    fetchAuditLogs();
  }, []);

  const safeLogs = Array.isArray(logs) ? logs : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#000000] dark:text-slate-100">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <DashboardTopbar
          title="Admin Audit & System Security Logs"
          description="Immutable Transaction Logs & Admin Activity Tracking via Supabase DB"
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm dark:border-slate-800/50 dark:bg-[#121212]/70">
            <div className="flex items-center justify-between border-b border-slate-200/70 p-4 dark:border-slate-800/50">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>System Audit Logs (public.admin_audit_logs)</span>
              </h3>
              <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                {safeLogs.length} Events Recorded
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center font-mono text-xs text-slate-500">
                Querying audit trail from Supabase DB...
              </div>
            ) : safeLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No audit events currently recorded in database. Actions performed by admins will appear here.
              </div>
            ) : (
              <div className="divide-y divide-slate-200/70 dark:divide-slate-800/50">
                {safeLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 text-xs transition hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/10 text-teal-600 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {log.action}
                        </p>
                        <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          Entity: {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-right">
                      <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                        SUCCESS
                      </span>
                      <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(log.created_at).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
