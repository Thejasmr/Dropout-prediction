import React from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 text-center">
      <div className="p-4 bg-blue-100 dark:bg-blue-950 rounded-2xl text-blue-600 mb-4">
        <GraduationCap className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">404 - Page Not Found</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
        The requested EduPulse AI portal page or student record could not be found.
      </p>
      <Link href="/dashboard" className="mt-6">
        <Button className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
