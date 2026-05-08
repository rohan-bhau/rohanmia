'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getTechStacks } from '@/actions/techstack';
import { getIcon } from '@/lib/icons';
import { getTechColor } from '@/lib/tech-colors';
import { Cpu, Zap, Database, ShieldCheck, Wrench, Terminal, Layers } from 'lucide-react';

export default function TechStackPage() {
  const [techList, setTechList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTech() {
      const data = await getTechStacks();
      setTechList(data);
      setLoading(false);
    }
    loadTech();
  }, []);

  const groupedTech = techList.reduce((acc, tech) => {
    if (!acc[tech.category]) acc[tech.category] = [];
    acc[tech.category].push(tech);
    return acc;
  }, {});

  const categoryIcons = {
    Frontend: Cpu,
    Backend: Terminal,
    Database: Database,
    DevOps: ShieldCheck,
    Tools: Wrench,
    Mobile: Zap,
    Design: Layers
  };

  const categorySubtitles = {
    Frontend: "High-performance frontend architecture and design systems.",
    Backend: "Scalable backend services and distributed systems.",
    Database: "Robust data modeling and storage optimization.",
    DevOps: "Cloud orchestration and deployment pipelines.",
    Tools: "Workflow automation and development utilities.",
    Mobile: "Cross-platform mobile engineering and native experiences.",
    Design: "Visual architecture and user-centric design interfaces."
  };

  return (
    <div className="pt-40 pb-20 px-6 min-h-screen transition-colors duration-500 overflow-hidden bg-background">
      {/* Background Circuit Grid Decoration */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1.5px, transparent 0)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-20 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-px w-12 bg-primary/30" />
              <Zap className="text-primary animate-pulse" size={24} />
              <div className="h-px w-12 bg-primary/30" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-foreground tracking-tighter uppercase italic">
              System <span className="text-primary text-glow">Stack</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium italic opacity-80">
              "A technical blueprint of the high-performance engines used to build world-class digital experiences."
            </p>
          </motion.div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
            <Cpu className="animate-spin text-primary" size={40} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Accessing Neural Matrix...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedTech).map(([category, techs], catIndex) => {
              const CategoryIcon = categoryIcons[category] || Layers;
              return (
                <div key={category} className="relative">
                  {/* Vertical Connectivity Decoration */}
                  <div className="absolute -left-12 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/5 to-transparent hidden xl:block" />
                  <div className="absolute -left-14 top-2 w-4 h-4 rounded-full border border-primary/50 hidden xl:flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                  </div>

                  <div className="flex flex-col xl:flex-row gap-12">
                    {/* Category Info */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="xl:w-1/4 space-y-6"
                    >
                      <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <CategoryIcon size={22} />
                        </div>
                        <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">
                          {category}
                        </h2>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed italic border-l-2 border-primary/20 pl-6">
                        {categorySubtitles[category] || "Technical architecture and engineering nodes."}
                      </p>
                    </motion.div>

                    {/* Skills Grid */}
                    <div className="xl:w-3/4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {techs.map((tech, index) => {
                        const Icon = getIcon(tech.icon);
                        const brandColor = tech.color || getTechColor(tech.name);
                        return (
                          <motion.div
                            key={tech._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -8 }}
                            className="group relative"
                          >
                            <div className="relative bg-card border border-border rounded-3xl p-6 h-full flex flex-col items-center justify-between gap-6 transition-all duration-500 hover:border-primary/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                              {/* Blueprint Decoration */}
                              <div className="absolute top-3 right-3 flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-primary/20" />
                                <div className="w-1 h-1 rounded-full bg-primary/20" />
                              </div>
                              
                              <div className="relative w-16 h-16 flex items-center justify-center">
                                {Icon && (
                                  <Icon 
                                    size={44} 
                                    style={{ color: brandColor }} 
                                    className="relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                                  />
                                )}
                                {/* Glow background */}
                                <div 
                                  className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" 
                                  style={{ backgroundColor: brandColor }}
                                />
                              </div>

                              <div className="w-full space-y-4">
                                <div className="text-center">
                                  <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors" style={{ color: brandColor + 'CC' }}>
                                    {tech.name}
                                  </span>
                                </div>
                                
                                {/* Tech Level Bar */}
                                <div className="h-1 w-full bg-muted/30 dark:bg-white/5 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: tech.level || `${tech.proficiency}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full transition-colors"
                                    style={{ backgroundColor: brandColor }}
                                  />
                                </div>
                              </div>

                              {/* Status Bit */}
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                                System Active // {tech.level || `${tech.proficiency}%`}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section Gap Decoration */}
                  {catIndex !== Object.entries(groupedTech).length - 1 && (
                    <div className="h-10 flex items-center justify-center opacity-10">
                      <div className="w-px h-full bg-gradient-to-b from-primary to-transparent" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
