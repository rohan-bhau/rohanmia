'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import AnimatedLogo from '@/components/shared/AnimatedLogo';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

export default function Preloader() {
  const pathname = usePathname();
  const { currentTheme } = useThemeAccent();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const isAdmin = window.location.pathname.startsWith('/control-room-internal');
        const storageKey = isAdmin ? 'bhau_admin_preloader_seen' : 'bhau_public_preloader_seen';
        if (sessionStorage.getItem(storageKey)) {
          return false;
        }
      } catch {}
    }
    return true;
  });

  useEffect(() => {
    setIsMounted(true);
    if (typeof window === 'undefined') return;

    const isAdmin = pathname?.startsWith('/control-room-internal');
    const storageKey = isAdmin ? 'bhau_admin_preloader_seen' : 'bhau_public_preloader_seen';

    try {
      if (sessionStorage.getItem(storageKey)) {
        setLoading(false);
        window.dispatchEvent(new CustomEvent('bhau-preloader-done'));
        return;
      }
      sessionStorage.setItem(storageKey, 'true');
    } catch {}

    setLoading(true);
    document.body.style.overflow = 'hidden';

    // 2.3s total time: Logo draws + 'Bhau' draws, then smoothly transitions
    const timer = setTimeout(() => {
      setLoading(false);
      document.body.style.overflow = 'unset';
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('bhau-preloader-done'));
      }
    }, 2300);

    return () => {
      document.body.style.overflow = 'unset';
      clearTimeout(timer);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="bhau-site-preloader"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, delay: 0.15, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[9999999] bg-[#040507] flex items-center justify-center overflow-hidden select-none pointer-events-auto"
        >
          {/* Dynamic Theme Glow Aura */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.35, 0.65, 0.35],
            }}
            transition={{ 
              scale: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
              opacity: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
            }}
            style={{ 
              backgroundColor: currentTheme.primary,
              filter: 'blur(120px)'
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] md:w-[500px] md:h-[500px] rounded-full pointer-events-none opacity-30"
          />

          {/* Central Portal Sphere with Expanding Exit Transition */}
          <div className="relative flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ 
                scale: 18,
                opacity: 0,
                transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] }
              }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-[#08090d]/95 backdrop-blur-2xl border border-white/10 flex flex-col items-center justify-center p-6"
              style={{
                boxShadow: `inset 0 0 45px ${currentTheme.primary}12, 0 0 60px ${currentTheme.primary}18, 0 25px 70px rgba(0,0,0,0.95)`
              }}
            >
              {/* Subtle Ambient Spinning Outer Ring */}
              <div 
                className="absolute inset-3 sm:inset-4 rounded-full border border-white/[0.05] animate-[spin_16s_linear_infinite]"
                style={{ borderTopColor: `${currentTheme.primary}45` }}
              />

              {/* Animated Monogram Logo (matching navbar) */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
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
                    <linearGradient id="preloader-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor={currentTheme.primary} />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                    <linearGradient id="preloader-text-chrome" x1="0%" y1="0%" x2="0%" y2="100%">
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
                    initial={{ strokeDasharray: 320, strokeDashoffset: 320, fillOpacity: 0 }}
                    animate={{ 
                      strokeDashoffset: 0, 
                      fillOpacity: [0, 0, 0.4, 1] 
                    }}
                    transition={{ 
                      strokeDashoffset: { duration: 1.4, delay: 0.25, ease: 'easeInOut' },
                      fillOpacity: { duration: 0.75, delay: 0.95, ease: 'easeOut' }
                    }}
                    stroke="url(#preloader-accent-grad)"
                    strokeWidth="1.6"
                    fill="url(#preloader-text-chrome)"
                    className="font-serif italic text-[50px] sm:text-[56px] tracking-tight"
                    style={{
                      fontFamily: 'var(--font-instrument-serif), var(--font-newsreader), Georgia, serif',
                      filter: `drop-shadow(0 0 16px ${currentTheme.primary}75)`
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
                    transition={{ duration: 1.0, delay: 1.1, ease: 'easeInOut' }}
                  />
                </svg>
              </div>
            </motion.div>
          </div>

          {/* Background Ambient Particles */}
          <div className="absolute inset-0 pointer-events-none opacity-25">
            {isMounted && [...Array(14)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 800 }}
                animate={{ 
                  y: [800, -200],
                  opacity: [0, 0.6, 0]
                }}
                transition={{ 
                  duration: (i % 5) + 6, 
                  repeat: Infinity, 
                  ease: 'linear',
                  delay: (i * 0.4) % 3
                }}
                className="absolute w-[1.5px] h-[1.5px] rounded-full"
                style={{ 
                  left: `${((i * 19) % 94) + 3}%`,
                  backgroundColor: currentTheme.primary,
                  boxShadow: `0 0 6px ${currentTheme.primary}`
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
