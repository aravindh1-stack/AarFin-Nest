"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabase/client";
import { Customer, Batch, Group, LateJoinerPolicy } from "@/lib/types";
import { UserPlus, Phone, Search, X, CheckCircle2, Sparkles, Users, MapPin, Layers, Eye, Calendar, DollarSign, Edit3, Save } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // View & Edit Member Drawer/Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State for Edit Customer
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Customer Personal Details State (Create)
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [altPhoneNumber, setAltPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [idProof, setIdProof] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  // Batch & Group Dynamic Cascade Selection (Create)
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [lateJoinerPolicy, setLateJoinerPolicy] = useState<LateJoinerPolicy>("START_FROM_JOIN_DATE");

  const [payments, setPayments] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const { data: custData } = await supabase.from('customers').select('*');
    const { data: batchData } = await supabase.from('batches').select('*');
    const { data: groupData } = await supabase.from('groups').select('*');
    const { data: payData } = await supabase.from('payments').select('*');

    if (batchData && Array.isArray(batchData)) {
      setBatches(batchData);
      if (batchData.length > 0 && !selectedBatchId) {
        setSelectedBatchId(batchData[0].id);
      }
    }

    if (groupData && Array.isArray(groupData)) {
      setGroups(groupData);
      const batchGroups = groupData.filter(g => g.batch_id === (batchData?.[0]?.id || ""));
      if (batchGroups.length > 0) {
        setSelectedGroupId(batchGroups[0].id);
      }
    }

    if (payData && Array.isArray(payData)) {
      setPayments(payData);
    }

    if (custData && Array.isArray(custData)) {
      setCustomers(custData);
    } else {
      setCustomers([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openViewMemberModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditName(customer.full_name);
    setEditPhone(customer.phone_number);
    setEditAddress(customer.address || "");
    setEditNotes(customer.internal_notes || "");
    setIsEditMode(false);
  };

  const handleSaveCustomerEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    // Optimistic UI state update
    setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? {
      ...c,
      full_name: editName,
      phone_number: editPhone,
      address: editAddress,
      internal_notes: editNotes
    } : c));

    await supabase.from('customers').update({
      full_name: editName,
      phone_number: editPhone,
      address: editAddress,
      internal_notes: editNotes
    }).eq('id', selectedCustomer.id);

    await fetchData();
    setSelectedCustomer(null);
    setNotification(`Member '${editName}' details updated successfully!`);
    setTimeout(() => setNotification(null), 5000);
  };

  // Filter groups dynamically based on selected batch
  const filteredGroupsForBatch = useMemo(() => {
    if (!selectedBatchId) return groups;
    return groups.filter((g) => g.batch_id === selectedBatchId);
  }, [groups, selectedBatchId]);

  useEffect(() => {
    if (filteredGroupsForBatch.length > 0) {
      setSelectedGroupId(filteredGroupsForBatch[0].id);
    } else {
      setSelectedGroupId("");
    }
  }, [selectedBatchId, filteredGroupsForBatch]);

  const currentBatch = useMemo(() => {
    return batches.find((b) => b.id === selectedBatchId) || batches[0];
  }, [batches, selectedBatchId]);

  const currentGroup = useMemo(() => {
    return groups.find((g) => g.id === selectedGroupId) || filteredGroupsForBatch[0];
  }, [groups, selectedGroupId, filteredGroupsForBatch]);

  // Dynamic Installment Schedule Preview (Batch Start Date vs Customer Joining Date)
  const computedSchedulePreview = useMemo(() => {
    if (!currentBatch) return [];

    const previewList: { cycleNumber: number; dueDate: string; amount: number; status: string }[] = [];
    const totalCycles = currentBatch.total_cycles;
    const amount = currentBatch.installment_amount;
    const freq = currentBatch.frequency_type;

    // Timeline starts strictly from BATCH START DATE
    const [bYear, bMonth, bDay] = (currentBatch.start_date || "2026-08-01").split("-").map(Number);
    const batchStartObj = new Date(bYear, bMonth - 1, bDay);

    const [jYear, jMonth, jDay] = (joiningDate || currentBatch.start_date || "2026-08-06").split("-").map(Number);
    const customerJoinObj = new Date(jYear, jMonth - 1, jDay);

    const now = new Date();
    const todayObj = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (let i = 1; i <= totalCycles; i++) {
      let cycleDueDate = new Date(bYear, bMonth - 1, bDay);

      if (freq === "DAILY") {
        cycleDueDate.setDate(bDay + (i - 1));
      } else if (freq === "WEEKLY") {
        cycleDueDate.setDate(bDay + ((i - 1) * 7));
      } else if (freq === "MONTHLY") {
        cycleDueDate.setMonth((bMonth - 1) + (i - 1));
      }

      const yearStr = cycleDueDate.getFullYear();
      const monthStr = String(cycleDueDate.getMonth() + 1).padStart(2, "0");
      const dayStr = String(cycleDueDate.getDate()).padStart(2, "0");
      const formattedDueDate = `${yearStr}-${monthStr}-${dayStr}`;

      const cycleTime = cycleDueDate.getTime();
      const joinTime = customerJoinObj.getTime();
      const todayTime = todayObj.getTime();

      let initialStatus = "UPCOMING";

      if (cycleTime < joinTime) {
        if (lateJoinerPolicy === "SKIP_PREVIOUS_DISALLOWED") {
          initialStatus = "SKIPPED (₹0)";
        } else if (lateJoinerPolicy === "CARRY_PREVIOUS_PENDING") {
          initialStatus = "OVERDUE (CARRIED PENDING)";
        } else {
          initialStatus = "SKIPPED (₹0)";
        }
      } else if (cycleTime === joinTime || (cycleTime >= joinTime && cycleTime <= todayTime)) {
        // Immediate active cycle due on customer joining date!
        initialStatus = "DUE PENDING (JOIN DAY DUE)";
      } else {
        initialStatus = "UPCOMING";
      }

      previewList.push({
        cycleNumber: i,
        dueDate: formattedDueDate,
        amount: initialStatus.includes("SKIPPED") ? 0 : amount,
        status: initialStatus
      });
    }

    return previewList;
  }, [currentBatch, joiningDate, lateJoinerPolicy]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone_number?.includes(searchQuery) ||
      c.batch_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.group_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirmEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();

    const newCustomerCode = `CUST-00${customers.length + 1}`;
    const matchedBatchName = currentBatch?.batch_name || "Scheme Batch";
    const matchedGroupName = currentGroup?.group_name || currentGroup?.route_name || "Route Group A";

    const newCustomerObject: Customer = {
      id: `c_${Date.now()}`,
      customer_code: newCustomerCode,
      full_name: fullName,
      phone_number: phoneNumber,
      alt_phone_number: altPhoneNumber,
      address: address,
      id_proof_number: idProof,
      internal_notes: internalNotes,
      batch_id: selectedBatchId,
      batch_name: matchedBatchName,
      group_id: selectedGroupId,
      group_name: matchedGroupName,
      joining_date: joiningDate,
      late_joiner_policy: lateJoinerPolicy,
      status: "ACTIVE",
      total_paid: 0,
      pending_dues: 0,
      created_at: new Date(joiningDate).toISOString()
    };

    // INSTANT OPTIMISTIC RENDER
    setCustomers(prev => [newCustomerObject, ...prev]);

    const newCustRecord = {
      customer_code: newCustomerCode,
      full_name: fullName,
      phone_number: phoneNumber,
      address: address,
      id_proof_number: idProof,
      internal_notes: internalNotes,
      batch_id: selectedBatchId || null,
      batch_name: matchedBatchName,
      group_id: selectedGroupId || null,
      group_name: matchedGroupName,
      joining_date: joiningDate,
      late_joiner_policy: lateJoinerPolicy,
      status: "ACTIVE"
    };

    await supabase.from('customers').insert([newCustRecord]);
    await fetchData();

    setIsModalOpen(false);
    setNotification(`Customer '${fullName}' enrolled under '${matchedBatchName}' -> '${matchedGroupName}'!`);
    setTimeout(() => setNotification(null), 6000);

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
      <Header title="Customer Directory & Batch/Group Enrollment" subtitle="Click any member row to view details, ledger health & assigned route groups" />

      <main className="ml-64 p-6 space-y-6">
        {notification && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-4 rounded-xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-semibold">{notification}</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono text-emerald-500">ENROLLED</span>
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
              placeholder="Search by Member, Phone, Batch, or Route Group..."
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

        {/* Customer Directory Table */}
        {loading && customers.length === 0 ? (
          <div className="p-12 text-center text-xs opacity-70 font-mono">Loading enrolled customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 rounded-2xl border text-center space-y-3 glass-panel" style={{ borderColor: "var(--border-color)" }}>
            <Users className="w-10 h-10 opacity-40 mx-auto text-[#0F766E]" />
            <h3 className="text-base font-bold">No Customers Enrolled</h3>
            <p className="text-xs opacity-70 max-w-sm mx-auto">No members found. Click 'Register & Enroll Customer' to map members into Scheme Batches and Route Groups.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#0F766E] text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Register Customer
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="uppercase tracking-wider text-[10px] border-b" style={{ borderColor: "var(--border-color)" }}>
                  <tr>
                    <th className="py-3.5 px-4">Member ID</th>
                    <th className="py-3.5 px-4">Member Name</th>
                    <th className="py-3.5 px-4">Enrolled Batch</th>
                    <th className="py-3.5 px-4">Route Group</th>
                    <th className="py-3.5 px-4">Phone / Contact</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                  {filteredCustomers.map((cust) => (
                    <tr
                      key={cust.id}
                      onClick={() => openViewMemberModal(cust)}
                      className="hover:bg-emerald-500/5 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-500">{cust.customer_code}</td>
                      <td className="py-3.5 px-4 font-semibold">{cust.full_name}</td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1.5 font-bold text-emerald-500">
                          <Layers className="w-3.5 h-3.5 opacity-70" />
                          <span>{cust.batch_name || "Palagara Seetu #01"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-[#0F766E]/20 text-[#10B981] border border-[#0F766E]/30">
                          <MapPin className="w-3 h-3" />
                          <span>{cust.group_name || "Route A"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 opacity-80 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 opacity-60" />
                        <span>{cust.phone_number}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button className="px-3 py-1 bg-[#0F766E]/20 text-emerald-400 border border-[#0F766E]/40 rounded-xl text-[11px] font-bold hover:bg-[#0F766E] hover:text-white transition-all flex items-center gap-1 ml-auto">
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View & Edit Customer Details Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div 
              className="border rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
            >
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold">{selectedCustomer.full_name}</h3>
                    <span className="text-[10px] font-mono font-bold text-emerald-500 bg-[#0F766E]/20 px-2 py-0.5 rounded border border-[#0F766E]/30">
                      {selectedCustomer.customer_code}
                    </span>
                  </div>
                  <p className="text-xs opacity-70">Enrolled under {selectedCustomer.batch_name || "Scheme Batch"} ({selectedCustomer.group_name || "Route Group"})</p>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!isEditMode ? (
                /* VIEW MEMBER DETAILS STATE */
                <div className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-2 gap-4 rounded-xl p-4 border" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                    <div>
                      <p className="opacity-60">Full Name</p>
                      <p className="font-bold text-sm">{selectedCustomer.full_name}</p>
                    </div>
                    <div>
                      <p className="opacity-60">Member ID Code</p>
                      <p className="font-mono font-bold text-emerald-500">{selectedCustomer.customer_code}</p>
                    </div>
                    <div>
                      <p className="opacity-60">Primary Mobile</p>
                      <p className="font-bold text-emerald-500">{selectedCustomer.phone_number}</p>
                    </div>
                    <div>
                      <p className="opacity-60">Enrolled Scheme Batch</p>
                      <p className="font-bold">{selectedCustomer.batch_name || "Palagara Seetu #01"}</p>
                    </div>
                    <div>
                      <p className="opacity-60">Assigned Route Group</p>
                      <p className="font-bold text-emerald-500">{selectedCustomer.group_name || "Route A"}</p>
                    </div>
                    <div>
                      <p className="opacity-60">Account Health</p>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                        {selectedCustomer.status || "ACTIVE"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl p-4 border space-y-2" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                    <div>
                      <p className="opacity-60">Residential / Shop Address</p>
                      <p className="font-semibold">{selectedCustomer.address || "No address provided"}</p>
                    </div>
                    {selectedCustomer.internal_notes && (
                      <div className="pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
                        <p className="opacity-60">Internal Admin Notes</p>
                        <p className="font-medium text-amber-400">{selectedCustomer.internal_notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Customer Installment Dues & Timeline Breakdown */}
                  <div className="rounded-xl p-4 border space-y-3" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-emerald-500 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Installment Dues Schedule Breakdown</span>
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold bg-[#0F766E]/20 px-2 py-0.5 rounded border border-[#0F766E]/30">
                        Joining Date: {selectedCustomer.joining_date || selectedCustomer.created_at?.split("T")[0] || "2026-08-15"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-[11px] p-2.5 rounded-lg border bg-slate-900/40" style={{ borderColor: "var(--border-color)" }}>
                      <div>
                        <p className="opacity-60">Customer Start Date</p>
                        <p className="font-bold text-emerald-400">{selectedCustomer.joining_date || "2026-08-15"}</p>
                      </div>
                      <div>
                        <p className="opacity-60">Late Joiner Dues Policy</p>
                        <p className="font-bold text-emerald-400">
                          {selectedCustomer.late_joiner_policy === "CARRY_PREVIOUS_PENDING"
                            ? "Option B: Carry Previous Dues"
                            : selectedCustomer.late_joiner_policy === "SKIP_PREVIOUS_DISALLOWED"
                            ? "Option C: Skip Disallowed Past Cycles"
                            : "Option A: Join Date Timeline"}
                        </p>
                      </div>
                      <div>
                        <p className="opacity-60">Dues Health & Financial Breakdown</p>
                        {(() => {
                          const customerStartStr = selectedCustomer.joining_date || selectedCustomer.created_at?.split("T")[0] || "2026-08-01";
                          const customerStartDateObj = new Date(customerStartStr);
                          customerStartDateObj.setHours(0, 0, 0, 0);

                          const today = new Date();
                          today.setHours(0, 0, 0, 0);

                          const matchedBatch = batches.find(b => b.id === selectedCustomer.batch_id || b.batch_name === selectedCustomer.batch_name) || batches[0];
                          const batchStartStr = matchedBatch?.start_date || "2026-06-01";
                          const batchStartDateObj = new Date(batchStartStr);
                          batchStartDateObj.setHours(0, 0, 0, 0);

                          const freq = matchedBatch?.frequency_type || "WEEKLY";
                          const policy = selectedCustomer.late_joiner_policy || "START_FROM_JOIN_DATE";
                          const installmentAmount = Number(matchedBatch?.installment_amount) || 5000;

                          let intervalDays = 7;
                          if (freq === "DAILY") intervalDays = 1;
                          else if (freq === "WEEKLY") intervalDays = 7;
                          else if (freq === "MONTHLY") intervalDays = 30;

                          if (customerStartDateObj > today) {
                            return <p className="font-bold text-amber-400">DUE NOT STARTED (Starts {customerStartStr})</p>;
                          }

                          // 1. Calculate missed cycles between Batch Start Date and Customer Joining Date
                          const batchToJoinDays = Math.max(0, Math.floor((customerStartDateObj.getTime() - batchStartDateObj.getTime()) / (1000 * 60 * 60 * 24)));
                          const skippedBatchCyclesBeforeJoin = Math.floor(batchToJoinDays / intervalDays);

                          // 2. Calculate active current cycle elapsed from Customer Joining Date
                          const joinToTodayDays = Math.max(0, Math.floor((today.getTime() - customerStartDateObj.getTime()) / (1000 * 60 * 60 * 24)));
                          const currentActiveCycleNumber = Math.max(1, Math.floor(joinToTodayDays / intervalDays) + 1);

                          // Query DB payment records
                          const memberPayments = payments.filter(p => p.customer_id === selectedCustomer.id);
                          const totalPaidAmount = memberPayments.reduce((acc, curr) => acc + (Number(curr.amount_paid) || 0), 0);
                          const paidCyclesCount = Math.floor(totalPaidAmount / installmentAmount);

                          // Past Unpaid Post-Join Cycles (Cycles after joining date that elapsed unpaid)
                          let pastUnpaidPostJoinCycles = Math.max(0, (currentActiveCycleNumber - 1) - paidCyclesCount);
                          let carriedBatchUnpaidCycles = 0;

                          if (policy === "CARRY_PREVIOUS_PENDING") {
                            carriedBatchUnpaidCycles = skippedBatchCyclesBeforeJoin;
                          }

                          const totalPastOverdueCyclesCount = pastUnpaidPostJoinCycles + carriedBatchUnpaidCycles;
                          const pastOverdueAmount = totalPastOverdueCyclesCount * installmentAmount;

                          // Current Active Cycle Due (Cycle #N post-join)
                          const currentCycleDueAmount = paidCyclesCount >= currentActiveCycleNumber ? 0 : installmentAmount;
                          const totalBalanceDue = pastOverdueAmount + currentCycleDueAmount;

                          if (totalBalanceDue === 0) {
                            return (
                              <div className="space-y-1 mt-0.5">
                                <p className="font-bold text-emerald-400">UP TO DATE — All Current Dues Fully Paid (₹0 Due)</p>
                                {skippedBatchCyclesBeforeJoin > 0 && policy === "SKIP_PREVIOUS_DISALLOWED" && (
                                  <p className="text-[10px] text-slate-400 font-medium">• Skipped {skippedBatchCyclesBeforeJoin} Batch Cycle(s) before joining date ({batchStartStr} to {customerStartStr}) @ ₹0</p>
                                )}
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-1 mt-0.5">
                              <p className="font-bold text-rose-400">
                                TOTAL DUE: ₹{totalBalanceDue.toLocaleString("en-IN")} ({totalPastOverdueCyclesCount + (currentCycleDueAmount > 0 ? 1 : 0)} Cycle(s) Unpaid)
                              </p>
                              <div className="text-[10px] space-y-0.5 font-medium opacity-90 text-slate-300">
                                {skippedBatchCyclesBeforeJoin > 0 && policy === "SKIP_PREVIOUS_DISALLOWED" && (
                                  <p className="text-slate-400 font-bold">• Skipped {skippedBatchCyclesBeforeJoin} Batch Cycle(s) before join @ ₹0</p>
                                )}
                                {carriedBatchUnpaidCycles > 0 && (
                                  <p className="text-rose-400">• Carried Batch Overdue ({carriedBatchUnpaidCycles} Cycle(s)): <strong>₹{(carriedBatchUnpaidCycles * installmentAmount).toLocaleString("en-IN")}</strong></p>
                                )}
                                {pastUnpaidPostJoinCycles > 0 && (
                                  <p className="text-amber-400">• Past Overdue Dues ({pastUnpaidPostJoinCycles} Cycle(s)): <strong>₹{(pastUnpaidPostJoinCycles * installmentAmount).toLocaleString("en-IN")}</strong></p>
                                )}
                                {currentCycleDueAmount > 0 && (
                                  <p className="text-emerald-400">• Current Active Cycle #{currentActiveCycleNumber} Due: <strong>₹{currentCycleDueAmount.toLocaleString("en-IN")}</strong></p>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t" style={{ borderColor: "var(--border-color)" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className="px-4 py-2 border rounded-xl font-semibold opacity-80 hover:opacity-100 cursor-pointer"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditMode(true)}
                      className="px-4 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Member Profile</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* EDIT MEMBER FORM STATE */
                <form onSubmit={handleSaveCustomerEdits} className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Full Customer Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Mobile Number</label>
                      <input
                        type="text"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Address / Route Reference</label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Internal Admin Notes</label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t" style={{ borderColor: "var(--border-color)" }}>
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="px-4 py-2 border rounded-xl font-semibold opacity-80 hover:opacity-100 cursor-pointer"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}
                    >
                      Cancel Edit
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Enrollment Modal Dialog */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div 
              className="border rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
            >
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
                <div>
                  <h3 className="text-base font-bold">Register Customer & Enroll Batch/Group</h3>
                  <p className="text-xs opacity-70">Assign customer to specific Scheme Batch and Route Group</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="opacity-70 hover:opacity-100 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmEnrollment} className="space-y-5 text-xs font-sans">
                {/* 1. Personal Details */}
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

                {/* 2. Batch & Group Mapping */}
                <div className="space-y-3 pt-3 border-t" style={{ borderColor: "var(--border-color)" }}>
                  <h4 className="font-bold text-emerald-500 text-xs uppercase tracking-wider">2. Scheme Batch & Route Group Selection</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Select Scheme Batch</label>
                      <select
                        value={selectedBatchId}
                        onChange={(e) => setSelectedBatchId(e.target.value)}
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E] font-bold"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      >
                        {batches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.batch_name} ({b.batch_code || 'BATCH'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Select Route Group (Filtered by Batch)</label>
                      <select
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E] font-bold text-emerald-500"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}
                      >
                        {filteredGroupsForBatch.length === 0 ? (
                          <option value="">No Route Groups for this Batch</option>
                        ) : (
                          filteredGroupsForBatch.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.group_name} ({g.route_name})
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Customer Joining Date</label>
                      <input
                        type="date"
                        value={joiningDate}
                        onChange={(e) => setJoiningDate(e.target.value)}
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Late Joiner Dues Policy</label>
                      <select
                        value={lateJoinerPolicy}
                        onChange={(e) => setLateJoinerPolicy(e.target.value as LateJoinerPolicy)}
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      >
                        <option value="START_FROM_JOIN_DATE">Option A: Start from Joining Date (Dynamic Timeline)</option>
                        <option value="CARRY_PREVIOUS_PENDING">Option B: Carry Previous Dues as Pending</option>
                        <option value="SKIP_PREVIOUS_DISALLOWED">Option C: Skip Disallowed Past Cycles (₹0)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Schedule Preview */}
                <div className="space-y-3 pt-3 border-t" style={{ borderColor: "var(--border-color)" }}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-emerald-500 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>3. Dynamic Installment Schedule Preview</span>
                    </h4>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold bg-[#0F766E]/20 px-2.5 py-0.5 rounded border border-[#0F766E]/30">
                      {currentBatch ? `${currentBatch.total_cycles} ${currentBatch.frequency_type} Cycles @ ₹${currentBatch.installment_amount.toLocaleString("en-IN")}` : ''}
                    </span>
                  </div>

                  {/* Batch Timeline Information Card */}
                  {currentBatch && (
                    <div className="grid grid-cols-4 gap-3 p-3 rounded-xl border bg-slate-900/60 text-[11px]" style={{ borderColor: "var(--border-color)" }}>
                      <div>
                        <p className="opacity-60 text-[10px]">Batch Start Date</p>
                        <p className="font-bold text-emerald-400 font-mono">{currentBatch.start_date || "2026-08-01"}</p>
                      </div>
                      <div>
                        <p className="opacity-60 text-[10px]">Batch End Date</p>
                        <p className="font-bold text-emerald-400 font-mono">{currentBatch.end_date || "2027-08-01"}</p>
                      </div>
                      <div>
                        <p className="opacity-60 text-[10px]">Customer Joining Date</p>
                        <p className="font-bold text-amber-400 font-mono">{joiningDate || currentBatch.start_date}</p>
                      </div>
                      <div>
                        <p className="opacity-60 text-[10px]">Scheme Commitment</p>
                        <p className="font-bold text-white font-mono">₹{(currentBatch.total_cycles * currentBatch.installment_amount).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border max-h-40 overflow-y-auto p-2" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="opacity-60 border-b" style={{ borderColor: "var(--border-color)" }}>
                          <th className="py-1 px-2">Cycle #</th>
                          <th className="py-1 px-2">Due Date</th>
                          <th className="py-1 px-2">Cycle Amount</th>
                          <th className="py-1 px-2 text-right">Initial Dues Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                        {computedSchedulePreview.map((item) => (
                          <tr key={item.cycleNumber}>
                            <td className="py-1 px-2 font-mono font-bold text-emerald-500">Cycle #{item.cycleNumber}</td>
                            <td className="py-1 px-2">{item.dueDate}</td>
                            <td className="py-1 px-2 font-bold">₹{item.amount.toLocaleString("en-IN")}</td>
                            <td className="py-1 px-2 text-right">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                item.status.includes('SKIPPED')
                                  ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                                  : item.status.includes('OVERDUE')
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : item.status.includes('DUE')
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}>
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
                    <span>Save & Enroll Member</span>
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
