"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const Button = React.forwardRef(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none select-none group";
    
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg hover:shadow-blue-500/20 shadow-blue-500/10 dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-blue-900/40 dark:hover:shadow-blue-500/20 focus:ring-blue-500 focus:ring-offset-2",
      secondary: "bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200",
      outline: "border border-slate-300/80 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-slate-500",
      danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-md hover:shadow-lg hover:shadow-red-500/20 shadow-red-500/10",
      ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-slate-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2.5",
    };

    // Subtly shift any icons inside the button to the right on hover
    const iconHoverStyle = "custom-btn-icon-hover [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:translate-x-0.5";

    return (
      <motion.button
        ref={ref}
        disabled={disabled}
        whileHover={disabled ? {} : { 
          y: -1.5,
          transition: { type: "spring", stiffness: 400, damping: 15 }
        }}
        whileTap={disabled ? {} : { 
          scale: 0.97,
          y: 0,
          transition: { type: "spring", stiffness: 500, damping: 20 }
        }}
        className={cn(baseStyles, variants[variant], sizes[size], iconHoverStyle, className)}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
