'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Terminal, 
  Database, 
  ShieldCheck, 
  Laptop,
  Code2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { DbTechCategoryRow } from '@/lib/db/stack';
import { getIconForTech } from '@/components/ui/TechBadge';

// 1. Frontend Architecture Custom SVG
const FrontendIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2.5" y="3" width="19" height="14.5" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="5.5" cy="5.75" r="0.8" fill="currentColor" />
    <circle cx="8" cy="5.75" r="0.8" fill="currentColor" />
    <circle cx="10.5" cy="5.75" r="0.8" fill="currentColor" />
    <path d="M2.5 8H21.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
    <rect x="5" y="10.5" width="6" height="4.5" rx="1.2" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
    <path d="M13.5 10.5H19M13.5 13H17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M8.5 21H15.5M12 17.5V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 2. Backend & APIs Custom SVG
const BackendIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="3" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="6.5" cy="6" r="1" fill="currentColor" />
    <circle cx="9.5" cy="6" r="1" fill="currentColor" />
    <path d="M14.5 6H18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <rect x="3" y="15" width="18" height="6" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="6.5" cy="18" r="1" fill="currentColor" />
    <circle cx="9.5" cy="18" r="1" fill="currentColor" />
    <path d="M14.5 18H18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M8 9V15M16 9V15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 12H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

// 3. Data Persistence & Storage Custom SVG
const DatabaseIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <ellipse cx="12" cy="5" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.25" />
    <path d="M4 5V12C4 13.65 7.58 15 12 15C16.42 15 20 13.65 20 12V5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 12V19C4 20.65 7.58 22 12 22C16.42 22 20 20.65 20 19V12" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="9.5" r="1" fill="currentColor" />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    <path d="M14.5 9.5H17M14.5 16.5H17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

// 4. DevOps & Global Infrastructure Custom SVG
const DevOpsIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2.5L20 7.2V16.8L12 21.5L4 16.8V7.2L12 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 21.5V12" stroke="currentColor" strokeWidth="1.5" />
    <path d="M20 7.2L12 12L4 7.2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.2" />
    <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1" strokeDasharray="2.5 2.5" transform="rotate(-30 12 12)" opacity="0.65" />
    <circle cx="19.5" cy="7.5" r="1.2" fill="currentColor" />
  </svg>
);

// 5. Development Workflow & Hardware Custom SVG
const WorkflowIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2.5" y="3.5" width="19" height="15" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2.5 8H21.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
    <circle cx="5.5" cy="5.75" r="0.75" fill="currentColor" />
    <circle cx="8" cy="5.75" r="0.75" fill="currentColor" />
    <path d="M6 11.5L8.5 13.5L6 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 15.5H15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8.5 20.5H15.5M12 18.5V20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  'Frontend Architecture': FrontendIcon,
  'Backend & APIs': BackendIcon,
  'Data Persistence & Storage': DatabaseIcon,
  'DevOps & Global Infrastructure': DevOpsIcon,
  'Development Workflow & Hardware': WorkflowIcon
};

interface TechStackClientViewProps {
  categories: DbTechCategoryRow[];
}

