"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScrollReveal, ScrollRevealItem } from "@/components/ui/ScrollReveal";

export function PricingSection() {
  const tiers = [
    {
      name: "Campus Starter",
      price: "Free",
      description: "For individual academic departments or colleges",
      features: [
        "Up to 2,000 active students",
        "CSV & Excel spreadsheet ingestion",
        "XGBoost risk scoring & SHAP factors",
        "Email notifications & mentor log",
        "Standard PDF/CSV exports",
      ],
      cta: "Deploy Now",
      popular: false,
    },
    {
      name: "Institutional Pro",
      price: "Custom",
      description: "Multi-campus monitoring across university networks",
      features: [
        "Up to 15,000 active students",
        "Multi-campus switcher & central search",
        "Automated Celery Beat scheduled digests",
        "SMS & WhatsApp guardian alerts",
        "RAG-enabled AI Counseling Chatbot",
        "Custom risk weight configuration",
      ],
      cta: "Contact Network Admin",
      popular: true,
    },
    {
      name: "Global Enterprise",
      price: "Enterprise",
      description: "Global multi-campus deployment with dedicated VPC cluster",
      features: [
        "Unlimited students & campuses",
        "Custom ML model retraining pipeline",
        "Dedicated MinIO storage instance",
        "Role-based access (Admin, Counsellor, Mentor)",
        "24/7 SLA & priority support",
        "SIS / LMS Integration API (Canvas, Blackboard)",
      ],
      cta: "Schedule Procurement Review",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-slate-50/50 dark:bg-slate-900/50 border-t border-b border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal yOffset={25} className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Transparent Deployment Tiers
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            Designed for universities and higher education institutions globally with flexible deployment models.
          </p>
        </ScrollReveal>

        <ScrollReveal 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
          staggerChildren={0.12}
          yOffset={35}
        >
          {tiers.map((tier) => (
            <ScrollRevealItem key={tier.name} className="flex">
              <Card
                overflowHidden={false}
                hoverSpotlight={true}
                className={`flex flex-col justify-between pt-12 pb-8 px-8 relative w-full transition-all duration-300 ${
                  tier.popular
                    ? "border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-500 hover:ring-2 hover:ring-blue-600/20 dark:hover:ring-blue-500/20 hover:shadow-xl"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-[11px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                    Most Popular
                  </span>
                )}

                <div className="pt-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{tier.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tier.description}</p>
                  <div className="mt-6 mb-6">
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{tier.price}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link href="/demo" className="w-full">
                  <Button
                    variant="outline"
                    className={
                      tier.popular
                        ? "w-full transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 dark:group-hover:bg-blue-500 dark:group-hover:text-white dark:group-hover:border-blue-500"
                        : "w-full"
                    }
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </Card>
            </ScrollRevealItem>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
