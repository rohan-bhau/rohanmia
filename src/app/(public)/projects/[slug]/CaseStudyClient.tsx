"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Check,
  Copy,
  ArrowUpRight,
  Terminal,
  Layers,
  ChevronRight,
  RotateCw,
  X,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { useThemeAccent } from "@/components/theme/ThemeProvider";
import { CaseStudy } from "@/data/projects";
import TechBadge from "@/components/ui/TechBadge";
import CodeBlock from "@/components/ui/CodeBlock";

interface CaseStudyClientProps {
  project: CaseStudy;
  prevProject: CaseStudy | null;
  nextProject: CaseStudy | null;
}

export default function CaseStudyClient({
  project,
  prevProject,
  nextProject,
}: CaseStudyClientProps) {
  const { currentTheme } = useThemeAccent();
  const [copied, setCopied] = useState(false);

  // GitHub Multi-Repo Modal State
  const [githubModalOpen, setGithubModalOpen] = useState(false);
  const [nextBtnHovered, setNextBtnHovered] = useState(false);

  // Dual Image Interactive Showcase State
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const dragStartX = useRef<number | null>(null);

  const images = [
    project.previewImage,
    project.hoverImage || project.previewImage,
  ];

  const cardAccent = project.accentColor || currentTheme.primary;
  const displayUrl = project.liveUrl
    ? project.liveUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : `${project.slug}.vercel.app`;

  const hasBothRepos = Boolean(
    (project.clientUrl || project.githubUrl) && project.serverUrl,
  );

  const copyUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setGithubModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-switch between image 1 and image 2 every 2.6 seconds (pauses on hover or dragging)
  useEffect(() => {
    if (!project.hoverImage || isPaused || isDragging) return;

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev === 0 ? 1 : 0));
    }, 2600);

    return () => clearInterval(interval);
  }, [project.hoverImage, isPaused, isDragging]);

  // Touch and drag swipe handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    dragStartX.current = clientX;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || dragStartX.current === null) return;
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = clientX - dragStartX.current;
    setDragOffset(Math.max(-120, Math.min(120, diff)));
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    if (Math.abs(dragOffset) > 40) {
      setActiveImageIndex((prev) => (prev === 0 ? 1 : 0));
    }
    setIsDragging(false);
    setDragOffset(0);
    dragStartX.current = null;
  };

  const defaultDirectoryTree = `apps/
  web/          # Next.js 16 App Router & Client Views
  api/          # Domain Services & Business Logic
packages/
  shared-types/ # Shared TypeScript Contracts
  validators/   # Shared Zod Schemas
  ui/           # Design System & Tailwind Tokens`;

  const defaultCodeSnippet = {
    title: "Shared Zod Validation Contract",
    filename: "packages/shared-types/src/index.ts",
    code: `export const schema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  status: z.enum(['ACTIVE', 'PENDING', 'COMPLETED']),
  metadata: z.record(z.string(), z.unknown()),
});

export type SchemaType = z.infer<typeof schema>;`,
  };

  const codeSnippetToDisplay = project.codeSnippet || defaultCodeSnippet;
  const directoryTreeToDisplay = project.directoryTree || defaultDirectoryTree;

  return (
    <article className="pt-28 md:pt-36 pb-16 min-h-screen relative overflow-x-clip">
      {/* Subtle Horizon Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 max-w-6xl h-px opacity-30"
          style={{
            background: `linear-gradient(90deg, transparent, ${cardAccent}, transparent)`,
          }}
        />
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[380px] opacity-15 blur-[150px]"
          style={{
            background: `radial-gradient(50% 50% at 50% 25%, ${cardAccent} 0%, transparent 80%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#08090a]" />
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 relative z-10 space-y-16">
        {/* 1. Header & Breadcrumbs */}
        <header className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 font-mono text-xs text-neutral-400"
            >
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span className="text-neutral-600">/</span>
              <Link
                href="/projects"
                className="hover:text-white transition-colors"
              >
                Work
              </Link>
              <span className="text-neutral-600">/</span>
              <span className="text-neutral-200 font-semibold">
                {project.title}
              </span>
            </nav>

            <button
              onClick={copyUrl}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-neutral-400 hover:text-white transition-all cursor-pointer flex-shrink-0"
            >
              {copied ? (
                <Check size={12} className="text-emerald-400" />
              ) : (
                <Copy size={12} />
              )}
              <span>{copied ? "Copied URL" : "Copy URL"}</span>
            </button>
          </div>

          <div className="space-y-3 pt-2">
            <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl text-white tracking-normal font-normal leading-tight">
              {project.title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-3xl font-light leading-relaxed">
              {project.tagline}
            </p>
          </div>
        </header>

        {/* 2. Structured Metadata Grid (Left takes exact needed width, Tech Stack takes remaining space) */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 rounded-2xl bg-[#0c0e14]/70 border border-white/[0.08] p-6 backdrop-blur-xl">
          {/* Left Metadata Section: 2 Columns (Col 1: Type, Built, Visit | Col 2: Role, Updated, Source) */}
          <div className="shrink-0 grid grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-5 border-b md:border-b-0 md:border-r border-white/[0.08] pb-6 md:pb-0 md:pr-8 lg:pr-10">
            {/* Column 1: Type -> Built -> Visit */}
            <div className="space-y-5">
              <div>
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">
                  Type
                </span>
                <span className="font-mono text-xs sm:text-sm text-neutral-200 font-medium">
                  {project.category}
                </span>
              </div>

              <div>
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">
                  Built
                </span>
                <span className="font-mono text-xs sm:text-sm text-neutral-200 font-medium">
                  {project.year}
                </span>
              </div>

              <div>
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">
                  Visit
                </span>
                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm transition-all group hover:underline whitespace-nowrap"
                    style={{ color: currentTheme.primary }}
                  >
                    <span
                      className="size-1.5 rounded-full shrink-0 animate-pulse"
                      style={{ backgroundColor: currentTheme.primary }}
                    />
                    <span>{displayUrl}</span>
                    <ArrowUpRight
                      size={11}
                      className="shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                  </a>
                ) : (
                  <span className="font-mono text-xs text-neutral-400">
                    Enterprise
                  </span>
                )}
              </div>
            </div>

            {/* Column 2: Role -> Updated -> Source */}
            <div className="space-y-5">
              <div>
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">
                  Role
                </span>
                <span className="font-mono text-xs sm:text-sm text-neutral-200 font-medium">
                  {project.role}
                </span>
              </div>

              <div>
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">
                  Updated
                </span>
                <span className="font-mono text-xs sm:text-sm text-neutral-200 font-medium">
                  {project.year}
                </span>
              </div>

              <div>
                <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">
                  Source
                </span>

                {project.clientUrl || project.githubUrl || project.serverUrl ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (hasBothRepos) {
                        setGithubModalOpen(true);
                      } else {
                        window.open(
                          project.clientUrl ||
                            project.githubUrl ||
                            project.serverUrl,
                          "_blank",
                        );
                      }
                    }}
                    className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm transition-all group hover:underline cursor-pointer whitespace-nowrap"
                    style={{ color: currentTheme.primary }}
                  >
                    <FaGithub
                      size={13}
                      className="shrink-0"
                      style={{ color: currentTheme.primary }}
                    />
                    <span>GitHub</span>
                    <ArrowUpRight
                      size={11}
                      className="shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    />
                  </button>
                ) : (
                  <span className="font-mono text-xs text-neutral-500">
                    Proprietary
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Box: Tech Stack takes all remaining space */}
          <div className="flex-1 min-w-0 flex flex-col justify-start space-y-3">
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">
              Tech Stack
            </span>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <TechBadge key={tech} name={tech} />
              ))}
            </div>
          </div>
        </div>

        {/* 3. Grand Product Hero Showcase Slab: 3D Tilted Dual-Image Deck (Tactile Drag & Swap) */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            handleDragEnd();
          }}
          className="rounded-[28px] sm:rounded-[32px] bg-white/[0.03] border border-white/[0.08] p-3 sm:p-5 overflow-hidden shadow-2xl relative select-none"
        >
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-[20px] sm:rounded-[24px] overflow-hidden bg-black flex flex-col justify-between">
            {/* Radiant Ambient Canvas */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-0 opacity-90 transition-all duration-700"
              style={{ background: project.gradient }}
            />
            <div className="absolute inset-0 z-1 bg-gradient-to-b from-black/40 via-transparent to-black/85 pointer-events-none" />

            {/* Clean Top Bar: Only Sleek Launch Button if Available (No Cluttering Status Text) */}
            <div className="z-30 flex items-center justify-end px-5 py-4 sm:px-7 sm:py-5">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium text-black bg-white hover:bg-neutral-100 shadow-xl transition-all"
                >
                  <span>Launch Live</span>
                  <ArrowUpRight size={12} />
                </a>
              )}
            </div>

            {/* Tactile Drag Arena with 3D Card Tilting (Matching ProjectCard Hover Aesthetics) */}
            <div
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              className={`absolute top-12 sm:top-14 right-4 left-4 sm:right-12 sm:left-12 bottom-0 z-20 flex flex-col items-center select-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              <div className="relative w-full h-full flex items-end justify-center perspective-[1200px]">
                {/* Card 0: Main Thumbnail Image */}
                <div
                  className={`absolute bottom-0 w-[92%] sm:w-[88%] h-[92%] rounded-t-xl sm:rounded-t-2xl border-t-2 border-x-2 overflow-hidden bg-black/90 transition-all duration-500 ease-out pointer-events-none ${
                    activeImageIndex === 0
                      ? "z-20 rotate-1 sm:rotate-2 translate-x-3 sm:translate-x-6 translate-y-0 scale-100 opacity-100 border-white/50 shadow-[0_30px_70px_rgba(0,0,0,0.85)]"
                      : "z-10 -rotate-3 sm:-rotate-5 -translate-x-4 sm:-translate-x-8 translate-y-3 sm:translate-y-4 scale-[0.95] opacity-75 border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
                  }`}
                  style={{
                    transform: isDragging
                      ? activeImageIndex === 0
                        ? `translateX(${24 + dragOffset * 0.4}px) rotate(2deg)`
                        : `translateX(${-32 + dragOffset * 0.4}px) translateY(16px) rotate(-5deg) scale(0.95)`
                      : undefined,
                  }}
                >
                  <Image
                    src={project.previewImage}
                    alt={project.title}
                    fill
                    priority
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    draggable={false}
                  />
                </div>

                {/* Card 1: Secondary System View (Visibly tilted underneath / behind initially) */}
                {project.hoverImage && (
                  <div
                    className={`absolute bottom-0 w-[92%] sm:w-[88%] h-[92%] rounded-t-xl sm:rounded-t-2xl border-t-2 border-x-2 overflow-hidden bg-black/95 transition-all duration-500 ease-out pointer-events-none ${
                      activeImageIndex === 1
                        ? "z-20 rotate-1 sm:rotate-2 translate-x-3 sm:translate-x-6 translate-y-0 scale-100 opacity-100 border-white/50 shadow-[0_30px_70px_rgba(0,0,0,0.85)]"
                        : "z-10 -rotate-3 sm:-rotate-5 -translate-x-4 sm:-translate-x-8 translate-y-3 sm:translate-y-4 scale-[0.95] opacity-75 border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.7)]"
                    }`}
                    style={{
                      transform: isDragging
                        ? activeImageIndex === 1
                          ? `translateX(${24 + dragOffset * 0.4}px) rotate(2deg)`
                          : `translateX(${-32 + dragOffset * 0.4}px) translateY(16px) rotate(-5deg) scale(0.95)`
                        : undefined,
                    }}
                  >
                    <Image
                      src={project.hoverImage}
                      alt={`${project.title} Secondary View`}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 1024px) 100vw, 1024px"
                      draggable={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Production Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {project.metrics.map((metric, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.06] space-y-1"
            >
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                {metric.label}
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                {metric.value}
              </div>
              {metric.description && (
                <p className="text-xs text-neutral-400/80 leading-relaxed pt-1">
                  {metric.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ============================================================== */}
        {/* ASYMMETRIC 2-COLUMN BLUEPRINT SECTION GRID (Exact Editorial) */}
        {/* ============================================================== */}

        {/* SECTION 01: Why I Built This */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-12 sm:py-16 border-t border-white/[0.08]">
          <div className="md:col-span-4 lg:col-span-3 md:sticky md:top-28 md:self-start space-y-1.5">
            <span className="font-mono text-xs text-neutral-400 font-semibold tracking-wider block">
              01
            </span>
            <h2 className="font-serif sm:font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Why I Built This
            </h2>
          </div>

          <div className="md:col-span-8 lg:col-span-9 space-y-5 md:pl-6 md:border-l border-white/[0.08]">
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              {project.whyIBuiltThis || project.overview}
            </p>

            <div className="p-5 rounded-2xl bg-[#0e1017] border border-white/[0.08] space-y-2">
              <span className="text-xs font-mono uppercase text-rose-400 font-bold block tracking-wider">
                The Core Bottleneck Faced:
              </span>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
                {project.problem}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 02: How It Works */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-12 sm:py-16 border-t border-white/[0.08]">
          <div className="md:col-span-4 lg:col-span-3 md:sticky md:top-28 md:self-start space-y-1.5">
            <span className="font-mono text-xs text-neutral-400 font-semibold tracking-wider block">
              02
            </span>
            <h2 className="font-serif sm:font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight">
              How It Works
            </h2>
          </div>

          <div className="md:col-span-8 lg:col-span-9 space-y-6 md:pl-6 md:border-l border-white/[0.08]">
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              {project.solution}
            </p>

            {/* Architecture Directory Tree Terminal Box */}
            <CodeBlock
              code={directoryTreeToDisplay}
              filename="workspace-architecture-tree"
              language="tree"
              isTree={true}
            />

            {/* Layered System Breakdown Cards */}
            {project.systemBreakdown && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {project.systemBreakdown.map((layer, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#0e1017] border border-white/[0.06] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">
                        {layer.layer}
                      </h3>
                      <span className="text-[10px] font-mono text-neutral-500">
                        Layer 0{idx + 1}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed font-light">
                      {layer.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {layer.technologies.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-neutral-400 border border-white/[0.06]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 03: Key Decisions */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-12 sm:py-16 border-t border-white/[0.08]">
          <div className="md:col-span-4 lg:col-span-3 md:sticky md:top-28 md:self-start space-y-1.5">
            <span className="font-mono text-xs text-neutral-400 font-semibold tracking-wider block">
              03
            </span>
            <h2 className="font-serif sm:font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Key Decisions
            </h2>
          </div>

          <div className="md:col-span-8 lg:col-span-9 space-y-6 md:pl-6 md:border-l border-white/[0.08]">
            {project.technicalDecisions.map((dec, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {dec.decision}
                </h3>
                <p className="text-sm text-neutral-300 font-light leading-relaxed">
                  {dec.rationale}
                </p>
                <p className="text-xs font-mono text-neutral-500">
                  <strong className="text-neutral-400">Tradeoff: </strong>
                  {dec.tradeoff}
                </p>
              </div>
            ))}

            {/* Embedded Code Snippet Box (Shared Zod / Type Contracts) */}
            <div className="mt-4">
              <CodeBlock
                code={codeSnippetToDisplay.code}
                filename={codeSnippetToDisplay.filename}
                language="typescript"
              />
            </div>
          </div>
        </section>

        {/* SECTION 04: Backend Architecture */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-12 sm:py-16 border-t border-white/[0.08]">
          <div className="md:col-span-4 lg:col-span-3 md:sticky md:top-28 md:self-start space-y-1.5">
            <span className="font-mono text-xs text-neutral-400 font-semibold tracking-wider block">
              04
            </span>
            <h2 className="font-serif sm:font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Backend Architecture
            </h2>
          </div>

          <div className="md:col-span-8 lg:col-span-9 space-y-6 md:pl-6 md:border-l border-white/[0.08]">
            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              {project.backendArchitecture?.overview ||
                "The backend is organized by explicit domain modules rather than technical layers. Each module encapsulates its controllers, atomic query services, and validation schemas, ensuring horizontal scalability and zero data collision."}
            </p>

            {project.backendArchitecture?.codeSnippet && (
              <CodeBlock
                code={project.backendArchitecture.codeSnippet.code}
                filename={project.backendArchitecture.codeSnippet.filename}
                language="typescript"
              />
            )}
          </div>
        </section>

        {/* SECTION 05: Challenges Overcome (Status Badge Alert Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-12 sm:py-16 border-t border-white/[0.08]">
          <div className="md:col-span-4 lg:col-span-3 md:sticky md:top-28 md:self-start space-y-1.5">
            <span className="font-mono text-xs text-neutral-400 font-semibold tracking-wider block">
              05
            </span>
            <h2 className="font-serif sm:font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Challenges
            </h2>
          </div>

          <div className="md:col-span-8 lg:col-span-9 space-y-4 md:pl-6 md:border-l border-white/[0.08]">
            {project.challenges.map((c, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-[#0e1017] border border-white/[0.08] space-y-3"
              >
                {/* Status Badge Header */}
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {c.title}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
                  <strong className="text-neutral-200 font-medium">
                    Symptom:{" "}
                  </strong>
                  {c.description}
                </p>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1 font-mono text-xs">
                  <p className="text-neutral-200">
                    <strong className="text-emerald-400 uppercase text-[10px] tracking-wider">
                      Engineered Fix:{" "}
                    </strong>
                    {c.resolution}
                  </p>
                  <p className="text-neutral-500 pt-0.5">
                    <strong>Impact: </strong>
                    {c.impact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 06: What I Learned */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-12 sm:py-16 border-t border-white/[0.08]">
          <div className="md:col-span-4 lg:col-span-3 md:sticky md:top-28 md:self-start space-y-1.5">
            <span className="font-mono text-xs text-neutral-400 font-semibold tracking-wider block">
              06
            </span>
            <h2 className="font-serif sm:font-sans font-bold text-2xl sm:text-3xl text-white tracking-tight">
              What I Learned
            </h2>
          </div>

          <div className="md:col-span-8 lg:col-span-9 space-y-4 md:pl-6 md:border-l border-white/[0.08]">
            {(project.whatILearned && project.whatILearned.length > 0
              ? project.whatILearned
              : [
                  "Shared types are the highest-leverage decision in full-stack architecture.",
                  "Database conditional atomicity eliminates 99% of concurrency bugs.",
                  "Designing for error observability upfront saves days of production post-mortems.",
                ]
            ).map((lesson, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#0e1017] border border-white/[0.06] text-xs sm:text-sm text-neutral-300 leading-relaxed font-light"
              >
                <strong className="text-white font-medium block mb-1">
                  Takeaway 0{idx + 1}:
                </strong>
                {lesson}
              </div>
            ))}
          </div>
        </section>

        {/* 5. "UP NEXT" Minimalist Editorial Transition (Exact Match to User Reference) */}
        {nextProject && (
          <section className="py-20 sm:py-28 border-t border-white/[0.08] text-center space-y-6 sm:space-y-8 select-none">
            {/* Ornamental Flourish Header: —— ꕥ UP NEXT ꕥ —— */}
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <div className="w-16 sm:w-28 h-px bg-gradient-to-r from-transparent to-neutral-700" />

              {/* Left Filigree Curl */}
              <svg
                width="28"
                height="14"
                viewBox="0 0 28 14"
                fill="none"
                className="text-neutral-500"
              >
                <path
                  d="M1 7h15c3 0 4.5-5 7.5-5s2.5 1.5 2.5 3-1.5 3-3 3-5-2.5-5-5 1.5-4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>

              <span className="font-mono text-[11px] sm:text-xs tracking-[0.28em] uppercase text-neutral-400 font-medium">
                Up Next
              </span>

              {/* Right Mirrored Filigree Curl */}
              <svg
                width="28"
                height="14"
                viewBox="0 0 28 14"
                fill="none"
                className="text-neutral-500 scale-x-[-1]"
              >
                <path
                  d="M1 7h15c3 0 4.5-5 7.5-5s2.5 1.5 2.5 3-1.5 3-3 3-5-2.5-5-5 1.5-4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>

              <div className="w-16 sm:w-28 h-px bg-gradient-to-l from-transparent to-neutral-700" />
            </div>

            {/* Classical Editorial Serif Title */}
            <div className="space-y-4">
              <Link
                href={`/projects/${nextProject.slug}`}
                className="inline-block group"
              >
                <h2 className="font-serif text-5xl sm:text-7xl md:text-8xl font-normal text-white tracking-normal group-hover:text-neutral-200 transition-colors duration-300">
                  {nextProject.title}
                </h2>
              </Link>

              {/* Centered Descriptive Tagline */}
              <p className="text-sm sm:text-base md:text-lg text-neutral-400 font-light max-w-xl mx-auto leading-relaxed px-4">
                {nextProject.tagline}
              </p>
            </div>

            {/* Bottom Category Badge & Circular Arrow Button */}
            <div className="pt-2">
              <Link
                href={`/projects/${nextProject.slug}`}
                onMouseEnter={() => setNextBtnHovered(true)}
                onMouseLeave={() => setNextBtnHovered(false)}
                className="inline-flex items-center gap-3.5 group cursor-pointer"
              >
                <span
                  className="font-mono text-xs uppercase tracking-[0.24em] transition-colors duration-300"
                  style={{
                    color: nextBtnHovered ? currentTheme.primary : "#a3a3a3",
                  }}
                >
                  {nextProject.category}
                </span>

                <div
                  className={`size-10 sm:size-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
                    nextBtnHovered ? "scale-110" : "animate-pulse"
                  }`}
                  style={{
                    borderColor: nextBtnHovered
                      ? currentTheme.primary
                      : `${currentTheme.primary}70`,
                    backgroundColor: nextBtnHovered
                      ? `${currentTheme.primary}20`
                      : "rgba(255, 255, 255, 0.03)",
                    boxShadow: nextBtnHovered
                      ? `0 0 25px ${currentTheme.glow}`
                      : `0 0 14px ${currentTheme.glow}80`,
                    color: nextBtnHovered ? currentTheme.primary : "#e5e7eb",
                  }}
                >
                  <ArrowUpRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{
                      color: nextBtnHovered ? currentTheme.primary : "#e5e7eb",
                    }}
                  />
                </div>
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* 7. GitHub Multi-Repo Modal Dialog */}
      {githubModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setGithubModalOpen(false)}
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
                    backgroundColor: `${currentTheme.primary}15`,
                    borderColor: `${currentTheme.primary}40`,
                    color: currentTheme.primary,
                  }}
                >
                  <FaGithub size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Source Repositories
                  </h3>
                  <p className="font-mono text-xs text-neutral-400">
                    Select codebase to explore
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGithubModalOpen(false)}
                className="size-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Repositories List */}
            <div className="space-y-3">
              {/* Frontend / Client Repo */}
              {(project.clientUrl || project.githubUrl) && (
                <a
                  href={project.clientUrl || project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setGithubModalOpen(false)}
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
                          backgroundColor: `${currentTheme.primary}20`,
                          color: currentTheme.primary,
                        }}
                      >
                        Client App
                      </span>
                    </div>
                    <span className="font-mono text-xs text-neutral-400 block truncate max-w-[260px]">
                      {(project.clientUrl || project.githubUrl)?.replace(
                        "https://github.com/",
                        "",
                      )}
                    </span>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  />
                </a>
              )}

              {/* Backend / Server Repo */}
              {project.serverUrl && (
                <a
                  href={project.serverUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setGithubModalOpen(false)}
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
                          backgroundColor: `${currentTheme.primary}20`,
                          color: currentTheme.primary,
                        }}
                      >
                        API Service
                      </span>
                    </div>
                    <span className="font-mono text-xs text-neutral-400 block truncate max-w-[260px]">
                      {project.serverUrl.replace("https://github.com/", "")}
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
                onClick={() => setGithubModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-mono text-neutral-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
