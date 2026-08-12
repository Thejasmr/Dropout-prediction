import React from "react";
import { PublicNavbar } from "@/components/landing/PublicNavbar";
import { PublicFooter } from "@/components/landing/PublicFooter";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { AnimatedLayout } from "@/components/layout/AnimatedLayout";

export default function PublicLayout({ children }) {
  return (
    <AmbientBackground>
      <PublicNavbar />
      <main className="flex-1">
        <AnimatedLayout>{children}</AnimatedLayout>
      </main>
      <PublicFooter />
    </AmbientBackground>
  );
}
