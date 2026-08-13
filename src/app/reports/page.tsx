"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabase/client";
import { Payment } from "@/lib/types";
import { FileText, Printer, DollarSign } from "lucide-react";

export default function ReportsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMethod, setFilterMethod] = useState("ALL");

  useEffect(() => {
    const fetchReportsData = async () => {
      setLoading(true);
      const res = await supabase.from('payments').select('*');
      if (res && res.data && Array.isArray(res.data)) {
        setPayments(res.data);
      } else {
        setPayments([]);
      }
      setLoading(false);
    };
    fetchReportsData();
  }, []);

  const safePayments = Array.isArray(payments) ? payments : [];

  const filteredPayments = safePayments.filter((p: Payment) => {
    if (!p) return false;
    if (filterMethod === "ALL") return true;
    return p.payment_method === filterMethod;
  });

  const totalCollected = filteredPayments.reduce((acc: number, curr: Payment) => acc + (curr?.amount_paid || 0), 0);

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <Sidebar />
      <Header title="Financial Reports & Daily Collection Sheet" subtitle="Generate & Export Printable Payment Ledgers directly from Supabase DB" />

      <main className="ml-64 p-6 space-y-6">
        {/* Actions & Summary Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#0F766E]/20 text-[#10B981] border border-[#0F766E]/30">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs opacity-70 font-semibold">Total Collections (Selected Filter)</p>
              <h3 className="text-2xl font-black text-emerald-500">₹{totalCollected.toLocaleString("en-IN")}</h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="border rounded-xl text-xs font-semibold px-3 py-2 focus:outline-none focus:border-[#0F766E]"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
            >
              <option value="ALL">All Payment Methods</option>
              <option value="CASH">Cash Only</option>
              <option value="UPI">UPI / PhonePe</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>

            <button
              onClick={() => window.print()}
              className="bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Collection Sheet</span>
            </button>
          </div>
        </div>

        {/* Payments Table */}
        <div className="rounded-2xl border glass-panel overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border-color)" }}>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Receipt Ledger (Supabase DB Query)</span>
            </h3>
            <span className="text-xs font-mono font-bold opacity-60">{filteredPayments.length} Transactions</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs opacity-70 font-mono">Querying transactions from Supabase...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-xs opacity-60">No payment receipts found in database for the selected filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="uppercase tracking-wider text-[10px] border-b" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                  <tr>
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Scheme Batch</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-emerald-500/5">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-500">{p.receipt_no}</td>
                      <td className="py-3 px-4 font-semibold">{p.customer_name || "Member"}</td>
                      <td className="py-3 px-4 opacity-80">{p.batch_name || "Scheme Batch"}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0F766E]/20 text-[#10B981] border border-[#0F766E]/30">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono opacity-70">{new Date(p.payment_date).toLocaleDateString("en-IN")}</td>
                      <td className="py-3 px-4 font-bold text-emerald-500 text-right">₹{(p.amount_paid || 0).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
