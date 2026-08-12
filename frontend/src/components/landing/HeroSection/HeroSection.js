"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, FileSpreadsheet, Bell, ShieldAlert, GraduationCap, Calendar, Award, FileText, Cpu, MessageSquare, BookOpen, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Magnetic } from "@/components/ui/Magnetic";

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 0.8,
      },
    },
  };

  const textShimmerStyle = `
    @keyframes shimmer-text {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .shimmer-text-glow {
      background-size: 200% auto;
      animation: shimmer-text 9s linear infinite;
    }
    @keyframes pulse-glow {
      0% { transform: scale(0.96); opacity: 0.85; filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.4)); }
      50% { transform: scale(1.04); opacity: 1; filter: drop-shadow(0 0 25px rgba(59, 130, 246, 0.7)); }
      100% { transform: scale(0.96); opacity: 0.85; filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.4)); }
    }
    .pulse-ai-core {
      animation: pulse-glow 3s ease-in-out infinite;
    }
    @keyframes flow-dash {
      to { stroke-dashoffset: -12; }
    }
    .flow-line {
      stroke-dasharray: 6, 6;
      animation: flow-dash 1.5s linear infinite;
    }
    .flow-line-reverse {
      stroke-dasharray: 6, 6;
      animation: flow-dash 1.5s linear infinite reverse;
    }
    @keyframes node-pulse-slow {
      0% { border-color: rgba(226, 232, 240, 0.8); }
      50% { border-color: rgba(59, 130, 246, 0.3); }
      100% { border-color: rgba(226, 232, 240, 0.8); }
    }
    .dark .node-pulse-slow {
      animation: node-pulse-slow 4s ease-in-out infinite;
    }
    @keyframes orbit-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .orbit-container {
      animation: orbit-spin 25s linear infinite;
    }
    @keyframes orbit-counter-spin {
      from { transform: translate(var(--tx, -50%), var(--ty, -50%)) rotate(0deg); }
      to { transform: translate(var(--tx, -50%), var(--ty, -50%)) rotate(-360deg); }
    }
    .orbit-item {
      animation: orbit-counter-spin 25s linear infinite;
    }
  `;

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
      <style dangerouslySetInnerHTML={{ __html: textShimmerStyle }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Headline, Subtitle, CTAs & Value Props */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Pill Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 backdrop-blur-md mb-6 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>✨ Next-Gen Student Retention Engine · EduPulse AI</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.1] max-w-2xl"
              style={{ letterSpacing: "-0.03em" }}
            >
              Predict & Prevent Student Dropouts with{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent shimmer-text-glow">
                Explainable AI
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed"
            >
              EduPulse AI fuses attendance, academic test scores, and financial indicators into actionable early warnings for university advisors, faculty, and counsellors.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Magnetic range={50} strength={0.22}>
                <Link href="/demo" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20">
                    Request Live Demo <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </Magnetic>

              <Magnetic range={50} strength={0.22}>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Explore Dashboard
                  </Button>
                </Link>
              </Magnetic>
            </motion.div>

            {/* Value Proposition Grid */}
            <motion.div 
              variants={itemVariants}
              className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-2xl text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm shadow-sm hover:border-slate-300/80 dark:hover:border-slate-700/80 transition-colors">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>SHAP TreeExplainer AI</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm shadow-sm hover:border-slate-300/80 dark:hover:border-slate-700/80 transition-colors">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Spreadsheet Ingestion</span>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/40 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm shadow-sm hover:border-slate-300/80 dark:hover:border-slate-700/80 transition-colors">
                <Bell className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Real-time Email & SMS</span>
              </div>
            </motion.div>
          </motion.div>
          {/* Right Column - Early Warning Signal Flow Visual */}
          <div className="lg:col-span-5 relative mt-12 lg:mt-0 flex items-center justify-center">

            {/* Background Glow Orb */}
            <div className="bg-gradient-to-br from-blue-500/15 to-purple-500/15 dark:from-blue-500/10 dark:to-purple-500/5 filter blur-3xl rounded-full absolute -inset-6 -z-10 animate-pulse duration-[8000ms]" />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.15 }}
              className="w-full max-w-[420px] flex flex-col items-center gap-5 select-none py-6"
            >
              {/* Top Pill */}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/5 dark:bg-blue-400/5 text-[9px] font-bold text-blue-600 dark:text-blue-400 shadow-sm backdrop-blur-md whitespace-nowrap">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
                </span>
                <span className="uppercase tracking-widest">Early Warning Signal Processing</span>
              </div>
                
              {/* 3-Column Node Grid */}
              <div className="relative w-full flex items-center justify-between gap-2 px-1">

                {/* Left: Input Signals */}
                <div className="flex flex-col gap-2.5 w-[118px]">
                  <motion.div whileHover={{ scale: 1.03 }} className="px-2.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-md flex items-center gap-2 transition-all duration-300 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5">
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-500 shrink-0"><Calendar className="w-3.5 h-3.5" /></div>
                    <div><p className="text-[10px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Attendance</p><p className="text-[9px] font-semibold text-amber-500 leading-tight">72% Caution</p></div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} className="px-2.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-md flex items-center gap-2 transition-all duration-300 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 shrink-0"><Award className="w-3.5 h-3.5" /></div>
                    <div><p className="text-[10px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Academics</p><p className="text-[9px] font-semibold text-red-500 leading-tight">Trend: -23%</p></div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} className="px-2.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-md flex items-center gap-2 transition-all duration-300 hover:border-purple-500/50 dark:hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/5">
                    <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-500 shrink-0"><FileText className="w-3.5 h-3.5" /></div>
                    <div><p className="text-[10px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Financials</p><p className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight">Overdue: 42d</p></div>
                  </motion.div>
                </div>

                {/* Center: AI Core */}
                <div className="relative flex flex-col items-center flex-shrink-0 w-[72px] h-[72px]">
                  <div className="relative w-[72px] h-[72px] flex items-center justify-center">
                    <div className="pulse-ai-core w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white shadow-2xl flex items-center justify-center z-10 relative">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div className="absolute inset-[-10px] border border-dashed border-blue-400/40 rounded-full animate-spin" style={{ animationDuration: "12s" }} />
                    <div className="absolute inset-[-18px] border border-dotted border-indigo-400/20 rounded-full animate-spin" style={{ animationDuration: "22s", animationDirection: "reverse" }} />
                    <div className="absolute inset-[-26px] rounded-full pointer-events-none orbit-container">
                      {[
                        { icon: <GraduationCap className="w-3 h-3" />, cls: "top-0 left-1/2", x: "-50%", y: "-50%", c: "text-blue-500" },
                        { icon: <BookOpen className="w-3 h-3" />, cls: "bottom-0 left-1/2", x: "-50%", y: "50%", c: "text-indigo-500" },
                        { icon: <Lightbulb className="w-3 h-3" />, cls: "left-0 top-1/2", x: "-50%", y: "-50%", c: "text-amber-500" },
                        { icon: <Award className="w-3 h-3" />, cls: "right-0 top-1/2", x: "50%", y: "-50%", c: "text-emerald-500" },
                      ].map(({ icon, cls, x, y, c }, i) => (
                        <div
                          key={i}
                          className={`absolute ${cls} p-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 shadow-sm ${c} orbit-item`}
                          style={{ "--tx": x, "--ty": y }}
                        >
                          {icon}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* SHAP Engine label — absolutely positioned below the orb to maintain vertical center alignment of the CPU */}
                  <div className="absolute top-full mt-9 left-1/2 -translate-x-1/2 inline-flex items-center px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 shadow-sm backdrop-blur-sm z-20">
                    <span className="text-[9px] font-bold text-slate-700 dark:text-slate-200 tracking-wide whitespace-nowrap">SHAP Engine</span>
                  </div>
                </div>

                {/* Right: Output Signals */}
                <div className="flex flex-col gap-2.5 w-[118px]">
                  <motion.div whileHover={{ scale: 1.03 }} className="px-2.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-md flex items-center gap-2 transition-all duration-300 hover:border-red-500/50 dark:hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/5">
                    <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-500 shrink-0"><ShieldAlert className="w-3.5 h-3.5" /></div>
                    <div><p className="text-[10px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Risk Alerts</p><p className="text-[9px] font-semibold text-red-500 leading-tight">High Risk: 84%</p></div>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} className="px-2.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-md flex items-center gap-2 transition-all duration-300 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 shrink-0"><MessageSquare className="w-3.5 h-3.5" /></div>
                    <div><p className="text-[10px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Mentorship</p><p className="text-[9px] font-semibold text-emerald-500 leading-tight">Email Sent</p></div>
                  </motion.div>
                </div>

                {/* SVG Connection Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" fill="none">
                  <defs>
                    <linearGradient id="lg-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                      <stop offset="60%" stopColor="#60a5fa" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lg-purple" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
                      <stop offset="40%" stopColor="#c084fc" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M 118,28  C 148,28  152,75 172,75"  stroke="url(#lg-blue)"   strokeWidth="1.5" strokeDasharray="5,4" className="flow-line" strokeLinecap="round" />
                  <path d="M 118,75  L 172,75"                  stroke="url(#lg-blue)"   strokeWidth="1.5" strokeDasharray="5,4" className="flow-line" strokeLinecap="round" />
                  <path d="M 118,122 C 148,122 152,75 172,75"  stroke="url(#lg-blue)"   strokeWidth="1.5" strokeDasharray="5,4" className="flow-line" strokeLinecap="round" />
                  <path d="M 248,75  C 268,75  272,44  298,44"  stroke="url(#lg-purple)" strokeWidth="1.5" strokeDasharray="5,4" className="flow-line" strokeLinecap="round" />
                  <path d="M 248,75  C 268,75  272,106 298,106" stroke="url(#lg-purple)" strokeWidth="1.5" strokeDasharray="5,4" className="flow-line" strokeLinecap="round" />
                </svg>
              </div>

              {/* Intervention Rate + Sparkline */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md shadow-sm">
                  <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">Intervention Rate:</span>
                  <span className="text-[9px] font-bold text-emerald-500">94.6%</span>
                </div>
                <svg className="w-28 h-5 opacity-70" viewBox="0 0 110 20" fill="none">
                  <motion.path d="M 0,10 Q 18,2 36,10 T 72,10 T 110,10" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 4" animate={{ strokeDashoffset: [-18, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
                </svg>
              </div>

            </motion.div>
          </div>

          {/* Partner Logos Strip */}
          <motion.div 
            variants={itemVariants}
            className="col-span-12 mt-12 lg:mt-16 pt-8 border-t border-slate-200/60 dark:border-slate-800"
          >
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 text-center mb-6 animate-pulse" style={{ animationDuration: "4s" }}>
              Empowering Higher Education Institutions Globally
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-80 hover:opacity-100 transition-all duration-300">
              <span className="font-bold text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-default">Global Technical Universities</span>
              <span className="font-bold text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-default">International Polytechnic Institutes</span>
              <span className="font-bold text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-default">State & National Education Systems</span>
              <span className="font-bold text-sm text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-default">Community & Higher Ed Colleges</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
