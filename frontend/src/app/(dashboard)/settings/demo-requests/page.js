"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, RefreshCw, Mail, Landmark, User, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import apiClient from "@/lib/apiClient";

export default function DemoRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionEmail, setActionEmail] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get("/demo/requests");
      setRequests(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load demo requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleResolve = async (email) => {
    setActionEmail(email);
    try {
      const response = await apiClient.post(`/demo/requests/${email}/resolve`);
      setRequests(response.data || []);
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to update request status.");
    } finally {
      setActionEmail("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/settings">
            <Button variant="ghost" size="sm" className="p-2 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Institutional Demo Leads</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Review and manage incoming product demonstration requests from external institutions
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading} className="gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Requester</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Institution</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                      {[1, 2, 3, 4, 5, 6].map(j => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-sm text-slate-400">
                      <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                      <p>No institutional demo requests recorded yet.</p>
                    </td>
                  </tr>
                ) : (
                  requests
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map((req) => {
                      const isContacted = req.status === "contacted";
                      const dateObj = new Date(req.created_at);
                      const displayDate = isNaN(dateObj.getTime())
                        ? "—"
                        : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                      
                      const initials = req.full_name
                        ? req.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                        : "DR";

                      return (
                        <tr key={req.email} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                            {displayDate}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                                {initials}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">{req.full_name}</p>
                                <span className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5"><Mail className="w-3 h-3" />{req.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5 text-slate-400" />{req.institute}</span>
                          </td>
                          <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" />{req.role.toUpperCase()}</span>
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant={isContacted ? "low" : "medium"}>
                              {isContacted ? "CONTACTED" : "PENDING"}
                            </Badge>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Button
                              variant={isContacted ? "ghost" : "primary"}
                              size="sm"
                              disabled={actionEmail === req.email}
                              onClick={() => handleResolve(req.email)}
                              className="text-xs gap-1.5"
                            >
                              {actionEmail === req.email ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : isContacted ? (
                                "Mark Pending"
                              ) : (
                                <><CheckCircle2 className="w-3.5 h-3.5" /> Mark Contacted</>
                              )}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
