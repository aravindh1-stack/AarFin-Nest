"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { initialAuditLogs } from "@/lib/store";
import { ShieldCheck } from "lucide-react";

export default function AuditPage() {
  const [auditLogs] = useState(initialAuditLogs);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <Sidebar />
      <Header title="Admin Audit Trail & System Security Logs" subtitle="Track Sensitive Administrative Actions & RPC Execution History" />

      <main className="ml-64 p-6 space-y-6">
        {/* Banner */}
        <div className="border rounded-2xl p-5 flex items-center justify-between shadow-sm" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold">Immutable Audit Logging Active</h2>
              <p className="text-xs opacity-75">All payment alterations, batch overrides, and ledger updates are permanently indexed.</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-500 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            SECURITY_LEVEL: HIGH
          </span>
        </div>

        {/* Audit Logs Table */}
        <div className="p-5 rounded-2xl border glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Recent Admin Activity Log</h3>
            <span className="text-xs opacity-75">Realtime Trail</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase tracking-wider text-[10px] border-b" style={{ borderColor: "var(--border-color)" }}>
                <tr>
                  <th className="py-3.5 px-4">Log ID</th>
                  <th className="py-3.5 px-4">Action Event</th>
                  <th className="py-3.5 px-4">Entity Type</th>
                  <th className="py-3.5 px-4">Entity Target ID</th>
                  <th className="py-3.5 px-4">Details JSON Payload</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono" style={{ borderColor: "var(--border-color)" }}>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-emerald-500/5 transition-colors">
                    <td className="py-3.5 px-4 opacity-75">{log.id}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-500">{log.action}</td>
                    <td className="py-3.5 px-4 opacity-85">
                      <span className="px-2 py-0.5 rounded text-[10px] border" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                        {log.entity_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{log.entity_id}</td>
                    <td className="py-3.5 px-4 opacity-70 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="py-3.5 px-4 text-right opacity-60">
                      {new Date(log.created_at).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
