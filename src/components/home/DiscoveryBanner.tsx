'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

export default function DiscoveryBanner() {
  const { currentTheme } = useThemeAccent();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleOpenReachOut = () => {
    window.dispatchEvent(
      new CustomEvent('open-command-palette', { detail: { view: 'reachout' } })
    );
  };

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        {/* Main Grand Slab Card */}
        <div
          ref={cardRef}
          className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-[#0e1017] via-[#090a0f] to-[#07080b] border border-white/[0.1] border-t-white/[0.18] p-6 sm:p-12 md:p-16 lg:p-20 overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-center"
        >
          {/* ============================================================== */}
          {/* ANIMATED CORNER COLOR GLOWS (Top-Right & Bottom-Left)          */}
          {/* ============================================================== */}
          
          {/* 1. Top-Right Corner Animated Glow */}
          <motion.div
            animate={{
              scale: [1, 1.3, 0.95, 1],
              opacity: [0.35, 0.7, 0.4, 0.35],
              x: [0, 25, -15, 0],
              y: [0, -20, 15, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-32 -right-32 w-[460px] h-[460px] rounded-full blur-[120px] pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${currentTheme.primary} 0%, rgba(56, 189, 248, 0.35) 45%, transparent 75%)`,
            }}
          />

          {/* 2. Bottom-Left Corner Animated Glow */}
          <motion.div
            animate={{
              scale: [1, 1.25, 0.9, 1],
              opacity: [0.3, 0.65, 0.35, 0.3],
              x: [0, -20, 20, 0],
              y: [0, 20, -15, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full blur-[120px] pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${currentTheme.primary} 0%, rgba(14, 165, 233, 0.35) 45%, transparent 75%)`,
            }}
          />

          {/* Stippled / Grain atmospheric subtle texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.16) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Content Wrapper */}
          <div className="relative z-10 space-y-8 sm:space-y-10 max-w-4xl mx-auto">
            
            {/* ============================================================ */}
            {/* HEADLINE & SINGLE ADAPTIVE DRAGGABLE BADGE                   */}
            {/* ============================================================ */}
            <div className="relative flex flex-col items-center justify-center text-center">

              {/* EXACTLY ONE DRAGGABLE BADGE IN THE ENTIRE COMPONENT */}
              <motion.div
                drag
                dragConstraints={cardRef}
                dragElastic={0.4}
                dragSnapToOrigin={true}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.96 }}
                className="
                  order-1 mb-6 sm:mb-8
                  lg:order-none lg:mb-0
                  lg:absolute lg:left-1/2 lg:top-1/2
                  lg:translate-x-[260px] xl:translate-x-[295px]
                  lg:translate-y-[8px] xl:translate-y-[12px]
                  z-30 cursor-grab active:cursor-grabbing select-none touch-none inline-flex items-center justify-center group/badge
                "
                title="Drag me around! Releasing will snap back to position."
              >
                {/* Outer colored ring matching Editorial's badge */}
                <div
                  className="relative rounded-full p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.65)] transition-all duration-300"
                  style={{
                    backgroundColor: currentTheme.primary,
                  }}
                >
                  {/* Inner black disc */}
                  <div className="relative size-18 sm:size-22 md:size-24 rounded-full bg-black p-2 text-white flex items-center justify-center overflow-hidden border border-white/10">
                    
                    {/* Rotating Circular Text SVG */}
                    <div className="absolute inset-0 size-full">
                      <svg
                        className="absolute inset-0 size-full animate-spin-slow pointer-events-none"
                        overflow="visible"
                        viewBox="0 0 100 100"
                      >
                        <path
                          d="M 0 50 L 0 50 A 1 1 0 0 1 100 50 L 100 50 L 100 50 A 1 1 0 0 1 0 50 L 0 50"
                          fill="transparent"
                          id="cta-circle-text-path"
                        />
                        <text>
                          <textPath
                            dominantBaseline="hanging"
                            href="#cta-circle-text-path"
                            startOffset="0"
                            style={{
                              fontSize: '12.5px',
                              fontWeight: 700,
                              wordSpacing: '5px',
                              letterSpacing: '2.2px',
                              fill: 'currentColor',
                            }}
                          >
                            OPEN TO WORK · OPEN TO WORK ·
                          </textPath>
                        </text>
                      </svg>
                    </div>

                    {/* Editorial's Exact 4-Point Star Symbol */}
                    <svg
                      height="24"
                      viewBox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                      className="relative z-10 size-6 sm:size-8 md:size-9 rotate-45 fill-white text-white opacity-90 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] pointer-events-none"
                    >
                      <path d="M12 1C12 1 12 8 10 10C8 12 1 12 1 12C1 12 8 12 10 14C12 16 12 23 12 23C12 23 12 16 14 14C16 12 23 12 23 12C23 12 16 12 14 10C12 8 12 1 12 1Z" />
                    </svg>

                  </div>
                </div>
              </motion.div>

              {/* Exact Editorial Headline Typography */}
              <div className="order-2 font-sans font-light text-lg sm:text-3xl md:text-4xl lg:text-5xl tracking-wide text-white select-none">
                <h2 className="whitespace-nowrap uppercase">
                  FROM CONCEPT TO <span className="font-extrabold text-white">CREATION</span>
                </h2>
                <h2 className="mt-2 sm:mt-3 whitespace-nowrap uppercase">
                  LET&apos;S MAKE IT <span className="font-extrabold text-white">HAPPEN!</span>
                </h2>
              </div>

            </div>

            {/* ============================================================ */}
            {/* GET IN TOUCH BUTTON (Expanding color fill on hover)          */}
            {/* ============================================================ */}
            <div className="pt-2">
              <button
                onClick={handleOpenReachOut}
                className="relative group inline-flex items-center gap-3.5 pl-7 pr-2.5 py-2.5 rounded-full bg-[#15171e] border border-white/[0.15] text-sm font-semibold text-white overflow-hidden transition-all duration-500 shadow-2xl cursor-pointer hover:border-transparent hover:scale-105 active:scale-95"
                style={{
                  boxShadow: `0 0 30px rgba(0, 0, 0, 0.85)`,
                }}
              >
                {/* Expanding Fill Circle on hover */}
                <span
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-10 rounded-full transition-all duration-500 ease-out group-hover:scale-[22] pointer-events-none -z-0"
                  style={{ backgroundColor: currentTheme.primary }}
                />

                {/* Button Label */}
                <span className="relative z-10 font-semibold group-hover:text-black transition-colors duration-300">
                  Get In Touch
                </span>

                {/* Arrow Circle */}
                <div className="relative z-10 size-10 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 shrink-0 shadow-md">
                  <ArrowUpRight size={18} />
                </div>
              </button>
            </div>

            {/* ============================================================ */}
            {/* SUBTEXT (Exact Editorial Typography & Content)           */}
            {/* ============================================================ */}
            <div className="space-y-2 pt-2">
              <p className="font-serif font-semibold text-base sm:text-xl lg:text-2xl text-white tracking-tight">
                I&apos;m available for full-time roles &amp; freelance projects.
              </p>
              <p className="font-sans font-light text-xs sm:text-sm lg:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
                I thrive on crafting dynamic web applications, and delivering seamless user experiences.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
