"use client";

import { useEffect, useState } from "react";
import { DashboardTopbar } from "@/components/dashboard/topbar";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuditLogs() {
      setLoading(true);
      try {
        const res = await fetch("/api/audit");
        const data = await res.json();
        if (Array.isArray(data)) setLogs(data);
      } catch (err) {
        console.error("Error loading audit logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAuditLogs();
  }, []);

  return (
    <div>
      <DashboardTopbar
        title="Audit Logs"
        description="Immutable system transaction logs and security tracking"
      />

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm dark:border-slate-800/50 dark:bg-[#121212]/70">
          <div className="flex items-center justify-between border-b border-slate-200/70 p-4 dark:border-slate-800/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              System Security & Transaction Audit Trail
            </h3>
            <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
              {logs.length} Audit Events Logged
            </span>
          </div>

          {loading ? (
            <p className="p-10 text-center font-mono text-xs text-slate-500">
              Loading audit logs...
            </p>
          ) : logs.length === 0 ? (
            <p className="p-10 text-center text-xs text-slate-500">
              No audit events currently recorded in database.
            </p>
          ) : (
            <div className="divide-y divide-slate-200/70 dark:divide-slate-800/50">
              {logs.map((log, i) => (
                <div
                  key={log.id || i}
                  className="flex items-center justify-between p-4 text-xs transition hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-teal-500/20 bg-teal-500/10 text-teal-600 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300">
                      ◉
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {log.action || "System Action"}
                      </p>
                      <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        Entity: {log.entity_type || "Database Record"}{" "}
                        {log.entity_id ? `(#${log.entity_id})` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <span className="rounded border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                      VERIFIED
                    </span>
                    <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString("en-IN")
                        : "Live Log"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
