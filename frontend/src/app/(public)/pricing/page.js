import React from "react";
import { PricingSection } from "@/components/landing/PricingSection";

export const metadata = {
  title: "Pricing Tiers - EduPulse AI Retention Platform",
  description: "Deployment tiers and features for higher education institutions globally.",
};

export default function PricingPage() {
  return (
    <div className="pt-8">
      <PricingSection />
    </div>
  );
}
