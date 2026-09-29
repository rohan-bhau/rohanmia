'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowUpRight, 
  ExternalLink, 
  FolderGit2,
  Lock
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { FEATURED_CASE_STUDIES } from '@/data/projects';
import TechBadge from '@/components/ui/TechBadge';

export default function FeaturedCaseStudies() {
  const { currentTheme } = useThemeAccent();

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 relative">
      <div className="container mx-auto max-w-6xl">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-14 gap-6">
          <div className="space-y-2.5">
            <span 
              className="text-xs font-mono uppercase tracking-widest font-semibold flex items-center gap-1.5"
              style={{ color: currentTheme.primary }}
            >
              <FolderGit2 size={15} />
              Production Platforms
            </span>
            <h2 className="text-4xl sm:text-6xl font-serif font-normal tracking-tight text-foreground">
              Featured{' '}
              <span 
                className="font-serif italic font-normal text-transparent bg-clip-text" 
                style={{ backgroundImage: `linear-gradient(135deg, #ffffff, ${currentTheme.primary})` }}
              >
                Case Studies
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-normal leading-relaxed">
              Production web applications engineered with modern full-stack architectures, high concurrency guards, and fluid user experiences.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-mono font-medium text-foreground transition-all hover:scale-105 active:scale-95 whitespace-nowrap self-start sm:self-auto shadow-sm"
          >
            <span>View All Archives</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Grand Sticky Stacked Cards Deck (Carefully calibrated height to eliminate all clipping) */}
        <div className="relative space-y-20 sm:space-y-28">
          {FEATURED_CASE_STUDIES.map((project, index) => {
            const cardAccent = project.accentColor || currentTheme.primary;
            // Calibrated sticky top offset so every card sits perfectly below navbar with 0 clipping
            const stickyTop = `calc(4.25rem + ${index * 0.75}rem)`;
            const displayUrl = project.liveUrl 
              ? project.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') 
              : `${project.slug}.vercel.app`;

            return (
              <div
                key={project.id}
                style={{
                  top: stickyTop,
                  zIndex: 10 + index,
                }}
                className="sticky rounded-[2rem] sm:rounded-[2.25rem] bg-[#0c0e14] border border-white/[0.12] hover:border-white/25 p-5 sm:p-7 lg:p-8 backdrop-blur-2xl transition-all duration-300 relative overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] group"
              >
                {/* Dynamic Ambient Accent Glow */}
                <div 
                  className="absolute -top-28 -right-28 w-[380px] h-[380px] rounded-full blur-[130px] opacity-20 group-hover:opacity-35 transition-opacity duration-700 pointer-events-none"
                  style={{ backgroundColor: cardAccent }}
                />

                {/* Top Deck Accent Line */}
                <div 
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-75 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${cardAccent}, transparent)`,
                  }}
                />

                {/* Top Meta Header: Category, Year, Role & Index */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-5 relative z-10">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span 
                      className="text-[11px] font-mono font-bold px-3 py-0.5 rounded-full border border-white/10 uppercase tracking-wide"
                      style={{
                        backgroundColor: `${cardAccent}20`,
                        color: cardAccent,
                      }}
                    >
                      {project.category}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {project.year} • {project.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground/60 hidden sm:inline uppercase tracking-wider">
                      Featured
                    </span>
                    <span 
                      className="text-sm sm:text-base font-mono font-black"
                      style={{ color: cardAccent }}
                    >
                      0{index + 1} <span className="text-muted-foreground/40 font-normal">/ 0{FEATURED_CASE_STUDIES.length}</span>
                    </span>
                  </div>
                </div>

                {/* Main Content Layout: Balanced 2-Column Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
                  
                  {/* Left Column: Project Story, Challenge/Solution, Stack & Buttons (Span 6) */}
                  <div className="lg:col-span-6 space-y-4">
                    
                    {/* Title & Tagline */}
                    <div className="space-y-1">
                      <h3 className="text-3xl sm:text-4xl font-serif font-normal text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-xs sm:text-sm font-mono text-muted-foreground/90 font-medium">
                        {project.tagline}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-0.5 line-clamp-2">
                        {project.overview}
                      </p>
                    </div>

                    {/* Challenge & Solution Capsules */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-0.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold block">
                          The Challenge
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {project.problem}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-0.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                          Architectural Solution
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {project.solution}
                        </p>
                      </div>
                    </div>

                    {/* Architecture & Stack Badges */}
                    <div className="space-y-1.5 pt-1 border-t border-white/[0.08]">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/80 font-medium block">
                        Architecture &amp; Stack:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {project.architecture.frontend
                          .concat(project.architecture.backend.slice(0, 2))
                          .concat(project.architecture.database.slice(0, 1))
                          .map((tech) => (
                            <TechBadge key={tech} name={tech} />
                          ))}
                      </div>
                    </div>

                    {/* Prominent Action Buttons (Guaranteed 100% visible) */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
                          style={{
                            backgroundColor: cardAccent,
                            boxShadow: `0 0 20px ${cardAccent}40`,
                          }}
                        >
                          <ExternalLink size={14} />
                          <span>Live Platform</span>
                        </a>
                      )}

                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs sm:text-sm font-mono text-foreground flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap cursor-pointer hover:border-white/20"
                        >
                          <FaGithub size={14} />
                          <span>Source Code</span>
                        </a>
                      )}

                      <Link
                        href={`/projects/${project.slug}`}
                        className="py-2.5 px-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-xs sm:text-sm font-mono text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <span>Case Study</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>

                  </div>

                  {/* Right Column: Grand Browser Window Frame & Benchmarks (Span 6) */}
                  <div className="lg:col-span-6 flex flex-col justify-between space-y-3.5">
                    
                    {/* macOS Browser Frame with Real Project Screenshot */}
                    <div className="rounded-xl sm:rounded-2xl bg-[#090b10] border border-white/[0.12] overflow-hidden shadow-2xl group/mockup relative transition-transform duration-500 hover:scale-[1.015]">
                      
                      {/* Browser Chrome Header Bar */}
                      <div className="px-3.5 py-2.5 bg-[#13161e] border-b border-white/[0.08] flex items-center justify-between gap-3">
                        {/* Traffic light dots */}
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        </div>

                        {/* URL Bar */}
                        <div className="flex-1 max-w-[230px] mx-auto px-2.5 py-0.5 rounded-md bg-black/60 border border-white/[0.08] flex items-center justify-center gap-1.5 text-[10px] font-mono text-muted-foreground truncate">
                          <Lock size={9} className="text-emerald-400 flex-shrink-0" />
                          <span className="truncate">{displayUrl}</span>
                        </div>

                        {/* Status Pulse */}
                        <span 
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: cardAccent }}
                        />
                      </div>

                      {/* Mockup Preview Image with Real Platform Screenshot */}
                      <div className="relative h-48 sm:h-56 lg:h-[220px] w-full overflow-hidden bg-[#07080a]">
                        <Image
                          src={project.previewImage}
                          alt={project.title}
                          fill
                          className="object-cover object-top transition-transform duration-700 group-hover/mockup:scale-105"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        {/* Smooth gloss gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-60" />

                        {/* Hover Overlay Button */}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/mockup:opacity-100 transition-opacity duration-300 backdrop-blur-xs"
                          >
                            <span 
                              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-white shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform"
                              style={{ 
                                backgroundColor: cardAccent,
                                boxShadow: `0 0 25px ${cardAccent}60`
                              }}
                            >
                              <span>Explore Live Platform</span>
                              <ExternalLink size={13} />
                            </span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* 3-Column Production Benchmarks Bar */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {project.metrics.map((m, mIdx) => (
                        <div key={mIdx} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                          <span className="text-[10px] font-mono text-muted-foreground block truncate">
                            {m.label}
                          </span>
                          <span className="text-xs sm:text-sm font-bold font-mono block mt-0.5" style={{ color: cardAccent }}>
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
