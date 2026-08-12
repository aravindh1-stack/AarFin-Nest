"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { initialGroups, initialBatches } from "@/lib/store";
import { Group } from "@/lib/types";
import { Plus, MapPin, X, CheckCircle2, Eye, Edit3, Save } from "lucide-react";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // View & Edit Group State
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form State for Create
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatches[0].id);
  const [groupName, setGroupName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [routeName, setRouteName] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [collectionAgent, setCollectionAgent] = useState("");

  // Form State for Edit
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editRoute, setEditRoute] = useState("");
  const [editAgent, setEditAgent] = useState("");
  const [editOrder, setEditOrder] = useState<number>(1);

  const openViewModal = (group: Group) => {
    setSelectedGroup(group);
    setEditName(group.group_name);
    setEditCode(group.group_code);
    setEditRoute(group.route_name);
    setEditAgent(group.collection_agent || "");
    setEditOrder(group.display_order || 1);
    setIsEditMode(false);
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    const updatedGroups = groups.map((g) => {
      if (g.id === selectedGroup.id) {
        return {
          ...g,
          group_name: editName,
          group_code: editCode.toUpperCase(),
          route_name: editRoute,
          collection_agent: editAgent,
          display_order: editOrder,
        };
      }
      return g;
    });

    setGroups(updatedGroups);
    setSelectedGroup(null);
    setNotification(`Collection Group '${editCode.toUpperCase()}' updated successfully!`);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();

    const batch = initialBatches.find((b) => b.id === selectedBatchId);
    const newGroupCode = groupCode.trim().toUpperCase() || `GRP-ROUTE-${Math.floor(10 + Math.random() * 90)}`;

    const newGroup: Group = {
      id: `g${Date.now()}`,
      batch_id: selectedBatchId,
      group_name: groupName,
      group_code: newGroupCode,
      route_name: routeName,
      display_order: displayOrder,
      collection_agent: collectionAgent || "Unassigned Agent",
      customer_count: 0,
      batch_name: batch?.batch_name,
      created_at: new Date().toISOString()
    };

    setGroups([newGroup, ...groups]);
    setIsCreateModalOpen(false);
    setNotification(`Collection Group '${newGroupCode}' created successfully!`);
    setTimeout(() => setNotification(null), 5000);

    setGroupName("");
    setGroupCode("");
    setRouteName("");
    setCollectionAgent("");
  };

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans" style={{ backgroundColor: "var(--bg-main)", color: "var(--text-main)" }}>
      <Sidebar />
      <Header title="Collection Route Groups" subtitle="Partition Scheme Batches into Geographical Agent Routes" />

      <main className="ml-64 p-6 space-y-6">
        {notification && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 p-4 rounded-xl flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-semibold">{notification}</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono text-emerald-500">GROUP_UPDATED</span>
          </div>
        )}

        {/* Top Actions & Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Geographical Route Groups</h2>
            <p className="text-xs opacity-70">Click any group card to view details or edit parameters</p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Collection Group</span>
          </button>
        </div>

        {/* Groups Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              onClick={() => openViewModal(group)}
              className="p-6 rounded-2xl border glass-panel transition-all flex flex-col justify-between cursor-pointer hover:border-[#0F766E] shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#0F766E]/20 text-[#10B981] border border-[#0F766E]/30 uppercase tracking-wider font-mono">
                    {group.group_code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                    Order #{group.display_order || 1}
                  </span>
                </div>

                <h3 className="text-base font-bold mb-1">{group.group_name}</h3>
                <p className="text-xs text-emerald-500 font-semibold mb-3">{group.batch_name}</p>

                <div className="rounded-xl p-4 border space-y-2 mb-4" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                  <div className="flex items-center gap-1.5 text-xs opacity-80">
                    <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span className="font-semibold">{group.route_name}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t" style={{ borderColor: "var(--border-color)" }}>
                    <span className="opacity-75">Field Agent:</span>
                    <span className="font-bold text-emerald-500">{group.collection_agent}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t text-xs font-medium" style={{ borderColor: "var(--border-color)" }}>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Click to View / Edit
                </span>
                <span className="opacity-60">{group.customer_count || 10} Members</span>
              </div>
            </div>
          ))}
        </div>

        {/* View & Edit Details Modal */}
        {selectedGroup && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div 
              className="border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
            >
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold">{selectedGroup.group_name}</h3>
                    <span className="text-[10px] font-mono font-bold text-emerald-500 bg-[#0F766E]/20 px-2 py-0.5 rounded border border-[#0F766E]/30">
                      {selectedGroup.group_code}
                    </span>
                  </div>
                  <p className="text-xs opacity-70">Scheme: {selectedGroup.batch_name}</p>
                </div>
                <button onClick={() => setSelectedGroup(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!isEditMode ? (
                /* VIEW STATE */
                <div className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-2 gap-4 rounded-xl p-4 border" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}>
                    <div>
                      <p className="opacity-60">Group Name</p>
                      <p className="font-bold text-sm">{selectedGroup.group_name}</p>
                    </div>
                    <div>
                      <p className="opacity-60">Group Code</p>
                      <p className="font-mono font-bold text-emerald-500">{selectedGroup.group_code}</p>
                    </div>
                    <div>
                      <p className="opacity-60">Geographical Route</p>
                      <p className="font-bold text-emerald-500">{selectedGroup.route_name}</p>
                    </div>
                    <div>
                      <p className="opacity-60">Assigned Agent</p>
                      <p className="font-bold text-emerald-500">{selectedGroup.collection_agent || "Unassigned"}</p>
                    </div>
                    <div>
                      <p className="opacity-60">Display Order</p>
                      <p className="font-bold">Index #{selectedGroup.display_order || 1}</p>
                    </div>
                    <div>
                      <p className="opacity-60">Enrolled Members</p>
                      <p className="font-bold">{selectedGroup.customer_count || 10} Members</p>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t" style={{ borderColor: "var(--border-color)" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedGroup(null)}
                      className="px-4 py-2 border rounded-xl font-semibold opacity-80 hover:opacity-100 cursor-pointer"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditMode(true)}
                      className="px-4 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Details</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* EDIT FORM STATE */
                <form onSubmit={handleSaveChanges} className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Group Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Group Code</label>
                      <input
                        type="text"
                        required
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        className="w-full border rounded-xl px-3.5 py-2.5 font-mono uppercase focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Geographical Route Name</label>
                    <input
                      type="text"
                      required
                      value={editRoute}
                      onChange={(e) => setEditRoute(e.target.value)}
                      className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Field Agent</label>
                      <input
                        type="text"
                        value={editAgent}
                        onChange={(e) => setEditAgent(e.target.value)}
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 opacity-80">Display Order Index</label>
                      <input
                        type="number"
                        required
                        value={editOrder}
                        onChange={(e) => setEditOrder(Number(e.target.value))}
                        className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                        style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t" style={{ borderColor: "var(--border-color)" }}>
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="px-4 py-2 border rounded-xl font-semibold opacity-80 hover:opacity-100 cursor-pointer"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}
                    >
                      Cancel Edit
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal Dialog for Create Group */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div 
              className="border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
            >
              <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: "var(--border-color)" }}>
                <div>
                  <h3 className="text-base font-bold">Create Collection Route Group</h3>
                  <p className="text-xs opacity-70">Partition customers into specific agent route groups</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="opacity-70 hover:opacity-100 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-semibold mb-1 opacity-80">Map to Scheme Batch</label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                    style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                  >
                    {initialBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batch_name} ({b.batch_code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Group Name</label>
                    <input
                      type="text"
                      required
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g. Srirangam Route B"
                      className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Group Code</label>
                    <input
                      type="text"
                      required
                      value={groupCode}
                      onChange={(e) => setGroupCode(e.target.value)}
                      placeholder="e.g. GRP-SRG-02"
                      className="w-full border rounded-xl px-3.5 py-2.5 font-mono uppercase focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 opacity-80">Geographical Route / Area Name</label>
                  <input
                    type="text"
                    required
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="e.g. Temple Gate, North Street & Main Bazaar"
                    className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                    style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Assigned Field Agent</label>
                    <input
                      type="text"
                      value={collectionAgent}
                      onChange={(e) => setCollectionAgent(e.target.value)}
                      placeholder="e.g. M. Velu"
                      className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 opacity-80">Display Order Index</label>
                    <input
                      type="number"
                      required
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      className="w-full border rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F766E]"
                      style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)", color: "var(--text-main)" }}
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t" style={{ borderColor: "var(--border-color)" }}>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 border rounded-xl font-semibold opacity-80 hover:opacity-100 cursor-pointer"
                    style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Save Collection Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
