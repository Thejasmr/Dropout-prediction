"use client";

import React, { useState } from "react";
import { FileText, FileSpreadsheet, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

function useSummaryReport() {
  return useQuery({
    queryKey: ["report-summary"],
    queryFn: () => apiClient.get("/reports/summary").then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

function useCohortReport() {
  return useQuery({
    queryKey: ["report-cohort"],
    queryFn: () => apiClient.get("/reports/cohort").then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState("cohort_risk_summary");
  const [exportingCSV, setExportingCSV] = useState(false);

  const { data: summary, isLoading: summaryLoading } = useSummaryReport();
  const { data: cohort, isLoading: cohortLoading } = useCohortReport();

  const handleExportCSV = async () => {
    setExportingCSV(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : "";
      const res = await fetch("/api/proxy/api/v1/reports/export", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "student_risk_report.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("CSV export failed: " + err.message);
    } finally {
      setExportingCSV(false);
    }
  };

  const isLoading = summaryLoading || cohortLoading;
  const generatedAt = new Date().toLocaleString();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Institutional Report Builder</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Live reports generated from real student data — no mock values
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="md:col-span-1 p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Export Options</h3>

          <Select
            id="report_type_select"
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { value: "cohort_risk_summary",   label: "Cohort Risk Summary" },
              { value: "high_risk_roster",       label: "High Risk Student Roster" },
              { value: "attendance_audit",       label: "Attendance Audit Log" },
              { value: "fee_defaulter_list",     label: "Fee Defaulter Correlation" },
            ]}
          />

          <div className="pt-2 space-y-2">
            <Button
              onClick={handleExportCSV}
              disabled={exportingCSV}
              variant="outline"
              className="w-full gap-2"
            >
              {exportingCSV
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Exporting…</>
                : <><FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV</>
              }
            </Button>
          </div>

          <p className="text-[10px] text-slate-400 pt-2">
            CSV export pulls live data from the database. PDF generation is handled server-side via the backend report service.
          </p>
        </Card>

        {/* Live Preview */}
        <Card className="md:col-span-2 p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> Live Report Preview
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Generated: {generatedAt}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-xs bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 px-0 pb-0">
            {isLoading ? (
              <div className="space-y-2 animate-pulse">
                {[...Array(8)].map((_,i) => (
                  <div key={i} className="h-4 rounded bg-slate-200 dark:bg-slate-800" style={{ width: `${60 + i * 5}%` }} />
                ))}
              </div>
            ) : (
              <div className="text-slate-700 dark:text-slate-300 space-y-1.5 p-4">
                <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100">EDUPULSE AI — INSTITUTIONAL RISK REPORT</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Report Type: {reportType.replace(/_/g, " ").toUpperCase()}</p>
                </div>

                <p>REPORT GENERATED: {generatedAt}</p>
                <p>─────────────────────────────────────────────</p>
                <p>TOTAL STUDENTS ENROLLED: {summary?.total_students?.toLocaleString() ?? "—"}</p>
                <p>HIGH RISK (SCORE ≥ {summary?.high_threshold ?? 70}%): {summary?.high_risk_count ?? "—"} STUDENTS</p>
                <p>MEDIUM RISK ({summary?.medium_threshold ?? 40}–{(summary?.high_threshold ?? 70) - 1}%): {summary?.medium_risk_count ?? "—"} STUDENTS</p>
                <p>LOW RISK: {summary?.low_risk_count ?? "—"} STUDENTS</p>
                <p>─────────────────────────────────────────────</p>

                {cohort?.cohorts?.length > 0 && (<>
                  <p>COHORT BREAKDOWN:</p>
                  {cohort.cohorts.map((c, i) => (
                    <p key={i}>  {c.cohort?.padEnd(16)} HIGH: {c.high}  MED: {c.medium}  LOW: {c.low}</p>
                  ))}
                  <p>─────────────────────────────────────────────</p>
                </>)}

                {summary?.top_risk_factors?.length > 0 && (<>
                  <p>TOP RISK DRIVERS:</p>
                  {summary.top_risk_factors.map((f, i) => (
                    <p key={i}>  {i + 1}. {f.factor?.replace(/_/g, " ").toUpperCase()} ({(f.weight * 100).toFixed(1)}% WEIGHT)</p>
                  ))}
                  <p>─────────────────────────────────────────────</p>
                </>)}

                <p>DATA SOURCE: Live database — EduPulse AI backend</p>
                <p>EXPORT THIS DATA: Use the CSV export button.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
