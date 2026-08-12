"use client";

import React, { useEffect, useState } from "react";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";

export function AmbientBackground({ children }) {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const springConfig = { damping: 45, stiffness: 180, mass: 0.6 };
  const spotlightX = useSpring(mouseX, springConfig);
  const spotlightY = useSpring(mouseY, springConfig);

  const [particles, setParticles] = useState([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Detect prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const listener = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);

    // Generate floating particles with slightly higher visibility and size
    const generated = Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 2, // 2px to 5px
      x: Math.random() * 100, // %
      y: Math.random() * 100, // %
      duration: Math.random() * 15 + 20, // 20s to 35s
      delay: Math.random() * -30, // Negative delay to prevent simultaneous fade-in
      opacity: Math.random() * 0.20 + 0.12, // 12% to 32% opacity
    }));
    setParticles(generated);

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      mediaQuery.removeEventListener("change", listener);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]);

  // Transform spring coordinates to spotlight radial gradient string
  const spotlightBgLight = useTransform(
    [spotlightX, spotlightY],
    ([x, y]) => `
      radial-gradient(650px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.12), transparent 85%),
      radial-gradient(850px circle at ${x}px ${y}px, rgba(99, 102, 241, 0.07), transparent 85%)
    `
  );

  const spotlightBgDark = useTransform(
    [spotlightX, spotlightY],
    ([x, y]) => `
      radial-gradient(650px circle at ${x}px ${y}px, rgba(99, 102, 241, 0.18), transparent 85%),
      radial-gradient(850px circle at ${x}px ${y}px, rgba(59, 130, 246, 0.12), transparent 85%)
    `
  );

  // Injected CSS for drift animations
  const styleString = `
    @keyframes drift-orb-1 {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(10vw, 8vh) scale(1.15); }
      66% { transform: translate(-8vw, 12vh) scale(0.88); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    @keyframes drift-orb-2 {
      0% { transform: translate(0px, 0px) scale(1); }
      50% { transform: translate(-10vw, -12vh) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    @keyframes drift-orb-3 {
      0% { transform: translate(0px, 0px) scale(0.88); }
      40% { transform: translate(8vw, -8vh) scale(1.08); }
      80% { transform: translate(-6vw, 6vh) scale(0.96); }
      100% { transform: translate(0px, 0px) scale(0.88); }
    }
    @keyframes float-particle {
      0% { transform: translate(0px, 0px); }
      33% { transform: translate(30px, -50px); }
      66% { transform: translate(-20px, -100px); }
      100% { transform: translate(0px, 0px); }
    }
    .grid-overlay {
      background-image: 
        linear-gradient(to right, rgba(99, 102, 241, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(99, 102, 241, 0.04) 1px, transparent 1px);
      background-size: 36px 36px;
      animation: shimmer-grid 25s ease-in-out infinite alternate;
    }
    @keyframes shimmer-grid {
      0% { opacity: 0.6; }
      100% { opacity: 1.0; }
    }
  `;

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: styleString }} />

      {/* Dynamic Cursor Spotlight Layer */}
      {!reducedMotion && (
        <>
          <motion.div
            className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 dark:hidden"
            style={{ background: spotlightBgLight }}
          />
          <motion.div
            className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300 hidden dark:block"
            style={{ background: spotlightBgDark }}
          />
        </>
      )}

      {/* Large Drifting Ambient Light Orbs */}
      <div 
        className="pointer-events-none fixed top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-indigo-400/20 to-blue-500/20 dark:from-indigo-600/15 dark:to-blue-600/10 blur-[130px] z-0" 
        style={{
          animation: reducedMotion ? "none" : "drift-orb-1 30s ease-in-out infinite",
        }}
      />
      <div 
        className="pointer-events-none fixed bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-purple-400/20 to-sky-400/20 dark:from-purple-900/15 dark:to-sky-600/10 blur-[130px] z-0" 
        style={{
          animation: reducedMotion ? "none" : "drift-orb-2 36s ease-in-out infinite",
        }}
      />
      <div 
        className="pointer-events-none fixed top-[40%] right-[30%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-tr from-pink-400/10 to-purple-500/10 dark:from-pink-900/10 dark:to-purple-800/10 blur-[150px] z-0" 
        style={{
          animation: reducedMotion ? "none" : "drift-orb-3 40s ease-in-out infinite",
        }}
      />

      {/* Extremely Subtle Grid Overlay (< 3% opacity) */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-100 grid-overlay" />

      {/* Floating Particles */}
      {!reducedMotion &&
        particles.map((p) => (
          <div
            key={p.id}
            className="pointer-events-none fixed rounded-full bg-blue-500 dark:bg-indigo-300 z-0"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: p.opacity,
              animation: `float-particle ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">{children}</div>
    </div>
  );
}
