'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquareQuote, Star, ShieldCheck, Quote } from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { TESTIMONIALS } from '@/data/testimonials';

export default function TestimonialsSection() {
  const { currentTheme } = useThemeAccent();

  return (
    <section className="py-20 px-6 relative">
      <div className="container mx-auto max-w-6xl">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span 
            className="text-xs font-mono uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5"
            style={{ color: currentTheme.primary }}
          >
            <ShieldCheck size={14} />
            Verified Endorsements
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-foreground">
            What Engineering Leaders{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text" 
              style={{ backgroundImage: `linear-gradient(135deg, #ffffff, ${currentTheme.primary})` }}
            >
              Say
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Direct feedback on architectural discipline, shipping velocity, and product-focused execution.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="p-8 rounded-3xl bg-[#0d0f12]/90 border border-white/[0.08] hover:border-white/20 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between space-y-6 relative group"
            >
              {/* Subtle top glow */}
              <div 
                className="absolute top-0 left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${currentTheme.primary}, transparent)`
                }}
              />

              <div className="space-y-4">
                {/* Tag & Quote icon */}
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border border-white/10 uppercase tracking-wider font-medium"
                    style={{ color: currentTheme.primary }}
                  >
                    {t.tag}
                  </span>
                  <Quote size={18} className="text-white/20 group-hover:text-primary transition-colors" />
                </div>

                <h3 className="text-base font-bold text-foreground leading-snug">
                  "{t.headline}"
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t.quote}
                </p>
              </div>

              {/* Author Info */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{t.name}</h4>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    {t.role} • {t.company}
                  </p>
                </div>
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} fill="currentColor" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
