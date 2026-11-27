"use client";

import { useEffect, useMemo, useState } from "react";
import { SkeletonBlock } from "@/components/skeleton-block";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { Search, Plus, X, AlertCircle, Edit3, RefreshCw, Users, Phone, Calendar } from "lucide-react";

interface Customer {
  id: string;
  customer_code?: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  batch_name?: string;
  group_name?: string;
  joining_date?: string;
  status?: string;
  id_proof_number?: string;
}

interface Batch {
  id: string;
  batch_name: string;
}

interface Group {
  id: string;
  group_name: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [idProof, setIdProof] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [customSeqNum, setCustomSeqNum] = useState("");
  const [isEditSeq, setIsEditSeq] = useState(false);
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [lateJoinerPolicy, setLateJoinerPolicy] = useState<"OPTION_A" | "OPTION_B" | "OPTION_C">("OPTION_A");

  // Derive Batch Initial Prefix: MNF-[Initial]C-
  const matchedBatch = useMemo(() => batches.find((b) => b.id === selectedBatchId), [batches, selectedBatchId]);
  const batchInitial = useMemo(() => {
    return matchedBatch?.batch_name
      ? matchedBatch.batch_name.trim().charAt(0).toUpperCase()
      : "P";
  }, [matchedBatch]);

  const prefixCode = `MNF-${batchInitial}C-`;

  useEffect(() => {
    if (!isEditSeq) {
      setCustomSeqNum(String(customers.length + 1).padStart(3, "0"));
    }
  }, [customers.length, isEditSeq]);

