"use client";

import { useEffect, useMemo, useState } from "react";
import { type Member } from "@/lib/mock-members";
import { MemberDrawer } from "@/components/collections/member-drawer";
import { SkeletonBlock } from "@/components/skeleton-block";
import { ReceiptModal, type ReceiptData } from "@/components/collections/receipt-modal";

const filters = ["All", "Has Dues", "Has Advance", "Fully Paid"] as const;
type Filter = (typeof filters)[number];

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function CollectionsHub() {
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [selectedRoute, setSelectedRoute] = useState("ALL");
  const [selectedScheme, setSelectedScheme] = useState("ALL");
  const [selected, setSelected] = useState<Member | null>(null);
  const [recordedReceipt, setRecordedReceipt] = useState<ReceiptData | null>(null);
  const [quickPayingId, setQuickPayingId] = useState<string | null>(null);

  const loadCollectionsData = async () => {
    setLoading(true);
    try {
      const [custRes, batchRes, payRes] = await Promise.all([
        fetch("/api/customers").then((r) => r.json()),
        fetch("/api/batches").then((r) => r.json()),
        fetch("/api/payments").then((r) => r.json()),
      ]);

      const customersList = Array.isArray(custRes) ? custRes : [];
      const batchesList = Array.isArray(batchRes) ? batchRes : [];
      const paymentsList = Array.isArray(payRes) ? payRes : [];

      if (customersList.length > 0) {
        const mapped: Member[] = customersList.map((c: any) => {
          const initials = c.full_name
            ? c.full_name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "MB";

          const batch = batchesList.find((b: any) => 
            (c.batch_id && (b.id === c.batch_id || b.batch_code === c.batch_id)) ||
            (c.batch_name && (
              b.batch_name?.toLowerCase() === c.batch_name.toLowerCase() ||
              b.batch_code?.toLowerCase() === c.batch_name.toLowerCase()
            ))
          ) || batchesList[0] || {
            installment_amount: 5000,
            total_cycles: 20,
            frequency_type: "WEEKLY",
            start_date: "2026-08-01"
          };

          const instAmt = Number(batch.installment_amount) || 5000;
          const totalCycles = Number(batch.total_cycles) || 20;

          const memberPayments = paymentsList.filter((p: any) => 
            p.customer_id === c.id || 
            p.customer_id === c.customer_code || 
            (p.customer_name && c.full_name && p.customer_name.toLowerCase() === c.full_name.toLowerCase())
          );
          const totalPaidSum = memberPayments.reduce((acc: number, curr: any) => acc + (Number(curr.amount_paid) || 0), 0);
          const paidCyclesCount = Math.floor(totalPaidSum / instAmt);

          // Read custom interval gap configured in scheme batch
          const intervalGap = Number(batch.interval_days || batch.interval_gap || 1);

          // Read Late Joiner Policy (OPTION_A, OPTION_B, OPTION_C)
          const policy = c.late_joiner_policy || "OPTION_A";

          // Calculate batch start date
          const [bYear, bMonth, bDay] = (batch.start_date || "2026-08-01").split("-").map(Number);
          const batchStartObj = new Date(bYear, bMonth - 1, bDay);
          batchStartObj.setHours(0, 0, 0, 0);

          // Calculate customer joining date
          const cStartStr = c.joining_date || (c.created_at ? c.created_at.split("T")[0] : batch.start_date);
          const [jYear, jMonth, jDay] = (cStartStr || "2026-08-01").split("-").map(Number);
          const customerJoinObj = new Date(jYear, jMonth - 1, jDay);
          customerJoinObj.setHours(0, 0, 0, 0);

          const baseTimelineDateObj = policy === "OPTION_A" ? customerJoinObj : batchStartObj;
          const [tYear, tMonth, tDay] = policy === "OPTION_A" ? [jYear, jMonth, jDay] : [bYear, bMonth, bDay];

          const todayObj = new Date();
          todayObj.setHours(0, 0, 0, 0);

          const isFutureStart = baseTimelineDateObj > todayObj;
          let activeCycleNum = 1;

          if (!isFutureStart) {
            const diffTime = Math.max(0, todayObj.getTime() - baseTimelineDateObj.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const freq = batch.frequency_type || "MONTHLY";
            const stepDays = freq === "DAILY" ? intervalGap : freq === "WEEKLY" ? intervalGap * 7 : intervalGap * 30;
            activeCycleNum = Math.min(Math.floor(diffDays / stepDays) + 1, totalCycles);
          } else {
            activeCycleNum = 0;
          }

          let pendingDues = 0;
          let advanceBalance = 0;

          if (isFutureStart) {
            pendingDues = 0;
            advanceBalance = totalPaidSum;
          } else if (paidCyclesCount >= activeCycleNum) {
            pendingDues = 0;
            advanceBalance = (paidCyclesCount - activeCycleNum) * instAmt + (totalPaidSum % instAmt);
          } else {
            const overdueCycles = activeCycleNum - paidCyclesCount;
            pendingDues = overdueCycles * instAmt - (totalPaidSum % instAmt);
            advanceBalance = 0;
          }

          // Build cycle installments array dynamically with exact calculated due dates based on interval gap & policy
          const cycleInstallments = Array.from({ length: totalCycles }).map((_, idx) => {
            const cycleNum = idx + 1;

            // Calculate exact cycle due date using base timeline date (batch start vs joining date)
            const freq = batch.frequency_type || "MONTHLY";
            let cycleDueDateObj;
            if (freq === "DAILY") {
              cycleDueDateObj = new Date(tYear, tMonth - 1, tDay + (idx * intervalGap));
            } else if (freq === "WEEKLY") {
              cycleDueDateObj = new Date(tYear, tMonth - 1, tDay + (idx * 7 * intervalGap));
            } else {
              cycleDueDateObj = new Date(tYear, (tMonth - 1) + (idx * intervalGap), tDay);
            }
            cycleDueDateObj.setHours(0, 0, 0, 0);

            const isCycleInFuture = cycleDueDateObj.getTime() > todayObj.getTime();
            const isPreJoinCycle = policy !== "OPTION_A" && cycleDueDateObj.getTime() < customerJoinObj.getTime();

            const formattedDueDate = cycleDueDateObj.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            });

            // Status logic incorporating Option A, B, C:
            // - Option A: Cycle #1 starts on joining date
            // - Option B: Past pre-join cycles flagged as PENDING overdue
            // - Option C: Past pre-join cycles flagged as SKIPPED (₹0)
            let status: "PAID" | "ADVANCE" | "PARTIAL" | "PENDING" | "UPCOMING" | "SKIPPED" = "UPCOMING";

            if (cycleNum <= paidCyclesCount) {
              if (isCycleInFuture || isFutureStart) {
                status = "ADVANCE";
              } else {
                status = "PAID";
              }
            } else if (isPreJoinCycle) {
              if (policy === "OPTION_C") {
                status = "SKIPPED"; // Option C: Disallowed past cycle skipped!
              } else {
                status = "PENDING"; // Option B: Past dues carried over as pending!
              }
            } else if (isCycleInFuture || isFutureStart) {
              status = "UPCOMING";
            } else {
              status = "PENDING";
            }

            return {
              cycle: cycleNum,
              dueDate: formattedDueDate,
              amount: status === "SKIPPED" ? 0 : instAmt,
              paidAmount: cycleNum <= paidCyclesCount ? instAmt : 0,
              status: status
            };
          });

          return {
            id: c.customer_code || c.id || Math.random().toString(),
            dbId: c.id,
            customerCode: c.customer_code || c.id || "",
            name: c.full_name || "Unknown Member",
            initials: initials || "MB",
            phone: c.phone_number || "",
            idProof: c.id_proof_number || "",
            memberSince: c.joining_date || "Aug 2026",
            scheme: c.batch_name || batch.batch_name || "Micro-Finance Scheme",
            route: c.group_name || "Default Route",
            frequencyType: batch.frequency_type || "DAILY",
            installmentAmount: instAmt,
            totalPendingDues: pendingDues,
            advanceBalance: advanceBalance,
            installments: cycleInstallments,
            rawPayments: memberPayments
          } as any;
        });
        setMemberList(mapped);

        // Keep selected drawer member updated with latest receipts & dues
        if (selected) {
          const updatedSelected = mapped.find(m => m.id === selected.id);
          if (updatedSelected) {
            setSelected(updatedSelected);
          }
        }
      } else {
        setMemberList([]);
      }
    } catch (err) {
      console.error("Error fetching collections data:", err);
      setMemberList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollectionsData();
  }, []);

  const uniqueRoutes = useMemo(() => {
    const set = new Set<string>();
    memberList.forEach((m) => {
      if (m.route) set.add(m.route);
    });
    return Array.from(set).sort();
  }, [memberList]);

  const uniqueSchemes = useMemo(() => {
    const set = new Set<string>();
    memberList.forEach((m) => {
      if (m.scheme) set.add(m.scheme);
    });
    return Array.from(set).sort();
  }, [memberList]);

  const filtered = useMemo(() => {
    return memberList.filter((member) => {
      const q = query.trim().toLowerCase();

      const matchesFilter =
        filter === "All" ||
        (filter === "Has Dues" && member.totalPendingDues > 0) ||
        (filter === "Has Advance" && member.advanceBalance > 0) ||
        (filter === "Fully Paid" && member.totalPendingDues === 0);

      const matchesRoute = selectedRoute === "ALL" || member.route === selectedRoute;
      const matchesScheme = selectedScheme === "ALL" || member.scheme === selectedScheme;

      if (!matchesFilter || !matchesRoute || !matchesScheme) return false;
      if (!q) return true;

      // Match member name, scheme, route
      const nameMatch = member.name?.toLowerCase().includes(q);
      const schemeMatch = member.scheme?.toLowerCase().includes(q);
      const routeMatch = member.route?.toLowerCase().includes(q);

      // Match member ID No, customer code, database UUID, and phone
      const idMatch = member.id?.toLowerCase().includes(q);
      const dbIdMatch = (member as any).dbId?.toLowerCase().includes(q);
      const codeMatch = (member as any).customerCode?.toLowerCase().includes(q);
      const phoneMatch = (member as any).phone?.toLowerCase().includes(q);
      const idProofMatch = (member as any).idProof?.toLowerCase().includes(q);

      // Numeric digit matching (e.g. typing "1" or "01" matches "MNF-PC-001" or "001")
      const numericQ = q.replace(/[^0-9]/g, "");
      const memberCodeDigits = ((member as any).customerCode || member.id || "").replace(/[^0-9]/g, "");
      const numericMatch =
        numericQ.length > 0 &&
        (memberCodeDigits.includes(numericQ) ||
          (memberCodeDigits.length > 0 && parseInt(memberCodeDigits, 10) === parseInt(numericQ, 10)));

      return Boolean(
        nameMatch ||
        idMatch ||
        dbIdMatch ||
        codeMatch ||
        phoneMatch ||
        idProofMatch ||
        numericMatch ||
        schemeMatch ||
        routeMatch
      );
    });
  }, [memberList, query, filter, selectedRoute, selectedScheme]);

  const routeStats = useMemo(() => {
    const targetList = selectedRoute === "ALL"
      ? memberList
      : memberList.filter((m) => m.route === selectedRoute);

    const totalMembers = targetList.length;
    const totalPendingDues = targetList.reduce((acc, m) => acc + (m.totalPendingDues || 0), 0);
    const totalAdvances = targetList.reduce((acc, m) => acc + (m.advanceBalance || 0), 0);
    const membersWithDues = targetList.filter((m) => m.totalPendingDues > 0).length;
    const membersCleared = targetList.filter((m) => m.totalPendingDues === 0).length;

    return {
      totalMembers,
      totalPendingDues,
      totalAdvances,
      membersWithDues,
      membersCleared,
      collectionRate: totalMembers > 0 ? Math.round((membersCleared / totalMembers) * 100) : 100,
    };
  }, [memberList, selectedRoute]);

  const handleQuickPay = async (member: Member, amount: number) => {
    if (!amount || quickPayingId) return;
    setQuickPayingId(member.id);

    try {
      const receiptNo = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: (member as any).dbId || member.id,
          amount_paid: amount,
          payment_method: "CASH",
          receipt_no: receiptNo,
          notes: "1-Tap Quick Field Collection",
          payment_date: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const remaining = Math.max(0, (member.totalPendingDues || 0) - amount);
        const advance = amount > (member.totalPendingDues || 0)
          ? amount - (member.totalPendingDues || 0)
          : (member.advanceBalance || 0);

        setRecordedReceipt({
          receiptNo,
          customerName: member.name,
          customerCode: (member as any).customerCode || member.id,
          phone: (member as any).phone || "",
          amount,
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

        await loadCollectionsData();
      }
    } catch (err) {
      console.error("Error in quick pay:", err);
    } finally {
      setQuickPayingId(null);
    }
  };

  const selectedIndex = selected ? filtered.findIndex((m) => m.id === selected.id) : -1;

  return (
    <div>
      {/* Top Search & Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              placeholder="Search member name, ID, phone, route..."
              className="w-full min-h-[44px] rounded-xl border border-slate-200/80 bg-white py-2 pl-9 pr-3 text-base sm:text-sm text-slate-800 outline-none ring-teal-500/30 transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 dark:border-[#202425] dark:bg-[#151718] dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scroll-smooth">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`min-h-[40px] shrink-0 rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                  filter === f
                    ? "bg-teal-700 text-white shadow-md shadow-teal-700/25 dark:bg-teal-600"
                    : "border border-slate-200/90 bg-white/70 text-slate-700 hover:border-teal-500/40 hover:text-teal-700 dark:border-[#202425] dark:bg-[#151718] dark:text-slate-300 dark:hover:border-teal-500/40 dark:hover:text-teal-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Route & Scheme Dropdown Selectors */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Route:
            </span>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="min-h-[40px] rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-teal-500 dark:border-[#202425] dark:bg-[#151718] dark:text-slate-200 cursor-pointer"
            >
              <option value="ALL">All Routes ({uniqueRoutes.length})</option>
              {uniqueRoutes.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              Scheme:
            </span>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="min-h-[40px] rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-teal-500 dark:border-[#202425] dark:bg-[#151718] dark:text-slate-200 cursor-pointer"
            >
              <option value="ALL">All Schemes ({uniqueSchemes.length})</option>
              {uniqueSchemes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {(selectedRoute !== "ALL" || selectedScheme !== "ALL" || filter !== "All" || query) && (
            <button
              type="button"
              onClick={() => {
                setSelectedRoute("ALL");
                setSelectedScheme("ALL");
                setFilter("All");
                setQuery("");
              }}
              className="min-h-[36px] px-2.5 text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Route Summary Progress Banner */}
      <div className="mt-4 rounded-2xl border border-teal-500/20 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent p-4 dark:border-teal-500/20 dark:from-teal-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-white text-xs font-bold">
                ◎
              </span>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                {selectedRoute === "ALL" ? "All Routes Summary" : `Route: ${selectedRoute}`}
              </h3>
              <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                {routeStats.totalMembers} Members
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {routeStats.membersCleared} of {routeStats.totalMembers} accounts cleared ({routeStats.collectionRate}% collected)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                Total Due
              </span>
              <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                {formatCurrency(routeStats.totalPendingDues)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                Total Adv
              </span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                +{formatCurrency(routeStats.totalAdvances)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${routeStats.collectionRate}%` }}
          />
        </div>
      </div>

      {/* MOBILE MEMBER CARDS (Visible only on mobile screens < md) */}
      <div className="mt-4 space-y-3 md:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-36 w-full rounded-2xl" />
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-8 text-center text-xs text-slate-500 dark:border-[#202425] dark:bg-[#151718]/70">
            No members match this route or filter.
          </div>
        ) : (
          filtered.map((member) => {
            const cycleDueAmt = (member as any).installmentAmount || member.totalPendingDues || 500;
            const isPaying = quickPayingId === member.id;

            return (
              <div
                key={member.id}
                onClick={() => setSelected(member)}
                className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm transition active:scale-[0.99] dark:border-[#202425] dark:bg-[#151718] cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-700 text-xs font-bold text-white shadow-sm">
                      {member.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900 dark:text-white text-sm">
                        {member.name}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        ID: {(member as any).customerCode || member.id}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {member.totalPendingDues > 0 ? (
                      <span className="inline-block rounded-lg bg-rose-500/10 px-2 py-0.5 text-xs font-extrabold text-rose-600 dark:text-rose-400">
                        {formatCurrency(member.totalPendingDues)} Due
                      </span>
                    ) : member.advanceBalance > 0 ? (
                      <span className="inline-block rounded-lg bg-emerald-500/10 px-2 py-0.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(member.advanceBalance)} Adv
                      </span>
                    ) : (
                      <span className="inline-block rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-white/5 dark:text-slate-400">
                        Clear
                      </span>
                    )}
                  </div>
                </div>

                {/* Scheme & Route Tags */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="rounded-md border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 font-semibold text-teal-700 dark:text-teal-300">
                    {member.scheme}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {member.route}
                  </span>
                </div>

                {/* 1-Tap Quick Pay & Ledger Action Buttons */}
                <div className="mt-3.5 flex items-center gap-2 border-t border-slate-100 pt-2.5 dark:border-[#202425]">
                  {member.totalPendingDues > 0 ? (
                    <button
                      type="button"
                      disabled={isPaying}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickPay(member, cycleDueAmt);
                      }}
                      className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-600/25 transition hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                    >
                      <span>{isPaying ? "Recording..." : `⚡ Pay ${formatCurrency(cycleDueAmt)}`}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(member);
                      }}
                      className="flex-1 min-h-[44px] flex items-center justify-center rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 cursor-pointer"
                    >
                      View Passbook
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelected(member)}
                    className="min-h-[44px] px-3.5 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-teal-700 hover:bg-slate-50 dark:border-[#202425] dark:bg-[#151718] dark:text-teal-300 cursor-pointer"
                  >
                    Ledger →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP / TABLET TABLE (Visible md and above) */}
      <div className="mt-5 hidden overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm md:block dark:border-[#202425] dark:bg-[#151718]/70">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs text-slate-500 dark:bg-white/[0.02] dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Member</th>
                <th className="px-5 py-3 font-semibold">Scheme</th>
                <th className="px-5 py-3 font-semibold">Route</th>
                <th className="px-5 py-3 font-semibold">Pending Dues</th>
                <th className="px-5 py-3 font-semibold">Advance</th>
                <th className="px-5 py-3 text-right font-semibold">Quick Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-200/70 dark:border-[#202425]">
                    <td colSpan={6} className="px-5 py-4">
                      <SkeletonBlock className="h-7 w-full rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : (
                filtered.map((member) => {
                  const cycleDueAmt = (member as any).installmentAmount || member.totalPendingDues || 500;
                  const isPaying = quickPayingId === member.id;

                  return (
                    <tr
                      key={member.id}
                      onClick={() => setSelected(member)}
                      className="border-t border-slate-200/70 transition hover:bg-slate-50/80 dark:border-[#202425] dark:hover:bg-white/[0.02] cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-700 text-[11px] font-bold text-white">
                            {member.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {member.name}
                            </p>
                            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                              ID: {(member as any).customerCode || member.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                        {member.scheme}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                        {member.route}
                      </td>
                      <td className="px-5 py-3.5">
                        {member.totalPendingDues > 0 ? (
                          <span className="font-extrabold text-rose-600 dark:text-rose-400">
                            {formatCurrency(member.totalPendingDues)}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {member.advanceBalance > 0 ? (
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(member.advanceBalance)}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {member.totalPendingDues > 0 && (
                            <button
                              type="button"
                              disabled={isPaying}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickPay(member, cycleDueAmt);
                              }}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                            >
                              {isPaying ? "Saving..." : `⚡ Pay ${formatCurrency(cycleDueAmt)}`}
                            </button>
                          )}
                          <span className="font-medium text-teal-600 dark:text-teal-400 text-xs">
                            Ledger →
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No members match this route or filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Ledger & Installment Drawer with Sequential Route Navigation */}
      <MemberDrawer
        member={selected}
        onClose={() => setSelected(null)}
        onPaymentRecorded={() => {
          loadCollectionsData();
        }}
        currentIndex={selectedIndex >= 0 ? selectedIndex : undefined}
        totalCount={filtered.length}
        onNavigatePrev={
          selectedIndex > 0
            ? () => setSelected(filtered[selectedIndex - 1])
            : undefined
        }
        onNavigateNext={
          selectedIndex >= 0 && selectedIndex < filtered.length - 1
            ? () => setSelected(filtered[selectedIndex + 1])
            : undefined
        }
        onReceiptGenerated={(receipt) => {
          setRecordedReceipt(receipt);
        }}
      />

      {/* Instant Digital WhatsApp & Print Receipt Modal */}
      <ReceiptModal
        receipt={recordedReceipt}
        onClose={() => setRecordedReceipt(null)}
        hasNext={Boolean(selected && selectedIndex >= 0 && selectedIndex < filtered.length - 1)}
        onNext={() => {
          if (selectedIndex >= 0 && selectedIndex < filtered.length - 1) {
            setSelected(filtered[selectedIndex + 1]);
          }
        }}
      />
    </div>
  );
}
