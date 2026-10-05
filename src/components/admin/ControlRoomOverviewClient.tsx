'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FolderGit2, 
  Cpu, 
  Image as ImageIcon, 
  BookOpen, 
  Mail, 
  User, 
  Settings, 
  Link2,
  ArrowUpRight,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

interface ControlRoomOverviewClientProps {
  basePath: string;
  projectCount: number;
  stackCount: number;
  galleryCount: number;
  guestbookCount: number;
  inquiryCount: number;
  bookingCount: number;
  recentGuestbook: any[];
  recentInquiries: any[];
}

export default function ControlRoomOverviewClient({
  basePath,
  projectCount,
  stackCount,
  galleryCount,
  guestbookCount,
  inquiryCount,
  bookingCount,
  recentGuestbook,
  recentInquiries,
}: ControlRoomOverviewClientProps) {
  const { currentTheme } = useThemeAccent();

  const sections = [
    {
      name: 'Projects',
      route: `${basePath}/projects`,
      publicRoute: '/projects',
      count: projectCount,
      label: 'Production Case Studies',
      icon: FolderGit2,
      desc: 'Selected works, architecture breakdown, tech tags, and live deployment links.'
    },
    {
      name: 'Tech Stack',
      route: `${basePath}/tech-stack`,
      publicRoute: '/tech-stack',
      count: stackCount,
      label: 'Engineered Arsenal',
      icon: Cpu,
      desc: 'Categorized technologies, frameworks, proficiency ratings, and documentation.'
    },
    {
      name: 'Gallery',
      route: `${basePath}/gallery`,
      publicRoute: '/gallery',
      count: galleryCount,
      label: 'Visual Archive',
      icon: ImageIcon,
      desc: 'Curated photography, moments, travel archives, and focal point adjustments.'
    },
    {
      name: 'About',
      route: `${basePath}/about`,
      publicRoute: '/about',
      count: 4,
      label: 'Career Chronicle',
      icon: User,
      desc: 'Biography narrative, engineering journey, principles, and academic background.'
    },
    {
      name: 'Guestbook',
      route: `${basePath}/guestbook`,
      publicRoute: '/guestbook',
      count: guestbookCount,
      label: 'Community Ledger',
      icon: BookOpen,
      desc: 'Visitor signatures, community moderation, sentiment review, and entry deletion.'
    },
    {
      name: 'Contact',
      route: `${basePath}/contact`,
      publicRoute: '/contact',
      count: inquiryCount + bookingCount,
      label: 'Inquiries & Meetings',
      icon: Mail,
      desc: 'Direct client inquiries, message status workflow, and scheduled discovery sessions.'
    },
    {
      name: 'Links',
      route: `${basePath}/links`,
      publicRoute: '/links',
      count: 6,
      label: 'Direct Tree',
      icon: Link2,
      desc: 'Curated social profiles, developer hubs, and public resume download link.'
    },
    {
      name: 'Settings',
      route: `${basePath}/settings`,
      publicRoute: '/',
      count: 1,
      label: 'Studio Preferences',
      icon: Settings,
      desc: 'Site title, SEO meta description, contact email, and global availability status.'
    },
  ];

  return (
    <div className="space-y-12 max-w-6xl pb-16">
      
      {/* Hero Header matching visitor aesthetic */}
      <div className="relative rounded-[32px] bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-2xl p-8 sm:p-12 shadow-2xl overflow-hidden">
        {/* Subtle Horizon line reacting to current theme */}
        <div 
          className="absolute top-0 left-0 right-0 h-px opacity-40 transition-colors duration-700" 
          style={{
            background: `linear-gradient(90deg, transparent, ${currentTheme.primary}, transparent)`
          }}
        />
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-neutral-400">
                OVERVIEW
              </span>
              <span className="text-neutral-600">•</span>
              <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                <span>Synchronized with Neon PostgreSQL</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-white tracking-tight leading-[1.12]">
              Control{' '}
              <span 
                className="font-serif italic font-normal text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`
                }}
              >
                Room
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
              Curate, edit, and publish content across every section of your portfolio in real time. The public visitor interface remains frozen and pristine.
            </p>
          </div>

          {/* Quick Action Hub */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href={`${basePath}/projects`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all shadow-md cursor-pointer"
            >
              <Plus size={14} />
              <span>New Project</span>
            </Link>

            <Link
              href={`${basePath}/gallery`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-medium transition-all cursor-pointer"
            >
              <ImageIcon size={14} />
              <span>Add Photo</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-300 hover:text-white text-xs font-mono transition-colors"
            >
              <span>Public Site</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Page Sections Grid matching visitor page names */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 block">
              PORTFOLIO SECTIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-white tracking-tight mt-1">
              Editorial{' '}
              <span 
                className="font-serif italic font-normal text-transparent bg-clip-text"
                style={{
                  backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`
                }}
              >
                Panels
              </span>
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-500">8 Sections Available</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <Link
                key={sec.name}
                href={sec.route}
                className="group p-6 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] hover:border-white/25 hover:bg-[#121622]/80 transition-all duration-300 flex flex-col justify-between min-h-[220px] backdrop-blur-xl shadow-lg relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div 
                      className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-neutral-300 group-hover:text-white transition-all"
                    >
                      <Icon size={18} />
                    </div>
                    <span 
                      className="font-mono text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform origin-right"
                    >
                      {sec.count}
                    </span>
                  </div>

                  <div className="mt-5 space-y-1.5">
                    <h3 className="font-serif text-xl text-white group-hover:text-white transition-colors tracking-tight">
                      {sec.name}
                    </h3>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed line-clamp-2">
                      {sec.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400 group-hover:text-white transition-colors">
                  <span>Edit {sec.name}</span>
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Communications & Inquiries Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Guestbook Signatures */}
        <div className="p-7 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 block">
                RECENT SIGNATURES
              </span>
              <h3 className="font-serif text-xl text-white font-normal mt-0.5">
                The Guestbook
              </h3>
            </div>
            <Link
              href={`${basePath}/guestbook`}
              className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View All ({guestbookCount})</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentGuestbook.length === 0 ? (
              <p className="text-xs text-neutral-500 font-mono py-6 text-center">
                No guestbook signatures recorded yet.
              </p>
            ) : (
              recentGuestbook.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white">
                      {entry.user_name || 'Anonymous Visitor'}
                    </span>
                    <time className="text-[10px] font-mono text-neutral-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="text-xs text-neutral-300 font-light leading-relaxed">
                    &ldquo;{entry.message}&rdquo;
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Contact Inquiries */}
        <div className="p-7 rounded-3xl bg-[#0c0e14]/75 border border-white/[0.08] backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 block">
                INCOMING MESSAGES
              </span>
              <h3 className="font-serif text-xl text-white font-normal mt-0.5">
                Client Inquiries
              </h3>
            </div>
            <Link
              href={`${basePath}/contact`}
              className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Inbox ({inquiryCount})</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {recentInquiries.length === 0 ? (
              <p className="text-xs text-neutral-500 font-mono py-6 text-center">
                Inbox is clear. No direct messages received yet.
              </p>
            ) : (
              recentInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-white block">
                        {inq.sender_name || 'Client'}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {inq.sender_email}
                      </span>
                    </div>
                    <time className="text-[10px] font-mono text-neutral-500">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="text-xs text-neutral-300 font-light leading-relaxed truncate">
                    {inq.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
