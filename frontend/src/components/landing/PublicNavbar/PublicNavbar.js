"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Moon, Sun, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function PublicNavbar() {
  const { isDark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activePath, setActivePath] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    const updateActive = () => {
      const hash = window.location.hash;
      if (hash) {
        setActivePath(hash);
      } else {
        setActivePath(pathname);
      }
    };

    handleScroll();
    updateActive();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("hashchange", updateActive);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", updateActive);
    };
  }, [pathname]);

  const navItems = [
    { label: "Features", href: "/#features", id: "#features" },
    { label: "Pricing", href: "/pricing", id: "/pricing" },
    { label: "ROI Calculator", href: "/#roi-calc", id: "#roi-calc" },
    { label: "Request Demo", href: "/demo", id: "/demo" },
  ];

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled 
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm shadow-slate-100/50 dark:shadow-none"
          : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-transparent"
      )}
    >
      <div 
        className={cn(
          "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300",
          scrolled ? "h-14" : "h-16"
        )}
      >
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md group-hover:scale-105 transition-transform duration-300">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-none block">
              EduPulse AI
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Student Retention Platform
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          {navItems.map((item) => {
            const isActive = activePath === item.id || activePath.endsWith(item.id);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setActivePath(item.id)}
                className={cn(
                  "relative py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                  isActive ? "text-blue-600 dark:text-blue-400 font-semibold" : ""
                )}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-400 rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative overflow-hidden h-8 w-8 flex items-center justify-center"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? "dark" : "light"}
                initial={{ y: -15, opacity: 0, rotate: -45 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 15, opacity: 0, rotate: 45 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex items-center justify-center shrink-0"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.div>
            </AnimatePresence>
          </button>

          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>

          <Link href="/demo">
            <Button size="sm" className="hidden sm:inline-flex gap-1.5">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
