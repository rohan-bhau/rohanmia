'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Mail, 
  MapPin, 
  Clock, 
  Heart,
  Sparkles
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { usePathname } from 'next/navigation';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { useBooking } from '@/components/booking/BookingContext';
import DiscoveryBanner from '@/components/home/DiscoveryBanner';
import AnimatedLogo from '@/components/shared/AnimatedLogo';

export default function Footer() {
  const pathname = usePathname();
  const { currentTheme } = useThemeAccent();
  const { openBooking } = useBooking();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      // Dhaka Time (Asia/Dhaka GMT+6)
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setTime(new Intl.DateTimeFormat('en-US', options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <DiscoveryBanner />
      <footer className="relative mt-8 border-t border-white/[0.08] bg-[#07080a] overflow-hidden">
      {/* Dynamic ambient top glow line */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] opacity-70 blur-[1px] transition-all duration-700"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${currentTheme.primary} 50%, transparent 100%)`,
        }}
      />
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-32 blur-[100px] opacity-15 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: currentTheme.primary }}
      />

      <div className="container mx-auto max-w-6xl px-6 pt-16 pb-24 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/[0.08]">
          {/* Col 1: Identity & Timezone */}
          <div className="md:col-span-5 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3.5">
                <AnimatedLogo size={46} animated={false} className="shrink-0" />
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-none">
                    MD Rohan Mia
                  </h3>
                  <div className="flex items-center gap-2 pt-1.5">
                    <span className="text-[11px] text-muted-foreground font-mono leading-none">Software Engineer</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                Specializing in high-performance Next.js architectures, type-safe full-stack platforms, and cinematic UI/UX for world-class products.
              </p>
            </div>

            {/* Live Timezone & Status Pill */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-muted-foreground">
                <Clock size={13} style={{ color: currentTheme.primary }} />
                <span>Dhaka (GMT+6)</span>
                <span className="text-foreground font-semibold">{time || '12:00:00 PM'}</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Systems Operational</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground/80">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home / Overview
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
                  Case Studies & Archives
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About & Principles
                </Link>
              </li>
              <li>
                <Link href="/tech-stack" className="text-muted-foreground hover:text-foreground transition-colors">
                  Tech Stack & Tooling
                </Link>
              </li>
              <li>
                <Link href="/guestbook" className="text-muted-foreground hover:text-foreground transition-colors">
                  Visitor Guestbook
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-muted-foreground hover:text-foreground transition-colors">
                  Visual Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact & Inquiry
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Inquiry & Call CTA */}
          <div className="md:col-span-4 space-y-5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground/80">
              Start a Conversation
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Have a high-impact engineering role, freelance platform, or architectural consultation in mind?
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/contact#meeting"
                className="w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95"
                style={{
                  backgroundColor: currentTheme.primary,
                  color: currentTheme.contrastText,
                  boxShadow: `0 0 24px ${currentTheme.glow}`,
                }}
              >
                <Calendar size={14} />
                <span>Book 30-Min Discovery Call (In-Site)</span>
              </Link>

              <a
                href="mailto:rohanmia.org@gmail.com"
                className="w-full py-2.5 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-foreground flex items-center justify-center gap-2 transition-colors"
              >
                <Mail size={13} className="text-muted-foreground" />
                <span>rohanmia.org@gmail.com</span>
              </a>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://github.com/rohan-bhau"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-muted-foreground hover:text-foreground transition-colors"
                title="GitHub @rohan-bhau"
              >
                <FaGithub size={15} />
              </a>
              <a
                href="https://www.linkedin.com/in/rohan-mia/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-muted-foreground hover:text-foreground transition-colors"
                title="LinkedIn"
              >
                <FaLinkedin size={15} />
              </a>
              <a
                href="https://x.com/_Rohan_Bhau"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-muted-foreground hover:text-foreground transition-colors"
                title="Twitter / X"
              >
                <FaXTwitter size={15} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex items-center justify-center text-center text-xs font-mono text-muted-foreground/80">
          <p>© {new Date().getFullYear()} MD Rohan Mia. All rights reserved.</p>
        </div>
      </div>
    </footer>
    </>
  );
}
