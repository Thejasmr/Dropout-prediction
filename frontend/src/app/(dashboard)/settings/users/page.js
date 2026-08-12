"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, UserPlus, RefreshCw, Shield, ShieldOff,
  Edit3, Check, X, Eye, EyeOff, Copy, CheckCheck
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

// ── Hooks ──────────────────────────────────────────────────────────────────
function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => apiClient.get("/auth/users").then(r => r.data),
    staleTime: 60 * 1000,
  });
}

function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => apiClient.get("/auth/me").then(r => r.data),
    staleTime: 10 * 60 * 1000,
  });
}

// ── Role colours ──────────────────────────────────────────────────────────
const roleConfig = {
  admin:      { label: "Admin",      color: "bg-red-100    dark:bg-red-950/40    text-red-600    dark:text-red-400"    },
  counsellor: { label: "Counsellor", color: "bg-blue-100   dark:bg-blue-950/40   text-blue-600   dark:text-blue-400"   },
  mentor:     { label: "Mentor",     color: "bg-amber-100  dark:bg-amber-950/40  text-amber-600  dark:text-amber-400"  },
};

function RolePill({ role }) {
  const cfg = roleConfig[role] ?? { label: role, color: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function UserManagementPage() {
  const qc = useQueryClient();
  const { data: users = [], isLoading, isError, refetch } = useUsers();
  const { data: me } = useCurrentUser();

  // Create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName]         = useState("");
  const [newEmail, setNewEmail]       = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newRole, setNewRole]         = useState("counsellor");
  const [createError, setCreateError] = useState("");
  const [copiedId, setCopiedId]       = useState(null); // tracks which user ID was just copied

  // Edit modal state
  const [editOpen, setEditOpen]       = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [editName, setEditName]       = useState("");
  const [editEmail, setEditEmail]     = useState("");
  const [editRole, setEditRole]       = useState("counsellor");
  const [editError, setEditError]     = useState("");

  // ── Mutations ─────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (p) => apiClient.post("/auth/users", p).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setCreateOpen(false);
      setNewName(""); setNewEmail(""); setNewPassword(""); setNewRole("counsellor");
      setCreateError("");
    },
    onError: (e) => setCreateError(e?.response?.data?.detail || "Failed to create user."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }) => apiClient.put(`/auth/users/${id}`, payload).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setEditOpen(false);
      setEditError("");
    },
    onError: (e) => setEditError(e?.response?.data?.detail || "Failed to update user."),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/auth/users/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const reactivateMutation = useMutation({
    mutationFn: (id) => apiClient.put(`/auth/users/${id}`, { is_active: true }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  // ── Helpers ───────────────────────────────────────────────────────────
  const openEdit = (user) => {
    setEditTarget(user);
    setEditName(user.full_name ?? "");
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditError("");
    setEditOpen(true);
  };

  const copyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isAdmin = me?.role === "admin";

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Settings
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          {isAdmin && (
            <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
              <UserPlus className="w-4 h-4" /> Create New User
            </Button>
          )}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">User & Access Management</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Create accounts, assign roles, and control platform access for your institution
        </p>
      </div>

      {/* Role guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { role: "admin",      desc: "Full access — manage users, settings, data ingestion, all reports" },
          { role: "counsellor", desc: "View all students, add counselling notes, override risk levels" },
          { role: "mentor",     desc: "View assigned students, read-only dashboard and alerts" },
        ].map(({ role, desc }) => (
          <div key={role} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
            <RolePill role={role} />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">{desc}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {isError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-xs text-red-600">
          Failed to load users.{" "}
          <button onClick={() => refetch()} className="underline font-semibold">Retry</button>
        </div>
      )}

      {/* User table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            All Platform Users
            <span className="ml-2 text-slate-400 font-normal text-xs">({users.length} total)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">User ID</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Joined</th>
                  {isAdmin && <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                      {[1,2,3,4,5,6].map(j => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ width: `${50 + j * 8}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                      No users yet.{isAdmin && " Click 'Create New User' to add the first one."}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isSelf = me?.id === user.id;
                    return (
                      <tr key={user.id}
                        className={`border-b border-slate-50 dark:border-slate-800/50 transition-colors ${
                          isSelf ? "bg-blue-50/30 dark:bg-blue-950/10" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                        }`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-[10px] font-bold flex items-center justify-center uppercase shrink-0">
                              {user.full_name?.split(" ").map(n => n[0]).join("").slice(0,2) ?? "?"}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {user.full_name ?? "—"}
                              {isSelf && <span className="ml-1.5 text-[9px] text-blue-500 font-bold">(you)</span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-400">{user.email}</td>
                        <td className="px-5 py-3"><RolePill role={user.role} /></td>
                        <td className="px-5 py-3">
                          {user.is_active
                            ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400"><Check className="w-3 h-3" /> Active</span>
                            : <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400"><X className="w-3 h-3" /> Inactive</span>
                          }
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => copyId(user.id)}
                            className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-blue-600 transition-colors"
                            title="Click to copy User ID"
                          >
                            {user.id.slice(0, 8)}…
                            {copiedId === user.id
                              ? <CheckCheck className="w-3 h-3 text-emerald-500" />
                              : <Copy className="w-3 h-3" />
                            }
                          </button>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-400">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                        </td>
                        {isAdmin && (
                          <td className="px-5 py-3 text-right">
                            {!isSelf && (
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" onClick={() => openEdit(user)}
                                  className="gap-1 text-xs h-7 px-2">
                                  <Edit3 className="w-3.5 h-3.5" /> Edit
                                </Button>
                                {user.is_active ? (
                                  <Button variant="ghost" size="sm"
                                    onClick={() => deactivateMutation.mutate(user.id)}
                                    disabled={deactivateMutation.isPending}
                                    className="gap-1 text-xs h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                                    <ShieldOff className="w-3.5 h-3.5" /> Deactivate
                                  </Button>
                                ) : (
                                  <Button variant="ghost" size="sm"
                                    onClick={() => reactivateMutation.mutate(user.id)}
                                    disabled={reactivateMutation.isPending}
                                    className="gap-1 text-xs h-7 px-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                                    <Shield className="w-3.5 h-3.5" /> Reactivate
                                  </Button>
                                )}
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
        </CardContent>
      </Card>

      {/* ── CREATE USER MODAL ── */}
      <Modal isOpen={createOpen} onClose={() => { setCreateOpen(false); setCreateError(""); }} title="Create New User Account">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
            setCreateError("All fields are required.");
            return;
          }
          createMutation.mutate({ full_name: newName, email: newEmail, password: newPassword, role: newRole });
        }} className="space-y-4">

          {createError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 text-xs text-red-600">{createError}</div>
          )}

          <Input id="c_name"  label="Full Name"          type="text"     value={newName}     onChange={e => setNewName(e.target.value)}     required placeholder="e.g. Dr. Ananya Sharma" />
          <Input id="c_email" label="Institutional Email" type="email"    value={newEmail}    onChange={e => setNewEmail(e.target.value)}    required placeholder="ananya.sharma@institution.edu" />

          {/* Password with show/hide toggle */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Initial Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                placeholder="Min. 8 characters"
                className="w-full pr-10 pl-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">The user can change this after first login via Account Settings.</p>
          </div>

          <Select id="c_role" label="Assign Role" value={newRole} onChange={e => setNewRole(e.target.value)}
            options={[
              { value: "admin",      label: "Admin — Full system access" },
              { value: "counsellor", label: "Counsellor — View & counsel students" },
              { value: "mentor",     label: "Mentor — Read-only dashboard" },
            ]}
          />

          {/* Role description reminder */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
            {newRole === "admin"      && "⚠️ Admin users can create/deactivate other users, change risk weights, and access all data."}
            {newRole === "counsellor" && "✅ Counsellors can view all student profiles, log counselling sessions, and override risk levels."}
            {newRole === "mentor"     && "📖 Mentors have read-only access to the dashboard, student list, and alerts."}
          </div>

          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending
              ? <><RefreshCw className="w-4 h-4 animate-spin mr-2" /> Creating Account…</>
              : <><UserPlus className="w-4 h-4 mr-2" /> Create User Account</>
            }
          </Button>
        </form>
      </Modal>

      {/* ── EDIT USER MODAL ── */}
      <Modal isOpen={editOpen} onClose={() => { setEditOpen(false); setEditError(""); }} title={`Edit User — ${editTarget?.full_name ?? ""}`}>
        <form onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate({ id: editTarget.id, full_name: editName, email: editEmail, role: editRole });
        }} className="space-y-4">

          {editError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 text-xs text-red-600">{editError}</div>
          )}

          {/* Read-only User ID */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">User ID (read-only)</p>
            <div className="flex items-center gap-2">
              <code className="text-xs text-slate-600 dark:text-slate-300 font-mono break-all">{editTarget?.id}</code>
              <button type="button" onClick={() => copyId(editTarget?.id)}
                className="text-slate-400 hover:text-blue-600 shrink-0">
                {copiedId === editTarget?.id ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <Input id="e_name"  label="Full Name"  type="text"  value={editName}  onChange={e => setEditName(e.target.value)}  required />
          <Input id="e_email" label="Email"       type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />

          <Select id="e_role" label="Role" value={editRole} onChange={e => setEditRole(e.target.value)}
            options={[
              { value: "admin",      label: "Admin" },
              { value: "counsellor", label: "Counsellor" },
              { value: "mentor",     label: "Mentor" },
            ]}
          />

          <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
            {updateMutation.isPending
              ? <><RefreshCw className="w-4 h-4 animate-spin mr-2" /> Saving…</>
              : "Save Changes"
            }
          </Button>
        </form>
      </Modal>

    </div>
  );
}
