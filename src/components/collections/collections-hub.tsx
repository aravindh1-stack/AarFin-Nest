"use client";

import { useEffect, useMemo, useState } from "react";
import { members as mockMembers, type Member } from "@/lib/mock-members";
import { MemberDrawer } from "@/components/collections/member-drawer";
import { SkeletonBlock } from "@/components/skeleton-block";

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
  const [selected, setSelected] = useState<Member | null>(null);

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
            id: c.id || c.customer_code || Math.random().toString(),
            name: c.full_name || "Unknown Member",
            initials: initials || "MB",
            phone: c.phone_number || "+91 90000 00000",
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
        setMemberList(mockMembers);
      }
    } catch (err) {
      console.error("Error fetching collections data:", err);
      setMemberList(mockMembers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollectionsData();
  }, []);

  const filtered = useMemo(() => {
    return memberList.filter((member) => {
      const matchesQuery =
        member.name.toLowerCase().includes(query.toLowerCase()) ||
        member.route.toLowerCase().includes(query.toLowerCase()) ||
        member.scheme.toLowerCase().includes(query.toLowerCase());

      const matchesFilter =
        filter === "All" ||
        (filter === "Has Dues" && member.totalPendingDues > 0) ||
        (filter === "Has Advance" && member.advanceBalance > 0) ||
        (filter === "Fully Paid" && member.totalPendingDues === 0);

      return matchesQuery && matchesFilter;
    });
  }, [memberList, query, filter]);

  return (
    <div>
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
            placeholder="Search member, route, scheme..."
            className="w-full rounded-lg border border-slate-200/80 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none ring-teal-500/30 transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 dark:border-slate-800/50 dark:bg-[#121212] dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                filter === f
                  ? "bg-teal-700 text-white shadow-md shadow-teal-700/25 dark:bg-teal-600"
                  : "border border-slate-200/80 text-slate-600 hover:border-teal-500/40 hover:text-teal-700 dark:border-slate-800/50 dark:text-slate-400 dark:hover:border-teal-500/40 dark:hover:text-teal-300"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 dark:border-slate-800/50 dark:bg-[#121212]/70">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs text-slate-500 dark:bg-white/[0.02] dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Member</th>
                <th className="px-5 py-3 font-semibold">Scheme</th>
                <th className="px-5 py-3 font-semibold">Route</th>
                <th className="px-5 py-3 font-semibold">Pending Dues</th>
                <th className="px-5 py-3 font-semibold">Advance</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
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
              ) : (
                filtered.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => setSelected(member)}
                    className="border-t border-slate-200/70 transition hover:bg-slate-50/80 dark:border-slate-800/50 dark:hover:bg-white/[0.02] cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-700 text-[11px] font-bold text-white">
                          {member.initials}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {member.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {member.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {member.scheme}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {member.route}
                    </td>
                    <td className="px-5 py-3.5">
                      {member.totalPendingDues > 0 ? (
                        <span className="font-semibold text-rose-600 dark:text-rose-400">
                          {formatCurrency(member.totalPendingDues)}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {member.advanceBalance > 0 ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(member.advanceBalance)}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-teal-600 dark:text-teal-400">
                      Collect & Ledger →
                    </td>
                  </tr>
                ))
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No members match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MemberDrawer
        member={selected}
        onClose={() => setSelected(null)}
        onPaymentRecorded={() => {
          loadCollectionsData();
        }}
      />
    </div>
  );
}
