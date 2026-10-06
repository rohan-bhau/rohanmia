'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import Magnetic from './Magnetic';
import Tooltip from './Tooltip';

export default function FloatingControls() {
  const pathname = usePathname();
  const { currentTheme } = useThemeAccent();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <div className="floating-controls-container pointer-events-none">
      {/* Scroll to Top (Cleanly stacked vertically right above the AI Chatbot trigger) */}
      <div className="fixed bottom-[152px] right-[26px] md:bottom-[98px] md:right-[34px] z-40 pointer-events-auto">
        <AnimatePresence>
          {showScrollTop && (
            <motion.div
              key="scroll-top"
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Tooltip text="Scroll to top" position="left">
                <Magnetic strength={0.3}>
                  <motion.button
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="w-11 h-11 rounded-full bg-[#0d0f12]/90 backdrop-blur-xl border border-white/[0.14] hover:border-white/30 flex items-center justify-center shadow-xl transition-all duration-300 group cursor-pointer"
                    style={{
                      boxShadow: `0 8px 24px -4px rgba(0,0,0,0.6), 0 0 16px ${currentTheme.glow}`,
                    }}
                    aria-label="Scroll to top"
                  >
                    <ArrowUp 
                      size={18} 
                      className="group-hover:-translate-y-0.5 transition-transform duration-200" 
                      style={{ color: currentTheme.primary }}
                    />
                  </motion.button>
                </Magnetic>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
