"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

export function Card({ className, children, hoverSpotlight = true, overflowHidden = true, ...props }) {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Position of cursor inside the card (in pixels)
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // 3D rotation values
  const rotateXVal = useMotionValue(0);
  const rotateYVal = useMotionValue(0);

  // Spring configuration for silky smooth movement
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(rotateXVal, springConfig);
  const rotateY = useSpring(rotateYVal, springConfig);
  const glowX = useSpring(cursorX, springConfig);
  const glowY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const listener = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current || reducedMotion) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cursorX.set(x);
    cursorY.set(y);

    // Calculate rotation (max 2 degrees to keep it elegant and subtle)
    const rx = -((y - height / 2) / (height / 2)) * 2;
    const ry = ((x - width / 2) / (width / 2)) * 2;

    rotateXVal.set(rx);
    rotateYVal.set(ry);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateXVal.set(0);
    rotateYVal.set(0);
  };

  // Convert pixel positions into a clean CSS radial gradient string for the border glow spotlight
  const borderGlow = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(250px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.12), transparent 80%)`
  );

  // Light reflection/shimmer overlay
  const reflectionBg = useTransform(
    [glowX, glowY],
    ([x, y]) => {
      if (!cardRef.current) return "";
      const rect = cardRef.current.getBoundingClientRect();
      const px = (x / rect.width) * 100;
      const py = (y / rect.height) * 100;
      return `radial-gradient(200px circle at ${px}% ${py}%, rgba(255, 255, 255, 0.05), transparent 75%)`;
    }
  );

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: reducedMotion ? 0 : rotateX,
        rotateY: reducedMotion ? 0 : rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      whileHover={
        reducedMotion
          ? {}
          : {
              y: -3,
              boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.08)",
              transition: { duration: 0.3, ease: "easeOut" },
            }
      }
      className={cn(
        "relative group bg-white/75 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md rounded-2xl p-6 shadow-sm dark:shadow-xl transition-all duration-300",
        overflowHidden && "overflow-hidden",
        hoverSpotlight && "hover:border-blue-200/80 dark:hover:border-slate-700/80",
        className
      )}
      {...props}
    >
      {/* Moving Light Reflection Overlay */}
      {isHovered && !reducedMotion && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 mix-blend-overlay opacity-100 transition-opacity duration-300 rounded-2xl"
          style={{ background: reflectionBg }}
        />
      )}

      {/* Dynamic Border Glow Spotlight Effect */}
      {isHovered && !reducedMotion && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300 z-0"
          style={{ background: borderGlow }}
        />
      )}

      <div
        className={cn(
          "relative z-10",
          className?.includes("flex") && "flex-1 flex flex-col",
          className?.includes("justify-between") && "justify-between",
          className?.includes("justify-center") && "justify-center",
          className?.includes("items-center") && "items-center"
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn("mb-4 flex items-center justify-between", className)}>{children}</div>;
}

export function CardTitle({ className, children }) {
  return <h3 className={cn("text-base font-semibold text-slate-900 dark:text-slate-100", className)}>{children}</h3>;
}

export function CardDescription({ className, children }) {
  return <p className={cn("text-xs text-slate-500 dark:text-slate-400 mt-1", className)}>{children}</p>;
}

export function CardContent({ className, children }) {
  return <div className={cn("", className)}>{children}</div>;
}
