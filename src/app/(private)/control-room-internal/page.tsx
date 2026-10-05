import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Sparkles, 
  FolderGit2, 
  Image as ImageIcon, 
  Cpu, 
  BookOpen, 
  Mail, 
  Database, 
  ArrowUpRight, 
  Lock, 
  Activity 
} from 'lucide-react';

export default async function ControlRoomDashboard() {
  const basePath = process.env.ADMIN_ENTRY_PATH || '/arronhaan1841';

  const modules = [
    {
      title: 'Hero & Identity',
      desc: 'Live editing of greeting, name, dynamic typewriter titles, bio & avatar.',
      href: `${basePath}/hero`,
      icon: Sparkles,
      color: 'text-amber-400',
      badge: 'Live Sync',
    },
    {
      title: 'Bento Grid',
      desc: 'Manage interactive cards, status badges, tech radar highlights and visibility.',
      href: `${basePath}/bento`,
      icon: Activity,
      color: 'text-sky-400',
      badge: 'Home Section',
    },
    {
      title: 'Projects & Case Studies',
      desc: 'Full CRUD for architectural case studies, live links, metrics & dual mockups.',
      href: `${basePath}/projects`,
      icon: FolderGit2,
      color: 'text-indigo-400',
      badge: 'Primary Showcase',
    },
    {
      title: 'Tech Stack',
      desc: 'Categorized tools, proficiency indicators, custom icons and active toggles.',
      href: `${basePath}/tech-stack`,
      icon: Cpu,
      color: 'text-emerald-400',
      badge: 'Architecture',
    },
    {
      title: 'Gallery Showcase',
      desc: 'Upload high-res photos, tune focal alignment crosshairs, location and metadata.',
      href: `${basePath}/gallery`,
      icon: ImageIcon,
      color: 'text-rose-400',
      badge: 'Visual Portal',
    },
    {
      title: 'Guestbook Ledger',
      desc: 'Moderate visitor & recruiter signatures, pin favorites, and purge spam.',
      href: `${basePath}/guestbook`,
      icon: BookOpen,
      color: 'text-purple-400',
      badge: 'Community',
    },
    {
      title: 'Inquiries & Leads',
      desc: 'Direct inbox for contact messages, Calendly bookings, and cancellation logs.',
      href: `${basePath}/inquiries`,
      icon: Mail,
      color: 'text-teal-400',
      badge: 'Comms',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <ShieldCheck size={14} />
              <span>Phase 1 Stealth Engine Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Control Room System Console
            </h1>
            <p className="text-xs sm:text-sm font-mono text-muted-foreground max-w-xl">
              Central operational engine for MD Rohan Mia's digital portfolio. All changes dynamically propagate to live pages while public UI remains 100% locked.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-right font-mono text-xs">
              <span className="text-muted-foreground/60 block text-[10px] uppercase">Database Engine</span>
              <span className="text-emerald-400 font-semibold flex items-center justify-end gap-1.5 mt-0.5">
                <Database size={13} />
                PostgreSQL (Neon)
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-right font-mono text-xs">
              <span className="text-muted-foreground/60 block text-[10px] uppercase">Route Mask</span>
              <span className="text-white font-semibold flex items-center justify-end gap-1.5 mt-0.5">
                <Lock size={12} className="text-amber-400" />
                {basePath}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground font-semibold">
            Content Modules
          </h2>
          <span className="text-xs font-mono text-muted-foreground/50">
            Select a module to manage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.title}
                href={m.href}
                className="p-6 rounded-2xl bg-[#0d0f12]/90 border border-white/[0.06] hover:border-white/20 transition-all duration-300 group flex flex-col justify-between hover:shadow-xl relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] ${m.color}`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-muted-foreground">
                      {m.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-2">
                      {m.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono text-muted-foreground group-hover:text-white transition-colors">
                  <span>Open Controller</span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
