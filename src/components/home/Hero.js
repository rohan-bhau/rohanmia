'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import Magnetic from '@/components/shared/Magnetic';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cpu, GraduationCap } from 'lucide-react';

export default function Hero({ settings, heroContent }) {
  const titles = heroContent?.titles || [
    "Frontend Developer",
    "JavaScript Developer",
    "Fullstack Developer"
  ];

  const heroDescription = heroContent?.description || settings?.heroText || "Professional modern developer focused on building high-performance web applications with cinematic user experiences and scalable architectures.";
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentTitle = titles[index];
    const speed = isDeleting ? 40 : 80;

    const timeout = setTimeout(() => {
      if (!isDeleting && displayText === currentTitle) {
        setTimeout(() => setIsDeleting(true), 2500);
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % titles.length);
      } else {
        setDisplayText(currentTitle.substring(0, isDeleting ? displayText.length - 1 : displayText.length + 1));
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, index]);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden bg-background">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Content */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <h3 className="text-foreground/60 font-medium tracking-wide text-xl">
                {heroContent?.greeting || "Hey, I'm"}
              </h3>
            </motion.div>

            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight flex items-center gap-4 uppercase italic">
                {heroContent?.firstName || "Rohan"} <span className="text-glow">{heroContent?.lastName || "Mia"}</span>
                <motion.span
                  animate={{ rotate: [0, 20, 0, 20, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block origin-bottom-right text-4xl md:text-6xl"
                >
                  👋
                </motion.span>
              </h1>
              <div className="h-12 flex items-center">
                <span className="text-xl md:text-2xl font-medium text-foreground/70 italic">
                  I am a <span className="text-foreground">{displayText}</span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1 h-6 bg-primary ml-2 align-middle"
                  />
                </span>
              </div>
            </div>
          </div>

          <p className="text-foreground/50 text-base md:text-lg max-w-md leading-relaxed font-normal">
            🚀 {heroDescription}
          </p>

          {mounted && (
            <div className="flex items-center gap-4 md:gap-6 pt-4">
              <Magnetic strength={0.2}>
                <Link href="/contact" className="px-8 md:px-10 py-4 md:py-5 rounded-2xl bg-primary text-white font-bold shadow-[0_20px_40px_rgba(14,165,233,0.25)] hover:shadow-[0_25px_50px_rgba(14,165,233,0.4)] hover:-translate-y-1 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base whitespace-nowrap">
                  Say Hello 🚀
                </Link>
              </Magnetic>
              <Magnetic strength={0.2}>
                <Link href="/projects" className="px-8 md:px-10 py-4 md:py-5 rounded-2xl glass-premium border border-white/10 text-foreground font-bold hover:bg-foreground/5 transition-all duration-300 active:scale-95 text-sm md:text-base whitespace-nowrap">
                  Explore Projects
                </Link>
              </Magnetic>
            </div>
          )}

        </motion.div>

        {/* Vertical Socials (Matching Reference) */}
        <div className="hidden lg:flex fixed left-10 top-1/2 -translate-y-1/2 flex-col gap-8 z-20">
          {[
            { icon: FaLinkedin, href: "https://linkedin.com" },
            { icon: FaGithub, href: "https://github.com" },
            { icon: FaXTwitter, href: "https://twitter.com" },
          ].map((social, i) => (
            <Magnetic key={i} strength={0.4}>
              <Link 
                href={social.href} 
                target="_blank" 
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-foreground/40 hover:text-primary hover:border-primary/50 transition-all duration-300"
              >
                <social.icon size={20} />
              </Link>
            </Magnetic>
          ))}
        </div>

        {/* Right Side: Profile Image with Premium Floating Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex justify-center lg:justify-end"
        >
          <motion.div 
            animate={{ 
              y: [0, -15, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative w-72 h-72 md:w-[480px] md:h-[640px] group"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-3xl -z-10 group-hover:bg-primary/20 transition-colors duration-500" />
            
            {/* Main Image Container (Card Style) */}
            <div className="relative w-full h-full rounded-[3rem] overflow-hidden border-2 border-white/10 dark:border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-[1.02]">
              <Image
                src={heroContent?.bannerImage || "/hero-art.jpg"}
                alt={heroContent?.firstName || "Rohan Mia"}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                priority
              />
              {/* Artistic Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[3rem]" />
            </div>

            {/* Floating Experience Badge */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute -bottom-6 -left-10 glass-premium px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-primary/20"
            >
              <div className="p-3 bg-primary/20 rounded-xl text-primary">
                <GraduationCap size={20} />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">1+</div>
                <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Year Experience</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Down Indicator (Bottom Left) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-10 hidden lg:flex flex-col items-center gap-4"
      >
        <div className="w-6 h-10 border-2 border-foreground/20 rounded-full flex justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-2 bg-primary rounded-full"
          />
        </div>
        <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Scroll Down</span>
      </motion.div>
    </section>
  );
}

