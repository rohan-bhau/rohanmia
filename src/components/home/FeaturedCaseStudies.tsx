'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, ExternalLink, Eye, X, Pencil } from 'lucide-react';
import { FaGithub } from 'react-icons/fa6';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { FEATURED_CASE_STUDIES, CaseStudy } from '@/data/projects';
import TechBadge from '@/components/ui/TechBadge';

/**
 * ============================================================================
 * 📐 CONTENT LENGTH & WORD-COUNT CALIBRATION GUIDE (Viewport Fit Budget)
 * ============================================================================
 * Standard Screen Height: ~720px - 900px (Laptop / Desktop)
 * Available Sticky Content Height: ~450px - 520px (Sticky offset: top-28 / 112px)
 * 
 * 1. PROJECT TITLE:
 *    - Ideal Length: 1 - 3 words (e.g. "Reserva", "Keen-Keeper", "Qurbaniya")
 *    - Font Size: text-2xl sm:text-3xl font-bold (~36px height)
 *    - Behavior: Stays strictly FIXED at the top at all times.
 * 
 * 2. OVERVIEW / DESCRIPTION:
 *    - Ideal Word Count: 25 - 35 words (Maximum limit: 40 words)
 *    - Line Count: 2 - 3 lines (~48px - 54px height)
 *    - Example: "Reserva is a high-throughput facility reservation platform engineered 
 *      with Next.js, Node.js, and MongoDB. It addresses concurrency bottlenecks through 
 *      atomic locks, dynamic slot pricing, and interactive calendars." (~30 words)
 * 
 * 3. KEY FEATURE HIGHLIGHTS (✦ Sparkle Points):
 *    - Ideal Point Count: Exactly 4 points (slice(0, 4))
 *    - Title Word Count: 2 - 4 words per point
 *    - Description Word Count: 12 - 18 words per point
 *    - Total Words per Bullet: 15 - 22 words (max 2 lines each, ~32px per bullet)
 *    - Total 4 Bullets Height: ~135px - 150px
 *    - Example: "✦ Atomic Reservation Scheduler: Guarantees a timeslot is only 
 *      claimed by one user at a time with instant lock guards." (~18 words)
 * 
 * 4. TECH STACK BADGES:
 *    - Ideal Badge Count: 8 - 10 badges
 *    - Layout: Arranged in 2 neat rows (size="sm", ~56px height)
 * 
 * Total Visual Content Height: ~360px - 400px
 * 
 * 🎯 DYNAMIC SCROLL BEHAVIOR:
 * - CASE A (Content fits on screen): Right side does NOT scroll at all.
 *   Website scroll immediately advances the left-side project images.
 * - CASE B (Content extends below fold by e.g. 1 line / 30px):
 *   Website scroll first smoothly brings that exact overflow into view while
 *   the title stays fixed. Once all content is visible, right side STOPS scrolling,
 *   and continuing to scroll advances the left image to the next project!
 * ============================================================================
 */

/**
 * FeaturedProjectCard
 * Left-side interactive card featuring radiant gradient canvas,
 * tagline with directional arrow, dual-screen mockup on hover (identical to ProjectCard.tsx),
 * and the signature cursor-following circular exploration badge.
 */
