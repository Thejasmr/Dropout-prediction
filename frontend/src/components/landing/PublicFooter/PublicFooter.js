import React from "react";
import Link from "next/link";
import { GraduationCap, ShieldCheck, Activity, Facebook, Instagram, Linkedin, Heart } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-slate-100">
                EduPulse AI
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-4">
              EduPulse AI is a global student retention and success platform empowering higher education institutions worldwide.
            </p>
            <div className="flex items-center gap-3">
              <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-700 transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </Link>
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-750 transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </Link>
              <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-700 hover:text-white dark:hover:bg-blue-800 transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing & Tiers</Link></li>
              <li><Link href="/demo" className="hover:text-blue-600 transition-colors">Request Demo</Link></li>
              <li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">App Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
              System Health
            </h4>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All Global Systems Operational 🟢
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4 sm:gap-0">
          <div className="flex flex-col gap-1.5 text-center sm:text-left">
            <p>© {new Date().getFullYear()} EduPulse AI. Empowering educational institutions globally.</p>
            <p className="flex items-center justify-center sm:justify-start gap-1 text-[11px] text-slate-400/80">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> by EduPulse
            </p>
          </div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Security Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
