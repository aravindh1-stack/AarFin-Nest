"use client";

import { useState, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { initialCustomers, initialBatches, initialGroups, initialInstallments } from "@/lib/store";
import { Customer, LateJoinerPolicy, Installment } from "@/lib/types";
import { UserPlus, Phone, Search, X, CheckCircle2, Calendar, Sparkles, AlertCircle, FileText } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [installments, setInstallments] = useState<Installment[]>(initialInstallments);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Customer Personal Details Form State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [altPhoneNumber, setAltPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [idProof, setIdProof] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  // Batch & Group Selection Form State
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatches[0].id);
  const [selectedGroupId, setSelectedGroupId] = useState(initialGroups[0]?.id || "");
  const [joiningDate, setJoiningDate] = useState("2026-08-15");
  const [lateJoinerPolicy, setLateJoinerPolicy] = useState<LateJoinerPolicy>("START_FROM_JOIN_DATE");

  // Filter groups dynamically based on selected batch
  const availableGroups = useMemo(() => {
    return initialGroups.filter((g) => g.batch_id === selectedBatchId);
  }, [selectedBatchId]);

  // Selected batch object
  const currentBatch = useMemo(() => {
    return initialBatches.find((b) => b.id === selectedBatchId) || initialBatches[0];
  }, [selectedBatchId]);

  // COMPUTED LIVE INSTALLMENT SCHEDULE PREVIEW
  const computedSchedulePreview = useMemo(() => {
    if (!currentBatch) return [];

    const previewList: { cycleNumber: number; dueDate: string; amount: number; status: string }[] = [];
    const totalCycles = currentBatch.total_cycles;
    const amount = currentBatch.installment_amount;
    const freq = currentBatch.frequency_type;

    let startDateObj = new Date(joiningDate || currentBatch.start_date);
    const batchStartObj = new Date(currentBatch.start_date);

    for (let i = 1; i <= totalCycles; i++) {
      let cycleDate = new Date(startDateObj);

      if (freq === "DAILY") {
        cycleDate.setDate(cycleDate.getDate() + (i - 1));
      } else if (freq === "WEEKLY") {
        cycleDate.setDate(cycleDate.getDate() + ((i - 1) * 7));
      } else if (freq === "MONTHLY") {
        cycleDate.setMonth(cycleDate.getMonth() + (i - 1));
      }

      const formattedDueDate = cycleDate.toISOString().split("T")[0];
      let initialStatus = "UPCOMING";

      // Apply Late Joiner Policy logic
      if (cycleDate < new Date()) {
        if (lateJoinerPolicy === "CARRY_PREVIOUS_PENDING") {
          initialStatus = "PENDING";
        } else if (lateJoinerPolicy === "SKIP_PREVIOUS_DISALLOWED") {
          initialStatus = "SKIPPED";
        }
      }

      previewList.push({
        cycleNumber: i,
        dueDate: formattedDueDate,
        amount: amount,
        status: initialStatus
      });
    }

    return previewList;
  }, [currentBatch, joiningDate, lateJoinerPolicy]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone_number.includes(searchQuery)
  );

  const handleConfirmEnrollment = (e: React.FormEvent) => {
    e.preventDefault();

    const newCustomerId = `c${Date.now()}`;
    const newCustomerCode = `CUST-00${customers.length + 1}`;

    const newCust: Customer = {
      id: newCustomerId,
      customer_code: newCustomerCode,
      full_name: fullName,
      phone_number: phoneNumber,
      alt_phone_number: altPhoneNumber,
      address: address,
      id_proof_number: idProof,
      internal_notes: internalNotes,
      status: "ACTIVE",
      total_paid: 0,
      pending_dues: computedSchedulePreview.filter(s => s.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0),
      created_at: new Date().toISOString()
    };

    // Bulk-Insert Schedule Rows into Installments
    const newInstallments: Installment[] = computedSchedulePreview.map((item) => ({
      id: `inst-${newCustomerId}-${item.cycleNumber}`,
      customer_id: newCustomerId,
      batch_id: selectedBatchId,
      installment_number: item.cycleNumber,
      due_date: item.dueDate,
      amount: item.amount,
      paid_amount: 0,
      balance_amount: item.status === 'SKIPPED' ? 0 : item.amount,
      status: item.status as any,
      customer_name: fullName,
      batch_name: currentBatch?.batch_name
    }));

    setCustomers([newCust, ...customers]);
    setInstallments([...newInstallments, ...installments]);

    setIsModalOpen(false);
    setNotification(`Customer '${fullName}' registered! ${computedSchedulePreview.length} cycle installment rows created.`);
    setTimeout(() => setNotification(null), 6000);

    // Reset Form
    setFullName("");
    setPhoneNumber("");
    setAltPhoneNumber("");
    setAddress("");
    setIdProof("");
    setInternalNotes("");
  };

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <Sidebar />
      <Header title="Customer Directory & Enrollment" subtitle="Register Members, Assign Route Groups & Preview Installment Schedules" />

      <main className="ml-64 p-6 space-y-6">
        {notification && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-4 rounded-xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-semibold">{notification}</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono text-emerald-500">ENROLLMENT_SUCCESS</span>
          </div>
        )}

        {/* Actions & Search Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 opacity-50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Member Name, Phone or Code..."
              className="w-full border rounded-xl text-xs pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0F766E]"
              style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register & Enroll Customer</span>
          </button>
        </div>

        {/* High Density Table for Customer Profiles */}
        <div className="rounded-2xl border glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase tracking-wider text-[10px] border-b" style={{ borderColor: "var(--border-color)" }}>
                <tr>
                  <th className="py-3.5 px-4">Customer Code</th>
                  <th className="py-3.5 px-4">Member Name</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Address / Notes</th>
                  <th className="py-3.5 px-4">Total Contributions</th>
                  <th className="py-3.5 px-4">Pending Dues</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-emerald-500/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-500">{cust.customer_code}</td>
                    <td className="py-3.5 px-4 font-semibold">{cust.full_name}</td>
                    <td className="py-3.5 px-4 opacity-80 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 opacity-60" />
                      <span>{cust.phone_number}</span>
                    </td>
                    <td className="py-3.5 px-4 opacity-70 max-w-xs truncate">{cust.address || cust.internal_notes || "N/A"}</td>
                    <td className="py-3.5 px-4 font-bold">₹{(cust.total_paid || 0).toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-500">
                      {cust.pending_dues ? `₹${cust.pending_dues.toLocaleString("en-IN")}` : "₹0 (Clean)"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          cust.status === "ACTIVE"
                            ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Register Customer & Live Schedule Preview Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div 
              className="border rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
            >
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
                <div>
                  <h3 className="text-base font-bold">Register Customer & Enroll Batch Schedule</h3>
                  <p className="text-xs opacity-70">Complete personal details & review computed live installment schedule preview</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="opacity-70 hover:opacity-100 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmEnrollment} className="space-y-5 text-xs font-sans">
                {/* 1. Personal Details Section */}
                <div className="space-y-3">
                  <h4 className="font-bold text-emerald-500 text-xs uppercase tracking-wider">1. Customer Personal Details</h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Full Customer Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. S. Murugesan"
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Mobile Number</label>
                      <input
                        type="text"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 98421 00000"
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Alternate Mobile</label>
                      <input
                        type="text"
                        value={altPhoneNumber}
                        onChange={(e) => setAltPhoneNumber(e.target.value)}
                        placeholder="Landline / Alt Phone"
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Address / Route Reference</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Residential or shop address"
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Internal Admin Notes</label>
                      <input
                        type="text"
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        placeholder="Special instructions or credit rating"
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Scheme Batch & Group Selection */}
                <div className="space-y-3 pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
                  <h4 className="font-bold text-emerald-500 text-xs uppercase tracking-wider">2. Scheme Batch & Policy Configuration</h4>

                  <div className="grid grid-cols-3 gap-4">
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
                            {b.batch_name} (₹{b.installment_amount} / {b.frequency_type})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Dynamically Filtered Group</label>
                      <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      >
                        {availableGroups.length > 0 ? (
                          availableGroups.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.group_name} ({g.group_code})
                            </option>
                          ))
                        ) : (
                          <option value="">General Route Group</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Joining / Schedule Start Date</label>
                      <input
                        type="date"
                        required
                        value={joiningDate}
                        onChange={(e) => setJoiningDate(e.target.value)}
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Late Joiner / Pending Installment Policy</label>
                    <div className="grid grid-cols-3 gap-3">
                      <label 
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          lateJoinerPolicy === "CARRY_PREVIOUS_PENDING" ? "border-emerald-500 bg-emerald-500/10 font-bold" : "opacity-80"
                        }`}
                        style={{ backgroundColor: lateJoinerPolicy === "CARRY_PREVIOUS_PENDING" ? undefined : "var(--input-bg)", borderColor: lateJoinerPolicy === "CARRY_PREVIOUS_PENDING" ? undefined : "var(--border-color)" }}
                      >
                        <input
                          type="radio"
                          name="policy"
                          checked={lateJoinerPolicy === "CARRY_PREVIOUS_PENDING"}
                          onChange={() => setLateJoinerPolicy("CARRY_PREVIOUS_PENDING")}
                          className="mr-2"
                        />
                        <span>Option A: Carry Previous Pending</span>
                        <p className="text-[10px] opacity-60 font-normal mt-1">Carries missed past cycles as active pending dues.</p>
                      </label>

                      <label 
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          lateJoinerPolicy === "SKIP_PREVIOUS_DISALLOWED" ? "border-emerald-500 bg-emerald-500/10 font-bold" : "opacity-80"
                        }`}
                        style={{ backgroundColor: lateJoinerPolicy === "SKIP_PREVIOUS_DISALLOWED" ? undefined : "var(--input-bg)", borderColor: lateJoinerPolicy === "SKIP_PREVIOUS_DISALLOWED" ? undefined : "var(--border-color)" }}
                      >
                        <input
                          type="radio"
                          name="policy"
                          checked={lateJoinerPolicy === "SKIP_PREVIOUS_DISALLOWED"}
                          onChange={() => setLateJoinerPolicy("SKIP_PREVIOUS_DISALLOWED")}
                          className="mr-2"
                        />
                        <span>Option B: Skip Previous Disallowed</span>
                        <p className="text-[10px] opacity-60 font-normal mt-1">Marks past cycles as skipped (₹0 balance), starts from joining date.</p>
                      </label>

                      <label 
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          lateJoinerPolicy === "START_FROM_JOIN_DATE" ? "border-emerald-500 bg-emerald-500/10 font-bold" : "opacity-80"
                        }`}
                        style={{ backgroundColor: lateJoinerPolicy === "START_FROM_JOIN_DATE" ? undefined : "var(--input-bg)", borderColor: lateJoinerPolicy === "START_FROM_JOIN_DATE" ? undefined : "var(--border-color)" }}
                      >
                        <input
                          type="radio"
                          name="policy"
                          checked={lateJoinerPolicy === "START_FROM_JOIN_DATE"}
                          onChange={() => setLateJoinerPolicy("START_FROM_JOIN_DATE")}
                          className="mr-2"
                        />
                        <span>Option C: Start from Register Date</span>
                        <p className="text-[10px] opacity-60 font-normal mt-1">Computes dynamic schedule strictly from joining date forward.</p>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 3. LIVE AUTOMATED INSTALLMENT SCHEDULE PREVIEW */}
                <div className="space-y-3 pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-emerald-500 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>3. Live Installment Schedule Preview ({computedSchedulePreview.length} Cycles)</span>
                      </h4>
                      <p className="text-[10px] opacity-70">Pre-computed cycle dates based on {currentBatch?.frequency_type} frequency</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-[#0F766E]/20 text-[#10B981] px-2.5 py-1 rounded border border-[#0F766E]/30">
                      Total Commitment: ₹{(computedSchedulePreview.length * (currentBatch?.installment_amount || 0)).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="border rounded-xl overflow-hidden max-h-48 overflow-y-auto" style={{ borderColor: "var(--border-color)" }}>
                    <table className="w-full text-left text-[11px]">
                      <thead className="uppercase tracking-wider text-[9px] border-b sticky top-0" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                        <tr>
                          <th className="py-2 px-3">Cycle #</th>
                          <th className="py-2 px-3">Computed Due Date</th>
                          <th className="py-2 px-3">Amount (₹)</th>
                          <th className="py-2 px-3 text-right">Computed Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                        {computedSchedulePreview.map((item) => (
                          <tr key={item.cycleNumber} className="hover:bg-emerald-500/5">
                            <td className="py-2 px-3 font-bold opacity-80">Cycle #{item.cycleNumber}</td>
                            <td className="py-2 px-3 font-mono">{item.dueDate}</td>
                            <td className="py-2 px-3 font-bold text-emerald-500">₹{item.amount.toLocaleString("en-IN")}</td>
                            <td className="py-2 px-3 text-right">
                              <span 
                                className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  item.status === "PENDING"
                                    ? "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                                    : item.status === "SKIPPED"
                                    ? "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                                    : "bg-blue-500/20 text-blue-500 border border-blue-500/30"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t" style={{ borderColor: "var(--border-color)" }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded-xl font-semibold opacity-80 hover:opacity-100 cursor-pointer"
                    style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Confirm Enrollment & Bulk-Insert Schedule</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
