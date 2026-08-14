"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabase/client";
import { Customer, Batch, Group, Payment } from "@/lib/types";
import { 
  FileText, 
  Download, 
  Printer,
  Calendar, 
  Users, 
  Layers, 
  DollarSign, 
  CheckCircle2,
  SlidersHorizontal,
  Building,
  UserCheck
} from "lucide-react";

export default function ReportsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Multi-Level Filter State
  const [reportScope, setReportScope] = useState<"ALL" | "SINGLE_CUSTOMER" | "ALL_BATCH_GROUPS" | "SINGLE_GROUP" | "MULTI_GROUPS">("ALL");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  // Date Filter Preset State
  const [dateFilterMode, setDateFilterMode] = useState<"ALL_TIME" | "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "CUSTOM_RANGE">("ALL_TIME");
  const [customStartDate, setCustomStartDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [customEndDate, setCustomEndDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("ALL");

  useEffect(() => {
    const fetchReportsData = async () => {
      setLoading(true);
      const { data: custData } = await supabase.from('customers').select('*');
      const { data: batchData } = await supabase.from('batches').select('*');
      const { data: groupData } = await supabase.from('groups').select('*');
      const { data: payData } = await supabase.from('payments').select('*');

      if (custData && Array.isArray(custData)) setCustomers(custData);
      if (batchData && Array.isArray(batchData)) {
        setBatches(batchData);
        if (batchData.length > 0) setSelectedBatchId(batchData[0].id);
      }
      if (groupData && Array.isArray(groupData)) {
        setGroups(groupData);
        if (groupData.length > 0) setSelectedGroupId(groupData[0].id);
      }
      if (payData && Array.isArray(payData)) setPayments(payData);

      setLoading(false);
    };
    fetchReportsData();
  }, []);

  // Filtered Groups based on selected batch
  const filteredGroupsForSelectedBatch = useMemo(() => {
    if (!selectedBatchId) return groups;
    return groups.filter(g => g.batch_id === selectedBatchId);
  }, [groups, selectedBatchId]);

  // Master Filter Engine
  const filteredReportData = useMemo(() => {
    return payments.filter((pay) => {
      const cust = customers.find(c => c.id === pay.customer_id) || {
        id: pay.customer_id,
        full_name: pay.customer_name || "Member",
        batch_id: pay.batch_id,
        group_name: "Group A"
      };

      // 1. Report Scope Filtering
      if (reportScope === "SINGLE_CUSTOMER" && selectedCustomerId) {
        if (pay.customer_id !== selectedCustomerId) return false;
      } else if (reportScope === "ALL_BATCH_GROUPS" && selectedBatchId) {
        if (cust.batch_id !== selectedBatchId && pay.batch_id !== selectedBatchId) return false;
      } else if (reportScope === "SINGLE_GROUP" && selectedGroupId) {
        const grp = groups.find(g => g.id === selectedGroupId);
        if (grp && cust.group_name !== grp.group_name) return false;
      } else if (reportScope === "MULTI_GROUPS" && selectedGroupIds.length > 0) {
        const selectedGroupNames = groups.filter(g => selectedGroupIds.includes(g.id)).map(g => g.group_name);
        if (!selectedGroupNames.includes(cust.group_name || "")) return false;
      }

      // 2. Payment Method Filter
      if (paymentMethodFilter !== "ALL" && pay.payment_method !== paymentMethodFilter) {
        return false;
      }

      // 3. Date Filtering (Today, This Week, This Month, Custom Range)
      const payDate = new Date(pay.payment_date || pay.created_at || new Date());
      payDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilterMode === "TODAY") {
        if (payDate.getTime() !== today.getTime()) return false;
      } else if (dateFilterMode === "THIS_WEEK") {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        if (payDate < weekAgo || payDate > today) return false;
      } else if (dateFilterMode === "THIS_MONTH") {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        if (payDate < monthStart || payDate > today) return false;
      } else if (dateFilterMode === "CUSTOM_RANGE") {
        const startObj = new Date(customStartDate);
        startObj.setHours(0, 0, 0, 0);
        const endObj = new Date(customEndDate);
        endObj.setHours(23, 59, 59, 999);
        if (payDate < startObj || payDate > endObj) return false;
      }

      return true;
    });
  }, [
    payments,
    customers,
    groups,
    reportScope,
    selectedCustomerId,
    selectedBatchId,
    selectedGroupId,
    selectedGroupIds,
    paymentMethodFilter,
    dateFilterMode,
    customStartDate,
    customEndDate
  ]);

  const totalFilteredAmount = useMemo(() => {
    return filteredReportData.reduce((acc, curr) => acc + (Number(curr.amount_paid) || 0), 0);
  }, [filteredReportData]);

  // PDF PRINT & DOWNLOAD ENGINE
  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <Sidebar />
      <Header title="Advanced PDF Financial Reports & Export Studio" subtitle="Generate Custom Granular PDFs for Single Member, All Batch Groups, Specific Route Groups & Date Presets" />

      <main className="ml-64 p-6 space-y-6">
        {/* 1. SELECTION CONTROLS PANEL */}
        <div className="p-6 rounded-2xl border glass-panel space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: "var(--border-color)" }}>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold">PDF Report Scope & Selective Filtering Controls</h3>
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={filteredReportData.length === 0}
              className="bg-[#0F766E] hover:bg-[#0d645e] disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD PDF REPORT</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs font-sans">
            {/* Control 1: Report Scope */}
            <div>
              <label className="block font-bold mb-1 opacity-80 uppercase tracking-wider text-[10px]">1. Select Report Target Scope</label>
              <select
                value={reportScope}
                onChange={(e) => setReportScope(e.target.value as any)}
                className="w-full border rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-[#0F766E] text-emerald-400"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}
              >
                <option value="ALL">Entire Organization Ledger (All Records)</option>
                <option value="SINGLE_CUSTOMER">Single Customer Specific Ledger</option>
                <option value="ALL_BATCH_GROUPS">All Groups in a Scheme Batch</option>
                <option value="SINGLE_GROUP">Single Specific Route Group</option>
                <option value="MULTI_GROUPS">Multiple Selective Route Groups</option>
              </select>
            </div>

            {/* Control 2: Dynamic Scope Dropdowns */}
            <div>
              <label className="block font-bold mb-1 opacity-80 uppercase tracking-wider text-[10px]">2. Target Entity Selection</label>
              {reportScope === "SINGLE_CUSTOMER" ? (
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                >
                  <option value="">Select Member...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.customer_code})</option>
                  ))}
                </select>
              ) : reportScope === "ALL_BATCH_GROUPS" ? (
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.batch_name} ({b.frequency_type})</option>
                  ))}
                </select>
              ) : reportScope === "SINGLE_GROUP" ? (
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.group_name} ({g.route_name})</option>
                  ))}
                </select>
              ) : reportScope === "MULTI_GROUPS" ? (
                <select
                  multiple
                  value={selectedGroupIds}
                  onChange={(e) => setSelectedGroupIds(Array.from(e.target.selectedOptions, o => o.value))}
                  className="w-full border rounded-xl px-3.5 py-1.5 max-h-24 focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>{g.group_name}</option>
                  ))}
                </select>
              ) : (
                <div className="p-2.5 border rounded-xl text-slate-400 italic" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                  All Customer Accounts Included
                </div>
              )}
            </div>

            {/* Control 3: Date Filtering Preset */}
            <div>
              <label className="block font-bold mb-1 opacity-80 uppercase tracking-wider text-[10px]">3. Timeline Preset Filter</label>
              <select
                value={dateFilterMode}
                onChange={(e) => setDateFilterMode(e.target.value as any)}
                className="w-full border rounded-xl px-3.5 py-2.5 font-bold focus:outline-none focus:border-[#0F766E]"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
              >
                <option value="ALL_TIME">All-Time Receipts</option>
                <option value="TODAY">Daily Wise (Today Collections)</option>
                <option value="THIS_WEEK">Weekly Wise (Past 7 Days)</option>
                <option value="THIS_MONTH">Monthly Wise (Current Month)</option>
                <option value="CUSTOM_RANGE">Selective Custom Date Range</option>
              </select>
            </div>
          </div>

          {/* Selective Custom Date Inputs */}
          {dateFilterMode === "CUSTOM_RANGE" && (
            <div className="grid grid-cols-2 gap-4 pt-3 border-t" style={{ borderColor: "var(--border-color)" }}>
              <div>
                <label className="block font-semibold mb-1 opacity-80 text-xs">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 opacity-80 text-xs">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. SUMMARY & DATA PREVIEW TABLE */}
        <div className="p-5 rounded-2xl border glass-panel space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#0F766E]/20 text-[#10B981] border border-[#0F766E]/30">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Filtered Collection Total</p>
                <h3 className="text-xl font-black text-emerald-400">₹{totalFilteredAmount.toLocaleString("en-IN")}</h3>
              </div>
            </div>

            <span className="text-xs font-mono font-bold bg-[#0F766E]/20 text-emerald-400 px-3 py-1 rounded border border-[#0F766E]/30">
              {filteredReportData.length} Receipts Ready for PDF Download
            </span>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-color)" }}>
            {loading ? (
              <div className="p-12 text-center text-xs opacity-70 font-mono">Loading payment ledgers from Supabase...</div>
            ) : filteredReportData.length === 0 ? (
              <div className="p-12 text-center text-xs opacity-60">No payment receipts found matching your exact filter selection.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="uppercase tracking-wider text-[10px] border-b" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                    <tr>
                      <th className="py-3 px-4">Receipt No</th>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Notes / Target Cycle</th>
                      <th className="py-3 px-4 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                    {filteredReportData.map((p) => {
                      const cust = customers.find(c => c.id === p.customer_id);
                      return (
                        <tr key={p.id} className="hover:bg-emerald-500/5">
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400">{p.receipt_no || p.receipt_number || "REC-DB"}</td>
                          <td className="py-3 px-4 font-semibold">{cust?.full_name || p.customer_name || "Member"}</td>
                          <td className="py-3 px-4 font-mono text-[10px]">{p.payment_method}</td>
                          <td className="py-3 px-4 font-mono opacity-70">{p.payment_date?.split("T")[0] || new Date().toISOString().split("T")[0]}</td>
                          <td className="py-3 px-4 opacity-80">{p.notes || "Field Collection"}</td>
                          <td className="py-3 px-4 font-bold text-emerald-400 text-right">₹{Number(p.amount_paid).toLocaleString("en-IN")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
