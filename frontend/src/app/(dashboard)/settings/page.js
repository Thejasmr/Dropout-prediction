"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Settings, Sliders, Bell, Users, Save, CheckCircle2, RefreshCw, FileSpreadsheet } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => apiClient.get("/auth/me").then(r => r.data),
    staleTime: 10 * 60 * 1000,
  });
}

export default function SettingsPage() {
  const { highThreshold, mediumThreshold, weights, setThresholds, setWeight } = useSettingsStore();
  const { data: currentUser } = useCurrentUser();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (totalWeight !== 100) {
      setError("Total weights must sum to exactly 100% before saving settings.");
      setTimeout(() => setError(""), 5000);
      return;
    }
    setError("");
    setSaving(true);
    // Settings (thresholds & weights) are stored in Zustand + localStorage via useSettingsStore.
    // They are read by the ML service on each prediction call.
    // A future enhancement can persist these to the backend via a settings endpoint.
    await new Promise(r => setTimeout(r, 400)); // simulate commit
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const totalWeight = (weights.attendance || 0) + (weights.academic || 0) + (weights.fee || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">System Settings & Governance</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure risk formula weights, notification schedule info, and user access
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          variant="primary"
          className="gap-2"
        >
          {saving
            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
            : saved
            ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Saved!</>
            : <><Save className="w-4 h-4" /> Save Settings</>
          }
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Weights & Thresholds */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" /> Risk Calculation Weights & Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-0 pb-0">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Input
                id="high_threshold"
                label="High Risk Cutoff 🔴"
                type="number"
                min={1} max={100}
                value={highThreshold}
                onChange={(e) => setThresholds(Number(e.target.value), mediumThreshold)}
              />
              <Input
                id="medium_threshold"
                label="Medium Risk Cutoff 🟡"
                type="number"
                min={1} max={100}
                value={mediumThreshold}
                onChange={(e) => setThresholds(highThreshold, Number(e.target.value))}
              />
            </div>

            {[
              { key: "attendance", label: "Attendance Weight",        min: 10, max: 60, color: "accent-blue-600" },
              { key: "academic",   label: "Academic Score Weight",    min: 10, max: 50, color: "accent-indigo-600" },
              { key: "fee",        label: "Fee Overdue Delay Weight", min: 5,  max: 30, color: "accent-amber-500" },
            ].map(({ key, label, min, max, color }) => (
              <div key={key}>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700 dark:text-slate-300">{label}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{weights[key]}%</span>
                </div>
                <input
                  type="range" min={min} max={max}
                  value={weights[key]}
                  onChange={(e) => setWeight(key, Number(e.target.value))}
                  className={`w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer ${color}`}
                />
              </div>
            ))}

            <div className={`text-xs font-semibold pt-1 ${totalWeight === 100 ? "text-emerald-600" : "text-amber-600"}`}>
              Total Weight: {totalWeight}% {totalWeight !== 100 && "(should sum to 100%)"}
            </div>
          </CardContent>
        </Card>

        {/* Notification Info */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" /> Celery Beat Notification Schedules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-0 pb-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              These schedules run server-side via Celery Beat. Configure cron expressions in <code className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">backend/.env</code>.
            </p>
            {[
              { title: "Weekly Mentor Digest", desc: "WEEKLY_DIGEST_CRON — default: every Monday 08:00 UTC" },
              { title: "Nightly Risk Rescoring", desc: "RISK_CALC_CRON — default: daily 01:00 UTC" },
              { title: "High-Risk Immediate Alert", desc: "Triggered on data ingestion — no schedule needed" },
            ].map(({ title, desc }) => (
              <div key={title} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Governance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User access quick-link */}
        <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">User & Role Governance</p>
              <p className="text-xs text-slate-500">
                {currentUser
                  ? `Logged in as: ${currentUser.full_name} (${currentUser.role})`
                  : "Manage user accounts"}
              </p>
            </div>
          </div>
          <Link href="/settings/users">
            <Button variant="outline" size="sm" className="shrink-0">Manage Users →</Button>
          </Link>
        </Card>

        {/* Demo Requests quick-link */}
        <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100">Demo Requests Panel</p>
              <p className="text-xs text-slate-500">
                View and manage incoming institutional demo leads
              </p>
            </div>
          </div>
          <Link href="/settings/demo-requests">
            <Button variant="outline" size="sm" className="shrink-0">View Requests →</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
