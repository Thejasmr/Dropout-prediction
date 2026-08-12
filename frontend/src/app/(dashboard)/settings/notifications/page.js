"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Bell, Save } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function NotificationSchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Settings Hub
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Notification & Celery Beat Schedule</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure automated email, SMS, and WhatsApp alert dispatch crons
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Weekly Mentor Risk Digest</h4>
            <p className="text-xs text-slate-500">Cron: 0 8 * * 1 (Every Monday at 8 AM UTC)</p>
          </div>
          <Badge variant="info">ACTIVE</Badge>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Nightly Batch Student Rescoring</h4>
            <p className="text-xs text-slate-500">Cron: 0 1 * * * (Every night at 1 AM UTC)</p>
          </div>
          <Badge variant="info">ACTIVE</Badge>
        </div>
      </Card>
    </div>
  );
}
