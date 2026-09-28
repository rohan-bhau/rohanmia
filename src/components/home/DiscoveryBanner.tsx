'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { useBooking } from '@/components/booking/BookingContext';

export default function DiscoveryBanner() {
  const { currentTheme } = useThemeAccent();
  const { openBooking } = useBooking();

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-5xl">
        <div 
          className="p-10 md:p-16 rounded-[2.5rem] bg-[#0d0f12]/95 border border-white/[0.1] relative overflow-hidden backdrop-blur-2xl shadow-2xl text-center space-y-8"
        >
          {/* Ambient Radial Background */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[140px] opacity-25 pointer-events-none transition-all duration-700"
            style={{ backgroundColor: currentTheme.primary }}
          />

          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <span 
              className="text-xs font-mono uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5"
              style={{ color: currentTheme.primary }}
            >
              <Sparkles size={14} />
              Collaboration & Scoping
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-foreground uppercase italic tracking-tight">
              Ready to build the <br />
              <span className="not-italic text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, #ffffff, ${currentTheme.primary})` }}>
                future together?
              </span>
            </h2>

            <p className="text-xs sm:text-base text-muted-foreground leading-relaxed">
              Available for full-time engineering roles, high-concurrency web architecture contracts, and technical advisory. No intermediaries, no sales fluff.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
            <button
              onClick={openBooking}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
              style={{
                backgroundColor: currentTheme.primary,
                color: currentTheme.contrastText,
                boxShadow: `0 0 35px ${currentTheme.glow}`,
              }}
            >
              <Calendar size={16} />
              <span>Schedule 15-Min Discovery Call</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-sm font-semibold text-foreground flex items-center justify-center gap-2 transition-all hover:border-white/20 active:scale-95"
            >
              <Mail size={16} className="text-muted-foreground" />
              <span>Send Project Brief</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
