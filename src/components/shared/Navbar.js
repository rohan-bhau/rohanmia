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
  MoreHorizontal,
  ChevronDown,
  User,
  Code,
  MessageSquare,
  Image as ImageIcon
} from 'lucide-react';
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8">
      <div className="container mx-auto flex items-center justify-between">
        
        <div className="flex-1 flex justify-start">
          <Tooltip text="Return Home" position="bottom">
            <Magnetic strength={0.3}>
              <Link href="/" className="group flex items-center gap-2">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  {settings?.logoUrl ? (
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <img 
                        src={settings.logoUrl} 
                        alt={settings.siteName || "Logo"} 
                        className="w-full h-full object-contain brightness-110 drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]" 
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black italic shadow-lg">
                      {settings?.siteName ? settings.siteName.charAt(0).toUpperCase() : 'A'}
                    </div>
                  )}
                  <div className="absolute -inset-2 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </Magnetic>
          </Tooltip>
        </div>

        {/* Center: Floating Pill Menu */}
        <div className="hidden lg:flex flex-[3] justify-center">
          <div className="glass-premium px-2 py-2 rounded-full border border-border flex items-center gap-1 shadow-2xl backdrop-blur-2xl">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Magnetic key={item.name} strength={0.2}>
                  <Link
                    href={item.href}
                    className={`relative px-5 py-2.5 rounded-full flex items-center gap-2 transition-all duration-300 group whitespace-nowrap ${
                      isActive ? 'bg-white/10 text-foreground' : 'text-foreground/40 hover:text-foreground'
                    }`}
                  >
                    <item.icon size={18} style={{ color: isActive ? item.color : 'inherit' }} className="transition-colors" />
                    <span className="text-xs font-semibold tracking-wide">
                      {item.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-white/5 rounded-full -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                </Magnetic>
              );
            })}

            {/* More Dropdown */}
            <div className="relative">
              <Tooltip text="Explore More" position="top">
                <Magnetic strength={0.2}>
                  <button
                    onMouseEnter={() => setIsMoreOpen(true)}
                    onMouseLeave={() => setIsMoreOpen(false)}
                    className={`px-5 py-2.5 rounded-full flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${
                      isMoreOpen ? 'text-foreground bg-white/10' : 'text-foreground/40 hover:text-foreground'
                    }`}
                  >
                    <LayoutGrid size={18} />
                    <span className="text-xs font-semibold tracking-wide">More</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isMoreOpen ? 'rotate-180' : ''}`} />
                  </button>
                </Magnetic>
              </Tooltip>

              <AnimatePresence>
                {isMoreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    onMouseEnter={() => setIsMoreOpen(true)}
                    onMouseLeave={() => setIsMoreOpen(false)}
                    className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-56 glass-premium border border-white/10 rounded-3xl p-3 shadow-2xl backdrop-blur-3xl bg-black/40"
                  >
                    {dropdownItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-xs font-semibold text-foreground/50 hover:text-foreground hover:bg-white/5 transition-all group"
                      >
                        <item.icon size={16} className="text-foreground/30 group-hover:text-primary transition-colors" />
                        {item.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right: Theme Toggle */}
        <div className="flex-1 flex justify-end">
          <Magnetic strength={0.4}>
            <div className="w-12 h-12 rounded-full glass border border-white/10 shadow-2xl flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-xl">
              <ThemeToggle />
            </div>
          </Magnetic>
        </div>

      </div>
    </nav>
  );
}
