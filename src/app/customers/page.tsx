"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabase/client";
import { Customer, Batch, Group, LateJoinerPolicy } from "@/lib/types";
import { UserPlus, Phone, Search, X, CheckCircle2, Sparkles, Users } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Customer Form State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [altPhoneNumber, setAltPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [idProof, setIdProof] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  // Batch & Group Selection
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [joiningDate, setJoiningDate] = useState("2026-08-15");
  const [lateJoinerPolicy, setLateJoinerPolicy] = useState<LateJoinerPolicy>("START_FROM_JOIN_DATE");

  const fetchData = async () => {
    setLoading(true);
    const { data: custData } = await supabase.from('customers').select('*');
    const { data: batchData } = await supabase.from('batches').select('*');
    const { data: groupData } = await supabase.from('groups').select('*');

    if (custData && Array.isArray(custData)) setCustomers(custData);
    else setCustomers([]);

    if (batchData && Array.isArray(batchData)) {
      setBatches(batchData);
      if (batchData.length > 0 && !selectedBatchId) setSelectedBatchId(batchData[0].id);
    }

    if (groupData && Array.isArray(groupData)) setGroups(groupData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableGroups = useMemo(() => {
    return groups.filter((g) => g.batch_id === selectedBatchId);
  }, [groups, selectedBatchId]);

  const currentBatch = useMemo(() => {
    return batches.find((b) => b.id === selectedBatchId) || batches[0];
  }, [batches, selectedBatchId]);

  const computedSchedulePreview = useMemo(() => {
    if (!currentBatch) return [];

    const previewList: { cycleNumber: number; dueDate: string; amount: number; status: string }[] = [];
    const totalCycles = currentBatch.total_cycles;
    const amount = currentBatch.installment_amount;
    const freq = currentBatch.frequency_type;

    let startDateObj = new Date(joiningDate || currentBatch.start_date || "2026-08-15");

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
      c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone_number?.includes(searchQuery)
  );

  const handleConfirmEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();

    const newCustomerCode = `CUST-00${customers.length + 1}`;

    const newCustRecord = {
      customer_code: newCustomerCode,
      full_name: fullName,
      phone_number: phoneNumber,
      address: address,
      id_proof_number: idProof,
      internal_notes: internalNotes,
      status: "ACTIVE"
    };

    const { data: custInsert } = await supabase.from('customers').insert([newCustRecord]);

    await fetchData();

    setIsModalOpen(false);
    setNotification(`Customer '${fullName}' registered in Live Supabase DB!`);
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
      <Header title="Customer Directory & Enrollment" subtitle="100% Supabase DB Integration for Customer Profiles & Schedule Previews" />

      <main className="ml-64 p-6 space-y-6">
        {notification && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-4 rounded-xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-semibold">{notification}</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono text-emerald-500">SUPABASE_INSERT</span>
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

        {/* Table or Clean Empty State */}
        {loading ? (
          <div className="p-12 text-center text-xs opacity-70 font-mono">Loading customer directory from Supabase...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 rounded-2xl border text-center space-y-3 glass-panel" style={{ borderColor: "var(--border-color)" }}>
            <Users className="w-10 h-10 opacity-40 mx-auto text-[#0F766E]" />
            <h3 className="text-base font-bold">No Customers Registered</h3>
            <p className="text-xs opacity-70 max-w-sm mx-auto">No members found in public.customers. Click 'Register & Enroll Customer' to add your first member.</p>
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
                    <th className="py-3.5 px-4">Customer Code</th>
                    <th className="py-3.5 px-4">Member Name</th>
                    <th className="py-3.5 px-4">Contact Phone</th>
                    <th className="py-3.5 px-4">Address / Notes</th>
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
        )}

        {/* Modal Dialog for Registration & Schedule Preview */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div 
              className="border rounded-2xl w-full max-w-4xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
            >
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
                <div>
                  <h3 className="text-base font-bold">Register Customer & Enroll Batch Schedule</h3>
                  <p className="text-xs opacity-70">Writes directly to public.customers table</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="opacity-70 hover:opacity-100 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmEnrollment} className="space-y-5 text-xs font-sans">
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
                    <span>Save Member to Supabase DB</span>
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