export default function TechStackClientView({ categories = [] }: TechStackClientViewProps) {
  const { currentTheme } = useThemeAccent();

  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-28 px-4 sm:px-6 relative bg-[#07090e]">
      
      {/* Background radial ambient lights */}
      <div 
        aria-hidden="true"
        className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full blur-[180px] opacity-10 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: currentTheme.primary }}
      />
      <div 
        aria-hidden="true"
        className="absolute top-1/2 -left-36 w-[450px] h-[450px] rounded-full blur-[170px] opacity-10 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: currentTheme.primary }}
      />
      <div 
        aria-hidden="true"
        className="absolute bottom-20 right-10 w-[400px] h-[400px] rounded-full blur-[160px] opacity-10 pointer-events-none"
        style={{ backgroundColor: currentTheme.primary }}
      />

      <div className="container mx-auto max-w-6xl space-y-24 relative z-10">
        
        {/* =========================================================================
            1. EDITORIAL HEADER
           ========================================================================= */}
        <div className="space-y-6 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-normal text-white tracking-tight leading-[1.08]">
            The tools, engines &amp;{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 15%, ${currentTheme.primary} 85%)`
              }}
            >
              architectural systems
            </span>{' '}
            powering my work.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed max-w-2xl">
            A curated breakdown of the production technologies, frameworks, and studio tools I rely on daily to engineer high-concurrency systems, verified platforms, and responsive interfaces.
          </p>
        </div>

        {/* =========================================================================
            2. EDITORIAL CATEGORY SHOWCASE
           ========================================================================= */}
        <div className="space-y-20">
          {categories.map((category) => {
            const CategoryIcon = CATEGORY_ICONS[category.title] || Code2;
            const items = category.items || [];

            return (
              <div 
                key={category.id || category.title} 
                id={(category.title || '').toLowerCase().replace(/\s+/g, '-')}
                className="flex flex-col lg:flex-row items-stretch border-t border-white/[0.08] pt-12 pb-12"
              >
                
                {/* LEFT COLUMN */}
                <div className="lg:w-[390px] xl:w-[420px] shrink-0 lg:pr-8 xl:pr-10">
                  <div className="sticky top-28 sm:top-36 space-y-3">
                    <span className="font-mono text-xs sm:text-sm font-semibold text-zinc-500 tracking-wider block">
                      {category.number}
                    </span>

                    <div className="flex items-start gap-3.5">
                      <div 
                        className="size-10 sm:size-11 rounded-2xl flex items-center justify-center border shrink-0 mt-0.5 transition-transform duration-300"
                        style={{
                          backgroundColor: `${currentTheme.primary}12`,
                          borderColor: `${currentTheme.primary}25`,
                          color: currentTheme.primary,
                          boxShadow: `0 4px 20px ${currentTheme.primary}15, inset 0 1px 0 rgba(255,255,255,0.08)`
                        }}
                      >
                        <CategoryIcon size={21} />
                      </div>

                      <h2 className="text-2xl sm:text-3xl lg:text-[30px] font-serif font-normal text-white tracking-tight leading-[1.18] line-clamp-2">
                        {category.title}
                      </h2>
                    </div>

                    {category.subtitle && (
                      <p className="text-xs font-mono text-zinc-400 pt-1">
                        {category.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* MIDDLE DIVIDER */}
                <div aria-hidden="true" className="hidden lg:block w-[1px] border-r border-dashed border-white/10 shrink-0 self-stretch" />

                {/* RIGHT COLUMN: Floating Tech Items */}
                <div className="flex-1 lg:pl-8 xl:pl-10 mt-8 lg:mt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {items.map((item, itemIdx) => {
                      const iconData = getIconForTech(item.name);
                      const BrandIcon = iconData.icon;
                      const iconColor = item.brand_color || iconData.color;

                      return (
                        <a
                          key={item.id || itemIdx}
                          href={item.docs_url || 'https://github.com/rohan-mia'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative p-6 rounded-2xl bg-transparent border border-transparent hover:bg-[#0d1017]/90 hover:border-white/15 hover:backdrop-blur-md transition-all duration-400 ease-out hover:-translate-y-1.5 flex flex-col items-center justify-center text-center min-h-[130px] sm:min-h-[145px] cursor-pointer overflow-hidden shadow-none hover:shadow-[0_16px_40px_rgba(0,0,0,0.75)] select-none"
                        >
                          {/* Ambient Brand Color Radial Glow */}
                          <div 
                            aria-hidden="true"
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                            style={{
                              background: `radial-gradient(circle at 50% 45%, ${iconColor}22 0%, transparent 70%)`
                            }}
                          />

                          {/* Hairline Glass Highlight Line */}
                          <div 
                            aria-hidden="true"
                            className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          />

                          {/* Brand SVG Icon */}
                          <div className="relative z-10 mb-3 flex items-center justify-center">
                            <BrandIcon 
                              size={40} 
                              style={{ color: iconColor }}
                              className="transition-all duration-400 ease-out group-hover:scale-115 group-hover:-translate-y-1 group-hover:drop-shadow-[0_6px_20px_rgba(255,255,255,0.25)]"
                            />
                            <div 
                              className="absolute inset-0 rounded-full blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-400 pointer-events-none"
                              style={{ backgroundColor: iconColor }}
                            />
                          </div>

                          {/* Tech Name */}
                          <div className="relative z-10 text-center max-w-full px-1">
                            <h3 className="text-sm sm:text-base font-medium text-zinc-300 group-hover:text-white transition-colors tracking-tight truncate">
                              {item.name}
                            </h3>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* =========================================================================
            3. PRODUCTION ARCHITECTURE SLAB
           ========================================================================= */}
        <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-[#0e1017] via-[#090a0f] to-[#07080b] border border-white/[0.1] border-t-white/[0.18] p-8 sm:p-14 lg:p-16 overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
          
          <motion.div
            animate={{
              scale: [1, 1.25, 0.95, 1],
              opacity: [0.35, 0.65, 0.4, 0.35],
              x: [0, 20, -15, 0],
              y: [0, -15, 10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-32 -right-32 w-[460px] h-[460px] rounded-full blur-[130px] pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${currentTheme.primary} 0%, rgba(56, 189, 248, 0.35) 45%, transparent 75%)`,
            }}
          />

          <motion.div
            animate={{
              scale: [1, 1.2, 0.9, 1],
              opacity: [0.3, 0.6, 0.35, 0.3],
              x: [0, -15, 15, 0],
              y: [0, 15, -10, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full blur-[130px] pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${currentTheme.primary} 0%, rgba(244, 63, 94, 0.3) 45%, transparent 75%)`,
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
            style={{
              backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.16) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span 
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider font-semibold px-3 py-1 rounded-full border"
                  style={{
                    backgroundColor: `${currentTheme.primary}15`,
                    borderColor: `${currentTheme.primary}35`,
                    color: currentTheme.primary
                  }}
                >
                  <Sparkles size={12} />
                  PRODUCTION BENCHMARK
                </span>
                <span className="text-zinc-500 font-mono text-xs hidden sm:inline">•</span>
                <span className="text-xs font-mono text-zinc-400">
                  REAL-WORLD PLATFORMS
                </span>
              </div>

              <div className="relative size-12 sm:size-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)] group-hover:scale-110 transition-all duration-500 self-start sm:self-auto">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-amber-300">
                  <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3" fill="#f59e0b" className="animate-pulse" />
                  <circle cx="12" cy="5" r="1.5" fill="currentColor" opacity="0.9" />
                  <circle cx="18" cy="14" r="1.5" fill="currentColor" opacity="0.9" />
                  <circle cx="6" cy="14" r="1.5" fill="currentColor" opacity="0.9" />
                </svg>
                <span className="absolute -top-1.5 -right-1 text-xs text-amber-300 select-none animate-bounce">✦</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-white tracking-tight leading-[1.15]">
                See how these systems operate in{' '}
                <span 
                  className="font-serif italic font-normal text-transparent bg-clip-text"
                  style={{
                    backgroundImage: `linear-gradient(135deg, #ffffff 15%, ${currentTheme.primary} 85%)`
                  }}
                >
                  real production environments.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-zinc-300 font-light leading-relaxed max-w-2xl">
                Explore architectural case studies documenting atomic reservation locks, sub-50ms API caching, real-time live bidding sockets, and multi-tenant ledger guarantees. Zero hypothetical code.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {[
                { name: 'Reserva', role: 'Hotel Engine', metric: 'Atomic Locks' },
                { name: 'Qurbaniya', role: 'Livestock Marketplace', metric: 'Live Bidding' },
                { name: 'Keen-Keeper', role: 'Enterprise Accounting', metric: 'Double-Entry ACID' }
              ].map((platform, pIdx) => (
                <div 
                  key={pIdx}
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-2 text-xs font-mono"
                >
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span className="text-white font-medium">{platform.name}</span>
                  <span className="text-zinc-400 text-[11px]">({platform.role})</span>
                  <span className="text-[10px] text-zinc-400 px-1.5 py-0.5 rounded bg-white/[0.05]">
                    {platform.metric}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-white/[0.08]">
              <div className="text-xs font-mono text-zinc-400">
                <span>INDEXED ARCHITECTURE // 4+ FULL-STACK CASE STUDIES</span>
              </div>

              <Link
                href="/projects"
                className="relative group inline-flex items-center gap-3.5 pl-7 pr-2.5 py-2.5 rounded-full bg-[#15171e] border border-white/[0.15] text-xs sm:text-sm font-semibold text-white overflow-hidden transition-all duration-500 shadow-2xl cursor-pointer hover:border-transparent hover:scale-105 active:scale-95 self-start sm:self-auto"
                style={{
                  boxShadow: `0 0 30px rgba(0, 0, 0, 0.85)`,
                }}
              >
                <span
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-10 rounded-full transition-all duration-500 ease-out group-hover:scale-[22] pointer-events-none -z-0"
                  style={{ backgroundColor: currentTheme.primary }}
                />

                <span className="relative z-10 font-mono font-medium group-hover:text-black transition-colors duration-300">
                  Explore Production Case Studies
                </span>

                <div className="relative z-10 size-9 rounded-full bg-white text-black flex items-center justify-center transition-transform duration-300 group-hover:rotate-45 shrink-0 shadow-md">
                  <ArrowRight size={16} />
                </div>
              </Link>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
