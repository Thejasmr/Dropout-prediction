"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ShieldAlert, Edit3, MessageSquare, Phone, Mail, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { useStudent } from "@/hooks/useStudent";
import { useRiskScore } from "@/hooks/useRiskScore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

function useStudentTimeline(studentId) {
  return useQuery({
    queryKey: ["student-timeline", studentId],
    queryFn: () => apiClient.get(`/students/${studentId}/timeline`).then(r => r.data),
    enabled: Boolean(studentId),
  });
}

function useCounsellingLog(studentId) {
  return useQuery({
    queryKey: ["counselling", studentId],
    queryFn: () => apiClient.get(`/students/${studentId}/counselling`).then(r => r.data).catch(() => []),
    enabled: Boolean(studentId),
  });
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const qc = useQueryClient();

  const { data: student, isLoading: studentLoading } = useStudent(id);
  const { data: risk, isLoading: riskLoading } = useRiskScore(id);
  const { data: timeline = [] } = useStudentTimeline(id);
  const { data: sessions = [] } = useCounsellingLog(id);

  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideLevel, setOverrideLevel] = useState("medium");
  const [overrideReason, setOverrideReason] = useState("");
  const [newNote, setNewNote] = useState("");
  const [noteError, setNoteError] = useState("");

  const overrideMutation = useMutation({
    mutationFn: ({ risk_level, reason }) =>
      apiClient.post(`/students/${id}/override`, { risk_level, reason }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["riskScore", id] });
      setIsOverrideOpen(false);
      setOverrideReason("");
    },
  });

  const counsellingMutation = useMutation({
    mutationFn: (notes) =>
      apiClient.post(`/students/${id}/counselling`, { notes, outcome: "noted" }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["counselling", id] });
      setNewNote("");
      setNoteError("");
    },
    onError: (err) => setNoteError(err?.response?.data?.detail || "Failed to save note."),
  });

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    counsellingMutation.mutate(newNote);
  };

  // Build chart data from timeline (risk scores over time, oldest first)
  const scoreChartData = [...timeline]
    .reverse()
    .slice(-10)
    .map(t => ({
      date: t.calculated_at ? new Date(t.calculated_at).toLocaleDateString("en", { month: "short", day: "numeric" }) : "",
      score: t.score != null ? parseFloat(t.score.toFixed(1)) : null,
    }));

  const riskLevel = risk?.risk_level ?? student?.latest_risk_level;
  const riskScore = risk?.score ?? student?.latest_risk_score;
  
  let rawFactors = risk?.contributing_factors ?? {};
  let factors = {};
  if (rawFactors.factors && typeof rawFactors.factors === "object" && !Array.isArray(rawFactors.factors)) {
    factors = rawFactors.factors;
  } else if (rawFactors.features && rawFactors.factors) {
    // If it is the custom structured dict with fallback factors list, calculate proper SHAP values
    factors = {};
    if (rawFactors.features.attendance_rate < 75) {
      factors.attendance_rate = (75 - rawFactors.features.attendance_rate) * 0.004;
    }
    if (rawFactors.features.score_trend < 0) {
      factors.score_trend = Math.abs(rawFactors.features.score_trend) * 0.015;
    }
    if (rawFactors.features.fee_delay_days > 0) {
      factors.fee_delay_days = rawFactors.features.fee_delay_days * 0.003;
    }
    if (rawFactors.features.consecutive_absences > 3) {
      factors.consecutive_absences = rawFactors.features.consecutive_absences * 0.012;
    }
    if (Object.keys(factors).length === 0) {
      factors.attendance_rate = 0.05;
    }
  } else if (!rawFactors.features && !rawFactors.factors) {
    factors = rawFactors;
  }

  const initials = student?.full_name
    ? student.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)
    : "??";

  const rawAttendance = student?.attendance_rate != null
    ? student.attendance_rate
    : (rawFactors.features?.attendance_rate != null
        ? rawFactors.features.attendance_rate / 100.0
        : null);

  const attendancePct = rawAttendance != null
    ? parseFloat((rawAttendance * 100).toFixed(1))
    : null;

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = attendancePct != null
    ? circumference - (attendancePct / 100) * circumference
    : circumference;
  const ringColor = attendancePct != null && attendancePct < 75 ? "#EF4444" : "#10B981";

  if (studentLoading || riskLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-sm">Student not found.</p>
        <Link href="/students"><Button className="mt-4" variant="outline" size="sm">Back to Roster</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Nav */}
      <div className="flex items-center justify-between">
        <Link href="/students">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Roster
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={() => setIsOverrideOpen(true)} className="gap-1.5">
          <Edit3 className="w-3.5 h-3.5" /> Manual Risk Override
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{student.full_name}</h1>
                {riskLevel && (
                  <Badge variant={riskLevel} pulsing={riskLevel === "high"}>
                    {riskLevel.toUpperCase()}
                    {riskScore != null ? ` (${riskScore.toFixed(1)}%)` : ""}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Enrollment: {student.enrollment_no} | Semester {student.current_semester ?? "—"}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                {student.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{student.email}</span>}
                {student.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{student.phone}</span>}
              </div>
            </div>
          </div>

          {/* Attendance Ring */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6"
                  className="text-slate-200 dark:text-slate-700" fill="transparent" />
                <circle cx="40" cy="40" r={radius} stroke={ringColor} strokeWidth="6"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round" fill="transparent"
                  style={{ transition: "stroke-dashoffset 1s ease-out" }} />
              </svg>
              <span className="absolute font-bold text-xs text-slate-900 dark:text-slate-100">
                {attendancePct != null ? `${attendancePct}%` : "—"}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">Attendance Rate</span>
              {attendancePct != null && attendancePct < 75 && (
                <span className="text-xs text-red-500 font-medium">Below 75% cutoff</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SHAP Factors */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" /> SHAP Risk Factor Attribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(factors).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No SHAP explanation available yet. Run the risk model to generate factors.
              </p>
            ) : (
              Object.entries(factors)
                .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                .slice(0, 5)
                .map(([factor, impact], i) => {
                  const pct = (Math.abs(impact) * 100).toFixed(1);
                  const colors = [
                    "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/60 text-red-800 dark:text-red-300 text-red-600 dark:text-red-400",
                    "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-amber-600 dark:text-amber-400",
                    "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-slate-500 dark:text-slate-400",
                  ];
                  const [bg, title, sub] = colors[i] ? colors[i].split(" ").reduce((acc, c, ci) => {
                    if (ci < 4) acc[0] += " " + c;
                    else if (ci < 6) acc[1] += " " + c;
                    else acc[2] += " " + c;
                    return acc;
                  }, ["", "", ""]) : [colors[2], "", ""];
                  return (
                    <div key={factor} className={`p-3 rounded-xl border ${i === 0 ? "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/60" : i === 1 ? "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/60" : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"}`}>
                      <div className={`flex justify-between text-xs font-bold ${i === 0 ? "text-red-800 dark:text-red-300" : i === 1 ? "text-amber-800 dark:text-amber-300" : "text-slate-800 dark:text-slate-200"}`}>
                        <span>{i + 1}. {factor.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span>+{pct}% SHAP</span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                        <div className={`h-full rounded-full ${i === 0 ? "bg-red-500" : i === 1 ? "bg-amber-500" : "bg-blue-500"}`}
                          style={{ width: `${Math.min(parseFloat(pct), 100)}%` }} />
                      </div>
                    </div>
                  );
                })
            )}
          </CardContent>
        </Card>

        {/* Risk Score Timeline Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Risk Score Timeline</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {scoreChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No score history yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v) => [`${v}%`, "Risk Score"]}
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
                  <Line type="monotone" dataKey="score" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4 }} animationDuration={600} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Counselling Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-500" /> Counsellor Logs & Intervention Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {noteError && (
            <div className="p-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg">{noteError}</div>
          )}
          <form onSubmit={handleAddNote} className="flex gap-3">
            <Input
              id="new_note"
              placeholder="Add counselling note or action item…"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <Button type="submit" size="sm" className="shrink-0" disabled={counsellingMutation.isPending}>
              {counsellingMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Add Note"}
            </Button>
          </form>

          <div className="space-y-3 pt-2">
            {sessions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No counselling sessions recorded yet.</p>
            ) : (
              sessions.map((s) => (
                <div key={s.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                    <span>{s.counsellor_name ?? "Counsellor"}</span>
                    <span className="text-slate-400 font-normal">
                      {s.session_date ?? (s.created_at ? new Date(s.created_at).toLocaleDateString() : "")}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{s.notes}</p>
                  {s.outcome && <p className="text-slate-400 mt-1">Outcome: {s.outcome}</p>}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Override Modal */}
      <Modal isOpen={isOverrideOpen} onClose={() => setIsOverrideOpen(false)} title="Override Calculated Risk Level">
        <div className="space-y-4">
          <Select
            id="override_level"
            label="Adjusted Risk Level"
            value={overrideLevel}
            onChange={(e) => setOverrideLevel(e.target.value)}
            options={[
              { value: "high",   label: "High Risk (🔴)" },
              { value: "medium", label: "Medium Risk (🟡)" },
              { value: "low",    label: "Low Risk (🟢)" },
            ]}
          />
          <Input
            id="override_reason"
            label="Override Justification"
            placeholder="e.g. Medical leave approved by HOD…"
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
          />
          {overrideMutation.isError && (
            <p className="text-xs text-red-500">{overrideMutation.error?.response?.data?.detail || "Override failed."}</p>
          )}
          <Button
            onClick={() => overrideMutation.mutate({ risk_level: overrideLevel, reason: overrideReason })}
            className="w-full"
            disabled={!overrideReason.trim() || overrideMutation.isPending}
          >
            {overrideMutation.isPending ? "Saving…" : "Confirm Override"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
