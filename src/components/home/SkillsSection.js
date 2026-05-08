'use client';

import { motion } from 'framer-motion';
import { getIcon } from '@/lib/icons';
import { Zap, Cpu } from 'lucide-react';

export default function SkillsSection({ skills = [] }) {
  // If no skills passed, use a default set or empty
  const displaySkills = skills.length > 0 ? skills : [
    { name: 'Next.js', icon: 'SiNextdotjs', color: '#ffffff', level: '95%' },
    { name: 'React', icon: 'SiReact', color: '#61DAFB', level: '98%' },
    { name: 'TypeScript', icon: 'SiTypescript', color: '#3178C6', level: '92%' },
    { name: 'Tailwind CSS', icon: 'SiTailwindcss', color: '#06B6D4', level: '100%' },
  ];

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
            className="text-5xl md:text-7xl font-black text-foreground tracking-tighter uppercase italic leading-none"
          >
            Core <span className="text-primary text-glow">Expertise</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl italic font-medium opacity-80 text-lg"
          >
            "Engineering the next generation of digital interfaces with high-performance architectures."
          </motion.p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {displaySkills.map((skill, index) => {
            const Icon = typeof skill.icon === 'string' ? getIcon(skill.icon) : skill.icon;
            return (
              <motion.div
                key={skill.name}
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
                  style={{ backgroundColor: skill.color || '#fff' }}
                />

                <div className="relative bg-[#0a0f1a]/80 border border-white/5 rounded-[2rem] p-8 h-full min-h-[220px] flex flex-col items-center justify-between gap-8 transition-all duration-500 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                  {/* Blueprint Decoration */}
                  <div className="absolute top-4 right-4 flex gap-1.5 opacity-20 group-hover:opacity-100 transition-opacity">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    <div className="w-1 h-1 rounded-full bg-primary" />
                  </div>

                  <div className="relative w-20 h-20 flex items-center justify-center">
                    {Icon && (
                      <Icon 
                        size={48} 
                        style={{ color: skill.color || 'var(--primary)' }} 
                        className="relative z-10 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
                      />
                    )}
                    {/* Glow background */}
                    <div 
                      className="absolute inset-0 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-700" 
                      style={{ backgroundColor: skill.color || 'var(--primary)' }}
                    />
                  </div>

                  <div className="w-full space-y-5">
                    <div className="text-center">
                      <span className="text-[11px] font-black text-white uppercase tracking-[0.25em] group-hover:text-primary transition-colors italic">
                        {skill.name}
                      </span>
                    </div>
                    
                    {/* Tech Level Bar */}
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: skill.level || (skill.proficiency ? `${skill.proficiency}%` : '90%') }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-primary/40 group-hover:bg-primary transition-colors shadow-[0_0_10px_rgba(14,165,233,0.3)]"
                      />
                    </div>
                  </div>

                  {/* Status Label */}
                  <div className="text-[8px] font-mono text-white/20 uppercase tracking-tighter opacity-60 group-hover:opacity-100 transition-opacity">
                    System Active // {skill.level || (skill.proficiency ? `${skill.proficiency}%` : '90%')}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
