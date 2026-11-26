"use client";

import { BrandLogo } from "@/components/brand-logo";

export interface ReceiptData {
  receiptNo: string;
  customerName: string;
  customerCode: string;
  phone: string;
  amount: number;
  scheme: string;
  route: string;
  remainingDues: number;
  advanceBalance: number;
  date: string;
}

export function generateWhatsAppUrl(receipt: ReceiptData) {
  const cleanPhone = (receipt.phone || "").replace(/[^0-9]/g, "");
  const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const duesText =
    receipt.remainingDues > 0
      ? `Pending Dues: ₹${receipt.remainingDues.toLocaleString("en-IN")}`
      : receipt.advanceBalance > 0
        ? `Advance Credit: ₹${receipt.advanceBalance.toLocaleString("en-IN")}`
        : `Dues Cleared (₹0 Remaining)`;

  const text = `🧾 *AarFin Nest - Payment Receipt*
━━━━━━━━━━━━━━━━━━━━
*Receipt No:* ${receipt.receiptNo}
*Date:* ${receipt.date}
*Customer:* ${receipt.customerName} (${receipt.customerCode})
*Scheme:* ${receipt.scheme}
*Route:* ${receipt.route}
*Amount Paid:* ₹${receipt.amount.toLocaleString("en-IN")}
*Payment Mode:* CASH
*Status:* ${duesText}
━━━━━━━━━━━━━━━━━━━━
Thank you for your timely payment!`;

  return `https://api.whatsapp.com/send?${targetPhone ? `phone=${targetPhone}&` : ""}text=${encodeURIComponent(text)}`;
}

export function ReceiptModal({
  receipt,
  onClose,
  onNext,
  hasNext,
}: {
  receipt: ReceiptData | null;
  onClose: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}) {
  if (!receipt) return null;

  const whatsappUrl = generateWhatsAppUrl(receipt);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xl dark:border-[#202425] dark:bg-[#151718] text-center animate-fade-in-up">
        {/* Success Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h3 className="mt-3 text-lg font-extrabold text-slate-900 dark:text-white">
          Payment Recorded!
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Receipt successfully generated & ledger updated.
        </p>

        {/* Receipt Card */}
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-left dark:border-slate-700 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <BrandLogo className="h-5 w-auto object-contain" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                AarFin Nest
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400">
              {receipt.receiptNo}
            </span>
          </div>

          <div className="mt-2.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Customer:</span>
              <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                {receipt.customerName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Member ID:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {receipt.customerCode}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Scheme:</span>
              <span className="text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                {receipt.scheme}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Date:</span>
              <span className="text-slate-700 dark:text-slate-300">
                {receipt.date}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200/70 pt-2 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Amount Paid:
              </span>
              <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                ₹{receipt.amount.toLocaleString("en-IN")}
              </span>
            </div>
            {receipt.remainingDues > 0 && (
              <div className="flex items-center justify-between text-[11px] text-rose-600 dark:text-rose-400">
                <span>Remaining Due:</span>
                <span className="font-bold">
                  ₹{receipt.remainingDues.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp & Print Actions */}
        <div className="mt-4 space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500 cursor-pointer"
          >
            <span>📱 Send WhatsApp Receipt</span>
          </a>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 min-h-[44px] flex items-center justify-center rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
            >
              🖨 Print / PDF
            </button>

            {hasNext && onNext ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNext();
                }}
                className="flex-1 min-h-[44px] flex items-center justify-center rounded-xl bg-teal-700 text-xs font-bold text-white hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer"
              >
                Next Member →
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[44px] flex items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 cursor-pointer"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
