"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { initialCustomers, initialBatches, initialInstallments, initialPayments } from "@/lib/store";
import { Installment, Payment, InstallmentStatus } from "@/lib/types";
import { DollarSign, CheckCircle2, Zap } from "lucide-react";

export default function CollectionsPage() {
  const [installments, setInstallments] = useState<Installment[]>(initialInstallments);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);

  // Form state for FIFO Payment Entry
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomers[0].id);
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatches[0].id);
  const [paymentAmount, setPaymentAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "BANK_TRANSFER">("CASH");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Status Badge Token Map
  const getBadgeStyle = (status: InstallmentStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-rose-500/20 text-rose-500 border-rose-500/30";
      case "PAID":
        return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
      case "UPCOMING":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "SKIPPED":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
      case "PARTIAL":
        return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  // FIFO Payment Execution Simulator (Mirrors PostgreSQL record_payment_with_fifo)
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();

    let remaining = paymentAmount;
    const updatedInstallments = [...installments];
    let allocatedSum = 0;

    const userInstallments = updatedInstallments
      .filter((i) => i.customer_id === selectedCustomerId && i.batch_id === selectedBatchId)
      .sort((a, b) => a.installment_number - b.installment_number);

    for (let inst of userInstallments) {
      if (remaining <= 0) break;
      if (inst.status === "PAID") continue;

      const alloc = Math.min(remaining, inst.balance_amount);
      inst.paid_amount += alloc;
      inst.balance_amount -= alloc;
      inst.status = inst.balance_amount <= 0 ? "PAID" : "PARTIAL";
      inst.paid_date = new Date().toISOString();

      remaining -= alloc;
      allocatedSum += alloc;
    }

    const customer = initialCustomers.find((c) => c.id === selectedCustomerId);
    const batch = initialBatches.find((b) => b.id === selectedBatchId);

    const receiptNo = `REC-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: Payment = {
      id: `p${Date.now()}`,
      receipt_no: receiptNo,
      customer_id: selectedCustomerId,
      batch_id: selectedBatchId,
      enrollment_id: "e1",
      amount_paid: paymentAmount,
      payment_date: new Date().toISOString(),
      payment_method: paymentMethod,
      reference_no: referenceNo,
      notes: notes,
      customer_name: customer?.full_name,
      batch_name: batch?.batch_name
    };

    setInstallments(updatedInstallments);
    setPayments([newPayment, ...payments]);

    setNotification(`Payment Recorded Successfully! Receipt: ${receiptNo}. ₹${allocatedSum} Allocated via FIFO.`);
    setTimeout(() => setNotification(null), 6000);
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <Sidebar />
      <Header title="Collections Hub & FIFO Engine" subtitle="Record Payments & Auto-Allocate Dues via Ascending FIFO Engine" />

      <main className="ml-64 p-6 space-y-6">
        {notification && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-4 rounded-xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-semibold">{notification}</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono text-emerald-500">RPC EXEC_SUCCESS</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FIFO Payment Input Panel (Span 1) */}
          <div className="p-6 rounded-2xl border glass-panel space-y-4">
            <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>FIFO Payment Recorder</span>
            </div>
            <p className="text-xs opacity-75">
              Allocates incoming payments automatically to oldest pending installments first without creating duplicate overdues.
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 opacity-80">Select Customer</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                >
                  {initialCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} ({c.customer_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80">Select Scheme Batch</label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                >
                  {initialBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batch_name} (Cycle ₹{b.installment_amount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80">Amount Collected (₹)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full border rounded-xl px-3.5 py-2.5 font-bold text-emerald-500 text-sm focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 opacity-80">Payment Mode</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                    style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 opacity-80">Reference No.</label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="UPI/UTR No."
                    className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                    style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80">Collection Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Received at shop route"
                  className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#0F766E] to-[#10B981] text-slate-950 font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Execute FIFO Allocation Engine</span>
              </button>
            </form>
          </div>

          {/* Ledger Table & Installments Status (Span 2) */}
          <div className="lg:col-span-2 p-6 rounded-2xl border glass-panel space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Live Cycle Installment Ledger</h3>
                <p className="text-xs opacity-75">High Density Ledger with Token Status Badges</p>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30">PENDING</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">PAID</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">PARTIAL</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="uppercase tracking-wider text-[10px] border-b" style={{ borderColor: "var(--border-color)" }}>
                  <tr>
                    <th className="py-3 px-3">Cycle #</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Paid Amount</th>
                    <th className="py-3 px-3">Balance Dues</th>
                    <th className="py-3 px-3 text-right">Status Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                  {installments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-emerald-500/5 transition-colors">
                      <td className="py-3 px-3 font-bold opacity-90">Cycle #{inst.installment_number}</td>
                      <td className="py-3 px-3 font-semibold">{inst.customer_name}</td>
                      <td className="py-3 px-3 opacity-75">{inst.due_date}</td>
                      <td className="py-3 px-3 font-semibold">₹{inst.amount.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 font-bold text-emerald-500">₹{inst.paid_amount.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 font-bold text-rose-500">₹{inst.balance_amount.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeStyle(inst.status)}`}>
                          {inst.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
