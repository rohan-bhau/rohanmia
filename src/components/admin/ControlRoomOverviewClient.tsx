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
  Globe,
  ArrowUpRight,
  Eye,
  Users,
  Calendar,
  Sparkles,
  Laptop,
  Smartphone,
  Flame,
  Layers,
  Star
} from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { OverviewAnalyticsData } from '@/actions/adminOverview';

interface ControlRoomOverviewClientProps {
  basePath: string;
  data: OverviewAnalyticsData;
}

export default function ControlRoomOverviewClient({
  basePath,
  data,
}: ControlRoomOverviewClientProps) {
  const { currentTheme } = useThemeAccent();
  const { visitorStats, resourceCounts, recentActivity } = data;

  const sections = [
    {
      name: 'Homepage',
      route: `${basePath}/homepage`,
      count: 'Hero & Bento',
      label: 'Visitor Landing',
      icon: Sparkles,
      desc: 'Interactive hero bio, avatar cropping, curated work, and bento layout configuration.'
    },
    {
      name: 'Projects',
      route: `${basePath}/projects`,
      count: `${resourceCounts.projects} Projects`,
      badge: `${resourceCounts.featuredProjects} Featured`,
      label: 'Production Case Studies',
      icon: FolderGit2,
      desc: 'Deep architecture breakdown, metrics, tech tags, drag-to-reorder, and live URLs.'
    },
    {
      name: 'Tech Stack',
      route: `${basePath}/tech-stack`,
      count: `${resourceCounts.stackItems} Technologies`,
      label: 'Engineered Arsenal',
      icon: Cpu,
      desc: 'Categorized technologies, frameworks, proficiency sliders, and official docs links.'
    },
    {
      name: 'About Me',
      route: `${basePath}/about`,
      count: 'Bio & Principles',
      label: 'Career Chronicle',
      icon: User,
      desc: 'Biography narrative, engineering journey, core competencies, and principles.'
    },
    {
      name: 'Gallery',
      route: `${basePath}/gallery`,
      count: `${resourceCounts.gallery} Photos`,
      label: 'Visual Archive',
      icon: ImageIcon,
      desc: 'Curated photography, captures, visual travel moments, and focal alignment.'
    },
    {
      name: 'Guestbook',
      route: `${basePath}/guestbook`,
      count: `${resourceCounts.guestbook} Entries`,
      label: 'Community Ledger',
      icon: BookOpen,
      desc: 'Visitor signatures, community moderation, sentiment review, and entry deletion.'
    },
    {
      name: 'Contact & Inquiries',
      route: `${basePath}/contact`,
      count: `${resourceCounts.inquiries} Inquiries`,
      badge: resourceCounts.unreadInquiries > 0 ? `${resourceCounts.unreadInquiries} New` : undefined,
      label: 'Inquiries & Meetings',
      icon: Mail,
      desc: 'Direct client inquiries, conversation statuses, and discovery meeting bookings.'
    },
    {
      name: 'Social Links',
      route: `${basePath}/links`,
      count: `${resourceCounts.links} Links`,
      label: 'Direct Tree',
      icon: Globe,
      desc: 'Curated social profiles, developer hubs, and public resume download link.'
    },
    {
      name: 'Site Settings',
      route: `${basePath}/settings`,
      count: 'Config',
      label: 'Studio Preferences',
      icon: Settings,
      desc: 'Global title, meta description, contact email, and availability status.'
    },
  ];

  // Calculate percentage of mobile vs desktop
  const totalDeviceLogs = visitorStats.devices.reduce((acc, d) => acc + d.count, 0) || 1;
  const desktopCount = visitorStats.devices.find(d => d.device.toLowerCase().includes('desktop'))?.count || 0;
  const mobileCount = visitorStats.devices.find(d => d.device.toLowerCase().includes('mobile'))?.count || 0;
  const desktopPct = Math.round((desktopCount / totalDeviceLogs) * 100);
  const mobilePct = Math.max(0, 100 - desktopPct);

  // Maximum view count for progress bar scaling
  const maxPathViews = Math.max(...visitorStats.topPaths.map(p => p.count), 1);

  return (
    <div className="space-y-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pb-20 animate-in fade-in duration-300">
      
      {/* 1. TITLE ONLY */}
      <div className="pt-2 pb-1">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white tracking-tight leading-[1.15]">
          System{' '}
          <span 
            className="font-serif italic font-normal text-transparent bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`
            }}
          >
            Telemetry
          </span>
        </h1>
      </div>

      {/* ========================================================
          2. VISITOR ANALYTICS METRICS (REAL DATA FROM POSTGRESQL)
         ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 block">
              TRAFFIC INTELLIGENCE
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-tight mt-0.5">
              Visitor Insights
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-500">Autonomous Server Telemetry</span>
        </div>

        {/* 4 Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Page Views */}
          <div className="p-5 rounded-2xl bg-[#0c0e14]/80 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">Total Page Views</span>
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/10"
                style={{ backgroundColor: `${currentTheme.primary}18`, color: currentTheme.primary }}
              >
                <Eye size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-white tracking-tight">
                {visitorStats.totalViews}
              </span>
              <span className="text-[11px] font-mono text-neutral-500">hits</span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400 pt-1 border-t border-white/[0.05]">
              Aggregate public route requests
            </p>
          </div>

          {/* Card 2: Unique Visitors */}
          <div className="p-5 rounded-2xl bg-[#0c0e14]/80 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">Unique Visitors</span>
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/10"
                style={{ backgroundColor: `${currentTheme.primary}18`, color: currentTheme.primary }}
              >
                <Users size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-white tracking-tight">
                {visitorStats.uniqueVisitors}
              </span>
              <span className="text-[11px] font-mono text-neutral-500">devices</span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400 pt-1 border-t border-white/[0.05]">
              Distinct client fingerprint IDs
            </p>
          </div>

          {/* Card 3: Views Today */}
          <div className="p-5 rounded-2xl bg-[#0c0e14]/80 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">Views Today</span>
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/10"
                style={{ backgroundColor: `${currentTheme.primary}18`, color: currentTheme.primary }}
              >
                <Flame size={15} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-white tracking-tight">
                {visitorStats.viewsToday}
              </span>
              <span className="text-[11px] font-mono text-emerald-400">active</span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400 pt-1 border-t border-white/[0.05]">
              Since midnight UTC
            </p>
          </div>

          {/* Card 4: Device Split */}
          <div className="p-5 rounded-2xl bg-[#0c0e14]/80 border border-white/[0.08] backdrop-blur-xl relative overflow-hidden space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">Platform Split</span>
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/10"
                style={{ backgroundColor: `${currentTheme.primary}18`, color: currentTheme.primary }}
              >
                <Laptop size={15} />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-neutral-200">
                <Laptop size={13} className="text-neutral-400" />
                <span>{desktopPct}% Desktop</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-300">
                <Smartphone size={13} className="text-neutral-400" />
                <span>{mobilePct}% Mobile</span>
              </div>
            </div>
            <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden flex mt-2">
              <div 
                className="h-full transition-all duration-500" 
                style={{ width: `${desktopPct}%`, backgroundColor: currentTheme.primary }} 
              />
              <div 
                className="h-full bg-neutral-600 transition-all duration-500" 
                style={{ width: `${mobilePct}%` }} 
              />
            </div>
          </div>

        </div>

        {/* Top Visited Pages & Recent Log Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Top Visited Routes */}
          <div className="p-6 rounded-3xl bg-[#0c0e14]/80 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 block">
                  ROUTE POPULARITY
                </span>
                <h3 className="font-serif text-lg text-white font-normal mt-0.5">
                  Most Viewed Destinations
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-500">Hits</span>
            </div>

            <div className="space-y-3">
              {visitorStats.topPaths.length === 0 ? (
                <p className="text-xs font-mono text-neutral-500 py-6 text-center">
                  No page views recorded yet.
                </p>
              ) : (
                visitorStats.topPaths.map((item) => {
                  const pct = Math.round((item.count / maxPathViews) * 100);
                  const isHome = item.path === '/';
                  const label = isHome ? '/ (Home)' : item.path;

                  return (
                    <div key={item.path} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-neutral-300 font-medium truncate max-w-[260px]">
                          {label}
                        </span>
                        <span className="text-white font-bold">{item.count}</span>
                      </div>
                      <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: currentTheme.primary,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Visitor Streams */}
          <div className="p-6 rounded-3xl bg-[#0c0e14]/80 border border-white/[0.08] backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 block">
                  REAL-TIME TELEMETRY
                </span>
                <h3 className="font-serif text-lg text-white font-normal mt-0.5">
                  Recent Visitor Stream
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-500">Active</span>
            </div>

            <div className="space-y-2.5">
              {visitorStats.recentVisitors.length === 0 ? (
                <p className="text-xs font-mono text-neutral-500 py-6 text-center">
                  No recent visitor logs.
                </p>
              ) : (
                visitorStats.recentVisitors.map((v, i) => (
                  <div 
                    key={i} 
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="text-neutral-200 truncate">{v.path}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-[11px] text-neutral-400">
                      <span>{v.device}</span>
                      <time className="text-neutral-500">
                        {v.created_at ? new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </time>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================
          3. EDITORIAL PANELS SUMMARY (SHORT PORTFOLIO OVERVIEW)
         ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 block">
              PORTFOLIO ARCHITECTURE
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-white tracking-tight mt-0.5">
              Studio Sections
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-500">9 Editorial Modules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <Link
                key={sec.name}
                href={sec.route}
                className="group p-5 rounded-3xl bg-[#0c0e14]/80 border border-white/[0.08] hover:border-white/25 hover:bg-[#121622]/90 transition-all duration-300 flex flex-col justify-between min-h-[190px] backdrop-blur-xl shadow-lg relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div 
                      className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-neutral-300 group-hover:text-white transition-all"
                    >
                      <Icon size={16} />
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-sm font-semibold text-white tracking-tight">
                        {sec.count}
                      </span>
                      {sec.badge && (
                        <span 
                          className="text-[10px] font-mono px-2 py-0.5 rounded-full mt-1 border"
                          style={{
                            backgroundColor: `${currentTheme.primary}18`,
                            borderColor: `${currentTheme.primary}35`,
                            color: currentTheme.primary
                          }}
                        >
                          {sec.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="font-serif text-lg text-white group-hover:text-white transition-colors tracking-tight">
                      {sec.name}
                    </h3>
                    <p className="text-xs text-neutral-400 font-light leading-relaxed line-clamp-2">
                      {sec.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400 group-hover:text-white transition-colors">
                  <span>Open {sec.name}</span>
                  <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          4. COMMUNICATIONS & COMMUNITY RECENT ACTIVITY
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Guestbook Signatures */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#0c0e14]/80 border border-white/[0.08] backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 block">
                COMMUNITY LEDGER
              </span>
              <h3 className="font-serif text-xl text-white font-normal mt-0.5">
                Recent Signatures
              </h3>
            </div>
            <Link
              href={`${basePath}/guestbook`}
              className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View All ({resourceCounts.guestbook})</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentActivity.guestbook.length === 0 ? (
              <p className="text-xs text-neutral-500 font-mono py-8 text-center">
                No guestbook signatures recorded yet.
              </p>
            ) : (
              recentActivity.guestbook.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1.5"
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

        {/* Recent Client Inquiries */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#0c0e14]/80 border border-white/[0.08] backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-400 block">
                CLIENT PIPELINE
              </span>
              <h3 className="font-serif text-xl text-white font-normal mt-0.5">
                Incoming Inquiries
              </h3>
            </div>
            <Link
              href={`${basePath}/contact`}
              className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Inbox ({resourceCounts.inquiries})</span>
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentActivity.inquiries.length === 0 ? (
              <p className="text-xs text-neutral-500 font-mono py-8 text-center">
                Inbox is clear. No direct messages received yet.
              </p>
            ) : (
              recentActivity.inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-1.5"
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
                    <div className="flex items-center gap-2">
                      {!inq.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      )}
                      <time className="text-[10px] font-mono text-neutral-500">
                        {new Date(inq.created_at).toLocaleDateString()}
                      </time>
                    </div>
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
