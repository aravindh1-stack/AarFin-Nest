"use client";

import { useEffect, useState } from "react";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { SkeletonBlock } from "@/components/skeleton-block";
import { useAuth } from "@/components/auth/auth-context";
import { ROLE_DISPLAY, UserRole } from "@/lib/auth/rbac";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  MoreVertical,
  X,
  Send,
  Trash2,
  CheckCircle2,
  Lock,
  Mail,
  Shield,
  Key,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isPrimaryOwner: boolean;
  status: string;
  createdAt?: string;
}

export default function TeamManagementPage() {
  const { user, role: currentCallerRole } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Invite modal state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("EDITOR");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  // Edit role modal state
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("EDITOR");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      if (res.ok && data.success) {
        setMembers(data.members || []);
        setIsSuperAdmin(data.isSuperAdmin);
      }
    } catch (err) {
      console.error("Failed to fetch team:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError("");
    setInviteSuccess("");

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setInviteSuccess(data.message || "Invitation sent successfully!");
        setInviteName("");
        setInviteEmail("");
        fetchTeam();
        setTimeout(() => {
          setIsInviteOpen(false);
          setInviteSuccess("");
        }, 1800);
      } else {
        setInviteError(data.error || "Failed to invite team member");
      }
    } catch {
      setInviteError("Network error while connecting to team management service");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedMember) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedMember.id,
          email: selectedMember.email,
          role: newRole,
        }),
      });

      if (res.ok) {
        setSelectedMember(null);
        fetchTeam();
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeAccess = async (member: TeamMember) => {
    if (!confirm(`Are you sure you want to revoke access for ${member.name} (${member.email})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/team?id=${encodeURIComponent(member.id)}&email=${encodeURIComponent(member.email)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchTeam();
      }
    } catch (err) {
      console.error("Failed to revoke access:", err);
    }
  };

  const getRoleBadgeClasses = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold";
      case "ADMIN":
        return "border-teal-500/30 bg-teal-500/10 text-teal-400 font-semibold";
      case "EDITOR":
        return "border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium";
      case "VIEWER":
      default:
        return "border-slate-500/30 bg-slate-500/10 text-slate-400 font-medium";
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <DashboardTopbar
        title="Team & Access Control"
        description="Role-based permissions and staff authorization ledger"
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Header Action Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-[#1F2623] dark:bg-[#121614]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-[#10B981]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Authorized Staff Roster
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#8E9B94]">
                {isSuperAdmin
                  ? "Full governance enabled — manage member privileges and invite new colleagues"
                  : "Read-only access — contact the Root Owner to request privilege modifications"}
              </p>
            </div>
          </div>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 dark:bg-[#10B981] dark:text-[#090B0A] dark:hover:bg-[#0ea57e] cursor-pointer shrink-0"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Invite Member</span>
            </button>
          )}
        </div>

        {/* Roles Reference Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(ROLE_DISPLAY) as UserRole[]).map((r) => {
            const info = ROLE_DISPLAY[r];
            return (
              <div
                key={r}
                className="rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-[#1F2623] dark:bg-[#0E1110]/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${getRoleBadgeClasses(r)}`}>
                    {info.badge}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">{info.title}</h3>
                <p className="text-[11px] text-slate-500 dark:text-[#8E9B94] leading-relaxed">
                  {info.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Members Roster Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-[#1F2623] dark:bg-[#121614]">
          <div className="border-b border-slate-200/80 px-5 py-4 dark:border-[#1F2623] flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Enrolled Members ({members.length})
            </h3>
            <span className="font-mono text-xs text-slate-400 dark:text-[#8E9B94]">
              Multi-Branch Roster
            </span>
          </div>

          <div className="overflow-x-auto [scrollbar-width:none]">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-[#1F2623] dark:bg-[#0E1110]/50 dark:text-neutral-400">
                  <th className="px-5 py-3">Staff Member</th>
                  <th className="px-5 py-3">Assigned Role</th>
                  <th className="px-5 py-3">Access Tier</th>
                  <th className="px-5 py-3">Date Added</th>
                  {isSuperAdmin && <th className="px-5 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1F2623]">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4">
                        <SkeletonBlock className="h-4 w-36 rounded bg-slate-100 dark:bg-[#0E1110]" />
                      </td>
                      <td className="px-5 py-4">
                        <SkeletonBlock className="h-4 w-28 rounded bg-slate-100 dark:bg-[#0E1110]" />
                      </td>
                      <td className="px-5 py-4">
                        <SkeletonBlock className="h-4 w-20 rounded bg-slate-100 dark:bg-[#0E1110]" />
                      </td>
                      <td className="px-5 py-4">
                        <SkeletonBlock className="h-4 w-24 rounded bg-slate-100 dark:bg-[#0E1110]" />
                      </td>
                      {isSuperAdmin && (
                        <td className="px-5 py-4 text-right">
                          <SkeletonBlock className="h-4 w-12 ml-auto rounded bg-slate-100 dark:bg-[#0E1110]" />
                        </td>
                      )}
                    </tr>
                  ))
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 5 : 4} className="py-8 text-center text-slate-500">
                      No members enrolled
                    </td>
                  </tr>
                ) : (
                  members.map((m) => {
                    const roleInfo = ROLE_DISPLAY[m.role] || ROLE_DISPLAY.VIEWER;
                    return (
                      <tr
                        key={m.id || m.email}
                        className="transition hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{m.name}</span>
                            {m.isPrimaryOwner && (
                              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black text-emerald-400 border border-emerald-500/30">
                                OWNER
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-[#8E9B94] font-mono">
                            {m.email}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block rounded-md border px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${getRoleBadgeClasses(
                              m.role
                            )}`}
                          >
                            {roleInfo.title}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="text-[11px] text-slate-600 dark:text-[#8E9B94]">
                            {m.role === "SUPER_ADMIN"
                              ? "All Operations + Root Governance"
                              : m.role === "ADMIN"
                              ? "All Operations (Read-Only Team)"
                              : m.role === "EDITOR"
                              ? "Field Collections & Payments"
                              : "Read-Only Auditor"}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-[11px] text-slate-500 dark:text-[#8E9B94] font-mono">
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Active"}
                        </td>

                        {isSuperAdmin && (
                          <td className="px-5 py-3.5 text-right">
                            {m.isPrimaryOwner ? (
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Immutable
                              </span>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedMember(m);
                                    setNewRole(m.role);
                                  }}
                                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-emerald-500/40 hover:text-emerald-600 dark:border-[#1F2623] dark:text-[#ECEDEE] dark:hover:border-emerald-500/40 cursor-pointer"
                                >
                                  Change Role
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRevokeAccess(m)}
                                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-red-500 hover:bg-red-500/20 cursor-pointer"
                                  title="Revoke Access"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#1F2623] dark:bg-[#121614] sm:p-7">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1F2623]">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-[#10B981]">
                  <UserPlus className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Invite Staff Member
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {inviteSuccess ? (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600 dark:text-[#10B981] mb-2" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Invitation Dispatched!
                </p>
                <p className="mt-1 text-[11px] text-slate-600 dark:text-[#8E9B94]">
                  {inviteSuccess}
                </p>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} className="mt-4 space-y-4">
                <p className="text-xs text-slate-600 dark:text-[#8E9B94] leading-relaxed">
                  The user will receive an activation email via <span className="font-mono text-emerald-400">security@support.aarga.org</span> with a secure link to activate their account.
                </p>

                {inviteError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs font-semibold text-red-600 dark:text-red-400">
                    {inviteError}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-[#ECEDEE]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Sundaram Pillai"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none ring-emerald-500/30 transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-[#ECEDEE] dark:placeholder:text-[#8E9B94]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-[#ECEDEE]">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="sundaram@branch.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none ring-emerald-500/30 transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-[#ECEDEE] dark:placeholder:text-[#8E9B94]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-[#ECEDEE]">
                    Designated Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none ring-emerald-500/30 transition focus:border-emerald-500 focus:ring-4 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-[#ECEDEE]"
                  >
                    <option value="ADMIN">ADMIN — Operations Lead</option>
                    <option value="EDITOR">EDITOR — Field Desk (Collections only)</option>
                    <option value="VIEWER">VIEWER — Auditor (Read-Only)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(false)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-[#1F2623] dark:text-[#8E9B94] dark:hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 dark:bg-[#10B981] dark:text-[#090B0A] dark:hover:bg-[#0ea57e] disabled:opacity-50 cursor-pointer"
                  >
                    {inviteLoading ? "Sending..." : "Send Invitation"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#1F2623] dark:bg-[#121614] sm:p-7">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1F2623]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Modify Role for {selectedMember.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-600 dark:text-[#8E9B94]">
                Select the new privilege tier for <span className="font-mono text-white">{selectedMember.email}</span>:
              </p>

              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none ring-emerald-500/30 transition focus:border-emerald-500 focus:ring-4 dark:border-[#1F2623] dark:bg-[#0E1110] dark:text-[#ECEDEE]"
              >
                <option value="ADMIN">ADMIN — Operations Lead</option>
                <option value="EDITOR">EDITOR — Field Desk (Collections only)</option>
                <option value="VIEWER">VIEWER — Auditor (Read-Only)</option>
              </select>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-[#1F2623] dark:text-[#8E9B94] dark:hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateRole}
                  disabled={actionLoading}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 dark:bg-[#10B981] dark:text-[#090B0A] dark:hover:bg-[#0ea57e] disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? "Saving..." : "Save Role"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
