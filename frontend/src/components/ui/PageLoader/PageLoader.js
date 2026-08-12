"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * PageLoader — shown by Next.js loading.js during page transitions.
 * Branded spinner with glowing orb, animated progress bar, and
 * staggered skeleton rows so the layout doesn't shift on load.
 */
export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-8 select-none px-4">

      {/* ── Glowing orb spinner ── */}
      <div className="relative flex items-center justify-center">
        {/* Outer slow pulse ring */}
        <motion.div
          className="absolute w-24 h-24 rounded-full border border-blue-500/20"
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Mid spinning dashed ring */}
        <motion.div
          className="absolute w-16 h-16 rounded-full border-2 border-dashed border-indigo-400/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner fast arc — the main spinner */}
        <motion.svg
          className="absolute w-14 h-14"
          viewBox="0 0 56 56"
          fill="none"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <circle
            cx="28" cy="28" r="24"
            stroke="url(#spinGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="40 112"
          />
          <defs>
            <linearGradient id="spinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="1" />
            </linearGradient>
          </defs>
        </motion.svg>
        {/* Core glow dot */}
        <motion.div
          className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]"
          animate={{ scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ── Animated progress bar ── */}
      <div className="w-48 h-0.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ── Label ── */}
      <motion.p
        className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-widest uppercase"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {label}
      </motion.p>

      {/* ── Skeleton content preview (reduces layout shift) ── */}
      <div className="w-full max-w-3xl space-y-4 mt-2 opacity-40 pointer-events-none">
        {/* Fake page header */}
        <div className="h-6 w-1/4 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
        {/* Fake KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
        {/* Fake content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-40 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-40 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"
            style={{ animationDelay: "120ms" }} />
        </div>
      </div>

    </div>
  );
}
