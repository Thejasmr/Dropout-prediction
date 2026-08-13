"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, ShieldAlert, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAlerts } from "@/hooks/useAlerts";
import apiClient from "@/lib/apiClient";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";

function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiClient.get("/reports/summary").then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });
}

function useCohortReport() {
  return useQuery({
    queryKey: ["cohort-report"],
    queryFn: () => apiClient.get("/reports/cohort").then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

function KpiSkeleton() {
  return (
    <div className="h-28 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
  );
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { data: summary, isLoading: summaryLoading, isError: summaryError, isFetching: summaryFetching } = useDashboardSummary();
  const { data: cohort, isLoading: cohortLoading, isFetching: cohortFetching } = useCohortReport();
  const { data: alertsData, isLoading: alertsLoading, isFetching: alertsFetching } = useAlerts({ is_read: false });

  const isRefreshing = summaryFetching || cohortFetching || alertsFetching;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    queryClient.invalidateQueries({ queryKey: ["cohort-report"] });
    queryClient.invalidateQueries({ queryKey: ["alerts"] });
  };

  const totalStudents = summary?.total_students ?? 0;
  const highRisk = summary?.high_risk_count ?? 0;
  const mediumRisk = summary?.medium_risk_count ?? 0;
  const lowRisk = summary?.low_risk_count ?? 0;
  const cohortHealthPct = totalStudents > 0
    ? ((lowRisk / totalStudents) * 100).toFixed(1)
    : "—";

  const trendData = summary?.monthly_trend ?? [];
  const cohortData = (cohort?.cohorts ?? []).map((c) => ({
    cohort: c.cohort_name,
    high: c.high_risk_count,
    medium: c.medium_risk_count,
    low: c.low_risk_count,
  }));
  const recentAlerts = (alertsData?.items ?? alertsData ?? []).slice(0, 15);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            EduPulse AI — Risk Summary
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time dropout warnings & multi-signal cohort analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Link href="/ingestion">
            <Button size="sm">Upload Spreadsheet</Button>
          </Link>
        </div>
      </div>

      {/* Error state */}
      {summaryError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
          Failed to load dashboard data. Check your connection or{" "}
          <button onClick={handleRefresh} className="underline font-semibold">retry</button>.
        </div>
      )}

      {/* KPI Cards */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryLoading ? (
          [1,2,3,4].map(i => <KpiSkeleton key={i} />)
        ) : (<>
          <motion.div variants={item} className="h-full">
            <Card hoverSpotlight className="h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Students</p>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                    {totalStudents.toLocaleString()}
                  </h3>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">Enrolled across all departments</p>
            </Card>
          </motion.div>

          <motion.div variants={item} className="h-full">
            <Card hoverSpotlight className="h-full flex flex-col justify-between border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase">High Risk</p>
                  <h3 className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">{highRisk}</h3>
                </div>
                <Badge variant="high">Requires Action</Badge>
              </div>
              <p className="text-[11px] text-red-600/80 dark:text-red-400/80 mt-3 font-medium">Immediate intervention advised</p>
            </Card>
          </motion.div>

          <motion.div variants={item} className="h-full">
            <Card hoverSpotlight className="h-full flex flex-col justify-between border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold uppercase">Medium Risk</p>
                  <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{mediumRisk}</h3>
                </div>
                <Badge variant="medium">Follow-up</Badge>
              </div>
              <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-3 font-medium">Mentor review within 7 days</p>
            </Card>
          </motion.div>

          <motion.div variants={item} className="h-full">
            <Card hoverSpotlight className="h-full flex flex-col justify-between border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Low Risk</p>
                  <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{lowRisk}</h3>
                </div>
                <Badge variant="low">On Track</Badge>
              </div>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-3 font-medium">{cohortHealthPct}% cohort health rate</p>
            </Card>
          </motion.div>
        </>)}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance & Academic Trend</CardTitle>
            <CardDescription>Monthly average attendance % vs test performance index</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {summaryLoading ? (
              <div className="h-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ) : trendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No trend data yet — upload spreadsheets to populate.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(51, 65, 85, 0.5)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                      padding: "8px 12px",
                    }}
                    labelStyle={{
                      color: "#f8fafc",
                      fontWeight: "bold",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                    itemStyle={{
                      fontSize: "12px",
                      padding: "2px 0",
                    }}
                  />
                  <Area type="monotone" dataKey="attendance" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAtt)" animationDuration={800} />
                  <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" animationDuration={800} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Live Alert Feed */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldAlert className="w-4 h-4 text-red-500" /> Recent Risk Flags
              </CardTitle>
              <CardDescription>Early-warning signals & active counselor flags</CardDescription>
            </div>
            <Link href="/alerts" className="text-xs text-blue-600 hover:underline">View All →</Link>
          </CardHeader>
          <CardContent className="h-72 overflow-y-auto pr-1 space-y-3">
            {alertsLoading ? (
              [1,2,3].map(i => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))
            ) : recentAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No unread alerts — all clear.</p>
            ) : (
              recentAlerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate max-w-[60%]">
                      {alert.student_name ?? `Student ${alert.student_id?.slice(0,8)}`}
                    </span>
                    <Badge variant={alert.severity === "critical" ? "high" : alert.severity === "warning" ? "medium" : "low"}>
                      {alert.severity?.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{alert.message}</p>
                  <span className="text-[10px] text-slate-400 block">
                    {alert.created_at ? new Date(alert.created_at).toLocaleString() : ""}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cohort Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Department & Cohort Risk Breakdown</CardTitle>
          <CardDescription>Risk distribution count per academic semester group</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          {cohortLoading ? (
            <div className="h-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ) : cohortData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No cohort data yet — upload student records to populate.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="cohort" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(51, 65, 85, 0.2)" }}
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(51, 65, 85, 0.5)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                    padding: "8px 12px",
                  }}
                  labelStyle={{
                    color: "#f8fafc",
                    fontWeight: "bold",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                  itemStyle={{
                    fontSize: "12px",
                    padding: "2px 0",
                  }}
                />
                <Bar dataKey="high"   fill="#EF4444" stackId="a" animationDuration={800} />
                <Bar dataKey="medium" fill="#F59E0B" stackId="a" animationDuration={800} />
                <Bar dataKey="low"    fill="#10B981" stackId="a" animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
