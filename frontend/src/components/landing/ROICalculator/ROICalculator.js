"use client";

import React, { useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { formatCurrency } from "@/lib/utils";

export function ROICalculator() {
  const [totalStudents, setTotalStudents] = useState(1500);
  const [currentDropoutRate, setCurrentDropoutRate] = useState(12);

  const estimatedDropouts = Math.round((totalStudents * currentDropoutRate) / 100);
  const projectedSavedStudents = Math.round(estimatedDropouts * 0.45); // 45% reduction
  const costPerStudentRetention = 45000; // Estimated tuition & state grant value saved
  const projectedFinancialSavings = projectedSavedStudents * costPerStudentRetention;

  return (
    <ScrollReveal yOffset={35} delay={0.05}>
      <Card id="roi-calc" className="p-8 max-w-4xl mx-auto my-12 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-slate-900 dark:to-slate-800/80 border-blue-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Interactive Student Retention ROI Calculator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Estimate potential dropout reduction and financial impact for your institute
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>Total Enrolled Students</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{totalStudents} Students</span>
              </div>
              <input
                type="range"
                min="200"
                max="10000"
                step="100"
                value={totalStudents}
                onChange={(e) => setTotalStudents(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>Estimated Annual Dropout Rate</span>
                <span className="text-amber-600 font-bold">{currentDropoutRate}%</span>
              </div>
              <input
                type="range"
                min="3"
                max="35"
                step="1"
                value={currentDropoutRate}
                onChange={(e) => setCurrentDropoutRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 transition-all"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Estimated Annual At-Risk Count</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{estimatedDropouts} Students</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Projected Retained Students
              </span>
              <span className="font-bold text-emerald-600 text-lg">+{projectedSavedStudents} Students</span>
            </div>

            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">
                Projected Institutional Value Retained
              </span>
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {formatCurrency(projectedFinancialSavings)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </ScrollReveal>
  );
}
