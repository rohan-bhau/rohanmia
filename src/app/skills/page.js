'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSkillCategories } from '@/actions/skills';
import { getIcon } from '@/lib/icons';
import * as LucideIcons from 'lucide-react';

export default function SkillsPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      const data = await getSkillCategories();
      setCategories(data);
      setLoading(false);
    };
    fetchSkills();
  }, []);

  if (loading) return (
    <div className="pt-40 pb-20 px-6 min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="pt-40 pb-20 px-6 bg-background min-h-screen transition-colors duration-500">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-24 space-y-6 text-center">
          <div className="flex items-center gap-3 text-primary">
            <div className="h-px w-10 bg-primary/40" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Expertise</span>
            <div className="h-px w-10 bg-primary/40" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter uppercase italic leading-none">
            Core <span className="text-primary text-glow">Competencies</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl italic font-medium opacity-80 text-lg">
            "Engineering high-performance systems with cinematic precision and modern architecture."
          </p>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {categories.map((cat, catIdx) => {
            const CatIcon = LucideIcons[cat.icon] || LucideIcons.Layout;
            return (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIdx * 0.1 }}
                className="bg-card/30 border border-border rounded-[3.5rem] p-10 backdrop-blur-xl relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity text-foreground">
                  <CatIcon size={120} />
                </div>

                <div className="relative z-10 space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <CatIcon size={28} />
                    </div>
                    <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic">{cat.title}</h2>
                  </div>

                  <div className="space-y-8">
                    {cat.skills.map((skill) => {
                      const SkillIcon = getIcon(skill.icon);
                      return (
                        <div key={skill.name} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              {SkillIcon && <SkillIcon className="text-primary" size={18} />}
                              <span className="text-xs font-black text-foreground uppercase tracking-widest">{skill.name}</span>
                            </div>
                            <span className="text-[10px] font-mono text-primary font-bold">{skill.level}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${skill.level}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                              className="h-full bg-gradient-to-r from-primary/50 to-primary relative shadow-[0_0_15px_rgba(14,165,233,0.3)]"
                            >
                              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] animate-[shimmer_2s_infinite]" />
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Badge */}
        <div className="mt-24 flex justify-center">
          <div className="bg-card/30 backdrop-blur-xl px-10 py-6 rounded-[2.5rem] border border-primary/20 flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Overall Rating</p>
              <p className="text-foreground font-black text-2xl tracking-tighter uppercase italic">Senior Full Stack Architect</p>
            </div>
            <div className="w-px h-10 bg-primary/20" />
            <div className="text-5xl font-black text-primary tracking-tighter italic">98%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
