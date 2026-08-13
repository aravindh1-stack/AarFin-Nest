"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabase/client";
import { Batch, Installment, SchemeType, FrequencyType } from "@/lib/types";
import { Plus, Calendar, X, Sparkles, CheckCircle2, Edit3, Eye, Save, Layers } from "lucide-react";

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // View & Edit Modal State
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State for Create New Batch
  const [batchTitle, setBatchTitle] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [schemeCategory, setSchemeCategory] = useState<SchemeType>("PALAGARA_SEETU");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("MONTHLY");
  const [renewalDay, setRenewalDay] = useState("5");
  const [installmentAmount, setInstallmentAmount] = useState<number>(5000);
  const [totalCycles, setTotalCycles] = useState<number>(20);
  const [startDate, setStartDate] = useState("2026-08-15");

  // Form State for Edit Batch
  const [editTitle, setEditTitle] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editRenewalDay, setEditRenewalDay] = useState("");

  // Fetch Live Batches from Supabase DB
  const fetchBatches = async () => {
    setLoading(true);
    const { data } = await supabase.from('batches').select('*');
    if (data && Array.isArray(data)) {
      setBatches(data);
    } else {
      setBatches([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const openViewModal = (batch: Batch) => {
    setSelectedBatch(batch);
    setEditTitle(batch.batch_name);
    setEditCode(batch.batch_code);
    setEditAmount(batch.installment_amount);
    setEditRenewalDay(batch.renewal_day || "5");
    setIsEditMode(false);
  };

  // Mutate Live Supabase `batches` Table
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    const updatedCode = editCode.toUpperCase();

    const { error } = await supabase.from('batches').update({
      batch_name: editTitle,
      batch_code: updatedCode,
      installment_amount: editAmount,
      renewal_day: editRenewalDay,
    }).eq('id', selectedBatch.id);

    await fetchBatches();
    setSelectedBatch(null);
    setNotification(`Batch '${updatedCode}' updated in Supabase database!`);
    setTimeout(() => setNotification(null), 5000);
  };

  // Create Batch & Write directly to Supabase DB
  const handleCreateBatchAndCycles = async (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(startDate);
    let end = new Date(startDate);

    if (frequencyType === "DAILY") {
      end.setDate(start.getDate() + totalCycles);
    } else if (frequencyType === "WEEKLY") {
      end.setDate(start.getDate() + (totalCycles * 7));
    } else if (frequencyType === "MONTHLY") {
      end.setMonth(start.getMonth() + totalCycles);
    }

    const formattedCode = batchCode.trim().toUpperCase() || `BATCH-${Math.floor(100 + Math.random() * 900)}`;

    const newBatchRecord = {
      batch_code: formattedCode,
      batch_name: batchTitle,
      scheme_type: schemeCategory,
      total_cycles: totalCycles,
      installment_amount: installmentAmount,
      frequency_type: frequencyType,
      renewal_day: frequencyType !== "DAILY" ? renewalDay : null,
      start_date: startDate,
      end_date: end.toISOString().split("T")[0],
      status: "ACTIVE"
    };

    await supabase.from('batches').insert([newBatchRecord]);
    await fetchBatches();

    setIsCreateModalOpen(false);
    setNotification(`Batch '${formattedCode}' created in Live Supabase DB!`);
    setTimeout(() => setNotification(null), 5000);

    setBatchTitle("");
    setBatchCode("");
  };

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <Sidebar />
      <Header title="Scheme & Batch Management" subtitle="100% Live Supabase PostgreSQL Integration for Palagara Seetu, Vaara Kandhu & Dhina Kandhu" />

      <main className="ml-64 p-6 space-y-6">
        {notification && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-4 rounded-xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-semibold">{notification}</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono text-emerald-500">SUPABASE_MUTATED</span>
          </div>
        )}

        {/* Top Actions & Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Active Scheme Batches</h2>
            <p className="text-xs opacity-70">Direct real-time query against public.batches table</p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Scheme Batch</span>
          </button>
        </div>

        {/* Live Batches Grid or Clean Empty State */}
        {loading ? (
          <div className="p-12 text-center text-xs opacity-70 font-mono">Loading batches from Supabase PostgreSQL...</div>
        ) : batches.length === 0 ? (
          <div className="p-12 rounded-2xl border text-center space-y-3 glass-panel" style={{ borderColor: "var(--border-color)" }}>
            <Layers className="w-10 h-10 opacity-40 mx-auto text-[#0F766E]" />
            <h3 className="text-base font-bold">No Scheme Batches Found</h3>
            <p className="text-xs opacity-70 max-w-sm mx-auto">No batches are currently registered in the database. Click 'Create New Scheme Batch' to add your first batch.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#0F766E] text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Create Batch
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {batches.map((batch) => (
              <div
                key={batch.id}
                onClick={() => openViewModal(batch)}
                className="p-6 rounded-2xl border glass-panel transition-all flex flex-col justify-between cursor-pointer hover:border-[#0F766E] shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#0F766E]/20 text-[#10B981] border border-[#0F766E]/30 uppercase tracking-wider font-mono">
                        {batch.scheme_type.replace("_", " ")}
                      </span>
                      <p className="text-[10px] font-mono text-emerald-500 font-bold">{batch.batch_code}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                      {batch.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-1">{batch.batch_name}</h3>
                  <p className="text-xs opacity-75 flex items-center gap-1.5 mb-4">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{batch.start_date} to {batch.end_date} ({batch.frequency_type})</span>
                  </p>

                  <div className="rounded-xl p-4 border space-y-2 mb-4" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                    <div className="flex justify-between text-xs">
                      <span className="opacity-75">Installment per cycle:</span>
                      <span className="font-bold">₹{batch.installment_amount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="opacity-75">Total Cycles:</span>
                      <span className="font-bold">{batch.total_cycles} Cycles</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t text-xs font-medium" style={{ borderColor: "var(--border-color)" }}>
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Click to View / Edit
                  </span>
                  <span className="opacity-60">{batch.group_count || 1} Group(s)</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View & Edit Details Modal */}
        {selectedBatch && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div 
              className="border rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
            >
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold">{selectedBatch.batch_name}</h3>
                    <span className="text-[10px] font-mono font-bold text-emerald-500 bg-[#0F766E]/20 px-2 py-0.5 rounded border border-[#0F766E]/30">
                      {selectedBatch.batch_code}
                    </span>
                  </div>
                  <p className="text-xs opacity-70">Category: {selectedBatch.scheme_type.replace("_", " ")}</p>
                </div>
                <button onClick={() => setSelectedBatch(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!isEditMode ? (
                /* VIEW STATE */
                <div className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-2 gap-4 rounded-xl p-4 border" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                    <div>
                      <p className="opacity-60">Batch Title</p>
                      <p className="font-bold text-sm">{selectedBatch.batch_name}</p>
                    </div>
                    <div>
                      <p className="opacity-60">Batch Unique Code</p>
                      <p className="font-mono font-bold text-emerald-500">{selectedBatch.batch_code}</p>
                    </div>
                    <div>
                      <p className="opacity-60">Collection Frequency</p>
                      <p className="font-bold">{selectedBatch.frequency_type}</p>
                    </div>
                    <div>
                      <p className="opacity-60">Renewal Day</p>
                      <p className="font-bold text-emerald-500">{selectedBatch.renewal_day || "N/A"}</p>
                    </div>
                    <div>
                      <p className="opacity-60">Installment per Cycle</p>
                      <p className="font-bold text-emerald-500 text-sm">₹{selectedBatch.installment_amount.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="opacity-60">Total Cycles</p>
                      <p className="font-bold">{selectedBatch.total_cycles} Cycles</p>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t" style={{ borderColor: "var(--border-color)" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedBatch(null)}
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
                      <span>Edit Details</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* EDIT FORM STATE */
                <form onSubmit={handleSaveChanges} className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Batch Title</label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Batch Code</label>
                      <input
                        type="text"
                        required
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        className="w-full border rounded-xl px-3.5 py-2.5 font-mono uppercase focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Installment Amount (₹)</label>
                      <input
                        type="number"
                        required
                        value={editAmount}
                        onChange={(e) => setEditAmount(Number(e.target.value))}
                        className="w-full border rounded-xl px-3.5 py-2.5 font-bold text-emerald-500 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Renewal Day Trigger</label>
                      <input
                        type="text"
                        value={editRenewalDay}
                        onChange={(e) => setEditRenewalDay(e.target.value)}
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>
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
                      <span>Save to Supabase DB</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal Dialog for Create New Scheme Batch */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div 
              className="border rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
            >
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
                <div>
                  <h3 className="text-base font-bold">Create New Scheme Batch</h3>
                  <p className="text-xs opacity-70">Direct insertion into public.batches table</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="opacity-70 hover:opacity-100 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBatchAndCycles} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Batch / Scheme Title</label>
                    <input
                      type="text"
                      required
                      value={batchTitle}
                      onChange={(e) => setBatchTitle(e.target.value)}
                      placeholder="e.g. Trichy Merchant Chit Fund"
                      className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Batch Code (Unique ID)</label>
                    <input
                      type="text"
                      required
                      value={batchCode}
                      onChange={(e) => setBatchCode(e.target.value)}
                      placeholder="e.g. SEETU-TRICHY-02"
                      className="w-full border rounded-xl px-3.5 py-2.5 font-mono uppercase focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Scheme Category</label>
                    <select
                      value={schemeCategory}
                      onChange={(e) => setSchemeCategory(e.target.value as SchemeType)}
                      className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    >
                      <option value="PALAGARA_SEETU">Palagara Seetu (Chit Fund)</option>
                      <option value="VAARA_KANDHU">Vaara Kandhu (Weekly Loan)</option>
                      <option value="DHINA_KANDHU">Dhina Kandhu (Daily Loan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Collection Frequency</label>
                    <select
                      value={frequencyType}
                      onChange={(e) => setFrequencyType(e.target.value as FrequencyType)}
                      className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Installment Amount (₹)</label>
                    <input
                      type="number"
                      required
                      value={installmentAmount}
                      onChange={(e) => setInstallmentAmount(Number(e.target.value))}
                      className="w-full border rounded-xl px-3.5 py-2.5 font-bold text-emerald-500 focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Total Cycles</label>
                    <input
                      type="number"
                      required
                      value={totalCycles}
                      onChange={(e) => setTotalCycles(Number(e.target.value))}
                      className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 opacity-80">Scheme Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                    style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t" style={{ borderColor: "var(--border-color)" }}>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border rounded-xl font-semibold opacity-80 hover:opacity-100 cursor-pointer"
                    style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Save to Supabase</span>
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
