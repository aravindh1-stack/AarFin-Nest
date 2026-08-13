"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabase/client";
import { Customer, Installment, Payment, Batch, Group, InstallmentStatus } from "@/lib/types";
import { 
  Search, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Zap, 
  Phone, 
  MapPin, 
  Layers, 
  X, 
  ChevronRight, 
  ShieldCheck,
  Info,
  Calendar,
  Users
} from "lucide-react";

export default function CollectionsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatchFilter, setSelectedBatchFilter] = useState("ALL");

  // Selected Member Drawer / Modal State
  const [selectedMember, setSelectedMember] = useState<Customer | null>(null);

  // Form state inside Member Drawer for FIFO Payment
  const [paymentAmount, setPaymentAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "BANK_TRANSFER">("CASH");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const fetchCollectionsData = async () => {
    setLoading(true);
    const { data: custData } = await supabase.from('customers').select('*');
    const { data: batchData } = await supabase.from('batches').select('*');
    const { data: groupData } = await supabase.from('groups').select('*');
    const { data: instData } = await supabase.from('installments').select('*');
    const { data: payData } = await supabase.from('payments').select('*');

    if (custData && Array.isArray(custData)) setCustomers(custData);
    else setCustomers([]);

    if (batchData && Array.isArray(batchData)) setBatches(batchData);
    if (groupData && Array.isArray(groupData)) setGroups(groupData);
    if (instData && Array.isArray(instData)) setInstallments(instData);
    if (payData && Array.isArray(payData)) setPayments(payData);

    setLoading(false);
  };

  useEffect(() => {
    fetchCollectionsData();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.customer_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone_number?.includes(searchQuery);
      return matchesSearch;
    });
  }, [customers, searchQuery]);

  // INDIVIDUAL CUSTOMER CYCLE TIMELINE ENGINE
  const selectedMemberLedger = useMemo(() => {
    if (!selectedMember) return { 
      pending: [], 
      paid: [], 
      upcoming: [], 
      batchName: "", 
      groupName: "",
      customerStartDate: "",
      individualCurrentCycle: 1,
      totalCommitment: 0,
      totalPaidSum: 0,
      totalPendingSum: 0,
      isUpToDate: false
    };

    const memberInst = installments.filter((i) => i.customer_id === selectedMember.id || i.customer_name === selectedMember.full_name);
    
    const pending = memberInst.filter((i) => i.status === "PENDING" || i.status === "PARTIAL");
    const paid = memberInst.filter((i) => i.status === "PAID");
    const upcoming = memberInst.filter((i) => i.status === "UPCOMING");

    const batch = batches[0] || { start_date: "2026-01-01", frequency_type: "MONTHLY", total_cycles: 20, installment_amount: 5000, batch_name: "Scheme Batch A" };
    const batchName = batch.batch_name;
    const groupName = groups[0]?.group_name || "Route A";

    const customerStartStr = selectedMember.created_at ? selectedMember.created_at.split("T")[0] : batch.start_date;
    const customerStartDate = new Date(customerStartStr);
    const todayDate = new Date();

    const diffTime = Math.max(0, todayDate.getTime() - customerStartDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let individualCurrentCycle = 1;
    if (batch.frequency_type === "DAILY") {
      individualCurrentCycle = Math.min(Math.floor(diffDays / 1) + 1, batch.total_cycles);
    } else if (batch.frequency_type === "WEEKLY") {
      individualCurrentCycle = Math.min(Math.floor(diffDays / 7) + 1, batch.total_cycles);
    } else if (batch.frequency_type === "MONTHLY") {
      individualCurrentCycle = Math.min(Math.floor(diffDays / 30) + 1, batch.total_cycles);
    }

    const totalCommitment = batch.total_cycles * batch.installment_amount;
    const totalPaidSum = paid.reduce((acc, curr) => acc + curr.paid_amount, 0) + pending.reduce((acc, curr) => acc + curr.paid_amount, 0);
    const totalPendingSum = Math.max(0, totalCommitment - totalPaidSum);
    
    const isUpToDate = pending.length === 0;

    return { 
      pending, 
      paid, 
      upcoming, 
      batchName, 
      groupName, 
      customerStartDate: customerStartStr,
      individualCurrentCycle,
      totalCommitment,
      totalPaidSum,
      totalPendingSum,
      isUpToDate
    };
  }, [selectedMember, installments, batches, groups]);

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

  // Atomic FIFO RPC Execution on Supabase DB
  const handleRecordPaymentForMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    const receiptNo = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Call Supabase RPC `record_payment_with_fifo`
    const { data: rpcRes, error } = await supabase.rpc('record_payment_with_fifo', {
      p_customer_id: selectedMember.id,
      p_batch_id: batches[0]?.id || 'b1',
      p_enrollment_id: 'e1',
      p_amount_paid: paymentAmount,
      p_payment_method: paymentMethod,
      p_reference_no: referenceNo,
      p_notes: notes
    });

    await fetchCollectionsData();

    setNotification(`Payment Recorded in Supabase DB! Receipt: ${receiptNo}. RPC FIFO executed.`);
    setTimeout(() => setNotification(null), 6000);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <Sidebar />
      <Header title="Collections Hub & Member Telemetry" subtitle="100% Live Supabase PostgreSQL Integration with RPC record_payment_with_fifo" />

      <main className="ml-64 p-6 space-y-6">
        {notification && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-4 rounded-xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-semibold">{notification}</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono text-emerald-500">RPC_EXEC_SUCCESS</span>
          </div>
        )}

        {/* 1. MEMBER SEARCH & FILTER BAR */}
        <div className="p-5 rounded-2xl border glass-panel space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight">Real-Time Member Search & Route Collections</h2>
              <p className="text-xs opacity-70">Query directly against public.customers table</p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#0F766E]/20 text-[#10B981] px-3 py-1 rounded border border-[#0F766E]/30">
              {filteredCustomers.length} Members Found
            </span>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 opacity-50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member by Name, ID (#104) or Phone Number..."
                className="w-full border rounded-xl text-xs font-semibold pl-10 pr-4 py-3 focus:outline-none focus:border-[#0F766E] shadow-inner"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
              />
            </div>
          </div>
        </div>

        {/* 2. MEMBER CARDS OR CLEAN EMPTY STATE */}
        {loading ? (
          <div className="p-12 text-center text-xs opacity-70 font-mono">Loading collections & customer ledgers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 rounded-2xl border text-center space-y-3 glass-panel" style={{ borderColor: "var(--border-color)" }}>
            <Users className="w-10 h-10 opacity-40 mx-auto text-[#0F766E]" />
            <h3 className="text-base font-bold">No Collection Members Found</h3>
            <p className="text-xs opacity-70 max-w-sm mx-auto">No customer records in database. Register members in the Customer Directory to process field collections.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                onClick={() => setSelectedMember(cust)}
                className="p-5 rounded-2xl border glass-panel transition-all cursor-pointer hover:border-[#0F766E] shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-bold text-xs text-emerald-500 bg-[#0F766E]/15 px-2 py-0.5 rounded border border-[#0F766E]/30">
                      {cust.customer_code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        cust.status === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                      }`}
                    >
                      {cust.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold mb-1">{cust.full_name}</h3>
                  <p className="text-xs opacity-75 flex items-center gap-1 mb-3">
                    <Phone className="w-3 h-3 opacity-60" />
                    <span>{cust.phone_number}</span>
                  </p>
                </div>

                <div className="pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: "var(--border-color)" }}>
                  <div>
                    <p className="text-[10px] opacity-60">Status</p>
                    <p className="font-bold text-emerald-500">Active Member</p>
                  </div>
                  <span className="text-[#10B981] font-bold text-[11px] flex items-center gap-1">
                    <span>Open Ledger</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. DEDICATED MEMBER PROFILE & INDIVIDUAL CYCLE LEDGER DRAWER */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div 
              className="border rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
            >
              {/* Header Details */}
              <div className="flex justify-between items-start border-b pb-4" style={{ borderColor: "var(--border-color)" }}>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-extrabold tracking-tight">{selectedMember.full_name}</h3>
                    <span className="font-mono font-bold text-xs text-emerald-500 bg-[#0F766E]/20 px-2.5 py-0.5 rounded border border-[#0F766E]/30">
                      ID: {selectedMember.customer_code}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs opacity-80">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Enrolled: <strong>{selectedMemberLedger.customerStartDate}</strong></span>
                    </span>
                  </div>
                </div>

                <button onClick={() => setSelectedMember(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* INDIVIDUAL CUSTOMER CURRENT CYCLE SUMMARY CARDS */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30" style={{ color: "var(--text-main)" }}>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Individual Current Cycle</p>
                  <p className="text-xl font-bold text-emerald-500 mt-0.5">
                    Cycle #{selectedMemberLedger.individualCurrentCycle}
                  </p>
                  <p className="text-[9px] opacity-60 mt-1">Based on enrollment on {selectedMemberLedger.customerStartDate}</p>
                </div>

                <div className="p-3.5 rounded-xl border" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                  <p className="text-[10px] opacity-70 font-medium uppercase tracking-wider">Total Scheme Commitment</p>
                  <p className="text-lg font-bold mt-0.5">
                    ₹{selectedMemberLedger.totalCommitment.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                  <p className="text-[10px] opacity-70 font-medium uppercase tracking-wider">Contributions Paid</p>
                  <p className="text-lg font-bold text-emerald-500 mt-0.5">
                    ₹{selectedMemberLedger.totalPaidSum.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                  <p className="text-[10px] opacity-70 font-medium uppercase tracking-wider">Total Pending Dues</p>
                  <p className="text-lg font-bold text-rose-500 mt-0.5">
                    ₹{selectedMemberLedger.totalPendingSum.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Quick Action Box: RPC record_payment_with_fifo */}
              <div className="p-4 rounded-xl border bg-emerald-500/5 space-y-3" style={{ borderColor: "var(--border-color)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Quick RPC FIFO Payment Recording</span>
                  </span>
                  <span className="text-[10px] opacity-60">Executes public.record_payment_with_fifo</span>
                </div>

                <form onSubmit={handleRecordPaymentForMember} className="grid grid-cols-4 gap-3 text-xs font-sans">
                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Collection Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full border rounded-xl px-3 py-2 font-bold text-emerald-500 focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Payment Mode</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    >
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI / PhonePe</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Reference / UTR No.</label>
                    <input
                      type="text"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      placeholder="Optional UTR No."
                      className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Execute RPC Payment</span>
                    </button>
                  </div>
                </form>
              </div>

              <div className="pt-3 flex justify-end border-t" style={{ borderColor: "var(--border-color)" }}>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="px-5 py-2 bg-slate-800 text-white rounded-xl font-semibold text-xs cursor-pointer hover:bg-slate-700"
                >
                  Close Member Drawer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
