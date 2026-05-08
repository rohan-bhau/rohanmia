'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Calendar, GraduationCap, Briefcase, Award } from 'lucide-react';

const journey = [
  {
    year: "2024",
    title: "Senior Full Stack Developer",
    company: "TechNova Solutions",
    description: "Leading the development of high-scale enterprise applications using Next.js and Cloud architecture.",
    icon: Briefcase
  },
  {
    year: "2022",
    title: "Bachelor of Science in CSE",
    company: "State University",
    description: "Graduated with honors, focusing on software engineering and artificial intelligence.",
    icon: GraduationCap
  },
  {
    year: "2020",
    title: "Junior Web Developer",
    company: "Creative Labs",
    description: "Started my journey in web development, mastering HTML, CSS, and modern JavaScript.",
    icon: Award
  }
];

import { useState, useEffect } from 'react';
import { getHomeContent } from '@/actions/content';

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const data = await getHomeContent("about");
      setAboutContent(data);
      setLoading(false);
    };
    fetchContent();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
    </div>
  );

  return (
    <div className="pt-40 pb-20 px-6 bg-background transition-colors duration-500">
      <div className="container mx-auto max-w-7xl space-y-32">
        
        {/* Intro Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <div className="h-px w-10 bg-primary/40" />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Identity</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tighter uppercase italic leading-none">
                {aboutContent?.titlePart1 || "The Story Behind"} <span className="text-primary text-glow">{aboutContent?.titlePart2 || "The Code"}</span>
              </h1>
            </div>
            
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed font-medium italic opacity-80">
              <p>
                {aboutContent?.p1 || "I am Rohan Mia, a professional Full Stack Developer based in Bangladesh, dedicated to engineering cinematic digital experiences."}
              </p>
              <p>
                {aboutContent?.p2 || "My approach blends high-performance code with world-class design aesthetics, ensuring every line of code serves a larger narrative of innovation and technical excellence."}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <div className="bg-card/30 border border-border p-6 rounded-3xl backdrop-blur-xl">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Nationality</p>
                <p className="text-foreground font-bold italic">{aboutContent?.nationality || "Bangladeshi // Dhaka"}</p>
              </div>
              <div className="bg-card/30 border border-border p-6 rounded-3xl backdrop-blur-xl">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Communication</p>
                <p className="text-foreground font-bold italic">{aboutContent?.communication || "English, Bangla, Hindi"}</p>
              </div>
            </div>
          </motion.div>

          {/* Premium Image Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative flex justify-center lg:justify-end"
          >
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-full max-w-[450px] aspect-[3/4] group"
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-[80px] -z-10 group-hover:bg-primary/30 transition-colors duration-700" />
              
              <div className="relative w-full h-full rounded-[3rem] overflow-hidden border-2 border-border shadow-2xl transition-transform duration-700 group-hover:scale-[1.03]">
                <Image 
                  src={aboutContent?.image || "/hero-art.jpg"} 
                  alt="Rohan Mia" 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-60 dark:opacity-100" />
                
                {/* Circuit Decoration overlay */}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[3rem]" />
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-6 -right-6 glass-premium px-8 py-4 rounded-2xl border border-primary/30 shadow-2xl">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Status</div>
                <div className="text-foreground font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  {aboutContent?.status || "Online // Available"}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Timeline Section */}
        <div className="space-y-24">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-primary/30" />
              <Briefcase className="text-primary" size={24} />
              <div className="h-px w-12 bg-primary/30" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tighter uppercase italic text-glow">
              Professional <span className="text-primary">Evolution</span>
            </h2>
            <p className="text-muted-foreground max-w-xl italic font-medium">A technical blueprint of my growth as a developer and architect.</p>
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-10">
            {/* Vertical Spine - Reinforced */}
            <div className="absolute left-1/2 -translate-x-1/2 h-full w-[2px] bg-gradient-to-b from-primary/80 via-primary/20 to-transparent hidden md:block" />

            <div className="space-y-16">
              {(aboutContent?.journey || journey).map((item, i) => {
                // Icon mapping
                const Icon = item.icon === 'GraduationCap' ? GraduationCap : 
                             item.icon === 'Award' ? Award : Briefcase;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex flex-col md:flex-row items-center gap-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    <div className="flex-1 w-full">
                      <div className={`bg-card border border-border p-8 rounded-[2.5rem] space-y-4 hover:border-primary/40 transition-all duration-700 shadow-lg hover:shadow-primary/5 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                        <div className={`flex items-center gap-3 text-primary font-black tracking-[0.2em] text-[10px] uppercase ${i % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                          <Calendar size={12} />
                          <span>{item.year}</span>
                        </div>
                        <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">{item.title}</h3>
                        <p className="text-primary text-xs font-black uppercase tracking-widest">{item.company}</p>
                        <p className="text-muted-foreground text-sm leading-relaxed font-medium italic">{item.description}</p>
                      </div>
                    </div>
                    
                    {/* Architectural Node */}
                    <div className="relative z-10 w-16 h-16 rounded-3xl bg-background border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(14,165,233,0.15)] group hover:scale-110 transition-transform">
                      <div className="absolute inset-0 bg-primary/5 rounded-3xl animate-pulse" />
                      <Icon size={24} className="relative z-10" />
                    </div>

                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
