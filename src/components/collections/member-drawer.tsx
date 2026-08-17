"use client";

import { useState } from "react";
import { StatusPill } from "@/components/status-pill";
import type { Member } from "@/lib/mock-members";

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function MemberDrawer({
  member,
  onClose,
}: {
  member: Member | null;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const open = member !== null;
  const firstOpenInstallment = member?.installments.find(
    (i) => i.status === "PENDING" || i.status === "PARTIAL",
  );

  const handleApplyPayment = async () => {
    if (!member || !amount) return;
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: member.id,
          amount: Number(amount),
          payment_method: "CASH",
          status: "PAID",
          payment_date: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setFeedbackMsg(`✓ Payment of ₹${Number(amount).toLocaleString("en-IN")} recorded to DB!`);
        setAmount("");
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        const err = await res.json();
        setFeedbackMsg(`⚠️ Error: ${err.error || "Failed to record payment"}`);
      }
    } catch (error: any) {
      setFeedbackMsg(`⚠️ Network error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Member details"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md transform flex-col border-l border-slate-200/80 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-slate-800/50 dark:bg-[#000000] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {member && (
          <>
            <div className="flex items-start justify-between border-b border-slate-200/70 px-6 py-5 dark:border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-700 text-sm font-bold text-white">
                  {member.initials}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {member.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {member.id} · Member since {member.memberSince}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94Z" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {feedbackMsg && (
                <div className="mb-4 rounded-xl border border-teal-500/30 bg-teal-500/10 p-3 text-xs font-semibold text-teal-300">
                  {feedbackMsg}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="rounded-full border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 font-semibold text-teal-700 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300">
                  {member.scheme}
                </span>
                <span>{member.route}</span>
                <span>{member.phone}</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800/50 dark:bg-white/[0.02]">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Total Pending Dues
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(member.totalPendingDues)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800/50 dark:bg-white/[0.02]">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Advance Balance
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(member.advanceBalance)}
                  </p>
                </div>
              </div>

              {member.advanceBalance > 0 && (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                    This member is carrying an advance credit of{" "}
                    <span className="font-bold">
                      {formatCurrency(member.advanceBalance)}
                    </span>
                    . It will be auto-applied to the next cycle before any new
                    payment is requested.
                  </p>
                </div>
              )}

              <div className="mt-6 rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800/50 dark:bg-[#121212]">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Quick FIFO Payment Entry
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {firstOpenInstallment
                    ? `Will apply first to cycle #${firstOpenInstallment.cycle}, oldest open installment.`
                    : "No open installments — payment will be held as advance credit."}
                </p>

                <div className="mt-3 flex gap-2">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-7 pr-3 text-sm text-slate-900 outline-none ring-teal-500/30 transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 dark:border-slate-800 dark:bg-[#000000] dark:text-white dark:placeholder:text-slate-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyPayment}
                    disabled={!amount || submitting}
                    className="shrink-0 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-700/25 transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer"
                  >
                    {submitting ? "Posting..." : "Apply Payment"}
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    firstOpenInstallment?.amount,
                    1000,
                    2000,
                    5000,
                  ]
                    .filter(
                      (v, i, arr): v is number =>
                        typeof v === "number" && arr.indexOf(v) === i,
                    )
                    .slice(0, 4)
                    .map((quick) => (
                      <button
                        key={quick}
                        type="button"
                        onClick={() => setAmount(String(quick))}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-teal-500/40 hover:text-teal-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-500/40 dark:hover:text-teal-300 cursor-pointer"
                      >
                        {formatCurrency(quick)}
                      </button>
                    ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
                  Installment Cycles
                </h3>
                <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/50">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 dark:bg-white/[0.02] dark:text-slate-400">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">Cycle</th>
                        <th className="px-3 py-2.5 font-semibold">Due</th>
                        <th className="px-3 py-2.5 font-semibold">Amount</th>
                        <th className="px-3 py-2.5 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {member.installments.map((installment) => (
                        <tr
                          key={installment.cycle}
                          className="border-t border-slate-200/70 dark:border-slate-800/50"
                        >
                          <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                            #{installment.cycle}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                            {installment.dueDate}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                            {installment.status === "PARTIAL"
                              ? `${formatCurrency(installment.paidAmount)} / ${formatCurrency(installment.amount)}`
                              : formatCurrency(installment.amount)}
                          </td>
                          <td className="px-3 py-2.5">
                            <StatusPill status={installment.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200/70 px-6 py-4 dark:border-slate-800/50">
              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-500/40 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-500/40 dark:hover:text-teal-300 cursor-pointer"
              >
                View Full Payment History
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
