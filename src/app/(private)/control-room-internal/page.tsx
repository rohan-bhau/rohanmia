import React from 'react';
import Link from 'next/link';
import { 
  FolderGit2, 
  Cpu, 
  Image as ImageIcon, 
  BookOpen, 
  Mail, 
  Sparkles, 
  Grid, 
  User, 
  Settings, 
  Link2,
  ArrowUpRight,
  Database,
  CalendarCheck
} from 'lucide-react';
import { executeSql } from '@/lib/postgres';

export const dynamic = 'force-dynamic';

export default async function ControlRoomDashboard() {
  const basePath = process.env.ADMIN_ENTRY_PATH || '/arronhaan1841';

  // Fetch live metrics from Neon PostgreSQL
  let projectCount = 0;
  let stackCount = 0;
  let galleryCount = 0;
  let guestbookCount = 0;
  let inquiryCount = 0;
  let bookingCount = 0;

  try {
    const [pRes, sRes, gRes, gbRes, inqRes, bRes] = await Promise.all([
      executeSql<{ count: string }>('SELECT COUNT(*) as count FROM projects;'),
      executeSql<{ count: string }>('SELECT COUNT(*) as count FROM tech_items;'),
      executeSql<{ count: string }>('SELECT COUNT(*) as count FROM gallery_photos;'),
      executeSql<{ count: string }>('SELECT COUNT(*) as count FROM guestbook_entries;'),
      executeSql<{ count: string }>('SELECT COUNT(*) as count FROM contact_messages;'),
      executeSql<{ count: string }>('SELECT COUNT(*) as count FROM meeting_bookings;'),
    ]);

    projectCount = parseInt(pRes.rows[0]?.count || '0', 10);
    stackCount = parseInt(sRes.rows[0]?.count || '0', 10);
    galleryCount = parseInt(gRes.rows[0]?.count || '0', 10);
    guestbookCount = parseInt(gbRes.rows[0]?.count || '0', 10);
    inquiryCount = parseInt(inqRes.rows[0]?.count || '0', 10);
    bookingCount = parseInt(bRes.rows[0]?.count || '0', 10);
  } catch (err) {
    // Graceful fallback if database read fluctuates
  }

  const metricCards = [
    { label: 'Published Projects', value: projectCount, icon: FolderGit2, href: `${basePath}/projects` },
    { label: 'Tech Stack Skills', value: stackCount, icon: Cpu, href: `${basePath}/tech-stack` },
    { label: 'Gallery Photos', value: galleryCount, icon: ImageIcon, href: `${basePath}/gallery` },
    { label: 'Guestbook Signs', value: guestbookCount, icon: BookOpen, href: `${basePath}/guestbook` },
    { label: 'Total Inquiries', value: inquiryCount, icon: Mail, href: `${basePath}/inquiries` },
    { label: 'Scheduled Calls', value: bookingCount, icon: CalendarCheck, href: `${basePath}/inquiries` },
  ];

  const contentModules = [
    {
      title: 'Hero & Identity',
      desc: 'Edit name, greeting, rotating typewriter titles, live bio, and Cloudinary avatar.',
      href: `${basePath}/hero`,
      icon: Sparkles,
      previewUrl: '/',
    },
    {
      title: 'Bento Grid',
      desc: 'Configure home overview cards, engineering highlights, and tech radar status.',
      href: `${basePath}/bento`,
      icon: Grid,
      previewUrl: '/#overview',
    },
    {
      title: 'About & Timeline',
      desc: 'Manage bio story, career milestones, engineering principles, and 3D photo stack.',
      href: `${basePath}/about`,
      icon: User,
      previewUrl: '/about',
    },
    {
      title: 'Projects & Case Studies',
      desc: 'Full management of architectural case studies, live links, and dual mockups.',
      href: `${basePath}/projects`,
      icon: FolderGit2,
      previewUrl: '/projects',
    },
    {
      title: 'Tech Stack & Radar',
      desc: 'Categorized tools, proficiency percentages, official docs URLs, and brand colors.',
      href: `${basePath}/tech-stack`,
      icon: Cpu,
      previewUrl: '/tech-stack',
    },
    {
      title: 'Gallery Archive',
      desc: 'Upload moments and travels with focal point calibration, dates, and captions.',
      href: `${basePath}/gallery`,
      icon: ImageIcon,
      previewUrl: '/gallery',
    },
    {
      title: 'Guestbook Ledger',
      desc: 'Review visitor signatures, moderate entries, and manage pinned comments.',
      href: `${basePath}/guestbook`,
      icon: BookOpen,
      previewUrl: '/guestbook',
    },
    {
      title: 'Inquiries & Leads',
      desc: 'Read incoming messages, review meeting requests, and respond to clients.',
      href: `${basePath}/inquiries`,
      icon: Mail,
      previewUrl: '/contact',
    },
    {
      title: 'Links Directory',
      desc: 'Update external links, social profiles, and quick navigation routes.',
      href: `${basePath}/links`,
      icon: Link2,
      previewUrl: '/links',
    },
    {
      title: 'Global Settings',
      desc: 'Configure meta tags, SEO description, contact email, and resume download link.',
      href: `${basePath}/settings`,
      icon: Settings,
      previewUrl: '/',
    },
  ];

  return (
    <div className="space-y-10 max-w-6xl">
      
      {/* Studio Header Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#0c0e14] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden">
        {/* Soft Ambient Spotlight */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
              Operational Studio
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-white">
              Studio{' '}
              <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
                Console
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed pt-1">
              Direct management console for every piece of content across the portfolio. Changes update dynamically in PostgreSQL while public UI remains strictly preserved.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3 font-mono text-xs">
              <Database size={16} className="text-cyan-400" />
              <div>
                <span className="text-[10px] text-neutral-500 block uppercase">Engine</span>
                <span className="text-white font-medium">Neon PostgreSQL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Telemetry / Database Metrics */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
          Database Metrics
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {metricCards.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.label}
                href={m.href}
                className="p-4 rounded-2xl bg-[#0a0d12] border border-white/[0.06] hover:border-white/20 transition-all group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-neutral-500 group-hover:text-neutral-300">
                  <Icon size={16} />
                  <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="pt-4">
                  <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                    {m.value}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-medium truncate mt-0.5">
                    {m.label}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content Management Modules */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
          Content Editors
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contentModules.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-[#0a0d12] border border-white/[0.06] hover:border-white/20 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/[0.04] text-neutral-300 group-hover:text-white border border-white/[0.06] transition-colors">
                        <Icon size={18} />
                      </div>
                      <h3 className="text-base font-semibold text-white tracking-tight">
                        {item.title}
                      </h3>
                    </div>

                    <Link
                      href={item.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition-colors"
                      title="Preview public page"
                    >
                      <span>Preview</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-white/[0.04] flex items-center justify-end">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 text-xs font-medium text-white hover:text-cyan-300 transition-colors"
                  >
                    <span>Open Editor</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
