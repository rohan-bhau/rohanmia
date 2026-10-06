'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

interface PinnedSocialsProps {
  socialMap?: Record<string, string>;
}

export default function PinnedSocials({ socialMap = {} }: PinnedSocialsProps) {
  const { currentTheme } = useThemeAccent();

  const items: Array<{
    name: string;
    url: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }> = [];

  if (socialMap.twitter) {
    items.push({ name: 'Twitter / X', url: socialMap.twitter, icon: FaXTwitter });
  }
  if (socialMap.github) {
    items.push({ name: 'GitHub', url: socialMap.github, icon: FaGithub });
  }
  if (socialMap.linkedin) {
    items.push({ name: 'LinkedIn', url: socialMap.linkedin, icon: FaLinkedin });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-4">
      {/* Top Vertical Guide Line */}
      <div 
        className="w-px h-16 bg-gradient-to-b from-transparent to-white/15" 
      />

      {/* Social Links */}
      <div className="flex flex-col gap-3">
        {items.map((social) => {
          const Icon = social.icon;
          return (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              title={social.name}
              aria-label={social.name}
              whileHover={{ scale: 1.15, x: 2 }}
              whileTap={{ scale: 0.95 }}
              className="group relative w-10 h-10 rounded-full bg-[#0d0f12]/80 hover:bg-[#14171c] border border-white/[0.08] hover:border-white/20 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-300 shadow-lg"
            >
              {/* Subtle hover glow ring */}
              <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none"
                style={{ backgroundColor: `${currentTheme.primary}30` }}
              />
              <Icon size={16} className="relative z-10 group-hover:text-primary transition-colors" />

              {/* Tooltip on right */}
              <span className="absolute left-12 px-2.5 py-1 rounded-lg bg-[#0d0f12] border border-white/10 text-[10px] font-mono text-foreground opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-xl">
                {social.name}
              </span>
            </motion.a>
          );
        })}
      </div>

      {/* Bottom Vertical Guide Line */}
      <div 
        className="w-px h-16 bg-gradient-to-t from-transparent to-white/15" 
      />
    </div>
  );
}
