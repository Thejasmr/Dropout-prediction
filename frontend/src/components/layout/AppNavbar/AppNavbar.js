"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Sun,
  Moon,
  Building2,
  User,
  LogOut,
  Menu,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useTheme } from "@/hooks/useTheme";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useAlertStore } from "@/store/useAlertStore";

export function AppNavbar({ onOpenMobileNav }) {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useAlertStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState("EduPulse AI");
  const [user, setUser] = useState(null);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch("/api/proxy/api/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => {
        const role = localStorage.getItem("user_role") || "user";
        setUser({ full_name: role.charAt(0).toUpperCase() + role.slice(1), role, email: "" });
      });
  }, []);

  useEffect(() => {
    if (user) {
      setEditName(user.full_name || "");
      setEditEmail(user.email || "");
      if (user.email) {
        const savedPic = localStorage.getItem(`profile_pic_${user.email}`);
        setProfilePic(savedPic || "");
      }
    }
  }, [user]);

  useKeyboardShortcut("k", () => setIsSearchOpen(true));

  // Live search: query the students API when there's input
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `/api/proxy/api/v1/students?search=${encodeURIComponent(searchQuery)}&limit=8`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("access_token") || ""}` } }
        );
        const data = res.ok ? await res.json() : null;
        const items = (data?.items ?? []).map(s => ({
          id: s.id,
          name: `Student: ${s.full_name} (${s.enrollment_no})`,
          href: `/students/${s.id}`,
        }));
        setSearchResults(items);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Org / Campus Label */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="truncate max-w-[150px]">{selectedOrg}</span>
        </div>

        {/* Global Cmd+K Search Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-400 transition-colors w-48 lg:w-64"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left">Quick Search...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative overflow-hidden h-8 w-8 flex items-center justify-center"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isDark ? "dark" : "light"}
              initial={{ y: -15, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 15, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex items-center justify-center shrink-0"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Notification Bell */}
        <Link href="/alerts" className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800 hover:opacity-80 transition-opacity cursor-pointer text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.full_name ? user.full_name.split(" ").map(n => n[0]).join("") : "EP"
              )}
            </div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-semibold text-slate-900 dark:text-slate-100 leading-none">{user?.full_name || "Loading..."}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{user?.email || ""}</p>
            </div>
          </button>

          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setIsUserMenuOpen(false)}
              />
              
              <div className="absolute right-0 top-12 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm uppercase overflow-hidden">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.full_name ? user.full_name.split(" ").map(n => n[0]).join("") : "EP"
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-tight">{user?.full_name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-40">{user?.email}</p>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-1.5 ${
                      user?.role === "admin"
                        ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                        : user?.role === "counsellor"
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                        : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                    }`}>
                      {user?.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Account Settings
                  </button>

                  <button
                    onClick={() => {
                      localStorage.clear();
                      router.push("/login");
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Global Search Cmd+K Modal */}
      <Modal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} title="Global Quick Search">
        <Input
          id="global_search_input"
          placeholder="Search students, alerts, or reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
        <div className="mt-4 space-y-1 max-h-60 overflow-y-auto">
          {searchLoading ? (
            <p className="text-xs text-slate-400 text-center py-4">Searching…</p>
          ) : searchResults.length > 0 ? (
            searchResults.map((item) => (
              <div
                key={item.id}
                onClick={() => { setIsSearchOpen(false); router.push(item.href); }}
                className="p-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
              >
                <span>{item.name}</span>
                <span className="text-[10px] text-slate-400">Jump to →</span>
              </div>
            ))
          ) : searchQuery.length >= 2 ? (
            <p className="text-xs text-slate-400 text-center py-4">No students found for "{searchQuery}"</p>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">Type at least 2 characters to search students</p>
          )}
        </div>
      </Modal>

      {/* Account Settings Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setUpdateError("");
        }}
        title="Account Profile Settings"
      >
        {updateError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 text-red-600 text-xs font-medium">
            {updateError}
          </div>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setUpdateError("");
            setUpdating(true);
            try {
              const res = await fetch("/api/proxy/api/v1/auth/me", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
                },
                body: JSON.stringify({
                  full_name: editName,
                  password: newPassword || undefined,
                }),
              });

              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.detail || "Failed to update profile.");
              }

              const data = await res.json();
              setUser(data);
              setNewPassword("");
              setIsProfileModalOpen(false);
            } catch (err) {
              setUpdateError(err.message || "Failed to update profile.");
            } finally {
              setUpdating(false);
            }
          }}
          className="space-y-4"
        >
          {/* Profile Picture Uploader */}
          <div className="flex flex-col items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-2">
            <div className="relative w-20 h-20 rounded-full bg-blue-600 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center font-bold text-xl text-white uppercase overflow-hidden shadow-sm">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                editName ? editName.split(" ").map(n => n[0]).join("") : "EP"
              )}
            </div>
            <div className="flex gap-2">
              <label className="cursor-pointer text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64String = reader.result;
                        setProfilePic(base64String);
                        if (user?.email) {
                          localStorage.setItem(`profile_pic_${user.email}`, base64String);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              {profilePic && (
                <button
                  type="button"
                  onClick={() => {
                    setProfilePic("");
                    if (user?.email) {
                      localStorage.removeItem(`profile_pic_${user.email}`);
                    }
                  }}
                  className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <Input
            id="profile_name"
            label="Full Name"
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <Input
            id="profile_email"
            label="Official Institutional Email"
            type="email"
            value={editEmail}
            disabled={true}
            className="disabled:opacity-60 disabled:bg-slate-50 dark:disabled:bg-slate-800/40 disabled:cursor-not-allowed"
            required
          />

          <Input
            id="profile_password"
            label="Change Password"
            type="password"
            placeholder="Enter new password (leave blank to keep current)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsProfileModalOpen(false);
                setUpdateError("");
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors"
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </header>
  );
}
