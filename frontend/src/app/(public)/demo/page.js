"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [institute, setInstitute] = useState("");
  const [role, setRole] = useState("principal");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/proxy/api/v1/demo/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          institute: institute,
          role: role,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to submit demo request.");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Failed to submit demo request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-16 md:py-24 max-w-2xl mx-auto px-4">
      <Card className="p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-2">
          Request Institutional Demo
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-8">
          Schedule a live demonstration with our student success advisors
        </p>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Demo Request Submitted
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Our onboarding team will reach out via email within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-lg">
                {error}
              </div>
            )}
            <Input 
              id="full_name" 
              label="Full Name" 
              placeholder="Dr. Rajesh Sharma" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
            <Input 
              id="email" 
              label="Official Institutional Email" 
              type="email" 
              placeholder="dean@university.edu" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <Input 
              id="institute" 
              label="Institute Name" 
              placeholder="Global Technical University" 
              value={institute}
              onChange={(e) => setInstitute(e.target.value)}
              required 
            />
            <Select 
              id="role" 
              label="Your Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: "principal", label: "Principal / Director" },
                { value: "hod", label: "Head of Department (HOD)" },
                { value: "counsellor", label: "Senior Student Counsellor" },
                { value: "admin", label: "IT / SIMS Administrator" }
              ]}
            />
            <Button type="submit" disabled={submitting} className="w-full mt-4">
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
