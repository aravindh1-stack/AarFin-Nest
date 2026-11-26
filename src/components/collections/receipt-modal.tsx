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
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-500 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M12.031 2c-5.508 0-9.985 4.477-9.985 9.985 0 1.761.459 3.477 1.332 4.992L2 22l5.168-1.355a9.96 9.96 0 0 0 4.863 1.258h.004c5.507 0 9.984-4.477 9.984-9.985 0-2.668-1.04-5.176-2.926-7.062A9.925 9.925 0 0 0 12.031 2zm0 18.258h-.003a8.27 8.27 0 0 1-4.223-1.152l-.303-.18-3.137.823.837-3.059-.197-.313a8.27 8.27 0 0 1-1.267-4.407c0-4.57 3.719-8.289 8.293-8.289a8.24 8.24 0 0 1 5.867 2.43 8.244 8.244 0 0 1 2.427 5.864c0 4.57-3.719 8.283-8.294 8.283zm4.547-6.207c-.249-.125-1.477-.729-1.705-.812-.229-.084-.395-.125-.561.125s-.644.812-.789.979c-.146.166-.291.187-.541.062-.249-.125-1.054-.389-2.008-1.24-.742-.662-1.243-1.48-1.389-1.73-.146-.249-.015-.384.109-.508.112-.112.249-.291.374-.437.125-.146.166-.249.249-.416.084-.166.042-.312-.021-.437-.062-.125-.561-1.353-.77-1.853-.203-.487-.409-.42-.561-.428-.146-.007-.312-.009-.479-.009s-.437.062-.665.312c-.229.249-.874.854-.874 2.083 0 1.229.895 2.416 1.02 2.583.125.166 1.761 2.689 4.266 3.771.596.257 1.061.411 1.424.526.598.19 1.143.163 1.574.099.48-.072 1.477-.604 1.685-1.187.208-.583.208-1.083.146-1.187-.063-.105-.229-.167-.478-.292z"/>
            </svg>
            <span>Send WhatsApp Receipt</span>
          </a>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print / PDF</span>
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
