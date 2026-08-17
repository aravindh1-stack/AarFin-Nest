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

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const custRes = await fetch("/api/customers").then((r) => r.json());
        if (Array.isArray(custRes) && custRes.length > 0) {
          const mapped: Member[] = custRes.map((c: any) => {
            const initials = c.full_name
              ? c.full_name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "MB";
            const dues = Number(c.pending_dues || c.due_amount || 0);
            const adv = Number(c.advance_balance || c.advance_amount || 0);

            return {
              id: c.id || c.customer_code || Math.random().toString(),
              name: c.full_name || "Unknown Member",
              initials: initials || "MB",
              phone: c.phone_number || "+91 90000 00000",
              memberSince: c.joining_date ? new Date(c.joining_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Jan 2026",
              scheme: c.batch_name || "Micro-Finance Scheme",
              route: c.group_name || "Default Route",
              totalPendingDues: dues,
              advanceBalance: adv,
              installments: [
                { cycle: 1, dueDate: "05 Jan 2026", amount: 5000, paidAmount: 5000, status: "PAID" },
                { cycle: 2, dueDate: "05 Feb 2026", amount: 5000, paidAmount: 2000, status: "PARTIAL" },
                { cycle: 3, dueDate: "05 Mar 2026", amount: 5000, paidAmount: 0, status: "PENDING" },
              ],
            };
          });
          setMemberList(mapped);
        } else {
          setMemberList(mockMembers);
        }
      } catch (err) {
        console.error("Error fetching customers for collections hub:", err);
        setMemberList(mockMembers);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
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
                    className="border-t border-slate-200/70 transition hover:bg-slate-50/80 dark:border-slate-800/50 dark:hover:bg-white/[0.02]"
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
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(member)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-500/40 hover:text-teal-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-500/40 dark:hover:text-teal-300 cursor-pointer"
                      >
                        View
                      </button>
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

      <MemberDrawer member={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
