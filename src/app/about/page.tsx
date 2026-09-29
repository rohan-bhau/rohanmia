'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Code2, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  Terminal,
  Calendar,
  Layers,
  Cpu
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { useBooking } from '@/components/booking/BookingContext';
import { 
  CAREER_EXPERIENCES, 
  ENGINEERING_PRINCIPLES, 
  EDUCATION_DATA, 
  CORE_COMPETENCIES 
} from '@/data/experience';

const PRINCIPLE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  ShieldCheck: ShieldCheck,
  Zap: Zap,
  Code2: Code2,
  Sparkles: Sparkles
};

export default function AboutPage() {
  const { currentTheme } = useThemeAccent();
  const { openBooking } = useBooking();

  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div 
        aria-hidden="true"
        className="absolute top-1/4 -left-48 w-96 h-96 rounded-full blur-[140px] opacity-15 pointer-events-none"
        style={{ backgroundColor: currentTheme.primary }}
      />
      <div 
        aria-hidden="true"
        className="absolute top-2/3 -right-48 w-96 h-96 rounded-full blur-[160px] opacity-15 pointer-events-none"
        style={{ backgroundColor: currentTheme.primary }}
      />

      <div className="container mx-auto max-w-6xl space-y-24 sm:space-y-32 relative z-10">
        
        {/* =========================================================================
            1. HERO BIOGRAPHY & IDENTITY SECTION
           ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Story, Title & Core Philosophy (Span 7) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <span 
                className="text-xs font-mono uppercase tracking-[0.25em] font-semibold flex items-center gap-2"
                style={{ color: currentTheme.primary }}
              >
                <Terminal size={14} />
                Engineering Profile // Biography
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-white tracking-tight leading-[1.12]">
                Architecting high-scale platforms with{' '}
                <span 
                  className="font-serif italic font-normal text-transparent bg-clip-text"
                  style={{
                    backgroundImage: `linear-gradient(135deg, #ffffff 20%, ${currentTheme.primary} 85%)`
                  }}
                >
                  mathematical rigor
                </span>{' '}
                &amp; creative precision.
              </h1>
            </div>

            {/* High-Conviction Narrative Copy */}
            <div className="space-y-4 text-sm sm:text-base text-zinc-300 font-light leading-relaxed">
              <p>
                I am <strong className="text-white font-medium">MD Rohan Mia</strong> (often known as Rohan Bhau) — a Senior Full Stack &amp; Creative Engineer based in Dhaka, Bangladesh. I partner with founders, venture-backed startups, and distributed engineering teams globally to architect and ship production software that scales effortlessly.
              </p>
              <p className="text-zinc-400">
                My engineering ethos lives at the intersection of <span className="text-zinc-200">fault-tolerant distributed architecture</span> and <span className="text-zinc-200">cinematic interaction design</span>. Having witnessed countless web apps crumble under rush-hour concurrency or feel sluggish due to bloated JavaScript bundles, I design software with atomic transactional guards, sub-100ms navigation pipelines, and strict type safety from the database layer to the browser DOM.
              </p>
            </div>

            {/* Key Quick Metrics & Identity Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/15 transition-all">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Experience</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-white block mt-1" style={{ color: currentTheme.primary }}>
                  4+ Years
                </span>
                <span className="text-[11px] text-zinc-400 font-light block mt-0.5">Continuous Production</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/15 transition-all">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Concurrency</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 block mt-1">
                  0.00%
                </span>
                <span className="text-[11px] text-zinc-400 font-light block mt-0.5">Booking Collision Rate</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/15 transition-all">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Latency</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-white block mt-1" style={{ color: currentTheme.primary }}>
                  &lt;100ms
                </span>
                <span className="text-[11px] text-zinc-400 font-light block mt-0.5">Edge Route Navigations</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/15 transition-all">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">Availability</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 block mt-1">
                  Open
                </span>
                <span className="text-[11px] text-zinc-400 font-light block mt-0.5">Global Remote Roles</span>
              </div>
            </div>

            {/* Practical Operations & Work Details */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0c0e14] border border-white/[0.09] space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400">
                <Globe size={14} style={{ color: currentTheme.primary }} />
                <span>Global Working Specs</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-zinc-400 block text-[11px] font-mono">Location &amp; Timezone</span>
                  <p className="text-white font-medium mt-0.5">Dhaka, Bangladesh (UTC+6)</p>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[11px] font-mono">Working Paradigm</span>
                  <p className="text-white font-medium mt-0.5">Async-First // Global Remote</p>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[11px] font-mono">Spoken Languages</span>
                  <p className="text-white font-medium mt-0.5">English (Fluent), Bengali, Hindi</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Portrait & Live Status Node (Span 5) */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-[2.25rem] p-2 bg-white/[0.04] border border-white/[0.1] shadow-2xl group">
              <div className="relative size-full rounded-[1.85rem] overflow-hidden bg-black/90">
                <Image
                  src="/hero-art.jpg"
                  alt="MD Rohan Mia (Rohan Bhau) - Senior Full Stack Engineer"
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 420px"
                  priority
                />
                
                {/* Subtle vignette gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                {/* Floating Real-Time Availability Pill */}
                <div className="absolute bottom-5 left-5 right-5 p-3.5 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/15 flex items-center justify-between shadow-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex size-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-white">Available for Technical Challenges</p>
                      <p className="text-[10px] font-mono text-zinc-400">Senior Full Stack / Technical Lead</p>
                    </div>
                  </div>
                  <button
                    onClick={openBooking}
                    className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/20 text-white transition-colors cursor-pointer"
                    title="Book a Discovery Call"
                    aria-label="Book a Discovery Call"
                  >
                    <Calendar size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Links & Social Artifacts */}
            <div className="flex items-center gap-2.5 pt-5">
              <a
                href="https://github.com/rohan-bhau"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-2 transition-all"
              >
                <FaGithub size={14} />
                <span>GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/rohan-bhau"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-2 transition-all"
              >
                <FaLinkedin size={14} />
                <span>LinkedIn</span>
              </a>
              <a
                href="https://x.com/rohan_bhau"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-2 transition-all"
              >
                <FaXTwitter size={14} />
                <span>Twitter</span>
              </a>
            </div>

          </div>

        </section>

        {/* =========================================================================
            2. CORE ENGINEERING PRINCIPLES (Aanand Madhav / Aayush Bharti Style)
           ========================================================================= */}
        <section className="space-y-12">
          <div className="text-left space-y-2">
            <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 font-semibold">
              ARCHITECTURAL FOUNDATIONS
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight text-white">
              Engineering{' '}
              <span
                className="font-serif italic font-normal text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(135deg, #ffffff, ${currentTheme.primary})`,
                }}
              >
                principles
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-light">
              Core technical disciplines applied to every system, database model, API endpoint, and client component I write.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ENGINEERING_PRINCIPLES.map((principle, idx) => {
              const IconComponent = PRINCIPLE_ICONS[principle.iconName] || ShieldCheck;

              return (
                <div
                  key={idx}
                  className="p-6 sm:p-7 rounded-[1.75rem] bg-[#0c0e14] border border-white/[0.09] hover:border-white/20 transition-all duration-300 relative overflow-hidden group shadow-xl"
                >
                  {/* Subtle Accent Glow on Hover */}
                  <div 
                    aria-hidden="true"
                    className="absolute -top-16 -right-16 size-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                    style={{ backgroundColor: currentTheme.primary }}
                  />

                  <div className="relative z-10 space-y-4">
                    <div 
                      className="size-11 rounded-2xl flex items-center justify-center border shadow-sm"
                      style={{
                        backgroundColor: `${currentTheme.primary}15`,
                        borderColor: `${currentTheme.primary}35`,
                        color: currentTheme.primary
                      }}
                    >
                      <IconComponent size={20} />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                        {principle.title}
                      </h3>
                      <p 
                        className="text-xs font-mono font-medium"
                        style={{ color: currentTheme.primary }}
                      >
                        {principle.tagline}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            3. CAREER JOURNEY & PROFESSIONAL TIMELINE
           ========================================================================= */}
        <section className="space-y-12">
          <div className="text-left space-y-2">
            <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 font-semibold">
              CAREER CHRONOLOGY
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight text-white">
              Professional{' '}
              <span
                className="font-serif italic font-normal text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(135deg, #ffffff, ${currentTheme.primary})`,
                }}
              >
                evolution
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-light">
              A chronological trajectory of systems architected, high-concurrency challenges resolved, and platforms scaled.
            </p>
          </div>

          <div className="relative space-y-8 sm:space-y-10">
            {CAREER_EXPERIENCES.map((exp, idx) => (
              <div 
                key={idx}
                className="p-6 sm:p-8 rounded-[2rem] bg-[#0c0e14] border border-white/[0.09] hover:border-white/20 transition-all duration-300 relative shadow-2xl space-y-5"
              >
                {/* Top Meta Row: Period, Role, Company, Location */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span 
                        className="text-xs font-mono font-bold px-3 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${currentTheme.primary}15`,
                          borderColor: `${currentTheme.primary}35`,
                          color: currentTheme.primary
                        }}
                      >
                        {exp.period}
                      </span>
                      {exp.isCurrent && (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-1">
                      {exp.role}
                    </h3>
                    <p className="text-xs font-mono text-zinc-400">
                      {exp.company} • {exp.location}
                    </p>
                  </div>
                </div>

                {/* Role Description */}
                <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                  {exp.description}
                </p>

                {/* Key Architectural Achievements with Sparkle ✦ */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-medium block">
                    Verified Technical Milestones:
                  </span>
                  <div className="space-y-2">
                    {exp.achievements.map((ach, aIdx) => (
                      <div key={aIdx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-zinc-300 font-light leading-relaxed">
                        <span className="shrink-0 text-sm mt-0.5" style={{ color: currentTheme.primary }}>✦</span>
                        <span>{ach}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack Chips */}
                <div className="pt-2 flex flex-wrap items-center gap-1.5">
                  {exp.skills.map((skill) => (
                    <span 
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] sm:text-[11px] font-mono text-zinc-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            4. ACADEMIC FOUNDATIONS & CORE COMPETENCY MATRIX
           ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Academic Credentials (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-left space-y-1.5">
              <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 font-semibold">
                ACADEMIC FOUNDATION
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight">
                Computer Science Degree
              </h2>
            </div>

            {EDUCATION_DATA.map((edu, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-[1.75rem] bg-[#0c0e14] border border-white/[0.09] space-y-4 shadow-xl"
              >
                <div className="size-10 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: `${currentTheme.primary}15`, borderColor: `${currentTheme.primary}35`, color: currentTheme.primary }}>
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{edu.degree}</h3>
                  <p className="text-xs font-mono text-zinc-400 mt-0.5">{edu.institution} • {edu.period}</p>
                </div>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Focus: <strong className="text-zinc-200">{edu.focus}</strong>
                </p>
                <div className="space-y-2 pt-1 border-t border-white/[0.08]">
                  {edu.highlights.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-2 text-xs text-zinc-400 font-light leading-relaxed">
                      <span className="shrink-0 text-sm mt-0.5" style={{ color: currentTheme.primary }}>✦</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Competencies Breakdown (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="text-left space-y-1.5">
              <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-neutral-400 font-semibold">
                SYSTEM COMPETENCIES
              </p>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight">
                Engineering Capabilities
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CORE_COMPETENCIES.map((comp, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl bg-[#0c0e14] border border-white/[0.09] space-y-2.5"
                >
                  <span 
                    className="text-xs font-mono uppercase tracking-widest font-bold block"
                    style={{ color: currentTheme.primary }}
                  >
                    {comp.category}
                  </span>
                  <ul className="space-y-1.5">
                    {comp.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-zinc-300 font-light">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* =========================================================================
            5. FINAL DISCOVERY CALL & CONTACT CALLOUT (No resume download button)
           ========================================================================= */}
        <section className="rounded-[2.25rem] bg-gradient-to-b from-[#10131b] to-[#090b10] border border-white/[0.12] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div 
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[140px] opacity-15 pointer-events-none"
            style={{ backgroundColor: currentTheme.primary }}
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
              <span 
                className="text-xs font-mono uppercase tracking-[0.25em] font-semibold block"
                style={{ color: currentTheme.primary }}
              >
                COLLABORATION &amp; ROLES
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight text-white">
                Ready to build something{' '}
                <span 
                  className="font-serif italic font-normal text-transparent bg-clip-text"
                  style={{
                    backgroundImage: `linear-gradient(135deg, #ffffff, ${currentTheme.primary})`,
                  }}
                >
                  extraordinary?
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
                Whether you need a Senior Full Stack Engineer for high-concurrency systems, an architectural consultant, or a technical lead, I am open to discussing high-impact projects.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={openBooking}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-mono font-medium text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl cursor-pointer"
                style={{
                  backgroundColor: currentTheme.primary,
                  boxShadow: `0 0 25px ${currentTheme.primary}40`,
                }}
              >
                <Calendar size={15} />
                <span>Book a 30-Min Discovery Call</span>
              </button>

              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs sm:text-sm font-mono font-medium text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>View Case Studies</span>
                <ArrowUpRight size={14} />
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs sm:text-sm font-mono text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <span>Send Message</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
