"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  Settings,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  ChevronRight,
  Filter,
  Check,
  X,
  CreditCard,
  QrCode,
  Banknote,
  Sparkles,
  Smartphone,
  Maximize2,
  RotateCcw,
  LayoutDashboard,
  HandCoins,
  Users,
  FileBarChart,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Volume2,
  Wifi,
  BatteryCharging,
  SlidersHorizontal,
} from "lucide-react";

// Types
export interface PriorityCustomer {
  id: string;
  name: string;
  initials: string;
  phone: string;
  scheme: string;
  route: string;
  amountDue: number;
  dueDate: string;
  status: "TODAY" | "OVERDUE" | "UPCOMING" | "COLLECTED";
  urgencyDays?: number;
  lastPayment?: string;
  installmentCycle: number;
}

// Initial Mock High-Priority Collections
const INITIAL_CUSTOMERS: PriorityCustomer[] = [
  {
    id: "mem-01",
    name: "Arun Kumar",
    initials: "AK",
    phone: "+91 98765 43210",
    scheme: "Palagara Seetu (₹5k/mo)",
    route: "North Zone A • Stop 04",
    amountDue: 5000,
    dueDate: "Today, 5:00 PM",
    status: "TODAY",
    installmentCycle: 4,
    lastPayment: "05 Mar 2026 (₹2,000 partial)",
  },
  {
    id: "mem-02",
    name: "Meena Devi",
    initials: "MD",
    phone: "+91 91234 56780",
    scheme: "Vaara Kandhu (₹1.2k/wk)",
    route: "East Route 4 • Stop 11",
    amountDue: 2400,
    dueDate: "2 Days Overdue",
    status: "OVERDUE",
    urgencyDays: 2,
    installmentCycle: 10,
    lastPayment: "29 Jul 2026 (Full)",
  },
  {
    id: "mem-03",
    name: "Murugan Selvam",
    initials: "MS",
    phone: "+91 94432 11098",
    scheme: "Daily Chitti (₹500/day)",
    route: "North Zone A • Stop 02",
    amountDue: 1500,
    dueDate: "Today, 2:30 PM",
    status: "TODAY",
    installmentCycle: 18,
    lastPayment: "Yesterday (₹500 cash)",
  },
  {
    id: "mem-04",
    name: "Kavitha Rajan",
    initials: "KR",
    phone: "+91 97890 23451",
    scheme: "Monthly Gold Seetu",
    route: "Town Centre • Stop 08",
    amountDue: 10000,
    dueDate: "4 Days Overdue",
    status: "OVERDUE",
    urgencyDays: 4,
    installmentCycle: 7,
    lastPayment: "12 Feb 2026",
  },
  {
    id: "mem-05",
    name: "Priya Lakshmi",
    initials: "PL",
    phone: "+91 93445 67812",
    scheme: "Vaara Kandhu (₹2k/wk)",
    route: "South Market • Stop 15",
    amountDue: 4000,
    dueDate: "Tomorrow Morning",
    status: "UPCOMING",
    installmentCycle: 9,
    lastPayment: "28 Sep 2026",
  },
  {
    id: "mem-06",
    name: "Vigneshwaran P.",
    initials: "VP",
    phone: "+91 98401 77321",
    scheme: "Palagara Seetu (₹5k/mo)",
    route: "North Zone A • Stop 07",
    amountDue: 5000,
    dueDate: "Today, 6:30 PM",
    status: "TODAY",
    installmentCycle: 5,
    lastPayment: "05 Aug 2026",
  },
];

