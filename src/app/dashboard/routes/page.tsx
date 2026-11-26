"use client";

import { useEffect, useState } from "react";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { SkeletonBlock } from "@/components/skeleton-block";

interface Group {
  id: string;
  group_name: string;
  group_code: string;
  route_name?: string;
  collection_agent?: string;
}

export default function RoutesPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [routeName, setRouteName] = useState("");
  const [agent, setAgent] = useState("");

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      if (Array.isArray(data)) setGroups(data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
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
          collection_agent: agent || "Field Agent",
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setGroupName("");
        setGroupCode("");
        setRouteName("");
        setAgent("");
        fetchGroups();
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
    <div>
      <DashboardTopbar
        title="Routes & Groups"
        description="Partition scheme batches into geographical agent collection routes"
      />

      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Geographical Route Groups
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Geographical agent routes and collection assignments
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer"
          >
            + Create New Route Group
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-44 w-full rounded-2xl" />
            ))
          ) : (
            groups.map((g) => (
              <div
                key={g.id}
                className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 transition hover:border-teal-500/30 dark:border-[#202425] dark:bg-[#151718]/70"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-teal-500/20 bg-teal-500/10 text-teal-600 dark:border-teal-400/20 dark:bg-teal-400/10 dark:text-teal-300">
                    ◎
                  </div>
                  <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                    {g.group_code}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                  {g.group_name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {g.route_name || "Primary Route"}
                </p>

                <div className="mt-4 border-t border-slate-200/70 pt-3 text-xs dark:border-[#202425]">
                  <p className="text-[10px] text-slate-400">Assigned Agent</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {g.collection_agent || "Field Agent"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-2xl dark:border-[#202425] dark:bg-[#151718] max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200/70 pb-3 dark:border-[#202425]">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Create New Route Group
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Assign geographical collection zones and agents.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Group / Route Name *
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. North Zone A"
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-[#202425] dark:bg-[#0C0D0E] dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Group Code
                </label>
                <input
                  type="text"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value)}
                  placeholder="e.g. GRP-N01"
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-[#202425] dark:bg-[#0C0D0E] dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Collection Agent
                </label>
                <input
                  type="text"
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                  placeholder="e.g. Boopathy R."
                  className="mt-1 w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-[#202425] dark:bg-[#0C0D0E] dark:text-white"
                />
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-slate-200/70 dark:border-[#202425]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto min-h-[44px] flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-[#202425] dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto min-h-[44px] flex items-center justify-center rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-teal-600 disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-500 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
