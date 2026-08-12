"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sliders, Save } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function RiskThresholdsPage() {
  const { highThreshold, mediumThreshold, weights, setThresholds, setWeight } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Settings Hub
          </Button>
        </Link>

        <Button onClick={() => alert("Risk Thresholds updated successfully!")} size="sm" className="gap-1.5">
          <Save className="w-4 h-4" /> Save Configuration
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Risk Threshold & Model Configuration</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Adjust XGBoost model classification cutoff thresholds and feature weighting factors
        </p>
      </div>

      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-sm">Risk Cutoff Thresholds</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            id="thresh_high"
            label="High Risk Cutoff (🔴 Score >= X)"
            type="number"
            value={highThreshold}
            onChange={(e) => setThresholds(Number(e.target.value), mediumThreshold)}
          />
          <Input
            id="thresh_med"
            label="Medium Risk Cutoff (🟡 Score >= X)"
            type="number"
            value={mediumThreshold}
            onChange={(e) => setThresholds(highThreshold, Number(e.target.value))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
