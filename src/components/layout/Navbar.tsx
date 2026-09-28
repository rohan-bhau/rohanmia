'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Code2
} from 'lucide-react';
import ColorSwitcher from '@/components/theme/ColorSwitcher';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { useBooking } from '@/components/booking/BookingContext';

const PRIMARY_LINKS = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'About', href: '/about', icon: User },
  { name: 'Work', href: '/projects', icon: Briefcase },
  { name: 'Stack', href: '/tech-stack', icon: Layers },
];

const MORE_LINKS = [
  { name: 'Guestbook', href: '/guestbook', icon: BookOpen, desc: 'Leave your note or greeting' },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon, desc: 'Visual moments & snapshots' },
  { name: 'Testimonials', href: '/testimonials', icon: MessageSquare, desc: 'Endorsements from founders' },
  { name: 'Contact', href: '/contact', icon: Mail, desc: 'Direct message & project inquiry' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { currentTheme } = useThemeAccent();
  const { openBooking } = useBooking();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Do not render navbar inside admin dashboard
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isMoreActive = MORE_LINKS.some((item) => pathname === item.href);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'py-3 bg-[#08090a]/80 backdrop-blur-xl border-b border-white/[0.06]' 
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex items-center justify-between">
            
            {/* Left: Brand Identity (Clean, outside of any pill border) */}
            <div className="flex items-center gap-3">
              <Link href="/" className="group flex items-center gap-2.5">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-xs transition-all duration-300 group-hover:scale-105 border border-white/10 shadow-lg relative overflow-hidden"
                  style={{
                    backgroundColor: `${currentTheme.primary}15`,
                    color: currentTheme.primary,
                    boxShadow: `0 0 16px ${currentTheme.glow}`,
                  }}
                >
                  <Code2 size={18} style={{ color: currentTheme.primary }} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    Rohan Mia
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono leading-none">
                    Software Engineer
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Floating Navigation Pill (Enclosed in its own glass border) */}
            <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0f1115]/80 border border-white/[0.08] backdrop-blur-xl shadow-lg relative">
              {PRIMARY_LINKS.map((link) => {
                const isActive = link.href === '/' 
                  ? pathname === '/' 
                  : pathname === link.href || pathname?.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navActivePill"
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

              {/* More Dropdown Trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isMoreActive
                      ? 'text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-expanded={moreDropdownOpen}
                >
                  <span>More</span>
                  <ChevronDown 
                    size={12} 
                    className={`transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {moreDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-3 w-56 p-2 rounded-2xl bg-[#0c0e12]/95 border border-white/[0.1] backdrop-blur-2xl shadow-2xl z-50 flex flex-col gap-1"
                    >
                      {MORE_LINKS.map((item) => {
                        const Icon = item.icon;
                        const isCurrent = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMoreDropdownOpen(false)}
                            className={`flex items-center gap-3 p-2.5 rounded-xl text-xs transition-colors ${
                              isCurrent
                                ? 'bg-white/[0.08] text-white font-semibold'
                                : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                            }`}
                          >
                            <div 
                              className="p-1.5 rounded-lg border border-white/10"
                              style={{ backgroundColor: `${currentTheme.primary}15` }}
                            >
                              <Icon size={14} style={{ color: currentTheme.primary }} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{item.name}</span>
                              <span className="text-[10px] text-muted-foreground/80">{item.desc}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Right: Actions (Standing clean and modular outside the nav pill) */}
            <div className="flex items-center gap-2.5">
              {/* CMD+K Palette Trigger */}
              <button
                onClick={() => {
                  const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
                  document.dispatchEvent(event);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[11px] font-mono text-muted-foreground hover:text-foreground transition-all duration-200"
                title="Open Command Palette (Cmd + K)"
              >
                <CmdIcon size={12} />
                <span>K</span>
              </button>

              {/* Multi-Accent Color Switcher */}
              <ColorSwitcher variant="dropdown" />

              {/* Book Call CTA with High Contrast Fix */}
              <button
                onClick={openBooking}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                style={{
                  backgroundColor: currentTheme.primary,
                  color: currentTheme.contrastText,
                  boxShadow: `0 0 16px ${currentTheme.glow}`,
                }}
              >
                <Calendar size={13} />
                <span>Book Call</span>
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex md:hidden p-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>

          </div>
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
            className="fixed inset-x-4 top-20 z-40 md:hidden p-6 rounded-3xl bg-[#0c0e12]/95 border border-white/[0.12] backdrop-blur-2xl shadow-2xl flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Navigation Menu
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">MD Rohan Mia</span>
            </div>

            <div className="flex flex-col gap-1">
              {[...PRIMARY_LINKS, ...MORE_LINKS].map((link) => {
                const Icon = link.icon;
                const isActive = link.href === '/' 
                  ? pathname === '/' 
                  : pathname === link.href || pathname?.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium transition-colors ${
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

            <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBooking();
                }}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold shadow-lg"
                style={{
                  backgroundColor: currentTheme.primary,
                  color: currentTheme.contrastText,
                  boxShadow: `0 0 20px ${currentTheme.glow}`,
                }}
              >
                <Calendar size={15} />
                <span>Schedule a 15-Min Discovery Call</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