  const finalCustomerCode = `${prefixCode}${customSeqNum}`;

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, bRes, gRes] = await Promise.all([
        fetch("/api/customers").then((r) => r.json()),
        fetch("/api/batches").then((r) => r.json()),
        fetch("/api/groups").then((r) => r.json()),
      ]);

      if (Array.isArray(cRes)) setCustomers(cRes);
      if (Array.isArray(bRes)) setBatches(bRes);
      if (Array.isArray(gRes)) setGroups(gRes);
    } catch (err) {
      console.error("Error loading customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const q = query.toLowerCase();
      return (
        c.full_name?.toLowerCase().includes(q) ||
        c.phone_number?.includes(q) ||
        c.customer_code?.toLowerCase().includes(q) ||
        c.batch_name?.toLowerCase().includes(q)
      );
    });
  }, [customers, query]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    const matchedB = batches.find((b) => b.id === selectedBatchId);
    const matchedG = groups.find((g) => g.id === selectedGroupId);

    const payload = {
      customer_code: finalCustomerCode,
      full_name: fullName,
      phone_number: phone,
      address: address,
      id_proof_number: idProof,
      batch_id: selectedBatchId || null,
      batch_name: matchedB?.batch_name || "Palagara Seetu",
      group_id: selectedGroupId || null,
      group_name: matchedG?.group_name || "North Zone A",
      joining_date: joiningDate,
      late_joiner_policy: lateJoinerPolicy,
      status: "ACTIVE",
    };

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        setFullName("");
        setPhone("");
        setAddress("");
        setIdProof("");
        loadData();
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || "Failed to enroll member. Please check input details.");
      }
    } catch (err: any) {
      console.error("Error enrolling member:", err);
      setFormError(`Network error: ${err.message || "Could not reach server"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <DashboardTopbar
        title="Customer Directory & Enrollment"
        description="Register members, assign scheme batches & route groups"
      />

      <div className="space-y-4 px-4 py-2 sm:px-6 lg:px-8 w-full max-w-full min-w-0">
        {/* Top Controls Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search member, phone, code..."
              className="w-full min-h-[44px] rounded-xl border border-slate-200/90 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#121614] dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-[#10B981] transition"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white font-bold dark:bg-[#10B981] dark:text-black px-4 py-2 text-xs shadow-xs transition hover:bg-emerald-500 dark:hover:bg-[#0EA57E] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Enroll New Member</span>
          </button>
        </div>

        {/* MOBILE MEMBER CARDS (< md) */}
        <div className="space-y-3 md:hidden">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-32 w-full rounded-2xl bg-white border border-slate-200/80 dark:bg-[#121614] dark:border-[#1F2623]" />
            ))
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center dark:border-[#1F2623] dark:bg-[#121614]">
              <Users className="mx-auto h-8 w-8 text-slate-300 dark:text-neutral-600 mb-2" />
              <p className="text-sm font-medium text-slate-900 dark:text-white">No members found</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
                No member profiles match your search criteria.
              </p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white font-bold dark:bg-[#10B981] dark:text-black px-4 py-2 text-xs hover:bg-emerald-500 dark:hover:bg-[#0EA57E] transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Enroll New Member</span>
              </button>
            </div>
          ) : (
            filtered.map((c) => {
              const initials = c.full_name
                ? c.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "MB";
              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-emerald-500/40 space-y-3 shadow-xs dark:border-[#1F2623] dark:bg-[#121614] dark:hover:border-[#10B981]/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-emerald-700 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-[#10B981]">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900 dark:text-white text-sm">
                          {c.full_name}
                        </p>
                        <p className="text-xs font-mono text-slate-500 dark:text-neutral-400 tabular-nums">
                          {c.customer_code || c.id}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {c.status || "ACTIVE"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-700 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-neutral-300">
                      {c.batch_name || "Palagara Seetu"}
                    </span>
                    <span className="text-slate-400 dark:text-neutral-600">·</span>
                    <span className="text-slate-500 dark:text-neutral-400">
                      {c.group_name || "North Zone A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-[#1F2623] pt-2.5 text-xs">
                    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-neutral-400 font-mono tabular-nums">
                      <Calendar className="h-3 w-3" />
                      {c.joining_date || "Aug 2026"}
                    </span>

                    {c.phone_number ? (
                      <a
                        href={`tel:${c.phone_number}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-mono tabular-nums text-slate-700 hover:text-slate-900 hover:border-slate-300 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-neutral-300 dark:hover:text-white transition"
                      >
                        <Phone className="h-3 w-3 text-emerald-600 dark:text-[#10B981]" />
                        <span>{c.phone_number}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 dark:text-neutral-500 font-mono">No phone</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DESKTOP TABLE (>= md) */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-[#1F2623] dark:bg-[#121614]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/80 dark:bg-[#0E1110] dark:text-neutral-400 dark:border-[#1F2623]">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Member</th>
                  <th className="px-5 py-3.5 font-medium">Phone & KYC</th>
                  <th className="px-5 py-3.5 font-medium">Scheme Batch</th>
                  <th className="px-5 py-3.5 font-medium">Route Group</th>
                  <th className="px-5 py-3.5 font-medium">Joining Date</th>
                  <th className="px-5 py-3.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1F2623]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-5 py-4">
                        <SkeletonBlock className="h-7 w-full rounded-lg bg-slate-100 dark:bg-[#0E1110]" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <Users className="mx-auto h-8 w-8 text-slate-300 dark:text-neutral-600 mb-2" />
                      <p className="text-sm font-medium text-slate-900 dark:text-white">No members found</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
                        No member profiles match your search criteria.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white font-bold dark:bg-[#10B981] dark:text-black px-4 py-2 text-xs hover:bg-emerald-500 dark:hover:bg-[#0EA57E] transition cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Enroll New Member</span>
                      </button>
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const initials = c.full_name
                      ? c.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "MB";
                    return (
                      <tr
                        key={c.id}
                        className="transition hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-emerald-700 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-[#10B981]">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {c.full_name}
                              </p>
                              <p className="text-xs font-mono text-slate-500 dark:text-neutral-400 tabular-nums">
                                {c.customer_code || c.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-mono text-xs tabular-nums text-slate-800 dark:text-neutral-300">
                            {c.phone_number || "—"}
                          </p>
                          {c.id_proof_number && (
                            <p className="font-mono text-[11px] text-slate-400 dark:text-neutral-500 tabular-nums">
                              KYC: {c.id_proof_number}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-neutral-200">
                          {c.batch_name || "Palagara Seetu"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-neutral-400">
                          {c.group_name || "North Zone A"}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-mono tabular-nums text-slate-500 dark:text-neutral-400">
                          {c.joining_date || "Aug 2026"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            {c.status || "ACTIVE"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto dark:border-[#1F2623] dark:bg-[#121614]">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200/80 dark:border-[#1F2623] pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Enroll New Customer / Member
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-neutral-400">
                  Enter member personal details and assign scheme batch & route group.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEnroll} className="mt-4 space-y-3.5 text-xs">
              {/* Member ID UI */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block font-medium text-slate-700 dark:text-neutral-300">
                    Member ID Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsEditSeq(!isEditSeq)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-[#10B981] hover:underline cursor-pointer"
                  >
                    {isEditSeq ? (
                      <>
                        <RefreshCw className="h-3 w-3" />
                        <span>Auto-Sequence</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-3 w-3" />
                        <span>Edit Number</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="mt-1 flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-[#1F2623] dark:bg-[#0E1110]">
                  <span className="shrink-0 whitespace-nowrap select-none bg-slate-200/60 dark:bg-white/[0.04] px-3 py-2.5 font-mono font-bold text-emerald-700 dark:text-[#10B981]">
                    {prefixCode}
                  </span>
                  <input
                    type="text"
                    required
                    readOnly={!isEditSeq}
                    value={customSeqNum}
                    onChange={(e) => setCustomSeqNum(e.target.value.replace(/\D/g, ""))}
                    placeholder="001"
                    className={`w-full min-h-[44px] bg-transparent px-3 py-2 font-mono font-bold outline-none text-slate-900 dark:text-white ${
                      !isEditSeq ? "cursor-not-allowed text-slate-400 dark:text-neutral-500" : "focus:ring-2 focus:ring-emerald-500 dark:focus:ring-[#10B981]"
                    }`}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-500 dark:text-neutral-400">
                  Format: <span className="font-mono font-bold text-slate-700 dark:text-neutral-300">{prefixCode}[Number]</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-neutral-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Arun Kumar"
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-neutral-300">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-neutral-300">
                    Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Door No, Street, City"
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-neutral-300">
                    ID Proof / KYC Number
                  </label>
                  <input
                    type="text"
                    value={idProof}
                    onChange={(e) => setIdProof(e.target.value)}
                    placeholder="Aadhaar / Voter ID"
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-neutral-300">
                    Scheme Batch
                  </label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981] cursor-pointer"
                  >
                    <option value="">Select Scheme Batch...</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batch_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-neutral-300">
                    Route Group
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981] cursor-pointer"
                  >
                    <option value="">Select Route Group...</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.group_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-neutral-300">
                  Joining Date
                </label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981] font-semibold"
                />
              </div>

              {/* Late Joiner Past Cycles Policy Selector */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-neutral-300">
                  Past Cycles Policy for Late Joiners
                </label>
                <div className="mt-1.5 space-y-2">
                  <label
                    onClick={() => setLateJoinerPolicy("OPTION_A")}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                      lateJoinerPolicy === "OPTION_A"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:border-[#10B981] dark:bg-emerald-500/10 dark:text-white"
                        : "border-slate-200 bg-slate-50 text-slate-600 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-neutral-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="policy"
                      checked={lateJoinerPolicy === "OPTION_A"}
                      onChange={() => setLateJoinerPolicy("OPTION_A")}
                      className="mt-0.5 accent-emerald-600 dark:accent-[#10B981]"
                    />
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">Option A: Start Fresh from Joining Date</p>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                        Cycle #1 starts on joining date. No past dues carried over.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setLateJoinerPolicy("OPTION_B")}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                      lateJoinerPolicy === "OPTION_B"
                        ? "border-amber-500 bg-amber-500/10 text-amber-950 dark:border-amber-500 dark:bg-amber-500/10 dark:text-white"
                        : "border-slate-200 bg-slate-50 text-slate-600 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-neutral-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="policy"
                      checked={lateJoinerPolicy === "OPTION_B"}
                      onChange={() => setLateJoinerPolicy("OPTION_B")}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">Option B: Carry Previous Dues as Pending</p>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                        Past cycles before joining date are flagged as Overdue Pending and added to dues.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setLateJoinerPolicy("OPTION_C")}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                      lateJoinerPolicy === "OPTION_C"
                        ? "border-sky-500 bg-sky-500/10 text-sky-950 dark:border-sky-500 dark:bg-sky-500/10 dark:text-white"
                        : "border-slate-200 bg-slate-50 text-slate-600 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-neutral-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="policy"
                      checked={lateJoinerPolicy === "OPTION_C"}
                      onChange={() => setLateJoinerPolicy("OPTION_C")}
                      className="mt-0.5 accent-sky-500"
                    />
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-white">Option C: Skip Disallowed Past Cycles (₹0 Skipped)</p>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                        Past cycles before joining date are marked as SKIPPED (₹0) without adding past dues.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#1F2623]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto min-h-[44px] flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-[#1F2623] dark:text-neutral-300 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto min-h-[44px] flex items-center justify-center rounded-xl bg-emerald-600 text-white font-bold dark:bg-[#10B981] dark:text-black px-6 py-2.5 text-xs shadow-md hover:bg-emerald-500 dark:hover:bg-[#0EA57E] disabled:opacity-50 cursor-pointer transition"
                >
                  {submitting ? "Saving..." : "Enroll Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
