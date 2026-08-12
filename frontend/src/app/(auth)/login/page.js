"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { AnimatedLayout } from "@/components/layout/AnimatedLayout";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in both email and password.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/proxy/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Authentication failed. Incorrect email or password.");
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      
      let role = "viewer";
      try {
        const tokenPayload = data.access_token.split(".")[1];
        if (tokenPayload) {
          const decoded = JSON.parse(atob(tokenPayload));
          if (decoded && decoded.role) {
            role = decoded.role;
          }
        }
      } catch (e) {
        console.error("Failed to parse user role from token:", e);
      }
      
      localStorage.setItem("user_role", role);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Failed to connect to backend server.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AmbientBackground>
      <AnimatedLayout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <motion.div
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <Card className="p-8 shadow-2xl border-slate-200 dark:border-slate-800">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-blue-600 text-white shadow-lg mb-3">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  EduPulse AI Portal
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Student Retention & Early-Warning Platform
                </p>
              </div>

              {/* No demo presets — enter your institutional credentials */}
              <div className="mb-6">
                <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                  Sign in with your institutional email and password.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 text-red-600 text-xs font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  id="login_email"
                  label="Official Institutional Email"
                  type="email"
                  placeholder="your.email@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div className="relative">
                  <Input
                    id="login_password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 bottom-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <Button type="submit" disabled={loading} className="w-full mt-2 gap-2 shadow-md">
                  {loading ? "Authenticating..." : "Sign In"} <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link href="/" className="text-xs text-blue-600 hover:underline">
                  ← Back to Pre-Login SaaS Landing Page
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </AnimatedLayout>
    </AmbientBackground>
  );
}
