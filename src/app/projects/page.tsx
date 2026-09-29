'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  FolderGit2, 
  Layers
} from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { ALL_PROJECTS, CaseStudy } from '@/data/projects';
import ProjectCard from '@/components/projects/ProjectCard';

const CATEGORIES = ['All', 'Full Stack', 'Frontend', 'Backend', 'App'] as const;

export default function ProjectsPage() {
  const { currentTheme } = useThemeAccent();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProjects = useMemo(() => {
    return ALL_PROJECTS.filter((project: CaseStudy) => {
      const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        project.title.toLowerCase().includes(query) ||
        project.tagline.toLowerCase().includes(query) ||
        project.overview.toLowerCase().includes(query) ||
        project.techStack.some(t => t.toLowerCase().includes(query)) ||
        project.architecture.frontend.some(t => t.toLowerCase().includes(query)) ||
        project.architecture.backend.some(t => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Staggered columns for the exact Aayush Bharti desktop layout
  const col1Projects = useMemo(() => {
    return filteredProjects.filter((_, i) => i % 2 === 0);
  }, [filteredProjects]);

  const col2Projects = useMemo(() => {
    return filteredProjects.filter((_, i) => i % 2 === 1);
  }, [filteredProjects]);

  return (
    <div className="pt-32 md:pt-36 pb-32 px-4 sm:px-6 min-h-screen relative overflow-hidden">
      {/* Subtle Horizon Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 max-w-6xl h-px opacity-25"
          style={{
            background: `linear-gradient(90deg, transparent, ${currentTheme.primary}, transparent)`,
          }}
        />
        <div 
          className="absolute -top-36 left-1/2 -translate-x-1/2 w-[850px] h-[350px] opacity-15 blur-[140px]"
          style={{
            background: `radial-gradient(50% 50% at 50% 25%, ${currentTheme.primary} 0%, transparent 80%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#08090a]" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        
        {/* Page Header (Editorial Serif, No Badge Pill per user specification) */}
        <div className="max-w-3xl space-y-3 mb-12 sm:mb-14">
          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground/80 block">
            SELECTED WORKS &amp; ARCHITECTURE
          </span>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-normal tracking-tight text-white leading-tight">
            Projects &amp;{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`
              }}
            >
              Systems
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-light max-w-2xl">
            A curated collection of production web applications, system architectures, and mobile software engineered by Rohan Mia.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-16 items-stretch md:items-center justify-between pb-6 border-b border-white/[0.06]">
          
          {/* Search Input Bar */}
          <div className="relative flex-1 max-w-md group">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 transition-colors group-focus-within:text-foreground" 
              size={15} 
            />
            <input
              type="text"
              placeholder="Search by name, technology, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0c0e14]/90 border border-white/[0.08] focus:border-white/20 rounded-2xl py-2.5 pl-11 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none backdrop-blur-xl transition-all"
            />
          </div>

          {/* Category Filter Pills (Full Stack, Frontend, Backend, App) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-200 whitespace-nowrap cursor-pointer"
                  style={{
                    backgroundColor: isActive ? currentTheme.primary : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? currentTheme.contrastText : 'var(--muted-foreground)',
                    border: isActive ? `1px solid ${currentTheme.primary}` : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isActive ? `0 0 15px ${currentTheme.glow}` : 'none'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 ? (
          <div className="py-24 text-center rounded-3xl bg-[#0c0e14] border border-white/[0.08] p-8 space-y-3">
            <Layers className="mx-auto text-muted-foreground" size={32} />
            <h3 className="text-lg font-bold text-foreground">No projects found</h3>
            <p className="text-xs text-muted-foreground">Try adjusting your search query or selecting a different category.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="px-4 py-2 rounded-xl text-xs font-mono bg-white/[0.05] hover:bg-white/[0.1] text-foreground border border-white/10 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Staggered Editorial 2-Column Grid (Exactly as Screenshot) */
          <div className="relative">
            {/* Desktop View: Staggered Columns with Center Dividing Line */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16 items-start relative">
              
              {/* Continuous Center Architectural Dividing Axis Line */}
              <div 
                aria-hidden="true" 
                className="absolute left-1/2 -translate-x-1/2 -top-6 -bottom-6 w-px bg-white/[0.08] pointer-events-none"
              >
                {/* Top Coordinate Node */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[9px] text-neutral-500 select-none">
                  90°
                </div>
                {/* Ambient Center Glow */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `linear-gradient(180deg, transparent, ${currentTheme.primary}, transparent)`
                  }}
                />
              </div>

              {/* Column 1 (Left - Starts at normal height) */}
              <div className="flex flex-col gap-24">
                {col1Projects.map((project) => {
                  const originalIndex = filteredProjects.findIndex(p => p.id === project.id);
                  return (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      displayIndex={originalIndex} 
                      column="left" 
                    />
                  );
                })}
              </div>

              {/* Column 2 (Right - Staggered / Shifted down by pt-28 as in screenshot!) */}
              <div className="flex flex-col gap-24 lg:pt-28">
                {col2Projects.map((project) => {
                  const originalIndex = filteredProjects.findIndex(p => p.id === project.id);
                  return (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      displayIndex={originalIndex} 
                      column="right" 
                    />
                  );
                })}
              </div>
            </div>

            {/* Mobile / Tablet View: Sequential Linear Flow */}
            <div className="flex flex-col gap-16 lg:hidden">
              {filteredProjects.map((project, index) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  displayIndex={index} 
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
