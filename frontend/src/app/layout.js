import React from "react";
import "@/app/globals.css";
import { AppProviders } from "@/providers/AppProviders";

export const metadata = {
  title: "EduPulse AI | Global Student Retention & Early-Warning System",
  description: "AI-driven early warning platform leveraging explainable SHAP machine learning models to prevent student dropouts in higher education globally.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
