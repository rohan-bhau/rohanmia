"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedLogo from "@/components/shared/AnimatedLogo";
import { useThemeAccent } from "@/components/theme/ThemeProvider";

export default function Preloader() {
  const { currentTheme } = useThemeAccent();
  const [loading, setLoading] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const fadeTimer = window.setTimeout(() => {
      setFadingOut(true);
      document.body.style.overflow = "unset";
      window.dispatchEvent(new CustomEvent("bhau-preloader-done"));
    }, 1650);

    const removeTimer = window.setTimeout(() => {
      setLoading(false);
      document.body.style.overflow = "unset";
    }, 2000);

    return () => {
      document.body.style.overflow = "unset";
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!loading) return null;

  return (
    <motion.div
      key="bhau-site-preloader"
      data-preloader="true"
      initial={{ opacity: 1 }}
      animate={{ opacity: fadingOut ? 0 : 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-0 z-[9999999] bg-[#040507] flex items-center justify-center overflow-hidden select-none ${
        fadingOut ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      {/* Dynamic Theme Glow Aura */}
      <div
        style={{
          backgroundColor: currentTheme.primary,
          filter: "blur(90px)",
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[440px] md:h-[440px] rounded-full pointer-events-none opacity-30"
      />

      {/* Central Portal Sphere */}
      <div className="relative flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{
            scale: fadingOut ? 1.06 : 1,
            opacity: fadingOut ? 0 : 1,
          }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-64 h-64 sm:w-76 sm:h-76 md:w-88 md:h-88 rounded-full bg-[#08090d]/95 border border-white/10 flex flex-col items-center justify-center p-6"
          style={{
            boxShadow: `inset 0 0 40px ${currentTheme.primary}14, 0 0 50px ${currentTheme.primary}18, 0 25px 60px rgba(0,0,0,0.95)`,
          }}
        >
          {/* Subtle Ambient Spinning Outer Ring */}
          <div
            className="absolute inset-3 sm:inset-4 rounded-full border border-white/[0.06] animate-[spin_12s_linear_infinite]"
            style={{ borderTopColor: `${currentTheme.primary}55` }}
          />

          {/* Animated Monogram Logo (matching navbar) */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative z-10 mb-2 flex items-center justify-center"
          >
            <AnimatedLogo size={54} animated={true} glow={true} />
          </motion.div>

          {/* Animated Handwritten / Stroke Drawing of "Bhau" */}
          <div className="relative z-10 w-full flex flex-col items-center justify-center">
            <svg
              viewBox="0 0 260 75"
              className="w-44 sm:w-52 md:w-60 h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient
                  id="preloader-accent-grad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor={currentTheme.primary} />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
                <linearGradient
                  id="preloader-text-chrome"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor={currentTheme.primary} />
                </linearGradient>
              </defs>

              {/* Animated Stroke Drawing of 'Bhau' */}
              <motion.text
                x="130"
                y="46"
                textAnchor="middle"
                initial={{
                  strokeDasharray: 320,
                  strokeDashoffset: 320,
                  fillOpacity: 0,
                }}
                animate={{
                  strokeDashoffset: 0,
                  fillOpacity: 1,
                }}
                transition={{
                  strokeDashoffset: {
                    duration: 0.9,
                    delay: 0.05,
                    ease: "easeInOut",
                  },
                  fillOpacity: {
                    duration: 0.5,
                    delay: 0.5,
                    ease: "easeOut",
                  },
                }}
                stroke="url(#preloader-accent-grad)"
                strokeWidth="1.6"
                fill="url(#preloader-text-chrome)"
                className="font-serif italic text-[50px] sm:text-[56px] tracking-tight"
                style={{
                  fontFamily:
                    "var(--font-instrument-serif), var(--font-newsreader), Georgia, serif",
                  filter: `drop-shadow(0 0 16px ${currentTheme.primary}75)`,
                }}
              >
                Bhau
              </motion.text>

              {/* Signature Underline Flourish Drawing */}
              <motion.path
                d="M 52 58 Q 130 72, 208 58 Q 135 76, 72 70"
                stroke="url(#preloader-accent-grad)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 1, 1] }}
                transition={{
                  duration: 0.65,
                  delay: 0.55,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
