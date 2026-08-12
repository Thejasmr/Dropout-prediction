"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap } from "lucide-react";

export function PageLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show loader on page change
    setLoading(true);
    
    // Smooth timeout to fade out after the page mounts
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450); // 450ms is perfect for a sleek micro-animation feel

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-md pointer-events-auto"
        >
          <div className="relative flex items-center justify-center">
            
            {/* Spinning Outer Orbit Ring */}
            <motion.div
              className="absolute w-20 h-20 rounded-full border border-dashed border-slate-700/60"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            {/* Dual Ring Loading Spinner */}
            <motion.div
              className="absolute w-14 h-14 rounded-full border-2 border-t-blue-500 border-r-indigo-500 border-b-transparent border-l-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            />

            {/* Glowing Center Core */}
            <motion.div
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20"
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <GraduationCap className="w-4.5 h-4.5" />
            </motion.div>

          </div>

          {/* Shimmering Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-center"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-slate-300 bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent animate-pulse leading-none">
              Loading EduPulse AI
            </p>
            <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
              Initializing Early Warning Systems...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