export function NexFixMobileView() {
  // View mode for desktop testing (Phone Frame vs Fluid Responsive)
  const [deviceMode, setDeviceMode] = useState<"phone" | "fluid">("phone");
  
  // Navigation active tab: "overview" | "collect" | "customers" | "reports"
  const [activeTab, setActiveTab] = useState<"overview" | "collect" | "customers" | "reports">("overview");

  // State
  const [customers, setCustomers] = useState<PriorityCustomer[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "TODAY" | "OVERDUE" | "COLLECTED">("ALL");
  
  // Modals & Panels
  const [quickCollectOpen, setQuickCollectOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<PriorityCustomer | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(5000);
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "BANK">("CASH");
  const [paymentNotes, setPaymentNotes] = useState("");
  
  // Header slideouts
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic Stats
  const totalCollectionsToday = useMemo(() => {
    const collected = customers
      .filter((c) => c.status === "COLLECTED")
      .reduce((sum, c) => sum + c.amountDue, 48500);
    return collected;
  }, [customers]);

  const totalPendingDues = useMemo(() => {
    return customers
      .filter((c) => c.status !== "COLLECTED")
      .reduce((sum, c) => sum + c.amountDue, 96100);
  }, [customers]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const matchesSearch =
        cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.scheme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.phone.includes(searchQuery);

      if (!matchesSearch) return false;

      if (filterType === "TODAY") return cust.status === "TODAY";
      if (filterType === "OVERDUE") return cust.status === "OVERDUE";
      if (filterType === "COLLECTED") return cust.status === "COLLECTED";
      return true;
    });
  }, [customers, searchQuery, filterType]);

  // Open Collect Modal for a specific customer
  const handleOpenCollect = (cust: PriorityCustomer) => {
    setSelectedCustomer(cust);
    setCollectAmount(cust.amountDue);
    setQuickCollectOpen(true);
  };

  // Open FAB Quick Collect
  const handleOpenFAB = () => {
    const defaultCust = customers.find((c) => c.status !== "COLLECTED") || customers[0];
    setSelectedCustomer(defaultCust);
    setCollectAmount(defaultCust ? defaultCust.amountDue : 5000);
    setQuickCollectOpen(true);
  };

  // Submit payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    // Update customer status to collected
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer.id
          ? {
              ...c,
              status: "COLLECTED",
              amountDue: Math.max(0, c.amountDue - collectAmount),
              lastPayment: `Just now (₹${collectAmount.toLocaleString("en-IN")} via ${paymentMode})`,
            }
          : c
      )
    );

    setQuickCollectOpen(false);
    showToast(`✓ Received ₹${collectAmount.toLocaleString("en-IN")} from ${selectedCustomer.name} (${paymentMode})`);
  };

  return (
    <div className="relative min-h-screen bg-[#090d16] text-slate-100 selection:bg-[#00e676]/30 selection:text-white antialiased">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00e676]/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-[130px]" />
      </div>

      {/* Top Banner for Screen Controls on Desktop */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00e676] to-emerald-600 shadow-[0_0_15px_rgba(0,230,118,0.35)]">
                <span className="text-sm font-black text-slate-950">NF</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tracking-tight text-white group-hover:text-[#00e676] transition-colors">
                    NexFix Mobile
                  </span>
                  <span className="rounded-full bg-[#00e676]/15 px-2 py-0.5 text-[10px] font-semibold text-[#00e676] border border-[#00e676]/30">
                    FIELD V2
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">AarFin Nest Neo-Finance Agent Suite</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode switch for testing view */}
            <div className="hidden sm:flex items-center rounded-xl bg-slate-900/90 p-1 border border-slate-800">
              <button
                onClick={() => setDeviceMode("phone")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  deviceMode === "phone"
                    ? "bg-[#00e676] text-slate-950 font-semibold shadow-[0_0_12px_rgba(0,230,118,0.4)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Phone Frame
              </button>
              <button
                onClick={() => setDeviceMode("fluid")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  deviceMode === "fluid"
                    ? "bg-[#00e676] text-slate-950 font-semibold shadow-[0_0_12px_rgba(0,230,118,0.4)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Fluid Full View
              </button>
            </div>

            <Link
              href="/dashboard/collections"
              className="inline-flex items-center gap-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors border border-slate-700/50"
            >
              <span>Desktop Hub</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main View Wrapper */}
      <main className="relative z-10 mx-auto flex items-center justify-center p-0 sm:py-8 sm:px-4">
        {/* Device Frame or Fluid Container */}
        <div
          className={`w-full transition-all duration-300 ${
            deviceMode === "phone"
              ? "max-w-[420px] rounded-[48px] border-[8px] border-slate-800/90 bg-[#0f172a] shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_50px_rgba(0,230,118,0.12)] ring-1 ring-white/10 overflow-hidden"
              : "max-w-md sm:max-w-xl md:max-w-2xl bg-[#0f172a] sm:rounded-3xl sm:border sm:border-slate-800 sm:shadow-2xl overflow-hidden"
          }`}
          style={{ minHeight: "880px" }}
        >
          {/* Mobile Screen Shell */}
          <div className="relative flex min-h-[880px] flex-col bg-[#0f172a] text-slate-100 pb-28">
            
            {/* Top iOS / Hardware Status Bar */}
            <div className="sticky top-0 z-40 bg-[#0f172a]/90 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-xs font-medium text-slate-300 select-none">
              <div className="font-semibold tracking-wider text-slate-200">09:41</div>
              {/* Dynamic Island Pill simulation */}
              <div className="h-4 w-24 rounded-full bg-slate-950 border border-slate-800/80 flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00e676] animate-pulse" />
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Wifi className="h-3.5 w-3.5 text-slate-300" />
                <span className="text-[10px] font-bold">5G</span>
                <BatteryCharging className="h-4 w-4 text-[#00e676]" />
              </div>
            </div>

            {/* HEADER: Greeting Section (Sundar Kumar - Admin) */}
            <div className="px-5 pt-3 pb-4">
              <div className="flex items-center justify-between">
                {/* Greeting & User Info */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-slate-800 via-slate-700 to-slate-800 p-0.5 shadow-md">
                      <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0f172a] font-bold text-[#00e676]">
                        SK
                      </div>
                    </div>
                    {/* Live Online Ping */}
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0f172a] bg-[#00e676] shadow-[0_0_8px_#00e676]" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">
                        Field Ops • North
                      </span>
                      <span className="inline-block h-1 w-1 rounded-full bg-[#00e676]" />
                      <span className="text-[10px] font-semibold text-[#00e676]">Live Route</span>
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                      Sundar Kumar
                      <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#00e676] border border-[#00e676]/30">
                        Admin
                      </span>
                    </h1>
                  </div>
                </div>

                {/* Notification & Settings Header Actions */}
                <div className="flex items-center gap-2">
                  {/* Notification Button */}
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 backdrop-blur-lg transition-all active:scale-95"
                    aria-label="Notifications"
                  >
                    <Bell className="h-4.5 w-4.5 text-slate-200" />
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e676] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e676] shadow-[0_0_6px_#00e676]" />
                    </span>
                  </button>

                  {/* Settings Button */}
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 backdrop-blur-lg transition-all active:scale-95"
                    aria-label="Settings"
                  >
                    <Settings className="h-4.5 w-4.5 text-slate-200 hover:rotate-45 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Today's Route Pill Banner */}
              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-800/50 border border-slate-800 px-3 py-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#00e676]" />
                  <span>North Zone Route A</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span>Today, 11 Oct</span>
                </div>
              </div>
            </div>

            {/* NOTIFICATIONS DROPDOWN MODAL */}
            {notificationsOpen && (
              <div className="mx-5 mb-4 rounded-2xl border border-slate-700/70 bg-slate-900/95 backdrop-blur-2xl p-4 shadow-2xl animate-fade-in-up z-30">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#00e676]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Field Alerts</span>
                  </div>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 space-y-2.5 text-xs">
                  <div className="flex gap-2.5 rounded-xl bg-slate-800/60 p-2.5 border border-slate-700/40">
                    <div className="h-2 w-2 rounded-full bg-[#00e676] mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-200">Daily Target 68% Reached</p>
                      <p className="text-[11px] text-slate-400">₹48,500 collected of ₹71,000 target for North Zone A.</p>
                      <span className="text-[10px] text-slate-500">12m ago</span>
                    </div>
                  </div>
                  <div className="flex gap-2.5 rounded-xl bg-slate-800/60 p-2.5 border border-slate-700/40">
                    <div className="h-2 w-2 rounded-full bg-amber-400 mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-200">Meena Devi Due Alert</p>
                      <p className="text-[11px] text-slate-400">Installment cycle #10 has been overdue by 2 days.</p>
                      <span className="text-[10px] text-slate-500">45m ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS DROPDOWN MODAL */}
            {settingsOpen && (
              <div className="mx-5 mb-4 rounded-2xl border border-slate-700/70 bg-slate-900/95 backdrop-blur-2xl p-4 shadow-2xl animate-fade-in-up z-30">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-[#00e676]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Agent Settings</span>
                  </div>
                  <button onClick={() => setSettingsOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-300">Offline Collection Queue</span>
                    <span className="text-[10px] font-semibold text-[#00e676] bg-[#00e676]/15 px-2 py-0.5 rounded-full">
                      ENABLED (Auto-sync)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-t border-slate-800">
                    <span className="text-slate-300">Sound on Receipt Confirmation</span>
                    <span className="text-[10px] font-semibold text-slate-400">CHIME ON</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-t border-slate-800">
                    <span className="text-slate-300">Printer / SMS Gateway</span>
                    <span className="text-[10px] font-semibold text-emerald-400">WhatsApp Direct</span>
                  </div>
                </div>
              </div>
            )}

            {/* STATS SECTION: Two Glassmorphic Cards Side-by-Side */}
            <div className="px-5 pt-1 pb-3">
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Collections Stat Card */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-xl p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all hover:border-[#00e676]/40 hover:shadow-[0_0_20px_rgba(0,230,118,0.15)] group">
                  {/* Subtle Top Inner Edge Highlight */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#00e676]/50 to-transparent" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium tracking-wide text-slate-400">Collections</span>
                    <span className="flex items-center gap-0.5 rounded-full bg-[#00e676]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#00e676] border border-[#00e676]/30">
                      <ArrowUpRight className="h-2.5 w-2.5" />
                      +18.4%
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-extrabold tracking-tight text-white font-mono">
                      ₹{totalCollectionsToday.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">Today&apos;s realized cash</p>

                  {/* Mini SVG Sparkline Trend Line (Collections Upward) */}
                  <div className="mt-2 h-9 w-full">
                    <svg viewBox="0 0 100 32" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="neonGreenGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00e676" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#00e676" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Area Fill */}
                      <path
                        d="M 0 28 Q 18 24, 30 18 T 55 14 T 75 8 T 100 2 L 100 32 L 0 32 Z"
                        fill="url(#neonGreenGradient)"
                      />
                      {/* Stroke Line */}
                      <path
                        d="M 0 28 Q 18 24, 30 18 T 55 14 T 75 8 T 100 2"
                        fill="none"
                        stroke="#00e676"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        filter="drop-shadow(0 0 4px #00e676)"
                      />
                      {/* Active end point */}
                      <circle cx="100" cy="2" r="2.8" fill="#ffffff" stroke="#00e676" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* 2. Pending Dues Stat Card */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-xl p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all hover:border-amber-400/30 hover:shadow-[0_0_20px_rgba(251,191,36,0.1)] group">
                  {/* Subtle Top Inner Edge Highlight */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium tracking-wide text-slate-400">Pending Dues</span>
                    <span className="flex items-center gap-0.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-400/30">
                      <Clock className="h-2.5 w-2.5" />
                      {customers.filter((c) => c.status !== "COLLECTED").length} Dues
                    </span>
                  </div>

                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-extrabold tracking-tight text-white font-mono">
                      ₹{totalPendingDues.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">On-field open cycle</p>

                  {/* Mini SVG Sparkline Trend Line (Pending Dues Controlled) */}
                  <div className="mt-2 h-9 w-full">
                    <svg viewBox="0 0 100 32" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Area Fill */}
                      <path
                        d="M 0 8 Q 22 10, 40 18 T 65 14 T 82 22 T 100 24 L 100 32 L 0 32 Z"
                        fill="url(#amberGradient)"
                      />
                      {/* Stroke Line */}
                      <path
                        d="M 0 8 Q 22 10, 40 18 T 65 14 T 82 22 T 100 24"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        filter="drop-shadow(0 0 3px #f59e0b)"
                      />
                      {/* Active end point */}
                      <circle cx="100" cy="24" r="2.8" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Route Progress Progress Bar */}
              <div className="mt-3 rounded-xl bg-slate-800/40 border border-slate-700/50 p-2.5 backdrop-blur-md">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-slate-300 font-medium flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-[#00e676]" />
                    Route Target Progress
                  </span>
                  <span className="font-bold text-[#00e676]">74% Completed</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-700/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#00e676] shadow-[0_0_10px_#00e676]"
                    style={{ width: "74%" }}
                  />
                </div>
              </div>
            </div>

            {/* SEARCH & FILTER CONTROLS */}
            <div className="px-5 py-2">
              {/* Search Bar with Glass Effect */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer, route, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 pl-9.5 pr-8 py-2.5 text-xs text-white placeholder-slate-400 backdrop-blur-xl focus:border-[#00e676] focus:outline-none focus:ring-1 focus:ring-[#00e676] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {(
                  [
                    { id: "ALL", label: "All Priority" },
                    { id: "TODAY", label: "Due Today" },
                    { id: "OVERDUE", label: "Overdue" },
                    { id: "COLLECTED", label: "Collected" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilterType(item.id)}
                    className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                      filterType === item.id
                        ? "bg-[#00e676] text-slate-950 shadow-[0_0_10px_rgba(0,230,118,0.35)]"
                        : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT: OVERVIEW (COLLECTION LIST) */}
            {activeTab === "overview" && (
              <div className="px-5 pt-1 space-y-3">
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      High-Priority Collections
                    </h2>
                    <span className="rounded-full bg-slate-800 px-2 py-0.2 text-[10px] font-bold text-slate-300">
                      {filteredCustomers.length}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">FIFO Sorted</span>
                </div>

                {/* Collection Cards List */}
                {filteredCustomers.length === 0 ? (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400">
                    <p className="text-xs font-medium">No customers found matching filter.</p>
                  </div>
                ) : (
                  filteredCustomers.map((cust) => {
                    const isCollected = cust.status === "COLLECTED";
                    const isOverdue = cust.status === "OVERDUE";
                    const isToday = cust.status === "TODAY";

                    return (
                      <div
                        key={cust.id}
                        className={`group relative overflow-hidden rounded-2xl border p-3.5 backdrop-blur-xl transition-all duration-200 ${
                          isCollected
                            ? "border-emerald-900/40 bg-slate-900/40 opacity-70"
                            : isOverdue
                            ? "border-amber-500/30 bg-slate-850/60 shadow-[0_4px_20px_rgba(245,158,11,0.06)] hover:border-amber-400/60"
                            : "border-slate-700/60 bg-slate-800/50 shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:border-[#00e676]/40 hover:shadow-[0_0_15px_rgba(0,230,118,0.12)]"
                        }`}
                      >
                        {/* Glow on left border for high priority */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${
                            isCollected
                              ? "bg-slate-600"
                              : isOverdue
                              ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                              : "bg-[#00e676] shadow-[0_0_8px_#00e676]"
                          }`}
                        />

                        {/* Top Row: Avatar, Name, Scheme & Amount Pill */}
                        <div className="flex items-start justify-between gap-2 pl-1.5">
                          {/* Avatar + Info */}
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-xs transition-transform group-hover:scale-105 ${
                                isCollected
                                  ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                                  : isOverdue
                                  ? "bg-amber-950/60 text-amber-300 border border-amber-600/40"
                                  : "bg-slate-800 text-[#00e676] border border-[#00e676]/30 shadow-[0_0_10px_rgba(0,230,118,0.2)]"
                              }`}
                            >
                              {isCollected ? <CheckCircle2 className="h-5 w-5" /> : cust.initials}
                            </div>

                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-sm font-bold text-white tracking-tight">
                                  {cust.name}
                                </h3>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  #{cust.installmentCycle}
                                </span>
                              </div>
                              <p className="text-[11px] font-medium text-slate-400 truncate max-w-[160px]">
                                {cust.scheme}
                              </p>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <MapPin className="h-2.5 w-2.5 text-slate-400" />
                                <span>{cust.route}</span>
                              </div>
                            </div>
                          </div>

                          {/* Amount Due with Highlight Pill */}
                          <div className="text-right shrink-0">
                            <div
                              className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-extrabold tracking-tight font-mono ${
                                isCollected
                                  ? "bg-slate-800 text-slate-400 border border-slate-700"
                                  : isOverdue
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                                  : "bg-[#00e676]/15 text-[#00e676] border border-[#00e676]/40 shadow-[0_0_12px_rgba(0,230,118,0.25)]"
                              }`}
                            >
                              {isCollected ? "PAID" : `₹${cust.amountDue.toLocaleString("en-IN")}`}
                            </div>

                            <div className="mt-1 flex items-center justify-end gap-1 text-[10px]">
                              {isOverdue && (
                                <span className="font-semibold text-amber-400 flex items-center gap-0.5">
                                  <AlertCircle className="h-2.5 w-2.5" />
                                  {cust.dueDate}
                                </span>
                              )}
                              {isToday && (
                                <span className="font-semibold text-[#00e676] flex items-center gap-0.5">
                                  <Clock className="h-2.5 w-2.5" />
                                  {cust.dueDate}
                                </span>
                              )}
                              {isCollected && (
                                <span className="text-emerald-400">Settled Today</span>
                              )}
                              {cust.status === "UPCOMING" && (
                                <span className="text-slate-400">{cust.dueDate}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Quick Communication & Collect Action */}
                        <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 pl-1.5">
                          {/* Fast Contact Buttons */}
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${cust.phone}`}
                              className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-colors"
                              title={`Call ${cust.name}`}
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </a>
                            <a
                              href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(
                                cust.name
                              )},%20this%20is%20Sundar%20from%20NexFix%20regarding%20your%20due%20of%20₹${cust.amountDue}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-800/40 transition-colors"
                              title="WhatsApp Reminder"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                            <span className="text-[10px] text-slate-400 ml-1 hidden sm:inline">
                              {cust.phone}
                            </span>
                          </div>

                          {/* Collect Action Button */}
                          {isCollected ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                              <Check className="h-3.5 w-3.5" />
                              Recorded
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenCollect(cust)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#00e676] to-emerald-500 hover:from-[#00e676] hover:to-emerald-400 px-3 py-1.5 text-xs font-bold text-slate-950 shadow-[0_0_12px_rgba(0,230,118,0.3)] transition-all active:scale-95"
                            >
                              <HandCoins className="h-3.5 w-3.5" />
                              Collect Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB CONTENT: COLLECT REGISTER */}
            {activeTab === "collect" && (
              <div className="px-5 pt-2 space-y-4">
                <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-xl p-4">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <HandCoins className="h-4 w-4 text-[#00e676]" />
                    Direct Field Collection Counter
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Record offline cash, UPI QR scan, or immediate bank reference with FIFO cycle matching.
                  </p>

                  <div className="mt-4 space-y-3">
                    <button
                      onClick={handleOpenFAB}
                      className="w-full flex items-center justify-between rounded-xl bg-[#00e676] p-3 text-slate-950 font-bold text-xs shadow-[0_0_18px_rgba(0,230,118,0.35)]"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4 stroke-[3]" />
                        Enter New Collection
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <div className="rounded-xl border border-slate-700/40 bg-slate-900/60 p-3">
                      <span className="text-[11px] font-semibold uppercase text-slate-400">
                        Today&apos;s Field Reconciliation
                      </span>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-300">Cash in Bag:</span>
                        <span className="font-bold text-white font-mono">₹41,500</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-slate-300">UPI Instant Received:</span>
                        <span className="font-bold text-[#00e676] font-mono">₹7,000</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">Total Field Tally:</span>
                        <span className="font-extrabold text-[#00e676] font-mono text-sm">
                          ₹{totalCollectionsToday.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CUSTOMERS DIRECTORY */}
            {activeTab === "customers" && (
              <div className="px-5 pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Route Customers ({customers.length})
                  </h2>
                  <span className="text-[11px] text-[#00e676]">All Synced</span>
                </div>

                <div className="space-y-2">
                  {customers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleOpenCollect(c)}
                      className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/40 p-3 backdrop-blur-md cursor-pointer hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-[#00e676]">
                          {c.initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{c.name}</p>
                          <p className="text-[10px] text-slate-400">{c.phone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-[#00e676]">
                          ₹{c.amountDue.toLocaleString("en-IN")}
                        </span>
                        <p className="text-[10px] text-slate-400">{c.route.split("•")[0]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: REPORTS */}
            {activeTab === "reports" && (
              <div className="px-5 pt-2 space-y-4">
                <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-xl p-4">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileBarChart className="h-4 w-4 text-[#00e676]" />
                    Daily Field Settlement
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Summary ready for evening branch deposit with Sundar Kumar (Admin).
                  </p>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Total Scheduled Visits</span>
                      <span className="font-semibold text-white">25 Members</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Successfully Collected</span>
                      <span className="font-semibold text-[#00e676]">18 Members</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Follow-up Needed Tomorrow</span>
                      <span className="font-semibold text-amber-400">7 Members</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-700/40">
                      <span className="text-slate-400">Realization Rate</span>
                      <span className="font-bold text-[#00e676]">74.2%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => showToast("✓ Daily PDF Settlement Report Exported")}
                    className="mt-4 w-full rounded-xl border border-[#00e676]/40 bg-[#00e676]/15 hover:bg-[#00e676]/25 py-2.5 text-xs font-bold text-[#00e676] transition-colors"
                  >
                    Export Branch Deposit Slip
                  </button>
                </div>
              </div>
            )}

            {/* ACTIONS: FLOATING ACTION BUTTON (FAB) With Neon Green "+" */}
            <div className="fixed bottom-22 sm:bottom-24 left-0 right-0 z-40 pointer-events-none flex justify-center">
              <div className="w-full max-w-[420px] px-6 flex justify-end pointer-events-auto">
                <button
                  onClick={handleOpenFAB}
                  className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#00e676] text-slate-950 font-black shadow-[0_0_28px_rgba(0,230,118,0.7),0_8px_20px_rgba(0,0,0,0.5)] transition-all hover:scale-110 active:scale-95 hover:bg-[#00ff84]"
                  aria-label="Quick Data Entry Collection"
                >
                  {/* Subtle pulsing outer ring */}
                  <span className="absolute inset-0 rounded-full bg-[#00e676] opacity-30 animate-ping group-hover:opacity-50" />
                  <Plus className="relative z-10 h-7 w-7 stroke-[3] transition-transform group-hover:rotate-90" />
                </button>
              </div>
            </div>

            {/* NAVIGATION: FLOATING BOTTOM NAVIGATION BAR */}
            <nav className="fixed bottom-3 left-0 right-0 z-30 pointer-events-none flex justify-center px-4">
              <div className="w-full max-w-[390px] pointer-events-auto">
                <div className="flex items-center justify-around rounded-3xl border border-slate-700/70 bg-slate-900/85 backdrop-blur-2xl px-2 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]">
                  {/* 1. Overview */}
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex flex-col items-center gap-1 rounded-2xl px-3.5 py-1.5 transition-all ${
                      activeTab === "overview"
                        ? "text-[#00e676]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="relative">
                      <LayoutDashboard className="h-5 w-5" />
                      {activeTab === "overview" && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#00e676] shadow-[0_0_6px_#00e676]" />
                      )}
                    </div>
                    <span className="text-[10px] font-semibold">Overview</span>
                  </button>

                  {/* 2. Collect */}
                  <button
                    onClick={() => setActiveTab("collect")}
                    className={`flex flex-col items-center gap-1 rounded-2xl px-3.5 py-1.5 transition-all ${
                      activeTab === "collect"
                        ? "text-[#00e676]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="relative">
                      <HandCoins className="h-5 w-5" />
                      {activeTab === "collect" && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#00e676] shadow-[0_0_6px_#00e676]" />
                      )}
                    </div>
                    <span className="text-[10px] font-semibold">Collect</span>
                  </button>

                  {/* 3. Customers */}
                  <button
                    onClick={() => setActiveTab("customers")}
                    className={`flex flex-col items-center gap-1 rounded-2xl px-3.5 py-1.5 transition-all ${
                      activeTab === "customers"
                        ? "text-[#00e676]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="relative">
                      <Users className="h-5 w-5" />
                      {activeTab === "customers" && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#00e676] shadow-[0_0_6px_#00e676]" />
                      )}
                    </div>
                    <span className="text-[10px] font-semibold">Customers</span>
                  </button>

                  {/* 4. Reports */}
                  <button
                    onClick={() => setActiveTab("reports")}
                    className={`flex flex-col items-center gap-1 rounded-2xl px-3.5 py-1.5 transition-all ${
                      activeTab === "reports"
                        ? "text-[#00e676]"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="relative">
                      <FileBarChart className="h-5 w-5" />
                      {activeTab === "reports" && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#00e676] shadow-[0_0_6px_#00e676]" />
                      )}
                    </div>
                    <span className="text-[10px] font-semibold">Reports</span>
                  </button>
                </div>
              </div>
            </nav>

            {/* QUICK DATA ENTRY MODAL (Slide-over / Modal Triggered by FAB or Collect Button) */}
            {quickCollectOpen && (
              <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 animate-fade-in-up">
                <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl">
                  {/* Top Bar with Dismiss */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00e676]/20 text-[#00e676]">
                        <HandCoins className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Record Collection</h3>
                        <p className="text-[11px] text-slate-400">Quick field entry • FIFO Allocation</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setQuickCollectOpen(false)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleRecordPayment} className="mt-4 space-y-4">
                    {/* Customer Selection */}
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Customer
                      </label>
                      <select
                        value={selectedCustomer?.id || ""}
                        onChange={(e) => {
                          const found = customers.find((c) => c.id === e.target.value);
                          if (found) {
                            setSelectedCustomer(found);
                            setCollectAmount(found.amountDue);
                          }
                        }}
                        className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-xs text-white focus:border-[#00e676] focus:outline-none"
                      >
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.scheme.split("(")[0]}) - Due: ₹{c.amountDue}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Amount Input with Quick Increment Chips */}
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Collection Amount (₹)
                      </label>
                      <div className="relative mt-1.5">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                          ₹
                        </span>
                        <input
                          type="number"
                          required
                          min={100}
                          value={collectAmount || ""}
                          onChange={(e) => setCollectAmount(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-700 bg-slate-850 pl-8 pr-4 py-2.5 text-base font-bold text-[#00e676] font-mono focus:border-[#00e676] focus:outline-none"
                        />
                      </div>

                      {/* Quick chips */}
                      <div className="mt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {[500, 1000, 2000, 5000].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => setCollectAmount(chip)}
                            className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 px-2.5 py-1 text-[11px] font-mono text-slate-300 transition-colors"
                          >
                            +₹{chip.toLocaleString("en-IN")}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Payment Mode Selection */}
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Payment Mode
                      </label>
                      <div className="mt-1.5 grid grid-cols-3 gap-2">
                        {[
                          { id: "CASH", label: "Cash", icon: Banknote },
                          { id: "UPI", label: "UPI QR", icon: QrCode },
                          { id: "BANK", label: "Bank Trf", icon: CreditCard },
                        ].map((m) => {
                          const Icon = m.icon;
                          const active = paymentMode === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setPaymentMode(m.id as any)}
                              className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 text-xs font-semibold border transition-all ${
                                active
                                  ? "border-[#00e676] bg-[#00e676]/15 text-[#00e676] shadow-[0_0_10px_rgba(0,230,118,0.2)]"
                                  : "border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{m.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <input
                        type="text"
                        placeholder="Optional remarks (e.g. Received at shop, UPI ref...)"
                        value={paymentNotes}
                        onChange={(e) => setPaymentNotes(e.target.value)}
                        className="w-full rounded-xl border border-slate-700/60 bg-slate-800/50 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00e676] focus:outline-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-[#00e676] to-emerald-500 hover:from-[#00e676] hover:to-emerald-400 py-3 text-xs font-extrabold text-slate-950 uppercase tracking-wider shadow-[0_0_20px_rgba(0,230,118,0.4)] transition-all active:scale-95"
                    >
                      Confirm & Send WhatsApp Receipt
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* LIVE TOAST NOTIFICATION */}
            {toastMessage && (
              <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
                <div className="flex items-center gap-2 rounded-2xl border border-[#00e676]/60 bg-slate-900/95 px-4 py-2.5 text-xs font-bold text-white shadow-[0_0_25px_rgba(0,230,118,0.3)] backdrop-blur-xl">
                  <span className="h-2 w-2 rounded-full bg-[#00e676] animate-pulse" />
                  <span>{toastMessage}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
