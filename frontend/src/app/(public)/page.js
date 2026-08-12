import React from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { ROICalculator } from "@/components/landing/ROICalculator";
import { PricingSection } from "@/components/landing/PricingSection";

export const metadata = {
  title: "EduPulse AI - Global Student Success & Retention Platform",
  description: "AI-driven early warning student dropout prediction and counseling system for higher education institutions globally.",
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeatureSection />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ROICalculator />
      </div>
      <PricingSection />
    </>
  );
}
