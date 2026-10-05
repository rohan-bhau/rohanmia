'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  User2, 
  FolderGit2, 
  Cpu, 
  BookOpen, 
  Mail, 
  Image as ImageIcon,
  Globe,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  LayoutGrid,
  X,
  Bell,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import AnimatedLogo from '@/components/shared/AnimatedLogo';
import { logoutFromControlRoom } from '@/actions/stealthAuth';
import { ToastProvider } from './ui/Toast';
import { AdminModeProvider, useAdminMode } from './AdminModeContext';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import ColorSwitcher from '@/components/theme/ColorSwitcher';
import { useScrollLock } from '@/hooks/useScrollLock';

interface AdminShellProps {
  basePath: string;
  user: {
    name?: string;
    email?: string;
  };
  children: React.ReactNode;
}

function AdminShellContent({ basePath, user, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { currentTheme } = useThemeAccent();
  const { mode, setMode } = useAdminMode();
  const navScrollRef = useRef<HTMLDivElement>(null);

  useScrollLock(mobileDrawerOpen);

  // Close drawer on route change
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  // Strict wheel event isolation on sidebar middle section
  useEffect(() => {
    const el = navScrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      if (el.scrollHeight > el.clientHeight) {
        el.scrollTop += e.deltaY;
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const NAV_ITEMS = [
    { name: 'Home', href: basePath, icon: Home },
    { name: 'About', href: `${basePath}/about`, icon: User2 },
    { name: 'Projects', href: `${basePath}/projects`, icon: FolderGit2 },
    { name: 'Stack', href: `${basePath}/tech-stack`, icon: Cpu },
    { name: 'Gallery', href: `${basePath}/gallery`, icon: ImageIcon },
    { name: 'Guestbook', href: `${basePath}/guestbook`, icon: BookOpen },
    { name: 'Links', href: `${basePath}/links`, icon: Globe },
    { name: 'Contact', href: `${basePath}/contact`, icon: Mail },
    { name: 'Settings', href: `${basePath}/settings`, icon: Settings },
  ];

  const isLinkActive = (href: string) => {
    if (href === basePath) {
      return pathname === basePath || pathname === '/control-room-internal';
    }
    const cleanHref = href.replace(basePath, '/control-room-internal');
    return pathname === href || pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
  };

  const getPageTitle = () => {
    if (pathname === basePath || pathname === '/control-room-internal') return 'Homepage';
    if (pathname.includes('/about')) return 'About Me';
    if (pathname.includes('/projects')) return 'Case Studies';
    if (pathname.includes('/tech-stack')) return 'Tech Stack';
    if (pathname.includes('/gallery')) return 'Gallery Visuals';
    if (pathname.includes('/guestbook')) return 'Guestbook Ledger';
    if (pathname.includes('/links')) return 'Social Links';
    if (pathname.includes('/contact')) return 'Client Inquiries';
    if (pathname.includes('/settings')) return 'Site Settings';
    return 'Studio Engine';
  };

  const handleSignOut = async () => {
    await logoutFromControlRoom();
    window.location.reload();
  };

  return (
    <div 
      data-lenis-prevent="true"
      className="min-h-screen bg-transparent text-neutral-200 antialiased selection:bg-white/20 relative"
    >
      {/* Ambient horizon glow */}
      <div 
        aria-hidden="true"
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] rounded-full blur-[140px] opacity-15 pointer-events-none -z-10 transition-colors duration-700"
        style={{ backgroundColor: currentTheme.primary }}
      />

      {/* ========================================================
          DESKTOP LEFT SIDEBAR (FIXED W-64)
          - Fixed Top Header: Logo + Brand + Border below
          - Middle Scrollable Area: Nav Links only, isolated scroll, no scrollbar
          - Fixed Bottom Footer: Live Site, Profile & Sign Out (Theme removed from here)
         ======================================================== */}
      <aside
        data-lenis-prevent="true"
        className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 z-50 bg-[#08090d]/95 backdrop-blur-2xl border-r border-white/[0.08] flex-col justify-between select-none"
      >
        {/* 1. FIXED TOP HEADER WITH BORDER BELOW */}
        <div className="shrink-0 p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#08090d]/80">
          <Link href={basePath} className="flex items-center gap-2.5 group">
            <AnimatedLogo size={32} animated={true} glow={true} />
            <div className="flex flex-col">
              <span className="font-serif text-base font-medium text-white group-hover:text-white transition-colors leading-tight">
                Rohan Mia
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                Control Room
              </span>
            </div>
          </Link>

          <div 
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium"
            style={{
              backgroundColor: `${currentTheme.primary}15`,
              borderColor: `${currentTheme.primary}35`,
              color: currentTheme.primary
            }}
          >
            <span 
              className="w-1.5 h-1.5 rounded-full animate-pulse" 
              style={{ backgroundColor: currentTheme.primary }}
            />
            <span>Live</span>
          </div>
        </div>

        {/* 2. MIDDLE SCROLLABLE NAVIGATION (ISOLATED SCROLL, NO SCROLLBAR) */}
        <div
          ref={navScrollRef}
          data-lenis-prevent="true"
          className="flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-3 space-y-1"
        >
          <p className="px-2 pt-1 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-semibold">
            Studio Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                style={active ? {
                  backgroundColor: `${currentTheme.primary}18`,
                  borderColor: `${currentTheme.primary}40`,
                  color: '#ffffff',
                } : undefined}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-all duration-150 border ${
                  active
                    ? 'font-semibold shadow-xs'
                    : 'border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon 
                    size={15} 
                    style={active ? { color: currentTheme.primary } : undefined} 
                    className={active ? '' : 'text-neutral-400 group-hover:text-neutral-300'}
                  />
                  <span>{item.name}</span>
                </div>

                {active && (
                  <span 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ 
                      backgroundColor: currentTheme.primary,
                      boxShadow: `0 0 6px ${currentTheme.primary}`
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* 3. FIXED BOTTOM FOOTER (Theme moved to top bar, clean public link + profile) */}
        <div className="shrink-0 p-3.5 border-t border-white/[0.08] space-y-2.5 bg-[#08090d]/90">
          {/* Public Site Link */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] text-xs font-mono text-neutral-300 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Globe size={13} className="text-neutral-400" />
              <span>View Public Site</span>
            </div>
            <ExternalLink size={12} className="text-neutral-400" />
          </Link>

          {/* Profile & Sign Out Bar */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold text-white shrink-0"
                style={{ backgroundColor: `${currentTheme.primary}30`, borderColor: `${currentTheme.primary}50` }}
              >
                RM
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate leading-tight">
                  {user.name || 'Admin'}
                </p>
                <p className="text-[10px] font-mono text-neutral-400 truncate leading-tight">
                  {user.email || 'rohanmia.org@gmail.com'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all shrink-0 cursor-pointer"
              title="Sign out of admin session"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================
          MOBILE HEADER BAR (< md)
         ======================================================== */}
      <header className="md:hidden sticky top-0 left-0 right-0 z-40 bg-[#08090d]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 py-3 flex items-center justify-between">
        <Link href={basePath} className="flex items-center gap-2">
          <AnimatedLogo size={26} animated={true} />
          <span className="font-serif text-sm font-medium text-white">Rohan Mia</span>
        </Link>

        <div className="flex items-center gap-2">
          <ColorSwitcher variant="dropdown" />
          <button
            className="p-2 rounded-xl bg-white/[0.03] text-neutral-400 hover:text-white relative cursor-pointer"
            title="Notifications"
          >
            <Bell size={16} />
            <span 
              className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" 
              style={{ backgroundColor: currentTheme.primary }} 
            />
          </button>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* ========================================================
          MAIN CANVAS AREA
          - Gets md:pl-64 on desktop so it sits right of the sidebar
          - Features a STICKY TOP COMMAND BAR that never overlaps sidebar
         ======================================================== */}
      <div className="md:pl-64 min-h-screen flex flex-col relative z-10">
        {/* GLOBAL TOP COMMAND HEADER (Sticky across all admin pages) */}
        <header className="sticky top-0 z-30 w-full bg-[#08090d]/85 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-2.5 flex items-center justify-between gap-4 select-none">
          {/* Left: Minimalist Elegant Page Indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono tracking-wider text-neutral-400 uppercase">
              Studio
            </span>
            <span className="text-neutral-600">/</span>
            <div className="flex items-center gap-1.5">
              <span 
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: currentTheme.primary }}
              />
              <h1 className="text-sm font-serif font-medium text-white tracking-wide">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* Middle: Mode Switcher (Surface Canvas vs Studio Engine) */}
          <div className="flex items-center p-1 rounded-2xl bg-black/40 border border-white/[0.08] shadow-inner">
            <button
              type="button"
              onClick={() => setMode('preview')}
              style={mode === 'preview' ? {
                backgroundColor: `${currentTheme.primary}20`,
                borderColor: `${currentTheme.primary}45`,
                color: '#ffffff'
              } : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
                mode === 'preview'
                  ? 'font-medium shadow-xs'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Eye size={13} style={mode === 'preview' ? { color: currentTheme.primary } : undefined} />
              <span className="hidden sm:inline">Surface Canvas</span>
              <span className="sm:hidden">Canvas</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('studio')}
              style={mode === 'studio' ? {
                backgroundColor: `${currentTheme.primary}20`,
                borderColor: `${currentTheme.primary}45`,
                color: '#ffffff'
              } : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
                mode === 'studio'
                  ? 'font-medium shadow-xs'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal size={13} style={mode === 'studio' ? { color: currentTheme.primary } : undefined} />
              <span className="hidden sm:inline">Studio Engine</span>
              <span className="sm:hidden">Engine</span>
            </button>
          </div>

          {/* Right: Theme Switcher + Quick Live Site + Notification Bell */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Theme Selector (Moved here from Left Sidebar) */}
            <div className="hidden sm:block">
              <ColorSwitcher variant="dropdown" />
            </div>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs font-mono text-neutral-300 hover:text-white transition-colors"
            >
              <span>Live View</span>
              <ExternalLink size={11} className="text-neutral-400" />
            </Link>

            {/* Notification Bell Icon */}
            <button
              type="button"
              className="relative p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-neutral-400 hover:text-white transition-all cursor-pointer group"
              title="Notifications & System Activity"
              onClick={() => {}}
            >
              <Bell size={15} className="group-hover:rotate-12 transition-transform duration-200" />
              <span 
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full animate-pulse" 
                style={{ backgroundColor: currentTheme.primary }} 
              />
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 pb-24 md:pb-16 pt-0">
          {children}
        </main>

      </div>

      {/* ========================================================
          MOBILE BOTTOM NAVIGATION BAR (< md)
         ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0e14]/90 backdrop-blur-2xl border-t border-white/[0.08] px-3 py-2 flex items-center justify-around safe-area-inset-bottom shadow-2xl">
        {[
          { name: 'Home', href: basePath, icon: Home },
          { name: 'About', href: `${basePath}/about`, icon: User2 },
          { name: 'Work', href: `${basePath}/projects`, icon: FolderGit2 },
          { name: 'Stack', href: `${basePath}/tech-stack`, icon: Cpu },
        ].map((tab) => {
          const active = isLinkActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              style={active ? { color: currentTheme.primary } : undefined}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${
                active ? 'font-semibold' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon size={18} />
              <span className="text-[10px] font-mono leading-none">{tab.name}</span>
              {active && (
                <span 
                  className="w-1 h-1 rounded-full mt-0.5"
                  style={{
                    backgroundColor: currentTheme.primary,
                    boxShadow: `0 0 6px ${currentTheme.primary}`
                  }}
                />
              )}
            </Link>
          );
        })}

        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <LayoutGrid size={18} />
          <span className="text-[10px] font-mono leading-none">More</span>
        </button>
      </nav>

      {/* Mobile More Drawer */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div 
            className="w-full max-w-sm rounded-3xl bg-[#0c0e14] border border-white/15 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} style={{ color: currentTheme.primary }} />
                <span className="text-sm font-semibold text-white">Studio Panels</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.slice(4).map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    style={active ? {
                      borderColor: `${currentTheme.primary}40`,
                      backgroundColor: `${currentTheme.primary}12`,
                      color: '#ffffff'
                    } : undefined}
                    className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all ${
                      active 
                        ? 'border font-semibold shadow-xs' 
                        : 'border-white/[0.06] bg-white/[0.02] text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <Icon size={18} style={active ? { color: currentTheme.primary } : undefined} className="mb-1" />
                    <span className="text-xs font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>{user.email || 'Admin'}</span>
              <button
                onClick={handleSignOut}
                className="text-rose-400 hover:underline cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminShell(props: AdminShellProps) {
  return (
    <ToastProvider>
      <AdminModeProvider>
        <AdminShellContent {...props} />
      </AdminModeProvider>
    </ToastProvider>
  );
}
