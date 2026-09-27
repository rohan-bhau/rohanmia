'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Briefcase, 
  User, 
  Layers, 
  BookOpen, 
  Mail, 
  Menu, 
  X, 
  Command as CmdIcon, 
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import ColorSwitcher from '@/components/theme/ColorSwitcher';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { useBooking } from '@/components/booking/BookingContext';

const NAV_LINKS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'About', href: '/about', icon: User },
  { name: 'Stack', href: '/tech-stack', icon: Layers },
  { name: 'Guestbook', href: '/guestbook', icon: BookOpen },
  { name: 'Contact', href: '/contact', icon: Mail },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentTheme } = useThemeAccent();
  const { openBooking } = useBooking();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Do not render navbar inside admin dashboard
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'py-3' : 'py-5'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <nav
            className={`flex items-center justify-between px-4 sm:px-5 py-2.5 rounded-full border transition-all duration-300 ${
              isScrolled
                ? 'bg-[#0b0d10]/85 border-white/[0.12] shadow-[0_15px_35px_rgba(0,0,0,0.6)] backdrop-blur-xl'
                : 'bg-[#0f1115]/60 border-white/[0.08] backdrop-blur-lg'
            }`}
          >
            {/* Left: Brand / Avatar */}
            <div className="flex items-center gap-3">
              <Link href="/" className="group flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-xs transition-transform duration-300 group-hover:scale-105 border border-white/10"
                  style={{
                    backgroundColor: `${currentTheme.primary}20`,
                    color: currentTheme.primary,
                    boxShadow: `0 0 12px ${currentTheme.glow}`,
                  }}
                >
                  RM
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    Rohan Mia
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono leading-none">
                    Full Stack Engineer
                  </span>
                </div>
              </Link>

              {/* Status Pill (Live Availability) */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Available for Hire</span>
              </div>
            </div>

            {/* Center: Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1 bg-white/[0.03] px-2 py-1 rounded-full border border-white/[0.06]">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 rounded-full border border-white/15"
                        style={{
                          backgroundColor: `${currentTheme.primary}20`,
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* CMD+K Palette Trigger */}
              <button
                onClick={() => {
                  const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                  document.dispatchEvent(event);
                }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-muted-foreground hover:text-foreground transition-all duration-200"
                title="Open Command Palette (Cmd + K)"
              >
                <CmdIcon size={12} />
                <span>K</span>
              </button>

              {/* Multi-Accent Color Switcher */}
              <ColorSwitcher variant="dropdown" />

              {/* Book Call CTA (Triggers in-site Calendly modal) */}
              <button
                onClick={openBooking}
                className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 hover:scale-105 active:scale-95 text-white shadow-sm"
                style={{
                  backgroundColor: currentTheme.primary,
                  boxShadow: `0 0 16px ${currentTheme.glow}`,
                }}
              >
                <Calendar size={13} />
                <span>Book Call</span>
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex md:hidden p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-20 z-40 md:hidden p-5 rounded-3xl bg-[#0c0e12]/95 border border-white/[0.12] backdrop-blur-2xl shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Navigation
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Available</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/[0.08] text-white font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} style={{ color: isActive ? currentTheme.primary : undefined }} />
                      <span>{link.name}</span>
                    </div>
                    {isActive && (
                      <span 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: currentTheme.primary }} 
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBooking();
                }}
                className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-white shadow-lg"
                style={{
                  backgroundColor: currentTheme.primary,
                  boxShadow: `0 0 20px ${currentTheme.glow}`,
                }}
              >
                <Calendar size={15} />
                <span>Schedule a 15-Min Call</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
