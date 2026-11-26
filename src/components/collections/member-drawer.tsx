"use client";

import { useState, useMemo } from "react";
import { StatusPill } from "@/components/status-pill";
import type { Member } from "@/lib/mock-members";
import { BrandLogo } from "@/components/brand-logo";
import { type ReceiptData, generateWhatsAppUrl } from "@/components/collections/receipt-modal";

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function MemberDrawer({
  member,
  onClose,
  onPaymentRecorded,
  onNavigatePrev,
  onNavigateNext,
  currentIndex,
  totalCount,
  onReceiptGenerated,
}: {
  member: Member | null;
  onClose: () => void;
  onPaymentRecorded?: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  currentIndex?: number;
  totalCount?: number;
  onReceiptGenerated?: (receipt: ReceiptData) => void;
}) {
  const [activeTab, setActiveTab] = useState<"pay" | "schedule" | "receipts" | "profile">("schedule");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const open = member !== null;

  // Derive default cycle amount
  const cycleAmount = useMemo(() => {
    return (member as any)?.installmentAmount || member?.installments?.[0]?.amount || 500;
  }, [member]);

  const firstOpenInstallment = member?.installments.find(
    (i) => i.status === "PENDING" || i.status === "PARTIAL",
  );

  const handleApplyPayment = async (overrideAmount?: number) => {
    const payAmt = overrideAmount !== undefined ? overrideAmount : Number(amount);
    if (!member || !payAmt || payAmt <= 0) return;
    setSubmitting(true);
    setFeedbackMsg(null);

    try {
      const receiptNo = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: (member as any).dbId || member.id,
          amount_paid: payAmt,
          payment_method: "CASH",
          receipt_no: receiptNo,
          notes: "Field Collection Payment Entry",
          payment_date: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setFeedbackMsg(`✓ ₹${payAmt.toLocaleString("en-IN")} recorded successfully!`);
        setAmount("");
        if (onPaymentRecorded) {
          onPaymentRecorded();
        }

        const remaining = Math.max(0, (member.totalPendingDues || 0) - payAmt);
        const advance =
          payAmt > (member.totalPendingDues || 0)
            ? payAmt - (member.totalPendingDues || 0)
            : member.advanceBalance || 0;

        if (onReceiptGenerated) {
          onReceiptGenerated({
            receiptNo,
            customerName: member.name,
            customerCode: (member as any).customerCode || member.id,
            phone: (member as any).phone || "",
            amount: payAmt,
            scheme: member.scheme,
            route: member.route,
            remainingDues: remaining,
            advanceBalance: advance,
            date: new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          });
        }

        setTimeout(() => setFeedbackMsg(null), 3500);
      } else {
        const err = await res.json().catch(() => ({}));
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
      {/* Backdrop without GPU-heavy blur for 60fps mobile scrolling */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-950/60 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Member details"
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md transform flex-col bg-white shadow-2xl transition-transform duration-200 ease-out border-l border-slate-200 dark:border-[#202425] dark:bg-[#0C0D0E] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {member && (
          <>
            {/* 1. COMPACT CORPORATE HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 py-3 dark:border-[#202425] dark:bg-[#151718]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-xs font-bold text-white shadow-sm dark:bg-teal-600">
                  {member.initials}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {member.name}
                  </h2>
                  <p className="text-[11px] font-mono text-slate-500 truncate">
                    {(member as any).customerCode || member.id} • {member.scheme}
                  </p>
                </div>
              </div>

              {/* Prev / Next & Close */}
              <div className="flex items-center gap-1 shrink-0">
                {typeof currentIndex === "number" && typeof totalCount === "number" && totalCount > 1 && (
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white dark:border-[#202425] dark:bg-[#0C0D0E] mr-1">
                    <button
                      type="button"
                      disabled={!onNavigatePrev}
                      onClick={onNavigatePrev}
                      title="Previous Member"
                      className="h-8 w-8 flex items-center justify-center text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
                    >
                      ‹
                    </button>
                    <span className="text-[10px] font-bold px-1.5 text-slate-400">
                      {currentIndex + 1}/{totalCount}
                    </span>
                    <button
                      type="button"
                      disabled={!onNavigateNext}
                      onClick={onNavigateNext}
                      title="Next Member"
                      className="h-8 w-8 flex items-center justify-center text-xs font-bold text-teal-700 hover:bg-teal-50 disabled:opacity-30 disabled:cursor-not-allowed dark:text-teal-400 dark:hover:bg-white/5 cursor-pointer"
                    >
                      ›
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close panel"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-[#202425] dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 2. PINNED ABOVE-THE-FOLD HERO PAYMENT CARD (ZERO SCROLL NEEDED TO COLLECT) */}
            <div className="border-b border-slate-200 bg-white p-4 shadow-sm dark:border-[#202425] dark:bg-[#121314]">
              {feedbackMsg && (
                <div className="mb-2.5 rounded-xl border border-teal-500/30 bg-teal-500/10 p-2.5 text-xs font-bold text-teal-700 dark:text-teal-300 text-center">
                  {feedbackMsg}
                </div>
              )}

              {/* Dues & Balance Bar */}
              <div className="flex items-center justify-between pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Account Status
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {member.totalPendingDues > 0 ? (
                      <span className="font-mono text-xl font-black text-rose-600 dark:text-rose-400">
                        {formatCurrency(member.totalPendingDues)} Due
                      </span>
                    ) : member.advanceBalance > 0 ? (
                      <span className="font-mono text-xl font-black text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(member.advanceBalance)} Adv
                      </span>
                    ) : (
                      <span className="font-mono text-xl font-black text-slate-700 dark:text-slate-300">
                        ₹0 (Cleared)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-[10px] font-semibold text-slate-400 block">Cycle Amount</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                    {formatCurrency(cycleAmount)}
                  </span>
                </div>
              </div>

              {/* Direct Quick Payment Input & Apply Action */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={String(cycleAmount)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-3 text-base sm:text-sm font-bold text-slate-900 outline-none ring-teal-500/30 focus:border-teal-500 focus:ring-4 dark:border-[#202425] dark:bg-[#0C0D0E] dark:text-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyPayment()}
                  disabled={submitting || (!amount && member.totalPendingDues <= 0)}
                  className="h-11 px-5 rounded-xl bg-teal-700 text-xs font-bold text-white shadow-md hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer flex items-center justify-center shrink-0"
                >
                  {submitting ? "Saving..." : "Record Payment"}
                </button>
              </div>

              {/* 1-Tap Preset Chips */}
              <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {member.totalPendingDues > 0 && (
                  <button
                    type="button"
                    onClick={() => handleApplyPayment(member.totalPendingDues)}
                    disabled={submitting}
                    className="h-8 shrink-0 rounded-lg bg-rose-50 border border-rose-200 px-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-800/40 dark:text-rose-300 cursor-pointer"
                  >
                    Clear Full Dues ({formatCurrency(member.totalPendingDues)})
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setAmount(String(cycleAmount))}
                  className="h-8 shrink-0 rounded-lg border border-teal-500/30 bg-teal-500/10 px-2.5 text-xs font-bold text-teal-700 hover:bg-teal-500/20 dark:text-teal-300 cursor-pointer"
                >
                  1 Cycle ({formatCurrency(cycleAmount)})
                </button>

                {[500, 1000, 2000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(String(preset))}
                    className="h-8 shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700 hover:border-slate-300 dark:border-[#202425] dark:bg-white/5 dark:text-slate-300 cursor-pointer"
                  >
                    {formatCurrency(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. CORPORATE SEGMENTED TABS (SAVES 80% SCROLLING) */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 dark:border-[#202425] dark:bg-[#151718]/60">
              <button
                type="button"
                onClick={() => setActiveTab("schedule")}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                  activeTab === "schedule"
                    ? "border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-300"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Schedule ({member.installments?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("receipts")}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                  activeTab === "receipts"
                    ? "border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-300"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Receipts ({(member as any).rawPayments?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`py-2.5 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                  activeTab === "profile"
                    ? "border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-300"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Member Info
              </button>
            </div>

            {/* 4. TAB CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-4 pb-28">
              {/* TAB 1: SCHEDULE */}
              {activeTab === "schedule" && (
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-[#202425] dark:bg-[#151718]">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 dark:bg-white/[0.02] dark:border-[#202425] dark:text-slate-400">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Cycle</th>
                        <th className="px-3 py-2 font-semibold">Due Date</th>
                        <th className="px-3 py-2 font-semibold">Amount</th>
                        <th className="px-3 py-2 text-right font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#202425]">
                      {member.installments.map((inst) => (
                        <tr key={inst.cycle} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                          <td className="px-3 py-2.5 font-bold text-slate-800 dark:text-slate-200">
                            #{inst.cycle}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400">
                            {inst.dueDate}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-slate-800 dark:text-slate-200">
                            {inst.status === "PARTIAL"
                              ? `${formatCurrency(inst.paidAmount)} / ${formatCurrency(inst.amount)}`
                              : formatCurrency(inst.amount)}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <StatusPill status={inst.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 2: RECEIPTS */}
              {activeTab === "receipts" && (
                <div className="space-y-2.5">
                  {Array.isArray((member as any).rawPayments) && (member as any).rawPayments.length > 0 ? (
                    (member as any).rawPayments.map((pay: any, idx: number) => {
                      const payAmt = Number(pay.amount_paid || pay.amount || 0);
                      const recNo = pay.receipt_no || pay.receipt_number || `REC-${idx + 1}`;
                      const recDate = pay.payment_date?.split("T")[0] || "Today";

                      const receiptUrl = generateWhatsAppUrl({
                        receiptNo: recNo,
                        customerName: member.name,
                        customerCode: (member as any).customerCode || member.id,
                        phone: (member as any).phone || "",
                        amount: payAmt,
                        scheme: member.scheme,
                        route: member.route,
                        remainingDues: member.totalPendingDues,
                        advanceBalance: member.advanceBalance,
                        date: recDate,
                      });

                      return (
                        <div
                          key={pay.id || idx}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-sm dark:border-[#202425] dark:bg-[#151718]"
                        >
                          <div className="min-w-0">
                            <p className="font-mono font-bold text-teal-700 dark:text-teal-400 truncate">
                              {recNo}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {recDate} • {pay.payment_method || "CASH"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                              {formatCurrency(payAmt)}
                            </span>
                            <a
                              href={receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-8 px-2.5 flex items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-300"
                            >
                              Share
                            </a>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500 dark:border-[#202425] dark:bg-[#151718]">
                      No receipts logged for this member yet.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MEMBER PROFILE */}
              {activeTab === "profile" && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 text-xs dark:border-[#202425] dark:bg-[#151718]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-[#202425]">
                    <span className="text-slate-500">Phone Number:</span>
                    {(member as any).phone ? (
                      <a
                        href={`tel:${(member as any).phone}`}
                        className="flex items-center gap-1.5 font-bold text-teal-700 hover:underline dark:text-teal-400"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>{(member as any).phone}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400">Not recorded</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-[#202425]">
                    <span className="text-slate-500">Assigned Route:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {member.route}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-[#202425]">
                    <span className="text-slate-500">Scheme:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {member.scheme}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-[#202425]">
                    <span className="text-slate-500">Frequency:</span>
                    <span className="font-bold text-teal-700 dark:text-teal-400">
                      {(member as any).frequencyType || "WEEKLY"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-[#202425]">
                    <span className="text-slate-500">Joining Date:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {member.memberSince || "Aug 2026"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 5. SLIM CORPORATE BOTTOM ACTION BAR */}
            <div className="border-t border-slate-200 p-3 bg-white dark:border-[#202425] dark:bg-[#121314] flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-white/5 dark:text-slate-200 cursor-pointer"
              >
                Close
              </button>
              {onNavigateNext && (
                <button
                  type="button"
                  onClick={onNavigateNext}
                  className="flex-1 h-11 flex items-center justify-center gap-1 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 cursor-pointer"
                >
                  <span>Next Member</span>
                  <span>→</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
