"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useStudents } from "@/hooks/useStudents";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [cursor, setCursor] = useState(null);

  const { data, isLoading, isError, refetch } = useStudents({ search, risk_level: riskFilter, cursor, limit: 25 });

  const students = data?.items ?? [];
  const nextCursor = data?.next_cursor ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Student Roster</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          All enrolled students with live risk scores from the prediction engine
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or enrollment number…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCursor(null); }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0 focus:ring-offset-transparent transition-all"
          />
        </div>
        <Select
          value={riskFilter}
          onChange={(e) => { setRiskFilter(e.target.value); setCursor(null); }}
          options={[
            { value: "", label: "All Risk Levels" },
            { value: "high",   label: "🔴 High Risk" },
            { value: "medium", label: "🟡 Medium Risk" },
            { value: "low",    label: "🟢 Low Risk" },
          ]}
          className="w-full sm:w-48"
        />
      </div>

      {/* Error */}
      {isError && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 text-xs text-red-600">
          Failed to load students.{" "}
          <button onClick={() => refetch()} className="underline font-semibold">Retry</button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Enrollment</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Department</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Semester</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Risk Score</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Risk Level</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                      {[1,2,3,4,5,6,7].map(j => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ width: `${50 + j * 10}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                      {search || riskFilter
                        ? "No students match your filters."
                        : "No students found. Upload a student spreadsheet to get started."}
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3 font-semibold text-slate-900 dark:text-slate-100">{s.full_name}</td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{s.enrollment_no}</td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400 max-w-[180px] truncate">{s.course_name ?? "—"}</td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{s.current_semester ?? "—"}</td>
                      <td className="px-5 py-3 font-bold text-slate-900 dark:text-slate-100">
                        {s.latest_risk_score != null ? `${s.latest_risk_score.toFixed(1)}%` : "—"}
                      </td>
                      <td className="px-5 py-3">
                        {s.latest_risk_level
                          ? <Badge variant={s.latest_risk_level}>{s.latest_risk_level.toUpperCase()}</Badge>
                          : <span className="text-xs text-slate-400">Not scored</span>
                        }
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/students/${s.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            View <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {nextCursor && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={() => setCursor(nextCursor)}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
