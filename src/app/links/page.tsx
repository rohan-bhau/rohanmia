'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Mail, 
  Calendar, 
  Globe, 
  ArrowUpRight, 
  BookOpen, 
  Briefcase, 
  Layers, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaXTwitter, FaFacebook, FaInstagram } from 'react-icons/fa6';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

const CLOUDINARY_PROFILE_IMAGE = "https://res.cloudinary.com/dzni0yyle/image/upload/v1778155735/portfolio_cms/fcprc2kqkcmxitdibzcn.png";

export default function LinksPage() {
  const { currentTheme } = useThemeAccent();

  const codeCraftLinks = [
    {
      title: 'GitHub',
      handle: '@rohan-bhau',
      href: 'https://github.com/rohan-bhau',
      icon: FaGithub,
      isExternal: true,
    },
    {
      title: 'Guestbook',
      handle: 'Leave a mark',
      href: '/guestbook',
      icon: BookOpen,
      isExternal: false,
    },
    {
      title: 'Work Archive',
      handle: 'Engineering case studies',
      href: '/projects',
      icon: Briefcase,
      isExternal: false,
    },
    {
      title: 'Tech Stack',
      handle: 'Architecture & tools',
      href: '/tech-stack',
      icon: Layers,
      isExternal: false,
    },
  ];

  const connectLinks = [
    {
      title: 'LinkedIn',
      handle: 'in/rohan-mia',
      href: 'https://www.linkedin.com/in/rohan-mia/',
      icon: FaLinkedin,
      isExternal: true,
    },
    {
      title: 'Twitter / X',
      handle: '@_Rohan_Bhau',
      href: 'https://x.com/_Rohan_Bhau',
      icon: FaXTwitter,
      isExternal: true,
    },
    {
      title: 'Facebook',
      handle: 'bhau.rohan',
      href: 'https://www.facebook.com/bhau.rohan',
      icon: FaFacebook,
      isExternal: true,
    },
    {
      title: 'Instagram',
      handle: '__rohan.bhau',
      href: 'https://www.instagram.com/__rohan.bhau/',
      icon: FaInstagram,
      isExternal: true,
    },
  ];

  return (
    <div className="min-h-screen pt-32 md:pt-40 pb-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient Spotlight */}
      <div 
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-20 blur-[130px] pointer-events-none -z-10"
        style={{
          background: `radial-gradient(50% 50% at 50% 30%, ${currentTheme.primary} 0%, transparent 80%)`,
        }}
      />

      <div className="container mx-auto max-w-5xl">
        {/* Page Title (No badge pill, pure classical editorial serif) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12 sm:mb-14"
        >
          <span className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground/80 block mb-2.5">
            NETWORK
          </span>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-normal tracking-tight text-white leading-tight">
            Connect With{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 30%, ${currentTheme.primary} 100%)`,
              }}
            >
              Me
            </span>
          </h1>
        </motion.div>

        {/* 2-Column Responsive Layout (Profile Card Left, Links Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ============================================================== */}
          {/* LEFT: Profile Card (Matches Screenshot 2 reference)            */}
          {/* ============================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 rounded-3xl bg-[#121316]/95 border border-white/[0.1] p-6 shadow-2xl backdrop-blur-xl relative group overflow-hidden"
          >
            {/* Subtle glow border effect */}
            <div 
              className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: currentTheme.primary }}
            />

            {/* Profile Avatar with Online Pulsing Dot */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 p-1 shadow-xl relative mb-4">
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={CLOUDINARY_PROFILE_IMAGE}
                    alt="MD Rohan Mia"
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    sizes="96px"
                    priority
                  />
                </div>
                {/* Green Active Dot */}
                <span 
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#121316] animate-pulse" 
                  title="Available for opportunities"
                />
              </div>

              {/* Name & Roles (Subtle typography matching reference screenshot) */}
              <h2 className="text-2xl font-bold text-white tracking-tight">MD Rohan Mia</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-mono text-zinc-300">
                  Developer
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-mono text-zinc-300">
                  Freelancer
                </span>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-white/[0.08] my-5" />

              {/* Location & Email Details */}
              <div className="w-full space-y-2 text-left text-xs text-muted-foreground mb-6">
                <div className="flex items-center gap-2.5">
                  <MapPin size={14} className="text-zinc-500 shrink-0" />
                  <span>Dhaka, Bangladesh</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="text-zinc-500 shrink-0" />
                  <a href="mailto:rohanmia.org@gmail.com" className="hover:text-white transition-colors truncate">
                    rohanmia.org@gmail.com
                  </a>
                </div>
              </div>

              {/* Primary Action: Book a Call */}
              <div className="w-full space-y-2.5">
                <Link
                  href="/contact#book-call"
                  className="w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    backgroundColor: currentTheme.primary,
                    color: currentTheme.contrastText,
                    boxShadow: `0 0 20px ${currentTheme.glow}`,
                  }}
                >
                  <Calendar size={14} />
                  <span>Book a Call</span>
                  <ArrowUpRight size={14} />
                </Link>

                {/* Secondary Actions: Website & Email */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/"
                    className="py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Globe size={13} />
                    <span>Website</span>
                  </Link>

                  <a
                    href="mailto:rohanmia.org@gmail.com"
                    className="py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Mail size={13} />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ============================================================== */}
          {/* RIGHT: Grouped Links (CODE & CRAFT, CONNECT)                  */}
          {/* ============================================================== */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. CODE & CRAFT Section */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-3 text-xs font-mono uppercase tracking-wider text-muted-foreground/80">
                <span className="font-semibold text-zinc-300">Code & Craft</span>
                <div className="h-px bg-white/[0.08] flex-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {codeCraftLinks.map((item) => {
                  const Icon = item.icon;
                  const CardComponent = item.isExternal ? 'a' : Link;
                  return (
                    <CardComponent
                      key={item.title}
                      href={item.href}
                      {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="p-4 rounded-2xl bg-[#121316]/80 hover:bg-white/[0.05] border border-white/[0.08] hover:border-theme/40 transition-all duration-300 group flex items-center justify-between shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground group-hover:text-theme group-hover:bg-theme/10 group-hover:border-theme/30 transition-all shrink-0">
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-white group-hover:text-theme transition-colors">
                            {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.handle}
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight size={15} className="text-muted-foreground group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </CardComponent>
                  );
                })}
              </div>
            </motion.div>

            {/* 2. CONNECT Section */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-3 text-xs font-mono uppercase tracking-wider text-muted-foreground/80">
                <span className="font-semibold text-zinc-300">Connect</span>
                <div className="h-px bg-white/[0.08] flex-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {connectLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.title}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-2xl bg-[#121316]/80 hover:bg-white/[0.05] border border-white/[0.08] hover:border-theme/40 transition-all duration-300 group flex items-center justify-between shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground group-hover:text-theme group-hover:bg-theme/10 group-hover:border-theme/30 transition-all shrink-0">
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-white group-hover:text-theme transition-colors">
                            {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.handle}
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight size={15} className="text-muted-foreground group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  );
                })}
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </div>
  );
}
