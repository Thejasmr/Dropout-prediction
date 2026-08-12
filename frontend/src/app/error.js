"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Next.js Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="p-4 bg-red-100 dark:bg-red-950 text-red-600 rounded-full">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        Something went wrong loading this component
      </h2>
      <p className="text-xs text-slate-500 max-w-sm">
        {error?.message || "An unexpected error occurred while fetching student retention analytics."}
      </p>
      <Button onClick={() => reset()} className="gap-2">
        <RefreshCw className="w-4 h-4" /> Try Again
      </Button>
    </div>
  );
}
