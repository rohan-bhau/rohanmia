'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Video } from 'lucide-react';
import { useBooking } from './BookingContext';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import CalendlyBooking from './CalendlyBooking';

interface BookingModalProps {
  calendlyUrl?: string;
}

export default function BookingModal({
  calendlyUrl = 'https://calendly.com/rohanmia-org/30min'
}: BookingModalProps) {
  const { isOpen, closeBooking } = useBooking();
  const { currentTheme } = useThemeAccent();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeBooking();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeBooking]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 md:p-10">
          {/* Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBooking}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.1 }}
            className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0b0d10] border border-white/[0.1] shadow-[0_25px_80px_rgba(0,0,0,0.85)] overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0f1115]/90 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10"
                  style={{ backgroundColor: `${currentTheme.primary}20` }}
                >
                  <Calendar size={18} style={{ color: currentTheme.primary }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    Schedule Discovery Call
                    <span 
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 font-normal uppercase tracking-wider"
                      style={{ color: currentTheme.primary }}
                    >
                      In-Site
                    </span>
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> 30 mins
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Video size={12} /> Google Meet
                    </span>
                    <span>•</span>
                    <span className="hidden sm:inline">Direct with Rohan Mia</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={closeBooking}
                className="w-9 h-9 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Embedded Native Calendly Component */}
            <div className="relative flex-1 overflow-y-auto p-4 sm:p-6 bg-[#08090a]">
              <CalendlyBooking isModal={true} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
