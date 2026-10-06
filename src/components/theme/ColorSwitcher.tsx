'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useThemeAccent } from './ThemeProvider';
import { AccentColor } from '@/types/theme';

interface ColorSwitcherProps {
  variant?: 'inline' | 'dropdown' | 'bento';
  className?: string;
}

export default function ColorSwitcher({ variant = 'inline', className = '' }: ColorSwitcherProps) {
  const { accent, setAccent, themes, currentTheme } = useThemeAccent();
  const [isOpen, setIsOpen] = useState(false);

  // Bento Card Variation (Designed specifically for the Home Page Bento Grid!)
  if (variant === 'bento') {
    return (
      <div className={`flex flex-col justify-between p-6 rounded-3xl bg-[#0f1115]/90 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden group ${className}`}>
        {/* Ambient glow from current accent */}
        <div 
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-30 transition-all duration-700 pointer-events-none"
          style={{ backgroundColor: currentTheme.primary }}
        />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Palette size={14} style={{ color: currentTheme.primary }} />
              <span>Theme Engine</span>
            </div>
            <span 
              className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-widest"
              style={{ color: currentTheme.primary }}
            >
              {currentTheme.name}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">
            Personalize your viewing experience with dynamic color accents.
          </p>
        </div>

        <div className="grid grid-cols-6 gap-2 pt-6 relative z-10">
          {themes.map((t) => {
            const isActive = accent === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setAccent(t.id)}
                title={`${t.name} - ${t.label}`}
                aria-label={`Switch to ${t.name}`}
                className="relative flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300 hover:scale-105 group/btn"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 border"
                  style={{
                    backgroundColor: t.primary,
                    borderColor: isActive ? '#ffffff' : 'transparent',
                    boxShadow: isActive ? `0 0 16px ${t.glow}` : 'none',
                    transform: isActive ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  {isActive && <Check size={12} className={t.id === 'mono' ? 'text-black' : 'text-white'} />}
                </div>
                <span className="text-[9px] font-mono text-muted-foreground group-hover/btn:text-foreground transition-colors uppercase tracking-tight">
                  {t.id}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Dropdown / Popover Variation for Navbar
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all duration-300 text-xs text-foreground/80 hover:text-foreground"
          aria-label="Customize accent color"
        >
          <span 
            className="w-2.5 h-2.5 rounded-full shadow-sm animate-pulse" 
            style={{ backgroundColor: currentTheme.primary, boxShadow: `0 0 8px ${currentTheme.glow}` }} 
          />
          <span className="hidden sm:inline font-mono text-[11px]">{currentTheme.name}</span>
          <Palette size={13} className="text-muted-foreground" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)} 
              />
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-64 p-3 rounded-2xl bg-[#0f1115]/95 border border-white/[0.1] backdrop-blur-2xl shadow-2xl z-50 space-y-2"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] px-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles size={12} style={{ color: currentTheme.primary }} />
                    Accent Engine
                  </span>
                  <span className="text-[10px] text-muted-foreground">Dark Base</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {themes.map((t) => {
                    const isActive = accent === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setAccent(t.id);
                          setIsOpen(false);
                        }}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all duration-200 text-xs font-medium border ${
                          isActive
                            ? 'bg-white/[0.08] border-white/20 text-white'
                            : 'bg-transparent border-transparent text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: t.primary,
                            boxShadow: isActive ? `0 0 10px ${t.glow}` : 'none',
                          }}
                        />
                        <span className="truncate text-[11px]">{t.name}</span>
                        {isActive && <Check size={12} className="ml-auto text-white" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Inline Variation
  return (
    <div className={`flex items-center gap-2 p-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md ${className}`}>
      {themes.map((t) => {
        const isActive = accent === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setAccent(t.id)}
            aria-label={`Switch accent to ${t.name}`}
            className="relative p-1 rounded-full transition-transform hover:scale-110"
          >
            <span
              className="block w-4 h-4 rounded-full transition-all duration-300"
              style={{
                backgroundColor: t.primary,
                boxShadow: isActive ? `0 0 10px ${t.glow}` : 'none',
                transform: isActive ? 'scale(1.2)' : 'scale(1)',
                border: isActive ? '2px solid #ffffff' : '1px solid transparent',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
