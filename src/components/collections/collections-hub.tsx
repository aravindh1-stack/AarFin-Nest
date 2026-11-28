"use client";

import { useEffect, useMemo, useState } from "react";
import { type Member } from "@/lib/mock-members";
import { MemberDrawer } from "@/components/collections/member-drawer";
import { SkeletonBlock } from "@/components/skeleton-block";
import { ReceiptModal, type ReceiptData } from "@/components/collections/receipt-modal";
import { useAuth } from "@/components/auth/auth-context";
import { Search, Zap, BookOpen, RotateCcw, Users, ArrowRight } from "lucide-react";

const filters = ["All", "Has Dues", "Has Advance", "Fully Paid"] as const;
type Filter = (typeof filters)[number];

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function CollectionsHub() {
  const { role } = useAuth();
  const isReadOnlyViewer = role === "VIEWER";
  const READ_ONLY_TOOLTIP = "Read-only access: Mutations restricted";

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

          const intervalGap = Number(batch.interval_days || batch.interval_gap || 1);
          const policy = c.late_joiner_policy || "OPTION_A";

          const [bYear, bMonth, bDay] = (batch.start_date || "2026-08-01").split("-").map(Number);
          const batchStartObj = new Date(bYear, bMonth - 1, bDay);
          batchStartObj.setHours(0, 0, 0, 0);

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

          const cycleInstallments = Array.from({ length: totalCycles }).map((_, idx) => {
            const cycleNum = idx + 1;
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

            let status: "PAID" | "ADVANCE" | "PARTIAL" | "PENDING" | "UPCOMING" | "SKIPPED" = "UPCOMING";

            if (cycleNum <= paidCyclesCount) {
              if (isCycleInFuture || isFutureStart) {
                status = "ADVANCE";
              } else {
                status = "PAID";
              }
            } else if (isPreJoinCycle) {
              if (policy === "OPTION_C") {
                status = "SKIPPED";
              } else {
                status = "PENDING";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const nameMatch = member.name?.toLowerCase().includes(q);
      const schemeMatch = member.scheme?.toLowerCase().includes(q);
      const routeMatch = member.route?.toLowerCase().includes(q);

      const idMatch = member.id?.toLowerCase().includes(q);
      const dbIdMatch = (member as any).dbId?.toLowerCase().includes(q);
      const codeMatch = (member as any).customerCode?.toLowerCase().includes(q);
      const phoneMatch = (member as any).phone?.toLowerCase().includes(q);
      const idProofMatch = (member as any).idProof?.toLowerCase().includes(q);

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
    if (isReadOnlyViewer) return;
    if (!amount || quickPayingId) return;
    setQuickPayingId(member.id);

    try {
      const receiptNo = `REC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
      const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          customer_id: (member as any).dbId || member.id,
          batch_id: (member as any).batchId || null,
          amount_paid: amount,
          payment_method: "CASH",
          receipt_no: receiptNo,
          idempotency_key: idempotencyKey,
          notes: "1-Tap Quick Field Collection (FIFO Waterfall)",
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
    <div className="space-y-4 w-full max-w-full min-w-0">
      {/* Unified Compact Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 shadow-xs dark:border-[#1F2623] dark:bg-[#121614]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search member, ID, phone, route..."
              className="w-full min-h-[44px] rounded-xl border border-slate-200/90 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-[#10B981] transition"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`min-h-[40px] shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                  filter === f
                    ? "bg-emerald-600 text-white font-bold shadow-xs dark:bg-[#10B981] dark:text-black"
                    : "border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Route & Scheme Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Route:
              </span>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-neutral-200 dark:focus:border-[#10B981] cursor-pointer"
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
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Scheme:
              </span>
              <select
                value={selectedScheme}
                onChange={(e) => setSelectedScheme(e.target.value)}
                className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-neutral-200 dark:focus:border-[#10B981] cursor-pointer"
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
                className="min-h-[40px] inline-flex items-center gap-1 px-3 text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 cursor-pointer transition"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Route Telemetry Strip */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-[#1F2623] dark:bg-[#121614]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              {selectedRoute === "ALL" ? "All Operating Routes" : `Route: ${selectedRoute}`}
            </h3>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-mono tabular-nums text-slate-600 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-neutral-400">
              {routeStats.totalMembers} Accounts
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-neutral-400">Due:</span>
              <span className="font-mono font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                {formatCurrency(routeStats.totalPendingDues)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-neutral-400">Adv:</span>
              <span className="font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(routeStats.totalAdvances)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-neutral-400">Rate:</span>
              <span className="font-mono font-semibold tabular-nums text-emerald-600 dark:text-[#10B981]">
                {routeStats.collectionRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/80 dark:bg-[#0E1110] dark:border-[#1F2623]">
          <div
            className="h-full rounded-full bg-emerald-600 dark:bg-[#10B981] transition-all duration-500"
            style={{ width: `${Math.min(routeStats.collectionRate, 100)}%` }}
          />
        </div>

        {/* Read-only Auditor Banner */}
        {isReadOnlyViewer && (
          <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-medium text-amber-800 dark:text-amber-300">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>Auditor / Read-Only Mode Active: Payment recording, dues collection, and ledger mutations are restricted.</span>
          </div>
        )}
      </div>

      {/* MOBILE STACKED CARDS (Touch-optimized < md, min 48px tap targets) */}
      <div className="space-y-3 md:hidden">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-28 w-full rounded-2xl bg-white border border-slate-200/80 dark:bg-[#121614] dark:border-[#1F2623]" />
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center dark:border-[#1F2623] dark:bg-[#121614]">
            <Users className="mx-auto h-8 w-8 text-slate-300 dark:text-neutral-600 mb-2" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">No members found</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
              No accounts match the current filter or search criteria.
            </p>
          </div>
        ) : (
          filtered.map((member) => {
            const cycleDueAmt = (member as any).installmentAmount || member.totalPendingDues || 500;
            const isPaying = quickPayingId === member.id;

            return (
              <div
                key={member.id}
                onClick={() => setSelected(member)}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-emerald-500/40 cursor-pointer space-y-3 shadow-xs dark:border-[#1F2623] dark:bg-[#121614] dark:hover:border-[#10B981]/40"
              >
                {/* Header: Name, Customer ID & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                      {member.name}
                    </h4>
                    <p className="text-xs font-mono text-slate-500 dark:text-neutral-400 tabular-nums truncate">
                      ID: {(member as any).customerCode || member.id} · {member.route}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    {member.totalPendingDues > 0 ? (
                      <span className="inline-flex items-center rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                        {formatCurrency(member.totalPendingDues)} Due
                      </span>
                    ) : member.advanceBalance > 0 ? (
                      <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                        +{formatCurrency(member.advanceBalance)} Adv
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-neutral-400">
                        Settled
                      </span>
                    )}
                  </div>
                </div>

                {/* Scheme Tag */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-neutral-400 truncate max-w-[200px]">
                    {member.scheme}
                  </span>
                  <span className="text-slate-500 dark:text-neutral-400 font-mono tabular-nums">
                    ₹{Number((member as any).installmentAmount || 0).toLocaleString("en-IN")}/cycle
                  </span>
                </div>

                {/* Action Row with min 48px touch targets */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-[#1F2623]">
                  {member.totalPendingDues > 0 ? (
                    <button
                      type="button"
                      disabled={isPaying || isReadOnlyViewer}
                      title={isReadOnlyViewer ? READ_ONLY_TOOLTIP : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isReadOnlyViewer) return;
                        handleQuickPay(member, cycleDueAmt);
                      }}
                      className={`min-h-[48px] rounded-xl bg-emerald-600 text-white font-bold dark:bg-[#10B981] dark:text-black px-3 text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-500 dark:hover:bg-[#0EA57E] active:scale-98 transition disabled:opacity-50 shadow-xs ${
                        isReadOnlyViewer ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <Zap className="h-4 w-4" />
                      <span>{isPaying ? "Recording..." : `Collect ${formatCurrency(cycleDueAmt)}`}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isReadOnlyViewer}
                      title={isReadOnlyViewer ? READ_ONLY_TOOLTIP : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isReadOnlyViewer) return;
                        setSelected(member);
                      }}
                      className={`min-h-[48px] rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1.5 hover:bg-emerald-500/20 active:scale-98 transition ${
                        isReadOnlyViewer ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <span>Collect Advance</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(member);
                    }}
                    className="min-h-[48px] rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-neutral-200 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-white/[0.04] active:scale-98 transition cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>View Ledger</span>
                  </button>
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
                <th className="px-5 py-3.5 font-medium">Scheme</th>
                <th className="px-5 py-3.5 font-medium">Route</th>
                <th className="px-5 py-3.5 font-medium text-right">Pending Dues</th>
                <th className="px-5 py-3.5 font-medium text-right">Advance Balance</th>
                <th className="px-5 py-3.5 text-right font-medium">Actions</th>
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
                    <p className="text-sm font-medium text-slate-900 dark:text-white">No members match this route or filter</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
                      Try resetting your filter parameters or search term.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((member) => {
                  const cycleDueAmt = (member as any).installmentAmount || member.totalPendingDues || 500;
                  const isPaying = quickPayingId === member.id;

                  return (
                    <tr
                      key={member.id}
                      onClick={() => setSelected(member)}
                      className="transition hover:bg-slate-50/60 dark:hover:bg-white/[0.02] cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-emerald-700 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-[#10B981]">
                            {member.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {member.name}
                            </p>
                            <p className="text-xs font-mono text-slate-500 dark:text-neutral-400 tabular-nums">
                              ID: {(member as any).customerCode || member.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 dark:text-neutral-300">
                        {member.scheme}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 dark:text-neutral-300">
                        {member.route}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-semibold tabular-nums">
                        {member.totalPendingDues > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400">
                            {formatCurrency(member.totalPendingDues)}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-neutral-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-semibold tabular-nums">
                        {member.advanceBalance > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(member.advanceBalance)}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-neutral-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {member.totalPendingDues > 0 && (
                            <button
                              type="button"
                              disabled={isPaying || isReadOnlyViewer}
                              title={isReadOnlyViewer ? READ_ONLY_TOOLTIP : undefined}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isReadOnlyViewer) return;
                                handleQuickPay(member, cycleDueAmt);
                              }}
                              className={`rounded-lg bg-emerald-600 text-white dark:bg-[#10B981] dark:text-black px-3 py-1.5 text-xs font-bold shadow-xs hover:bg-emerald-500 dark:hover:bg-[#0EA57E] disabled:opacity-50 transition ${
                                isReadOnlyViewer ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                              }`}
                            >
                              {isPaying ? "Saving..." : `Collect ${formatCurrency(cycleDueAmt)}`}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(member);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-[#1F2623] dark:bg-[#0E1110] px-3 py-1.5 text-xs font-medium dark:text-neutral-200 dark:hover:bg-white/[0.04] transition cursor-pointer"
                          >
                            <span>Ledger</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Ledger & Installment Drawer */}
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

      {/* Digital WhatsApp & Print Receipt Modal */}
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
