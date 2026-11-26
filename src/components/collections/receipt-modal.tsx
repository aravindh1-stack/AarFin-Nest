"use client";

import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import {
  Printer,
  Share2,
  CheckCircle2,
  ArrowRight,
  X,
  FileText,
} from "lucide-react";

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

  const text = `*NexFix Financial OS - Official Ledger Receipt*
----------------------------------------
Receipt No: ${receipt.receiptNo}
Date: ${receipt.date}
Member: ${receipt.customerName} (${receipt.customerCode})
Scheme: ${receipt.scheme}
Route: ${receipt.route}
Amount Paid: ₹${receipt.amount.toLocaleString("en-IN")}
Payment Mode: CASH (Field Collection)
Account Balance: ${duesText}
----------------------------------------
Digital Verification: https://nexfix.io/r/${receipt.receiptNo}
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
  const [viewMode, setViewMode] = useState<"standard" | "thermal">("thermal");
  const [btStatus, setBtStatus] = useState<string>("READY");

  if (!receipt) return null;

  const whatsappUrl = generateWhatsAppUrl(receipt);

  const handlePrint = () => {
    window.print();
  };

  const simulateBtPrint = () => {
    setBtStatus("PRINTING...");
    setTimeout(() => {
      setBtStatus("PRINTED");
      setTimeout(() => setBtStatus("READY"), 2500);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xl dark:border-[#242a30] dark:bg-[#121518] text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header & View Mode Switcher */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl dark:bg-slate-800/80 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("thermal")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                viewMode === "thermal"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              58mm Thermal
            </button>
            <button
              type="button"
              onClick={() => setViewMode("standard")}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                viewMode === "standard"
                  ? "bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
              }`}
            >
              Card View
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ========================================= */}
        {/* 1. THERMAL POS 58MM PAPER SLIP PREVIEW */}
        {/* ========================================= */}
        {viewMode === "thermal" ? (
          <div className="my-4 mx-auto max-w-[280px] bg-[#FAF8F5] text-slate-900 p-4 rounded-md shadow-inner border border-amber-200/60 font-mono text-left text-[11px] leading-tight select-none">
            
            <div className="text-center font-bold text-xs uppercase tracking-wider mb-1">
              NEXFIX FINANCIAL OS
            </div>
            <div className="text-center text-[10px] text-slate-600 mb-2">
              Autonomous Micro-Finance Ledger<br />
              System Auth: NF-SYS-2026
            </div>

            <div className="border-t border-dashed border-slate-400 my-1.5"></div>

            <div className="flex justify-between">
              <span>RC#:</span>
              <span className="font-bold">{receipt.receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span>DATE:</span>
              <span>{receipt.date}</span>
            </div>
            <div className="flex justify-between">
              <span>MEMBER:</span>
              <span className="font-bold truncate max-w-[150px]">{receipt.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>CODE:</span>
              <span>{receipt.customerCode}</span>
            </div>
            <div className="flex justify-between">
              <span>ROUTE:</span>
              <span className="truncate max-w-[150px]">{receipt.route}</span>
            </div>

            <div className="border-t border-dashed border-slate-400 my-1.5"></div>

            <div className="flex justify-between text-xs font-extrabold my-1">
              <span>AMT PAID:</span>
              <span className="text-sm">₹{receipt.amount.toLocaleString("en-IN")}.00</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>MODE:</span>
              <span>CASH RECEIVED (FIFO)</span>
            </div>

            <div className="border-t border-dashed border-slate-400 my-1.5"></div>

            <div className="flex justify-between">
              <span>BALANCE:</span>
              <span className="font-bold">
                {receipt.remainingDues > 0
                  ? `₹${receipt.remainingDues.toLocaleString("en-IN")} DUE`
                  : receipt.advanceBalance > 0
                  ? `+₹${receipt.advanceBalance.toLocaleString("en-IN")} ADV`
                  : "NIL (CLEAR)"}
              </span>
            </div>

            <div className="border-t border-dashed border-slate-400 my-2"></div>

            <div className="text-center text-[9px] text-slate-500 space-y-0.5">
              <div>Official Digital Receipt</div>
              <div className="font-bold text-[8px] text-slate-400 mt-1">TAMPER-PROOF AUDIT LEDGER</div>
            </div>
          </div>
        ) : (
          /* ========================================= */
          /* 2. STANDARD FINTECH CARD VIEW */
          /* ========================================= */
          <div className="my-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left dark:border-slate-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BrandLogo className="h-5 w-auto object-contain" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">NexFix</span>
              </div>
              <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400">
                {receipt.receiptNo}
              </span>
            </div>

            <div className="mt-2.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900 dark:text-white truncate max-w-[170px]">{receipt.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Member ID:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{receipt.customerCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Scheme:</span>
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[170px]">{receipt.scheme}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/70 pt-2 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Amount Paid:</span>
                <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹{receipt.amount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp & Print Actions */}
        <div className="space-y-2">
          {/* Bluetooth Print Button */}
          <button
            type="button"
            onClick={simulateBtPrint}
            className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-slate-800 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400 transition cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>
              {btStatus === "PRINTING..."
                ? "Printing to 58mm..."
                : btStatus === "PRINTED"
                ? "Receipt Printed Successfully"
                : "Print via Bluetooth (58mm)"}
            </span>
          </button>

          {/* WhatsApp Direct Link */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>Dispatch Digital WhatsApp Receipt</span>
          </a>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>System PDF</span>
            </button>

            {hasNext && onNext ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNext();
                }}
                className="flex-1 min-h-[40px] flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 text-xs font-bold text-white hover:bg-teal-500 cursor-pointer"
              >
                <span>Next Member</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[40px] flex items-center justify-center rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
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
