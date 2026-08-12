"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { initialPayments } from "@/lib/store";
import { Download, Printer } from "lucide-react";

export default function ReportsPage() {
  const [payments] = useState(initialPayments);

  const handleExportCSV = () => {
    alert("Exporting Collection Summary & Ledger to Excel/CSV...");
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <Sidebar />
      <Header title="Financial Reports & Summaries" subtitle="Generate Professional Collection Sheets & Export Ledger Logs" />

      <main className="ml-64 p-6 space-y-6">
        {/* Actions & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Daily Collection Ledger & Exports</h2>
            <p className="text-xs opacity-75">Formal printable audit statements for Seetu and Kandhu schemes</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="border px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 font-semibold transition-all cursor-pointer"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Export CSV / Excel</span>
            </button>
            <button
              onClick={handlePrintPDF}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official PDF Sheet</span>
            </button>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl border glass-panel">
            <p className="text-xs font-medium opacity-75">Total Seetu Collections (Month)</p>
            <h3 className="text-2xl font-bold text-emerald-500 mt-1">₹8,50,000</h3>
            <p className="text-[10px] opacity-60 mt-2">Trichy Gold Seetu Batch A</p>
          </div>
          <div className="p-5 rounded-2xl border glass-panel">
            <p className="text-xs font-medium opacity-75">Total Vaara Kandhu Recovered</p>
            <h3 className="text-2xl font-bold text-blue-500 mt-1">₹3,20,000</h3>
            <p className="text-[10px] opacity-60 mt-2">Coimbatore Vaara Kandhu #12</p>
          </div>
          <div className="p-5 rounded-2xl border glass-panel">
            <p className="text-xs font-medium opacity-75">Total Dhina Kandhu Daily Receipts</p>
            <h3 className="text-2xl font-bold text-amber-500 mt-1">₹14,50,000</h3>
            <p className="text-[10px] opacity-60 mt-2">Madurai Market Dhina Kandhu</p>
          </div>
        </div>

        {/* Official Printable Receipt History Table */}
        <div className="p-5 rounded-2xl border glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Transaction History Receipts Log</h3>
            <span className="text-xs opacity-75">Showing last 24 hours payments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase tracking-wider text-[10px] border-b" style={{ borderColor: "var(--border-color)" }}>
                <tr>
                  <th className="py-3.5 px-4">Receipt No.</th>
                  <th className="py-3.5 px-4">Member Name</th>
                  <th className="py-3.5 px-4">Scheme Batch</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4">Transaction Date</th>
                  <th className="py-3.5 px-4 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-emerald-500/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-500">{p.receipt_no}</td>
                    <td className="py-3.5 px-4 font-semibold">{p.customer_name}</td>
                    <td className="py-3.5 px-4 opacity-80">{p.batch_name}</td>
                    <td className="py-3.5 px-4 opacity-75">
                      <span className="px-2 py-0.5 rounded text-[10px] border font-semibold" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                        {p.payment_method}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-500">₹{p.amount_paid.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4 opacity-70">{new Date(p.payment_date).toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                        VERIFIED
                      </span>
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
