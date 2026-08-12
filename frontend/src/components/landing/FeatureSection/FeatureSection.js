"use client";

import React from "react";
import { Cpu, FileSpreadsheet, Bell, MessageSquare, Users, ShieldCheck } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { motion } from "framer-motion";

const features = [
  {
    icon: Cpu,
    title: "Explainable AI Engine",
    description: "Utilizes advanced XGBoost classification models coupled with SHAP TreeExplainer to deliver crystal-clear, feature-by-feature risk attribution for every single student.",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  {
    icon: FileSpreadsheet,
    title: "Seamless Multi-Signal Ingestion",
    description: "Upload academic spreadsheets, attendance records, and financial indices directly into the dashboard. Instantly map database fields with smart schema matching.",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
  },
  {
    icon: Bell,
    title: "Real-Time Warning Broadcasts",
    description: "Dispatches automated emails, SMS alerts, and WhatsApp notifications to counselors, mentors, and guardians the second risk profiles breach safety thresholds.",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
  },
  {
    icon: MessageSquare,
    title: "RAG-Enabled Counseling Assistant",
    description: "An AI-powered co-pilot trained on institutional compliance protocols. Assists advisors in drafting optimized counseling action plans in seconds.",
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
  },
  {
    icon: Users,
    title: "Role-Based Institutional Workspaces",
    description: "Separate, fully featured workspace interfaces for system administrators, designated college counselors, and course-assigned academic mentors.",
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20"
  },
  {
    icon: ShieldCheck,
    title: "Audit & Accreditation Export",
    description: "Export high-fidelity PDF student counseling summary cards and institution-wide cohort performance spreadsheets ready for accreditation reviews.",
    color: "text-red-500 bg-red-500/10 border-red-500/20"
  }
];

export function FeatureSection() {
  React.useEffect(() => {
    const handleHashScroll = () => {
      if (window.location.hash === "#features") {
        const el = document.getElementById("features");
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }
      }
    };
    
    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);

  return (
    <section id="features" className="py-20 bg-slate-50/40 dark:bg-slate-900/10 border-t border-b border-slate-100 dark:border-slate-800/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <ScrollReveal yOffset={20} delay={0.05}>
            <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase bg-blue-500/10 px-3 py-1 rounded-full">
              Core Capabilities
            </span>
          </ScrollReveal>
          
          <ScrollReveal yOffset={25} delay={0.1}>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mt-4 tracking-tight">
              Supercharge Student Retention & Success
            </h2>
          </ScrollReveal>
          
          <ScrollReveal yOffset={30} delay={0.15}>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
              EduPulse AI fuses predictive machine learning alerts with collaborative workspace counseling utilities to prevent college dropouts.
            </p>
          </ScrollReveal>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <ScrollReveal key={feature.title} yOffset={30} delay={0.05 * index}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group relative p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/30 backdrop-blur-md shadow-sm hover:shadow-xl dark:hover:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col items-start text-left"
                >
                  {/* Subtle Background Accent Glow */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:to-blue-500/5 dark:group-hover:to-indigo-500/5 transition-all duration-500 -z-10 pointer-events-none" />

                  {/* Icon Wrapper */}
                  <div className={`p-3 rounded-xl border mb-5 ${feature.color} transition-all duration-300 group-hover:scale-110 shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