function FeaturedProjectCard({
  project,
  index,
  isActive,
}: {
  project: CaseStudy;
  index: number;
  isActive: boolean;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringImage, setIsHoveringImage] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    setIsHoveringImage(true);
  };

  const handleMouseLeave = () => {
    setIsHoveringImage(false);
  };

  return (
    <Link
      ref={cardRef}
      href={`/projects/${project.slug}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group/card relative block aspect-[16/11] sm:aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-[26px] sm:rounded-[32px] p-1.5 sm:p-2 bg-white/[0.04] border transition-all duration-300 ease-out shadow-2xl ${
        isActive
          ? 'border-white/30 ring-1 ring-white/10'
          : 'border-white/[0.08] hover:border-white/20'
      }`}
    >
      <div className="relative flex size-full flex-col justify-between overflow-hidden rounded-[20px] sm:rounded-[26px] bg-black">
        {/* Full-Bleed Radiant Gradient Canvas */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 transition-all duration-500 ease-in-out group-hover/card:scale-105 group-hover/card:brightness-110"
          style={{
            background: project.gradient,
          }}
        />

        {/* Subtle Contrast Overlay for Typography */}
        <div className="absolute inset-0 z-1 bg-gradient-to-b from-black/35 via-transparent to-black/60 pointer-events-none" />

        {/* Top Row: Tagline + Right Arrow */}
        <div className="z-10 flex w-full flex-row items-start justify-between gap-4 px-5 py-4 sm:px-7 sm:py-5">
          <h3 className="text-xs sm:text-sm md:text-base font-medium text-white/95 leading-snug max-w-[85%]">
            {project.tagline}
          </h3>
          <ArrowRight className="size-5 shrink-0 text-white/90 transition-transform duration-200 ease-out group-hover/card:translate-x-1.5" />
        </div>

        {/* Floating Circle Badge matching ProjectCard.tsx */}
        <div
          aria-hidden="true"
          className={`absolute z-30 pointer-events-none select-none transition-all duration-150 ${
            isHoveringImage ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: 'translate(-50%, -50%)',
            transition:
              'transform 0.06s ease-out, opacity 0.15s ease-out, scale 0.15s ease-out',
          }}
        >
          <div className="relative size-[86px] sm:size-[92px] flex items-center justify-center">
            {/* 1. Outer Fine Dotted Ring */}
            <div className="absolute inset-0 rounded-full border border-dotted border-white/80" />

            {/* 2. Frosted Silver/Grey Annular Disc with Rotating Circular Text */}
            <div className="relative size-[76px] sm:size-[82px] rounded-full bg-[#d6dbe1]/92 backdrop-blur-md border border-white/40 shadow-[0_12px_36px_rgba(0,0,0,0.65)] flex items-center justify-center overflow-hidden">
              {/* Rotating Circular Text SVG */}
              <svg
                className="absolute inset-0 size-full animate-spin-slow pointer-events-none"
                viewBox="0 0 100 100"
              >
                <defs>
                  <path
                    id={`featured-circle-${project.id}`}
                    d="M 50, 50 m -33.5, 0 a 33.5,33.5 0 1,1 67,0 a 33.5,33.5 0 1,1 -67,0"
                  />
                </defs>
                <text className="font-sans text-[8.8px] sm:text-[9.2px] font-black uppercase tracking-[0.24em] fill-black">
                  <textPath
                    href={`#featured-circle-${project.id}`}
                    startOffset="0%"
                  >
                    DISCOVER • OPEN • EXPLORE •
                  </textPath>
                </text>
              </svg>

              {/* 3. Solid Pure White Center Circle (Upright Eye Core) */}
              <div className="relative z-10 size-9 sm:size-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center border border-black/[0.08]">
                <Eye
                  className="size-4.5 sm:size-5 text-black"
                  strokeWidth={2.4}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Screenshot Platform Area: Dual-Screen Mockup on Hover */}
        <div className="absolute top-14 sm:top-18 md:top-20 right-3.5 left-3.5 sm:right-6 sm:left-6 bottom-0 z-10 flex flex-col items-center">
          <div className="relative w-full h-full flex items-end justify-center">
            {/* Screen 1 (Default Thumbnail / Tilts back to the left on hover) */}
            <div
              className={`w-full h-full rounded-t-xl sm:rounded-t-2xl border-t-2 border-x-2 border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.65)] overflow-hidden bg-black/90 relative transition-all duration-500 ease-out ${
                project.hoverImage
                  ? 'group-hover/card:-rotate-6 group-hover/card:-translate-x-6 sm:group-hover/card:-translate-x-8 group-hover/card:scale-95 group-hover/card:opacity-85'
                  : 'group-hover/card:scale-[1.02]'
              }`}
            >
              <Image
                src={project.previewImage}
                alt={project.title}
                fill
                className="object-cover object-top transition-transform duration-700 group-hover/card:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={index < 2}
              />
            </div>

            {/* Screen 2 (Secondary Mockup / Slides up and in front on hover) */}
            {project.hoverImage && (
              <div className="absolute inset-0 w-full h-full rounded-t-xl sm:rounded-t-2xl border-t-2 border-x-2 border-white/60 shadow-[0_30px_70px_rgba(0,0,0,0.85)] overflow-hidden bg-black/95 z-20 transition-all duration-500 ease-out opacity-0 translate-y-8 scale-90 pointer-events-none group-hover/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:translate-x-4 sm:group-hover/card:translate-x-7 group-hover/card:rotate-2 group-hover/card:scale-100">
                <Image
                  src={project.hoverImage}
                  alt={`${project.title} Dashboard Preview`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedCaseStudies({ 
  initialProjects, 
  isAdmin = false 
}: { 
  initialProjects?: CaseStudy[]; 
  isAdmin?: boolean; 
}) {
  const { currentTheme } = useThemeAccent();
  const [projectsList, setProjectsList] = useState<CaseStudy[]>(
    initialProjects && initialProjects.length > 0 ? initialProjects : FEATURED_CASE_STUDIES
  );

  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) {
      setProjectsList(initialProjects);
    }
  }, [initialProjects]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [shiftY, setShiftY] = useState(0);
  const [githubModalProject, setGithubModalProject] = useState<CaseStudy | null>(null);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGithubModalProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchronize active project and handle overflow scroll-then-advance logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1024) return;
      const targetY = window.innerHeight * 0.42;

      let closestIndex = 0;
      let minDistance = Infinity;

      cardRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - targetY);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);

      // Handle right content overflow:
      // If content fits within viewport: shiftY = 0 (no right scroll needed, page scrolls left cards).
      // If content extends below fold: shiftY smoothly brings only that overflow into view, then locks!
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        const contentTop = contentRef.current.getBoundingClientRect().top;
        const availableHeight = window.innerHeight - contentTop - 24;
        const overflow = Math.max(0, contentHeight - availableHeight);

        if (overflow === 0) {
          setShiftY(0);
        } else {
          const activeCard = cardRefs.current[closestIndex];
          if (activeCard) {
            const rect = activeCard.getBoundingClientRect();
            const focusTop = window.innerHeight * 0.16; // reading focus line
            const distancePast = focusTop - rect.top;

            if (distancePast <= 0) {
              setShiftY(0);
            } else {
              // Smoothly scroll the overflow amount over 120px of scroll travel, then lock!
              const scrollTravel = Math.max(100, overflow * 2.2);
              const progress = Math.min(1, distancePast / scrollTravel);
              setShiftY(Math.round(progress * overflow));
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [activeIndex]);

  const activeProject = projectsList[activeIndex] || projectsList[0];
  const activeAccent = activeProject?.accentColor || currentTheme.primary;

  return (
    <section id="projects" className="py-20 sm:py-28 px-4 sm:px-6 relative">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header: CASE STUDIES on top, Curated work and Explore Button on the EXACT same line */}
        <div className="mb-14 sm:mb-20 space-y-2">
          <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 font-semibold">
            CASE STUDIES
          </p>
          <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-normal tracking-tight text-white">
              Curated{' '}
              <span
                className="font-serif italic font-normal text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`,
                }}
              >
                work
              </span>
            </h2>

            <div className="flex items-center gap-2.5">
              {isAdmin && (
                <Link
                  href="/control-room-internal/projects"
                  className="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.15] text-xs font-mono text-white transition-all shadow-sm"
                >
                  <Pencil size={13} style={{ color: currentTheme.primary }} />
                  <span>Edit Projects</span>
                </Link>
              )}
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-mono font-medium text-white transition-all hover:scale-105 active:scale-95 shadow-sm whitespace-nowrap cursor-pointer shrink-0"
              >
                <span>Explore All Archives</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Left Scrolling Cards + Right Sticky Synchronized Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-start">
          {/* Left Column: Stack of Scrolling Project Cards */}
          <div className="lg:col-span-7 space-y-16 sm:space-y-20 lg:space-y-28">
            {projectsList.map((project, index) => {
              const isCurrent = activeIndex === index;
              const indexNumber = String(index + 1).padStart(2, '0');

              return (
                <div
                  key={project.id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  className="space-y-3"
                >
                  {/* Mobile & Tablet Meta Header Above Card (< lg) */}
                  <div className="flex lg:hidden items-center justify-between gap-4 px-1 pb-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-neutral-400 tracking-wider">
                        {indexNumber}
                      </span>
                      <div className="h-px w-6 bg-neutral-700" />
                      <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-widest">
                        {project.category}
                      </span>
                    </div>

                    <span className="shrink-0 rounded-full px-3 py-0.5 font-mono text-[10px] bg-[#121316] border border-white/10 text-neutral-400 font-medium tracking-wider">
                      {project.year}
                    </span>
                  </div>

                  {/* Card with Radiant Canvas, Dual-Image Hover Reveal & Circular Hover Badge */}
                  <FeaturedProjectCard
                    project={project}
                    index={index}
                    isActive={isCurrent}
                  />

                  {/* Mobile & Tablet Action Row (< lg): Tech Stack + Action Buttons */}
                  <div className="block lg:hidden space-y-3 pt-1 px-1">
                    {/* Tech Stack Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {project.techStack.map((tech) => (
                        <TechBadge key={tech} name={tech} size="sm" />
                      ))}
                    </div>

                    {/* Action Buttons: Unified on 1 Single Line */}
                    <div className="flex items-center gap-2 pt-1 flex-nowrap overflow-x-auto no-scrollbar">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-medium text-white transition-all shadow-md active:scale-95 shrink-0 whitespace-nowrap"
                        style={{
                          backgroundColor:
                            project.accentColor || currentTheme.primary,
                        }}
                      >
                        <span>Case Study</span>
                        <ArrowUpRight size={13} />
                      </Link>

                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-[11px] sm:text-xs font-mono text-zinc-300 active:scale-95 shrink-0 whitespace-nowrap"
                        >
                          <ExternalLink size={12} />
                          <span>Live Platform</span>
                        </a>
                      )}

                      {(project.githubUrl || project.clientUrl || project.serverUrl) && (
                        <button
                          type="button"
                          onClick={() => setGithubModalProject(project)}
                          className="inline-flex items-center justify-center p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.1] text-zinc-300 hover:text-white transition-colors active:scale-95 cursor-pointer shrink-0"
                          title="View Source Repositories"
                          aria-label="View Source Repositories"
                        >
                          <FaGithub size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Synchronized Details Panel (Desktop Only >= lg)
              Title remains strictly fixed at top-28/top-32.
              If content fits screen: shiftY = 0 (no right scroll, left images scroll).
              If content has overflow (e.g. 1 line): shiftY brings only that line into view, then locks! */}
          <div className="hidden lg:block lg:col-span-5 sticky top-28 lg:top-32 self-start pl-2">
            <div className="space-y-4">
                {/* Title Row with Colored Dash - Strictly Fixed at Top */}
                <div className="flex items-center gap-3">
                  <span
                    className="w-5 h-[2.5px] rounded-full shrink-0"
                    style={{ backgroundColor: activeAccent }}
                  />
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {activeProject.title}
                  </h3>
                </div>

                {/* Details Container with Safe Shift:
                    Scrolls only the overflow amount if any line is below fold, then locks! */}
                <div className="relative overflow-hidden">
                  <div
                    ref={contentRef}
                    style={{
                      transform: `translateY(-${shiftY}px)`,
                      transition: 'transform 0.08s ease-out',
                    }}
                    className="space-y-4 pt-0.5"
                  >
                    {/* Project Overview */}
                    <p className="text-xs sm:text-[13px] text-zinc-400 font-light leading-relaxed">
                      {activeProject.overview}
                    </p>

                    {/* Key Features Bullet Points with Colored Sparkle ✦ */}
                    <div className="space-y-2.5 pt-0.5">
                      {activeProject.keyFeatures.slice(0, 4).map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs sm:text-[12.5px] text-zinc-300 leading-snug font-light"
                        >
                          <span
                            className="shrink-0 text-sm mt-0.5"
                            style={{ color: activeAccent }}
                          >
                            ✦
                          </span>
                          <span>
                            <strong className="text-white font-medium">
                              {feature.title}:{' '}
                            </strong>
                            <span className="text-zinc-300">
                              {feature.description}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Tech Stack Badges */}
                    <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {activeProject.techStack.map((tech) => (
                          <TechBadge key={tech} name={tech} size="sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* GitHub Multi-Repo Modal Dialog (identical to Case Study page modal) */}
      {githubModalProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setGithubModalProject(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-[#0c0e14] border border-white/15 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.85)] animate-in zoom-in-95 duration-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div
                  className="size-10 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: `${
                      githubModalProject.accentColor || currentTheme.primary
                    }15`,
                    borderColor: `${
                      githubModalProject.accentColor || currentTheme.primary
                    }40`,
                    color:
                      githubModalProject.accentColor || currentTheme.primary,
                  }}
                >
                  <FaGithub size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Source Repositories
                  </h3>
                  <p className="font-mono text-xs text-neutral-400">
                    {githubModalProject.title} Codebases
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGithubModalProject(null)}
                className="size-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Repositories List */}
            <div className="space-y-3">
              {/* Frontend / Client Repo */}
              {(githubModalProject.clientUrl ||
                githubModalProject.githubUrl) && (
                <a
                  href={
                    githubModalProject.clientUrl ||
                    githubModalProject.githubUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setGithubModalProject(null)}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/20 transition-all group cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                        Frontend / Client
                      </span>
                      <span
                        className="font-mono text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: `${
                            githubModalProject.accentColor ||
                            currentTheme.primary
                          }20`,
                          color:
                            githubModalProject.accentColor ||
                            currentTheme.primary,
                        }}
                      >
                        Client App
                      </span>
                    </div>
                    <span className="font-mono text-xs text-neutral-400 block truncate max-w-[260px]">
                      {(
                        githubModalProject.clientUrl ||
                        githubModalProject.githubUrl
                      )?.replace('https://github.com/', '')}
                    </span>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  />
                </a>
              )}

              {/* Backend / Server Repo */}
              {githubModalProject.serverUrl && (
                <a
                  href={githubModalProject.serverUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setGithubModalProject(null)}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/20 transition-all group cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                        Backend / Server API
                      </span>
                      <span
                        className="font-mono text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: `${
                            githubModalProject.accentColor ||
                            currentTheme.primary
                          }20`,
                          color:
                            githubModalProject.accentColor ||
                            currentTheme.primary,
                        }}
                      >
                        API Service
                      </span>
                    </div>
                    <span className="font-mono text-xs text-neutral-400 block truncate max-w-[260px]">
                      {githubModalProject.serverUrl.replace(
                        'https://github.com/',
                        ''
                      )}
                    </span>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  />
                </a>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setGithubModalProject(null)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-neutral-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
