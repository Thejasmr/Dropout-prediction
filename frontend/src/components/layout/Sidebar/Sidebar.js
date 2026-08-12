"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Bell,
  UploadCloud,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "counsellor", "mentor"] },
  { label: "Students", href: "/students", icon: Users, roles: ["admin", "counsellor", "mentor"] },
  { label: "Risk Alerts", href: "/alerts", icon: Bell, roles: ["admin", "counsellor"] },
  { label: "Data Ingestion", href: "/ingestion", icon: UploadCloud, roles: ["admin"] },
  { label: "Reports", href: "/reports", icon: FileSpreadsheet, roles: ["admin", "counsellor"] },
  { label: "Settings", href: "/settings", icon: Settings, roles: ["admin"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    let localRole = localStorage.getItem("user_role");
    
    // Fallback: decode access token if user_role is empty/viewer but token exists
    if (!localRole || localRole === "viewer") {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const tokenPayload = token.split(".")[1];
          if (tokenPayload) {
            const decoded = JSON.parse(atob(tokenPayload));
            if (decoded && decoded.role) {
              localRole = decoded.role;
              localStorage.setItem("user_role", localRole);
            }
          }
        } catch (e) {
          console.error("Failed to parse token in Sidebar:", e);
        }
      }
    }
    
    setRole(localRole || "counsellor");

    // Fetch user profile from /auth/me to sync role and refresh localStorage
    fetch("/api/proxy/api/v1/auth/me", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data.role) {
          setRole(data.role);
          localStorage.setItem("user_role", data.role);
        }
      })
      .catch(() => {
        // Fallback or localRole will keep displaying
      });
  }, []);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 relative z-20",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn(
        "h-16 flex items-center border-b border-slate-200 dark:border-slate-800 transition-all",
        collapsed ? "justify-center px-2" : "justify-start px-4"
      )}>
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          {!collapsed && (
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 whitespace-nowrap">
              EduPulse AI
            </span>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-8 -translate-y-1/2 -right-3 p-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shadow-sm transition-colors z-30"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-xl text-sm font-medium transition-colors py-2.5",
                collapsed ? "justify-center px-0" : "px-3 gap-3",
                isActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
