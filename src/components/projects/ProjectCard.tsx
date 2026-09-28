'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, ArrowRight } from 'lucide-react';
import { CaseStudy } from '@/data/projects';
import TechBadge from '@/components/ui/TechBadge';

interface ProjectCardProps {
  project: CaseStudy;
  displayIndex: number;
  column?: 'left' | 'right';
}

export default function ProjectCard({ project, displayIndex, column }: ProjectCardProps) {
  const indexNumber = String(displayIndex + 1).padStart(2, '0');
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
    <article className="group relative flex flex-col space-y-3">
      
      {/* 1. Header Bar Above Card */}
      <div className="flex items-start justify-between gap-4 px-1">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-semibold text-neutral-400 tracking-wider">
              {indexNumber}
            </span>
            <div className="h-px w-8 bg-neutral-700" />
            <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
              {project.category}
            </span>
          </div>

          <Link href={`/projects/${project.slug}`} className="block">
            <h2 className="font-serif sm:font-sans font-bold text-3xl sm:text-4xl text-white tracking-tight hover:text-white/80 transition-colors leading-tight">
              {project.title}
            </h2>
          </Link>
        </div>

        {/* Date formatted as Month Year (e.g. Feb 2026) */}
        <span className="shrink-0 rounded-full px-3.5 py-1 font-mono text-[10px] sm:text-[11px] bg-[#121316] border border-white/10 text-neutral-400 font-medium tracking-wider">
          {project.year}
        </span>
      </div>

      {/* 2. Architectural Horizontal Line spanning full card width and connecting to the center vertical axis */}
      <div className="relative w-full py-1 pointer-events-none">
        <div className="relative w-full h-px bg-white/[0.08]">
          {/* Column 1 (Left): Extends 32px to the right to meet the center line */}
          {column === 'left' && (
            <div className="hidden lg:block absolute right-0 top-0 w-[32px] translate-x-full h-px bg-white/[0.08]">
              {/* Junction Circle Node right on the center vertical line */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-2 rounded-full border border-white/40 bg-[#0c0e14] ring-4 ring-[#08090a]" />
            </div>
          )}

          {/* Column 2 (Right): Extends 32px to the left to meet the center line */}
          {column === 'right' && (
            <div className="hidden lg:block absolute left-0 top-0 w-[32px] -translate-x-full h-px bg-white/[0.08]">
              {/* Junction Circle Node right on the center vertical line */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 size-2 rounded-full border border-white/40 bg-[#0c0e14] ring-4 ring-[#08090a]" />
            </div>
          )}
        </div>
      </div>

      {/* 3. Interactive Card Slab with Dual-Mockup Reveal & Cursor-Following Circle Badge (strictly inside image) */}
      <Link
        ref={cardRef}
        aria-label={`View Details of ${project.title}`}
        href={`/projects/${project.slug}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="group/card relative block aspect-[16/11] sm:aspect-[16/10] w-full cursor-pointer overflow-hidden rounded-[26px] sm:rounded-[30px] p-1.5 sm:p-2 bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition-all duration-300 ease-in-out hover:-translate-y-2 shadow-2xl"
      >
        <div className="relative flex size-full flex-col justify-between overflow-hidden rounded-[20px] sm:rounded-[24px] bg-black">
          
          {/* Full-Bleed Radiant Gradient Canvas */}
          <div 
            aria-hidden="true" 
            className="absolute inset-0 z-0 transition-all duration-500 ease-in-out group-hover/card:scale-105 group-hover/card:brightness-110"
            style={{
              background: project.gradient
            }}
          />

          {/* Subtle Contrast Overlay for Typography */}
          <div className="absolute inset-0 z-1 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

          {/* Top Row: Tagline + Right Arrow */}
          <div className="z-10 flex w-full flex-row items-start justify-between gap-6 px-5 py-4 sm:px-6 sm:py-5">
            <h3 className="text-xs sm:text-sm md:text-base font-medium text-white/95 leading-snug max-w-[85%]">
              {project.tagline}
            </h3>
            <ArrowRight 
              className="size-5 shrink-0 text-white/90 transition-transform duration-200 ease-out group-hover/card:translate-x-1.5" 
            />
          </div>

          {/* Floating Circle Badge matching user screenshot */}
          <div 
            aria-hidden="true"
            className={`absolute z-30 pointer-events-none select-none transition-all duration-150 ${
              isHoveringImage ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              transform: 'translate(-50%, -50%)',
              transition: 'transform 0.06s ease-out, opacity 0.15s ease-out, scale 0.15s ease-out',
            }}
          >
            <div className="relative size-[86px] sm:size-[92px] flex items-center justify-center">
              
              {/* 1. Outer Fine Dotted Ring (Slightly larger outline) */}
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
                      id={`circle-path-${project.id}`} 
                      d="M 50, 50 m -33.5, 0 a 33.5,33.5 0 1,1 67,0 a 33.5,33.5 0 1,1 -67,0" 
                    />
                  </defs>
                  <text className="font-sans text-[8.8px] sm:text-[9.2px] font-black uppercase tracking-[0.24em] fill-black">
                    <textPath href={`#circle-path-${project.id}`} startOffset="0%">
                      DISCOVER • OPEN • EXPLORE •
                    </textPath>
                  </text>
                </svg>

                {/* 3. Solid Pure White Center Circle (Upright Eye Core) */}
                <div className="relative z-10 size-9 sm:size-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center border border-black/[0.08]">
                  <Eye className="size-4.5 sm:size-5 text-black" strokeWidth={2.4} />
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
                  priority={displayIndex < 2}
                />
              </div>

              {/* Screen 2 (Secondary Mockup / Slides up and in front on hover) */}
              {project.hoverImage && (
                <div 
                  className="absolute inset-0 w-full h-full rounded-t-xl sm:rounded-t-2xl border-t-2 border-x-2 border-white/60 shadow-[0_30px_70px_rgba(0,0,0,0.85)] overflow-hidden bg-black/95 z-20 transition-all duration-500 ease-out opacity-0 translate-y-8 scale-90 pointer-events-none group-hover/card:opacity-100 group-hover/card:translate-y-0 group-hover/card:translate-x-4 sm:group-hover/card:translate-x-7 group-hover/card:rotate-2 group-hover/card:scale-100"
                >
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

      {/* 4. Underneath the Card: Stylized Pill Tech Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-1 px-1">
        {project.techStack.map((tech) => (
          <TechBadge key={tech} name={tech} />
        ))}
      </div>
    </article>
  );
}
