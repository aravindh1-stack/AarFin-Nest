"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { SkeletonBlock } from "@/components/skeleton-block";
import { MapPin, Plus, X, AlertCircle, Users, UserCheck, ArrowRight } from "lucide-react";

interface Group {
  id: string;
  group_name: string;
  group_code: string;
  route_name?: string;
  collection_agent?: string;
}

export default function RoutesPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [customerCounts, setCustomerCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [routeName, setRouteName] = useState("");
  const [agent, setAgent] = useState("");

  const fetchGroupsAndMembers = async () => {
    setLoading(true);
    try {
      const [gRes, cRes] = await Promise.all([
        fetch("/api/groups").then((r) => r.json()),
        fetch("/api/customers").then((r) => r.json()),
      ]);

      if (Array.isArray(gRes)) setGroups(gRes);

      if (Array.isArray(gRes) && Array.isArray(cRes)) {
        const counts: Record<string, number> = {};
        gRes.forEach((g) => {
          const matching = cRes.filter(
            (c) =>
              c.group_id === g.id ||
              c.group_id === g.group_code ||
              (c.group_name && c.group_name.toLowerCase() === g.group_name.toLowerCase()) ||
              (g.route_name && c.group_name && c.group_name.toLowerCase() === g.route_name.toLowerCase())
          );
          counts[g.id] = matching.length;
        });
        setCustomerCounts(counts);
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupsAndMembers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_name: groupName,
          group_code: groupCode || `GRP-${Math.floor(100 + Math.random() * 900)}`,
          route_name: routeName || groupName,
          collection_agent: agent && agent.trim() !== "" ? agent.trim() : "Unassigned",
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setGroupName("");
        setGroupCode("");
        setRouteName("");
        setAgent("");
        fetchGroupsAndMembers();
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || "Failed to create route group");
      }
    } catch (err: any) {
      console.error("Error creating route group:", err);
      setFormError(`Network error: ${err.message || "Could not reach server"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <DashboardTopbar
        title="Routes & Groups"
        description="Partition scheme batches into geographical agent collection routes"
      />

      <div className="space-y-4 px-4 py-2 sm:px-6 lg:px-8 w-full max-w-full min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Geographical Route Groups
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Active beat allocations, customer counts, and field collection officer assignments
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white font-bold dark:bg-[#10B981] dark:text-black px-4 py-2 text-xs shadow-xs transition hover:bg-emerald-500 dark:hover:bg-[#0EA57E] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Route Group</span>
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-48 w-full rounded-2xl bg-white border border-slate-200/80 dark:bg-[#121614] dark:border-[#1F2623]" />
            ))
          ) : groups.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200/80 bg-white p-10 text-center dark:border-[#1F2623] dark:bg-[#121614]">
              <MapPin className="mx-auto h-8 w-8 text-slate-300 dark:text-neutral-600 mb-2" />
              <p className="text-sm font-medium text-slate-900 dark:text-white">No route beats found</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">Create your first geographical collection group to partition accounts.</p>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white font-bold dark:bg-[#10B981] dark:text-black px-4 py-2 text-xs hover:bg-emerald-500 dark:hover:bg-[#0EA57E] transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Route Group</span>
              </button>
            </div>
          ) : (
            groups.map((g) => {
              const assignedCount = customerCounts[g.id] ?? 0;
              const officerName = g.collection_agent && g.collection_agent.trim() !== "" && g.collection_agent !== "Random" 
                ? g.collection_agent 
                : "Unassigned";

              return (
                <div
                  key={g.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:border-emerald-500/40 shadow-xs dark:border-[#1F2623] dark:bg-[#121614] dark:hover:border-[#10B981]/40 flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Beat Code badge & MapPin Icon */}
                    <div className="flex items-start justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-emerald-600 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-[#10B981]">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                        {g.group_code}
                      </span>
                    </div>

                    {/* Single Clean Route Name */}
                    <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                      {g.group_name}
                    </h3>

                    {/* Assigned Members Count */}
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400">
                      <Users className="h-3.5 w-3.5 text-slate-400 dark:text-neutral-400" />
                      <span className="font-mono tabular-nums text-slate-700 dark:text-neutral-300 font-medium">
                        {assignedCount} Assigned Members
                      </span>
                    </div>
                  </div>

                  {/* Footer: Assigned Officer & Action */}
                  <div className="mt-5 border-t border-slate-100 dark:border-[#1F2623] pt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-neutral-400">
                          Assigned Officer
                        </p>
                        <p className="mt-0.5 font-medium text-slate-900 dark:text-white inline-flex items-center gap-1">
                          <UserCheck className="h-3 w-3 text-emerald-600 dark:text-[#10B981]" />
                          <span>{officerName}</span>
                        </p>
                      </div>

                      <Link
                        href={`/dashboard/collections?route=${encodeURIComponent(g.group_name)}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition"
                      >
                        <span>View Beat</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto dark:border-[#1F2623] dark:bg-[#121614]">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-[#1F2623] pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Create New Route Group
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-neutral-400">
                  Assign geographical collection zones and field agents.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-neutral-300">
                  Group / Route Name *
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. TVAN Gold"
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-neutral-300">
                  Beat Code
                </label>
                <input
                  type="text"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value)}
                  placeholder="e.g. TG-001"
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono tabular-nums text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981]"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-neutral-300">
                  Collection Officer / Agent
                </label>
                <input
                  type="text"
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                  placeholder="e.g. Boopathy R."
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-white dark:focus:border-[#10B981]"
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#1F2623]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto min-h-[44px] flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-[#1F2623] dark:text-neutral-300 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto min-h-[44px] flex items-center justify-center rounded-xl bg-emerald-600 text-white font-bold dark:bg-[#10B981] dark:text-black px-6 py-2.5 text-xs shadow-md hover:bg-emerald-500 dark:hover:bg-[#0EA57E] disabled:opacity-50 cursor-pointer transition"
                >
                  {submitting ? "Saving..." : "Save Route Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
