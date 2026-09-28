'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  Globe2, 
  Layers, 
  Code2, 
  Workflow,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import ColorSwitcher from '@/components/theme/ColorSwitcher';
import TechBadge from '@/components/ui/TechBadge';

export default function BentoGrid() {
  const { currentTheme } = useThemeAccent();

  return (
    <section className="py-14 px-6">
      <div className="container mx-auto max-w-6xl">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-3">
          <div className="space-y-1.5">
            <span 
              className="text-xs font-mono uppercase tracking-widest font-semibold flex items-center gap-1.5"
              style={{ color: currentTheme.primary }}
            >
              <Sparkles size={13} />
              At A Glance
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground uppercase italic">
              Overview & <span className="not-italic text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, #ffffff, ${currentTheme.primary})` }}>Work</span>
            </h2>
          </div>
          <p className="text-xs font-mono text-muted-foreground max-w-xs">
            A quick overview of what I build, my featured project, and primary tech stack.
          </p>
        </div>

        {/* Bento Grid (12 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Bento Card 1: What I Build (Span 7) */}
          <div className="md:col-span-7 p-7 rounded-3xl bg-[#0d0f12] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            {/* Ambient Accent Glow */}
            <div 
              className="absolute -top-20 -left-20 w-52 h-52 rounded-full blur-[100px] opacity-15 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: currentTheme.primary }}
            />

            <div className="space-y-3 relative z-10">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Code2 size={14} style={{ color: currentTheme.primary }} />
                Full-Stack Engineering
              </span>

              <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                Building reliable web applications from frontend to database.
              </h3>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                I develop end-to-end web applications with clean TypeScript, modern component architectures, and structured databases. I focus on writing code that is easy to maintain, performant in production, and intuitive for users.
              </p>
            </div>

            {/* Practical Capabilities */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/[0.06] relative z-10 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 size={14} style={{ color: currentTheme.primary }} className="flex-shrink-0" />
                <span>Next.js & React</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 size={14} style={{ color: currentTheme.primary }} className="flex-shrink-0" />
                <span>TypeScript First</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 size={14} style={{ color: currentTheme.primary }} className="flex-shrink-0" />
                <span>SQL & NoSQL DBs</span>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Featured Project: Vireo (Span 5) */}
          <Link
            href="/projects"
            className="md:col-span-5 p-7 rounded-3xl bg-[#0d0f12] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300"
          >
            <div 
              className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none transition-all duration-700"
              style={{ backgroundColor: currentTheme.primary }}
            />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Workflow size={14} style={{ color: currentTheme.primary }} />
                  Featured Project
                </span>
                <span className="p-1 rounded-full bg-white/[0.05] border border-white/10 text-muted-foreground group-hover:text-foreground transition-colors">
                  <ArrowUpRight size={13} />
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  Vireo
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  AI-powered project management platform featuring interactive node-based workflow pipelines, Kanban boards with dnd-kit, and team task tracking.
                </p>
              </div>
            </div>

            {/* Tech badges */}
            <div className="flex flex-wrap gap-1.5 pt-5 relative z-10">
              {['Next.js 16', 'React', 'TypeScript', 'Redux Toolkit', 'Tailwind CSS'].map((tech) => (
                <TechBadge key={tech} name={tech} />
              ))}
            </div>
          </Link>

          {/* Bento Card 3: Theme Customizer (Span 5) */}
          <div className="md:col-span-5">
            <ColorSwitcher variant="bento" className="h-full" />
          </div>

          {/* Bento Card 4: Tech Stack (Span 4) */}
          <Link
            href="/tech-stack"
            className="md:col-span-4 p-7 rounded-3xl bg-[#0d0f12] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers size={14} style={{ color: currentTheme.primary }} />
                  Primary Tech Stack
                </span>
                <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground flex items-center gap-0.5">
                  View All <ArrowUpRight size={11} />
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-foreground">
                  Tools & Technologies
                </h4>
                <p className="text-xs text-muted-foreground">
                  The primary technologies I use to build full-stack web applications.
                </p>
              </div>

              {/* Stack Pills with real brand icons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'Next.js',
                  'TypeScript',
                  'React',
                  'Tailwind CSS',
                  'PostgreSQL',
                  'MongoDB',
                  'Node.js',
                  'Express',
                  'Prisma',
                  'Git'
                ].map((tool) => (
                  <TechBadge key={tool} name={tool} />
                ))}
              </div>
            </div>

            <span className="pt-4 text-[11px] font-mono text-muted-foreground/70 group-hover:text-primary transition-colors flex items-center gap-1">
              Explore tech stack page &rarr;
            </span>
          </Link>

          {/* Bento Card 5: Location & Collaboration (Span 3) */}
          <div className="md:col-span-3 p-7 rounded-3xl bg-[#0d0f12] border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Globe2 size={14} style={{ color: currentTheme.primary }} />
                  Location
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-foreground">
                  Dhaka, Bangladesh
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Available for remote software engineering roles and contract projects worldwide.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06]">
              <span className="text-[11px] font-mono text-muted-foreground">
                Timezone: GMT+6 (Flexible hours)
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
