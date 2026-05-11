'use client';

import { motion } from 'framer-motion';
import { getIcon } from '@/lib/icons';
import { getTechColor } from '@/lib/tech-colors';
import { Zap, Cpu } from 'lucide-react';

export default function SkillsSection({ skills = [] }) {
  const displaySkills = skills;
  const hasSkills = displaySkills.length > 0;

  return (
    <section className="py-32 px-6 relative overflow-hidden bg-background">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col items-center mb-24 space-y-6 text-center">
          <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-primary/30" />
            <Cpu className="text-primary animate-pulse" size={24} />
            <div className="h-px w-12 bg-primary/30" />
          </div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tighter uppercase italic leading-none text-center"
          >
            Core <span className="text-primary text-glow">Expertise</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl italic font-medium opacity-80 text-sm md:text-lg text-center"
          >
            "Engineering the next generation of digital interfaces with high-performance architectures."
          </motion.p>
        </div>

        {hasSkills ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {displaySkills.map((skill, index) => {
              const Icon = typeof skill.icon === 'string' ? getIcon(skill.icon) : skill.icon;
              const brandColor = skill.color || getTechColor(skill.name || skill.icon);
              const level = skill.level || (skill.proficiency ? `${skill.proficiency}%` : '90%');
              
              return (
                <motion.div
                  key={skill._id || skill.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group relative h-full"
                >
                  {/* Holographic Glow */}
                  <div 
                    className="absolute inset-0 blur-[40px] opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" 
                    style={{ backgroundColor: brandColor }}
                  />

                  <div className="relative bg-card/80 border border-border/50 rounded-[2rem] p-8 h-full min-h-[220px] flex flex-col items-center justify-between gap-8 transition-all duration-500 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                    {/* Blueprint Decoration */}
                    <div className="absolute top-4 right-4 flex gap-1.5 opacity-20 group-hover:opacity-100 transition-opacity">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      <div className="w-1 h-1 rounded-full bg-primary" />
                    </div>

                    <div className="relative w-20 h-20 flex items-center justify-center">
                      {Icon && (
                        <Icon 
                          size={48} 
                          style={{ color: brandColor }} 
                          className="relative z-10 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
                        />
                      )}
                      {/* Glow background */}
                      <div 
                        className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-700" 
                        style={{ backgroundColor: brandColor }}
                      />
                    </div>

                    <div className="w-full space-y-5">
                      <div className="text-center">
                        <span className="text-[11px] font-black uppercase tracking-[0.25em] group-hover:text-primary transition-colors italic" style={{ color: brandColor }}>
                          {skill.name}
                        </span>
                      </div>
                      
                      {/* Tech Level Bar */}
                      <div className="h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: level }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full transition-colors shadow-[0_0_10px_rgba(14,165,233,0.3)]"
                          style={{ backgroundColor: brandColor }}
                        />
                      </div>
                    </div>

                    {/* Status Label */}
                    <div className="text-[8px] font-mono text-foreground/20 uppercase tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">
                      System Active // {level}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/20 rounded-[3rem] bg-foreground/[0.01]">
            <Zap className="text-foreground/10 mb-4 animate-pulse" size={48} />
            <p className="text-foreground/20 font-black uppercase tracking-[0.3em] text-[10px] italic text-center px-6">
              Neural Network Standby // No Core Expertise Nodes Promoted Yet
            </p>
            <p className="text-foreground/10 text-[8px] mt-2 uppercase tracking-widest italic">
              Please use the admin dashboard to promote technical nodes
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
