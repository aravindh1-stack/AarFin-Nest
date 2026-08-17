"use client";

import { useEffect, useMemo, useState } from "react";
import { SkeletonBlock } from "@/components/skeleton-block";
import { DashboardTopbar } from "@/components/dashboard/topbar";

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

    const matchedBatch = batches.find((b) => b.id === selectedBatchId);
    const matchedGroup = groups.find((g) => g.id === selectedGroupId);

    const payload = {
      customer_code: finalCustomerCode,
      full_name: fullName,
      phone_number: phone,
      address: address,
      id_proof_number: idProof,
      batch_id: selectedBatchId || null,
      batch_name: matchedBatch?.batch_name || "Palagara Seetu",
      group_id: selectedGroupId || null,
      group_name: matchedGroup?.group_name || "North Zone A",
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
      }
    } catch (err) {
      console.error("Error enrolling member:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <DashboardTopbar
        title="Customer Directory & Enrollment"
        description="Register members, assign scheme batches & route groups"
      />

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 3.55 9.7l3.13 3.12a.75.75 0 1 0 1.06-1.06l-3.12-3.13A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search member, phone, code..."
              className="w-full rounded-lg border border-slate-200/80 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none ring-teal-500/30 transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 dark:border-slate-800/50 dark:bg-[#121212] dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer"
          >
            + Enroll New Member
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm dark:border-slate-800/50 dark:bg-[#121212]/70">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs text-slate-500 dark:bg-white/[0.02] dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Member</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Scheme Batch</th>
                  <th className="px-5 py-3 font-semibold">Route Group</th>
                  <th className="px-5 py-3 font-semibold">Joining Date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-slate-200/70 dark:border-slate-800/50">
                      <td colSpan={6} className="px-5 py-4">
                        <SkeletonBlock className="h-7 w-full rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-500">
                      No members found matching this search.
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
                        className="border-t border-slate-200/70 transition hover:bg-slate-50/80 dark:border-slate-800/50 dark:hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-700 text-[11px] font-bold text-white">
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 dark:text-slate-200">
                                {c.full_name}
                              </p>
                              <p className="text-xs font-mono text-slate-400">
                                {c.customer_code || c.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                          {c.phone_number || "—"}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-teal-600 dark:text-teal-400">
                          {c.batch_name || "Palagara Seetu"}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                          {c.group_name || "North Zone A"}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                          {c.joining_date || "Aug 2026"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl dark:border-slate-800/50 dark:bg-[#121212]">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Enroll New Customer / Member
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Enter member personal details and assign scheme batch & route group.
            </p>

            <form onSubmit={handleEnroll} className="mt-4 space-y-3 text-xs">
              {/* Protected Member ID UI */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block font-medium text-slate-700 dark:text-slate-300">
                    Member ID Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsEditSeq(!isEditSeq)}
                    className="text-[11px] font-semibold text-teal-600 hover:underline dark:text-teal-400 cursor-pointer"
                  >
                    {isEditSeq ? "⚡ Auto-Sequence" : "✏️ Edit Number"}
                  </button>
                </div>
                <div className="mt-1 flex items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#000000]">
                  <span className="shrink-0 whitespace-nowrap select-none bg-slate-200/80 px-3 py-2.5 font-mono font-extrabold text-slate-700 dark:bg-white/10 dark:text-teal-400">
                    {prefixCode}
                  </span>
                  <input
                    type="text"
                    required
                    readOnly={!isEditSeq}
                    value={customSeqNum}
                    onChange={(e) => setCustomSeqNum(e.target.value.replace(/\D/g, ""))}
                    placeholder="001"
                    className={`w-full bg-transparent px-3 py-2.5 font-mono font-bold outline-none text-slate-900 dark:text-white ${
                      !isEditSeq ? "cursor-not-allowed text-slate-500" : "focus:ring-2 focus:ring-teal-500"
                    }`}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Protected System Format: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{prefixCode}[Number]</span> (Prefix <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{prefixCode}</span> is locked; edit number only).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Arun Kumar"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-[#000000] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-[#000000] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Door No, Street, Landmark, City"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-[#000000] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300">
                    Scheme Batch
                  </label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-[#000000] dark:text-white"
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
                  <label className="block font-medium text-slate-700 dark:text-slate-300">
                    Route Group
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-[#000000] dark:text-white"
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
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  Joining Date
                </label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-800 dark:bg-[#000000] dark:text-white font-semibold"
                />
              </div>

              {/* Late Joiner Past Cycles Policy Selector */}
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300">
                  Past Cycles Policy for Late Joiners
                </label>
                <div className="mt-1.5 space-y-2">
                  <label
                    onClick={() => setLateJoinerPolicy("OPTION_A")}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                      lateJoinerPolicy === "OPTION_A"
                        ? "border-teal-500 bg-teal-500/10 text-teal-900 dark:text-teal-200"
                        : "border-slate-200 bg-slate-50/50 text-slate-600 dark:border-slate-800 dark:bg-white/[0.02] dark:text-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="policy"
                      checked={lateJoinerPolicy === "OPTION_A"}
                      onChange={() => setLateJoinerPolicy("OPTION_A")}
                      className="mt-0.5 accent-teal-600"
                    />
                    <div>
                      <p className="font-bold text-xs">Option A: Start Fresh from Joining Date (Dynamic Timeline)</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Cycle #1 starts on joining date. No past dues carried over.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setLateJoinerPolicy("OPTION_B")}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                      lateJoinerPolicy === "OPTION_B"
                        ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                        : "border-slate-200 bg-slate-50/50 text-slate-600 dark:border-slate-800 dark:bg-white/[0.02] dark:text-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="policy"
                      checked={lateJoinerPolicy === "OPTION_B"}
                      onChange={() => setLateJoinerPolicy("OPTION_B")}
                      className="mt-0.5 accent-amber-600"
                    />
                    <div>
                      <p className="font-bold text-xs">Option B: Carry Previous Dues as Pending (Carried Overdue)</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Past cycles before joining date are flagged as Overdue Pending and added to dues.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setLateJoinerPolicy("OPTION_C")}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition ${
                      lateJoinerPolicy === "OPTION_C"
                        ? "border-sky-500 bg-sky-500/10 text-sky-900 dark:text-sky-200"
                        : "border-slate-200 bg-slate-50/50 text-slate-600 dark:border-slate-800 dark:bg-white/[0.02] dark:text-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="policy"
                      checked={lateJoinerPolicy === "OPTION_C"}
                      onChange={() => setLateJoinerPolicy("OPTION_C")}
                      className="mt-0.5 accent-sky-600"
                    />
                    <div>
                      <p className="font-bold text-xs">Option C: Skip Disallowed Past Cycles (₹0 Skipped)</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Past cycles before joining date are marked as SKIPPED (₹0) without adding past dues.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 dark:border-slate-800 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-teal-700 px-4 py-2 text-white font-semibold hover:bg-teal-600 dark:bg-teal-600"
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
