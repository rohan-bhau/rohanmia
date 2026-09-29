'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Cpu, 
  Terminal, 
  Database, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  Check, 
  Code2, 
  Wrench,
  Laptop
} from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { STACK_CATEGORIES, StackCategory, TechItem } from '@/data/stack';
import TechBadge from '@/components/ui/TechBadge';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  'Frontend Architecture': Cpu,
  'Backend & APIs': Terminal,
  'Data Persistence & Storage': Database,
  'DevOps & Global Infrastructure': ShieldCheck,
  'Development Workflow & Hardware': Laptop
};

export default function TechStackPage() {
  const { currentTheme } = useThemeAccent();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const filterOptions = ['All', 'Frontend', 'Backend', 'Database', 'DevOps & Cloud', 'Architecture & Tools'];

  const filteredCategories = selectedFilter === 'All' 
    ? STACK_CATEGORIES 
    : STACK_CATEGORIES.map(category => ({
        ...category,
        items: category.items.filter(item => 
          item.category.toLowerCase().includes(selectedFilter.toLowerCase())
        )
      })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Dynamic Ambient Glow */}
      <div 
        aria-hidden="true"
        className="absolute top-1/4 -right-48 w-96 h-96 rounded-full blur-[150px] opacity-15 pointer-events-none"
        style={{ backgroundColor: currentTheme.primary }}
      />
      <div 
        aria-hidden="true"
        className="absolute top-2/3 -left-48 w-96 h-96 rounded-full blur-[150px] opacity-15 pointer-events-none"
        style={{ backgroundColor: currentTheme.primary }}
      />

      <div className="container mx-auto max-w-6xl space-y-16 sm:space-y-20 relative z-10">
        
        {/* =========================================================================
            1. PAGE HEADER
           ========================================================================= */}
        <div className="text-left space-y-4 max-w-3xl">
          <span 
            className="text-xs font-mono uppercase tracking-[0.25em] font-semibold flex items-center gap-2"
            style={{ color: currentTheme.primary }}
          >
            <Layers size={14} />
            Engineering Stack // Uses
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-white tracking-tight leading-[1.12]">
            The tools, frameworks &amp;{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 20%, ${currentTheme.primary} 85%)`
              }}
            >
              architectural systems
            </span>{' '}
            powering my work.
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
            A curated breakdown of the production technologies I use daily to build high-concurrency reservation engines, verified marketplaces, and responsive user interfaces.
          </p>
        </div>

        {/* =========================================================================
            2. CATEGORY FILTER PILLS
           ========================================================================= */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-white/[0.08] pb-6">
          {filterOptions.map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full text-xs font-mono transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'text-white font-semibold shadow-md' 
                    : 'text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08]'
                }`}
                style={{
                  backgroundColor: isActive ? currentTheme.primary : undefined,
                  borderColor: isActive ? currentTheme.primary : undefined,
                  boxShadow: isActive ? `0 0 15px ${currentTheme.primary}40` : undefined,
                }}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            3. CATEGORIZED STACK SHOWCASE
           ========================================================================= */}
        <div className="space-y-16">
          {filteredCategories.map((category, catIdx) => {
            const CategoryIcon = CATEGORY_ICONS[category.title] || Code2;

            return (
              <div key={catIdx} className="space-y-6">
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-white/[0.08]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="size-8 rounded-lg flex items-center justify-center border"
                        style={{
                          backgroundColor: `${currentTheme.primary}15`,
                          borderColor: `${currentTheme.primary}30`,
                          color: currentTheme.primary
                        }}
                      >
                        <CategoryIcon size={16} />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {category.title}
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-400 font-light">
                      {category.description}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 self-start sm:self-auto px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
                    {category.badge}
                  </span>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="p-5 sm:p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.08] hover:border-white/20 transition-all duration-300 relative group overflow-hidden shadow-lg space-y-3"
                    >
                      {/* Top Row: TechBadge + Core status */}
                      <div className="flex items-center justify-between gap-3">
                        <TechBadge name={item.name} size="md" />

                        {item.isCore && (
                          <span 
                            className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
                            style={{
                              backgroundColor: `${currentTheme.primary}15`,
                              borderColor: `${currentTheme.primary}35`,
                              color: currentTheme.primary
                            }}
                          >
                            Core Arsenal
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-zinc-400 font-light leading-relaxed">
                        {item.description}
                      </p>

                      {/* Production Use Case */}
                      <div className="pt-2 border-t border-white/[0.06] flex items-start gap-2">
                        <span className="text-[11px] font-mono text-zinc-400 shrink-0">Use Case:</span>
                        <span className="text-xs text-zinc-300 font-light">{item.useCase}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            4. ACTION BANNER: SEE STACK IN PRODUCTION
           ========================================================================= */}
        <div className="p-8 sm:p-10 rounded-[2rem] bg-gradient-to-r from-[#0d1017] to-[#090b10] border border-white/[0.1] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-serif text-white tracking-tight">
              See these technologies in action.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              Explore in-depth technical case studies documenting how this stack handles atomic concurrency, dynamic pricing, and low-latency navigation.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-medium text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg whitespace-nowrap self-start sm:self-auto cursor-pointer"
            style={{
              backgroundColor: currentTheme.primary,
              boxShadow: `0 0 20px ${currentTheme.primary}40`,
            }}
          >
            <span>Explore Case Studies</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
