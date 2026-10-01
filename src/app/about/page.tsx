'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  ArrowUpRight, 
  Code2,
  ArrowRight
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import TechBadge from '@/components/ui/TechBadge';
import StackedImageCarousel from '@/components/about/StackedImageCarousel';
import GithubContributionGraph from '@/components/about/GithubContributionGraph';
import fallbackContributions from '@/data/github-contributions.json';
import { CAREER_EXPERIENCES } from '@/data/experience';

export default function AboutPage() {
  const { currentTheme } = useThemeAccent();

  // Dynamic GitHub stats synced with live GitHub API
  const [githubStats, setGithubStats] = useState({
    publicRepos: 60,
    totalStars: 28,
    totalContributions: fallbackContributions.total || 1150,
    contributions: fallbackContributions.contributions,
  });

  useEffect(() => {
    fetch('/api/github-stats')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setGithubStats((prev) => ({
            publicRepos: data.publicRepos ?? prev.publicRepos,
            totalStars: data.totalStars ?? prev.totalStars,
            totalContributions: data.totalContributions ?? prev.totalContributions,
            contributions: data.contributions ?? prev.contributions,
          }));
        }
      })
      .catch((err) => console.error('Failed to load GitHub stats:', err));
  }, []);

  // Scroll tracking for Experience Timeline divider & traveling avatar
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 70%', 'end 70%']
  });

  const fillHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const avatarTop = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-200 selection:bg-cyan-500/20 selection:text-cyan-300 pt-28 sm:pt-36 pb-16 relative overflow-hidden">
      
      {/* Background Subtle Ambient Glow */}
      <div 
        aria-hidden="true"
        className="fixed top-24 left-1/2 -translate-x-1/2 w-[650px] h-[400px] rounded-full blur-[140px] opacity-15 pointer-events-none"
        style={{ backgroundColor: currentTheme.primary }}
      />

      <div className="container mx-auto max-w-6xl xl:max-w-7xl px-4 sm:px-6 space-y-20 sm:space-y-28 relative z-10">
        
        {/* =========================================================================
            1. HERO BIOGRAPHY & STACKED 3D CAROUSEL (Exact Editorial Style Layout)
           ========================================================================= */}
        <section className="space-y-8">
          
          {/* Eyebrow */}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              MORE ABOUT ME
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Heading, Bio & Social Links (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-white tracking-tight leading-[1.12]">
                I&apos;m Rohan, a<br />
                creative{' '}
                <span 
                  className="font-serif italic font-normal text-transparent bg-clip-text"
                  style={{
                    backgroundImage: `linear-gradient(135deg, #f43f5e 0%, #d946ef 50%, ${currentTheme.primary} 100%)`
                  }}
                >
                  engineer
                </span>
              </h1>

              {/* Bio Story - Honest, Ambitious Fresher Tone with Nickname */}
              <div className="space-y-4 text-base sm:text-lg text-neutral-300 font-light leading-relaxed max-w-xl">
                <p>
                  I&apos;m <strong className="text-white font-medium">MD Rohan Mia (Bhau)</strong>, a proactive full-stack developer passionate about creating dynamic web experiences. From frontend to backend, I thrive on solving complex problems with clean, efficient code. My expertise spans React, Next.js, and Node.js, and I&apos;m always eager to learn more.
                </p>
                <p>
                  When I&apos;m not immersed in work, I&apos;m exploring new ideas and staying curious. Life&apos;s about balance, and I love embracing every part of it.
                </p>
                <p>
                  I believe in waking up each day eager to make a difference!
                </p>
              </div>

              {/* Minimal Social Links Row (Exact Icon Style) */}
              <div className="flex items-center gap-3 pt-2">
                <a 
                  href="https://linkedin.com/in/rohanmia" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="LinkedIn"
                >
                  <FaLinkedin size={20} />
                  <span className="sr-only">LinkedIn</span>
                </a>

                <a 
                  href="https://github.com/rohan-bhau" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="GitHub"
                >
                  <FaGithub size={20} />
                  <span className="sr-only">GitHub</span>
                </a>

                <a 
                  href="https://x.com/rohanbhau" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  title="X (Twitter)"
                >
                  <FaXTwitter size={20} />
                  <span className="sr-only">X (Twitter)</span>
                </a>
              </div>

            </div>

            {/* Right Column: 3D Stacked Image Carousel with Real Images, Drag & Mobile Tap (5 Cols) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <StackedImageCarousel />
            </div>

          </div>

        </section>

        {/* =========================================================================
            2. THE EXPERIENCE SECTION (Editorial Scroll-Driven Animated Divider & Avatar)
           ========================================================================= */}
        <section className="space-y-6">
          
          {/* Section Header: Left-aligned like all other sections */}
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              THE EXPERIENCE
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-white tracking-tight">
              Experience That Brings{' '}
              <span 
                className="font-serif italic font-normal text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(135deg, #f43f5e 0%, #d946ef 50%, ${currentTheme.primary} 100%)`
                }}
              >
                Ideas to Life
              </span>
            </h2>
          </div>

          {/* Timeline Wrapper with Continuous Scroll Tracking Rail (Open border-t/b, no box cover) */}
          <div 
            ref={timelineRef}
            className="relative flex w-full flex-col divide-y divide-white/10 overflow-hidden border-t border-b border-white/10"
          >
            
            {/* DESKTOP VERTICAL PROGRESS DIVIDER & TRAVELING AVATAR (Exact Editorial 2px Crisp Line & Compact Avatar) */}
            <div 
              aria-hidden="true" 
              className="pointer-events-none hidden md:block absolute top-0 bottom-0 left-[380px] lg:left-[420px] -translate-x-1/2 w-8 z-10"
            >
              <div className="relative h-full w-full">
                {/* Background Rail Track - Crisp 2px width */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-white/10 rounded-full" />
                
                {/* Active Colored Progress Fill - Solid gradient matching Editorial cyan -> magenta -> theme */}
                <motion.div 
                  style={{ 
                    height: fillHeight,
                    background: `linear-gradient(180deg, #06b6d4 0%, ${currentTheme.primary} 40%, #ec4899 100%)`,
                    boxShadow: `0 0 8px ${currentTheme.primary}90, 0 0 14px #ec489960`
                  }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] rounded-full origin-top will-change-[height]"
                />

                {/* Traveling Avatar - Compact 28px avatar centered on rail without oversized blur */}
                <motion.div 
                  style={{ 
                    top: avatarTop,
                    borderColor: currentTheme.primary,
                    boxShadow: `0 0 10px ${currentTheme.primary}80, 0 0 16px #ec489960`
                  }}
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 size-7 sm:size-7.5 rounded-full border-2 overflow-hidden bg-neutral-900 will-change-[top] z-20"
                >
                  <Image
                    src="/images/about/hero-profile.png"
                    alt="Rohan"
                    fill
                    className="object-cover object-top"
                    priority
                  />
                </motion.div>
              </div>
            </div>

            {/* MOBILE VERTICAL PROGRESS DIVIDER & TRAVELING AVATAR */}
            <div 
              aria-hidden="true" 
              className="pointer-events-none block md:hidden absolute top-0 bottom-0 left-6 -translate-x-1/2 w-6 z-10"
            >
              <div className="relative h-full w-full">
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-white/10 rounded-full" />
                <motion.div 
                  style={{ 
                    height: fillHeight,
                    background: `linear-gradient(180deg, #06b6d4 0%, ${currentTheme.primary} 40%, #ec4899 100%)`,
                    boxShadow: `0 0 8px ${currentTheme.primary}90`
                  }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] rounded-full origin-top will-change-[height]"
                />
                <motion.div 
                  style={{ 
                    top: avatarTop,
                    borderColor: currentTheme.primary,
                    boxShadow: `0 0 10px ${currentTheme.primary}80`
                  }}
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 size-6.5 rounded-full border-2 overflow-hidden bg-neutral-900 will-change-[top] z-20"
                >
                  <Image
                    src="/images/about/hero-profile.png"
                    alt="Rohan"
                    fill
                    className="object-cover object-top"
                  />
                </motion.div>
              </div>
            </div>

            {/* Timeline Experience Cards */}
            {CAREER_EXPERIENCES.map((exp, idx) => (
              <article 
                key={idx} 
                className="relative grid grid-cols-1 md:grid-cols-[380px_1fr] lg:grid-cols-[420px_1fr] px-2 md:px-4 py-8 md:py-10 pl-12 md:pl-0 items-start"
              >
                {/* Left Column (Static alignment, no sticky offset to prevent vertical drift / huge gaps) */}
                <div className="mb-6 md:mb-0 h-full pr-4 md:pr-10 lg:pr-12 flex flex-col items-start gap-y-2.5">
                  <time className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {exp.period}
                  </time>
                  
                  {/* Company row: items-center pins logo with single line company title */}
                  <div className="flex items-center gap-3 mt-0.5">
                    {/* FUTURE ADMIN INTEGRATION: Dynamic company logo uploaded via Admin CMS/DB (currently static placeholder) */}
                    <div 
                      className="size-8.5 rounded-lg flex items-center justify-center font-mono font-bold text-xs border shadow-sm shrink-0 bg-neutral-900/90 border-white/10"
                      style={{ color: currentTheme.primary }}
                      title="Company Logo (Dynamic Admin upload placeholder)"
                    >
                      <Briefcase size={16} />
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-white font-medium tracking-tight whitespace-nowrap">
                      {exp.company}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-neutral-400 font-mono mt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="shrink-0" />
                      <span>{exp.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={12} className="shrink-0" />
                      <span>Full-time · Remote</span>
                    </div>
                  </div>
                </div>

                {/* Right Column (Restored to exact previous style per user request with clean bold lead bullet formatting) */}
                <div className="pl-0 md:pl-10 lg:pl-12 flex flex-col text-sm leading-relaxed pt-0 min-w-0">
                  <h4 className="mb-3 font-serif text-2xl sm:text-3xl text-white font-medium tracking-tight">
                    {exp.role}
                  </h4>

                  <p className="text-sm text-neutral-300 font-light leading-relaxed mb-4">
                    {exp.description}
                  </p>

                  {/* Key Achievements Bullet Points with Colored Sparkle ✦ (matching homepage FeaturedCaseStudies) */}
                  <div className="space-y-3 my-3">
                    {exp.achievements.map((ach, achIdx) => {
                      const colonIndex = ach.indexOf(':');
                      const hasLead = colonIndex !== -1;
                      const lead = hasLead ? ach.slice(0, colonIndex + 1) : '';
                      const rest = hasLead ? ach.slice(colonIndex + 1) : ach;

                      return (
                        <div
                          key={achIdx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300 leading-relaxed font-light"
                        >
                          <span
                            className="shrink-0 text-sm mt-0.5 select-none"
                            style={{ color: currentTheme.primary }}
                          >
                            ✦
                          </span>
                          <span>
                            {hasLead && (
                              <strong className="text-white font-medium">
                                {lead}{' '}
                              </strong>
                            )}
                            <span className="text-neutral-300">
                              {rest}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tech Stack Chips with Icons */}
                  <div className="mt-5 pt-4 border-t border-white/5">
                    <p className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-2.5">
                      Technologies &amp; Libraries:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exp.skills.map((skill) => (
                        <TechBadge 
                          key={skill} 
                          name={skill} 
                          size="sm" 
                        />
                      ))}
                    </div>
                  </div>

                </div>
              </article>
            ))}
          </div>

        </section>

        {/* =========================================================================
            3. OPEN SOURCE & CONTRIBUTIONS SECTION
           ========================================================================= */}
        <section className="space-y-8">
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              OPEN SOURCE
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-white tracking-tight">
              Code &amp;{' '}
              <span 
                className="font-serif italic font-normal text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(135deg, #f43f5e 0%, #d946ef 50%, ${currentTheme.primary} 100%)`
                }}
              >
                Contributions
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* Main GitHub Contribution Graph Card (8 cols) - Exact Editorial Heatmap */}
            <div className="lg:col-span-8 flex flex-col">
              <GithubContributionGraph 
                totalContributions={githubStats.totalContributions}
                contributions={githubStats.contributions}
              />
            </div>

            {/* Right Column: 3 Developer Metrics (4 cols) - Matching Editorial's 3-card stack with equal height */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-3 sm:gap-3.5">
              
              {/* Card 1: Repositories */}
              <a
                href="https://github.com/rohan-bhau?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-between px-5 py-3.5 rounded-2xl bg-[#0c1017]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative overflow-hidden group"
              >
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-mono text-neutral-300 font-normal mb-1">
                    Repositories
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-[#ec4899] group-hover:scale-105 transition-transform origin-left">
                    {githubStats.publicRepos}
                  </span>
                </div>
                {/* Pink constellation artwork */}
                <div className="relative w-20 h-10 flex items-center justify-end pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
                  <span className="absolute top-1 right-2 size-2 rounded-full bg-[#ec4899] shadow-[0_0_10px_#ec4899]" />
                  <span className="absolute bottom-1.5 right-7 size-1.5 rounded-full bg-[#ec4899]/70" />
                  <span className="absolute top-3.5 right-12 size-1 rounded-full bg-[#ec4899]/50" />
                  <span className="absolute bottom-3 right-16 size-1.5 rounded-full bg-[#ec4899]/40" />
                  <span className="absolute bottom-1 right-1 size-2.5 rounded-full bg-[#ec4899]/90 shadow-[0_0_12px_#ec4899]" />
                </div>
              </a>

              {/* Card 2: Total Commits */}
              <div className="flex-1 flex items-center justify-between px-5 py-3.5 rounded-2xl bg-[#0c1017]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative overflow-hidden group">
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-mono text-neutral-300 font-normal mb-1">
                    Total Commits
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-[#06b6d4] group-hover:scale-105 transition-transform origin-left">
                    {githubStats.totalContributions.toLocaleString()}
                  </span>
                </div>
                {/* Cyan Git network fork artwork */}
                <div className="relative w-20 h-10 flex items-center justify-end pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
                  <svg width="48" height="30" viewBox="0 0 48 30" fill="none" className="text-[#06b6d4]">
                    <circle cx="8" cy="15" r="3" fill="currentColor" />
                    <circle cx="38" cy="6" r="3" fill="currentColor" />
                    <circle cx="38" cy="24" r="3" fill="currentColor" />
                    <circle cx="22" cy="15" r="2.5" fill="currentColor" />
                    <path
                      d="M8 15H22M22 15C28 15 30 6 38 6M22 15C28 15 30 24 38 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Card 3: GitHub Stars */}
              <a
                href="https://github.com/rohan-bhau?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-between px-5 py-3.5 rounded-2xl bg-[#0c1017]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative overflow-hidden group"
              >
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-mono text-neutral-300 font-normal mb-1">
                    GitHub Stars
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-[#eab308] group-hover:scale-105 transition-transform origin-left">
                    {githubStats.totalStars}
                  </span>
                </div>
                {/* Golden stars artwork */}
                <div className="relative w-20 h-10 flex items-center justify-end pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity text-[#eab308]">
                  <span className="absolute top-1 right-2 text-sm select-none shadow-[0_0_10px_#eab308]">★</span>
                  <span className="absolute bottom-1 right-8 text-[10px] select-none opacity-80">★</span>
                  <span className="absolute top-3.5 right-13 text-[11px] select-none opacity-60">✦</span>
                  <span className="absolute bottom-2.5 right-16 text-[9px] select-none opacity-40">★</span>
                  <span className="absolute bottom-0 right-3 text-xs select-none opacity-90 shadow-[0_0_8px_#eab308]">★</span>
                </div>
              </a>

            </div>

          </div>
        </section>

        {/* =========================================================================
            4. MY SITE BENTO GRID (Explore, Experiment && Say Hello)
           ========================================================================= */}
        <section className="space-y-8">
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              MY SITE
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-white tracking-tight">
              Explore, experiment{' '}
              <span 
                className="font-serif italic font-normal text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(135deg, #f43f5e 0%, #d946ef 50%, ${currentTheme.primary} 100%)`
                }}
              >
                &amp;&amp; say hello
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5">
            
            {/* =================================================================
                CARD 1 (5 cols): CURATED CASE STUDIES / PRODUCTION SYSTEMS
                3D Holographic Isometric Hypercube crazy icon + dynamic preview
               ================================================================= */}
            <Link 
              href="/projects"
              className="group md:col-span-12 lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-[#0c1017]/80 border border-white/10 hover:border-amber-500/40 hover:bg-[#121622]/90 transition-all duration-500 flex flex-col justify-between min-h-[260px] sm:min-h-[290px] relative overflow-hidden backdrop-blur-md shadow-2xl"
            >
              {/* Amber ambient mesh glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
                    Selected Works
                  </span>
                  <p className="text-xs text-neutral-400 font-mono mt-1">
                    Architectural Deep Dives
                  </p>
                </div>

                {/* Crazy Icon 1: 3D Isometric Holographic Hypercube */}
                <div className="relative size-12 sm:size-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)] group-hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 flex-shrink-0">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-amber-300">
                    {/* Outer isometric cube */}
                    <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M21 7L12 12L3 7" stroke="currentColor" strokeWidth="1.5" />
                    {/* Inner glowing energy node */}
                    <circle cx="12" cy="12" r="3" fill="#f59e0b" className="animate-pulse" />
                    <circle cx="12" cy="5" r="1.5" fill="currentColor" opacity="0.9" />
                    <circle cx="18" cy="14" r="1.5" fill="currentColor" opacity="0.9" />
                    <circle cx="6" cy="14" r="1.5" fill="currentColor" opacity="0.9" />
                  </svg>
                  <span className="absolute -top-1.5 -right-1 text-xs text-amber-300 select-none animate-bounce">✦</span>
                </div>
              </div>

              <div className="my-4 relative z-10">
                <h3 className="text-xl sm:text-2xl font-serif text-white group-hover:text-amber-200 transition-colors">
                  Production Systems &amp; Labs
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-light mt-1.5 leading-relaxed max-w-sm">
                  Full-stack cloud architectures, microservices, and high-performance frontend solutions.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-amber-300/90 text-[11px]">
                  4+ Live Platforms
                </span>
                <span className="flex items-center gap-1.5 text-neutral-400 group-hover:text-white transition-colors">
                  Explore work <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                </span>
              </div>
            </Link>

            {/* =================================================================
                CARD 2 (7 cols): ENGINEERED TECH STACK & SYSTEM MATRIX
                Quantum Processor crazy icon + interactive tech chips + matrix grid
               ================================================================= */}
            <Link 
              href="/tech-stack"
              className="group md:col-span-12 lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-[#0c1017]/80 border border-white/10 hover:border-cyan-500/40 hover:bg-[#121622]/90 transition-all duration-500 flex flex-col justify-between min-h-[260px] sm:min-h-[290px] relative overflow-hidden backdrop-blur-md shadow-2xl"
            >
              {/* Cyan ambient mesh glow & circuit pattern */}
              <div className="absolute -top-10 -right-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:20px_20px] opacity-5 pointer-events-none" />

              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                    <span className="size-1.5 rounded-full bg-cyan-400" />
                    Engineered Arsenal
                  </span>
                  <p className="text-xs text-neutral-400 font-mono mt-1">
                    System Core &amp; Frameworks
                  </p>
                </div>

                {/* Crazy Icon 2: Quantum Silicon Processor */}
                <div className="relative size-12 sm:size-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] group-hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 flex-shrink-0">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-cyan-300">
                    <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="8.5" y="8.5" width="7" height="7" rx="1" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="12" cy="12" r="2" fill="#22d3ee" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                    <path d="M9 2V5M15 2V5M9 19V22M15 19V22M2 9H5M2 15H5M19 9H22M19 15H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="absolute -bottom-1 -left-1 size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                </div>
              </div>

              <div className="my-4 relative z-10 space-y-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif text-white group-hover:text-cyan-200 transition-colors">
                    Modern Stack &amp; Toolchain
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 font-light mt-1 max-w-lg leading-relaxed">
                    Built with high-throughput engines, strict type-safety, and edge-first distribution.
                  </p>
                </div>

                {/* Interactive tech chips row */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Next.js 16', 'TypeScript', 'Tailwind', 'Python', 'Docker', 'PostgreSQL', 'Cloudflare'].map((item) => (
                    <span 
                      key={item}
                      className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-neutral-300 group-hover:border-cyan-500/30 group-hover:text-cyan-200 transition-colors"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10 text-xs font-mono">
                <span className="text-cyan-400/90 text-[11px]">
                  Production Tooling
                </span>
                <span className="flex items-center gap-1.5 text-neutral-400 group-hover:text-white transition-colors">
                  Inspect stack <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                </span>
              </div>
            </Link>

            {/* =================================================================
                CARD 3 (7 cols): DIRECT COLLABORATION (Editorial's signature card)
                Orbital Broadcast Beacon crazy icon + serif quote + dashed action pill
               ================================================================= */}
            <Link 
              href="/contact"
              className="group md:col-span-12 lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-[#0c1017]/80 border border-white/10 hover:border-rose-500/40 hover:bg-[#121622]/90 transition-all duration-500 flex flex-col justify-between min-h-[260px] sm:min-h-[290px] relative overflow-hidden backdrop-blur-md shadow-2xl"
            >
              {/* Rose/Pink ambient glow */}
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                    <span className="size-1.5 rounded-full bg-rose-400" />
                    Collaboration
                  </span>
                  <p className="text-xs text-neutral-400 font-mono mt-1">
                    Direct Partnership
                  </p>
                </div>

                {/* Crazy Icon 3: Orbital Quantum Beacon */}
                <div className="relative size-12 sm:size-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.25)] group-hover:shadow-[0_0_35px_rgba(244,63,94,0.5)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 flex-shrink-0">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-rose-300">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="animate-spin" style={{ animationDuration: '10s' }} />
                    <circle cx="12" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.85" />
                    <circle cx="12" cy="12" r="2.5" fill="#f43f5e" />
                    <path d="M12 3V6M12 18V21M3 12H6M18 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="absolute -top-1 -right-1 size-2 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
                </div>
              </div>

              <div className="my-4 relative z-10 space-y-2">
                <p className="font-serif italic text-2xl sm:text-3xl text-white tracking-tight group-hover:text-rose-200 transition-colors">
                  &ldquo;Open communication, async updates, zero surprises&rdquo;
                </p>
                <p className="text-xs sm:text-sm text-neutral-400 font-light max-w-lg leading-relaxed">
                  Available for engineering roles, contract full-stack architecture, and mission-critical builds.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10 text-xs font-mono">
                {/* Live green beacon status */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  Ready to ship &amp; accept new projects
                </div>

                {/* Editorial's signature floating dashed rounded-2xl action button */}
                <div className="flex size-10 items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 group-hover:bg-rose-500/20 group-hover:border-rose-500/40 group-hover:-translate-y-1 transition-all">
                  <ArrowRight size={18} className="text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>

            {/* =================================================================
                CARD 4 (5 cols): VISITOR LEDGER / GUESTBOOK
                Neon Wax Seal crazy icon + tilted postcard SVG shapes + dot grid
               ================================================================= */}
            <Link 
              href="/guestbook"
              className="group md:col-span-12 lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-[#0c1017]/80 border border-white/10 hover:border-violet-500/40 hover:bg-[#121622]/90 transition-all duration-500 flex flex-col justify-between min-h-[260px] sm:min-h-[290px] relative overflow-hidden backdrop-blur-md shadow-2xl"
            >
              {/* Radial dot grid pattern (Editorial's signature) */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,#525252_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

              {/* Tilted layered postcard vector illustration in background */}
              <svg 
                className="absolute -top-3 -right-4 w-44 opacity-25 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none drop-shadow-2xl" 
                viewBox="0 0 170 140" 
                fill="none"
              >
                <g transform="rotate(-12 85 70)">
                  <rect x="15" y="15" width="130" height="90" rx="8" className="fill-[#141824] stroke-white/10" strokeWidth="1.5" />
                  <rect x="25" y="25" width="40" height="30" rx="4" fill="#ec4899" opacity="0.8" />
                  <circle cx="105" cy="40" r="16" fill="#8b5cf6" opacity="0.75" />
                  <path d="M25 70H125M25 80H90" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
                </g>
              </svg>

              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-violet-400 font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20">
                    <span className="size-1.5 rounded-full bg-violet-400" />
                    Guestbook
                  </span>
                  <p className="text-xs text-neutral-400 font-mono mt-1">
                    Visitor Ledger
                  </p>
                </div>

                {/* Crazy Icon 4: Neon Wax Seal & Quill */}
                <div className="relative size-12 sm:size-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-[0_0_25px_rgba(139,92,246,0.25)] group-hover:shadow-[0_0_35px_rgba(139,92,246,0.5)] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 flex-shrink-0">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-violet-300">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M19 3L11 11L9 15L13 13L21 5L19 3Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                    <path d="M7 17C8.5 15.5 10 16 11 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="absolute -top-1 -right-1 size-2 rounded-full bg-violet-400 shadow-[0_0_8px_#8b5cf6]" />
                </div>
              </div>

              <div className="my-4 relative z-10">
                <h3 className="text-xl sm:text-2xl font-serif text-white group-hover:text-violet-200 transition-colors">
                  Let me know you were here
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-light mt-1.5 leading-relaxed max-w-sm">
                  Sign the guestbook, leave a note, or stamp your endorsement on my site ledger.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10 text-xs font-mono">
                <span className="text-violet-400/90 text-[11px]">
                  Digital Signatures
                </span>
                <span className="flex items-center gap-1.5 text-neutral-400 group-hover:text-white transition-colors">
                  Sign ledger <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                </span>
              </div>
            </Link>

          </div>
        </section>

      </div>

    </div>
  );
}
