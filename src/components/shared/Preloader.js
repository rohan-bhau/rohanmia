'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Lock scroll while loading
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => {
      setLoading(false);
      document.body.style.overflow = 'unset';
    }, 4500);

    return () => {
      document.body.style.overflow = 'unset';
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, delay: 0.5 }
          }}
          className="fixed inset-0 z-[9999999] bg-[#000000] flex items-center justify-center overflow-hidden"
        >
          {/* Cyan Aura / Portal Glow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{ 
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              initial: { duration: 1.5 }
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-[#00FFFF]/20 blur-[100px] rounded-full"
          />

          <div className="relative flex items-center justify-center">
            {/* The Expanding Sphere (Transition Trigger) */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ 
                scale: 15,
                opacity: 0,
                transition: { duration: 1, ease: [0.76, 0, 0.24, 1] }
              }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-48 h-48 md:w-72 md:h-72 rounded-full bg-[#050505] shadow-[inset_0_0_50px_rgba(0,255,255,0.1),0_0_100px_rgba(0,255,255,0.05)] border border-white/5 flex items-center justify-center"
            >
              {/* Subtle Inner Ring */}
              <div className="absolute inset-4 rounded-full border border-white/5" />
              
              {/* Text Reveal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
                className="relative z-10"
              >
                <h1 
                  className="text-5xl md:text-7xl font-serif italic text-white select-none tracking-tight"
                  style={{ 
                    textShadow: '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.2)',
                    fontFamily: 'serif' 
                  }}
                >
                  Bhau
                </h1>
              </motion.div>
            </motion.div>
          </div>

          {/* Background Ambient Particles - Render only on Client */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            {isMounted && [...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: Math.random() * 1000 }}
                animate={{ 
                  y: [0, -1000],
                  opacity: [0, 0.5, 0]
                }}
                transition={{ 
                  duration: Math.random() * 10 + 10, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: Math.random() * 5
                }}
                className="absolute w-[1px] h-[1px] bg-[#00FFFF] rounded-full"
                style={{ left: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
