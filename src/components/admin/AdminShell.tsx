'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  ShieldCheck 
} from 'lucide-react';
import AnimatedLogo from '@/components/shared/AnimatedLogo';
import { logoutFromControlRoom } from '@/actions/stealthAuth';

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

  const navItems = [
    { label: 'Overview', href: basePath, icon: LayoutDashboard },
    { label: 'Hero & Identity', href: `${basePath}/hero`, icon: Sparkles },
    { label: 'Bento Grid', href: `${basePath}/bento`, icon: Grid },
    { label: 'About & Timeline', href: `${basePath}/about`, icon: User },
    { label: 'Projects & Case Studies', href: `${basePath}/projects`, icon: FolderGit2 },
    { label: 'Tech Stack', href: `${basePath}/tech-stack`, icon: Cpu },
    { label: 'Gallery Showcase', href: `${basePath}/gallery`, icon: ImageIcon },
    { label: 'Guestbook Ledger', href: `${basePath}/guestbook`, icon: BookOpen },
    { label: 'Inquiries & Leads', href: `${basePath}/inquiries`, icon: Mail },
    { label: 'Links Hub', href: `${basePath}/links`, icon: Link2 },
    { label: 'Global Settings', href: `${basePath}/settings`, icon: Settings },
  ];

  const handleSignOut = async () => {
    await logoutFromControlRoom();
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-foreground flex flex-col md:flex-row antialiased selection:bg-white/20">
      <header className="md:hidden flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#0d0f12]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <AnimatedLogo size={32} animated={false} />
          <div>
            <span className="text-sm font-bold tracking-tight text-white block">
              Control Room
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              ● Secure Internal
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-muted-foreground hover:text-white"
        >
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 lg:w-72 bg-[#090b0e] border-r border-white/[0.08] flex flex-col justify-between z-40 transition-transform duration-300 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 flex flex-col h-full overflow-y-auto">
          <div className="flex items-center gap-3.5 pb-6 border-b border-white/[0.06]">
            <AnimatedLogo size={38} animated={true} />
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                <ShieldCheck size={12} />
                <span>Stealth Active</span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight leading-none mt-1">
                Control Room
              </h2>
            </div>
          </div>

          <nav className="space-y-1 py-6 flex-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 px-3 pb-2 block">
              Content Engine
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === basePath 
                ? pathname === basePath || pathname === '/control-room-internal'
                : pathname === item.href || pathname === item.href.replace(basePath, '/control-room-internal');

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-all group ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold shadow-sm border border-white/10'
                      : 'text-muted-foreground hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon 
                    size={16} 
                    className={`transition-colors ${
                      isActive ? 'text-white' : 'text-muted-foreground group-hover:text-white'
                    }`} 
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-white/[0.06] space-y-3">
            <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
              <div className="overflow-hidden">
                <span className="text-[11px] font-medium text-white block truncate">
                  {user.email || 'Admin'}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground/70 block truncate">
                  Master Session
                </span>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut size={14} />
              </button>
            </div>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-[11px] font-mono text-muted-foreground hover:text-white transition-all"
            >
              <ExternalLink size={13} />
              <span>Live Site Preview</span>
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#07080a] min-h-screen">
        <div className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/[0.06] bg-[#090b0e]/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="text-zinc-500">control-room</span>
            <span>/</span>
            <span className="text-white font-medium">
              {navItems.find(i => pathname === i.href || pathname === i.href.replace(basePath, '/control-room-internal'))?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Route: {basePath}</span>
            </div>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-muted-foreground hover:text-white transition-colors"
            >
              <ExternalLink size={13} />
              <span>View Portfolio</span>
            </Link>
          </div>
        </div>

        <div className="p-6 md:p-10 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
