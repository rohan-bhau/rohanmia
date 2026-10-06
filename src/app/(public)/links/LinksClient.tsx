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
import type { AdminCustomLink } from '@/lib/constants/defaults';

interface LinksClientProps {
  links?: AdminCustomLink[];
  profileData?: {
    name?: string;
    roles?: string[];
    avatar?: string;
    location?: string;
    email?: string;
  };
  compactTop?: boolean;
}

export default function LinksClient({ 
  links = [], 
  profileData = {},
  compactTop = false 
}: LinksClientProps) {
  const { currentTheme } = useThemeAccent();

  const resolveIcon = (iconName?: string, title?: string) => {
    const key = (iconName || title || '').toLowerCase();
    if (key.includes('github')) return FaGithub;
    if (key.includes('linkedin')) return FaLinkedin;
    if (key.includes('twitter') || key === 'x') return FaXTwitter;
    if (key.includes('facebook')) return FaFacebook;
    if (key.includes('instagram')) return FaInstagram;
    if (key.includes('guestbook') || key.includes('book')) return BookOpen;
    if (key.includes('project') || key.includes('work') || key.includes('archive')) return Briefcase;
    if (key.includes('stack') || key.includes('tech')) return Layers;
    if (key.includes('mail') || key.includes('email')) return Mail;
    return Globe;
  };

  const activeLinks = links.filter((l) => l.active !== false);
  const codeCraftLinks = activeLinks.filter((l) => l.category === 'code');
  const connectLinks = activeLinks.filter((l) => l.category !== 'code');

  const displayName = profileData.name || 'MD Rohan Mia';
  const displayRoles = profileData.roles && profileData.roles.length > 0 
    ? profileData.roles.slice(0, 2) 
    : ['Developer', 'Freelancer'];
  const displayAvatar = profileData.avatar || 'https://res.cloudinary.com/dzni0yyle/image/upload/v1778155735/portfolio_cms/fcprc2kqkcmxitdibzcn.png';
  const displayLocation = profileData.location || 'Dhaka, Bangladesh';
  const displayEmail = profileData.email || '';

  const renderLinkCard = (item: AdminCustomLink) => {
    const Icon = resolveIcon(item.iconName, item.title);
    const CardWrapper = item.isExternal ? 'a' : Link;

    return (
      <CardWrapper
        key={item.id || item.title}
        href={item.href}
        {...(item.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group relative p-4 rounded-2xl bg-[#0e1014]/90 hover:bg-[#14161c]/90 border border-white/[0.06] hover:border-white/[0.16] transition-all duration-200 flex items-center gap-3.5 shadow-md overflow-hidden"
      >
        {/* Subtle hover specular highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 group-hover:via-white/20 to-transparent transition-all" />

        <div className="size-11 rounded-xl bg-white/[0.03] border border-white/[0.08] group-hover:border-white/15 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-white transition-colors shadow-inner">
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm text-zinc-100 group-hover:text-white transition-colors truncate">
            {item.title}
          </div>
          {item.handle && (
            <div className="text-xs font-mono text-zinc-500 group-hover:text-zinc-400 transition-colors truncate mt-0.5">
              {item.handle}
            </div>
          )}
        </div>
      </CardWrapper>
    );
  };

  return (
    <div className={`min-h-screen bg-[#07090e] text-neutral-200 selection:bg-cyan-500/20 selection:text-cyan-300 ${compactTop ? 'pt-2 sm:pt-4' : 'pt-24 sm:pt-32'} pb-20 relative overflow-hidden`}>
      
      {/* Background Subtle Ambient Glow */}
      <div 
        aria-hidden="true"
        className="fixed top-24 left-1/2 -translate-x-1/2 w-[650px] h-[350px] rounded-full blur-[140px] opacity-15 pointer-events-none"
        style={{ backgroundColor: currentTheme.primary }}
      />

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 relative z-10 space-y-10">
        
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-white tracking-tight leading-[1.12]">
            Connect With{' '}
            <span 
              className="font-serif italic font-normal text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 40%, ${currentTheme.primary} 100%)`,
              }}
            >
              Me
            </span>
          </h1>
        </div>

        {/* 2-Column Responsive Layout: Fixed Compact Left Profile Card, Right Links Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          
          {/* ============================================================== */}
          {/* LEFT: Compact Profile Card (Fixed 280px width)                 */}
          {/* ============================================================== */}
          <div className="w-full max-w-[280px] mx-auto rounded-[28px] bg-[#0e1015]/95 border border-white/[0.08] p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col items-center text-center">
            
            {/* Subtle glow border effect */}
            <div 
              className="absolute -top-24 -left-24 w-44 h-44 rounded-full blur-3xl opacity-15 pointer-events-none"
              style={{ backgroundColor: currentTheme.primary }}
            />

            {/* Profile Avatar with Online Pulsing Dot */}
            <div className="relative size-24 rounded-full p-[2px] mb-3 shadow-xl">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-[#121316]">
                <Image
                  src={displayAvatar}
                  alt={displayName}
                  fill
                  className="object-cover object-top"
                  sizes="96px"
                  priority
                />
              </div>
              {/* Green Active Dot on bottom right */}
              <span 
                className="absolute bottom-1 right-1 size-3.5 rounded-full bg-emerald-500 ring-2 ring-[#0e1015]" 
                title="Available for opportunities"
              />
            </div>

            {/* Name */}
            <h2 className="text-lg font-bold text-white tracking-tight">{displayName}</h2>

            {/* 2 Pill Roles */}
            <div className="flex items-center justify-center gap-1.5 mt-2">
              {displayRoles.map((role, idx) => (
                <span key={idx} className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] font-mono text-zinc-400">
                  {role}
                </span>
              ))}
            </div>

            {/* Dashed Divider */}
            <div className="w-full border-t border-dashed border-white/10 my-4" />

            {/* Location & Email Details */}
            <div className="w-full space-y-2 text-left text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-zinc-500 shrink-0" />
                <span className="truncate">{displayLocation}</span>
              </div>
              {displayEmail && (
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-zinc-500 shrink-0" />
                  <a href={`mailto:${displayEmail.replace(/^mailto:/, '')}`} className="hover:text-white transition-colors truncate">
                    {displayEmail.replace(/^mailto:/, '')}
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2 mt-5">
              {/* Primary Action: Book a Call (White button) */}
              <Link
                href="/contact#meeting"
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Calendar size={14} />
                <span>Book a Call</span>
                <ArrowUpRight size={14} className="ml-auto" />
              </Link>

              {/* Secondary Actions: Website & Email */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/"
                  className="py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Globe size={13} />
                  <span>Website</span>
                </Link>

                <a
                  href={displayEmail ? `mailto:${displayEmail.replace(/^mailto:/, '')}` : '/contact'}
                  className="py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail size={13} />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* RIGHT: Grouped Links (Clean Grid Matching Reference)          */}
          {/* ============================================================== */}
          <div className="space-y-6">
            
            {/* 1. CODE & CRAFT Section (2 links: GitHub, Guestbook) */}
            {codeCraftLinks.length > 0 && (
              <div>
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                  CODE &amp; CRAFT
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {codeCraftLinks.map(renderLinkCard)}
                </div>
              </div>
            )}

            {/* 2. CONNECT Section (4 links: LinkedIn, Twitter / X, Facebook, Instagram) */}
            {connectLinks.length > 0 && (
              <div>
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                  CONNECT
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {connectLinks.map(renderLinkCard)}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
