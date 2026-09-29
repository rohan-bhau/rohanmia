'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  ArrowRight, 
  Code2, 
  FileText
} from 'lucide-react';
import { useThemeAccent } from '@/components/theme/ThemeProvider';
import { useBooking } from '@/components/booking/BookingContext';

const ROTATING_ROLES = [
  'Full Stack Engineer',
  'Software Engineer',
  'Next.js & TypeScript Developer',
  'MERN & PostgreSQL Developer'
];

const CLOUDINARY_PROFILE_IMAGE = "https://res.cloudinary.com/dzni0yyle/image/upload/v1778155735/portfolio_cms/fcprc2kqkcmxitdibzcn.png";

export default function Hero() {
  const { currentTheme } = useThemeAccent();
  const { openBooking } = useBooking();

  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = ROTATING_ROLES[roleIndex];
    const speed = isDeleting ? 25 : 50;

    const timeout = setTimeout(() => {
      if (!isDeleting && displayText === current) {
        setTimeout(() => setIsDeleting(true), 2400);
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % ROTATING_ROLES.length);
      } else {
        setDisplayText(current.substring(0, isDeleting ? displayText.length - 1 : displayText.length + 1));
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, roleIndex]);

  return (
    <section className="relative pt-32 md:pt-40 pb-20 px-6 overflow-hidden">
      {/* LUXURY VELVET AMBIENT BACKGROUND: Horizon Accent Beam (Zero Square Box / Zero Grid) */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Luminous Horizon Accent Line under Navigation */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 max-w-5xl h-px opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, ${currentTheme.primary}, transparent)`,
          }}
        />

        {/* Ambient Top Spotlight Beam (Smooth, Deep, Zero Glare, Zero Boxes) */}
        <div 
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] opacity-25 blur-[120px] transition-all duration-1000"
          style={{
            background: `radial-gradient(50% 50% at 50% 25%, ${currentTheme.primary} 0%, transparent 80%)`,
          }}
        />

        {/* Bottom Smooth Canvas Fade into dark obsidian */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#08090a]" />
      </div>

      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Big Name, Title, Bio, Action Buttons (Span 7) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Clean Eyebrow Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-center lg:justify-start"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
                <span 
                  className="w-2 h-2 rounded-full animate-pulse" 
                  style={{ backgroundColor: currentTheme.primary, boxShadow: `0 0 10px ${currentTheme.glow}` }} 
                />
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                  Full Stack Software Engineer
                </span>
              </div>
            </motion.div>

            {/* PROMINENT NAME (Clean, Architectural, Grand) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <span className="text-sm sm:text-base font-mono text-muted-foreground block font-normal tracking-wide">
                  Hi, I'm
                </span>
                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-serif font-normal tracking-tight text-foreground leading-[1.02]">
                  Rohan{' '}
                  <span 
                    className="relative inline-block font-serif italic text-transparent bg-clip-text transition-all duration-700"
                    style={{
                      backgroundImage: `linear-gradient(135deg, #ffffff 35%, ${currentTheme.primary} 100%)`,
                    }}
                  >
                    Mia
                    {/* Sleek accent baseline marker */}
                    <span 
                      className="absolute -bottom-1 left-0 right-0 h-[2.5px] rounded-full opacity-60 transition-colors duration-500"
                      style={{
                        background: `linear-gradient(90deg, ${currentTheme.primary}, transparent)`
                      }}
                    />
                  </span>
                </h1>
              </div>

              {/* Dynamic Rotating Role with Code Terminal Indicator */}
              <div className="h-9 flex items-center justify-center lg:justify-start">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-xs font-mono text-muted-foreground/60">&gt;</span>
                  <p className="text-sm sm:text-base font-mono text-foreground font-semibold">
                    <span>{displayText}</span>
                    <span 
                      className="w-1.5 h-4 ml-1 inline-block animate-pulse rounded-xs"
                      style={{ backgroundColor: currentTheme.primary }}
                    />
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Authentic, Direct Bio */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed mx-auto lg:mx-0 font-normal"
            >
              I build modern full-stack web applications and digital products. Specializing in <strong className="text-foreground font-semibold">Next.js, React, TypeScript</strong>, and <strong className="text-foreground font-semibold">Node.js & MongoDB</strong>. Focused on writing clean, scalable code and delivering fast, intuitive user experiences.
            </motion.p>

            {/* Action Buttons: Book Call, View Projects, View Resume */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5"
            >
              {/* Primary Call Booking CTA */}
              <button
                onClick={openBooking}
                className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
                style={{
                  backgroundColor: currentTheme.primary,
                  color: currentTheme.contrastText,
                  boxShadow: `0 0 25px ${currentTheme.glow}`,
                }}
              >
                <Calendar size={15} />
                <span>Book a Call</span>
                <ArrowRight size={14} />
              </button>

              {/* View Projects Button */}
              <Link
                href="#projects"
                className="px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/20 text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
              >
                <Code2 size={15} className="text-muted-foreground" />
                <span>View Projects</span>
              </Link>

              {/* View Resume Button */}
              <a
                href="/api/download"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/15 text-xs sm:text-sm font-mono text-muted-foreground hover:text-foreground flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
              >
                <FileText size={15} style={{ color: currentTheme.primary }} />
                <span>View Resume</span>
              </a>
            </motion.div>

          </div>

          {/* Right Column: Clean, Elegant Portrait Showcase (Zero Badges, Pure Portrait) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center relative"
          >
            {/* Continuous Gentle Floating Animation */}
            <motion.div 
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 0.3, 0, -0.3, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
              className="relative w-full max-w-sm sm:max-w-md group"
            >
              {/* Soft Ambient Halo Behind Frame */}
              <div 
                className="absolute -inset-2 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
                style={{ backgroundColor: currentTheme.primary }}
              />

              {/* Portrait Container Frame */}
              <div className="relative rounded-[2.5rem] bg-[#0d0f14] border border-white/[0.12] group-hover:border-white/30 p-3 sm:p-4 shadow-2xl backdrop-blur-xl transition-all duration-500">
                <div className="relative h-[400px] sm:h-[460px] w-full rounded-[2rem] overflow-hidden bg-[#08090a]">
                  <Image
                    src={CLOUDINARY_PROFILE_IMAGE}
                    alt="Rohan Mia"
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 100vw, 450px"
                  />
                  {/* Subtle bottom vignette gradient for depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090a]/75 via-transparent to-transparent opacity-60" />
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
