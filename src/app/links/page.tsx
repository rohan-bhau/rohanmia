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
} from 'lucide-react';
import { FaGithub, FaLinkedin, FaXTwitter, FaFacebook, FaInstagram } from 'react-icons/fa6';
import { useThemeAccent } from '@/components/theme/ThemeProvider';

const CLOUDINARY_PROFILE_IMAGE = "https://res.cloudinary.com/dzni0yyle/image/upload/v1778155735/portfolio_cms/fcprc2kqkcmxitdibzcn.png";

interface LinkItem {
  title: string;
  handle: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  isExternal: boolean;
  color?: string;
}

export default function LinksPage() {
  const { currentTheme } = useThemeAccent();

  const codeCraftLinks: LinkItem[] = [
    {
      title: 'GitHub',
      handle: '@rohan-bhau',
      href: 'https://github.com/rohan-bhau',
      icon: FaGithub,
      isExternal: true,
      color: '#f0f6fc',
    },
    {
      title: 'Guestbook',
      handle: 'Leave a mark',
      href: '/guestbook',
      icon: BookOpen,
      isExternal: false,
      color: currentTheme.primary,
    },
    {
      title: 'Work Archive',
      handle: 'Engineering case studies',
      href: '/projects',
      icon: Briefcase,
      isExternal: false,
      color: currentTheme.primary,
    },
    {
      title: 'Tech Stack',
      handle: 'Architecture & tools',
      href: '/tech-stack',
      icon: Layers,
      isExternal: false,
      color: currentTheme.primary,
    },
  ];

  const connectLinks: LinkItem[] = [
    {
      title: 'LinkedIn',
      handle: 'in/rohan-mia',
      href: 'https://www.linkedin.com/in/rohan-mia/',
      icon: FaLinkedin,
      isExternal: true,
      color: '#0a66c2',
    },
    {
      title: 'Twitter / X',
      handle: '@_Rohan_Bhau',
      href: 'https://x.com/_Rohan_Bhau',
      icon: FaXTwitter,
      isExternal: true,
      color: '#ffffff',
    },
    {
      title: 'Facebook',
      handle: 'bhau.rohan',
      href: 'https://www.facebook.com/bhau.rohan',
      icon: FaFacebook,
      isExternal: true,
      color: '#1877f2',
    },
    {
      title: 'Instagram',
      handle: '__rohan.bhau',
      href: 'https://www.instagram.com/__rohan.bhau/',
      icon: FaInstagram,
      isExternal: true,
      color: '#e4405f',
    },
  ];

  const renderLinkCard = (item: LinkItem) => {
    const Icon = item.icon;
    const CardWrapper = item.isExternal ? 'a' : Link;
    const accentColor = item.color || currentTheme.primary;

    return (
      <CardWrapper
        key={item.title}
        href={item.href}
        {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#14161d]/90 to-[#0e1014]/95 border border-white/[0.08] hover:border-white/[0.22] transition-all duration-300 flex items-center justify-between shadow-lg hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] hover:-translate-y-1 overflow-hidden"
      >
        {/* Subtle top specular border highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 group-hover:via-white/30 to-transparent transition-all duration-300" />

        {/* Ambient Radial Spotlight on Hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{
            background: `radial-gradient(280px circle at top left, ${accentColor}18, transparent 75%)`
          }}
        />

        {/* Left Side: Icon & Info */}
        <div className="flex items-center gap-3.5 min-w-0 relative z-10">
          {/* 3D Elevated Icon Badge */}
          <div 
            className="w-11 h-11 rounded-xl bg-white/[0.03] group-hover:bg-white/[0.07] border border-white/[0.08] group-hover:border-white/20 flex items-center justify-center transition-all duration-300 shrink-0 shadow-inner group-hover:scale-105"
            style={{
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06)'
            }}
          >
            <Icon 
              size={19} 
              className="text-zinc-400 transition-all duration-300 group-hover:scale-110"
            />
          </div>

          {/* Text labels */}
          <div className="min-w-0">
            <div className="font-semibold text-sm text-zinc-100 group-hover:text-white transition-colors truncate">
              {item.title}
            </div>
            <div className="text-xs font-mono text-zinc-400 group-hover:text-zinc-300 transition-colors truncate mt-0.5">
              {item.handle}
            </div>
          </div>
        </div>

        {/* Right Side: Arrow Badge */}
        <div className="w-8 h-8 rounded-xl bg-white/[0.02] group-hover:bg-white/[0.08] border border-white/[0.06] group-hover:border-white/20 flex items-center justify-center transition-all duration-300 shrink-0 ml-3 shadow-sm relative z-10">
          <ArrowUpRight 
            size={15} 
            className="text-zinc-400 group-hover:text-white transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" 
          />
        </div>
      </CardWrapper>
    );
  };

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
        {/* Page Title */}
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

        {/* 2-Column Responsive Layout (Profile Card Left 4-cols, Links Right 8-cols, Matching Equal Height) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-stretch">
          
          {/* ============================================================== */}
          {/* LEFT: Profile Card (Equal height matching right column)         */}
          {/* ============================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-4 w-full max-w-[340px] mx-auto lg:max-w-none rounded-3xl bg-[#0f1115]/95 border border-white/[0.1] p-6 sm:p-7 shadow-2xl backdrop-blur-2xl relative group overflow-hidden flex flex-col justify-between h-full"
          >
            {/* Subtle glow border effect */}
            <div 
              className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: currentTheme.primary }}
            />

            {/* Top section: Avatar, Roles, Details */}
            <div className="flex flex-col items-center text-center w-full">
              {/* Profile Avatar with Online Pulsing Dot */}
              <div 
                className="relative w-24 h-24 rounded-full p-[2px] mb-4 shadow-xl group-hover:shadow-2xl transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.primary}90, rgba(255,255,255,0.15))`
                }}
              >
                <div className="relative w-full h-full rounded-full overflow-hidden bg-[#121316]">
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
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#0f1115] animate-pulse" 
                  title="Available for opportunities"
                />
              </div>

              {/* Name & Roles */}
              <h2 className="text-xl font-bold text-white tracking-tight">MD Rohan Mia</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs font-mono text-zinc-300">
                  Developer
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs font-mono text-zinc-300">
                  Freelancer
                </span>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-white/[0.08] my-5" />

              {/* Location & Email Details */}
              <div className="w-full space-y-2.5 text-left text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <MapPin size={14} className="text-zinc-500 shrink-0" />
                  <span className="truncate">Dhaka, Bangladesh</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="text-zinc-500 shrink-0" />
                  <a href="mailto:rohanmia.org@gmail.com" className="hover:text-white transition-colors truncate">
                    rohanmia.org@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom section: Action Buttons */}
            <div className="w-full space-y-2.5 mt-8 lg:mt-auto pt-4">
              {/* Primary Action: Book a Call */}
              <Link
                href="/contact#book-call"
                className="w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
          </motion.div>

          {/* ============================================================== */}
          {/* RIGHT: Grouped Links (8-cols, Enhanced Styling & Hover)         */}
          {/* ============================================================== */}
          <div className="lg:col-span-8 space-y-8 flex flex-col justify-between">
            
            {/* 1. CODE & CRAFT Section */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-3.5 text-xs font-mono uppercase tracking-wider text-muted-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.primary }} />
                <span className="font-semibold text-zinc-300">Code & Craft</span>
                <div className="h-px bg-white/[0.08] flex-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {codeCraftLinks.map(renderLinkCard)}
              </div>
            </motion.div>

            {/* 2. CONNECT Section */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-3.5 text-xs font-mono uppercase tracking-wider text-muted-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentTheme.primary }} />
                <span className="font-semibold text-zinc-300">Connect</span>
                <div className="h-px bg-white/[0.08] flex-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {connectLinks.map(renderLinkCard)}
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </div>
  );
}
