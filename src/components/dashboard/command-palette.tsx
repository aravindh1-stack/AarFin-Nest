"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Receipt,
  Scale,
  Users,
  Layers,
  MapPin,
  FileText,
  ShieldAlert,
  CreditCard,
  CornerDownLeft,
} from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const quickNav = [
    { label: "Collections Hub", href: "/dashboard/collections", icon: Receipt, category: "Core Operations" },
    { label: "EOD Cash Reconciliation", href: "/dashboard/reconciliation", icon: Scale, category: "Cash & Control" },
    { label: "Customer Directory", href: "/dashboard/customers", icon: Users, category: "Core Operations" },
    { label: "Schemes & Batches", href: "/dashboard/schemes", icon: Layers, category: "Configuration" },
    { label: "Routes & Groups", href: "/dashboard/routes", icon: MapPin, category: "Configuration" },
    { label: "Financial Reports Studio", href: "/dashboard/reports", icon: FileText, category: "Analytics" },
    { label: "Audit Telemetry Logs", href: "/dashboard/audit", icon: ShieldAlert, category: "Compliance" },
    { label: "SaaS Billing & Seats", href: "/dashboard/billing", icon: CreditCard, category: "Organization" },
  ];

  const filtered = quickNav.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/70 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-xl rounded-2xl border border-slate-700/80 bg-white shadow-2xl overflow-hidden dark:bg-[#121518] dark:border-[#242a30] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command, route, or member code (e.g. #104)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none dark:text-white"
          />
          <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation & Commands
          </div>
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching pages or commands found for &quot;{query}&quot;.
            </div>
          ) : (
            filtered.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => navigate(item.href)}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-teal-500/10 hover:text-teal-700 dark:text-slate-300 dark:hover:bg-teal-500/15 dark:hover:text-teal-300 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <IconComp className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.category}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    Jump <CornerDownLeft className="h-3 w-3" />
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Bottom Help bar */}
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 dark:border-slate-800 dark:bg-[#0c0e11] dark:text-slate-400">
          <span>Pro tip: Press <kbd className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">⌘K</kbd> anywhere to open</span>
          <span className="text-teal-600 dark:text-teal-400 font-medium">NexFix Command Palette</span>
        </div>
      </div>
    </div>
  );
}
