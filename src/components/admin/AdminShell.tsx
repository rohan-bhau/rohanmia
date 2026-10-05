'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Sparkles, 
  Grid, 
  User, 
  FolderGit2, 
  Cpu, 
  Image as ImageIcon, 
  BookOpen, 
  Mail, 
  Link2, 
  Settings, 
  ExternalLink, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import AnimatedLogo from '@/components/shared/AnimatedLogo';
import { logoutFromControlRoom } from '@/actions/stealthAuth';
import { ToastProvider } from './ui/Toast';

interface AdminShellProps {
  basePath: string;
  user: {
    name?: string;
    email?: string;
  };
  children: React.ReactNode;
}

export default function AdminShell({ basePath, user, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navigationSections = [
    {
      title: 'General',
      items: [
        { label: 'Overview', href: basePath, icon: LayoutDashboard },
      ],
    },
    {
      title: 'Site Content',
      items: [
        { label: 'Hero & Identity', href: `${basePath}/hero`, icon: Sparkles },
        { label: 'Bento Grid', href: `${basePath}/bento`, icon: Grid },
        { label: 'About & Timeline', href: `${basePath}/about`, icon: User },
        { label: 'Projects & Case Studies', href: `${basePath}/projects`, icon: FolderGit2 },
        { label: 'Tech Stack', href: `${basePath}/tech-stack`, icon: Cpu },
        { label: 'Gallery Archive', href: `${basePath}/gallery`, icon: ImageIcon },
      ],
    },
    {
      title: 'Communications',
      items: [
        { label: 'Guestbook Ledger', href: `${basePath}/guestbook`, icon: BookOpen },
        { label: 'Inquiries & Bookings', href: `${basePath}/inquiries`, icon: Mail },
        { label: 'Links Directory', href: `${basePath}/links`, icon: Link2 },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Global Settings', href: `${basePath}/settings`, icon: Settings },
      ],
    },
  ];

  const allItems = navigationSections.flatMap((s) => s.items);
  const currentItem = allItems.find(
    (i) =>
      pathname === i.href ||
      pathname === i.href.replace(basePath, '/control-room-internal')
  );

  const handleSignOut = async () => {
    await logoutFromControlRoom();
    window.location.reload();
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-transparent text-neutral-200 flex flex-col md:flex-row antialiased selection:bg-white/20">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#0c0e14]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <AnimatedLogo size={30} animated={false} />
            <div>
              <span className="text-sm font-semibold tracking-tight text-white block">
                Control Room
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                Studio Console
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-300 hover:text-white transition-colors"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-0 left-0 h-screen w-64 lg:w-72 bg-[#0c0e14]/75 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col justify-between z-40 transition-transform duration-300 ${
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="p-6 flex flex-col h-full overflow-y-auto">
            {/* Brand Logo Header */}
            <div className="flex items-center gap-3.5 pb-6 border-b border-white/[0.06]">
              <AnimatedLogo size={36} animated={true} />
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight leading-none">
                  Control Room
                </h2>
                <p className="text-[11px] font-mono text-neutral-400 mt-1">
                  Portfolio Studio
                </p>
              </div>
            </div>

            {/* Navigation Sections */}
            <nav className="py-6 flex-1 space-y-6">
              {navigationSections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 px-3 pb-1 block">
                    {section.title}
                  </span>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === basePath
                        ? pathname === basePath || pathname === '/control-room-internal'
                        : pathname === item.href ||
                          pathname === item.href.replace(basePath, '/control-room-internal');

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-all group ${
                          isActive
                            ? 'bg-white/[0.08] text-white font-semibold border border-white/[0.12] shadow-sm'
                            : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            size={16}
                            className={`transition-colors ${
                              isActive ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Bottom User & Live Preview */}
            <div className="pt-4 border-t border-white/[0.06] space-y-3">
              <div className="px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                <div className="overflow-hidden pr-2">
                  <span className="text-[11px] font-medium text-white block truncate">
                    {user.email || 'Admin'}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 block truncate">
                    Active Session
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </div>

              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                <ExternalLink size={13} />
                <span>View Live Site</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-transparent min-h-screen">
          {/* Top Bar for Desktop */}
          <div className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/[0.08] bg-[#0c0e14]/70 backdrop-blur-xl sticky top-0 z-30">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span>Studio</span>
              <ChevronRight size={12} className="text-neutral-600" />
              <span className="text-white font-medium">
                {currentItem?.label || 'Overview'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>PostgreSQL Live</span>
              </div>

              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-neutral-300 hover:text-white transition-colors"
              >
                <ExternalLink size={13} />
                <span>Visit Portfolio</span>
              </Link>
            </div>
          </div>

          {/* Page Inner Canvas */}
          <div className="p-6 md:p-10 flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
