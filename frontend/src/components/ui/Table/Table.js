"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Table({ className, children, ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm">
      <table className={cn("w-full text-left text-sm text-slate-600 dark:text-slate-300", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children }) {
  return (
    <thead className={cn("bg-slate-50/80 dark:bg-slate-800/80 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800", className)}>
      {children}
    </thead>
  );
}

export function TableBody({ className, children, ...props }) {
  return (
    <motion.tbody className={cn("divide-y divide-slate-200 dark:divide-slate-800 bg-white/70 dark:bg-slate-900/50", className)} {...props}>
      {children}
    </motion.tbody>
  );
}

export function TableRow({ className, children, ...props }) {
  return (
    <motion.tr 
      className={cn("hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors duration-200", className)} 
      {...props}
    >
      {children}
    </motion.tr>
  );
}

export function TableHead({ className, children }) {
  return <th className={cn("px-4 py-3 font-semibold", className)}>{children}</th>;
}

export function TableCell({ className, children }) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}
