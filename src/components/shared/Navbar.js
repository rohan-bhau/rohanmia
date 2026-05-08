'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Cpu, 
  GraduationCap, 
  Briefcase, 
  Mail, 
  Send,
  LayoutGrid,
  ChevronDown,
  User,
  Code,
  MessageSquare,
  Image as ImageIcon,
  Menu,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Magnetic from './Magnetic';
import ThemeToggle from './ThemeToggle';
import Tooltip from './Tooltip';

const navItems = [
  { name: 'Home', href: '/', icon: Home, color: '#eab308' },
  { name: 'Tech Stack', href: '/tech-stack', icon: Cpu, color: '#06b6d4' },
  { name: 'Qualification', href: '/qualification', icon: GraduationCap, color: '#a855f7' },
  { name: 'Projects', href: '/projects', icon: Briefcase, color: '#f97316' },
  { name: 'Contact Me', href: '/contact', icon: Send, color: '#ec4899' },
];

const dropdownItems = [
  { name: 'About', href: '/about', icon: User },
  { name: 'Skills', href: '/skills', icon: Code },
  { name: 'Testimonials', href: '/testimonials', icon: MessageSquare },
  { name: 'Gallery', href: '/gallery', icon: ImageIcon },
];

export default function Navbar({ settings }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-active');
    } else {
      document.body.classList.remove('mobile-menu-active');
    }
    return () => document.body.classList.remove('mobile-menu-active');
  }, [isMobileMenuOpen]);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 w-full z-[10000000] transition-all duration-500",
        isScrolled 
          ? "py-4 bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-2xl" 
          : "py-6 bg-transparent"
      )}>
        <div className="container mx-auto px-6 flex items-center justify-between relative">
          
          {/* Left: Logo */}
          <div className="flex-1 flex justify-start z-[10000001]">
            <Tooltip text="Return Home" position="bottom">
              <Magnetic strength={0.3}>
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="group flex items-center gap-2">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    {settings?.logoUrl ? (
                      <div className="relative w-8 h-8 flex items-center justify-center">
                        <img 
                          src={settings.logoUrl} 
                          alt={settings.siteName || "Logo"} 
                          className="w-full h-full object-contain brightness-110 drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]" 
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black italic shadow-lg text-sm">
                        {settings?.siteName ? settings.siteName.charAt(0).toUpperCase() : 'A'}
                      </div>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-xs font-black tracking-tighter text-foreground uppercase italic leading-none">{settings?.siteName || "Rohan Mia"}</span>
                    <span className="text-[8px] font-bold tracking-[0.2em] text-primary uppercase italic opacity-80">Portfolio</span>
                  </div>
                </Link>
              </Magnetic>
            </Tooltip>
          </div>

          {/* Center: Desktop Menu */}
          <div className="hidden lg:flex items-center justify-center px-1 py-1 bg-white/[0.03] dark:bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl">
            <div className="flex items-center gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <Magnetic strength={0.2}>
                      <div className={cn(
                        "px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] italic transition-all duration-500 flex items-center gap-2 relative group",
                        isActive ? "text-white" : "text-white/40 hover:text-white"
                      )}>
                        {isActive && (
                          <motion.div
                            layoutId="nav-pill"
                            className="absolute inset-0 bg-primary rounded-full -z-10 shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <item.icon size={10} className={cn("transition-transform group-hover:scale-110", isActive ? "text-white" : "text-primary")} />
                        {item.name}
                      </div>
                    </Magnetic>
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <div className="relative">
                <Magnetic strength={0.2}>
                  <button
                    onMouseEnter={() => setIsMoreOpen(true)}
                    onMouseLeave={() => setIsMoreOpen(false)}
                    className={`px-4 py-2 rounded-full flex items-center gap-1.5 transition-all duration-300 ${
                      isMoreOpen ? 'text-foreground bg-white/10' : 'text-foreground/40 hover:text-foreground'
                    }`}
                  >
                    <LayoutGrid size={14} />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">More</span>
                    <ChevronDown size={12} className={`transition-transform duration-300 ${isMoreOpen ? 'rotate-180' : ''}`} />
                  </button>
                </Magnetic>

                <AnimatePresence>
                  {isMoreOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      onMouseEnter={() => setIsMoreOpen(true)}
                      onMouseLeave={() => setIsMoreOpen(false)}
                      className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 glass-premium border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-3xl bg-black/40"
                    >
                      {dropdownItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground hover:bg-white/5 transition-all group"
                        >
                          <item.icon size={14} className="text-foreground/30 group-hover:text-primary transition-colors" />
                          {item.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right: Theme Toggle & Trigger */}
          <div className="flex-1 flex justify-end items-center gap-3 z-[10000001]">
            {mounted && (
              <div className="hidden lg:block">
                <Magnetic strength={0.4}>
                  <div className="w-10 h-10 rounded-full glass border border-white/10 shadow-xl flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                    <ThemeToggle />
                  </div>
                </Magnetic>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center bg-white/5 group"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                    <X size={18} className="text-primary" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
                    <Menu size={18} className="text-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && mounted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999999] lg:hidden bg-background/95 backdrop-blur-xl"
            style={{ height: '100dvh' }}
          >
            <div className="h-full w-full overflow-y-auto custom-scrollbar flex flex-col">
              
              {/* Header inside Drawer */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border/10">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                  {settings?.logoUrl ? (
                    <img 
                      src={settings.logoUrl} 
                      alt={settings.siteName || "Logo"} 
                      className="h-8 w-auto object-contain brightness-110 drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]" 
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black italic shadow-lg text-sm">
                      {settings?.siteName ? settings.siteName.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-lg bg-foreground/5 border border-border/10 flex items-center justify-center text-primary">
                  <X size={20} />
                </button>
              </div>

              {/* Content Area */}
              <div className="px-4 py-2 space-y-2 flex-1 flex flex-col justify-center">
                {/* Visual Mode Card - Ultra Slim */}
                <div className="py-2 px-4 rounded-xl bg-foreground/[0.03] border border-border/5 flex items-center justify-between mx-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground/60 italic">Neural Sync</span>
                  </div>
                  <div className="scale-[0.75] origin-right">
                    <ThemeToggle />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="grid grid-cols-1 gap-1 px-1">
                    {[...navItems, ...dropdownItems].map((item, i) => {
                      const isActive = pathname === item.href;
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "group flex items-center gap-3 px-3 py-2 rounded-xl border transition-all",
                              isActive ? "bg-primary/10 border-primary/20" : "bg-foreground/[0.02] border-border/5"
                            )}
                          >
                            <div className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                              isActive ? "bg-primary text-white" : "bg-foreground/5 text-foreground/20 group-hover:text-primary"
                            )}>
                              <item.icon size={14} />
                            </div>
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-tighter italic",
                              isActive ? "text-foreground font-black" : "text-foreground/40"
                            )}>
                              {item.name}
                            </span>
                            <div className="ml-auto w-1 h-1 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer inside Drawer */}
              <div className="p-2 border-t border-border/10 text-center">
                <span className="text-[7px] font-black uppercase tracking-[0.4em] text-foreground/10 italic">
                  Systems Ready // {new Date().getFullYear()}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
