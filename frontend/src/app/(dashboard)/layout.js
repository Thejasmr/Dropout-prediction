"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { AnimatedLayout } from "@/components/layout/AnimatedLayout";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { AmbientBackground } from "@/components/ui/AmbientBackground";

export default function DashboardLayout({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <AmbientBackground>
      <div className="min-h-screen flex text-slate-900 dark:text-slate-100 transition-colors">
        <Sidebar />
        <MobileDrawer isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          <AppNavbar onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <AnimatedLayout>{children}</AnimatedLayout>
          </main>
        </div>

        <ChatbotWidget />
      </div>
    </AmbientBackground>
  );
}
